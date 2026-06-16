<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import MatchSquadStatusBadge from './MatchSquadStatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({ name: 'MatchSquadReviewPanel' })

defineProps({
  squad: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canApprove: {
    type: Boolean,
    default: false,
  },
  canLock: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['approve', 'lock'])

const { t } = useLanguage()
</script>

<template>
  <Card class="match-squad-review-panel">
    <template #title>
      <div class="flex items-center justify-between gap-3">
        <span>{{ t('sportMatchSquad.review.title') }}</span>
        <MatchSquadStatusBadge :status="squad?.status" />
      </div>
    </template>

    <template #content>
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="m-0 text-xs uppercase tracking-[0.2em] text-slate-500">{{ t('sportMatchSquad.review.team') }}</p>
          <p class="m-0 mt-1 font-semibold text-slate-900">{{ squad?.team?.name || t('sportMatchSquad.review.noTeam') }}</p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="m-0 text-xs uppercase tracking-[0.2em] text-slate-500">{{ t('sportMatchSquad.review.players') }}</p>
          <p class="m-0 mt-1 font-semibold text-slate-900">{{ squad?.playersCount ?? squad?.players?.length ?? 0 }}</p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="m-0 text-xs uppercase tracking-[0.2em] text-slate-500">{{ t('sportMatchSquad.review.submittedAt') }}</p>
          <p class="m-0 mt-1 font-semibold text-slate-900">{{ squad?.submittedAt || t('sportMatchSquad.common.empty') }}</p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="m-0 text-xs uppercase tracking-[0.2em] text-slate-500">{{ t('sportMatchSquad.review.lockedAt') }}</p>
          <p class="m-0 mt-1 font-semibold text-slate-900">{{ squad?.lockedAt || t('sportMatchSquad.common.empty') }}</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-3">
        <Button
          :label="t('sportMatchSquad.actions.approve')"
          :loading="loading"
          :disabled="!canApprove"
          @click="emit('approve')"
        />
        <Button
          outlined
          :label="t('sportMatchSquad.actions.lock')"
          :loading="loading"
          :disabled="!canLock"
          @click="emit('lock')"
        />
      </div>
    </template>
  </Card>
</template>
