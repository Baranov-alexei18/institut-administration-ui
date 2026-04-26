<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

import { useAuth } from '../hooks/auth/useAuth';
import { routeBuilder } from '../router';

type LoginForm = {
  email: string;
  password: string;
};

const router = useRouter();
const { login } = useAuth();

const form = reactive<LoginForm>({
  email: '',
  password: '',
});

const submitLogin = (): void => {
  login(form.email, form.password);
  void router.push(routeBuilder.home());
};

const goToRegister = (): void => {
  void router.push(routeBuilder.register());
};
</script>

<template>
  <section class="login">
    <h2 class="title">Login</h2>
    <form class="form" @submit.prevent="submitLogin">
      <label class="field">
        <span class="label">Email</span>
        <input v-model="form.email" type="email" class="input" required />
      </label>
      <label class="field">
        <span class="label">Password</span>
        <input v-model="form.password" type="password" class="input" required />
      </label>
      <button type="submit" class="submit">Login</button>
    </form>
    <p class="hint">
      Нет аккаунта?
      <button type="button" class="link" @click="goToRegister">Регистрация</button>
    </p>
  </section>
</template>

<style scoped>
.login {
  max-width: 460px;
  padding: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.title {
  margin: 0 0 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-weight: 600;
  font-size: 15px;
}

.input {
  border: 1px solid var(--color-border);
  border-radius: 11px;
  padding: 10px 12px;
  font-size: 15px;
}

.submit {
  margin-top: 6px;
  border: none;
  border-radius: 12px;
  padding: 11px 16px;
  font-weight: 600;
  background: var(--color-accent);
  color: #ffffff;
  cursor: pointer;
}

.hint {
  margin: 16px 0 0;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.link {
  border: none;
  background: transparent;
  padding: 0;
  margin-left: 5px;
  color: var(--color-accent);
  font-weight: 600;
  cursor: pointer;
}
</style>
