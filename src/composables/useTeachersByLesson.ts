import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { teachersByLessonService } from '@/api/services/teachers-by-lesson.service';
import type { TeacherByLesson } from '@/types/teachers-by-lesson';
import { parseNumber } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import type { TeachersControllerGetByLessonsParams } from '@/api/generated/institutAdministrationAPI.schemas';

export type TeachersByLessonFilters = {
  lessonType: string;
  group: string;
  course: string;
  faculty: string;
  semester: string;
  fromYear: string;
  toYear: string;
};

const defaultFilters = (): TeachersByLessonFilters => ({
  lessonType: 'all',
  group: 'all',
  course: 'all',
  faculty: 'all',
  semester: 'all',
  fromYear: '',
  toYear: '',
});

export const useTeachersByLesson = () => {
  const teachers = ref<TeacherByLesson[]>([]);
  const teachersForFilters = ref<TeacherByLesson[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref<number>(0);

  const draftFilters = ref<TeachersByLessonFilters>(defaultFilters());
  const appliedFilters = ref<TeachersByLessonFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const {
    faculties: referenceFaculties,
    groups: referenceGroups,
    lessonTypes: referenceLessonTypes,
  } = storeToRefs(referenceDataStore);

  const fetchTeachers = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const lessonTypeIds =
        appliedFilters.value.lessonType !== 'all'
          ? [parseNumber(appliedFilters.value.lessonType.replace('id:', '')) ?? 0].filter(
              (id) => id > 0,
            )
          : undefined;
      const groupId =
        appliedFilters.value.group !== 'all'
          ? (parseNumber(appliedFilters.value.group) ?? undefined)
          : undefined;
      const course =
        appliedFilters.value.course !== 'all'
          ? (parseNumber(appliedFilters.value.course) ?? undefined)
          : undefined;
      const facultyId =
        appliedFilters.value.faculty !== 'all'
          ? (parseNumber(appliedFilters.value.faculty.replace('id:', '')) ?? undefined)
          : undefined;
      const semester =
        appliedFilters.value.semester !== 'all'
          ? (parseNumber(appliedFilters.value.semester) ?? undefined)
          : undefined;
      const fromYear =
        appliedFilters.value.fromYear.trim() !== ''
          ? (parseNumber(appliedFilters.value.fromYear) ?? undefined)
          : undefined;
      const toYear =
        appliedFilters.value.toYear.trim() !== ''
          ? (parseNumber(appliedFilters.value.toYear) ?? undefined)
          : undefined;

      const params: TeachersControllerGetByLessonsParams = {
        lessonTypeIds,
        groupId,
        course,
        facultyId,
        semester,
        fromYear,
        toYear,
      };

      const fetchedTeachers = await teachersByLessonService.getTeachersByLesson(params);
      teachers.value = fetchedTeachers;
      const uniqueTeacherIds = new Set(
        fetchedTeachers.map((teacher) => teacher.id).filter((id) => id !== null),
      );
      totalCount.value = uniqueTeacherIds.size;
    } catch {
      error.value = 'Не удалось получить преподавателей. Проверьте подключение к API.';
      teachers.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const fetchTeachersForFilters = async (): Promise<void> => {
    try {
      teachersForFilters.value = await teachersByLessonService.getAllTeachersByLesson();
    } catch {
      teachersForFilters.value = [];
    }
  };

  const applyFilters = (): void => {
    appliedFilters.value = { ...draftFilters.value };
    void fetchTeachers();
  };

  const resetFilters = (): void => {
    const reset = defaultFilters();
    draftFilters.value = { ...reset };
    appliedFilters.value = { ...reset };
    void fetchTeachers();
  };

  const lessonTypeOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const lessonType of referenceLessonTypes.value) {
      if (!lessonType.name) {
        continue;
      }

      if (lessonType.id !== null) {
        optionsMap.set(String(lessonType.id), lessonType.name);
      } else {
        optionsMap.set(`name:${lessonType.name}`, lessonType.name);
      }
    }

    if (optionsMap.size === 0) {
      const uniqueLessonTypes = new Set(
        teachersForFilters.value
          .map((teacher) => teacher.lessonType)
          .filter((value) => value !== '-'),
      );

      for (const value of uniqueLessonTypes) {
        optionsMap.set(value, value);
      }
    }

    return [
      { label: 'Все типы занятий', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const groupOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const group of referenceGroups.value) {
      if (!group.name) {
        continue;
      }

      if (group.id !== null) {
        optionsMap.set(String(group.id), group.name);
      } else {
        optionsMap.set(`name:${group.name}`, group.name);
      }
    }

    if (optionsMap.size === 0) {
      const uniqueGroups = new Set(
        teachersForFilters.value.map((teacher) => teacher.group).filter((value) => value !== '-'),
      );

      for (const value of uniqueGroups) {
        optionsMap.set(value, value);
      }
    }

    return [
      { label: 'Все группы', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const facultyOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const faculty of referenceFaculties.value) {
      if (!faculty.name) {
        continue;
      }

      if (faculty.id !== null) {
        optionsMap.set(`id:${faculty.id}`, faculty.name);
      } else {
        optionsMap.set(`name:${faculty.name}`, faculty.name);
      }
    }

    if (optionsMap.size === 0) {
      const uniqueFaculties = new Set(
        teachersForFilters.value.map((teacher) => teacher.faculty).filter((value) => value !== '-'),
      );

      for (const value of uniqueFaculties) {
        optionsMap.set(`name:${value}`, value);
      }
    }

    return [
      { label: 'Все факультеты', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const semesterOptions: SelectOption[] = [
    { label: 'Все семестры', value: 'all' },
    { label: '1 семестр', value: '1' },
    { label: '2 семестр', value: '2' },
  ];

  const filteredTeachers: ComputedRef<TeacherByLesson[]> = computed(() => {
    return teachers.value;
  });

  return {
    teachers: filteredTeachers,
    teachersForFilters,
    loading,
    error,
    totalCount,
    draftFilters,
    appliedFilters,
    lessonTypeOptions,
    groupOptions,
    facultyOptions,
    semesterOptions,
    fetchTeachers,
    fetchTeachersForFilters,
    applyFilters,
    resetFilters,
  };
};
