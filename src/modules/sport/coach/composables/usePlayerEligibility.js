import { computed } from 'vue'
import { PLAYER_LIFECYCLE_ACTIONS } from '@/modules/sport/constants/playerStatus'

export function usePlayerEligibility(playerRef) {
  const rosterStatus = computed(() => String(playerRef?.value?.rosterStatus || playerRef?.value?.status || '').toLowerCase())
  const isActive = computed(() => rosterStatus.value === PLAYER_LIFECYCLE_ACTIONS.ACTIVE)
  const isInjured = computed(() => rosterStatus.value === PLAYER_LIFECYCLE_ACTIONS.INJURED)
  const isSuspended = computed(() => rosterStatus.value === PLAYER_LIFECYCLE_ACTIONS.SUSPENDED)
  const isArchived = computed(() => rosterStatus.value === PLAYER_LIFECYCLE_ACTIONS.ARCHIVED)
  const canEdit = computed(() => !isArchived.value)

  return {
    canEdit,
    isActive,
    isArchived,
    isInjured,
    isSuspended,
    rosterStatus,
  }
}
