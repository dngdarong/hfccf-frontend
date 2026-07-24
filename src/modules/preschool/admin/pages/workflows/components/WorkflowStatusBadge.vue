<script setup>
import { computed } from 'vue'

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

const tone = computed(() => {
  const key = String(props.status || '').toLowerCase()
  if (['approved', 'completed'].includes(key)) return 'emerald'
  if (['rejected', 'cancelled'].includes(key)) return 'rose'
  if (['pendingapproval', 'pending_approval', 'pending approval', 'open', 'inprogress'].includes(key)) return 'blue'
  if (['overdue', 'escalated'].includes(key)) return 'amber'
  return 'slate'
})
</script>

<template>
  <span :class="['workflow-status-badge', `workflow-status-badge--${tone}`]">
    {{ label || status || '—' }}
  </span>
</template>

<style scoped>
.workflow-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.workflow-status-badge--rose {
  background: #ffe4e6;
  color: #be123c;
}

.workflow-status-badge--amber {
  background: #fef3c7;
  color: #b45309;
}

.workflow-status-badge--emerald {
  background: #d1fae5;
  color: #047857;
}

.workflow-status-badge--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.workflow-status-badge--slate {
  background: #e2e8f0;
  color: #334155;
}
</style>
