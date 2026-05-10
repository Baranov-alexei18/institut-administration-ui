import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { examinersService } from '@/api/services/examiners.service';
import type { Examiner, ExaminersFilters } from '@/types/examiners';
import { parseNumber } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import type {
  TeachersControllerGetExaminersParams,
} from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): ExaminersFilters => ({
  group: 'all',
  discipline: 'all',
  semester: 'all',
  year: '',
});

export const useExaminers = () => {
  const examiners = ref<Examiner[]>([]);
  const examinersForFilters = ref<Examiner[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref<number>(0);

  const draftFilters = ref<ExaminersFilters>(defaultFilters());
  const appliedFilters = ref<ExaminersFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const { groups: referenceGroups, disciplines: referenceDisciplines } = storeToRefs(referenceDataStore);

  const fetchExaminers = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const groupIds =
        appliedFilters.value.group !== 'all'
          ? [parseNumber(appliedFilters.value.group) ?? 0].filter((id) => id > 0)
          : undefined;
      const disciplineIds =
        appliedFilters.value.discipline !== 'all'
          ? [parseNumber(appliedFilters.value.discipline.replace('id:', '')) ?? 0].filter((id) => id > 0)
          : undefined;
      const semester =
        appliedFilters.value.semester !== 'all' ? parseNumber(appliedFilters.value.semester) ?? undefined : undefined;
      const year =
        appliedFilters.value.year.trim() !== '' ? parseNumber(appliedFilters.value.year) ?? undefined : undefined;

      const params: TeachersControllerGetExaminersParams = {
        groupIds,
        disciplineIds,
        semester,
        year,
      };

      const fetchedExaminers = await examinersService.getExaminers(params);
      examiners.value = fetchedExaminers;
      totalCount.value = fetchedExaminers.length;
    } catch {
      error.value = 'Не удалось получить экзаменаторов. Проверьте подключение к API.';
      examiners.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const fetchExaminersForFilters = async (): Promise<void> => {
    try {
      examinersForFilters.value = await examinersService.getAllExaminers();
    } catch {
      examinersForFilters.value = [];
    }
  };

  const applyFilters = (): void => {
    appliedFilters.value = { ...draftFilters.value };
    void fetchExaminers();
  };

  const resetFilters = (): void => {
    const reset = defaultFilters();
    draftFilters.value = { ...reset };
    appliedFilters.value = { ...reset };
    void fetchExaminers();
  };

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
        examinersForFilters.value.map((examiner) => examiner.group).filter((value) => value !== '-'),
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
        examinersForFilters.value.map((examiner) => examiner.discipline).filter((value) => value !== '-'),
      );

      for (const value of uniqueDisciplines) {
        optionsMap.set(value, value);
      }
    }

    return [
      { label: 'Все дисциплины', value: 'all' },
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

  const filteredExaminers: ComputedRef<Examiner[]> = computed(() => {
    return examiners.value;
  });

  return {
    examiners: filteredExaminers,
    examinersForFilters,
    loading,
    error,
    totalCount,
    draftFilters,
    appliedFilters,
    groupOptions,
    disciplineOptions,
    semesterOptions,
    fetchExaminers,
    fetchExaminersForFilters,
    applyFilters,
    resetFilters,
  };
};
