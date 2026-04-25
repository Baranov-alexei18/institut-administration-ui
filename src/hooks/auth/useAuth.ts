import { computed, ref } from 'vue';

const AUTH_TOKEN_KEY = 'institute-admin-token';
const token = ref<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));

const setToken = (value: string): void => {
  token.value = value;
  localStorage.setItem(AUTH_TOKEN_KEY, value);
};

const clearToken = (): void => {
  token.value = null;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const useAuth = () => {
  const isAuthenticated = computed<boolean>(() => Boolean(token.value));

  const login = (email: string, password: string): void => {
    const mockToken = `mock:${email}:${password.length}`;
    setToken(mockToken);
  };

  const logout = (): void => {
    clearToken();
  };

  const register = (_email: string, _password: string): void => {
    // Intentionally a no-op for mocked registration flow.
  };

  return {
    isAuthenticated,
    login,
    logout,
    register,
  };
};
