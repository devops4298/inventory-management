<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- Brand block -->
    <div class="brand">
      <template v-if="!collapsed">
        <span class="brand-name">{{ t('nav.companyName') }}</span>
        <span class="brand-sub">{{ t('nav.subtitle') }}</span>
      </template>
      <div v-else class="brand-icon-tile">
        {{ t('nav.companyName').charAt(0) }}
      </div>
    </div>

    <!-- Navigation -->
    <nav class="nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :title="t(item.key)"
        class="nav-item"
        :class="{ active: $route.path === item.to }"
      >
        <svg
          class="nav-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          v-html="icons[item.icon]"
        ></svg>
        <span class="nav-label" v-show="!collapsed">{{ t(item.key) }}</span>
      </router-link>
    </nav>

    <!-- Footer: language switcher, profile menu, collapse toggle -->
    <div class="sidebar-footer">
      <LanguageSwitcher />
      <ProfileMenu
        @show-profile-details="$emit('show-profile-details')"
        @show-tasks="$emit('show-tasks')"
      />
      <button
        class="collapse-btn"
        @click="toggle"
        :title="collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- Chevron flips: right when collapsed, left when expanded -->
          <path v-if="collapsed" d="M9 18l6-6-6-6"/>
          <path v-else d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script>
import { useI18n } from '../composables/useI18n'
import { useSidebar } from '../composables/useSidebar'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ProfileMenu from './ProfileMenu.vue'

// Data-driven nav — Backlog.vue is deliberately absent (unrouted dead code)
const navItems = [
  { to: '/',          key: 'nav.overview',       icon: 'grid' },
  { to: '/inventory', key: 'nav.inventory',      icon: 'box' },
  { to: '/orders',    key: 'nav.orders',         icon: 'cart' },
  { to: '/spending',  key: 'nav.finance',        icon: 'coin' },
  { to: '/demand',    key: 'nav.demandForecast', icon: 'trend' },
  { to: '/reports',   key: 'nav.reports',        icon: 'doc' },
]

// Inner SVG path content for each icon name (parent SVG sets stroke/fill attrs)
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  box:  '<path d="M20 7L12 3L4 7M20 7v10l-8 4M20 7L12 11M12 11L4 7M12 11v10M4 7v10l8 4"/>',
  cart: '<circle cx="9" cy="20" r="1"/><circle cx="20" cy="20" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 001.9 1.6h9.7a2 2 0 001.9-1.6L23 6H6"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M12 6v2m0 8v2m-2.5-4.5A2.5 2.5 0 0112 14a2.5 2.5 0 002.5-2.5c0-1.4-1-2.5-2.5-2.5s-2.5-1-2.5-2.5A2.5 2.5 0 0112 4a2.5 2.5 0 012.5 2.5"/>',
  trend:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  doc:  '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
}

export default {
  name: 'AppSidebar',
  components: { LanguageSwitcher, ProfileMenu },
  emits: ['show-profile-details', 'show-tasks'],
  setup() {
    const { t } = useI18n()
    const { collapsed, toggle } = useSidebar()

    return {
      t,
      collapsed,
      toggle,
      navItems,
      icons,
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: var(--sp-4) var(--sp-3);
  transition: width 0.18s ease;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-w-collapsed);
}

/* Brand block */
.brand {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-1);
  margin-bottom: var(--sp-4);
  min-height: 52px;
  justify-content: center;
}

.brand-name {
  font-size: 0.938rem;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
}

.brand-sub {
  font-size: 0.75rem;
  color: var(--fg-muted);
  white-space: nowrap;
  overflow: hidden;
}

/* Accent tile shown when sidebar is collapsed */
.brand-icon-tile {
  width: 36px;
  height: 36px;
  background: var(--accent);
  color: var(--surface);
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

/* Nav list */
.nav {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--r-sm);
  color: var(--fg-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover {
  background: var(--surface-2);
  color: var(--fg);
}

/* Active state: accent-tinted background + 3 px left bar */
.nav-item.active {
  background: var(--accent-sub);
  color: var(--accent);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
}

.nav-icon {
  flex-shrink: 0;
}

/* v-show keeps the span in DOM so the width transition stays smooth */
.nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer pinned to bottom */
.sidebar-footer {
  margin-top: auto;
  padding-top: var(--sp-4);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--sp-2);
  background: none;
  border: none;
  border-radius: var(--r-sm);
  cursor: pointer;
  color: var(--fg-muted);
  transition: background 0.15s ease, color 0.15s ease;
}

.collapse-btn:hover {
  background: var(--surface-2);
  color: var(--fg);
}
</style>
