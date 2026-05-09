<script setup lang="ts">
export type TableColumn = {
  key: string;
  title: string;
};

defineProps<{
  columns: TableColumn[];
  rows: Record<string, string | number>[];
  emptyText?: string;
}>();
</script>

<template>
  <div class="table-wrap">
    <table v-if="rows.length > 0" class="table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td v-for="column in columns" :key="`${column.key}-${index}`">
            {{ row[column.key] ?? '-' }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">{{ emptyText ?? 'Нет данных для отображения.' }}</p>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-surface);
}

th,
td {
  border-bottom: 1px solid var(--color-border);
  padding: 10px 12px;
  text-align: left;
  font-size: 14px;
  white-space: nowrap;
}

th {
  background: var(--color-surface-alt);
}

tbody tr:last-child td {
  border-bottom: none;
}

.empty {
  margin: 0;
  padding: 14px;
  border: 1px dashed #c4cee7;
  border-radius: 12px;
  color: var(--color-text-secondary);
}
</style>
