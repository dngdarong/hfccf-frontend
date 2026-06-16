<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { deleteSportPlayingStyle, fetchSportPlayingStyles } from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'SportPlayingStyleManagementPage',
})

const router = useRouter()
const { t } = useLanguage()

const playingStyles = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 8
const totalPlayingStyles = ref(0)

const pageTitle = computed(() => t('sportPlayingStyleManagement.title'))
const pageSubtitle = computed(() => t('sportPlayingStyleManagement.subtitle'))

const totalPages = computed(() => Math.max(Math.ceil(totalPlayingStyles.value / pageSize), 1))
const activePlayingStyles = computed(
  () => playingStyles.value.filter((style) => style.status === 'active').length,
)
const totalTeamsWithStyles = computed(
  () => playingStyles.value.reduce((sum, style) => sum + (style.teamsCount || 0), 0),
)

const summaryCards = computed(() => [
  {
    id: 'total',
    title: 'Total Styles',
    value: totalPlayingStyles.value,
    badge: `${activePlayingStyles.value} active`,
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    id: 'active',
    title: 'Active Styles',
    value: activePlayingStyles.value,
    badge: totalPlayingStyles.value > 0 ? `${(activePlayingStyles.value / totalPlayingStyles.value * 100).toFixed(0)}%` : '0%',
    icon: 'M5 13l4 4L19 7',
  },
  {
    id: 'teams',
    title: 'Teams Using',
    value: totalTeamsWithStyles.value,
    badge: 'Across styles',
    icon: 'M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z',
  },
])

async function goToAddStyle() {
  await router.push({ name: 'dashboard-sport-admin-playing-styles-add' })
}

function onEditStyle(style) {
  router.push({
    name: 'dashboard-sport-admin-playing-styles-edit',
    params: { id: style.id },
  })
}

async function loadPlayingStyles() {
  loading.value = true
  try {
    const response = await fetchSportPlayingStyles({ page: currentPage.value, perPage: pageSize })
    playingStyles.value = response.items || []
    totalPlayingStyles.value = response.pagination?.total || 0
  } catch (error) {
    console.error('Error loading playing styles:', error)
  } finally {
    loading.value = false
  }
}

async function onDeleteStyle(style) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${style.name}"?`,
  )
  if (confirmed) {
    try {
      await deleteSportPlayingStyle(style.id)
      await loadPlayingStyles()
    } catch (error) {
      console.error('Error deleting playing style:', error)
      alert('Failed to delete playing style')
    }
  }
}

onMounted(() => {
  loadPlayingStyles()
})
</script>

<template>
  <MainLayout>
    <section class="playing-style-management-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div class="summary-cards-grid">
        <div v-for="card in summaryCards" :key="card.id" class="summary-card">
          <div class="summary-card-header">
            <div>
              <p class="summary-card-title">{{ card.title }}</p>
              <p class="summary-card-value">{{ card.value }}</p>
            </div>
            <span class="summary-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path :d="card.icon" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="summary-card-badge">{{ card.badge }}</p>
        </div>
      </div>

      <div class="shell">
        <div class="toolbar">
          <div>
            <p class="toolbar-label">Playing Styles</p>
            <p class="toolbar-summary">{{ playingStyles.length }} total</p>
          </div>
          <button class="btn-primary" @click="goToAddStyle">
            <span class="btn-icon">+</span>
            New Style
          </button>
        </div>

        <div v-if="playingStyles.length === 0" class="state-empty">
          <p>No playing styles yet. Create one to get started.</p>
        </div>

        <table v-else class="styles-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Teams</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="style in playingStyles" :key="style.id">
              <td class="name-cell">{{ style.name }}</td>
              <td>
                <span :class="['status-badge', `status-${style.status}`]">
                  {{ style.status }}
                </span>
              </td>
              <td>{{ style.teamsCount }}</td>
              <td class="actions-cell">
                <button class="btn-small" @click="onEditStyle(style)">Edit</button>
                <button class="btn-small btn-danger" @click="onDeleteStyle(style)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="totalPages > 1" class="flex justify-end mt-4">
          <Pagination
            v-model="currentPage"
            :total-pages="totalPages"
            @change="loadPlayingStyles"
          />
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.playing-style-management-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.summary-cards-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.35rem;
  border-radius: 1.35rem;
  border: 1px solid #dbe6f4;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 252, 0.98) 100%);
  box-shadow: 0 24px 48px -38px rgba(15, 23, 42, 0.45);
}

.summary-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.summary-card-title {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-card-value {
  margin: 0.65rem 0 0;
  color: #0f172a;
  font-size: 2rem;
  line-height: 1;
  font-weight: 800;
}

.summary-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.95rem;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.18);
  color: #3b82f6;
}

.summary-card-icon svg {
  width: 1.15rem;
  height: 1.15rem;
}

.summary-card-badge {
  margin: 0;
  display: inline-flex;
  align-self: flex-start;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  font-size: 0.78rem;
  font-weight: 700;
}

.shell {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-label {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.toolbar-summary {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.88rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.2rem;
  border-radius: 0.9rem;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: 700;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  border-radius: 0.6rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #0f172a;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-danger {
  color: #b42318;
  border-color: #fecdd3;
}

.btn-danger:hover {
  background: #fff1f2;
  border-color: #fca5a5;
}

.state-empty {
  padding: 3rem 1.5rem;
  text-align: center;
  color: #64748b;
}

.styles-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.styles-table thead {
  border-bottom: 2px solid #e2e8f0;
  background: #f8fafc;
}

.styles-table th {
  padding: 0.9rem;
  text-align: left;
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.styles-table td {
  padding: 0.9rem;
  border-bottom: 1px solid #e2e8f0;
  color: #0f172a;
}

.styles-table tbody tr:hover {
  background: #f8fafc;
}

.name-cell {
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.7rem;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .shell {
    padding: 1.1rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .styles-table {
    font-size: 0.8rem;
  }

  .styles-table th,
  .styles-table td {
    padding: 0.6rem;
  }
}
</style>
