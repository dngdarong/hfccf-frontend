<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import StatsCards from '@/components/data-display/StatsCards.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import Loading from '@/components/feedback/Loading.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertError from '@/components/alerts/AlertError.vue'
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
const pageSize = 5
const totalPlayingStyles = ref(0)
const showDeleteConfirm = ref(false)
const deletingStyle = ref(null)
const deletingLoading = ref(false)
const deleteError = ref('')

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
    title: t('sportPlayingStyleManagement.summary.total.title'),
    value: totalPlayingStyles.value,
    label: t('sportPlayingStyleManagement.summary.total.badge', { count: activePlayingStyles.value }),
    status: 'info',
  },
  {
    id: 'active',
    title: t('sportPlayingStyleManagement.summary.active.title'),
    value: activePlayingStyles.value,
    label: t('sportPlayingStyleManagement.summary.active.badge', {
      rate: totalPlayingStyles.value > 0
        ? (activePlayingStyles.value / totalPlayingStyles.value * 100).toFixed(0)
        : 0,
    }),
    status: 'success',
  },
  {
    id: 'teams',
    title: t('sportPlayingStyleManagement.summary.teams.title'),
    value: totalTeamsWithStyles.value,
    label: t('sportPlayingStyleManagement.summary.teams.badge'),
    status: 'warning',
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
  } catch {
    // Error handling via API response
  } finally {
    loading.value = false
  }
}

function onDeleteStyle(style) {
  deletingStyle.value = style
  deleteError.value = ''
  showDeleteConfirm.value = true
}

async function handleConfirmDelete() {
  if (!deletingStyle.value) return

  try {
    deletingLoading.value = true
    deleteError.value = ''
    await deleteSportPlayingStyle(deletingStyle.value.id)
    showDeleteConfirm.value = false
    await loadPlayingStyles()
  } catch {
    deleteError.value = t('sportPlayingStyleManagement.errors.deleteFailed')
  } finally {
    deletingLoading.value = false
  }
}

function handleCancelDelete() {
  showDeleteConfirm.value = false
  deletingStyle.value = null
  deleteError.value = ''
}

onMounted(() => {
  loadPlayingStyles()
})
</script>

<template>
  <MainLayout>
    <section class="playing-style-management-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <StatsCards :cards="summaryCards" compact />

      <div class="shell">
        <div class="toolbar">
          <div>
            <p class="toolbar-label">{{ t('sportPlayingStyleManagement.toolbar.label') }}</p>
            <p class="toolbar-summary">{{ t('sportPlayingStyleManagement.toolbar.summary', { count: playingStyles.length }) }}</p>
          </div>
          <Button
            type="button"
            :label="t('sportPlayingStyleManagement.addButton')"
            icon="pi pi-plus"
            @click="goToAddStyle"
          />
        </div>

        <div v-if="loading" class="state-loading">
          <Loading />
        </div>

        <div v-else-if="playingStyles.length === 0" class="state-empty">
          <p>{{ t('sportPlayingStyleManagement.table.noResults') }}</p>
        </div>

        <table v-else class="styles-table">
          <thead>
            <tr>
              <th>{{ t('sportPlayingStyleManagement.table.name') }}</th>
              <th>{{ t('sportPlayingStyleManagement.table.status') }}</th>
              <th>{{ t('sportPlayingStyleManagement.table.teams') }}</th>
              <th>{{ t('sportPlayingStyleManagement.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="style in playingStyles" :key="style.id">
              <td class="name-cell">{{ style.name }}</td>
              <td>
                <StatusBadge :status="style.status" size="sm" />
              </td>
              <td>{{ style.teamsCount }}</td>
              <td class="actions-cell">
                <button type="button" class="btn-small" @click="onEditStyle(style)">
                  {{ t('sportPlayingStyleManagement.table.edit') }}
                </button>
                <button type="button" class="btn-small btn-danger" @click="onDeleteStyle(style)">
                  {{ t('sportPlayingStyleManagement.table.delete') }}
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

        <!-- Delete Confirmation Dialog -->
        <AlertQuestion
          :show="showDeleteConfirm"
          :title="t('sportPlayingStyleManagement.confirmDelete.title')"
          :message="deletingStyle ? t('sportAdminSharedMessages.confirmations.deleteItem', { itemName: deletingStyle.name }) : ''"
          :confirm-text="t('common.delete')"
          :cancel-text="t('common.cancel')"
          :loading="deletingLoading"
          type="danger"
          @confirm="handleConfirmDelete"
          @cancel="handleCancelDelete"
        />

        <!-- Delete Error Message -->
        <AlertError
          v-if="deleteError"
          :show="true"
          :message="deleteError"
          @close="deleteError = ''"
        />
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
