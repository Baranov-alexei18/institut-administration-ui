<script setup lang="ts">
defineProps<{
  label: string;
  modelValue: string;
  type?: 'text' | 'number';
  placeholder?: string;
  min?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const onInput = (event: unknown): void => {
  const target = (event as { target?: { value?: string } }).target;
  emit('update:modelValue', target?.value ?? '');
};
</script>

<template>
  <label class="field">
    <span class="field-label">{{ label }}</span>
    <input
      class="field-input"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :min="min"
      @input="onInput"
    />
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

.field-input {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: 8px 10px;
  min-height: 38px;
}
</style>
