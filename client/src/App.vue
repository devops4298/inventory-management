<template>
  <div class="app" :class="{ 'sidebar-collapsed': collapsed }">
    <AppSidebar
      @show-profile-details="showProfileDetails = true"
      @show-tasks="showTasks = true"
    />
    <div class="content">
      <FilterBar />
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import { useSidebar } from './composables/useSidebar'
import FilterBar from './components/FilterBar.vue'
import AppSidebar from './components/AppSidebar.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    AppSidebar,
    ProfileDetailsModal,
    TasksModal,
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const { collapsed } = useSidebar()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      collapsed,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
/* ─── Design token layer ─────────────────────────────────────────────────── */
:root {
  /* surfaces & ink — zinc ramp */
  --bg:            #fafafa;
  --surface:       #ffffff;
  --surface-2:     #f4f4f5;
  --border:        #e4e4e7;
  --border-strong: #d4d4d8;
  --fg:            #18181b;
  --fg-muted:      #71717a;
  --fg-subtle:     #a1a1aa;

  /* accent — indigo */
  --accent:        #4f46e5;
  --accent-hover:  #4338ca;
  --accent-sub:    #eef2ff;
  --accent-fg:     #3730a3;

  /* status — reserved, never reused as a chart series */
  --success:    #16a34a;  --success-bg: #f0fdf4;  --success-fg: #15803d;
  --warning:    #d97706;  --warning-bg: #fffbeb;  --warning-fg: #b45309;
  --danger:     #dc2626;  --danger-bg:  #fef2f2;  --danger-fg:  #b91c1c;

  /* chart series — fixed order, never cycled */
  --chart-1: #4f46e5;
  --chart-2: #0d9488;
  --chart-3: #d97706;
  --chart-4: #e11d48;
  --chart-5: #a21caf;

  /* spacing rhythm — 4 8 12 16 24 32 48, no other values */
  --sp-1: 0.25rem;  --sp-2: 0.5rem;   --sp-3: 0.75rem;
  --sp-4: 1rem;     --sp-6: 1.5rem;   --sp-8: 2rem;   --sp-12: 3rem;

  /* radius */
  --r-sm: 8px;  --r-md: 10px;  --r-lg: 14px;

  /* elevation — layered 2-stop */
  --shadow-sm: 0 1px 2px rgba(24, 24, 27, 0.04),
               0 1px 3px rgba(24, 24, 27, 0.06);
  --shadow-md: 0 2px 4px rgba(24, 24, 27, 0.04),
               0 8px 16px rgba(24, 24, 27, 0.08);

  /* layout */
  --sidebar-w:           260px;
  --sidebar-w-collapsed: 64px;
}

/* ─── Reset ──────────────────────────────────────────────────────────────── */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg);
  color: var(--fg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─── App shell ──────────────────────────────────────────────────────────── */
.app {
  min-height: 100vh;
  background: var(--bg);
}

/* Content area shifts right to make room for the fixed sidebar */
.content {
  margin-left: var(--sidebar-w);
  transition: margin-left 0.18s ease;
  min-width: 0; /* prevents wide tables from blowing out the layout */
}

.app.sidebar-collapsed .content {
  margin-left: var(--sidebar-w-collapsed);
}

.main-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--sp-6) var(--sp-8);
}

/* ─── Page header ────────────────────────────────────────────────────────── */
.page-header {
  margin-bottom: var(--sp-6);
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--fg);
  margin-bottom: var(--sp-1);
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--fg-muted);
  font-size: 0.938rem;
}

/* ─── Stats grid + stat cards ────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--sp-4);
  margin-bottom: var(--sp-6);
}

.stat-card {
  background: var(--surface);
  padding: var(--sp-6);
  border-radius: var(--r-md);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}

.stat-label {
  color: var(--fg-muted);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--sp-2);
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: var(--warning);
}

.stat-card.success .stat-value {
  color: var(--success);
}

.stat-card.danger .stat-value {
  color: var(--danger);
}

.stat-card.info .stat-value {
  color: var(--accent);
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border-radius: var(--r-md);
  padding: var(--sp-6);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--sp-4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-4);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -0.025em;
}

/* ─── Table ──────────────────────────────────────────────────────────────── */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--bg);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

th {
  text-align: left;
  padding: var(--sp-2) var(--sp-3);
  font-weight: 600;
  color: var(--fg-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: var(--sp-2) var(--sp-3);
  border-top: 1px solid var(--surface-2);
  color: var(--fg);
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--bg);
}

/* ─── Badge ──────────────────────────────────────────────────────────────── */
.badge {
  display: inline-block;
  padding: var(--sp-1) var(--sp-3);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: var(--success-bg);
  color: var(--success-fg);
}

.badge.warning {
  background: var(--warning-bg);
  color: var(--warning-fg);
}

.badge.danger {
  background: var(--danger-bg);
  color: var(--danger-fg);
}

.badge.info {
  background: var(--accent-sub);
  color: var(--accent-fg);
}

.badge.increasing {
  background: var(--success-bg);
  color: var(--success-fg);
}

.badge.decreasing {
  background: var(--danger-bg);
  color: var(--danger-fg);
}

.badge.stable {
  background: var(--accent-sub);
  color: var(--accent-fg);
}

.badge.high {
  background: var(--danger-bg);
  color: var(--danger-fg);
}

.badge.medium {
  background: var(--warning-bg);
  color: var(--warning-fg);
}

.badge.low {
  background: var(--accent-sub);
  color: var(--accent-fg);
}

/* ─── Loading / error states ─────────────────────────────────────────────── */
.loading {
  text-align: center;
  padding: var(--sp-12);
  color: var(--fg-muted);
  font-size: 0.938rem;
}

.error {
  background: var(--danger-bg);
  border: 1px solid var(--danger-bg);
  color: var(--danger-fg);
  padding: var(--sp-4);
  border-radius: var(--r-sm);
  margin: var(--sp-4) 0;
  font-size: 0.938rem;
}
</style>
