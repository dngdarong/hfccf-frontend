import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AttendanceStatusButton from '@/modules/sport/admin/components/AttendanceStatusButton.vue'

describe('AttendanceStatusButton', () => {
  it('keeps the short label visible while exposing a full accessible label', () => {
    const wrapper = mount(AttendanceStatusButton, {
      props: {
        value: 'present',
        label: 'Present',
        short: 'P',
        activeClass: 'active',
        ringClass: 'ring',
        isActive: true,
        disabled: false,
      },
      global: {
        stubs: {
          AppButton: {
            template: '<button v-bind="$attrs"><slot /></button>',
          },
        },
      },
    })

    const button = wrapper.find('button')

    expect(button.text()).toBe('P')
    expect(button.attributes('aria-label')).toBe('Present')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.attributes('title')).toBe('Present')
  })

  it('applies active class and ring class when isActive is true', () => {
    const wrapper = mount(AttendanceStatusButton, {
      props: {
        value: 'present',
        label: 'Present',
        short: 'P',
        activeClass: 'border-emerald-600 bg-emerald-600 text-white font-bold',
        ringClass: 'ring-2 ring-emerald-300',
        isActive: true,
        disabled: false,
      },
      global: {
        stubs: {
          AppButton: {
            template: '<button v-bind="$attrs" :class="$attrs.class"><slot /></button>',
          },
        },
      },
    })

    const button = wrapper.find('button')
    const buttonClass = button.attributes('class')

    expect(buttonClass).toContain('border-emerald-600')
    expect(buttonClass).toContain('bg-emerald-600')
    expect(buttonClass).toContain('text-white')
    expect(buttonClass).toContain('ring-2')
    expect(buttonClass).toContain('ring-emerald-300')
  })

  it('does not apply active class when isActive is false', () => {
    const wrapper = mount(AttendanceStatusButton, {
      props: {
        value: 'absent',
        label: 'Absent',
        short: 'A',
        activeClass: 'border-rose-600 bg-rose-600 text-white font-bold',
        ringClass: 'ring-2 ring-rose-300',
        isActive: false,
        disabled: false,
      },
      global: {
        stubs: {
          AppButton: {
            template: '<button v-bind="$attrs" :class="$attrs.class"><slot /></button>',
          },
        },
      },
    })

    const button = wrapper.find('button')
    const buttonClass = button.attributes('class')

    expect(buttonClass).not.toContain('border-rose-600')
    expect(buttonClass).not.toContain('bg-rose-600')
  })

  it('sets aria-pressed to true when active', () => {
    const wrapper = mount(AttendanceStatusButton, {
      props: {
        value: 'late',
        label: 'Late',
        short: 'L',
        activeClass: 'active',
        ringClass: 'ring',
        isActive: true,
        disabled: false,
      },
      global: {
        stubs: {
          AppButton: {
            template: '<button v-bind="$attrs"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.find('button').attributes('aria-pressed')).toBe('true')
  })

  it('sets aria-pressed to false when not active', () => {
    const wrapper = mount(AttendanceStatusButton, {
      props: {
        value: 'excused',
        label: 'Excused',
        short: 'E',
        activeClass: 'active',
        ringClass: 'ring',
        isActive: false,
        disabled: false,
      },
      global: {
        stubs: {
          AppButton: {
            template: '<button v-bind="$attrs"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.find('button').attributes('aria-pressed')).toBe('false')
  })

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(AttendanceStatusButton, {
      props: {
        value: 'present',
        label: 'Present',
        short: 'P',
        activeClass: 'active',
        ringClass: 'ring',
        isActive: false,
        disabled: true,
      },
      global: {
        stubs: {
          AppButton: {
            template: '<button v-bind="$attrs"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(AttendanceStatusButton, {
      props: {
        value: 'present',
        label: 'Present',
        short: 'P',
        activeClass: 'active',
        ringClass: 'ring',
        isActive: false,
        disabled: false,
      },
      global: {
        stubs: {
          AppButton: {
            template: '<button v-bind="$attrs"><slot /></button>',
          },
        },
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click').length).toBeGreaterThan(0)
  })
})
