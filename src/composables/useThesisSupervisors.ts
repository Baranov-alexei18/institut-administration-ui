import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { thesisSupervisorsService } from '@/api/services/thesis-supervisors.service';
import type { ThesisSupervisor, ThesisSupervisorsFilters } from '@/types/thesis-supervisors';
import { parseNumber } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import type { TeachersControllerGetThesisSupervisorsParams } from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): ThesisSupervisorsFilters => ({
  department: 'all',
  faculty: 'all',
  category: 'all',
});

export const useThesisSupervisors = () => {
  const thesisSupervisors = ref<ThesisSupervisor[]>([]);
  const thesisSupervisorsForFilters = ref<ThesisSupervisor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref<number>(0);

  const draftFilters = ref<ThesisSupervisorsFilters>(defaultFilters());
  const appliedFilters = ref<ThesisSupervisorsFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const {
    departments: referenceDepartments,
    faculties: referenceFaculties,
    teacherCategories: referenceTeacherCategories,
  } = storeToRefs(referenceDataStore);

  const fetchThesisSupervisors = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const departmentId =
        appliedFilters.value.department !== 'all'
          ? (parseNumber(appliedFilters.value.department.replace('id:', '')) ?? undefined)
          : undefined;
      const facultyId =
        appliedFilters.value.faculty !== 'all'
          ? (parseNumber(appliedFilters.value.faculty.replace('id:', '')) ?? undefined)
          : undefined;
      const categoryIds =
        appliedFilters.value.category !== 'all'
          ? [parseNumber(appliedFilters.value.category) ?? 0].filter((id) => id > 0)
          : undefined;

      const params: TeachersControllerGetThesisSupervisorsParams = {
        departmentId,
        facultyId,
        categoryIds,
      };

      const fetchedThesisSupervisors = await thesisSupervisorsService.getThesisSupervisors(params);
      thesisSupervisors.value = fetchedThesisSupervisors;
      totalCount.value = fetchedThesisSupervisors.length;
    } catch {
      error.value =
        'Не удалось получить руководителей дипломных работ. Проверьте подключение к API.';
      thesisSupervisors.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const fetchThesisSupervisorsForFilters = async (): Promise<void> => {
    try {
      thesisSupervisorsForFilters.value = await thesisSupervisorsService.getAllThesisSupervisors();
    } catch {
      thesisSupervisorsForFilters.value = [];
    }
  };

  const applyFilters = (): void => {
    appliedFilters.value = { ...draftFilters.value };
    void fetchThesisSupervisors();
  };

  const resetFilters = (): void => {
    const reset = defaultFilters();
    draftFilters.value = { ...reset };
    appliedFilters.value = { ...reset };
    void fetchThesisSupervisors();
  };

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

    return [
      { label: 'Все кафедры', value: 'all' },
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

    return [
      { label: 'Все факультеты', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const categoryOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const category of referenceTeacherCategories.value) {
      if (!category.name) {
        continue;
      }

      if (category.id !== null) {
        optionsMap.set(String(category.id), category.name);
      } else {
        optionsMap.set(`name:${category.name}`, category.name);
      }
    }

    if (optionsMap.size === 0) {
      const uniqueCategories = new Set(
        thesisSupervisorsForFilters.value
          .map((supervisor) => supervisor.category)
          .filter((value) => value !== '-'),
      );

      for (const value of uniqueCategories) {
        optionsMap.set(value, value);
      }
    }

    return [
      { label: 'Все категории', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const filteredThesisSupervisors: ComputedRef<ThesisSupervisor[]> = computed(() => {
    return thesisSupervisors.value;
  });

  return {
    thesisSupervisors: filteredThesisSupervisors,
    thesisSupervisorsForFilters,
    loading,
    error,
    totalCount,
    draftFilters,
    appliedFilters,
    departmentOptions,
    facultyOptions,
    categoryOptions,
    fetchThesisSupervisors,
    fetchThesisSupervisorsForFilters,
    applyFilters,
    resetFilters,
  };
};
