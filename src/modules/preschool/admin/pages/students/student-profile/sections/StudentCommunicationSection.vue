<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">
          {{ title }}
        </h2>
        <p class="mt-1 text-sm text-slate-500">
          {{ subtitle }}
        </p>
      </div>

      <AppButton
        v-if="hasHistory"
        type="button"
        variant="ghost"
        data-testid="view-full-contact-history"
        @click="openFullContactHistory"
      >
        {{ t('preschoolGuardianCommunicationPage.profile.viewFullContactHistory') }}
      </AppButton>
    </div>

    <div v-if="loading" class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
      {{ t('preschoolGuardianCommunicationPage.messages.loading') }}
    </div>

    <div v-else-if="!hasHistory" class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <p class="text-sm font-medium text-slate-700">
        {{ t('preschoolGuardianCommunicationPage.messages.noCommunicationYet') }}
      </p>
      <p class="mt-1 text-sm text-slate-500">
        {{ t('preschoolGuardianCommunicationPage.messages.noCommunicationDescription') }}
      </p>
    </div>

    <div v-else class="space-y-4">
      <div v-if="isLatestAttendanceAlert" class="flex flex-wrap items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        <AppBadge variant="danger">
          {{ latestSourceLabel }}
        </AppBadge>
        <span>{{ t('preschoolAttendanceDashboardPage.alertSummary.latestAttendanceAlert') }}</span>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {{ isLatestAttendanceAlert ? t('preschoolAttendanceDashboardPage.alertSummary.latestAttendanceAlert') : t('preschoolGuardianCommunicationPage.profile.latestContact') }}
          </p>
          <p class="mt-2 text-sm font-medium text-slate-900">
            {{ latestSummary }}
          </p>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {{ t('preschoolGuardianCommunicationPage.profile.lastContactDate') }}
          </p>
          <p class="mt-2 text-sm font-medium text-slate-900">
            {{ latestDateLabel }}
          </p>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {{ t('preschoolGuardianCommunicationPage.labels.channel') }}
          </p>
          <p class="mt-2 text-sm font-medium text-slate-900">
            {{ latestMethodLabel }}
          </p>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {{ t('preschoolGuardianCommunicationPage.labels.reason') }}
          </p>
          <p class="mt-2 text-sm font-medium text-slate-900">
            {{ latestReasonLabel }}
          </p>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {{ t('preschoolGuardianCommunicationPage.labels.outcome') }}
          </p>
          <p class="mt-2 text-sm font-medium text-slate-900">
            {{ latestOutcomeLabel }}
          </p>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {{ t('preschoolGuardianCommunicationPage.profile.followUpStatus') }}
          </p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <AppBadge :variant="latestFollowUpVariant">
              {{ latestFollowUpLabel }}
            </AppBadge>
          </div>
        </article>
      </div>

      <GuardianCommunicationTimeline
        :items="communications"
        :loading="loading"
        :title="timelineTitle"
        :subtitle="timelineSubtitle"
        :empty-title="timelineEmptyTitle"
        :empty-subtitle="timelineEmptySubtitle"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import GuardianCommunicationTimeline from '@/modules/preschool/admin/components/guardian/GuardianCommunicationTimeline.vue'
import { formatDatetime } from '@/utils/date'
import { parseGuardianContactLogMessage } from '@/modules/preschool/admin/pages/guardian/contactLogUtils'

defineOptions({
  name: 'StudentCommunicationSection',
})

