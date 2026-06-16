import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createTestI18n } from '@/tests/helpers/mount'
import tournamentMessages from '@/i18n/en/sport/tournament'
import TournamentResultEntryForm from '@/modules/sport/tournament/components/results/TournamentResultEntryForm.vue'

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

const InputStub = {
  name: 'Input',
  inheritAttrs: false,
  props: ['modelValue', 'disabled'],
  emits: ['update:modelValue'],
  template: '<input :disabled="disabled" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

const TextareaStub = {
  name: 'Textarea',
  inheritAttrs: false,
  props: ['modelValue', 'disabled'],
  emits: ['update:modelValue'],
  template: '<textarea :disabled="disabled" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

const ButtonStub = {
  name: 'Button',
  inheritAttrs: false,
  emits: ['click'],
  template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
}

describe('TournamentResultEntryForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('mounts without Dropdown warnings and preserves form interactions', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const i18n = createTestI18n(messages)

    const wrapper = mount(TournamentResultEntryForm, {
      props: {
        fixture: {
          id: 'fixture-1',
          homeTeamName: 'Falcons',
          awayTeamName: 'Strikers',
        },
        modelValue: {
          status: 'scheduled',
          score: { home: 0, away: 0 },
          venue: 'Main Stadium',
          dateTime: '2026-05-17T10:00:00Z',
          notes: 'Ready',
        },
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
          InputNumber: InputStub,
          InputText: InputStub,
          Textarea: TextareaStub,
        },
      },
    })

    await nextTick()
    const inputs = wrapper.findAll('input')
    await wrapper.find('select').setValue('completed')
    await inputs[0].setValue('2')
    await inputs[1].setValue('1')
    await inputs[2].setValue('National Stadium')
    await inputs[3].setValue('2026-05-18T11:30:00Z')
    await wrapper.find('textarea').setValue('Updated note')
    await wrapper.findAll('button')[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.length).toBeGreaterThan(0)
    expect(wrapper.emitted('save')?.length).toBe(1)

    const combined = [...warnSpy.mock.calls, ...errorSpy.mock.calls].flat().join(' ')
    expect(combined).not.toContain('Dropdown')

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
