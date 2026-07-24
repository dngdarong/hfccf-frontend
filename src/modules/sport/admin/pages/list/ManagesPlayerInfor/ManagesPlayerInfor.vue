<script setup>
/**
 * SportAdminManagesPlayerInforPage
 * The main container for managing player information.
 * Handles data fetching, filtering, and coordination between sub-components.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import SearchFilterBar from '@/components/forms/SearchFilterBar.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { deleteSportPlayer, fetchSportPlayers } from '@/modules/sport/services/sportApi'

import PlayerStatsCards from '@/modules/sport/admin/components/player-management/PlayerStatsCards.vue'
import PlayerInfoToolbar from '@/modules/sport/admin/components/player-management/PlayerInfoToolbar.vue'
import PlayerHighlights from '@/modules/sport/admin/components/player-management/PlayerHighlights.vue'
import PlayerTable from '@/modules/sport/admin/components/player-management/PlayerTable.vue'

import {
  filterPlayers,
  getPaginatedPlayers,
  calculatePlayerMetrics,
  getHighlightItems,
  getDivisionOptions,
  getTeamOptions,
} from './utils/playerManagementHelpers'
import {
  STATUS_OPTIONS,
  STATUS_KEY_PREFIX,
  PAGE_SIZE,
} from './constants/playerManagementConstants'

defineOptions({
  name: 'SportAdminManagesPlayerInforPage',
})

const router = useRouter()
const route = useRoute()

// i18n and global state
const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')

const searchQuery = ref('')
const statusFilter = ref('')
const divisionFilter = ref('')
const teamFilter = ref('')
const currentPage = ref(1)
const pageSize = PAGE_SIZE
const statusOptions = STATUS_OPTIONS
const statusKeyPrefix = STATUS_KEY_PREFIX

const isDeleteOpen = ref(false)
const selectedPlayer = ref(null)
const isDeleting = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const showDeleteSuccess = ref(false)
const deleteSuccessMessage = ref('')
const playerRecords = ref([])

async function goToAddPlayer() {
  // Use the route name so the link survives future path refactors.
  await router.push({ name: 'dashboard-sport-admin-players-add' })
}

function onViewPlayer(player) {
  const id = String(player?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/sport-admin/players/add', query: { mode: 'view', id } })
}

function onEditPlayer(player) {
  const id = String(player?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/sport-admin/players/add', query: { mode: 'edit', id } })
}

function onDeletePlayer(player) {
  const id = String(player?.id || '').trim()
  if (!id) return

  // Confirm destructive actions before removing from the in-memory list.
  selectedPlayer.value = player
  isDeleteOpen.value = true
}

function applyDeleteFromQuery() {
  // Allow deletes initiated from the Add Player page to refresh the current list.
  const id = String(route.query.delete || '').trim()
  if (!id) return
  playerRecords.value = playerRecords.value.filter((item) => item.id !== id)
  router.replace({ query: { ...route.query, delete: undefined } })
}

function onCancelDelete() {
  isDeleteOpen.value = false
  selectedPlayer.value = null
}

function showLoadError() {
  errorMessage.value = t('sportPlayerInformation.loadFailed')
  showError.value = true
}

async function loadPlayerRecords() {
  const perPage = 100
  const firstResponse = await fetchSportPlayers({ page: 1, perPage })
  const items = [...(firstResponse.items || [])]
  const totalPages = Math.max(Number(firstResponse.pagination?.totalPages || 1), 1)

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await fetchSportPlayers({ page, perPage })
    items.push(...(response.items || []))
  }

  playerRecords.value = items
}

async function onConfirmDelete() {
  if (isDeleting.value) return
  isDeleting.value = true

  const id = String(selectedPlayer.value?.id || '').trim()
  if (!id) {
    isDeleting.value = false
    return onCancelDelete()
  }

  const name = String(selectedPlayer.value?.name || '').trim()
  try {
    await deleteSportPlayer(id)
    playerRecords.value = playerRecords.value.filter((item) => item.id !== id)
    errorMessage.value = ''
    showError.value = false

    // Feedback stays on the list page.
    deleteSuccessMessage.value = t('sportPlayerInformation.confirm.deletedMessage', {
      name: name || t('sportPlayerInformation.confirm.defaultName'),
    })
    showDeleteSuccess.value = true
  } catch {
    errorMessage.value = t('sportPlayerInformation.confirm.deleteFailed')
    showError.value = true
  }

  onCancelDelete()
  isDeleting.value = false
}

const divisionOptions = computed(() => getDivisionOptions(playerRecords.value))
const teamOptions = computed(() => getTeamOptions(playerRecords.value))

// Computed labels for i18n
const pageTitle = computed(() => t('sportPlayerInformation.title'))
const pageSubtitle = computed(() => t('sportPlayerInformation.subtitle'))
const searchPlaceholder = computed(() => t('sportPlayerInformation.searchPlaceholder'))
const tableEmptyText = computed(() => t('sportPlayerInformation.tableEmpty'))
const toolbarEyebrow = computed(() => t('sportPlayerInformation.toolbarEyebrow'))
const activeRateTitle = computed(() => t('sportPlayerInformation.activeRateLabel'))

const filteredPlayers = computed(() =>
  filterPlayers(
    playerRecords.value,
    searchQuery.value,
    statusFilter.value,
    divisionFilter.value,
    teamFilter.value,
  ),
)

const totalPages = computed(() => Math.max(Math.ceil(filteredPlayers.value.length / pageSize), 1))
const paginatedPlayers = computed(() =>
  getPaginatedPlayers(filteredPlayers.value, currentPage.value, pageSize),
)

const playerMetrics = computed(() => calculatePlayerMetrics(playerRecords.value))
const totalPlayers = computed(() => playerMetrics.value.totalPlayers)
const activePlayers = computed(() => playerMetrics.value.activePlayers)
const pendingPlayers = computed(() => playerMetrics.value.pendingPlayers)
const attentionPlayers = computed(() => playerMetrics.value.attentionPlayers)
const activeRateLabel = computed(() => playerMetrics.value.activeRate)

const toolbarSummary = computed(() =>
  t('sportPlayerInformation.toolbarSummary', { count: filteredPlayers.value.length }),
)

const visibleRangeLabel = computed(() => {
  if (!filteredPlayers.value.length) return t('sportPlayerInformation.noResults')

  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredPlayers.value.length)
  return t('sportPlayerInformation.visibleRange', {
    start,
    end,
    total: filteredPlayers.value.length,
  })
})

/**
 * Configuration for the summary cards
 */
