<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import ActionsButton from '@/components/buttons/ActionsButton.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import SearchFilterBar from '@/components/forms/SearchFilterBar.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import teamsManagementData from '@/mocks/sport/teams-management-data.json'

defineOptions({
  name: 'SportTeamsManagementPage',
})

const router = useRouter()
const { t, language } = useLanguage()
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)

const pageSize = 8
const isKh = computed(() => language.value === 'KH')
const statusOptions = ['active', 'pending', 'inactive']

const pageTitle = computed(() => t('sportTeamsManagement.title'))
const pageSubtitle = computed(() => t('sportTeamsManagement.subtitle'))
const addTeamLabel = computed(() => t('sportTeamsManagement.addButton'))
const searchPlaceholder = computed(() => t('sportTeamsManagement.searchPlaceholder'))
const tableEmptyText = computed(() => t('sportTeamsManagement.tableEmpty'))
const toolbarEyebrow = computed(() => t('sportTeamsManagement.toolbarEyebrow'))
const spotlightLabel = computed(() => t('sportTeamsManagement.spotlightLabel'))

const teams = ref(Array.isArray(teamsManagementData) ? [...teamsManagementData] : [])

async function goToAddTeam() {
  await router.push({ name: 'dashboard-sport-admin-teams-add' })
}

function onViewTeam(team) {
  const id = String(team?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/sport-admin/teams/add', query: { mode: 'view', id } })
}

function onEditTeam(team) {
  const id = String(team?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/sport-admin/teams/add', query: { mode: 'edit', id } })
}

function onDeleteTeam(team) {
  const id = String(team?.id || '').trim()
  if (!id) return
  teams.value = teams.value.filter((item) => item.id !== id)
}

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function statusType(status) {
  const value = normalize(status)
  if (value === 'active') return 'success'
  if (value === 'pending') return 'pending'
  if (value === 'inactive') return 'warning'
  return 'info'
}

function teamInitials(name) {
  return (
    String(name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  )
}

function teamLogoSrc(team) {
  return String(team?.logo || team?.logoUrl || team?.image || '').trim()
}

const filteredTeams = computed(() => {
  const query = normalize(searchQuery.value)

  return teams.value.filter((team) => {
    let isMatch = true

    if (query) {
      const haystack = normalize(
        `${team.name} ${team.division} ${team.coach} ${team.captain} ${team.venue}`,
      )
      isMatch = haystack.includes(query)
    }

    if (isMatch && statusFilter.value) {
      isMatch = normalize(team.status) === normalize(statusFilter.value)
    }

    return isMatch
  })
})

const totalPages = computed(() => Math.max(Math.ceil(filteredTeams.value.length / pageSize), 1))
const paginatedTeams = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTeams.value.slice(start, start + pageSize).map((team, index) => ({
    ...team,
    rowNumber: start + index + 1,
  }))
})

const totalTeams = computed(() => teams.value.length)
const activeTeams = computed(
  () => teams.value.filter((team) => normalize(team.status) === 'active').length,
)
const pendingTeams = computed(
  () => teams.value.filter((team) => normalize(team.status) === 'pending').length,
)
const totalPlayers = computed(() =>
  teams.value.reduce((sum, team) => sum + Number(team.players || 0), 0),
)
const activeRateLabel = computed(() => {
  if (!totalTeams.value) return '0%'
  return `${Math.round((activeTeams.value / totalTeams.value) * 100)}%`
})
const toolbarSummary = computed(() =>
  t('sportTeamsManagement.toolbarSummary', { count: filteredTeams.value.length }),
)
const visibleRangeLabel = computed(() => {
  if (!filteredTeams.value.length) return t('sportTeamsManagement.noResults')

  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredTeams.value.length)
  return t('sportTeamsManagement.visibleRange', {
    start,
    end,
    total: filteredTeams.value.length,
  })
})

