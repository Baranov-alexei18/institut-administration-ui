import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { dissertationsService } from '@/api/services/dissertations.service';
import type { Dissertation, DissertationsFilters } from '@/types/dissertations';
import { useReferenceDataStore } from '@/stores/reference-data';
import type { DissertationsControllerGetAllParams } from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): DissertationsFilters => ({
  faculty: 'all',
  department: 'all',
  type: 'all',
  from: '',
  to: '',
});

export const useDissertations = () => {
  const dissertations = ref<Dissertation[]>([]);
  const dissertationsForFilters = ref<Dissertation[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref<number>(0);

  const draftFilters = ref<DissertationsFilters>(defaultFilters());
  const appliedFilters = ref<DissertationsFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const { faculties: referenceFaculties, departments: referenceDepartments } =
    storeToRefs(referenceDataStore);

  const fetchDissertations = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      let departmentIds: number[] | undefined;
      if (appliedFilters.value.department !== 'all') {
        const deptValue = appliedFilters.value.department;
        if (deptValue.startsWith('id:')) {
          departmentIds = [Number(deptValue.replace('id:', ''))];
        }
      }

      let facultyIds: number[] | undefined;
      if (appliedFilters.value.faculty !== 'all') {
        const facValue = appliedFilters.value.faculty;
        if (facValue.startsWith('id:')) {
          facultyIds = [Number(facValue.replace('id:', ''))];
        }
      }

      const type = appliedFilters.value.type === 'all' ? undefined : appliedFilters.value.type;
      const from = appliedFilters.value.from.trim() === '' ? undefined : appliedFilters.value.from;
      const to = appliedFilters.value.to.trim() === '' ? undefined : appliedFilters.value.to;

      const params: DissertationsControllerGetAllParams = {
        departmentIds,
        facultyIds,
        type,
        from,
        to,
      };

      const fetchedDissertations = await dissertationsService.getDissertations(params);
      dissertations.value = fetchedDissertations;
      totalCount.value = fetchedDissertations.length;
    } catch {
      error.value = 'Не удалось получить диссертации. Проверьте подключение к API.';
      dissertations.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const fetchDissertationsForFilters = async (): Promise<void> => {
    try {
      dissertationsForFilters.value = await dissertationsService.getAllDissertations();
    } catch {
      dissertationsForFilters.value = [];
    }
  };

  const applyFilters = (): void => {
    appliedFilters.value = { ...draftFilters.value };
    void fetchDissertations();
  };

  const resetFilters = (): void => {
    const reset = defaultFilters();
    draftFilters.value = { ...reset };
    appliedFilters.value = { ...reset };
    void fetchDissertations();
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
      const uniqueValues = new Set(
        dissertationsForFilters.value
          .map((dissertation) => dissertation.faculty)
          .filter((value) => value !== '-'),
      );

      for (const value of uniqueValues) {
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

  const departmentOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const department of referenceDepartments.value) {
      if (!department.name) {
        continue;
      }

      if (department.id !== null) {
        optionsMap.set(`id:${department.id}`, department.name);
      } else {
        optionsMap.set(`name:${department.name}`, department.name);
      }
    }

    if (optionsMap.size === 0) {
      const uniqueDepartments = new Set(
        dissertationsForFilters.value
          .map((dissertation) => dissertation.department)
          .filter((value) => value !== '-'),
      );

      for (const value of uniqueDepartments) {
        optionsMap.set(`name:${value}`, value);
      }
    }

    return [
      { label: 'Все кафедры', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const typeOptions: SelectOption[] = [
    { label: 'Все типы', value: 'all' },
    { label: 'Кандидатская', value: 'phd' },
    { label: 'Докторская', value: 'doctor' },
  ];

  const filteredDissertations: ComputedRef<Dissertation[]> = computed(() => {
    return dissertations.value;
  });

  return {
    dissertations: filteredDissertations,
    dissertationsForFilters,
    loading,
    error,
    totalCount,
    draftFilters,
    appliedFilters,
    facultyOptions,
    departmentOptions,
    typeOptions,
    fetchDissertations,
    fetchDissertationsForFilters,
    applyFilters,
    resetFilters,
  };
};
