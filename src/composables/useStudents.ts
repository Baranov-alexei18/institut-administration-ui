import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { studentsService } from '@/api/services/students.service';
import type { Student, StudentsFilters, CreateStudentForm } from '@/types/students';
import { parseNumber } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import {
  StudentsControllerGetStudentsGender as StudentsGender,
  type StudentsControllerGetStudentsGender,
  type CreateStudentDto,
} from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): StudentsFilters => ({
  faculty: 'all',
  course: 'all',
  group: 'all',
  gender: 'all',
  birthYear: 'all',
  childrenCount: 'all',
  minScholarship: '',
});

export const useStudents = () => {
  const students = ref<Student[]>([]);
  const studentsForFilters = ref<Student[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isCreateModalOpen = ref(false);
  const isSavingStudent = ref(false);
  const createStudentError = ref<string | null>(null);
  const editingStudentId = ref<number | null>(null);

  const draftFilters = ref<StudentsFilters>(defaultFilters());
  const appliedFilters = ref<StudentsFilters>(defaultFilters());
  const createStudentForm = ref<CreateStudentForm>({
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    childrenCount: '0',
    groupId: '',
    scholarshipAmount: '0',
  });

  const referenceDataStore = useReferenceDataStore();
  const { groups: referenceGroups, faculties: referenceFaculties } =
    storeToRefs(referenceDataStore);

  const fetchStudents = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const genderFilter =
        appliedFilters.value.gender === 'all'
          ? undefined
          : (appliedFilters.value.gender as StudentsControllerGetStudentsGender);
      const courseFilter =
        appliedFilters.value.course === 'all' ? undefined : [Number(appliedFilters.value.course)];
      const minScholarship =
        appliedFilters.value.minScholarship.trim() === ''
          ? undefined
          : Number(appliedFilters.value.minScholarship);

      students.value = await studentsService.getStudents({
        faculty: appliedFilters.value.faculty === 'all' ? undefined : appliedFilters.value.faculty,
        courses: courseFilter,
        gender: genderFilter,
        minScholarship,
      });
    } catch {
      error.value = 'Не удалось получить студентов. Проверьте подключение к API.';
      students.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchStudentsForFilters = async (): Promise<void> => {
    try {
      studentsForFilters.value = await studentsService.getAllStudents();
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

  const facultyOptions: ComputedRef<SelectOption[]> = computed(() => {
    const uniqueValues = new Set(
      referenceFaculties.value.map((faculty) => faculty.name).filter(Boolean),
    );

    if (uniqueValues.size === 0) {
      studentsForFilters.value
        .map((student) => student.faculty)
        .filter((value) => value !== '-')
        .forEach((value) => uniqueValues.add(value));
    }

    return [
      { label: 'Все факультеты', value: 'all' },
      ...Array.from(uniqueValues)
        .sort()
        .map((value) => ({ label: value, value })),
    ];
  });

  const courseOptions: ComputedRef<SelectOption[]> = computed(() => {
    const uniqueValues = new Set(
      referenceGroups.value
        .map((group) => group.course)
        .filter((value): value is number => value !== null),
    );

    if (uniqueValues.size === 0) {
      studentsForFilters.value
        .map((student) => student.course)
        .filter((value): value is number => value !== null)
        .forEach((value) => uniqueValues.add(value));
    }

    return [
      { label: 'Все курсы', value: 'all' },
      ...Array.from(uniqueValues)
        .sort((a, b) => a - b)
        .map((value) => ({ label: `${value} курс`, value: String(value) })),
    ];
  });

  const genderOptions: ComputedRef<SelectOption[]> = computed(() => {
    const uniqueGenders = new Set(
      studentsForFilters.value
        .map((student) => student.genderValue)
        .filter((value) => value === StudentsGender.male || value === StudentsGender.female),
    );

    return [
      { label: 'Все', value: 'all' },
      ...Array.from(uniqueGenders).map((value) => ({
        label: value === StudentsGender.male ? 'Мужской' : 'Женский',
        value,
      })),
    ];
  });

  const groupOptions: ComputedRef<SelectOption[]> = computed(() => {
    const uniqueGroups = new Set(referenceGroups.value.map((group) => group.name).filter(Boolean));

    if (uniqueGroups.size === 0) {
      studentsForFilters.value
        .map((student) => student.group)
        .filter((value) => value !== '-')
        .forEach((value) => uniqueGroups.add(value));
    }

    return [
      { label: 'Все группы', value: 'all' },
      ...Array.from(uniqueGroups)
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ label: value, value })),
    ];
  });

  const birthYearOptions: ComputedRef<SelectOption[]> = computed(() => {
    const years = new Set(
      studentsForFilters.value
        .map((student) => student.birthYear)
        .filter((value): value is number => value !== null),
    );
    return [
      { label: 'Любой год', value: 'all' },
      ...Array.from(years)
        .sort((a, b) => b - a)
        .map((value) => ({ label: String(value), value: String(value) })),
    ];
  });

  const childrenOptions: ComputedRef<SelectOption[]> = computed(() => {
    const uniqueCounts = new Set(studentsForFilters.value.map((student) => student.childrenCount));

    return [
      { label: 'Любое количество', value: 'all' },
      ...Array.from(uniqueCounts)
        .sort((a, b) => a - b)
        .map((value) => ({
          label: `${value}`,
          value: String(value),
        })),
    ];
  });

  const createStudentGenderOptions: SelectOption[] = [
    { label: 'Выберите пол', value: '' },
    { label: 'Мужской', value: StudentsGender.male },
    { label: 'Женский', value: StudentsGender.female },
  ];

  const createStudentGroupOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const group of referenceGroups.value) {
      if (!group.name) {
        continue;
      }

      if (group.id !== null) {
        optionsMap.set(`id:${group.id}`, group.name);
      } else {
        optionsMap.set(`name:${group.name}`, group.name);
      }
    }

    if (optionsMap.size === 0) {
      for (const student of studentsForFilters.value) {
        if (student.group === '-') {
          continue;
        }

        if (student.groupId !== null) {
          optionsMap.set(`id:${student.groupId}`, student.group);
        } else {
          optionsMap.set(`name:${student.group}`, student.group);
        }
      }
    }

    const currentGroupId = createStudentForm.value.groupId;
    if (currentGroupId && !optionsMap.has(currentGroupId)) {
      const student = studentsForFilters.value.find(
        (s) => s.groupId !== null && `id:${s.groupId}` === currentGroupId,
      );
      if (student) {
        optionsMap.set(currentGroupId, student.group);
      }
    }

    return [
      { label: 'Выберите группу', value: '' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const filteredStudents: ComputedRef<Student[]> = computed(() => {
    return students.value.filter((student) => {
      const isGroupMatched =
        appliedFilters.value.group === 'all' || student.group === appliedFilters.value.group;
      const isBirthYearMatched =
        appliedFilters.value.birthYear === 'all' ||
        String(student.birthYear) === appliedFilters.value.birthYear;
      const isChildrenMatched =
        appliedFilters.value.childrenCount === 'all' ||
        student.childrenCount === Number(appliedFilters.value.childrenCount);

      return isGroupMatched && isBirthYearMatched && isChildrenMatched;
    });
  });

  const totalCount = computed(() => filteredStudents.value.length);

  const openCreateModal = (): void => {
    createStudentError.value = null;
    editingStudentId.value = null;
    createStudentForm.value = {
      firstName: '',
      lastName: '',
      gender: '',
      birthDate: '',
      childrenCount: '0',
      groupId: '',
      scholarshipAmount: '0',
    };
    isCreateModalOpen.value = true;
  };

  const openEditModal = (student: Student): void => {
    createStudentError.value = null;
    editingStudentId.value = student.id;
    const nameParts = student.fullName.split(' ');

    let groupIdValue = '';
    if (student.group !== '-') {
      const matchingGroup = referenceGroups.value.find((group) => group.name === student.group);
      if (matchingGroup && matchingGroup.id !== null) {
        groupIdValue = `id:${matchingGroup.id}`;
      } else if (student.groupId !== null) {
        groupIdValue = `id:${student.groupId}`;
      }
    }

    createStudentForm.value = {
      firstName: nameParts[1] || '',
      lastName: nameParts[0] || '',
      gender: student.genderValue,
      birthDate: student.birthDate || '',
      childrenCount: String(student.childrenCount),
      groupId: groupIdValue,
      scholarshipAmount: String(student.scholarshipAmount),
    };

    isCreateModalOpen.value = true;
  };

  const closeCreateModal = (): void => {
    if (!isSavingStudent.value) {
      isCreateModalOpen.value = false;
    }
  };

  const createStudent = async (): Promise<void> => {
    createStudentError.value = null;
    const firstName = createStudentForm.value.firstName.trim();
    const lastName = createStudentForm.value.lastName.trim();
    const birthDate = createStudentForm.value.birthDate.trim();
    const selectedGroupValue = createStudentForm.value.groupId;

    let resolvedGroupId: number | null = null;
    if (selectedGroupValue.startsWith('id:')) {
      resolvedGroupId = parseNumber(selectedGroupValue.replace('id:', ''));
    } else if (selectedGroupValue.startsWith('name:')) {
      const selectedGroupName = selectedGroupValue.replace('name:', '');
      const match = studentsForFilters.value.find(
        (student) => student.group === selectedGroupName && student.groupId !== null,
      );
      resolvedGroupId = match?.groupId ?? null;
    }

    if (
      !firstName ||
      !lastName ||
      !createStudentForm.value.gender ||
      !birthDate ||
      !selectedGroupValue
    ) {
      createStudentError.value =
        'Заполните обязательные поля: имя, фамилия, пол, дата рождения и группа.';
      return;
    }

    if (resolvedGroupId === null) {
      createStudentError.value =
        'Для выбранной группы не найден идентификатор. Проверьте данные API по группам.';
      return;
    }

    isSavingStudent.value = true;
    try {
      const payload: CreateStudentDto = {
        firstName,
        lastName,
        gender: createStudentForm.value.gender,
        birthDate,
        childrenCount: parseNumber(createStudentForm.value.childrenCount) ?? 0,
        groupId: resolvedGroupId,
        scholarshipAmount: parseNumber(createStudentForm.value.scholarshipAmount) ?? 0,
      };

      if (editingStudentId.value !== null) {
        await studentsService.updateStudent(editingStudentId.value, payload);
      } else {
        await studentsService.createStudent(payload);
      }

      createStudentForm.value = {
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: '',
        childrenCount: '0',
        groupId: '',
        scholarshipAmount: '0',
      };
      editingStudentId.value = null;
      isCreateModalOpen.value = false;
      await Promise.all([fetchStudentsForFilters(), fetchStudents()]);
    } catch {
      createStudentError.value =
        editingStudentId.value !== null
          ? 'Не удалось обновить студента.'
          : 'Не удалось создать студента.';
    } finally {
      isSavingStudent.value = false;
    }
  };

  const deleteStudent = async (studentId: number): Promise<void> => {
    if (!confirm('Вы уверены, что хотите удалить этого студента?')) {
      return;
    }

    try {
      await studentsService.deleteStudent(studentId);
      await Promise.all([fetchStudentsForFilters(), fetchStudents()]);
    } catch {
      error.value = 'Не удалось удалить студента.';
    }
  };

  const modalTitle = computed(() =>
    editingStudentId.value !== null ? 'Редактировать студента' : 'Создать студента',
  );
  const submitButtonText = computed(() =>
    editingStudentId.value !== null ? 'Сохранить' : 'Создать',
  );

  return {
    students: filteredStudents,
    studentsForFilters,
    loading,
    error,
    isCreateModalOpen,
    isSavingStudent,
    createStudentError,
    editingStudentId,
    modalTitle,
    submitButtonText,
    draftFilters,
    appliedFilters,
    facultyOptions,
    courseOptions,
    genderOptions,
    groupOptions,
    birthYearOptions,
    childrenOptions,
    createStudentGenderOptions,
    createStudentGroupOptions,
    totalCount,
    fetchStudents,
    fetchStudentsForFilters,
    applyFilters,
    resetFilters,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    createStudent,
    deleteStudent,
    createStudentForm,
  };
};
