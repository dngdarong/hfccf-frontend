<script setup>
import { computed } from 'vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Select from 'primevue/select'
import MatchEligibilityBadge from './MatchEligibilityBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  MATCH_SQUAD_PLAYER_ROLE,
  MATCH_SQUAD_PLAYER_ROLES,
  normalizeMatchSquadRole,
} from '@/modules/sport/constants/matchSquad'
import { resolvePlayerDisplayName, resolvePlayerPosition } from '../matchSquadUtils'

defineOptions({ name: 'MatchSquadPlayerPicker' })

defineProps({
  players: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change-role'])

const { t } = useLanguage()

const roleOptions = computed(() =>
  MATCH_SQUAD_PLAYER_ROLES.map((role) => ({
    label: t(`sportMatchSquad.roles.${role}`),
    value: role,
  })),
)

function optionsForRow(row) {
  return row.isEligible
    ? roleOptions.value
    : [
        {
          label: t('sportMatchSquad.roles.unavailable'),
          value: MATCH_SQUAD_PLAYER_ROLE.UNAVAILABLE,
        },
      ]
}

function onRoleChange(row, role) {
  emit('change-role', {
    playerId: row.playerId,
    role: normalizeMatchSquadRole(role),
  })
}
</script>

<template>
  <DataTable
    :value="players"
    data-key="playerId"
    striped-rows
    :loading="loading"
    :empty-message="t('sportMatchSquad.emptyPlayers')"
    class="match-squad-picker"
  >
    <Column field="playerName" :header="t('sportMatchSquad.common.player')">
      <template #body="{ data }">
        <div class="flex flex-col gap-1">
          <p class="m-0 font-semibold text-slate-900">
            {{ resolvePlayerDisplayName(data) }}
          </p>
          <p class="m-0 text-xs text-slate-500">
            {{ resolvePlayerPosition(data) || t('sportMatchSquad.common.noPosition') }}
          </p>
        </div>
      </template>
    </Column>

    <Column field="eligibilityStatus" :header="t('sportMatchSquad.common.eligibility')">
      <template #body="{ data }">
        <MatchEligibilityBadge :status="data.eligibilityStatus" />
      </template>
    </Column>

    <Column field="reason" :header="t('sportMatchSquad.common.reason')">
      <template #body="{ data }">
        <span class="text-sm text-slate-600">
          {{ data.reason || t('sportMatchSquad.common.empty') }}
        </span>
      </template>
    </Column>

    <Column field="role" :header="t('sportMatchSquad.common.role')">
      <template #body="{ data }">
        <Select
          :model-value="data.role"
          :options="optionsForRow(data)"
          option-label="label"
          option-value="value"
          append-to="self"
          :disabled="disabled || !data.isEligible"
          class="w-44"
          :placeholder="t('sportMatchSquad.common.selectRole')"
          @update:model-value="(value) => onRoleChange(data, value)"
        />
      </template>
    </Column>
  </DataTable>
</template>
