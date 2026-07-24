<template>
  <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header class="border-b border-slate-200 px-5 py-4 sm:px-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold text-slate-900">
          {{ resolvedTitle }}
        </h2>
        <p v-if="resolvedSubtitle" class="text-sm text-slate-500">
          {{ resolvedSubtitle }}
        </p>
      </div>
    </header>

    <div class="p-5 sm:p-6">
      <div v-if="loading" class="space-y-3">
        <div v-for="index in 3" :key="index" class="animate-pulse rounded-xl border border-slate-200 p-4">
          <div class="mb-3 h-4 w-1/4 rounded bg-slate-100"></div>
          <div class="space-y-2">
            <div class="h-3 w-full rounded bg-slate-100"></div>
            <div class="h-3 w-5/6 rounded bg-slate-100"></div>
            <div class="h-3 w-2/3 rounded bg-slate-100"></div>
          </div>
        </div>
      </div>

      <div v-else-if="!groupedItems.length" class="rounded-xl border border-dashed border-slate-200 p-8 text-center">
        <p class="text-sm font-medium text-slate-700">
          {{ resolvedEmptyTitle }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          {{ resolvedEmptySubtitle }}
        </p>
      </div>

      <div v-else class="space-y-5">
        <section
          v-for="group in groupedItems"
          :key="group.key"
          data-testid="guardian-contact-group"
          class="space-y-3"
        >
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              {{ group.label }}
            </h3>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {{ group.items.length }}
            </span>
          </div>

          <div class="space-y-4 border-l border-slate-200 pl-4 sm:pl-5">
            <article
              v-for="item in group.items"
              :key="item.id"
              data-testid="guardian-contact-record"
              class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-slate-300"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="min-w-0 flex-1 space-y-4">
                  <div class="flex flex-wrap items-center gap-2">
                    <AppBadge :variant="resolveStatusVariant(item.status)">
                      {{ item.statusLabel }}
                    </AppBadge>
                    <AppBadge variant="info">
                      {{ item.methodLabel }}
                    </AppBadge>
                    <AppBadge
                      v-if="item.followUpStatusLabel"
                      :variant="item.followUpStatusVariant"
                    >
                      {{ item.followUpStatusLabel }}
                    </AppBadge>
                    <AppBadge
                      v-if="item.outcomeLabel"
                      variant="success"
                    >
                      {{ item.outcomeLabel }}
                    </AppBadge>
                  </div>

                  <div class="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {{ t('preschoolGuardianCommunicationPage.labels.dateTime') }}
                      </p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ item.dateTimeLabel }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {{ t('preschoolGuardianCommunicationPage.labels.student') }}
                      </p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ item.studentLabel }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {{ t('preschoolGuardianCommunicationPage.labels.guardian') }}
                      </p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ item.guardianLabel }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {{ t('preschoolGuardianCommunicationPage.labels.reason') }}
                      </p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ item.reasonLabel }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {{ t('preschoolGuardianCommunicationPage.labels.staffMember') }}
                      </p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ item.staffLabel }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {{ t('preschoolGuardianCommunicationPage.labels.sourceEvent') }}
                      </p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ item.sourceEventLabel }}
                      </p>
                    </div>
                  </div>

                  <div class="rounded-2xl border border-slate-200 bg-white p-4">
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {{ t('preschoolGuardianCommunicationPage.labels.summary') }}
                    </p>
                    <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {{ item.summaryLabel }}
                    </p>
                  </div>

                  <div class="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {{ t('preschoolGuardianCommunicationPage.labels.outcome') }}
                      </p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ item.outcomeLabel }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {{ t('preschoolGuardianCommunicationPage.labels.followUpDate') }}
                      </p>
                      <p class="mt-1 font-medium text-slate-900">
                        {{ item.followUpDateLabel }}
                      </p>
                    </div>
                  </div>
                </div>

                <div v-if="showActions" class="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
                  <AppButton
                    size="sm"
                    variant="secondary"
                    @click="$emit('sent', item.raw)"
                  >
                    {{ t('preschoolGuardianCommunicationPage.actions.markCompleted') }}
                  </AppButton>
                  <AppButton
                    size="sm"
                    variant="secondary"
                    @click="$emit('acknowledged', item.raw)"
                  >
                    {{ t('preschoolGuardianCommunicationPage.actions.markFollowedUp') }}
                  </AppButton>
                  <AppButton
                    size="sm"
                    variant="ghost"
                    @click="$emit('cancelled', item.raw)"
                  >
                    {{ t('preschoolGuardianCommunicationPage.actions.closeLog') }}
                  </AppButton>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { formatDate, formatDatetime } from '@/utils/date'