const summaryCards = computed(() => [
  {
    id: 'total',
    title: t('sportPlayerInformation.summary.total.title'),
    value: totalPlayers.value,
    badge: t('sportPlayerInformation.summary.total.badge', { count: filteredPlayers.value.length }),
    caption: t('sportPlayerInformation.summary.total.caption'),
    tone: 'info',
    icon:
      'M12 2a5 5 0 00-5 5v1a5 5 0 0010 0V7a5 5 0 00-5-5zm0 12c-4.418 0-8 1.79-8 4v4h16v-4c0-2.21-3.582-4-8-4z',
  },
  {
    id: 'active',
    title: t('sportPlayerInformation.summary.active.title'),
    value: activePlayers.value,
    badge: t('sportPlayerInformation.summary.active.badge', { rate: activeRateLabel.value }),
    caption: t('sportPlayerInformation.summary.active.caption'),
    tone: 'success',
    icon: 'M5 13l4 4L19 7',
  },
  {
    id: 'pending',
    title: t('sportPlayerInformation.summary.pending.title'),
    value: pendingPlayers.value,
    badge: pendingPlayers.value
      ? t('sportPlayerInformation.summary.pending.badge')
      : t('sportPlayerInformation.summary.pending.badgeClear'),
    caption: t('sportPlayerInformation.summary.pending.caption'),
    tone: 'warning',
    icon:
      'M12 8v4m0 4h.01M10.3 3.86l-7.5 13a1 1 0 00.87 1.5h16.66a1 1 0 00.87-1.5l-7.5-13a1 1 0 00-1.74 0z',
  },
  {
    id: 'attention',
    title: t('sportPlayerInformation.summary.attention.title'),
    value: attentionPlayers.value,
    badge: attentionPlayers.value
      ? t('sportPlayerInformation.summary.attention.badge')
      : t('sportPlayerInformation.summary.attention.badgeClear'),
    caption: t('sportPlayerInformation.summary.attention.caption'),
    tone: 'danger',
    icon: 'M6 18L18 6M6 6l12 12',
  },
])

