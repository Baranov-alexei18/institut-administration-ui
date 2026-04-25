import type { RouteRecordRaw } from 'vue-router';

import { TASKS } from '../constants/tasks';
import { ROUTE_NAMES } from '../constants/routes-names';
import { routeBuilder } from './routes';

const taskPages = import.meta.glob('../pages/task/Task*.vue');

const buildTaskRoutes = (): RouteRecordRaw[] => {
  return TASKS.map((task) => {
    const pagePath = `../pages/task/Task${task.id}.vue`;
    const componentLoader = taskPages[pagePath];

    if (!componentLoader) {
      throw new Error(`Task page is missing: ${pagePath}`);
    }

    return {
      path: routeBuilder.task(task.id),
      name: `${ROUTE_NAMES.task}-${task.id}`,
      component: componentLoader,
      meta: {
        title: task.title,
        taskId: task.id,
        requiresAuth: true,
      },
    };
  });
};

export const buildAppRouteRecords = (): RouteRecordRaw[] => {
  return [
    {
      path: routeBuilder.home(),
      name: ROUTE_NAMES.home,
      component: () => import('../pages/HomePage.vue'),
      meta: {
        title: 'Home',
        isPublic: true,
      },
    },
    {
      path: routeBuilder.login(),
      name: ROUTE_NAMES.login,
      component: () => import('../pages/LoginPage.vue'),
      meta: {
        title: 'Login',
        isPublic: true,
      },
    },
    {
      path: routeBuilder.register(),
      name: ROUTE_NAMES.register,
      component: () => import('../pages/RegisterPage.vue'),
      meta: {
        title: 'Register',
        isPublic: true,
      },
    },
    ...buildTaskRoutes(),
  ];
};
