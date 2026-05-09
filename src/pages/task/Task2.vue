<script setup lang="ts">
import { computed, onMounted } from 'vue';

import AppInput from '@/components/common/AppInput.vue';
import AppModal from '@/components/common/AppModal.vue';
import AppSelect from '@/components/common/AppSelect.vue';
import AppTable, { type TableColumn } from '@/components/common/AppTable.vue';
import { useTeachers } from '@/composables/useTeachers';
import { useReferenceDataStore } from '@/stores/reference-data';
import { formatBirthDate } from '@/utils/students';

const referenceDataStore = useReferenceDataStore();

const {
  teachers,
  loading,
  error,
  isCreateModalOpen,
  isSavingTeacher,
  createTeacherError,
  draftFilters,
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
} = useTeachers();

const tableColumns: TableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'fullName', title: 'ФИО' },
  { key: 'faculty', title: 'Факультет' },
  { key: 'department', title: 'Кафедра' },
  { key: 'category', title: 'Категория' },
  { key: 'gender', title: 'Пол' },
  { key: 'birthDate', title: 'Дата рождения' },
  { key: 'age', title: 'Возраст' },
  { key: 'childrenCount', title: 'Дети' },
  { key: 'salary', title: 'Зарплата' },
  { key: 'degree', title: 'Наличие степени' },
];

const tableRows = computed<Record<string, string | number>[]>(() => {
  return teachers.value.map((teacher) => ({
    id: teacher.id ?? '-',
    fullName: teacher.fullName,
    faculty: teacher.faculty,
    department: teacher.department,
    category: teacher.category,
    gender: teacher.genderLabel,
    birthDate: formatBirthDate(teacher.birthDate),
    age: teacher.age ?? '-',
    childrenCount: teacher.childrenCount,
    salary: teacher.salary,
    degree: teacher.degree,
  }));
});

onMounted(() => {
  void referenceDataStore.loadReferenceData();
  void fetchTeachersForFilters();
  void fetchTeachers();
});
</script>

<template>
  <section class="task">
    <header class="head">
      <h2 class="title">Task #2: Перечень и число преподавателей</h2>
      <p class="desc">
        Получение списка преподавателей по кафедрам/категориям факультета с фильтрами по полу, году
        рождения, возрасту, детям, зарплате.
      </p>
    </header>

    <div class="filters">
      <AppSelect v-model="draftFilters.faculty" label="Факультет" :options="facultyOptions" />
      <AppSelect v-model="draftFilters.department" label="Кафедра" :options="departmentOptions" />
      <AppSelect v-model="draftFilters.category" label="Категория" :options="categoryOptions" />
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
        v-model="draftFilters.minSalary"
        label="Минимальная зарплата"
        type="number"
        placeholder="Например, 50000"
        :min="0"
      />
    </div>

    <div class="actions">
      <button type="button" class="btn success" @click="openCreateModal">
        + Добавить преподавателя
      </button>
      <button type="button" class="btn primary" :disabled="loading" @click="applyFilters">
        {{ loading ? 'Загрузка...' : 'Применить фильтры' }}
      </button>
      <button type="button" class="btn secondary" :disabled="loading" @click="resetFilters">
        Сбросить
      </button>
      <p class="count">Всего преподавателей: {{ totalCount }}</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <AppTable
      :columns="tableColumns"
      :rows="tableRows"
      empty-text="Преподаватели по выбранным фильтрам не найдены."
    />

    <AppModal
      v-model="isCreateModalOpen"
      title="Создать преподавателя"
      :close-on-backdrop="!isSavingTeacher"
    >
      <div class="create-grid">
        <AppInput v-model="createTeacherForm.firstName" label="Имя" placeholder="Иван" />
        <AppInput v-model="createTeacherForm.lastName" label="Фамилия" placeholder="Иванов" />
        <AppSelect
          v-model="createTeacherForm.gender"
          label="Пол"
          :options="createTeacherGenderOptions"
        />
        <AppInput
          v-model="createTeacherForm.birthDate"
          label="Дата рождения"
          placeholder="YYYY-MM-DD"
        />
        <AppSelect
          v-model="createTeacherForm.departmentId"
          label="Кафедра"
          :options="createTeacherDepartmentOptions"
        />
        <AppSelect
          v-model="createTeacherForm.categoryId"
          label="Категория"
          :options="createTeacherCategoryOptions"
        />
        <AppInput
          v-model="createTeacherForm.childrenCount"
          label="Количество детей"
          type="number"
          :min="0"
        />
        <AppInput
          v-model="createTeacherForm.salary"
          label="Размер зарплаты"
          type="number"
          :min="0"
        />
        <label class="checkbox-label">
          <input v-model="createTeacherForm.isPostgraduateStudent" type="checkbox" />
          <span>Является аспирантом</span>
        </label>
      </div>

      <div class="dissertation-section">
        <h3 class="section-title">Диссертация (опционально)</h3>
        <AppInput
          v-model="createTeacherForm.dissertationType"
          label="Тип диссертации"
          placeholder="phd или doctor"
        />
        <AppInput
          v-model="createTeacherForm.dissertationTopic"
          label="Тема диссертации"
          placeholder="Тема"
        />
        <AppInput
          v-model="createTeacherForm.dissertationDefenseDate"
          label="Дата защиты"
          placeholder="YYYY-MM-DD"
        />
      </div>

      <p v-if="createTeacherError" class="error">{{ createTeacherError }}</p>

      <template #footer>
        <button
          type="button"
          class="btn secondary"
          :disabled="isSavingTeacher"
          @click="closeCreateModal"
        >
          Отмена
        </button>
        <button
          type="button"
          class="btn primary"
          :disabled="isSavingTeacher"
          @click="createTeacher"
        >
          {{ isSavingTeacher ? 'Сохранение...' : 'Создать' }}
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  cursor: pointer;
}

.dissertation-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
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
