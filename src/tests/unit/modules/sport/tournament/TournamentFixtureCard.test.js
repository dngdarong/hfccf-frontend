import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestI18n } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentFixtureCard from '@/modules/sport/tournament/components/fixtures/TournamentFixtureCard.vue'

const messages = {
  en: {
    ...tournamentMessages,
  },
}

const SelectStub = {
  name: 'Select',
  inheritAttrs: false,
  props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'disabled'],
  emits: ['update:modelValue'],
  template: `
    <select :disabled="disabled" @change="$emit('update:modelValue', $event.target.value)">
      <option v-for="option in options" :key="option[optionValue || 'value']" :value="option[optionValue || 'value']">
        {{ option[optionLabel || 'label'] || option }}
      </option>
    </select>
  `,
}

const ButtonStub = {
  name: 'Button',
  inheritAttrs: false,
  emits: ['click'],
  template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
}

describe('TournamentFixtureCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('mounts without Dropdown warnings and emits updates normally', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const i18n = createTestI18n(messages)

    const wrapper = mount(TournamentFixtureCard, {
      props: {
        fixture: {
          id: 'fixture-1',
          homeTeamName: 'Falcons',
          awayTeamName: 'Strikers',
          groupName: 'Group A',
          status: 'scheduled',
          matchday: 1,
          score: { home: 0, away: 0 },
          venue: 'Main Stadium',
          dateTime: '2026-05-17T10:00:00Z',
        },
        editable: true,
        statusOptions: [
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'Completed', value: 'completed' },
        ],
      },
      global: {
        plugins: [i18n],
        stubs: {
          Button: ButtonStub,
          Select: SelectStub,
          TournamentFixtureStatusBadge: { template: '<span />' },
        },
      },
    })

    await nextTick()
    await wrapper.find('select').setValue('completed')
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update-status')?.[0]).toEqual([{ fixtureId: 'fixture-1', status: 'completed' }])
    expect(wrapper.emitted('select')?.[0]).toEqual([
      {
        id: 'fixture-1',
        homeTeamName: 'Falcons',
        awayTeamName: 'Strikers',
        groupName: 'Group A',
        status: 'scheduled',
        matchday: 1,
        score: { home: 0, away: 0 },
        venue: 'Main Stadium',
        dateTime: '2026-05-17T10:00:00Z',
      },
    ])

    const combined = [...warnSpy.mock.calls, ...errorSpy.mock.calls].flat().join(' ')
    expect(combined).not.toContain('Dropdown')

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
