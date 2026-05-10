import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { departmentsService } from '@/api/services/departments.service';
import type { TeachingDepartment, TeachingDepartmentsFilters } from '@/types/teaching-departments';
import { parseNumber } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import type { DepartmentsControllerGetTeachingDepartmentsParams } from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): TeachingDepartmentsFilters => ({
  faculty: 'all',
  group: 'all',
  course: 'all',
  semester: 'all',
  fromYear: '',
  toYear: '',
});

export const useTeachingDepartments = () => {
  const departments = ref<TeachingDepartment[]>([]);
  const departmentsForFilters = ref<TeachingDepartment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const draftFilters = ref<TeachingDepartmentsFilters>(defaultFilters());
  const appliedFilters = ref<TeachingDepartmentsFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const { faculties: referenceFaculties, groups: referenceGroups } =
    storeToRefs(referenceDataStore);

  const fetchDepartments = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const groupId =
        appliedFilters.value.group !== 'all'
          ? (parseNumber(appliedFilters.value.group) ?? undefined)
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

      const params: DepartmentsControllerGetTeachingDepartmentsParams = {
        groupId,
        facultyId,
        semester,
        fromYear,
        toYear,
      };

      departments.value = await departmentsService.getTeachingDepartments(params);
    } catch {
      error.value = 'Не удалось получить кафедры. Проверьте подключение к API.';
      departments.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchDepartmentsForFilters = async (): Promise<void> => {
    try {
      departmentsForFilters.value = await departmentsService.getAllTeachingDepartments();
    } catch {
      departmentsForFilters.value = [];
    }
  };

  const applyFilters = (): void => {
    appliedFilters.value = { ...draftFilters.value };
    void fetchDepartments();
  };

  const resetFilters = (): void => {
    const reset = defaultFilters();
    draftFilters.value = { ...reset };
    appliedFilters.value = { ...reset };
    void fetchDepartments();
  };

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
        departmentsForFilters.value.map((dept) => dept.faculty).filter((value) => value !== '-'),
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
        departmentsForFilters.value.flatMap((dept) => dept.groups).filter((value) => value !== '-'),
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

  const semesterOptions: SelectOption[] = [
    { label: 'Все семестры', value: 'all' },
    { label: '1 семестр', value: '1' },
    { label: '2 семестр', value: '2' },
  ];

  const filteredDepartments: ComputedRef<TeachingDepartment[]> = computed(() => {
    return departments.value;
  });

  return {
    departments: filteredDepartments,
    departmentsForFilters,
    loading,
    error,
    draftFilters,
    appliedFilters,
    facultyOptions,
    groupOptions,
    courseOptions,
    semesterOptions,
    fetchDepartments,
    fetchDepartmentsForFilters,
    applyFilters,
    resetFilters,
  };
};
