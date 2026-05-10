import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { teachersByDisciplineService } from '@/api/services/teachers-by-discipline.service';
import type { TeacherByDiscipline, TeachersByDisciplineFilters } from '@/types/teachers-by-discipline';
import { parseNumber } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import type {
  TeachersControllerGetByDisciplineParams,
} from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): TeachersByDisciplineFilters => ({
  discipline: 'all',
  group: 'all',
  course: 'all',
  faculty: 'all',
});

export const useTeachersByDiscipline = () => {
  const teachers = ref<TeacherByDiscipline[]>([]);
  const teachersForFilters = ref<TeacherByDiscipline[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref<number>(0);

  const draftFilters = ref<TeachersByDisciplineFilters>(defaultFilters());
  const appliedFilters = ref<TeachersByDisciplineFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const { faculties: referenceFaculties, groups: referenceGroups, disciplines: referenceDisciplines } = storeToRefs(referenceDataStore);

  const fetchTeachers = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const disciplineId =
        appliedFilters.value.discipline !== 'all'
          ? parseNumber(appliedFilters.value.discipline.replace('id:', '')) ?? undefined
          : undefined;
      const groupId =
        appliedFilters.value.group !== 'all' ? parseNumber(appliedFilters.value.group) ?? undefined : undefined;
      const course =
        appliedFilters.value.course !== 'all' ? parseNumber(appliedFilters.value.course) ?? undefined : undefined;
      const facultyId =
        appliedFilters.value.faculty !== 'all'
          ? parseNumber(appliedFilters.value.faculty.replace('id:', '')) ?? undefined
          : undefined;

      const params: TeachersControllerGetByDisciplineParams = {
        disciplineId,
        groupId,
        course,
        facultyId,
      };

      const fetchedTeachers = await teachersByDisciplineService.getTeachersByDiscipline(params);
      teachers.value = fetchedTeachers;
      totalCount.value = fetchedTeachers.length;
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
      teachersForFilters.value = await teachersByDisciplineService.getAllTeachersByDiscipline();
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

  const disciplineOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const discipline of referenceDisciplines.value) {
      if (!discipline.name) {
        continue;
      }

      if (discipline.id !== null) {
        optionsMap.set(`id:${discipline.id}`, discipline.name);
      } else {
        optionsMap.set(`name:${discipline.name}`, discipline.name);
      }
    }

    if (optionsMap.size === 0) {
      const uniqueDisciplines = new Set(
        teachersForFilters.value.map((teacher) => teacher.discipline).filter((value) => value !== '-'),
      );

      for (const value of uniqueDisciplines) {
        optionsMap.set(`name:${value}`, value);
      }
    }

    return [
      { label: 'Все дисциплины', value: 'all' },
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

  const courseOptions: SelectOption[] = [
    { label: 'Все курсы', value: 'all' },
    { label: '1 курс', value: '1' },
    { label: '2 курс', value: '2' },
    { label: '3 курс', value: '3' },
    { label: '4 курс', value: '4' },
    { label: '5 курс', value: '5' },
    { label: '6 курс', value: '6' },
  ];

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

  const filteredTeachers: ComputedRef<TeacherByDiscipline[]> = computed(() => {
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
    disciplineOptions,
    groupOptions,
    courseOptions,
    facultyOptions,
    fetchTeachers,
    fetchTeachersForFilters,
    applyFilters,
    resetFilters,
  };
};
