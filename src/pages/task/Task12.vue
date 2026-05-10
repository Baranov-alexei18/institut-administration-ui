<script setup lang="ts">
import { computed, onMounted } from 'vue';

import AppSelect from '@/components/common/AppSelect.vue';
import AppTable, { type TableColumn } from '@/components/common/AppTable.vue';
import { useThesisSupervisors } from '@/composables/useThesisSupervisors';
import { useReferenceDataStore } from '@/stores/reference-data';

const referenceDataStore = useReferenceDataStore();

const {
  thesisSupervisors,
  loading,
  error,
  totalCount,
  draftFilters,
  departmentOptions,
  facultyOptions,
  categoryOptions,
  fetchThesisSupervisors,
  fetchThesisSupervisorsForFilters,
  applyFilters,
  resetFilters,
} = useThesisSupervisors();

const tableColumns: TableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'fullName', title: 'ФИО' },
  { key: 'category', title: 'Категория' },
  { key: 'thesesCount', title: 'Количество дипломных работ' },
];

const tableRows = computed<Record<string, string | number>[]>(() => {
  return thesisSupervisors.value.map((supervisor) => ({
    id: supervisor.id ?? '-',
    fullName: supervisor.fullName,
    category: supervisor.category,
    thesesCount: supervisor.thesesCount,
  }));
});

onMounted(() => {
  void referenceDataStore.loadReferenceData();
  void fetchThesisSupervisorsForFilters();
  void fetchThesisSupervisors();
});
</script>

<template>
  <section class="task">
    <header class="head">
      <h2 class="title">Руководители дипломных работ</h2>
      <p class="desc">
        Получить список руководителей дипломных работ с указанной кафедры, либо факультета
        полностью и раздельно по некоторым категориям преподавателей.
      </p>
    </header>

    <div class="filters">
      <AppSelect v-model="draftFilters.department" label="Кафедра" :options="departmentOptions" />
      <AppSelect v-model="draftFilters.faculty" label="Факультет" :options="facultyOptions" />
      <AppSelect v-model="draftFilters.category" label="Категория" :options="categoryOptions" />
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
      empty-text="Руководители дипломных работ по выбранным фильтрам не найдены."
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
