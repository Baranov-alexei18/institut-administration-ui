<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import {
  studentsControllerCreate,
  studentsControllerGetStudents,
} from '../../api/generated/institutAdministrationAPI';
import {
  type CreateStudentDto,
  type StudentsControllerGetStudentsGender,
  StudentsControllerGetStudentsGender as StudentsGender,
} from '../../api/generated/institutAdministrationAPI.schemas';
import AppInput from '../../components/common/AppInput.vue';
import AppModal from '../../components/common/AppModal.vue';
import AppSelect, { type SelectOption } from '../../components/common/AppSelect.vue';
import AppTable, { type TableColumn } from '../../components/common/AppTable.vue';

type RawStudent = Record<string, unknown>;

type Student = {
  id: number | null;
  fullName: string;
  genderValue: string;
  genderLabel: string;
  birthDate: string;
  birthYear: number | null;
  age: number | null;
  childrenCount: number;
  scholarshipAmount: number;
  groupId: number | null;
  group: string;
  course: number | null;
  faculty: string;
};

type Filters = {
  faculty: string;
  course: string;
  group: string;
  gender: string;
  birthYear: string;
  childrenCount: string;
  minScholarship: string;
};

const students = ref<Student[]>([]);
const studentsForFilters = ref<Student[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const isCreateModalOpen = ref(false);
const isSavingStudent = ref(false);
const createStudentError = ref<string | null>(null);

type CreateStudentForm = {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  childrenCount: string;
  groupId: string;
  scholarshipAmount: string;
};

const defaultFilters = (): Filters => ({
  faculty: 'all',
  course: 'all',
  group: 'all',
  gender: 'all',
  birthYear: 'all',
  childrenCount: 'all',
  minScholarship: '',
});

const draftFilters = ref<Filters>(defaultFilters());
const appliedFilters = ref<Filters>(defaultFilters());
const createStudentForm = ref<CreateStudentForm>({
  firstName: '',
  lastName: '',
  gender: '',
  birthDate: '',
  childrenCount: '0',
  groupId: '',
  scholarshipAmount: '0',
});

const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const parseString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const parseGroupFields = (item: RawStudent): { groupId: number | null; groupName: string } => {
  const directGroupId = parseNumber(item.groupId ?? item.group_id);
  const directGroupName = parseString(item.group_name ?? item.groupName);

  if (directGroupId !== null || directGroupName) {
    return { groupId: directGroupId, groupName: directGroupName };
  }

  if (item.group && typeof item.group === 'object') {
    const group = item.group as Record<string, unknown>;
    return {
      groupId: parseNumber(group.id ?? group.groupId ?? group.group_id),
      groupName: parseString(group.name ?? group.title ?? group.groupName),
    };
  }

  return { groupId: null, groupName: '' };
};

const normalizeGender = (value: unknown): string => {
  const gender = parseString(value).toLowerCase();
  if (gender === StudentsGender.male) {
    return 'Мужской';
  }

  if (gender === StudentsGender.female) {
    return 'Женский';
  }

  return '-';
};

const parseGenderValue = (value: unknown): string => {
  const gender = parseString(value).toLowerCase();
  if (gender === StudentsGender.male || gender === StudentsGender.female) {
    return gender;
  }

  return '';
};

const calculateAge = (birthDate: string): number | null => {
  if (!birthDate) {
    return null;
  }

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

const formatBirthDate = (birthDate: string): string => {
  if (!birthDate || birthDate === '-') {
    return '-';
  }

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return `${day}.${month}.${year}`;
};

const toStudent = (item: RawStudent): Student => {
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();

  const birthDate = parseString(item.birth_date ?? item.birthDate);
  const birthYear = birthDate ? new Date(birthDate).getFullYear() : null;
  const childrenCount = parseNumber(item.children_count ?? item.childrenCount) ?? 0;
  const scholarshipAmount = parseNumber(item.scholarship_amount ?? item.scholarshipAmount) ?? 0;
  const { groupId, groupName } = parseGroupFields(item);
  const course = parseNumber(item.course);
  const faculty = parseString(item.faculty ?? item.faculty_name);
  const genderValue = parseGenderValue(item.gender);

  return {
    id: parseNumber(item.id),
    fullName: fullName || 'Без имени',
    genderValue,
    genderLabel: normalizeGender(item.gender),
    birthDate: birthDate || '-',
    birthYear: birthYear && Number.isFinite(birthYear) ? birthYear : null,
    age: calculateAge(birthDate),
    childrenCount,
    scholarshipAmount,
    groupId,
    group: groupName || (groupId !== null ? String(groupId) : '-'),
    course,
    faculty: faculty || '-',
  };
};

const extractStudents = (payload: unknown): RawStudent[] => {
  if (Array.isArray(payload)) {
    return payload as RawStudent[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.students, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawStudent[];
      }
    }
  }

  return [];
};

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

    const response = await studentsControllerGetStudents({
      faculty: appliedFilters.value.faculty === 'all' ? undefined : appliedFilters.value.faculty,
      courses: courseFilter,
      gender: genderFilter,
      minScholarship,
    });

    students.value = extractStudents(response).map(toStudent);
  } catch {
    error.value = 'Не удалось получить студентов. Проверьте подключение к API.';
    students.value = [];
  } finally {
    loading.value = false;
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

const facultyOptions = computed<SelectOption[]>(() => {
  const uniqueValues = new Set(
    studentsForFilters.value.map((student) => student.faculty).filter((value) => value !== '-'),
  );
  return [
    { label: 'Все факультеты', value: 'all' },
    ...Array.from(uniqueValues)
      .sort()
      .map((value) => ({ label: value, value })),
  ];
});

const courseOptions = computed<SelectOption[]>(() => {
  const uniqueValues = new Set(
    studentsForFilters.value
      .map((student) => student.course)
      .filter((value): value is number => value !== null),
  );
  return [
    { label: 'Все курсы', value: 'all' },
    ...Array.from(uniqueValues)
      .sort((a, b) => a - b)
      .map((value) => ({ label: `${value} курс`, value: String(value) })),
  ];
});

const genderOptions = computed<SelectOption[]>(() => {
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

const groupOptions = computed<SelectOption[]>(() => {
  const uniqueGroups = new Set(
    studentsForFilters.value.map((student) => student.group).filter((value) => value !== '-'),
  );

  return [
    { label: 'Все группы', value: 'all' },
    ...Array.from(uniqueGroups)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ label: value, value })),
  ];
});

