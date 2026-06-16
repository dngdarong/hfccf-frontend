import { describe, expect, it } from 'vitest'
import { useMatchSquadSelection } from '@/modules/sport/match-squads/composables/useMatchSquadSelection'

describe('useMatchSquadSelection', () => {
  it('dedupes players and builds a squad payload', () => {
    const selection = useMatchSquadSelection()

    selection.syncFromEligibility(
      [
        { player: { id: 1, name: 'Player One' }, isEligible: true, eligibilityStatus: 'eligible' },
        { player: { id: 1, name: 'Player One Duplicate' }, isEligible: true, eligibilityStatus: 'eligible' },
        { player: { id: 2, name: 'Player Two' }, isEligible: false, eligibilityStatus: 'injured' },
      ],
      [{ playerId: 1, role: 'starter' }],
    )

    expect(selection.players.value).toHaveLength(2)
    expect(selection.starters.value).toHaveLength(1)
    expect(selection.unavailable.value).toHaveLength(1)
    expect(selection.payload.value).toEqual([
      { player_id: '1', role: 'starter' },
      { player_id: '2', role: 'unavailable' },
    ])
  })

  it('updates roles in place', () => {
    const selection = useMatchSquadSelection()

    selection.syncFromEligibility([{ player: { id: 9, name: 'Player Nine' }, isEligible: true, eligibilityStatus: 'eligible' }], [])
    selection.setRole(9, 'substitute')

    expect(selection.substitutes.value).toHaveLength(1)
    expect(selection.canSubmit.value).toBe(true)
  })
})
