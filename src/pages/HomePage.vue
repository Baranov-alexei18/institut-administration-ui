<script setup lang="ts">
import { useRouter } from 'vue-router';

import { routeBuilder } from '../router';

const router = useRouter();

const goToLogin = (): void => {
  void router.push(routeBuilder.login());
};

const goToRegister = (): void => {
  void router.push(routeBuilder.register());
};
</script>

<template>
  <section class="home">
    <h2 class="title">Institute Administration System</h2>
    <p class="desc">
      Pet project for learning integration between backend (NestJS) and frontend (Vue.js)
    </p>
    <p class="note">You must authenticate to access tasks</p>

    <div class="actions">
      <button type="button" class="btn primary" @click="goToLogin">
        Login
      </button>
      <button type="button" class="btn secondary" @click="goToRegister">
        Register
      </button>
    </div>
  </section>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.title {
  margin: 0 0 12px;
  font-size: 29px;
}

.desc {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.note {
  margin: 16px 0 0;
  color: var(--color-accent);
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
  align: center;
}

.btn {
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
}

.primary {
  background: var(--color-accent);
  color: #ffffff;
}

.secondary {
  background: var(--color-surface-alt);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

@media (max-width: 640px) {
  .home {
    padding: 20px;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
