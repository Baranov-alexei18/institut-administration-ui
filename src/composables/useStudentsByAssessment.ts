import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { studentsByAssessmentService } from '@/api/services/students-by-assessment.service';
import type {
  StudentByAssessment,
  StudentsByAssessmentFilters,
} from '@/types/students-by-assessment';
import { parseNumber } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import type { StudentsControllerGetByAssessmentParams } from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): StudentsByAssessmentFilters => ({
  group: 'all',
  discipline: 'all',
  assessmentType: 'all',
  grade: '',
});

export const useStudentsByAssessment = () => {
  const students = ref<StudentByAssessment[]>([]);
  const studentsForFilters = ref<StudentByAssessment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref<number>(0);

  const draftFilters = ref<StudentsByAssessmentFilters>(defaultFilters());
  const appliedFilters = ref<StudentsByAssessmentFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const { groups: referenceGroups, disciplines: referenceDisciplines } =
    storeToRefs(referenceDataStore);

  const fetchStudents = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const groupId =
        appliedFilters.value.group !== 'all'
          ? (parseNumber(appliedFilters.value.group) ?? undefined)
          : undefined;
      const disciplineId =
        appliedFilters.value.discipline !== 'all'
          ? (parseNumber(appliedFilters.value.discipline.replace('id:', '')) ?? undefined)
          : undefined;
      const type =
        appliedFilters.value.assessmentType !== 'all'
          ? appliedFilters.value.assessmentType
          : undefined;
      const grade =
        appliedFilters.value.grade.trim() !== ''
          ? (parseNumber(appliedFilters.value.grade) ?? undefined)
          : undefined;

      const params: StudentsControllerGetByAssessmentParams = {
        groupId,
        disciplineId,
        type,
        grade,
      };

      const fetchedStudents = await studentsByAssessmentService.getStudentsByAssessment(params);
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
      studentsForFilters.value = await studentsByAssessmentService.getAllStudentsByAssessment();
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
        studentsForFilters.value
          .map((student) => student.discipline)
          .filter((value) => value !== '-'),
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

  const assessmentTypeOptions: SelectOption[] = [
    { label: 'Все типы оценок', value: 'all' },
    { label: 'Экзамен', value: 'exam' },
    { label: 'Зачет', value: 'credit' },
  ];

  const filteredStudents: ComputedRef<StudentByAssessment[]> = computed(() => {
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
    groupOptions,
    disciplineOptions,
    assessmentTypeOptions,
    fetchStudents,
    fetchStudentsForFilters,
    applyFilters,
    resetFilters,
  };
};
