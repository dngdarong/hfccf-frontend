import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentGroupDrawControls from '@/modules/sport/tournament/components/groups/TournamentGroupDrawControls.vue'

const messages = {
  en: {
    common: {
      cancel: 'Cancel',
      close: 'Close',
    },
    ...tournamentMessages,
  },
}

describe('TournamentGroupDrawControls', () => {
  it('renders action cards and disables finalize when invalid', () => {
    const wrapper = mountWithPlugins(TournamentGroupDrawControls, {
      props: {
        mode: 'automatic',
        canEdit: true,
        canFinalize: false,
        locked: false,
        issueCount: 2,
        lastGeneratedAt: '2026-05-01',
      },
      messages,
    })

    expect(wrapper.text()).toContain('Preview automatic draw')
    expect(wrapper.text()).toContain('Finalize groups')
    const finalizeButton = wrapper
      .findAll('.group-controls__card')
      .find((card) => card.text().includes('Finalize groups'))
      ?.find('button')

    expect(finalizeButton?.attributes('disabled')).toBeDefined()
  })

  it('disables all actions when locked', () => {
    const wrapper = mountWithPlugins(TournamentGroupDrawControls, {
      props: {
        mode: 'manual',
        canEdit: false,
        canFinalize: false,
        locked: true,
        issueCount: 0,
      },
      messages,
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.every((button) => button.attributes('disabled') !== undefined)).toBe(true)
  })
})
