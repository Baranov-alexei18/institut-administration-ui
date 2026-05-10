import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { thesesService } from '@/api/services/theses.service';
import { teachersControllerGetTeachers } from '@/api/generated/institutAdministrationAPI';
import type { Thesis, ThesesFilters } from '@/types/theses';
import { parseNumber, parseString } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import type {
  StudentsControllerGetThesesParams,
} from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): ThesesFilters => ({
  department: 'all',
  teacher: 'all',
});

export const useTheses = () => {
  const theses = ref<Thesis[]>([]);
  const thesesForFilters = ref<Thesis[]>([]);
  const teachersForFilters = ref<
    { id: number | null; firstName: string; lastName: string; fullName: string }[]
  >([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref<number>(0);

  const draftFilters = ref<ThesesFilters>(defaultFilters());
  const appliedFilters = ref<ThesesFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const { departments: referenceDepartments } = storeToRefs(referenceDataStore);

  const fetchTheses = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const departmentId =
        appliedFilters.value.department !== 'all'
          ? parseNumber(appliedFilters.value.department.replace('id:', '')) ?? undefined
          : undefined;
      const teacherId =
        appliedFilters.value.teacher !== 'all'
          ? parseNumber(appliedFilters.value.teacher.replace('id:', '')) ?? undefined
          : undefined;

      const params: StudentsControllerGetThesesParams = {
        departmentId,
        teacherId,
      };

      const fetchedTheses = await thesesService.getTheses(params);
      theses.value = fetchedTheses;
      totalCount.value = fetchedTheses.length;
    } catch {
      error.value = 'Не удалось получить дипломные работы. Проверьте подключение к API.';
      theses.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const fetchThesesForFilters = async (): Promise<void> => {
    try {
      thesesForFilters.value = await thesesService.getAllTheses();
    } catch {
      thesesForFilters.value = [];
    }
  };

  const fetchTeachersForFilters = async (): Promise<void> => {
    try {
      const response = await teachersControllerGetTeachers();
      let teachers: unknown[] = [];

      if (Array.isArray(response)) {
        teachers = response;
      } else if (response && typeof response === 'object') {
        const record = response as Record<string, unknown>;
        const arrays = [record.data, record.teachers, record.items];

        for (const candidate of arrays) {
          if (Array.isArray(candidate)) {
            teachers = candidate;
            break;
          }
        }
      }

      teachersForFilters.value = teachers.map((item: unknown) => {
        const teacher = item as Record<string, unknown>;
        const id = parseNumber(teacher.id);
        const firstName = parseString(teacher.first_name ?? teacher.firstName);
        const lastName = parseString(teacher.last_name ?? teacher.lastName);
        const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();

        return {
          id,
          firstName,
          lastName,
          fullName: fullName || (id !== null ? String(id) : '-'),
        };
      });
    } catch (err) {
      console.error('Error fetching teachers:', err);
      teachersForFilters.value = [];
    }
  };

  const applyFilters = (): void => {
    appliedFilters.value = { ...draftFilters.value };
    void fetchTheses();
  };

  const resetFilters = (): void => {
    const reset = defaultFilters();
    draftFilters.value = { ...reset };
    appliedFilters.value = { ...reset };
    void fetchTheses();
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

  const teacherOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const teacher of teachersForFilters.value) {
      if (teacher.id !== null) {
        optionsMap.set(`id:${teacher.id}`, teacher.fullName);
      }
    }

    return [
      { label: 'Все преподаватели', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const filteredTheses: ComputedRef<Thesis[]> = computed(() => {
    return theses.value;
  });

  return {
    theses: filteredTheses,
    thesesForFilters,
    teachersForFilters,
    loading,
    error,
    totalCount,
    draftFilters,
    appliedFilters,
    departmentOptions,
    teacherOptions,
    fetchTheses,
    fetchThesesForFilters,
    fetchTeachersForFilters,
    applyFilters,
    resetFilters,
  };
};
