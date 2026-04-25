<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { routeBuilder } from '../../router';
import { useAuth } from '../../hooks/auth/useAuth';
import { TASKS } from '../../constants/tasks';

const route = useRoute();
const isCollapsed = ref<boolean>(false);
const { isAuthenticated } = useAuth();

const navigationItems = computed(() => {
  const homePath = routeBuilder.home();
  const homeItem = {
    id: 'home',
    title: 'Home',
    marker: 'H',
    path: homePath,
    isActive: route.path === homePath,
    isBlocked: false,
  };

  const taskItems = TASKS.map((task) => {
    const path = routeBuilder.task(task.id);

    return {
      id: `task-${task.id}`,
      title: task.title,
      marker: `${task.id}`,
      path,
      isActive: route.path === path,
      isBlocked: !isAuthenticated.value,
    };
  });

  return [homeItem, ...taskItems];
});

const toggleSidebar = (): void => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="top">
      <p v-if="!isCollapsed" class="brand">Institute Administration System</p>
      <button type="button" class="toggle" @click="toggleSidebar" aria-label="Toggle sidebar">
        <span class="arrow" :class="{ rotated: isCollapsed }">
          <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
            <path d="M15.5 4.5L8.5 12L15.5 19.5" />
          </svg>
        </span>
      </button>
    </div>

    <nav class="nav" aria-label="Primary navigation">
      <component
        v-for="item in navigationItems"
        :key="item.id"
        :is="item.isBlocked ? 'button' : 'RouterLink'"
        :to="item.isBlocked ? undefined : item.path"
        type="button"
        class="item"
        :class="{
          active: item.isActive,
          blocked: item.isBlocked,
        }"
        :disabled="item.isBlocked"
      >
        <span class="badge">{{ item.isBlocked ? '🔒' : item.marker }}</span>
        <span v-if="!isCollapsed" class="label">
          {{ item.title }}
        </span>
        <span v-if="item.isBlocked && !isCollapsed" class="blocked-tag">Blocked</span>
      </component>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 264px;
  padding: 16px 12px;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: width 0.2s ease;
}

.collapsed {
  width: 88px;
  padding-inline: 8px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.brand {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.toggle {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  width: 32px;
  height: 32px;
  background: var(--color-surface-alt);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.arrow {
  display: inline-flex;
  transition: transform 0.2s ease;
}

.rotated {
  transform: rotate(180deg);
}

.icon {
  width: 18px;
  height: 18px;
  stroke: var(--color-text-secondary);
  stroke-width: 2.2;
  fill: none;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.item {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 11px;
  padding: 8px 10px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.item:hover {
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
}

.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.blocked {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge {
  width: 24px;
  height: 24px;
  border: 1px solid currentColor;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.label {
  font-size: 15px;
  font-weight: 600;
}

.blocked-tag {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
}

.collapsed .top {
  justify-content: center;
}

.collapsed .nav {
  align-items: center;
}

.collapsed .item {
  width: auto;
  padding: 7px;
  justify-content: center;
}

@media (max-width: 768px) {
  .sidebar,
  .collapsed {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .nav {
    flex-direction: row;
    overflow-x: auto;
  }
}
</style>
