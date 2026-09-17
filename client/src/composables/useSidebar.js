import { ref, watch } from 'vue'

// Shared sidebar state (singleton pattern, same as useFilters/useI18n).
// Collapsed state is persisted so the rail survives a reload.
const collapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')

watch(collapsed, (value) => {
  localStorage.setItem('sidebar-collapsed', String(value))
})

export function useSidebar() {
  const toggle = () => {
    collapsed.value = !collapsed.value
  }

  return {
    // State
    collapsed,

    // Methods
    toggle
  }
}
