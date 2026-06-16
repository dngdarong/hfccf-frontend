import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestI18n } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentBracketMatch from '@/modules/sport/tournament/components/knockout/TournamentBracketMatch.vue'

const messages = {
  en: {
    common: {},
    ...tournamentMessages,
  },
}

const i18n = createTestI18n(messages)

function mountMatch(match = {}) {
  return mount(TournamentBracketMatch, {
    props: {
      match: {
        id: 'match-1',
        matchNumber: 1,
        roundLabelKey: 'sportTournament.knockout.rounds.semifinal',
        status: 'scheduled',
        homeTeamName: 'Alpha',
        awayTeamName: 'Bravo',
        homeTeamId: 'alpha',
        awayTeamId: 'bravo',
        ...match,
      },
    },
    global: {
      plugins: [i18n],
      stubs: {
        Button: {
          props: ['label', 'disabled'],
          template: '<button :disabled="disabled">{{ label }}</button>',
        },
      },
    },
  })
}

describe('TournamentBracketMatch', () => {
  it('renders completed matches as locked with winner highlighting', () => {
    const wrapper = mountMatch({
      status: 'completed',
      homeScore: 2,
      awayScore: 1,
      winnerTeamId: 'alpha',
      winnerTeamName: 'Alpha',
    })

    expect(wrapper.classes()).toContain('tournament-bracket-match--completed')
    expect(wrapper.classes()).toContain('tournament-bracket-match--locked')
    expect(wrapper.find('.tournament-bracket-match__team--winner').exists()).toBe(true)
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('renders live matches with the live state class', () => {
    const wrapper = mountMatch({
      status: 'live',
    })

    expect(wrapper.classes()).toContain('tournament-bracket-match--live')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })
})
