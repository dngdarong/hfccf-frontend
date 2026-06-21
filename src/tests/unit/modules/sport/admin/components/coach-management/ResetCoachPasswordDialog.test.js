import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enSport from '@/i18n/en/sport'
import ResetCoachPasswordDialog from '@/modules/sport/admin/components/coach-management/ResetCoachPasswordDialog.vue'

function mountDialog(props = {}) {
  return mountWithPlugins(ResetCoachPasswordDialog, {
    props: {
      visible: true,
      backendError: '',
      loading: false,
      ...props,
    },
    messages: {
      en: { common: enCommon, ...enSport },
    },
    global: {
      stubs: {
        Dialog: {
          props: ['visible', 'header'],
          template: '<section v-if="visible" data-testid="dialog"><header>{{ header }}</header><slot /><footer><slot name="footer" /></footer></section>',
        },
        Button: {
          props: ['label', 'disabled', 'loading'],
          inheritAttrs: false,
          emits: ['click'],
          template: '<button :disabled="disabled" @click="$emit(\'click\')">{{ $attrs.label || label }}<slot /></button>',
        },
      },
    },
  })
}

function getSubmitButton(wrapper) {
  return wrapper.findAll('button').at(-1)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ResetCoachPasswordDialog', () => {
  it('shows validation errors when submitting an empty form', async () => {
    const wrapper = mountDialog()

    await getSubmitButton(wrapper).trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('New password is required.')
    expect(wrapper.text()).toContain('Confirm password is required.')
    expect(wrapper.text()).toContain('Reason is required.')
    expect(wrapper.emitted('confirm')).toBeFalsy()
  })

  it('validates the minimum password length before emitting confirm', async () => {
    const wrapper = mountDialog()

    await wrapper.find('input[type="password"]').setValue('short')
    await wrapper.findAll('input[type="password"]')[1].setValue('short')
    await wrapper.find('textarea').setValue('Routine security update')
    await getSubmitButton(wrapper).trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Password must be at least 8 characters.')
    expect(wrapper.emitted('confirm')).toBeFalsy()
  })

  it('emits the reset payload when the form is valid', async () => {
    const wrapper = mountDialog()

    await wrapper.find('input[type="password"]').setValue('coach-pass')
    await wrapper.findAll('input[type="password"]')[1].setValue('coach-pass')
    await wrapper.find('textarea').setValue('Need to rotate credentials')
    await getSubmitButton(wrapper).trigger('click')
    await flushPromises()

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')[0][0]).toEqual({
      password: 'coach-pass',
      password_confirmation: 'coach-pass',
      reason: 'Need to rotate credentials',
    })
  })
})