const birthYearOptions = computed<SelectOption[]>(() => {
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

const childrenOptions = computed<SelectOption[]>(() => {
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

const createStudentGroupOptions = computed<SelectOption[]>(() => {
  const optionsMap = new Map<string, string>();

  console.log('studentsForFilters');
  console.log(studentsForFilters.value);

  for (const student of studentsForFilters.value) {
    if (student.group === '-') {
      continue;
    }

    console.log(student.groupId);
    
    if (student.groupId !== null) {
      optionsMap.set(`id:${student.groupId}`, student.group);
    } else {
      optionsMap.set(`name:${student.group}`, student.group);
    }
  }

  return [
    { label: 'Выберите группу', value: '' },
    ...Array.from(optionsMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, name]) => ({ label: name, value })),
  ];
});

const openCreateModal = (): void => {
  createStudentError.value = null;
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

  console.log(selectedGroupValue);

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
    await studentsControllerCreate(payload);
    createStudentForm.value = {
      firstName: '',
      lastName: '',
      gender: '',
      birthDate: '',
      childrenCount: '0',
      groupId: '',
      scholarshipAmount: '0',
    };
    isCreateModalOpen.value = false;
    await Promise.all([fetchStudentsForFilters(), fetchStudents()]);
  } catch {
    createStudentError.value = 'Не удалось создать студента.';
  } finally {
    isSavingStudent.value = false;
  }
};

const filteredStudents = computed<Student[]>(() => {
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

const tableColumns: TableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'fullName', title: 'ФИО' },
  { key: 'faculty', title: 'Факультет' },
  { key: 'course', title: 'Курс' },
  { key: 'group', title: 'Группа' },
  { key: 'gender', title: 'Пол' },
  { key: 'birthDate', title: 'Дата рождения' },
  { key: 'age', title: 'Возраст' },
  { key: 'childrenCount', title: 'Дети' },
  { key: 'scholarshipAmount', title: 'Стипендия' },
];

const tableRows = computed<Record<string, string | number>[]>(() => {
  return filteredStudents.value.map((student) => ({
    id: student.id ?? '-',
    fullName: student.fullName,
    faculty: student.faculty,
    course: student.course ?? '-',
    group: student.group,
    gender: student.genderLabel,
    birthDate: formatBirthDate(student.birthDate),
    age: student.age ?? '-',
    childrenCount: student.childrenCount,
    scholarshipAmount: student.scholarshipAmount,
  }));
});

const totalCount = computed(() => filteredStudents.value.length);

const fetchStudentsForFilters = async (): Promise<void> => {
  try {
    const response = await studentsControllerGetStudents();
    studentsForFilters.value = extractStudents(response).map(toStudent);
  } catch {
    studentsForFilters.value = [];
  }
};

onMounted(() => {
  void fetchStudentsForFilters();
  void fetchStudents();
});
</script>

<template>
  <section class="task">
    <header class="head">
      <h2 class="title">Task #1: Перечень и число студентов</h2>
      <p class="desc">
        Получение списка студентов по группам/курсам факультета с фильтрами по полу, году рождения,
        возрасту, детям и стипендии.
      </p>
    </header>

    <div class="filters">
      <AppSelect v-model="draftFilters.faculty" label="Факультет" :options="facultyOptions" />
      <AppSelect v-model="draftFilters.course" label="Курс" :options="courseOptions" />
      <AppSelect v-model="draftFilters.group" label="Группа" :options="groupOptions" />
      <AppSelect v-model="draftFilters.gender" label="Пол" :options="genderOptions" />
      <AppSelect
        v-model="draftFilters.birthYear"
        label="Год рождения"
        :options="birthYearOptions"
      />
      <AppSelect
        v-model="draftFilters.childrenCount"
        label="Количество детей"
        :options="childrenOptions"
      />
      <AppInput
        v-model="draftFilters.minScholarship"
        label="Минимальная стипендия"
        type="number"
        placeholder="Например, 1500"
        :min="0"
      />
    </div>

    <div class="actions">
      <button type="button" class="btn success" @click="openCreateModal">
        + Добавить студента
      </button>
      <button type="button" class="btn primary" :disabled="loading" @click="applyFilters">
        {{ loading ? 'Загрузка...' : 'Применить фильтры' }}
      </button>
      <button type="button" class="btn secondary" :disabled="loading" @click="resetFilters">
        Сбросить
      </button>
      <p class="count">Всего студентов: {{ totalCount }}</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <AppTable
      :columns="tableColumns"
      :rows="tableRows"
      empty-text="Студенты по выбранным фильтрам не найдены."
    />

    <AppModal
      v-model="isCreateModalOpen"
      title="Создать студента"
      :close-on-backdrop="!isSavingStudent"
    >
      <div class="create-grid">
        <AppInput v-model="createStudentForm.firstName" label="Имя" placeholder="Иван" />
        <AppInput v-model="createStudentForm.lastName" label="Фамилия" placeholder="Иванов" />
        <AppSelect
          v-model="createStudentForm.gender"
          label="Пол"
          :options="createStudentGenderOptions"
        />
        <AppInput
          v-model="createStudentForm.birthDate"
          label="Дата рождения"
          placeholder="YYYY-MM-DD"
        />
        <AppSelect
          v-model="createStudentForm.groupId"
          label="Название группы"
          :options="createStudentGroupOptions"
        />
        <AppInput
          v-model="createStudentForm.childrenCount"
          label="Количество детей"
          type="number"
          :min="0"
        />
        <AppInput
          v-model="createStudentForm.scholarshipAmount"
          label="Размер стипендии"
          type="number"
          :min="0"
        />
      </div>

      <p v-if="createStudentError" class="error">{{ createStudentError }}</p>

      <template #footer>
        <button
          type="button"
          class="btn secondary"
          :disabled="isSavingStudent"
          @click="closeCreateModal"
        >
          Отмена
        </button>
        <button
          type="button"
          class="btn primary"
          :disabled="isSavingStudent"
          @click="createStudent"
        >
          {{ isSavingStudent ? 'Сохранение...' : 'Создать' }}
        </button>
      </template>
    </AppModal>
  </section>
</template>

<style scoped>
.task {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  margin: 0;
  font-size: 22px;
}

.desc {
  margin: 0;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 600;
  border: 1px solid transparent;
}

.primary {
  background: var(--color-accent);
  color: #ffffff;
}

.secondary {
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.success {
  background: #0e9f6e;
  color: #ffffff;
}

.count {
  margin: 0 0 0 auto;
  font-weight: 700;
}

.error {
  margin: 0;
  color: #cc2e4a;
}

.create-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

@media (max-width: 760px) {
  .task {
    padding: 16px;
  }

  .count {
    margin-left: 0;
    width: 100%;
  }
}
</style>
