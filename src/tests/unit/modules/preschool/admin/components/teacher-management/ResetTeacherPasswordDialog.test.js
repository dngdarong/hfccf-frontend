import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enPreschool from '@/i18n/en/preschool'
import ResetTeacherPasswordDialog from '@/modules/preschool/admin/components/teacher-management/ResetTeacherPasswordDialog.vue'

function mountDialog(props = {}) {
  return mountWithPlugins(ResetTeacherPasswordDialog, {
    props: {
      visible: true,
      backendError: '',
      loading: false,
      ...props,
    },
    messages: {
      en: { common: enCommon, ...enPreschool },
    },
    global: {
      stubs: {
        Dialog: {
          props: ['visible', 'header'],
          template: '<section data-testid="dialog"><header>{{ header }}</header><slot /><footer><slot name="footer" /></footer></section>',
        },
        Button: {
          props: ['label', 'disabled', 'loading'],
          emits: ['click'],
          template: '<button :disabled="disabled" @click="$emit(\'click\')">{{ label }}</button>',
        },
      },
    },
  })
}

function getButton(wrapper, text) {
  return wrapper.findAll('button').find((button) => button.text().includes(text))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ResetTeacherPasswordDialog', () => {
  it('shows validation errors when submitting an empty form', async () => {
    const wrapper = mountDialog()

    await getButton(wrapper, 'Reset Password').trigger('click')
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
    await getButton(wrapper, 'Reset Password').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Password must be at least 8 characters.')
    expect(wrapper.emitted('confirm')).toBeFalsy()
  })

  it('emits the reset payload when the form is valid', async () => {
    const wrapper = mountDialog()

    await wrapper.find('input[type="password"]').setValue('teacher-pass')
    await wrapper.findAll('input[type="password"]')[1].setValue('teacher-pass')
    await wrapper.find('textarea').setValue('Need to rotate credentials')
    await getButton(wrapper, 'Reset Password').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')[0][0]).toEqual({
      password: 'teacher-pass',
      password_confirmation: 'teacher-pass',
      reason: 'Need to rotate credentials',
    })
  })
})