const highlightItems = computed(() => getHighlightItems(filteredPlayers.value, t))

// Reset pagination when filter changes
watch(
  () => filteredPlayers.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  },
)

watch(
  () => route.query.delete,
  () => {
    applyDeleteFromQuery()
  },
  { immediate: true },
)

onMounted(() => {
  void loadPlayerRecords().catch(() => {
    playerRecords.value = []
    showLoadError()
  })
})
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'player-info-page player-info-page--kh' : 'player-info-page'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <!-- Top Summary Cards -->
      <PlayerStatsCards :cards="summaryCards" />

      <div class="player-info-page__shell">
        <!-- Page Toolbar with active rate spotlight -->
        <PlayerInfoToolbar
          :eyebrow="toolbarEyebrow"
          :title="toolbarSummary"
          :text="visibleRangeLabel"
          :spotlight-label="activeRateTitle"
          :spotlight-value="activeRateLabel"
        >
          <template #actions>
            <Button
              type="button"
              :label="t('sportPlayerInformation.addButton')"
              icon="pi pi-plus"
              class="player-info-page__add-button"
              @click="goToAddPlayer"
            />
          </template>
        </PlayerInfoToolbar>

        <!-- Filter Bar -->
      <SearchFilterBar
        class="w-full"
        v-model:searchQuery="searchQuery"
        v-model:statusFilter="statusFilter"
        v-model:divisionFilter="divisionFilter"
        v-model:teamFilter="teamFilter"
        :search-placeholder="searchPlaceholder"
        :status-options="statusOptions"
        :status-key-prefix="statusKeyPrefix"
        :division-options="divisionOptions"
        :team-options="teamOptions"
        :show-role-filter="false"
        :show-division-filter="true"
        :show-team-filter="true"
      />

        <!-- Quick Stats Highlights -->
        <PlayerHighlights :items="highlightItems" />

        <!-- Main Data Table -->
        <PlayerTable
          v-model:currentPage="currentPage"
          :players="paginatedPlayers"
          :t="t"
          :empty-text="tableEmptyText"
          :total-pages="totalPages"
          :status-key-prefix="statusKeyPrefix"
          @view="onViewPlayer"
          @edit="onEditPlayer"
          @delete="onDeletePlayer"
        />
      </div>
    </section>

    <AlertQuestion
      :show="isDeleteOpen"
      :loading="isDeleting"
      :title="t('sportPlayerInformation.confirm.deleteTitle')"
      :message="t('sportPlayerInformation.confirm.deleteMessage', {
        name: String(selectedPlayer?.name || '').trim() || t('sportPlayerInformation.confirm.defaultName'),
      })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />

    <AlertSuccess
      :show="showDeleteSuccess"
      :title="t('common.success')"
      :message="deleteSuccessMessage || t('common.actionCompleted')"
      :button-text="t('common.close')"
      @close="showDeleteSuccess = false"
    />

    <AlertError
      :show="showError"
      :title="t('common.error')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="showError = false"
    />
  </MainLayout>
</template>

<style scoped>
.player-info-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.player-info-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.player-info-page__add-button {
  min-height: 2.8rem;
  border-radius: 0.9rem;
  font-weight: 800;
}

/* Khmer Support Styles */
.player-info-page--kh .player-info-page__shell {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

@media (max-width: 640px) {
  .player-info-page__shell {
    padding: 1.1rem;
  }
}
</style>

