<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { routeBuilder } from '../../router';
import { useAuth } from '../../hooks/auth/useAuth';

defineProps<{
  title: string;
}>();

const router = useRouter();
const { isAuthenticated, logout } = useAuth();

const authButtonLabel = computed<string>(() => (isAuthenticated.value ? 'Logout' : 'Login'));

const onAuthAction = (): void => {
  if (isAuthenticated.value) {
    logout();
    void router.push(routeBuilder.home());
    return;
  }

  void router.push(routeBuilder.login());
};
</script>

<template>
  <header class="header">
    <h1 class="title">{{ title }}</h1>
    <button type="button" class="auth-btn" @click="onAuthAction">
      {{ authButtonLabel }}
    </button>
  </header>
</template>

<style scoped>
.header {
  height: 76px;
  border-bottom: 1px solid var(--color-border);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.auth-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  background: var(--color-accent);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}
</style>
