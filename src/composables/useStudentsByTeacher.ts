import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { studentsByTeacherService } from '@/api/services/students-by-teacher.service';
import { teachersControllerGetTeachers } from '@/api/generated/institutAdministrationAPI';
import type { StudentByTeacher, StudentsByTeacherFilters } from '@/types/students-by-teacher';
import { parseNumber, parseString } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import type { StudentsControllerGetStudentsByTeacherParams } from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): StudentsByTeacherFilters => ({
  group: 'all',
  teacher: 'all',
  discipline: 'all',
  semester: 'all',
  fromYear: '',
  toYear: '',
  grade: '',
});

export const useStudentsByTeacher = () => {
  const students = ref<StudentByTeacher[]>([]);
  const studentsForFilters = ref<StudentByTeacher[]>([]);
  const teachersForFilters = ref<
    { id: number | null; firstName: string; lastName: string; fullName: string }[]
  >([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref<number>(0);

  const draftFilters = ref<StudentsByTeacherFilters>(defaultFilters());
  const appliedFilters = ref<StudentsByTeacherFilters>(defaultFilters());

  const referenceDataStore = useReferenceDataStore();
  const { groups: referenceGroups, disciplines: referenceDisciplines } =
    storeToRefs(referenceDataStore);

  const fetchStudents = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const groupIds =
        appliedFilters.value.group !== 'all'
          ? [appliedFilters.value.group].filter((value) => value !== 'all')
          : undefined;
      const teacherId =
        appliedFilters.value.teacher !== 'all'
          ? (parseNumber(appliedFilters.value.teacher.replace('id:', '')) ?? undefined)
          : undefined;
      const disciplineIds =
        appliedFilters.value.discipline !== 'all'
          ? [appliedFilters.value.discipline.replace('id:', '')].filter((value) => value !== 'all')
          : undefined;
      const semesters =
        appliedFilters.value.semester !== 'all'
          ? [appliedFilters.value.semester].filter((value) => value !== 'all')
          : undefined;
      const fromYear =
        appliedFilters.value.fromYear.trim() !== ''
          ? (parseNumber(appliedFilters.value.fromYear) ?? undefined)
          : undefined;
      const toYear =
        appliedFilters.value.toYear.trim() !== ''
          ? (parseNumber(appliedFilters.value.toYear) ?? undefined)
          : undefined;
      const grade =
        appliedFilters.value.grade.trim() !== ''
          ? (parseNumber(appliedFilters.value.grade) ?? undefined)
          : undefined;

      const params: StudentsControllerGetStudentsByTeacherParams = {
        groupIds,
        teacherId,
        disciplineIds,
        semesters,
        fromYear,
        toYear,
        grade,
      };

      const fetchedStudents = await studentsByTeacherService.getStudentsByTeacher(params);
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
      studentsForFilters.value = await studentsByTeacherService.getAllStudentsByTeacher();
    } catch {
      studentsForFilters.value = [];
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
        studentsForFilters.value.map((student) => student.group).filter((value) => value !== '-'),
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

  const gradeOptions: SelectOption[] = [
    { label: 'Все оценки', value: '' },
    { label: '5', value: '5' },
    { label: '4', value: '4' },
    { label: '3', value: '3' },
    { label: '2', value: '2' },
  ];

  const filteredStudents: ComputedRef<StudentByTeacher[]> = computed(() => {
    return students.value;
  });

  return {
    students: filteredStudents,
    studentsForFilters,
    teachersForFilters,
    loading,
    error,
    totalCount,
    draftFilters,
    appliedFilters,
    groupOptions,
    teacherOptions,
    disciplineOptions,
    semesterOptions,
    gradeOptions,
    fetchStudents,
    fetchStudentsForFilters,
    fetchTeachersForFilters,
    applyFilters,
    resetFilters,
  };
};
