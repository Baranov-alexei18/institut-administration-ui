import { createRouter, createWebHistory } from 'vue-router';

import { buildAppRouteRecords } from './app-routes';
import { registerAuthGuard } from './auth-guard';

export { ROUTE_NAMES } from '../constants/routes-names';
export { routeBuilder } from './routes';

export const router = createRouter({
  history: createWebHistory(),
  routes: buildAppRouteRecords(),
});

registerAuthGuard(router);
