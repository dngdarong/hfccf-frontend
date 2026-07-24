<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import OperationsActionCard from '../components/OperationsActionCard.vue'

const props = defineProps({
  quickActions: {
    type: Array,
    default: () => [],
  },
  resolveQuickAction: {
    type: Function,
    default: null,
  },
})

const { t } = useLanguage()
const router = useRouter()
const actions = computed(() => Array.isArray(props.quickActions) ? props.quickActions : [])

function resolveAction(action) {
  if (typeof props.resolveQuickAction === 'function') {
    return props.resolveQuickAction(action)
  }

  return {
    ...action,
    to: action?.routeName && router.hasRoute(action.routeName) ? { name: action.routeName } : null,
    labelKey: 'viewDetails',
  }
}
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.quickActions') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.openDetail') }}</p>
    </div>

    <div v-if="actions.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
      {{ t('preschoolOperationsPage.noData') }}
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <OperationsActionCard
        v-for="action in actions"
        :key="action.routeName || action.label"
        :title="action.labelKey ? t(`preschoolOperationsPage.${action.labelKey}`) : action.label"
        :description="''"
        :action-label="t('preschoolOperationsPage.viewDetails')"
        :to="resolveAction(action).to"
      />
    </div>
  </section>
</template>
