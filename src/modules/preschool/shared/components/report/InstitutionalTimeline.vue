<script setup>
// Keep the institutional timeline read-only so export history and lifecycle
// events can be reviewed without creating another mutation surface.
import { useLanguage } from '@/composables/useLanguage'
import {
  resolveLifecycleActionLabel,
  resolveLifecycleContextLabel,
  splitLifecycleEntityContext,
} from '@/modules/preschool/shared/utils/lifecycleAuditLabels'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const { t, te } = useLanguage()

function timelineLabel(item) {
  return resolveLifecycleActionLabel(t, item.eventType || item.title, te)
}

function contextLabel(value) {
  const { context, entity } = splitLifecycleEntityContext(value)
  return resolveLifecycleContextLabel(t, context || entity, te)
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolExportGovernancePage.timeline.title') }}</h3>
        <p class="text-sm text-slate-500">{{ t('preschoolExportGovernancePage.timeline.subtitle') }}</p>
      </div>
    </div>

    <div v-if="loading" class="mt-4 text-sm text-slate-500">
      {{ t('preschoolExportGovernancePage.loading') }}
    </div>

    <div v-else-if="!items.length" class="mt-4 text-sm text-slate-500">
      {{ t('preschoolExportGovernancePage.timeline.empty') }}
    </div>

    <div v-else class="mt-4 space-y-3">
      <div v-for="item in items" :key="item.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p class="text-sm font-medium text-slate-900">{{ timelineLabel(item) }}</p>
            <p class="text-xs text-slate-500">{{ item.description || '-' }}</p>
          </div>
          <p class="text-xs text-slate-500">{{ item.recordedAt || '-' }}</p>
        </div>
        <div class="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
          <span>{{ item.actor?.displayName || item.actor?.roleCode || '-' }}</span>
          <span>{{ t('preschoolExportGovernancePage.timeline.contextLabel') }}: {{ contextLabel(item.context) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
