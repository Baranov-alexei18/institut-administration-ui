<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import AppHeader from './components/layout/AppHeader.vue';
import AppSidebar from './components/layout/AppSidebar.vue';

const route = useRoute();

const pageTitle = computed<string>(() => {
  return (route.meta.title as string | undefined) ?? 'Institute Administration System';
});
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="app-content">
      <AppHeader :title="pageTitle" />
      <main class="app-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
