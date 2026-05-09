<script setup lang="ts">
export type SelectOption = {
  label: string;
  value: string;
};

defineProps<{
  label: string;
  modelValue: string;
  options: SelectOption[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const onChange = (event: unknown): void => {
  const target = (event as { target?: { value?: string } }).target;
  emit('update:modelValue', target?.value ?? '');
};
</script>

<template>
  <label class="field">
    <span class="field-label">{{ label }}</span>
    <select class="field-select" :value="modelValue" @change="onChange">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.field-select {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: 8px 10px;
  min-height: 38px;
}
</style>
