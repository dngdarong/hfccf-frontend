<script setup>
import Card from 'primevue/card'
import MatchSquadRoleBadge from './MatchSquadRoleBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { resolvePlayerDisplayName, resolvePlayerPosition } from '../matchSquadUtils'

defineOptions({ name: 'MatchLineupCard' })

defineProps({
  title: {
    type: String,
    required: true,
  },
  players: {
    type: Array,
    default: () => [],
  },
  emptyLabel: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()
</script>

<template>
  <Card class="match-lineup-card">
    <template #title>
      <div class="flex items-center justify-between gap-3">
        <span>{{ title }}</span>
        <span class="text-sm font-medium text-slate-500">{{ players.length }}</span>
      </div>
    </template>

    <template #content>
      <div v-if="players.length" class="space-y-3">
        <div
          v-for="player in players"
          :key="player.playerId"
          class="rounded-2xl border border-slate-200 bg-white px-3 py-2"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="m-0 truncate font-semibold text-slate-900">
                {{ resolvePlayerDisplayName(player) }}
              </p>
              <p class="m-0 text-xs text-slate-500">
                <span v-if="player.jerseyNumberSnapshot !== null && player.jerseyNumberSnapshot !== undefined">
                  #{{ player.jerseyNumberSnapshot }}
                </span>
                <span v-if="resolvePlayerPosition(player)">
                  <span v-if="player.jerseyNumberSnapshot !== null && player.jerseyNumberSnapshot !== undefined"> • </span>
                  {{ resolvePlayerPosition(player) }}
                </span>
              </p>
            </div>
            <MatchSquadRoleBadge :role="player.role" />
          </div>
          <p v-if="player.reason" class="m-0 mt-2 text-xs text-slate-500">
            {{ player.reason }}
          </p>
        </div>
      </div>

      <p v-else class="m-0 text-sm text-slate-500">
        {{ emptyLabel || t('sportMatchSquad.emptySection') }}
      </p>
    </template>
  </Card>
</template>
