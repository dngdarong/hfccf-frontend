<script setup>
// Keep the Preschool lifecycle audit surface isolated so admins can review
// locks, overrides, and blocked writes without mixing that history into the
// reporting or settings pages.
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import ReportSummaryCard from '@/modules/preschool/shared/components/report/ReportSummaryCard.vue'
import {
  formatAuditCodeFallback,
  resolveLifecycleActionLabel as resolveAuditActionLabel,
  resolveLifecycleEntityLabel as resolveAuditEntityLabel,
} from '@/modules/preschool/shared/utils/lifecycleAuditLabels'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolReports } from '@/modules/preschool/composables/usePreschoolReports'
import { fetchLifecycleAuditAnalytics, fetchLifecycleAuditLogs } from '@/modules/preschool/services/api/preschoolLifecycleAuditApi'
import { formatDatetimeShort } from '@/utils/date'
import { DEFAULT_PAGINATION, DEFAULT_FILTERS, DEFAULT_ANALYTICS } from './constants/lifecycleAuditConstants'
import { buildActionOptions, buildEntityOptions, buildAnalyticsCards } from './utils/lifecycleAuditHelpers'

defineOptions({
  name: 'PreschoolLifecycleAuditPage',
})

const { t, te } = useLanguage()
const { loadReportPeriodOptions, reportPeriods } = usePreschoolReports()

const loading = ref(false)
const analyticsLoading = ref(false)
const auditLogs = ref([])
const auditAnalytics = ref({ ...DEFAULT_ANALYTICS })
const pagination = ref({ ...DEFAULT_PAGINATION })
const errorMessage = ref('')
const analyticsError = ref('')
const filters = ref({ ...DEFAULT_FILTERS })

const actionOptions = computed(() => buildActionOptions(t))

const entityOptions = computed(() => buildEntityOptions(t))

const reportPeriodOptions = computed(() => [
  { label: t('preschoolLifecycleAuditPage.filters.allReportPeriods'), value: '' },
  ...reportPeriods.value.map((period) => ({
    label: period.label,
    value: String(period.id || period.label || ''),
    raw: period,
  })),
])

const analyticsCards = computed(() => buildAnalyticsCards(t, auditAnalytics.value))

async function loadAuditLogs(page = 1) {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchLifecycleAuditLogs({
      page,
      perPage: pagination.value.perPage,
      actionType: filters.value.actionType,
      entityType: filters.value.entityType,
      reportPeriodId: filters.value.reportPeriodId,
    })

    auditLogs.value = payload.items || []
    pagination.value = payload.pagination || pagination.value
  } catch (error) {
    auditLogs.value = []
    errorMessage.value = error?.message || t('preschoolLifecycleAuditPage.loadingError')
  } finally {
    loading.value = false
  }
}

async function loadAuditAnalytics() {
  analyticsLoading.value = true
  analyticsError.value = ''

  try {
    auditAnalytics.value = await fetchLifecycleAuditAnalytics({
      reportPeriodId: filters.value.reportPeriodId,
      days: 30,
    })
  } catch (error) {
    auditAnalytics.value = {
      overview: {},
      actionCounts: [],
      entityCounts: [],
      actorCounts: [],
      blockedWriteTrend: [],
      lifecycleTimeline: [],
      overrideReasons: [],
    }
    analyticsError.value = error?.message || t('preschoolLifecycleAnalyticsPage.loadingError')
  } finally {
    analyticsLoading.value = false
  }
}

function refresh() {
  return Promise.all([loadAuditLogs(1), loadAuditAnalytics()])
}

function changePage(delta) {
  const nextPage = Math.min(
    Math.max((pagination.value.page || 1) + delta, 1),
    pagination.value.totalPages || 1,
  )

  return loadAuditLogs(nextPage)
}

function tone(actionType) {
  const normalized = String(actionType || '').toLowerCase()
  if (normalized === 'override.approved') return 'success'
  if (normalized === 'override.attempt' || normalized === 'write.blocked') return 'error'
  if (normalized.startsWith('report_period.')) return 'warning'
  return 'info'
}

function formatAuditReason(reason) {
  return resolveAuditActionLabel(t, reason, te)
}

