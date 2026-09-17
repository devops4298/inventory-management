<template>
  <div class="language-switcher">
    <button
      class="language-button"
      @click="toggleDropdown"
      @blur="handleBlur"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        class="globe-icon"
      >
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M3 10H17" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 3C10 3 7.5 5.5 7.5 10C7.5 14.5 10 17 10 17" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 3C10 3 12.5 5.5 12.5 10C12.5 14.5 10 17 10 17" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <!-- Language code (e.g. EN / JA) is always visible; full name shown when space allows -->
      <span class="language-code">{{ currentLocale.toUpperCase() }}</span>
      <span class="language-label">{{ localeName }}</span>
      <svg
        class="chevron"
        :class="{ 'chevron-open': isDropdownOpen }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Dropdown opens upward for sidebar footer placement -->
    <div v-if="isDropdownOpen" class="dropdown-menu">
      <button
        v-for="locale in availableLocales"
        :key="locale"
        class="dropdown-item"
        :class="{ active: currentLocale === locale }"
        @mousedown.prevent="selectLanguage(locale)"
      >
        <span class="language-name">{{ getLanguageName(locale) }}</span>
        <svg
          v-if="currentLocale === locale"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          class="check-icon"
        >
          <path d="M4 9L7.5 12.5L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '../composables/useI18n'

const { currentLocale, setLocale, availableLocales, localeName } = useI18n()

const isDropdownOpen = ref(false)

const languageNames = {
  en: 'English',
  ja: '日本語'
}

const getLanguageName = (locale) => {
  return languageNames[locale] || locale
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleBlur = () => {
  // Delay to allow mousedown events on dropdown items to fire first
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 200)
}

const selectLanguage = (locale) => {
  setLocale(locale)
  isDropdownOpen.value = false
}
</script>

<style scoped>
.language-switcher {
  position: relative;
  width: 100%;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--fg);
  width: 100%;
  overflow: hidden;
}

.language-button:hover {
  background: var(--surface-2);
  border-color: var(--border-strong);
}

.globe-icon {
  color: var(--fg-muted);
  flex-shrink: 0;
}

/* Shown only in collapsed 64px rail — hidden when full label is visible */
.language-code {
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--fg-muted);
  display: none;
  flex-shrink: 0;
}

.language-label {
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.chevron {
  color: var(--fg-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron-open {
  transform: rotate(180deg);
}

/* Dropdown opens upward for sidebar footer placement */
.dropdown-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: var(--sp-2);
  min-width: 160px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-md);
  z-index: 110;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--fg);
}

.dropdown-item:hover {
  background: var(--surface-2);
}

.dropdown-item.active {
  background: var(--accent-sub);
  color: var(--accent);
}

.language-name {
  flex: 1;
}

.check-icon {
  color: var(--accent);
  flex-shrink: 0;
}

/* Collapsed rail: hide label and chevron, show code only */
@container sidebar (max-width: 64px) {
  .language-label,
  .chevron {
    display: none;
  }
  .language-code {
    display: block;
  }
}
</style>
