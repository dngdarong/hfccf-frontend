import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestI18n } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import { formatTournamentDateRange, getTournamentTeamCount } from '@/modules/sport/tournament/components/list/tournamentListUtils'
import TournamentListFilters from '@/modules/sport/tournament/components/list/TournamentListFilters.vue'

const filterStubs = {
  Button: {
    props: ['disabled', 'label'],
    emits: ['click'],
    template: '<button :disabled="disabled" @click="$emit(\'click\')">{{ label }}</button>',
  },
  Select: { template: '<select />' },
  SearchInputField: { template: '<input />' },
}

describe('tournament list presentation helpers', () => {
  it('formats same-month tournament dates without raw ISO timestamps', () => {
    expect(formatTournamentDateRange({ startAt: '2026-07-01T00:00:00.000000Z', endAt: '2026-07-31T00:00:00.000000Z' }))
      .toBe('Jul 1–31, 2026')
  })

  it('formats Khmer dates using the Khmer locale', () => {
    expect(formatTournamentDateRange({ startAt: '2026-07-01', endAt: '2026-07-31' }, 'KH'))
      .not.toContain('2026-07-01')
  })

  it('keeps team registration readable when capacity is unavailable', () => {
    expect(getTournamentTeamCount({ statistics: { registeredTeams: 3 } })).toBe('3')
    expect(getTournamentTeamCount({ statistics: { registeredTeams: 3, totalTeams: 16 } })).toBe('3/16')
  })

  it('resets search and both filters from the accessible clear action', async () => {
    const wrapper = mount(TournamentListFilters, {
      props: {
        searchQuery: 'cup',
        seasonFilter: '2026',
        stateFilter: 'active',
        seasonOptions: ['2026'],
        stateOptions: ['active'],
      },
      global: {
        plugins: [createTestI18n({ en: tournamentMessages })],
        stubs: filterStubs,
      },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('update:searchQuery')).toEqual([['']])
    expect(wrapper.emitted('update:seasonFilter')).toEqual([['']])
    expect(wrapper.emitted('update:stateFilter')).toEqual([['']])
  })
})
