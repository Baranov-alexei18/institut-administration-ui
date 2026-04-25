import { createRouter, createWebHistory } from 'vue-router';

import Home from '../views/Home.vue';
import About from '../views/About.vue';
import { routesBuilder } from './router-builder';

const routes = [
  {
    path: routesBuilder.home(),
    name: 'home',
    component: Home,
  },
  {
    path: routesBuilder.about(),
    name: 'about',
    component: About,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
