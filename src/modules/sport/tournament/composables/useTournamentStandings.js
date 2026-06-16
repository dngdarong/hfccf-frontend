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
  const standingsSnapshot = computed(() => calculateTournamentStandings({ tournament: tournament?.value || tournament || {} }))
  const groupStandings = computed(() => standingsSnapshot.value.groups)

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
    totalMatches: computed(() => standingsSnapshot.value.totalMatches),
    completedMatches: computed(() => standingsSnapshot.value.completedMatches),
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
