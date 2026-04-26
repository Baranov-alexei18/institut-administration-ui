<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { appControllerGetHello } from '../api/generated/institutAdministrationAPI';
import { routeBuilder } from '../router';

const router = useRouter();

const goToLogin = (): void => {
  void router.push(routeBuilder.login());
};

const goToRegister = (): void => {
  void router.push(routeBuilder.register());
};

// 👉 новое состояние
const helloResponse = ref<string | null>(null);
const loading = ref(false);

// 👉 вызов бэка
const checkBackend = async (): Promise<void> => {
  loading.value = true;

  try {
    const res = await appControllerGetHello();

    helloResponse.value = res.data;
  } catch (e) {
    helloResponse.value = 'Backend error ❌';
  } finally {
    loading.value = false;
  }
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
      <button type="button" class="btn primary" @click="goToLogin">Login</button>
      <button type="button" class="btn secondary" @click="goToRegister">Register</button>

      <!-- 👉 новая кнопка -->
      <button type="button" class="btn test" @click="checkBackend">Check backend</button>
    </div>

    <!-- 👉 вывод результата -->
    <p v-if="loading">Loading...</p>
    <p v-else-if="helloResponse" class="note">Response: {{ helloResponse }}</p>
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
  align-items: center;
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

.test {
  background: #4f46e5;
  color: white;
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