import {
  isToday,
  parseGuardianContactLogMessage,
  toDisplayValue
} from '@/modules/preschool/admin/pages/guardian/contactLogUtils'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  emptyTitle: {
    type: String,
    default: ''
  },
  emptySubtitle: {
    type: String,
    default: ''
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

defineEmits(['sent', 'acknowledged', 'cancelled'])

const { t } = useI18n()

const resolvedTitle = computed(() => props.title || t('preschoolGuardianCommunicationPage.timelineTitle'))
const resolvedSubtitle = computed(() => props.subtitle || t('preschoolGuardianCommunicationPage.timelineSubtitle'))
const resolvedEmptyTitle = computed(() => props.emptyTitle || t('preschoolGuardianCommunicationPage.messages.noCommunicationYet'))
const resolvedEmptySubtitle = computed(() => props.emptySubtitle || t('preschoolGuardianCommunicationPage.messages.noCommunicationDescription'))

function resolveLabel(value, fallback = '—') {
  return toDisplayValue(value) === '—' ? fallback : toDisplayValue(value)
}

function resolveStatusLabel(item) {
  const status = String(item.status || '').toLowerCase()

  if (status === 'queued') return t('preschoolGuardianCommunicationPage.status.queued')
  if (status === 'sent') return t('preschoolGuardianCommunicationPage.status.sent')
  if (status === 'acknowledged') return t('preschoolGuardianCommunicationPage.status.acknowledged')
  if (status === 'failed') return t('preschoolGuardianCommunicationPage.status.failed')
  if (status === 'cancelled') return t('preschoolGuardianCommunicationPage.status.cancelled')

  return t('common.unknown')
}

function resolveStatusVariant(status) {
  const normalized = String(status || '').toLowerCase()

  if (['sent', 'acknowledged', 'resolved', 'closed', 'done'].includes(normalized)) {
    return 'success'
  }

  if (normalized === 'failed') {
    return 'danger'
  }

  if (normalized === 'cancelled') {
    return 'neutral'
  }

  if (normalized === 'queued' || normalized === 'draft') {
    return 'warning'
  }

  return 'neutral'
}

function resolveMethodLabel(item, parsed) {
  return resolveLabel(parsed?.method || item.channel || item.sourceType)
}

function resolveReasonLabel(item, parsed) {
  return resolveLabel(parsed?.reason || item.subject)
}

function resolveSummaryLabel(item, parsed) {
  return resolveLabel(parsed?.summary || item.message)
}

function resolveOutcomeLabel(item, parsed) {
  return resolveLabel(parsed?.outcome)
}

function resolveFollowUpDateLabel(item, parsed) {
  const value = parsed?.followUpDate || item.followUpDate

  if (!value) {
    return '—'
  }

  const formatted = formatDatetime(value)
  return formatted || toDisplayValue(value)
}

function resolveFollowUpBadge(item, parsed) {
  if (!parsed?.followUpRequired && !item.followUpRequired) {
    return ''
  }

  if (parsed?.followUpDate && isToday(parsed.followUpDate)) {
    return t('preschoolGuardianCommunicationPage.followUpStatuses.today')
  }

  return t('preschoolGuardianCommunicationPage.followUpStatuses.required')
}

function resolveFollowUpStatus(item, parsed) {
  const status = String(item.status || '').toLowerCase()
  const followUpRequired = Boolean(parsed?.followUpRequired || item.followUpRequired)
  const followUpDate = parsed?.followUpDate || item.followUpDate

  if (['sent', 'acknowledged', 'resolved', 'closed', 'cancelled', 'done'].includes(status)) {
    return {
      label: t('preschoolGuardianCommunicationPage.followUpStatuses.completed'),
      variant: 'success'
    }
  }

  if (!followUpRequired) {
    return {
      label: '',
      variant: 'neutral'
    }
  }

  if (followUpDate && isToday(followUpDate)) {
    return {
      label: t('preschoolGuardianCommunicationPage.followUpStatuses.today'),
      variant: 'warning'
    }
  }

  if (followUpDate && new Date(followUpDate).getTime() < new Date(new Date().setHours(0, 0, 0, 0)).getTime()) {
    return {
      label: t('preschoolGuardianCommunicationPage.followUpStatuses.overdue'),
      variant: 'danger'
    }
  }

  if (followUpDate) {
    return {
      label: t('preschoolGuardianCommunicationPage.followUpStatuses.upcoming'),
      variant: 'info'
    }
  }

  return {
    label: t('preschoolGuardianCommunicationPage.followUpStatuses.required'),
    variant: 'warning'
  }
}

function resolveStudentLabel(item, parsed) {
  return resolveLabel(parsed?.student || item.studentName || item.student?.fullName || item.student?.name || item.student?.code)
}

function resolveGuardianLabel(item, parsed) {
  return resolveLabel(parsed?.guardian || item.guardianName || item.guardian?.fullName || item.guardian?.name || item.guardian?.code)
}

function resolveStaffLabel(item, parsed) {
  return resolveLabel(parsed?.staff || item.staffName || item.createdByName || item.createdBy?.fullName || item.createdBy?.name)
}

function resolveSourceEventLabel(item, parsed) {
  if (item.sourceType === 'attendance' && item.communicationType === 'repeated_absence') {
    return `${t('preschoolGuardianCommunicationPage.sources.attendance')} · ${t('preschoolGuardianCommunicationPage.sources.repeatedAbsence')}`
  }

  return resolveLabel(parsed?.sourceEvent || item.relatedEvent?.name || item.sourceEvent || item.sourceType)
}

const normalizedItems = computed(() =>
  [...props.items]
    .map(item => {
      const parsed = parseGuardianContactLogMessage(item.message)
      const createdAt = item.createdAt || item.created_at || item.updatedAt || item.updated_at
      const followUpStatus = resolveFollowUpStatus(item, parsed)

      return {
        raw: item,
        id: item.id || createdAt || Math.random().toString(36).slice(2),
        parsed,
        dateKey: createdAt ? new Date(createdAt).toISOString().slice(0, 10) : 'unknown',
        dateTimeLabel: createdAt ? formatDatetime(createdAt) : '—',
        dateLabel: createdAt ? formatDate(createdAt) : '—',
        studentLabel: resolveStudentLabel(item, parsed),
        guardianLabel: resolveGuardianLabel(item, parsed),
        methodLabel: resolveMethodLabel(item, parsed),
        reasonLabel: resolveReasonLabel(item, parsed),
        summaryLabel: resolveSummaryLabel(item, parsed),
        outcomeLabel: resolveOutcomeLabel(item, parsed),
        followUpDateLabel: resolveFollowUpDateLabel(item, parsed),
        followUpBadge: resolveFollowUpBadge(item, parsed),
        followUpStatusLabel: followUpStatus.label,
        followUpStatusVariant: followUpStatus.variant,
        staffLabel: resolveStaffLabel(item, parsed),
        sourceEventLabel: resolveSourceEventLabel(item, parsed),
        statusLabel: resolveStatusLabel(item)
      }
    })
    .sort((left, right) => {
      const leftTime = new Date(left.raw.createdAt || left.raw.created_at || left.raw.updatedAt || left.raw.updated_at || 0).getTime()
      const rightTime = new Date(right.raw.createdAt || right.raw.created_at || right.raw.updatedAt || right.raw.updated_at || 0).getTime()
      return rightTime - leftTime
    })
)

const groupedItems = computed(() => {
  const groups = []

  normalizedItems.value.forEach((item) => {
    const group = groups.find(entry => entry.key === item.dateKey)

    if (group) {
      group.items.push(item)
      return
    }

    groups.push({
      key: item.dateKey,
      label: item.dateLabel,
      items: [item]
    })
  })

  return groups
})
</script>
