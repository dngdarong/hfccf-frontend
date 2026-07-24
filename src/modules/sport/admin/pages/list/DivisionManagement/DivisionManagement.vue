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
import { deleteSportDivision, fetchSportDivisions } from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'SportDivisionManagementPage',
})

const router = useRouter()
const { t } = useLanguage()

const divisions = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 5
const totalDivisions = ref(0)
const showDeleteConfirm = ref(false)
const deletingDivision = ref(null)
const deletingLoading = ref(false)
const deleteError = ref('')

const pageTitle = computed(() => t('sportDivisionManagement.title'))
const pageSubtitle = computed(() => t('sportDivisionManagement.subtitle'))

const totalPages = computed(() => Math.max(Math.ceil(totalDivisions.value / pageSize), 1))
const activeDivisions = computed(
  () => divisions.value.filter((div) => div.status === 'active').length,
)
const totalTeamsInDivisions = computed(
  () => divisions.value.reduce((sum, div) => sum + (div.teamsCount || 0), 0),
)

const summaryCards = computed(() => [
  {
    id: 'total',
    title: t('sportDivisionManagement.summary.total.title'),
    value: totalDivisions.value,
    label: t('sportDivisionManagement.summary.total.badge', { count: activeDivisions.value }),
    status: 'info',
  },
  {
    id: 'active',
    title: t('sportDivisionManagement.summary.active.title'),
    value: activeDivisions.value,
    label: t('sportDivisionManagement.summary.active.badge', {
      rate: totalDivisions.value > 0
        ? (activeDivisions.value / totalDivisions.value * 100).toFixed(0)
        : 0,
    }),
    status: 'success',
  },
  {
    id: 'teams',
    title: t('sportDivisionManagement.summary.teams.title'),
    value: totalTeamsInDivisions.value,
    label: t('sportDivisionManagement.summary.teams.badge'),
    status: 'warning',
  },
])

async function goToAddDivision() {
  await router.push({ name: 'dashboard-sport-admin-divisions-add' })
}

function onEditDivision(division) {
  router.push({
    name: 'dashboard-sport-admin-divisions-edit',
    params: { id: division.id },
  })
}

async function loadDivisions() {
  loading.value = true
  try {
    const response = await fetchSportDivisions({ page: currentPage.value, perPage: pageSize })
    divisions.value = response.items || []
    totalDivisions.value = response.pagination?.total || 0
  } catch {
    // Error handling via API response
  } finally {
    loading.value = false
  }
}

function onDeleteDivision(division) {
  deletingDivision.value = division
  deleteError.value = ''
  showDeleteConfirm.value = true
}

async function handleConfirmDelete() {
  if (!deletingDivision.value) return

  try {
    deletingLoading.value = true
    deleteError.value = ''
    await deleteSportDivision(deletingDivision.value.id)
    showDeleteConfirm.value = false
    await loadDivisions()
  } catch {
    deleteError.value = t('sportDivisionManagement.errors.deleteFailed')
  } finally {
    deletingLoading.value = false
  }
}

function handleCancelDelete() {
  showDeleteConfirm.value = false
  deletingDivision.value = null
  deleteError.value = ''
}

onMounted(() => {
  loadDivisions()
})
</script>

<template>
  <MainLayout>
    <section class="division-management-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <StatsCards :cards="summaryCards" compact />

      <div class="shell">
        <div class="toolbar">
          <div>
            <p class="toolbar-label">{{ t('sportDivisionManagement.toolbar.label') }}</p>
            <p class="toolbar-summary">{{ t('sportDivisionManagement.toolbar.summary', { count: divisions.length }) }}</p>
          </div>
          <Button
            type="button"
            :label="t('sportDivisionManagement.addButton')"
            icon="pi pi-plus"
            @click="goToAddDivision"
          />
        </div>

        <div v-if="loading" class="state-loading">
          <Loading />
        </div>

        <div v-else-if="divisions.length === 0" class="state-empty">
          <p>{{ t('sportDivisionManagement.table.noResults') }}</p>
        </div>

        <table v-else class="divisions-table">
          <thead>
            <tr>
              <th>{{ t('sportDivisionManagement.table.name') }}</th>
              <th>{{ t('sportDivisionManagement.table.status') }}</th>
              <th>{{ t('sportDivisionManagement.table.teams') }}</th>
              <th>{{ t('sportDivisionManagement.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="division in divisions" :key="division.id">
              <td class="name-cell">{{ division.name }}</td>
              <td>
                <StatusBadge :status="division.status" size="sm" />
              </td>
              <td>{{ division.teamsCount }}</td>
              <td class="actions-cell">
                <button type="button" class="btn-small" @click="onEditDivision(division)">
                  {{ t('sportDivisionManagement.table.edit') }}
                </button>
                <button type="button" class="btn-small btn-danger" @click="onDeleteDivision(division)">
                  {{ t('sportDivisionManagement.table.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="totalPages > 1" class="flex justify-end mt-4">
          <Pagination
            v-model="currentPage"
            :total-pages="totalPages"
            @change="loadDivisions"
          />
        </div>

        <!-- Delete Confirmation Dialog -->
        <AlertQuestion
          :show="showDeleteConfirm"
          :title="t('sportDivisionManagement.confirmDelete.title')"
          :message="deletingDivision ? t('sportAdminSharedMessages.confirmations.deleteItem', { itemName: deletingDivision.name }) : ''"
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
.division-management-page {
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

.divisions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.divisions-table thead {
  border-bottom: 2px solid #e2e8f0;
  background: #f8fafc;
}

.divisions-table th {
  padding: 0.9rem;
  text-align: left;
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.divisions-table td {
  padding: 0.9rem;
  border-bottom: 1px solid #e2e8f0;
  color: #0f172a;
}

.divisions-table tbody tr:hover {
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

  .divisions-table {
    font-size: 0.8rem;
  }

  .divisions-table th,
  .divisions-table td {
    padding: 0.6rem;
  }
}
</style>
