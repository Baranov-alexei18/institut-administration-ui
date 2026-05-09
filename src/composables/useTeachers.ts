import { ref, computed, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import type { SelectOption } from '@/components/common/AppSelect.vue';
import { teachersService } from '@/api/services/teachers.service';
import type { Teacher, TeachersFilters, CreateTeacherForm } from '@/types/teachers';
import { parseNumber } from '@/utils/students';
import { useReferenceDataStore } from '@/stores/reference-data';
import {
  StudentsControllerGetStudentsGender as StudentsGender,
  type TeachersControllerGetTeachersParams,
  type CreateTeacherDto,
  type DissertationDto,
} from '@/api/generated/institutAdministrationAPI.schemas';

const defaultFilters = (): TeachersFilters => ({
  faculty: 'all',
  department: 'all',
  category: 'all',
  gender: 'all',
  birthYear: 'all',
  childrenCount: 'all',
  minSalary: '',
  isPhd: 'all',
  isDoctor: 'all',
  defenseFrom: '',
  defenseTo: '',
});

export const useTeachers = () => {
  const teachers = ref<Teacher[]>([]);
  const teachersForFilters = ref<Teacher[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isCreateModalOpen = ref(false);
  const isSavingTeacher = ref(false);
  const createTeacherError = ref<string | null>(null);

  const draftFilters = ref<TeachersFilters>(defaultFilters());
  const appliedFilters = ref<TeachersFilters>(defaultFilters());
  const createTeacherForm = ref<CreateTeacherForm>({
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    childrenCount: '0',
    departmentId: '',
    categoryId: '',
    salary: '0',
    isPostgraduateStudent: false,
    dissertationType: '',
    dissertationTopic: '',
    dissertationDefenseDate: '',
  });

  const referenceDataStore = useReferenceDataStore();
  const {
    faculties: referenceFaculties,
    departments: referenceDepartments,
    teacherCategories,
  } = storeToRefs(referenceDataStore);

  const fetchTeachers = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const genderFilter =
        appliedFilters.value.gender === 'all' ? undefined : appliedFilters.value.gender;

      let departmentIds: number[] | undefined;
      if (appliedFilters.value.department !== 'all') {
        const deptValue = appliedFilters.value.department;
        if (deptValue.startsWith('id:')) {
          departmentIds = [Number(deptValue.replace('id:', ''))];
        }
      }

      let categories: string[] | undefined;
      if (appliedFilters.value.category !== 'all') {
        const catValue = appliedFilters.value.category;
        if (catValue.startsWith('id:')) {
          categories = [catValue.replace('id:', '')];
        } else if (catValue.startsWith('name:')) {
          categories = [catValue.replace('name:', '')];
        } else {
          categories = [catValue];
        }
      }
      const minSalary =
        appliedFilters.value.minSalary.trim() === ''
          ? undefined
          : Number(appliedFilters.value.minSalary);
      const isPhd =
        appliedFilters.value.isPhd === 'all' ? undefined : appliedFilters.value.isPhd === 'true';
      const isDoctor =
        appliedFilters.value.isDoctor === 'all'
          ? undefined
          : appliedFilters.value.isDoctor === 'true';
      const defenseFrom =
        appliedFilters.value.defenseFrom.trim() === ''
          ? undefined
          : appliedFilters.value.defenseFrom;
      const defenseTo =
        appliedFilters.value.defenseTo.trim() === '' ? undefined : appliedFilters.value.defenseTo;

      const params: TeachersControllerGetTeachersParams = {
        faculty: appliedFilters.value.faculty === 'all' ? undefined : appliedFilters.value.faculty,
        departmentIds,
        categories,
        gender: genderFilter,
        minSalary,
        isPhd,
        isDoctor,
        defenseFrom,
        defenseTo,
      };

      teachers.value = await teachersService.getTeachers(params);
    } catch {
      error.value = 'Не удалось получить преподавателей. Проверьте подключение к API.';
      teachers.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchTeachersForFilters = async (): Promise<void> => {
    try {
      teachersForFilters.value = await teachersService.getAllTeachers();
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

  const facultyOptions: ComputedRef<SelectOption[]> = computed(() => {
    const uniqueValues = new Set(
      referenceFaculties.value.map((faculty) => faculty.name).filter(Boolean),
    );

    if (uniqueValues.size === 0) {
      teachersForFilters.value
        .map((teacher) => teacher.faculty)
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
      for (const teacher of teachersForFilters.value) {
        if (teacher.department === '-') {
          continue;
        }

        if (teacher.departmentId !== null) {
          optionsMap.set(`id:${teacher.departmentId}`, teacher.department);
        } else {
          optionsMap.set(`name:${teacher.department}`, teacher.department);
        }
      }
    }

    return [
      { label: 'Все кафедры', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const categoryOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const category of teacherCategories.value) {
      if (!category.name) {
        continue;
      }

      if (category.id !== null) {
        optionsMap.set(`id:${category.id}`, category.name);
      } else {
        optionsMap.set(`name:${category.name}`, category.name);
      }
    }

    if (optionsMap.size === 0) {
      for (const teacher of teachersForFilters.value) {
        if (teacher.category === '-') {
          continue;
        }

        if (teacher.categoryId !== null) {
          optionsMap.set(`id:${teacher.categoryId}`, teacher.category);
        } else {
          optionsMap.set(`name:${teacher.category}`, teacher.category);
        }
      }
    }

    return [
      { label: 'Все категории', value: 'all' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const genderOptions: ComputedRef<SelectOption[]> = computed(() => {
    const uniqueGenders = new Set(
      teachersForFilters.value
        .map((teacher) => teacher.genderValue)
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

  const birthYearOptions: ComputedRef<SelectOption[]> = computed(() => {
    const years = new Set(
      teachersForFilters.value
        .map((teacher) => teacher.birthYear)
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
    const uniqueCounts = new Set(teachersForFilters.value.map((teacher) => teacher.childrenCount));

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

  const phdOptions: SelectOption[] = [
    { label: 'Все', value: 'all' },
    { label: 'Есть степень', value: 'true' },
    { label: 'Нет степени', value: 'false' },
  ];

  const doctorOptions: SelectOption[] = [
    { label: 'Все', value: 'all' },
    { label: 'Есть степень', value: 'true' },
    { label: 'Нет степени', value: 'false' },
  ];

  const createTeacherGenderOptions: SelectOption[] = [
    { label: 'Выберите пол', value: '' },
    { label: 'Мужской', value: StudentsGender.male },
    { label: 'Женский', value: StudentsGender.female },
  ];

  const createTeacherDepartmentOptions: ComputedRef<SelectOption[]> = computed(() => {
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
      for (const teacher of teachersForFilters.value) {
        if (teacher.department === '-') {
          continue;
        }

        if (teacher.departmentId !== null) {
          optionsMap.set(`id:${teacher.departmentId}`, teacher.department);
        } else {
          optionsMap.set(`name:${teacher.department}`, teacher.department);
        }
      }
    }

    return [
      { label: 'Выберите кафедру', value: '' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const createTeacherCategoryOptions: ComputedRef<SelectOption[]> = computed(() => {
    const optionsMap = new Map<string, string>();

    for (const category of teacherCategories.value) {
      if (!category.name) {
        continue;
      }

      if (category.id !== null) {
        optionsMap.set(`id:${category.id}`, category.name);
      } else {
        optionsMap.set(`name:${category.name}`, category.name);
      }
    }

    if (optionsMap.size === 0) {
      for (const teacher of teachersForFilters.value) {
        if (teacher.category === '-') {
          continue;
        }

        if (teacher.categoryId !== null) {
          optionsMap.set(`id:${teacher.categoryId}`, teacher.category);
        } else {
          optionsMap.set(`name:${teacher.category}`, teacher.category);
        }
      }
    }

    return [
      { label: 'Выберите категорию', value: '' },
      ...Array.from(optionsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, name]) => ({ label: name, value })),
    ];
  });

  const filteredTeachers: ComputedRef<Teacher[]> = computed(() => {
    return teachers.value.filter((teacher) => {
      const isBirthYearMatched =
        appliedFilters.value.birthYear === 'all' ||
        String(teacher.birthYear) === appliedFilters.value.birthYear;
      const isChildrenMatched =
        appliedFilters.value.childrenCount === 'all' ||
        teacher.childrenCount === Number(appliedFilters.value.childrenCount);

      return isBirthYearMatched && isChildrenMatched;
    });
  });

  const totalCount = computed(() => filteredTeachers.value.length);

  const openCreateModal = (): void => {
    createTeacherError.value = null;
    isCreateModalOpen.value = true;
  };

  const closeCreateModal = (): void => {
    if (!isSavingTeacher.value) {
      isCreateModalOpen.value = false;
    }
  };

  const createTeacher = async (): Promise<void> => {
    createTeacherError.value = null;
    const firstName = createTeacherForm.value.firstName.trim();
    const lastName = createTeacherForm.value.lastName.trim();
    const birthDate = createTeacherForm.value.birthDate.trim();
    const selectedDepartmentValue = createTeacherForm.value.departmentId;
    const selectedCategoryValue = createTeacherForm.value.categoryId;

    let resolvedDepartmentId: number | null = null;
    if (selectedDepartmentValue.startsWith('id:')) {
      resolvedDepartmentId = parseNumber(selectedDepartmentValue.replace('id:', ''));
    } else if (selectedDepartmentValue.startsWith('name:')) {
      const selectedDepartmentName = selectedDepartmentValue.replace('name:', '');
      const match = teachersForFilters.value.find(
        (teacher) => teacher.department === selectedDepartmentName && teacher.departmentId !== null,
      );
      resolvedDepartmentId = match?.departmentId ?? null;
    }

    let resolvedCategoryId: number | null = null;
    if (selectedCategoryValue.startsWith('id:')) {
      resolvedCategoryId = parseNumber(selectedCategoryValue.replace('id:', ''));
    } else if (selectedCategoryValue.startsWith('name:')) {
      const selectedCategoryName = selectedCategoryValue.replace('name:', '');
      const match = teachersForFilters.value.find(
        (teacher) => teacher.category === selectedCategoryName && teacher.categoryId !== null,
      );
      resolvedCategoryId = match?.categoryId ?? null;
    }

    if (
      !firstName ||
      !lastName ||
      !createTeacherForm.value.gender ||
      !birthDate ||
      !selectedDepartmentValue ||
      !selectedCategoryValue
    ) {
      createTeacherError.value =
        'Заполните обязательные поля: имя, фамилия, пол, дата рождения, кафедра и категория.';
      return;
    }

    if (resolvedDepartmentId === null) {
      createTeacherError.value =
        'Для выбранной кафедры не найден идентификатор. Проверьте данные API по кафедрам.';
      return;
    }

    if (resolvedCategoryId === null) {
      createTeacherError.value =
        'Для выбранной категории не найден идентификатор. Проверьте данные API по категориям.';
      return;
    }

    isSavingTeacher.value = true;
    try {
      const dissertations: DissertationDto[] = [];
      if (
        createTeacherForm.value.dissertationType &&
        createTeacherForm.value.dissertationTopic &&
        createTeacherForm.value.dissertationDefenseDate
      ) {
        dissertations.push({
          type: createTeacherForm.value.dissertationType,
          topic: createTeacherForm.value.dissertationTopic,
          defenseDate: createTeacherForm.value.dissertationDefenseDate,
        });
      }

      const payload: CreateTeacherDto = {
        firstName,
        lastName,
        gender: createTeacherForm.value.gender,
        birthDate,
        childrenCount: parseNumber(createTeacherForm.value.childrenCount) ?? 0,
        departmentId: resolvedDepartmentId,
        categoryId: resolvedCategoryId,
        salary: parseNumber(createTeacherForm.value.salary) ?? 0,
        isPostgraduateStudent: createTeacherForm.value.isPostgraduateStudent,
        dissertations: dissertations.length > 0 ? dissertations : undefined,
      };
      await teachersService.createTeacher(payload);
      createTeacherForm.value = {
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: '',
        childrenCount: '0',
        departmentId: '',
        categoryId: '',
        salary: '0',
        isPostgraduateStudent: false,
        dissertationType: '',
        dissertationTopic: '',
        dissertationDefenseDate: '',
      };
      isCreateModalOpen.value = false;
      await Promise.all([fetchTeachersForFilters(), fetchTeachers()]);
    } catch {
      createTeacherError.value = 'Не удалось создать преподавателя.';
    } finally {
      isSavingTeacher.value = false;
    }
  };

  return {
    teachers: filteredTeachers,
    teachersForFilters,
    loading,
    error,
    isCreateModalOpen,
    isSavingTeacher,
    createTeacherError,
    draftFilters,
    appliedFilters,
    createTeacherForm,
    facultyOptions,
    departmentOptions,
    categoryOptions,
    genderOptions,
    birthYearOptions,
    childrenOptions,
    phdOptions,
    doctorOptions,
    createTeacherGenderOptions,
    createTeacherDepartmentOptions,
    createTeacherCategoryOptions,
    totalCount,
    fetchTeachers,
    fetchTeachersForFilters,
    applyFilters,
    resetFilters,
    openCreateModal,
    closeCreateModal,
    createTeacher,
  };
};
