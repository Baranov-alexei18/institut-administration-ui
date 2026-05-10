<script setup lang="ts">
import { computed, onMounted } from 'vue';

import AppInput from '@/components/common/AppInput.vue';
import AppSelect from '@/components/common/AppSelect.vue';
import AppTable, { type TableColumn } from '@/components/common/AppTable.vue';
import { useDissertations } from '@/composables/useDissertations';
import { useReferenceDataStore } from '@/stores/reference-data';
import { formatBirthDate } from '@/utils/students';

const referenceDataStore = useReferenceDataStore();

const {
  dissertations,
  loading,
  error,
  totalCount,
  draftFilters,
  facultyOptions,
  departmentOptions,
  typeOptions,
  fetchDissertations,
  fetchDissertationsForFilters,
  applyFilters,
  resetFilters,
} = useDissertations();

const tableColumns: TableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'typeLabel', title: 'Тип' },
  { key: 'topic', title: 'Тема' },
  { key: 'defenseDate', title: 'Дата защиты' },
  { key: 'teacherName', title: 'Преподаватель' },
  { key: 'department', title: 'Кафедра' },
  { key: 'faculty', title: 'Факультет' },
];

const tableRows = computed<Record<string, string | number>[]>(() => {
  return dissertations.value.map((dissertation) => ({
    id: dissertation.id ?? '-',
    typeLabel: dissertation.typeLabel,
    topic: dissertation.topic,
    defenseDate: formatBirthDate(dissertation.defenseDate),
    teacherName: dissertation.teacherName,
    department: dissertation.department,
    faculty: dissertation.faculty,
  }));
});

onMounted(() => {
  void referenceDataStore.loadReferenceData();
  void fetchDissertationsForFilters();
  void fetchDissertations();
});
</script>

<template>
  <section class="task">
    <header class="head">
      <h2 class="title">Диссертации</h2>
      <p class="desc">
        Получение перечня и общего числа тем кандидатских и докторских диссертаций, защищенных
        сотрудниками указанной кафедры либо указанного факультета.
      </p>
    </header>

    <div class="filters">
      <AppSelect v-model="draftFilters.faculty" label="Факультет" :options="facultyOptions" />
      <AppSelect v-model="draftFilters.department" label="Кафедра" :options="departmentOptions" />
      <AppSelect v-model="draftFilters.type" label="Тип диссертации" :options="typeOptions" />
      <AppInput v-model="draftFilters.from" label="Дата защиты (от)" placeholder="YYYY-MM-DD" />
      <AppInput v-model="draftFilters.to" label="Дата защиты (до)" placeholder="YYYY-MM-DD" />
    </div>

    <div class="actions">
      <button type="button" class="btn primary" :disabled="loading" @click="applyFilters">
        {{ loading ? 'Загрузка...' : 'Применить фильтры' }}
      </button>
      <button type="button" class="btn secondary" :disabled="loading" @click="resetFilters">
        Сбросить
      </button>
      <p class="count">Всего диссертаций: {{ totalCount }}</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <AppTable
      :columns="tableColumns"
      :rows="tableRows"
      empty-text="Диссертации по выбранным фильтрам не найдены."
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
