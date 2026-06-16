import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { withI18nSetup } from '@/tests/helpers/mount'
import sportTournamentEn from '@/i18n/en/sport/tournament'
import { useTournamentKnockout } from '@/modules/sport/tournament/composables/useTournamentKnockout'
import { createMockTournaments } from '@/modules/sport/tournament/mocks/tournaments.mock'

describe('useTournamentKnockout', () => {
  it('transitions the tournament into knockout stage and then completed', () => {
    const tournament = ref({
      ...createMockTournaments().find((item) => item.id === 'tournament-004'),
      state: 'active',
    })

    const updateTournament = vi.fn((id, payload) => {
      tournament.value = {
        ...tournament.value,
        ...payload,
      }
      return tournament.value
    })

    const transitionTournament = vi.fn((id, nextState) => {
      tournament.value = {
        ...tournament.value,
        state: nextState,
      }
      return tournament.value
    })

    const knockout = withI18nSetup(
      () => useTournamentKnockout(tournament, { updateTournament, transitionTournament }),
      sportTournamentEn,
    )

    const preview = knockout.generatePreview()
    expect(preview.valid).toBe(true)

    const applied = knockout.applyPreview()
    expect(applied.id).toBe('tournament-004')
    expect(transitionTournament).toHaveBeenCalledWith('tournament-004', 'knockout_stage')
    expect(tournament.value.state).toBe('knockout_stage')

    const semifinalRound = knockout.bracket.value.rounds.find((round) => round.key === 'semifinal')
    const finalRound = knockout.bracket.value.rounds.find((round) => round.key === 'final')

    knockout.selectMatch(semifinalRound.matches[0].id)
    knockout.updateDraft({
      status: 'completed',
      homeScore: 2,
      awayScore: 0,
    })
    knockout.saveMatchResult()

    knockout.selectMatch(semifinalRound.matches[1].id)
    knockout.updateDraft({
      status: 'completed',
      homeScore: 1,
      awayScore: 0,
    })
    knockout.saveMatchResult()

    knockout.selectMatch(finalRound.matches[0].id)
    knockout.updateDraft({
      status: 'completed',
      homeScore: 3,
      awayScore: 1,
    })
    knockout.saveMatchResult()

    expect(transitionTournament).toHaveBeenCalledWith('tournament-004', 'completed')
    expect(tournament.value.state).toBe('completed')
    expect(knockout.champion.value.teamId).toBeTruthy()
  })
})
