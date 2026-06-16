<script setup>
defineOptions({
  name: 'GovernanceCaseStatusBadge',
})

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
})

const STATUS_STYLES = {
  open: 'border-slate-200 bg-slate-100 text-slate-700',
  under_review: 'border-blue-200 bg-blue-50 text-blue-700',
  investigating: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  awaiting_evidence: 'border-amber-200 bg-amber-50 text-amber-800',
  escalated: 'border-rose-200 bg-rose-50 text-rose-700',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  closed: 'border-slate-300 bg-slate-200 text-slate-800',
}

const normalizedStatus = (props.status || '').toLowerCase()
const statusClass = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.open
</script>

<template>
  <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize" :class="statusClass">
    {{ label || status || '-' }}
  </span>
</template>
