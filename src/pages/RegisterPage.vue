<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuth } from '../hooks/auth/useAuth';
import { routeBuilder } from '../router';

type RegisterForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const router = useRouter();
const { register } = useAuth();

const form = reactive<RegisterForm>({
  email: '',
  password: '',
  confirmPassword: '',
});
const validationError = ref<string>('');

const submitRegister = (): void => {
  if (form.password !== form.confirmPassword) {
    validationError.value = 'Passwords do not match';
    return;
  }

  validationError.value = '';
  register(form.email, form.password);
  void router.push(routeBuilder.login());
};

const goToLogin = (): void => {
  void router.push(routeBuilder.login());
};
</script>

<template>
  <section class="register">
    <h2 class="title">Register</h2>
    <form class="form" @submit.prevent="submitRegister">
      <label class="field">
        <span class="label">Email</span>
        <input v-model="form.email" type="email" class="input" required />
      </label>
      <label class="field">
        <span class="label">Password</span>
        <input v-model="form.password" type="password" class="input" required />
      </label>
      <label class="field">
        <span class="label">Confirm password</span>
        <input v-model="form.confirmPassword" type="password" class="input" required />
      </label>
      <p v-if="validationError" class="error">{{ validationError }}</p>
      <button type="submit" class="submit">Create account</button>
    </form>
    <p class="hint">
      Уже есть аккаунт?
      <button type="button" class="link" @click="goToLogin">Войти</button>
    </p>
  </section>
</template>

<style scoped>
.register {
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

.error {
  margin: 0;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
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
