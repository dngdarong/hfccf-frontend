<script setup>
// Keep immutable report state visible in one tiny badge so report pages can
// show whether content is live or frozen without duplicating lifecycle logic.
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDatetimeShort } from '@/utils/date'

const props = defineProps({
  snapshot: {
    type: Object,
    default: null,
  },
  source: {
    type: String,
    default: '',
  },
  frozen: {
    type: Boolean,
    default: false,
  },
  generatedAt: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()

const normalizedSource = computed(() => String(props.source || (props.frozen ? 'frozen' : 'live')).toLowerCase())
const snapshotState = computed(() => String(props.snapshot?.lifecycleState || props.snapshot?.snapshotState || '').toLowerCase())
const displayLabel = computed(() => {
  if (normalizedSource.value === 'snapshot' || props.snapshot) {
    return t('preschoolReportSnapshots.labels.immutableSnapshot')
  }

  if (normalizedSource.value === 'frozen' || props.frozen || ['finalized', 'locked', 'archived'].includes(snapshotState.value)) {
    return t('preschoolReportSnapshots.labels.frozenReport')
  }

  return t('preschoolReportSnapshots.labels.liveReport')
})

const toneClass = computed(() => {
  if (normalizedSource.value === 'snapshot' || props.snapshot) {
    return 'border-sky-200 bg-sky-50 text-sky-700'
  }

  if (normalizedSource.value === 'frozen' || props.frozen || ['finalized', 'locked', 'archived'].includes(snapshotState.value)) {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
})

const detail = computed(() => {
  const generatedAt = props.generatedAt || props.snapshot?.generatedAt || ''
  const generatedBy = props.snapshot?.generatedByUserId ? `#${props.snapshot.generatedByUserId}` : ''
  const version = props.snapshot?.snapshotVersion ? `${t('preschoolReportSnapshots.labels.version')} ${props.snapshot.snapshotVersion}` : ''
  const stateLabel = snapshotState.value ? t(`preschoolReportSnapshots.states.${snapshotState.value}`) || snapshotState.value : ''

  return [generatedAt && `${t('preschoolReportSnapshots.labels.generatedAt')}: ${formatDatetimeShort(generatedAt)}`, generatedBy, version, stateLabel]
    .filter(Boolean)
    .join(' | ')
})
</script>

<template>
  <div class="inline-flex flex-col gap-1">
    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold" :class="toneClass">
      {{ displayLabel }}
    </span>
    <span v-if="detail" class="text-[11px] text-slate-500">
      {{ detail }}
    </span>
  </div>
</template>