const summaryCards = computed(() => [
  {
    id: 'teams',
    title: t('sportTeamsManagement.summary.total.title'),
    value: totalTeams.value,
    badge: t('sportTeamsManagement.summary.total.badge', { count: filteredTeams.value.length }),
    caption: t('sportTeamsManagement.summary.total.caption'),
    tone: 'info',
    icon:
      'M17 20h5V4H2v16h5m10 0v-2.5A2.5 2.5 0 0014.5 15h-5A2.5 2.5 0 007 17.5V20m7-10a3 3 0 11-6 0 3 3 0 016 0zm7-2a2 2 0 11-4 0 2 2 0 014 0zM3 8a2 2 0 114 0 2 2 0 01-4 0z',
  },
  {
    id: 'active',
    title: t('sportTeamsManagement.summary.active.title'),
    value: activeTeams.value,
    badge: t('sportTeamsManagement.summary.active.badge', { rate: activeRateLabel.value }),
    caption: t('sportTeamsManagement.summary.active.caption'),
    tone: 'success',
    icon: 'M5 13l4 4L19 7',
  },
  {
    id: 'pending',
    title: t('sportTeamsManagement.summary.pending.title'),
    value: pendingTeams.value,
    badge: pendingTeams.value
      ? t('sportTeamsManagement.summary.pending.badge')
      : t('sportTeamsManagement.summary.pending.badgeClear'),
    caption: t('sportTeamsManagement.summary.pending.caption'),
    tone: 'warning',
    icon:
      'M12 8v4m0 4h.01M10.3 3.86l-7.5 13a1 1 0 00.87 1.5h16.66a1 1 0 00.87-1.5l-7.5-13a1 1 0 00-1.74 0z',
  },
  {
    id: 'players',
    title: t('sportTeamsManagement.summary.players.title'),
    value: totalPlayers.value,
    badge: t('sportTeamsManagement.summary.players.badge'),
    caption: t('sportTeamsManagement.summary.players.caption'),
    tone: 'danger',
    icon:
      'M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z',
  },
])

const highlightItems = computed(() => {
  const visiblePlayers = filteredTeams.value.reduce((sum, team) => sum + Number(team.players || 0), 0)
  const visibleMatches = filteredTeams.value.reduce((sum, team) => sum + Number(team.matches || 0), 0)
  const topPoints = filteredTeams.value.reduce(
    (max, team) => Math.max(max, Number(team.points || 0)),
    0,
  )

  return [
    {
      label: t('sportTeamsManagement.highlights.visibleTeams'),
      value: filteredTeams.value.length,
    },
    {
      label: t('sportTeamsManagement.highlights.visiblePlayers'),
      value: visiblePlayers,
    },
    {
      label: t('sportTeamsManagement.highlights.visibleMatches'),
      value: visibleMatches,
    },
    {
      label: t('sportTeamsManagement.highlights.topPoints'),
      value: topPoints,
    },
  ]
})

const tablePt = computed(() => ({
  root: {
    class: '!overflow-hidden !rounded-2xl !border !border-surface-200 !bg-white',
  },
  tableContainer: {
    class: '!bg-white',
  },
  table: {
    class: '!bg-white',
  },
  headerRow: {
    class: '!bg-slate-50',
  },
  headerCell: {
    class:
      '!border-b !border-surface-200 !bg-slate-50 !px-4 !py-3.5 !text-[0.75rem] !font-bold !tracking-[0.06em] !text-surface-600 uppercase md:!px-4',
  },
  bodyRow: {
    class: 'odd:!bg-white even:!bg-sky-50/30 hover:!bg-brand-50/60 transition-colors',
  },
  bodyCell: {
    class: '!border-b !border-slate-100 !bg-transparent !px-4 !py-3.5 !text-surface-700 md:!px-4',
  },
  emptyMessage: {
    class: '!bg-white',
  },
}))

