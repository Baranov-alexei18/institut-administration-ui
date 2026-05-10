<script setup lang="ts">
import { computed, onMounted } from 'vue';

import AppInput from '@/components/common/AppInput.vue';
import AppSelect from '@/components/common/AppSelect.vue';
import AppTable, { type TableColumn } from '@/components/common/AppTable.vue';
import { useTeachingDepartments } from '@/composables/useTeachingDepartments';
import { useReferenceDataStore } from '@/stores/reference-data';

const referenceDataStore = useReferenceDataStore();

const {
  departments,
  loading,
  error,
  draftFilters,
  facultyOptions,
  groupOptions,
  courseOptions,
  semesterOptions,
  fetchDepartments,
  fetchDepartmentsForFilters,
  applyFilters,
  resetFilters,
} = useTeachingDepartments();

const tableColumns: TableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: 'Название кафедры' },
  { key: 'faculty', title: 'Факультет' },
];

const tableRows = computed<Record<string, string | number>[]>(() => {
  return departments.value.map((dept) => ({
    id: dept.id ?? '-',
    name: dept.name,
    faculty: dept.faculty,
  }));
});

onMounted(() => {
  void referenceDataStore.loadReferenceData();
  void fetchDepartmentsForFilters();
  void fetchDepartments();
});
</script>

<template>
  <section class="task">
    <header class="head">
      <h2 class="title">Кафедры</h2>
      <p class="desc">
        Получение перечня кафедр, проводящих занятия в указанной группе либо на указанном курсе
        указанного факультета в указанном семестре, либо за указанный период.
      </p>
    </header>

    <div class="filters">
      <AppSelect v-model="draftFilters.faculty" label="Факультет" :options="facultyOptions" />
      <AppSelect v-model="draftFilters.group" label="Группа" :options="groupOptions" />
      <AppSelect v-model="draftFilters.semester" label="Семестр" :options="semesterOptions" />
      <AppInput v-model="draftFilters.fromYear" label="Год (от)" placeholder="Например, 2020" />
      <AppInput v-model="draftFilters.toYear" label="Год (до)" placeholder="Например, 2024" />
    </div>

    <div class="actions">
      <button type="button" class="btn primary" :disabled="loading" @click="applyFilters">
        {{ loading ? 'Загрузка...' : 'Применить фильтры' }}
      </button>
      <button type="button" class="btn secondary" :disabled="loading" @click="resetFilters">
        Сбросить
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <AppTable
      :columns="tableColumns"
      :rows="tableRows"
      empty-text="Кафедры по выбранным фильтрам не найдены."
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

.error {
  margin: 0;
  color: #cc2e4a;
}

@media (max-width: 760px) {
  .task {
    padding: 16px;
  }
}
</style>
