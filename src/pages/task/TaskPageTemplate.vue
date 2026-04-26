<script setup lang="ts">
import { computed } from 'vue';

import TaskContentCard from '../../components/task-content-card/TaskContentCard.vue';
import { TASKS } from '../../constants/tasks';

const props = defineProps<{
  taskId: number;
}>();

const task = computed(() => {
  return TASKS.find((item) => item.id === props.taskId);
});

const title = computed<string>(() => task.value?.title ?? `Task #${props.taskId}`);
const description = computed<string>(() => {
  return task.value?.description ?? 'Task page description is not available.';
});
</script>

<template>
  <div class="task-page">
    <TaskContentCard :title="title" :description="description" />
  </div>
</template>

<style scoped>
.task-page {
  width: 100%;
}
</style>
