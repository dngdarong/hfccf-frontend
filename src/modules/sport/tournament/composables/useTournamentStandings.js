import { computed, ref, watch } from 'vue'
import {
  calculateTournamentGroupStandings,
  calculateTournamentStandings,
  createEmptyStandingRow,
  isCountableFixture,
  normalizeScoreValue,
  resolveFixtureScore,
} from '../services/calculateStandings'

export function useTournamentStandings(tournament) {
  const selectedGroupId = ref('')
  const groupStandings = computed(() => {
    const rows = Array.isArray((tournament?.value || tournament)?.standings) ? (tournament?.value || tournament).standings : []
    return Object.values(rows.reduce((groups, row) => {
      const id = String(row.groupId || 'overall')
      groups[id] ||= { groupId: id, groupName: row.groupName || row.groupCode || id, rows: [] }
      groups[id].rows.push(row)
      return groups
    }, {}))
  })

  const groupOptions = computed(() =>
    groupStandings.value.map((group) => ({
      label: group.groupName || group.groupId,
      value: group.groupId,
    })),
  )

  watch(
    groupStandings,
    (nextGroups) => {
      if (!nextGroups.length) {
        selectedGroupId.value = ''
        return
      }

      const current = nextGroups.find((group) => group.groupId === selectedGroupId.value)
      if (!current) {
        selectedGroupId.value = nextGroups[0].groupId
      }
    },
    { immediate: true },
  )

  const selectedGroupStandings = computed(() =>
    groupStandings.value.find((group) => group.groupId === selectedGroupId.value) || groupStandings.value[0] || null,
  )

  return {
    selectedGroupId,
    groupStandings,
    groupOptions,
    selectedGroupStandings,
    totalMatches: computed(() => Number((tournament?.value || tournament)?.matchesCount || 0)),
    completedMatches: computed(() => groupStandings.value.reduce((total, group) => total + group.rows.reduce((sum, row) => sum + Number(row.played || 0), 0), 0)),
  }
}

export {
  calculateTournamentGroupStandings,
  calculateTournamentStandings,
  createEmptyStandingRow,
  isCountableFixture,
  normalizeScoreValue,
  resolveFixtureScore,
}