function formatEntityReference(entityId) {
  return formatAuditCodeFallback(entityId)
}

function formatActor(item) {
  const actor = item.actor || {}
  const name = `${actor.firstName || ''} ${actor.lastName || ''}`.trim()
  return name || item.actorRole || '-'
}

function formatContext(item) {
  const parts = []
  if (item.academicYearId) parts.push(`${t('preschoolLifecycleAuditPage.context.academicYear')}: ${formatEntityReference(item.academicYearId)}`)
  if (item.termId) parts.push(`${t('preschoolLifecycleAuditPage.context.term')}: ${formatEntityReference(item.termId)}`)
  if (item.reportPeriodId) parts.push(`${t('preschoolLifecycleAuditPage.context.reportPeriod')}: ${formatEntityReference(item.reportPeriodId)}`)
  return parts.length ? parts.join(' | ') : '-'
}

onMounted(async () => {
  await loadReportPeriodOptions()
  await Promise.all([loadAuditLogs(), loadAuditAnalytics()])
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolLifecycleAuditPage.title')"
        :subtitle="t('preschoolLifecycleAuditPage.subtitle')"
      />

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
              <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolLifecycleAnalyticsPage.title') }}</h3>
              <p class="text-sm text-slate-500">{{ t('preschoolLifecycleAnalyticsPage.subtitle') }}</p>
            </div>
            <Button type="button" variant="ghost" size="md" rounded="xl" :loading="analyticsLoading" @click="loadAuditAnalytics">
              {{ t('preschoolLifecycleAnalyticsPage.actions.refresh') }}
            </Button>
          </div>

          <div v-if="analyticsError" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ analyticsError }}
          </div>

          <div v-if="analyticsLoading" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            {{ t('preschoolLifecycleAnalyticsPage.loading') }}
          </div>

          <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ReportSummaryCard
              v-for="card in analyticsCards"
              :key="card.title"
              :title="card.title"
              :value="card.value"
              :caption="card.caption"
            />
          </div>

          <div v-if="!analyticsLoading" class="grid gap-4 lg:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolLifecycleAnalyticsPage.sections.overrideTrends') }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-slate-600">
                <li v-for="item in auditAnalytics.overrideReasons.slice(0, 5)" :key="item.reason" class="flex items-center justify-between gap-3">
                  <span class="truncate">{{ formatAuditReason(item.reason) }}</span>
                  <span class="font-semibold text-slate-900">{{ item.total }}</span>
                </li>
                <li v-if="!auditAnalytics.overrideReasons.length" class="text-slate-500">
                  {{ t('preschoolLifecycleAnalyticsPage.emptyOverrideReasons') }}
                </li>
              </ul>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolLifecycleAnalyticsPage.sections.blockedWrites') }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-slate-600">
                <li v-for="item in auditAnalytics.blockedWriteTrend.slice(-5)" :key="item.day" class="flex items-center justify-between gap-3">
                  <span>{{ item.day }}</span>
                  <span class="font-semibold text-slate-900">{{ item.total }}</span>
                </li>
                <li v-if="!auditAnalytics.blockedWriteTrend.length" class="text-slate-500">
                  {{ t('preschoolLifecycleAnalyticsPage.emptyBlockedWrites') }}
                </li>
              </ul>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolLifecycleAnalyticsPage.sections.lifecycleActivity') }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-slate-600">
                <li v-for="item in auditAnalytics.actionCounts.slice(0, 5)" :key="item.actionType" class="flex items-center justify-between gap-3">
                  <span class="truncate">{{ resolveAuditActionLabel(item.actionType) }}</span>
                  <span class="font-semibold text-slate-900">{{ item.total }}</span>
                </li>
                <li v-if="!auditAnalytics.actionCounts.length" class="text-slate-500">
                  {{ t('preschoolLifecycleAnalyticsPage.emptyLifecycleActivity') }}
                </li>
              </ul>
            </div>
          </div>

          <div v-if="!analyticsLoading" class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolLifecycleAnalyticsPage.sections.actorActivity') }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-slate-600">
                <li v-for="item in auditAnalytics.actorCounts.slice(0, 5)" :key="item.actorRole" class="flex items-center justify-between gap-3">
                  <span class="truncate">{{ item.actorRole || '-' }}</span>
                  <span class="font-semibold text-slate-900">{{ item.total }}</span>
                </li>
                <li v-if="!auditAnalytics.actorCounts.length" class="text-slate-500">
                  {{ t('preschoolLifecycleAnalyticsPage.emptyActorActivity') }}
                </li>
              </ul>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolLifecycleAnalyticsPage.sections.lifecycleTimeline') }}</h4>
              <ul class="mt-3 space-y-2 text-sm text-slate-600">
                <li
                  v-for="item in auditAnalytics.lifecycleTimeline.slice(-6)"
                  :key="`${item.day}-${item.actionType}`"
                  class="flex items-center justify-between gap-3"
                >
                  <span class="truncate">{{ item.day }} · {{ resolveAuditActionLabel(item.actionType) }}</span>
                  <span class="font-semibold text-slate-900">{{ item.total }}</span>
                </li>
                <li v-if="!auditAnalytics.lifecycleTimeline.length" class="text-slate-500">
                  {{ t('preschoolLifecycleAnalyticsPage.emptyLifecycleTimeline') }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-6">
        <div class="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolLifecycleAuditPage.filters.actionType') }}</span>
            <Select
              v-model="filters.actionType"
              :options="actionOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolLifecycleAuditPage.filters.entityType') }}</span>
            <Select
              v-model="filters.entityType"
              :options="entityOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>
          <label class="space-y-2 text-sm font-medium text-slate-700">
            <span>{{ t('preschoolLifecycleAuditPage.filters.reportPeriod') }}</span>
            <Select
              v-model="filters.reportPeriodId"
              :options="reportPeriodOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </label>

          <div class="flex items-end gap-2">
            <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" @click="refresh">
              {{ t('preschoolLifecycleAuditPage.actions.refresh') }}
            </Button>
          </div>
        </div>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
        {{ t('preschoolLifecycleAuditPage.loading') }}
      </div>

      <div v-else-if="!auditLogs.length" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
        {{ t('preschoolLifecycleAuditPage.empty') }}
      </div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.action') }}</th>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.entity') }}</th>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.actor') }}</th>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.context') }}</th>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.reason') }}</th>
                <th class="px-4 py-3">{{ t('preschoolLifecycleAuditPage.columns.createdAt') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="item in auditLogs" :key="item.id">
                <td class="px-4 py-3">
                  <StatusBadge :status="tone(item.actionType)" :label="resolveAuditActionLabel(item.actionType)" :translate-label="false" :dot="false" size="sm" />
                  <div class="mt-1 text-xs font-medium text-slate-900">
                    {{ resolveAuditActionLabel(item.actionType) }}
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  <div class="space-y-1">
                    <p>{{ resolveAuditEntityLabel(item.entityType) }}</p>
                    <p class="text-xs text-slate-500">{{ formatEntityReference(item.entityId) }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ formatActor(item) }}</td>
                <td class="px-4 py-3 text-slate-600">{{ formatContext(item) }}</td>
                <td class="px-4 py-3 text-slate-600">{{ formatAuditReason(item.lockReason || item.overrideReason) }}</td>
                <td class="px-4 py-3 text-slate-600">{{ formatDatetimeShort(item.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          <div class="space-y-1">
            <span class="block">
              {{ t('preschoolLifecycleAuditPage.pagination.summary', { total: pagination.total || auditLogs.length }) }}
            </span>
            <span class="block">
              {{ t('preschoolLifecycleAuditPage.pagination.page', { page: pagination.page || 1, totalPages: pagination.totalPages || 1 }) }}
            </span>
          </div>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              rounded="xl"
              :disabled="(pagination.page || 1) <= 1 || loading"
              @click="changePage(-1)"
            >
              {{ t('preschoolLifecycleAuditPage.pagination.previous') }}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              rounded="xl"
              :disabled="(pagination.page || 1) >= (pagination.totalPages || 1) || loading"
              @click="changePage(1)"
            >
              {{ t('preschoolLifecycleAuditPage.pagination.next') }}
            </Button>
          </div>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
