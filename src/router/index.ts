import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { ROUTE_NAMES } from '../shared/constants/routes';
import { TASKS } from '../shared/constants/tasks';
import { routeBuilder } from './routes';

const taskPages = import.meta.glob('../pages/task/Task*.vue');

const taskRoutes: RouteRecordRaw[] = TASKS.map((task) => {
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
    },
  };
});

const routes: RouteRecordRaw[] = [
  {
    path: routeBuilder.root(),
    name: ROUTE_NAMES.root,
    redirect: routeBuilder.task(1),
  },
  ...taskRoutes,
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
