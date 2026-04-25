import type { Router } from 'vue-router';

import { useAuth } from '../hooks/auth/useAuth';
import { routeBuilder } from './routes';

export const registerAuthGuard = (router: Router): void => {
  router.beforeEach((to) => {
    const { isAuthenticated } = useAuth();

    if (to.meta.requiresAuth && !isAuthenticated.value) {
      return { path: routeBuilder.home() };
    }

    return true;
  });
};