watch(
  () => filteredTeams.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  },
)
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'teams-management-page teams-management-page--kh' : 'teams-management-page'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div class="teams-management-page__summary-grid">
        <article
          v-for="card in summaryCards"
          :key="card.id"
          class="teams-management-page__summary-card"
          :class="`teams-management-page__summary-card--${card.tone}`"
        >
          <div class="teams-management-page__summary-header">
            <div>
              <p class="teams-management-page__summary-title">{{ card.title }}</p>
              <p class="teams-management-page__summary-value">{{ card.value }}</p>
            </div>

            <span class="teams-management-page__summary-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path :d="card.icon" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>

          <p class="teams-management-page__summary-badge">{{ card.badge }}</p>
          <p class="teams-management-page__summary-caption">{{ card.caption }}</p>
        </article>
      </div>

      <div class="teams-management-page__shell">
        <div class="teams-management-page__toolbar">
          <div class="teams-management-page__toolbar-copy">
            <p class="teams-management-page__eyebrow">{{ toolbarEyebrow }}</p>
            <h2 class="teams-management-page__toolbar-title">{{ toolbarSummary }}</h2>
            <p class="teams-management-page__toolbar-text">{{ visibleRangeLabel }}</p>
          </div>

          <div class="teams-management-page__toolbar-actions">
            <div class="teams-management-page__spotlight">
              <span class="teams-management-page__spotlight-label">{{ spotlightLabel }}</span>
              <strong class="teams-management-page__spotlight-value">{{ activeTeams }}</strong>
            </div>

            <Button
              type="button"
              :label="addTeamLabel"
              icon="pi pi-plus"
              class="teams-management-page__add-button"
              @click="goToAddTeam"
            />
          </div>
        </div>

        <SearchFilterBar
          class="w-full"
          v-model:searchQuery="searchQuery"
          v-model:statusFilter="statusFilter"
          :search-placeholder="searchPlaceholder"
          :status-options="statusOptions"
          :show-role-filter="false"
        />

        <div class="teams-management-page__highlights">
          <div v-for="item in highlightItems" :key="item.label" class="teams-management-page__highlight">
            <span class="teams-management-page__highlight-label">{{ item.label }}</span>
            <strong class="teams-management-page__highlight-value">{{ item.value }}</strong>
          </div>
        </div>

        <DataTable
          :value="paginatedTeams"
          data-key="id"
          striped-rows
          removable-sort
          class="teams-management-page__table"
          :pt="tablePt"
        >
          <template #empty>
            <div class="px-4 py-7 text-center text-sm text-surface-500">
              {{ tableEmptyText }}
            </div>
          </template>

          <Column field="rowNumber" :header="t('common.table.number')">
            <template #body="{ data }">
              <span class="text-[12px] font-semibold text-surface-700 sm:text-sm">
                {{ data.rowNumber }}
              </span>
            </template>
          </Column>

          <Column field="name" :header="t('sportTeamsManagement.table.team')">
            <template #body="{ data }">
              <div class="flex items-center gap-3">
                <Avatar
                  :image="teamLogoSrc(data) || undefined"
                  :label="teamLogoSrc(data) ? undefined : teamInitials(data.name)"
                  shape="circle"
                  class="teams-management-page__avatar"
                />
                <div>
                  <div class="text-[13px] font-semibold leading-5 text-surface-900 sm:text-sm">
                    {{ data.name }}
                  </div>
                  <div class="text-[11px] text-surface-500 sm:text-xs">
                    {{ t('sportTeamsManagement.table.captainPrefix', { captain: data.captain }) }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="division" :header="t('sportTeamsManagement.table.division')">
            <template #body="{ data }">
              <span class="teams-management-page__division-chip">{{ data.division }}</span>
            </template>
          </Column>

          <Column field="coach" :header="t('sportTeamsManagement.table.coach')" />

          <Column field="players" :header="t('sportTeamsManagement.table.players')">
            <template #body="{ data }">
              <span class="font-semibold text-slate-700">{{ data.players }}</span>
            </template>
          </Column>

          <Column field="matches" :header="t('sportTeamsManagement.table.matches')">
            <template #body="{ data }">
              <span class="font-semibold text-slate-700">{{ data.matches || 0 }}</span>
            </template>
          </Column>

          <Column field="record" :header="t('sportTeamsManagement.table.record')">
            <template #body="{ data }">
              <div class="flex flex-col gap-1">
                <span class="font-semibold text-slate-800">
                  {{ data.wins }}-{{ data.draws }}-{{ data.losses }}
                </span>
                <span class="text-[11px] text-surface-500">
                  {{ t('sportTeamsManagement.table.pointsPrefix', { points: data.points }) }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="venue" :header="t('sportTeamsManagement.table.venue')" />

          <Column field="status" :header="t('common.table.status')">
            <template #body="{ data }">
              <StatusBadge :status="statusType(data.status)" :label="data.status" size="sm" />
            </template>
          </Column>

          <Column field="actions" :header="t('common.table.actions')" header-class="text-right">
            <template #body="{ data }">
              <ActionsButton
                :item="data"
                @view="onViewTeam"
                @edit="onEditTeam"
                @delete="onDeleteTeam"
              />
            </template>
          </Column>
        </DataTable>

        <div v-if="totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="totalPages" class="mt-2" />
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.teams-management-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.teams-management-page__summary-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.teams-management-page__summary-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
  padding: 1.35rem;
  border-radius: 1.35rem;
  border: 1px solid #dbe6f4;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.92), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 252, 0.98) 100%);
  box-shadow: 0 24px 48px -38px rgba(15, 23, 42, 0.45);
}

.teams-management-page__summary-card::after {
  content: '';
  position: absolute;
  inset: auto 1.35rem 0.9rem 1.35rem;
  height: 0.25rem;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.16;
}

.teams-management-page__summary-card--info {
  color: #0f6f8f;
}

.teams-management-page__summary-card--success {
  color: #2f7a42;
}

.teams-management-page__summary-card--warning {
  color: #9a5d09;
}

.teams-management-page__summary-card--danger {
  color: #b42318;
}

.teams-management-page__summary-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.teams-management-page__summary-title {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.teams-management-page__summary-value {
  margin: 0.65rem 0 0;
  color: #0f172a;
  font-size: 2rem;
  line-height: 1;
  font-weight: 800;
}

.teams-management-page__summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.95rem;
  background: color-mix(in srgb, currentColor 12%, white);
  border: 1px solid color-mix(in srgb, currentColor 18%, white);
}

.teams-management-page__summary-icon svg {
  width: 1.15rem;
  height: 1.15rem;
}

.teams-management-page__summary-badge {
  margin: 0;
  display: inline-flex;
  align-self: flex-start;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 10%, white);
  color: color-mix(in srgb, currentColor 85%, black 10%);
  font-size: 0.78rem;
  font-weight: 700;
}

