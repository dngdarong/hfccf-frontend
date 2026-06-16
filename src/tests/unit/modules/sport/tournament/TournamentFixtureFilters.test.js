import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestI18n } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentFixtureFilters from '@/modules/sport/tournament/components/fixtures/TournamentFixtureFilters.vue'

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

describe('TournamentFixtureFilters', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('mounts without Dropdown warnings and emits filter updates', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const i18n = createTestI18n(messages)

    const wrapper = mount(TournamentFixtureFilters, {
      props: {
        status: 'all',
        matchday: 'all',
        statusOptions: [
          { label: 'Scheduled', value: 'scheduled' },
        ],
        matchdayOptions: [
          { label: 'Matchday 1', value: 1 },
        ],
      },
      global: {
        plugins: [i18n],
        stubs: {
          Select: SelectStub,
        },
      },
    })

    await nextTick()
    await wrapper.findAll('select')[0].setValue('scheduled')
    await wrapper.findAll('select')[1].setValue('1')

    expect(wrapper.emitted('update:status')?.[0]).toEqual(['scheduled'])
    expect(wrapper.emitted('update:matchday')?.[0]).toEqual(['1'])

    const combined = [...warnSpy.mock.calls, ...errorSpy.mock.calls].flat().join(' ')
    expect(combined).not.toContain('Dropdown')

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
