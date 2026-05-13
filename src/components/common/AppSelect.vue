<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

export type SelectOption = {
  label: string;
  value: string;
};

const props = defineProps<{
  label: string;
  modelValue: string;
  options: SelectOption[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isOpen = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectRef = ref<any>(null);

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue)?.label || 'Выберите значение';
});

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value;
};

const selectOption = (value: string): void => {
  emit('update:modelValue', value);
  isOpen.value = false;
};

const handleClickOutside = (event): void => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <label class="field" ref="selectRef">
    <span class="field-label">{{ label }}</span>
    <div class="select-wrapper">
      <div class="select-trigger" @click="toggleDropdown">
        <span class="select-value">{{ selectedOption }}</span>
        <span class="select-arrow" :class="{ open: isOpen }">▼</span>
      </div>
      <div class="select-dropdown" :class="{ open: isOpen }">
        <div
          v-for="option in options"
          :key="option.value"
          class="select-option"
          :class="{ selected: option.value === modelValue }"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>
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

.select-wrapper {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  cursor: pointer;
  min-height: 38px;
  transition: all 0.2s ease;
}

.select-trigger:hover {
  border-color: var(--color-accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.select-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
  font-size: 10px;
  color: var(--color-text-secondary);
}

.select-arrow.open {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.select-dropdown.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.select-option {
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid var(--color-border);
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background: var(--color-surface-alt);
  padding-left: 16px;
}

.select-option.selected {
  background: var(--color-accent);
  color: #ffffff;
  font-weight: 600;
}

.select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.select-dropdown::-webkit-scrollbar-track {
  background: var(--color-surface-alt);
  border-radius: 3px;
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.select-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
</style>
