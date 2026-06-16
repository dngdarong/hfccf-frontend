import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestI18n } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentKnockoutResultForm from '@/modules/sport/tournament/components/knockout/TournamentKnockoutResultForm.vue'

const messages = {
  en: {
    common: {
      enabled: 'Enabled',
      disabled: 'Disabled',
      reset: 'Reset',
    },
    ...tournamentMessages,
  },
}

const stubs = {
  Button: { props: ['label', 'disabled'], template: '<button />' },
  Select: { props: ['modelValue', 'disabled'], template: '<select />' },
  InputNumber: { props: ['modelValue', 'disabled'], template: '<input />' },
  Textarea: { props: ['modelValue', 'disabled'], template: '<textarea />' },
}

describe('TournamentKnockoutResultForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('mounts without Dropdown deprecation warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const i18n = createTestI18n(messages)

    const wrapper = mount(TournamentKnockoutResultForm, {
      props: {
        match: {
          id: 'match-1',
          homeTeamName: 'Falcons',
          awayTeamName: 'Strikers',
        },
        modelValue: {
          status: 'scheduled',
        },
        statusOptions: [
          { label: 'Scheduled', value: 'scheduled' },
        ],
        settings: {
          extraTimeEnabled: true,
          penaltyEnabled: true,
        },
      },
      global: {
        plugins: [i18n],
        stubs,
      },
    })

    await nextTick()

    const combined = [...warnSpy.mock.calls, ...errorSpy.mock.calls].flat().join(' ')
    expect(combined).not.toContain('Dropdown')
    expect(wrapper.text()).toContain('Knockout result entry')

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