.teams-management-page__summary-caption {
  margin: 0;
  color: #475569;
  font-size: 0.88rem;
  line-height: 1.55;
}

.teams-management-page__shell {
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

.teams-management-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.teams-management-page__toolbar-copy {
  min-width: 0;
}

.teams-management-page__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.teams-management-page__toolbar-title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.4rem;
  line-height: 1.2;
  font-weight: 800;
}

.teams-management-page__toolbar-text {
  margin: 0.45rem 0 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.teams-management-page__spotlight {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(14, 116, 144, 0.16);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(255, 255, 255, 0.94) 100%);
}

.teams-management-page__toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.teams-management-page__add-button {
  min-height: 2.8rem;
  border-radius: 0.9rem;
  font-weight: 800;
}

.teams-management-page__spotlight-label {
  color: #0f6f8f;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.teams-management-page__spotlight-value {
  color: #0f172a;
  font-size: 1.3rem;
  line-height: 1;
  font-weight: 800;
}

.teams-management-page__highlights {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.teams-management-page__highlight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.82);
}

.teams-management-page__highlight-label {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
}

.teams-management-page__highlight-value {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 800;
}

.teams-management-page__avatar.p-avatar {
  width: 2.75rem;
  height: 2.75rem;
  box-shadow: 0 10px 18px -14px rgba(0, 174, 239, 0.55);
}

.teams-management-page__avatar.p-avatar:not(.p-avatar-image) {
  background: linear-gradient(135deg, var(--brand-primary-500) 0%, var(--brand-primary-700) 100%);
  color: #fff;
}

.teams-management-page__avatar :deep(img) {
  object-fit: cover;
}

.teams-management-page__division-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.32rem 0.7rem;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 0.74rem;
  font-weight: 700;
}

.teams-management-page--kh .teams-management-page__summary-title,
.teams-management-page--kh .teams-management-page__summary-badge,
.teams-management-page--kh .teams-management-page__eyebrow,
.teams-management-page--kh .teams-management-page__spotlight-label,
.teams-management-page--kh .teams-management-page__highlight-label,
.teams-management-page--kh .teams-management-page__toolbar-text,
.teams-management-page--kh .teams-management-page__summary-caption,
.teams-management-page--kh .teams-management-page__division-chip {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.teams-management-page--kh .teams-management-page__summary-title,
.teams-management-page--kh .teams-management-page__eyebrow,
.teams-management-page--kh .teams-management-page__spotlight-label {
  text-transform: none;
  letter-spacing: 0.01em;
}

.teams-management-page--kh .teams-management-page__summary-caption,
.teams-management-page--kh .teams-management-page__toolbar-text,
.teams-management-page--kh .teams-management-page__highlight-label,
.teams-management-page--kh :deep(.actions-button-menu.p-menu),
.teams-management-page--kh :deep(.actions-button-menu .p-menu-item-link),
.teams-management-page--kh :deep(.actions-button-menu .p-menu-item-icon) {
  font-size: 0.92rem;
  line-height: 1.65;
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

@media (max-width: 640px) {
  .teams-management-page__summary-card,
  .teams-management-page__shell {
    padding: 1.1rem;
  }

  .teams-management-page__toolbar-title {
    font-size: 1.2rem;
  }
}
</style>