const props = defineProps({
  communicationTimeline: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const communications = computed(() => Array.isArray(props.communicationTimeline?.items) ? props.communicationTimeline.items : [])
const hasHistory = computed(() => communications.value.length > 0)

const sortedCommunications = computed(() =>
  [...communications.value].sort((left, right) => {
    const leftTime = new Date(left.createdAt || left.created_at || left.updatedAt || left.updated_at || 0).getTime()
    const rightTime = new Date(right.createdAt || right.created_at || right.updatedAt || right.updated_at || 0).getTime()
    return rightTime - leftTime
  }),
)

const latestCommunication = computed(() => sortedCommunications.value[0] || null)
const latestParsed = computed(() => parseGuardianContactLogMessage(latestCommunication.value?.message))
const isLatestAttendanceAlert = computed(() => (
  String(latestCommunication.value?.sourceType || '').toLowerCase() === 'attendance'
  && String(latestCommunication.value?.communicationType || '').toLowerCase() === 'repeated_absence'
))

const latestSummary = computed(() => {
  const parsed = latestParsed.value
  return parsed?.summary?.trim() || latestCommunication.value?.message || t('common.unknown')
})

const latestDateLabel = computed(() => formatDatetime(latestCommunication.value?.createdAt || latestCommunication.value?.created_at || latestCommunication.value?.updatedAt || latestCommunication.value?.updated_at))

const latestMethodLabel = computed(() => parsedValue('method', 'channel'))
const latestReasonLabel = computed(() => parsedValue('reason', 'subject'))
const latestOutcomeLabel = computed(() => parsedValue('outcome'))

const latestFollowUpLabel = computed(() => {
  const parsed = latestParsed.value
  const status = String(latestCommunication.value?.status || '').toLowerCase()
  const followUpRequired = Boolean(parsed?.followUpRequired || latestCommunication.value?.followUpRequired)
  const followUpDate = parsed?.followUpDate || latestCommunication.value?.followUpDate

  if (['sent', 'acknowledged', 'resolved', 'closed', 'cancelled', 'done'].includes(status)) {
    return t('preschoolGuardianCommunicationPage.followUpStatuses.completed')
  }

  if (!followUpRequired) {
    return t('preschoolGuardianCommunicationPage.followUpStatuses.notRequired')
  }

  if (!followUpDate) {
    return t('preschoolGuardianCommunicationPage.followUpStatuses.required')
  }

  const date = new Date(followUpDate)
  if (!Number.isNaN(date.getTime())) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      return t('preschoolGuardianCommunicationPage.followUpStatuses.today')
    }

    if (date < today) {
      return t('preschoolGuardianCommunicationPage.followUpStatuses.overdue')
    }
  }

  return t('preschoolGuardianCommunicationPage.followUpStatuses.upcoming')
})

const latestFollowUpVariant = computed(() => {
  const label = latestFollowUpLabel.value

  if (label === t('preschoolGuardianCommunicationPage.followUpStatuses.completed')) return 'success'
  if (label === t('preschoolGuardianCommunicationPage.followUpStatuses.overdue')) return 'danger'
  if (label === t('preschoolGuardianCommunicationPage.followUpStatuses.today')) return 'warning'
  if (label === t('preschoolGuardianCommunicationPage.followUpStatuses.upcoming')) return 'info'
  return 'neutral'
})

const latestSourceLabel = computed(() => {
  if (!isLatestAttendanceAlert.value) return ''

  return `${t('preschoolAttendanceAlertsPage.labels.attendanceAlerts')} · ${t('preschoolAttendanceAlertsPage.labels.repeatedAbsence')}`
})

const title = computed(() => t('preschoolGuardianCommunicationPage.profile.contactHistory'))
const subtitle = computed(() => t('preschoolGuardianCommunicationPage.profile.recentContacts'))
const timelineTitle = computed(() => t('preschoolGuardianCommunicationPage.timelineTitle'))
const timelineSubtitle = computed(() => t('preschoolGuardianCommunicationPage.timelineSubtitle'))
const timelineEmptyTitle = computed(() => t('preschoolGuardianCommunicationPage.messages.noCommunicationYet'))
const timelineEmptySubtitle = computed(() => t('preschoolGuardianCommunicationPage.messages.noCommunicationDescription'))

function parsedValue(field, fallbackKey) {
  const parsed = latestParsed.value || {}
  const rawValue = parsed[field] || latestCommunication.value?.[fallbackKey] || latestCommunication.value?.[field]
  return String(rawValue || t('common.unknown'))
}

function openFullContactHistory() {
  const studentId = String(route.params.id || '').trim()
  if (!studentId) return

  router.push({
    name: 'dashboard-preschool-admin-guardian-communications',
    query: { studentId },
  })
}
</script>
