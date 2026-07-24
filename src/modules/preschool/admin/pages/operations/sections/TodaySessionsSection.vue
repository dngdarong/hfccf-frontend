<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'
import OperationsStatusCard from '../components/OperationsStatusCard.vue'
import { resolveOperationsRoute } from '../composables/useOperationsActions'

const props = defineProps({
  today: {
    type: Object,
    default: () => ({}),
  },
  resolveSessionAction: {
    type: Function,
    default: null,
  },
})

const router = useRouter()
const { t } = useLanguage()

const sessions = computed(() => Array.isArray(props.today.todaySessions) ? props.today.todaySessions : [])

function describeSession(session = {}) {
  const parts = [session.scheduleLabel, session.teacherName, session.className, session.startTime && session.endTime ? `${session.startTime} - ${session.endTime}` : session.startTime || session.endTime]
  return parts.filter(Boolean).join(' • ')
}

function sessionTarget(session) {
  if (typeof props.resolveSessionAction === 'function') {
    return props.resolveSessionAction(session)?.to || null
  }

  return resolveOperationsRoute(router, 'dashboard-preschool-admin-attendance-session-details', { id: session.id })
}

function sessionActionLabel(session) {
  const resolved = typeof props.resolveSessionAction === 'function' ? props.resolveSessionAction(session) : null
  return t(`preschoolOperationsPage.${resolved?.labelKey || 'viewSession'}`)
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.todaySessions') }}</h2>
        <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.todayOverview') }}</p>
      </div>
      <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {{ sessions.length }}
      </span>
    </div>

    <OperationsEmptyState
      v-if="sessions.length === 0"
      :title="t('preschoolOperationsPage.noSessions')"
    />

    <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <OperationsStatusCard
        v-for="session in sessions"
        :key="session.id"
        :title="session.className || session.scheduleLabel || t('preschoolOperationsPage.viewSession')"
        :value="session.scheduleLabel || session.startTime || session.endTime || t('preschoolOperationsPage.viewSession')"
        :status="session.status || 'neutral'"
        :caption="describeSession(session)"
        :to="sessionTarget(session)"
        :details-label="sessionActionLabel(session)"
      />
    </div>
  </section>
</template>
