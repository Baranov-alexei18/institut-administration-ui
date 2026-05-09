<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import AppHeader from './components/layout/AppHeader.vue';
import AppSidebar from './components/layout/AppSidebar.vue';
import { useReferenceDataStore } from './stores/reference-data';

const route = useRoute();
const referenceDataStore = useReferenceDataStore();

const pageTitle = computed<string>(() => {
  return (route.meta.title as string | undefined) ?? 'Institute Administration System';
});

onMounted(() => {
  void referenceDataStore.loadReferenceData();
});
</script>

<template>
  <div class="shell">
    <AppSidebar />
    <div class="content">
      <AppHeader :title="pageTitle" />
      <main class="main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.main {
  padding: 24px;
}

@media (max-width: 768px) {
  .shell {
    flex-direction: column;
  }

  .main {
    padding: 16px;
  }
}
</style>
