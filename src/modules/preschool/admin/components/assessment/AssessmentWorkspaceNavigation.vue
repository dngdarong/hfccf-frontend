<script setup>
import AssessmentWorkspaceCard from './AssessmentWorkspaceCard.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AssessmentWorkspaceNavigation',
})

defineProps({
  sections: {
    type: Array,
    required: true,
  },
})

const { t } = useLanguage()
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h3 class="text-xl font-bold text-slate-900">
          {{ t('assessmentDashboard.workspaceNavigation.title') }}
        </h3>
        <p class="text-sm text-slate-600">
          {{ t('assessmentDashboard.workspaceNavigation.subtitle') }}
        </p>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="section in sections" :key="section.group" class="space-y-3">
        <h4 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          {{ section.group }}
        </h4>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AssessmentWorkspaceCard
            v-for="card in section.cards"
            :key="card.routeName"
            :title="card.title"
            :description="card.description"
            :route-name="card.routeName"
            :icon-class="card.iconClass"
            :group="card.group"
          />
        </div>
      </div>
    </div>
  </section>
</template>
