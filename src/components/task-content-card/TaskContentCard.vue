<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <section class="card">
    <header class="head">
      <h2 class="title">{{ title }}</h2>
      <p class="desc">{{ description }}</p>
    </header>

    <div class="result">
      <h3 class="result-title">Future Result</h3>
      <p class="result-desc">
        This section is reserved for implementation output, charts, tables, or analysis for this
        task.
      </p>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.head {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title {
  margin: 0;
  font-size: 22px;
}

.desc {
  margin: 0;
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.result {
  padding: 16px;
  border: 1px dashed #c4cee7;
  border-radius: 13px;
  background: var(--color-surface-alt);
}

.result-title {
  margin: 0 0 6px;
  font-size: 16px;
}

.result-desc {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
</style>
