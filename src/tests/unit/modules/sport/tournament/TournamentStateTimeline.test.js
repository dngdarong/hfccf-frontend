import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentStateTimeline from '@/modules/sport/tournament/components/shared/TournamentStateTimeline.vue'
import { getTournamentProgressPercent } from '@/modules/sport/tournament/composables/useTournamentStateMachine'

const messages = {
  en: {
    common: {
      close: 'Close',
    },
    ...tournamentMessages,
  },
}

describe('TournamentStateTimeline', () => {
  it('renders workflow steps with current state metadata', () => {
    const wrapper = mountWithPlugins(TournamentStateTimeline, {
      props: {
        state: 'active',
      },
      messages,
    })

    expect(wrapper.findAll('.tournament-timeline__step')).toHaveLength(9)
    expect(wrapper.find('.tournament-timeline__step--current').exists()).toBe(true)
    expect(wrapper.find('.tournament-timeline__step--current').text()).toContain('Active')
    expect(wrapper.find('.tournament-timeline__progress strong').text()).toBe(
      `${getTournamentProgressPercent('active')}%`,
    )
  })
})
