<script setup lang="ts">
import { computed, onMounted } from 'vue';

import AppInput from '@/components/common/AppInput.vue';
import AppSelect from '@/components/common/AppSelect.vue';
import AppTable, { type TableColumn } from '@/components/common/AppTable.vue';
import { useStudentsByAssessment } from '@/composables/useStudentsByAssessment';
import { useReferenceDataStore } from '@/stores/reference-data';

const referenceDataStore = useReferenceDataStore();

const {
  students,
  loading,
  error,
  totalCount,
  draftFilters,
  groupOptions,
  disciplineOptions,
  assessmentTypeOptions,
  fetchStudents,
  fetchStudentsForFilters,
  applyFilters,
  resetFilters,
} = useStudentsByAssessment();

const tableColumns: TableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'fullName', title: 'ФИО' },
  { key: 'group', title: 'Группа' },
  { key: 'discipline', title: 'Дисциплина' },
  { key: 'assessmentTypeLabel', title: 'Тип оценки' },
  { key: 'grade', title: 'Оценка' },
];

const tableRows = computed<Record<string, string | number>[]>(() => {
  return students.value.map((student) => ({
    id: student.id ?? '-',
    fullName: student.fullName,
    group: student.group,
    discipline: student.discipline,
    assessmentTypeLabel: student.assessmentTypeLabel,
    grade: student.grade ?? '-',
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
      <h2 class="title">Студенты по оценкам</h2>
      <p class="desc">
        Получение списка и общего числа студентов указанных групп, сдавших зачет либо экзамен по
        указанной дисциплине с указанной оценкой.
      </p>
    </header>

    <div class="filters">
      <AppSelect v-model="draftFilters.group" label="Группа" :options="groupOptions" />
      <AppSelect
        v-model="draftFilters.discipline"
        label="Дисциплина"
        :options="disciplineOptions"
      />
      <AppSelect
        v-model="draftFilters.assessmentType"
        label="Тип оценки"
        :options="assessmentTypeOptions"
      />
      <AppInput v-model="draftFilters.grade" label="Оценка" placeholder="Например, 3" />
    </div>

    <div class="actions">
      <button type="button" class="btn primary" :disabled="loading" @click="applyFilters">
        {{ loading ? 'Загрузка...' : 'Применить фильтры' }}
      </button>
      <button type="button" class="btn secondary" :disabled="loading" @click="resetFilters">
        Сбросить
      </button>
      <p class="count">Всего записей: {{ totalCount }}</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <AppTable
      :columns="tableColumns"
      :rows="tableRows"
      empty-text="Студенты по выбранным фильтрам не найдены."
    />
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

.count {
  margin: 0 0 0 auto;
  font-weight: 700;
}

.error {
  margin: 0;
  color: #cc2e4a;
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
