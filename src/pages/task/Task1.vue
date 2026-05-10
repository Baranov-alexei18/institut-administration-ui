<script setup lang="ts">
import { computed, onMounted } from 'vue';

import AppInput from '@/components/common/AppInput.vue';
import AppModal from '@/components/common/AppModal.vue';
import AppSelect from '@/components/common/AppSelect.vue';
import AppTable, { type TableColumn } from '@/components/common/AppTable.vue';
import { useStudents } from '@/composables/useStudents';
import { useReferenceDataStore } from '@/stores/reference-data';
import { formatBirthDate } from '@/utils/students';

const referenceDataStore = useReferenceDataStore();

const {
  students,
  loading,
  error,
  isCreateModalOpen,
  isSavingStudent,
  createStudentError,
  draftFilters,
  createStudentForm,
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
  closeCreateModal,
  createStudent,
} = useStudents();

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
  return students.value.map((student) => ({
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

onMounted(() => {
  void referenceDataStore.loadReferenceData();
  void fetchStudentsForFilters();
  void fetchStudents();
});
</script>

<template>
  <section class="task">
    <header class="head">
      <h2 class="title">Перечень и число студентов</h2>
      <p class="desc">
        Получение списка студентов по группам/курсам факультета c фильтрами по полу, году рождения,
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
