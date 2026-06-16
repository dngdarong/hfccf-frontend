<script setup>
import { computed } from 'vue'
import Loading from '@/components/feedback/Loading.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useMatchTimeline } from '../composables/useMatchTimeline'
import MatchTimelineEvent from './MatchTimelineEvent.vue'

defineOptions({
  name: 'MatchTimeline',
})

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  homeTeam: {
    type: String,
    default: '',
  },
  awayTeam: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete'])
const { t } = useLanguage()
const { groupedEvents, eventCount } = useMatchTimeline(computed(() => props.events))

const periodLabelMap = computed(() => ({
  first_half: t('sportMatchesManagement.resultsEntry.events.periods.first_half'),
  halftime: t('sportMatchesManagement.resultsEntry.events.periods.halftime'),
  second_half: t('sportMatchesManagement.resultsEntry.events.periods.second_half'),
  extra_time: t('sportMatchesManagement.resultsEntry.events.periods.extra_time'),
  penalty_shootout: t('sportMatchesManagement.resultsEntry.events.periods.penalty_shootout'),
  final: t('sportMatchesManagement.resultsEntry.events.periods.final'),
}))
</script>

<template>
  <section class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 class="text-lg font-black text-slate-900">{{ t('sportMatchesManagement.resultsEntry.events.timelineTitle') }}</h3>
        <p class="text-sm text-slate-500">{{ t('sportMatchesManagement.resultsEntry.events.timelineSubtitle') }}</p>
      </div>
      <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {{ t('sportMatchesManagement.resultsEntry.events.countLabel', { count: eventCount }) }}
      </span>
    </div>

    <div v-if="loading" class="flex justify-center py-10">
      <Loading />
    </div>

    <div v-else-if="!groupedEvents.length" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {{ t('sportMatchesManagement.resultsEntry.events.empty') }}
    </div>

    <div v-else class="grid gap-5">
      <section v-for="group in groupedEvents" :key="group.period" class="grid gap-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
            {{ periodLabelMap[group.period] || group.title }}
          </h4>
          <span class="text-xs font-bold text-slate-400">{{ group.events.length }}</span>
        </div>

        <div class="grid gap-3">
          <MatchTimelineEvent
            v-for="event in group.events"
            :key="event.id"
            :event="event"
            :home-team="homeTeam"
            :away-team="awayTeam"
            :readonly="readonly"
            @edit="emit('edit', $event)"
            @delete="emit('delete', $event)"
          />
        </div>
      </section>
    </div>
  </section>
</template>