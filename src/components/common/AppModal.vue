<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    closeOnBackdrop?: boolean;
  }>(),
  {
    closeOnBackdrop: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const close = (): void => {
  emit('update:modelValue', false);
};

const onBackdropClick = (): void => {
  if (props.closeOnBackdrop) {
    close();
  }
};
</script>

<template>
  <teleport to="body">
    <div v-if="modelValue" class="overlay" @click="onBackdropClick">
      <section class="modal" role="dialog" aria-modal="true" :aria-label="title" @click.stop>
        <header class="header">
          <h3 class="title">{{ title }}</h3>
          <button type="button" class="close" aria-label="Close modal" @click="close">×</button>
        </header>

        <div class="body">
          <slot />
        </div>

        <footer class="footer">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  width: min(680px, 100%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  max-height: 92vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-border);
}

.title {
  margin: 0;
  font-size: 18px;
}

.close {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  width: 32px;
  height: 32px;
  background: var(--color-surface-alt);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.body {
  padding: 16px 18px;
  overflow-y: auto;
}

.footer {
  padding: 12px 18px 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
