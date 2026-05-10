import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { sessionStudentsService } from '@/api/services/session-students.service';
import type { SessionStudent, SessionStudentsFilters } from '@/types/session-students';
import { parseNumber } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import type { StudentsControllerGetSessionStudentsParams } from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): SessionStudentsFilters => ({
  semester: 'all',
  year: '',
  group: 'all',
  course: 'all',
  faculty: 'all',
  type: 'excellent',
});

export const useSessionStudents = () => {
  const students = ref<SessionStudent[]>([]);
  const studentsForFilters = ref<SessionStudent[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref<number>(0);

  const draftFilters = ref<SessionStudentsFilters>(defaultFilters());
  const appliedFilters = ref<SessionStudentsFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const { groups: referenceGroups, faculties: referenceFaculties } =
    storeToRefs(referenceDataStore);

  const fetchStudents = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const semester =
        appliedFilters.value.semester !== 'all'
          ? (parseNumber(appliedFilters.value.semester) ?? undefined)
          : undefined;
      const year =
        appliedFilters.value.year.trim() !== ''
          ? (parseNumber(appliedFilters.value.year) ?? undefined)
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
      const type = appliedFilters.value.type as 'excellent' | 'no_threes' | 'no_twos';

      const params: StudentsControllerGetSessionStudentsParams = {
        semester,
        year,
        groupId,
        course,
        facultyId,
        type,
      };

      const fetchedStudents = await sessionStudentsService.getSessionStudents(params);
      students.value = fetchedStudents;
      totalCount.value = fetchedStudents.length;
    } catch {
      error.value = 'Не удалось получить студентов. Проверьте подключение к API.';
      students.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const fetchStudentsForFilters = async (): Promise<void> => {
    try {
      studentsForFilters.value = await sessionStudentsService.getAllSessionStudents();
    } catch {
      studentsForFilters.value = [];
    }
  };

  const applyFilters = (): void => {
    appliedFilters.value = { ...draftFilters.value };
    void fetchStudents();
  };

  const resetFilters = (): void => {
    const reset = defaultFilters();
    draftFilters.value = { ...reset };
    appliedFilters.value = { ...reset };
    void fetchStudents();
  };

  const semesterOptions: SelectOption[] = [
    { label: 'Все семестры', value: 'all' },
    { label: '1 семестр', value: '1' },
    { label: '2 семестр', value: '2' },
  ];

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
        studentsForFilters.value.map((student) => student.group).filter((value) => value !== '-'),
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

  const courseOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    const uniqueCourses = new Set(
      studentsForFilters.value.map((student) => student.course).filter((value) => value !== null),
    );

    for (const value of uniqueCourses) {
      optionsMap.set(String(value), `${value} курс`);
    }

    return [
      { label: 'Все курсы', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => Number(a[0]) - Number(b[0]))
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
        studentsForFilters.value.map((student) => student.group).filter((value) => value !== '-'),
      );

      for (const value of uniqueFaculties) {
        optionsMap.set(value, value);
      }
    }

    return [
      { label: 'Все факультеты', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const typeOptions: SelectOption[] = [
    { label: 'На отлично', value: 'excellent' },
    { label: 'Без троек', value: 'no_threes' },
    { label: 'Без двоек', value: 'no_twos' },
  ];

  const filteredStudents: ComputedRef<SessionStudent[]> = computed(() => {
    return students.value;
  });

  return {
    students: filteredStudents,
    studentsForFilters,
    loading,
    error,
    totalCount,
    draftFilters,
    appliedFilters,
    semesterOptions,
    groupOptions,
    courseOptions,
    facultyOptions,
    typeOptions,
    fetchStudents,
    fetchStudentsForFilters,
    applyFilters,
    resetFilters,
  };
};
