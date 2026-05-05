<script setup>
/**
 * SportAdminManagesPlayerInforPage
 * The main container for managing player information.
 * Handles data fetching (mock), filtering, and coordination between sub-components.
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import SearchFilterBar from '@/components/forms/SearchFilterBar.vue'
import Button from 'primevue/button'
import { useLanguage } from '@/composables/useLanguage'
import playersData from '@/mocks/sport/players-management-data.json'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'

// Sub-components
import PlayerStatsCards from '../components/player-management/PlayerStatsCards.vue'
import PlayerInfoToolbar from '../components/player-management/PlayerInfoToolbar.vue'
import PlayerHighlights from '../components/player-management/PlayerHighlights.vue'
import PlayerTable from '../components/player-management/PlayerTable.vue'

defineOptions({
  name: 'SportAdminManagesPlayerInforPage',
})

const router = useRouter()
const route = useRoute()

// i18n and global state
const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')

// Filter and Pagination state
const searchQuery = ref('')
const statusFilter = ref('')
const divisionFilter = ref('')
const teamFilter = ref('')
const currentPage = ref(1)
const pageSize = 8
const statusOptions = ['active', 'pending', 'inactive', 'suspended']
// Player status is localized from the sport module, not `common.status.*` (user/account status).
const statusKeyPrefix = 'sportPlayerInformation.status'

const isDeleteOpen = ref(false)
const selectedPlayer = ref(null)
const isDeleting = ref(false)
const showDeleteSuccess = ref(false)
const deleteSuccessMessage = ref('')

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
  // Allow deletes initiated from the Add Player page to be applied in the list without a backend yet.
  const id = String(route.query.delete || '').trim()
  if (!id) return
  playerRecords.value = playerRecords.value.filter((item) => item.id !== id)
  router.replace({ query: { ...route.query, delete: undefined } })
}

function onCancelDelete() {
  isDeleteOpen.value = false
  selectedPlayer.value = null
}

function onConfirmDelete() {
  if (isDeleting.value) return
  isDeleting.value = true

  const id = String(selectedPlayer.value?.id || '').trim()
  if (!id) {
    isDeleting.value = false
    return onCancelDelete()
  }

  const name = String(selectedPlayer.value?.name || '').trim()
  playerRecords.value = playerRecords.value.filter((item) => item.id !== id)

  // Feedback stays on the list page since there is no backend yet.
  deleteSuccessMessage.value = t('sportPlayerInformation.confirm.deletedMessage', {
    name: name || t('sportPlayerInformation.confirm.defaultName'),
  })
  showDeleteSuccess.value = true

  onCancelDelete()
  isDeleting.value = false
}

const divisionOptions = computed(() => {
  const divisions = playerRecords.value.map((p) => p.division).filter(Boolean)
  return [...new Set(divisions)].sort()
})

const teamOptions = computed(() => {
  const teams = playerRecords.value.map((p) => p.team).filter(Boolean)
  return [...new Set(teams)].sort()
})

// Computed labels for i18n
const pageTitle = computed(() => t('sportPlayerInformation.title'))
const pageSubtitle = computed(() => t('sportPlayerInformation.subtitle'))
const searchPlaceholder = computed(() => t('sportPlayerInformation.searchPlaceholder'))
const tableEmptyText = computed(() => t('sportPlayerInformation.tableEmpty'))
const toolbarEyebrow = computed(() => t('sportPlayerInformation.toolbarEyebrow'))
const activeRateTitle = computed(() => t('sportPlayerInformation.activeRateLabel'))

// Data Source - Keep as ref so it can be updated by an API later
const playerRecords = ref(Array.isArray(playersData) ? [...playersData] : [])

/**
 * Helper to normalize strings for searching and comparison
 */
function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

/**
 * Filtered players based on search query and status filter
 */
const filteredPlayers = computed(() => {
  const query = normalize(searchQuery.value)

  return playerRecords.value.filter((player) => {
    let isMatch = true

    if (query) {
      const haystack = normalize(player.name)
      isMatch = haystack.includes(query)
    }

    if (isMatch && statusFilter.value) {
      isMatch = normalize(player.status) === normalize(statusFilter.value)
    }

    if (isMatch && divisionFilter.value) {
      isMatch = normalize(player.division) === normalize(divisionFilter.value)
    }

    if (isMatch && teamFilter.value) {
      isMatch = normalize(player.team) === normalize(teamFilter.value)
    }

    return isMatch
  })
})

// Pagination logic
const totalPages = computed(() => Math.max(Math.ceil(filteredPlayers.value.length / pageSize), 1))
const paginatedPlayers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPlayers.value.slice(start, start + pageSize).map((player, index) => ({
    ...player,
    // Table identity line expects `position`; UI now uses Primary Position.
    // Keep a fallback for older mock records that still use `position`.
    position: String(player?.primaryPosition || player?.position || '').trim(),
    rowNumber: start + index + 1,
  }))
})

// Summary metrics
const totalPlayers = computed(() => playerRecords.value.length)
const activePlayers = computed(
  () => playerRecords.value.filter((player) => normalize(player.status) === 'active').length,
)
const pendingPlayers = computed(
  () => playerRecords.value.filter((player) => normalize(player.status) === 'pending').length,
)
const attentionPlayers = computed(
  () =>
    playerRecords.value.filter((player) =>
      ['inactive', 'suspended'].includes(normalize(player.status)),
    ).length,
)

// Formatting metrics
const activeRateLabel = computed(() => {
  if (!totalPlayers.value) return '0%'
  return `${Math.round((activePlayers.value / totalPlayers.value) * 100)}%`
})

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

/**
 * Configuration for the highlights section
 */
const highlightItems = computed(() => [
  {
    label: t('sportPlayerInformation.highlights.visiblePlayers'),
    value: filteredPlayers.value.length,
  },
  {
    label: t('sportPlayerInformation.highlights.divisions'),
    value: new Set(filteredPlayers.value.map((player) => player.division).filter(Boolean)).size,
  },
  {
    label: t('sportPlayerInformation.highlights.attentionItems'),
    value: filteredPlayers.value.filter((player) =>
      ['inactive', 'suspended'].includes(normalize(player.status)),
    ).length,
  },
])

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
