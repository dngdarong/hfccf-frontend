<script setup>
import { useLanguage } from '@/composables/useLanguage'
import { formatDatetimeShort } from '@/utils/date'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import {
  resolveLifecycleActionLabel,
  resolveLifecycleContextLabel,
  resolveLifecycleEntityLabel,
} from '@/modules/preschool/shared/utils/lifecycleAuditLabels'

const { t, te } = useLanguage()

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyLabel: {
    type: String,
    default: '',
  },
})

function tone(source) {
  const normalized = String(source || '').toLowerCase()
  if (normalized === 'snapshot') return 'success'
  if (normalized === 'export') return 'warning'
  if (normalized === 'assignment') return 'info'
  if (normalized === 'report_period') return 'info'
  return 'primary'
}

function resolveItemAction(item = {}) {
  return resolveLifecycleActionLabel(t, item.actionType || item.title, te)
}

function resolveItemEntityContext(item = {}) {
  const entity = resolveLifecycleEntityLabel(t, item.entityType, te)
  const context = resolveLifecycleContextLabel(t, item.context, te)
  if (entity === '-' && context === '-') return '-'
  if (entity === '-') return context
  if (context === '-') return entity
  return `${entity} · ${context}`
}

/**
 * Build human-readable context tags from the item's context object.
 * Uses label fields when available, falls back to IDs only as a last resort.
 * @param {Object} ctx
 * @returns {Array<{key: string, label: string}>}
 */
function contextTags(ctx = {}) {
  if (!ctx || typeof ctx !== 'object') return []
  const tags = []
  if (ctx.academicYear || ctx.academicYearLabel)  tags.push({ key: 'ay',     label: ctx.academicYear || ctx.academicYearLabel })
  else if (ctx.academicYearId)                    tags.push({ key: 'ay',     label: `AY #${ctx.academicYearId}` })
  if (ctx.termLabel || ctx.term)                  tags.push({ key: 'term',   label: ctx.termLabel || ctx.term })
  else if (ctx.termId)                            tags.push({ key: 'term',   label: `Term #${ctx.termId}` })
  if (ctx.reportPeriodLabel || ctx.periodLabel)   tags.push({ key: 'period', label: ctx.reportPeriodLabel || ctx.periodLabel })
  else if (ctx.reportPeriodId)                    tags.push({ key: 'period', label: `Period #${ctx.reportPeriodId}` })
  if (ctx.className || ctx.classCode)             tags.push({ key: 'class',  label: ctx.className || ctx.classCode })
  else if (ctx.classId)                           tags.push({ key: 'class',  label: `Class #${ctx.classId}` })
  if (ctx.studentName || ctx.studentPublicId || ctx.studentCode) tags.push({ key: 'student', label: ctx.studentName || ctx.studentPublicId || ctx.studentCode })
  else if (ctx.studentId)                         tags.push({ key: 'student',label: `Student #${ctx.studentId}` })
  return tags
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="space-y-0.5">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</p>
    </div>

    <div v-if="loading" class="mt-4 text-sm text-slate-400">
      {{ t('preschoolInstitutionalReconstructionPage.replay.loading') }}
    </div>

    <div
      v-else-if="!items.length"
      class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400"
    >
      {{ emptyLabel }}
    </div>

    <ol v-else class="mt-4 space-y-2">
      <li
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <StatusBadge
                :status="tone(item.source)"
                :label="item.source"
                :translate-label="false"
                :dot="false"
                size="sm"
              />
              <span class="text-sm font-medium text-slate-900">{{ resolveItemAction(item) }}</span>
            </div>
            <p v-if="item.description" class="text-sm text-slate-600">{{ item.description }}</p>
            <p v-if="item.entityType || item.context" class="text-xs text-slate-400">
              {{ resolveItemEntityContext(item) }}
            </p>
          </div>

          <!-- Formatted timestamp instead of raw ISO string -->
          <div class="flex-shrink-0 text-right text-xs">
            <p class="font-medium text-slate-700">{{ formatDatetimeShort(item.recordedAt) }}</p>
            <p class="text-slate-400">{{ item.actor?.displayName || item.actor?.roleCode || '—' }}</p>
          </div>
        </div>

        <!-- Context tags: show labels not raw IDs -->
        <div v-if="contextTags(item.context).length" class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="tag in contextTags(item.context)"
            :key="tag.key"
            class="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200"
          >
            {{ tag.label }}
          </span>
        </div>
      </li>
    </ol>
  </div>
</template>
