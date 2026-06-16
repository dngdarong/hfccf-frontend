<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import MatchEventBadge from './MatchEventBadge.vue'
import MatchMinuteBadge from './MatchMinuteBadge.vue'

defineOptions({
  name: 'MatchTimelineEvent',
})

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  homeTeam: {
    type: String,
    default: '',
  },
  awayTeam: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete'])
const { t } = useLanguage()

const teamLabel = computed(() => props.event.teamName || (String(props.event.side || '').toLowerCase() === 'away' ? props.awayTeam : props.homeTeam))
const playerLabel = computed(() => props.event.playerNameSnapshot || props.event.playerName || t('sportMatchesManagement.resultsEntry.events.unknownPlayer'))
const assistLabel = computed(() => props.event.assistPlayerName || props.event.assistPlayer?.playerNameSnapshot || props.event.assistPlayer?.name || '')
const relatedLabel = computed(() => props.event.relatedSquadPlayer?.playerNameSnapshot || props.event.relatedPlayerName || '')
const notesLabel = computed(() => props.event.description || props.event.notes || '')
</script>

<template>
  <article class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <MatchMinuteBadge :event="event" />
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <MatchEventBadge :type="event.eventType" />
            <span class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{{ teamLabel }}</span>
          </div>
          <h4 class="text-sm font-extrabold text-slate-900">{{ playerLabel }}</h4>
          <p v-if="assistLabel" class="text-xs font-medium text-slate-500">
            {{ t('sportMatchesManagement.resultsEntry.events.assistPlayer') }}: {{ assistLabel }}
          </p>
          <p v-if="relatedLabel" class="text-xs font-medium text-slate-500">
            {{ t('sportMatchesManagement.resultsEntry.events.relatedPlayer') }}: {{ relatedLabel }}
          </p>
          <p v-if="notesLabel" class="text-sm text-slate-600">{{ notesLabel }}</p>
        </div>
      </div>

      <div v-if="!readonly" class="flex items-center gap-1">
        <Button type="button" variant="ghost" size="xs" rounded="full" icon="pi pi-pencil" @click="emit('edit', event)" />
        <Button
          type="button"
          variant="ghost"
          size="xs"
          rounded="full"
          icon="pi pi-trash"
          class="!text-rose-600 hover:!bg-rose-50"
          @click="emit('delete', event)"
        />
      </div>
    </div>
  </article>
</template>