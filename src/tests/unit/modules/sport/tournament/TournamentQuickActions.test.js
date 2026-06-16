import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentQuickActions from '@/modules/sport/tournament/components/shared/TournamentQuickActions.vue'
import { getTournamentAvailableActions } from '@/modules/sport/tournament/composables/useTournamentStateMachine'

const messages = {
  en: {
    common: {
      close: 'Close',
    },
    ...tournamentMessages,
  },
}

describe('TournamentQuickActions', () => {
  it('renders action cards and respects disabled actions', () => {
    const actions = getTournamentAvailableActions('registration_closed')

    const wrapper = mountWithPlugins(TournamentQuickActions, {
      props: {
        title: 'Workflow actions',
        subtitle: 'Only valid actions are enabled for the current state.',
        actions,
      },
      messages,
    })

    expect(wrapper.findAll('.tournament-actions__card')).toHaveLength(actions.length)

    const disabledCards = wrapper.findAll('.tournament-actions__card--disabled')
    expect(disabledCards.length).toBeGreaterThan(0)

    const drawGroupsButton = wrapper
      .findAll('.tournament-actions__card')
      .find((card) => card.text().includes('Draw groups'))
      ?.find('button')

    const openRegistrationButton = wrapper
      .findAll('.tournament-actions__card')
      .find((card) => card.text().includes('Open registration'))
      ?.find('button')

    expect(drawGroupsButton?.attributes('disabled')).toBeUndefined()
    expect(openRegistrationButton?.attributes('disabled')).toBeDefined()
  })
})
