import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentGroupCard from '@/modules/sport/tournament/components/groups/TournamentGroupCard.vue'

const messages = {
  en: {
    common: {
      close: 'Close',
    },
    ...tournamentMessages,
  },
}

describe('TournamentGroupCard', () => {
  it('renders team data and empty slots', () => {
    const wrapper = mountWithPlugins(TournamentGroupCard, {
      props: {
        group: {
          id: 'group-01',
          name: 'Group A',
          teamIds: ['team-1', 'team-2'],
          teams: [
            { id: 'team-1', name: 'Team 1', status: 'active', seeded: true, seedRank: 1 },
            { id: 'team-2', name: 'Team 2', status: 'active' },
          ],
          assignedCount: 2,
          capacity: 4,
          remainingSlots: 2,
          qualificationSlots: 2,
          locked: false,
          isFull: false,
          isEmpty: false,
        },
        editable: true,
      },
      messages,
    })

    expect(wrapper.text()).toContain('Group A')
    expect(wrapper.text()).toContain('Team 1')
    expect(wrapper.text()).toContain('Empty slot')
    expect(wrapper.findAll('button').length).toBeGreaterThan(0)
  })
})
