import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AppButton from '@/components/ui/AppButton.vue'

describe('AppButton', () => {
  it('renders the primary style by default', () => {
    const wrapper = mountWithPlugins(AppButton, {
      props: { type: 'button' },
      slots: { default: 'Save' },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.text()).toContain('Save')
    expect(wrapper.classes()).toContain('ui-button')
    expect(wrapper.classes()).toContain('!bg-brand-600')
  })

  it('renders label prop text without clipping the button content path', () => {
    const wrapper = mountWithPlugins(AppButton, {
      props: {
        type: 'button',
        variant: 'secondary',
        label: 'ត្រឡប់ទៅបញ្ជីសិស្ស',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.text()).toContain('ត្រឡប់ទៅបញ្ជីសិស្ស')
    expect(wrapper.classes()).toContain('ui-button')
    expect(wrapper.classes()).toContain('!text-slate-800')
  })

  it('renders outline buttons with a dark readable foreground', () => {
    const wrapper = mountWithPlugins(AppButton, {
      props: {
        type: 'button',
        variant: 'outline',
        label: 'Clear',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.text()).toContain('Clear')
    expect(wrapper.classes()).toContain('!bg-white')
    expect(wrapper.classes()).toContain('!text-slate-800')
  })

  it('renders icon prop text and icon content together', () => {
    const wrapper = mountWithPlugins(AppButton, {
      props: {
        type: 'button',
        variant: 'secondary',
        icon: 'pi pi-save',
        label: 'Save',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.text()).toContain('Save')
    expect(wrapper.html()).toContain('pi-save')
    expect(wrapper.find('.ui-button__content').exists()).toBe(true)
    expect(wrapper.find('.p-button-label').exists()).toBe(true)
    expect(wrapper.find('.p-button-icon').exists()).toBe(true)
    expect(wrapper.find('.ui-button__label').exists()).toBe(true)
    expect(wrapper.find('.ui-button__icon').exists()).toBe(true)
  })

  it('prefers icon slots over the icon prop when both are provided', () => {
    const wrapper = mountWithPlugins(AppButton, {
      props: {
        type: 'button',
        variant: 'secondary',
        icon: 'pi pi-save',
      },
      slots: {
        iconLeft: '<svg data-testid="custom-icon" viewBox="0 0 24 24" aria-hidden="true"></svg>',
        default: 'Save',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('pi-save')
    expect(wrapper.find('.ui-button__icon').exists()).toBe(true)
  })

  it('renders icon-only buttons with a visible icon hook for legacy styling', () => {
    const wrapper = mountWithPlugins(AppButton, {
      props: {
        type: 'button',
        variant: 'secondary',
        icon: 'pi pi-eye',
        'aria-label': 'View',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.attributes('aria-label')).toBe('View')
    expect(wrapper.html()).toContain('pi-eye')
    expect(wrapper.find('.ui-button__content').exists()).toBe(true)
    expect(wrapper.find('.ui-button__content').classes()).toContain('ui-button__content--icon-only')
    expect(wrapper.find('.p-button-icon').exists()).toBe(true)
  })

  it('applies the secondary style and emits click events', async () => {
    const wrapper = mountWithPlugins(AppButton, {
      props: { variant: 'secondary', type: 'button' },
      slots: { default: 'View' },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.classes()).toContain('!bg-white')
    expect(wrapper.classes()).toContain('!text-slate-800')
  })

  it('renders loading state text and suppresses clicks', async () => {
    const wrapper = mountWithPlugins(AppButton, {
      props: { loading: true, type: 'button' },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('Loading')

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('keeps Khmer default-slot text visible in the rendered label path', () => {
    const previousLang = document.documentElement.lang
    document.documentElement.lang = 'kh'

    try {
      const wrapper = mountWithPlugins(AppButton, {
        props: { type: 'button', variant: 'ghost' },
        slots: { default: 'ត្រឡប់ទៅបញ្ជីសិស្ស' },
        messages: {
          en: {
            common: { states: { loading: 'Loading' } },
          },
        },
      })

      expect(wrapper.text()).toContain('ត្រឡប់ទៅបញ្ជីសិស្ស')
      expect(wrapper.html()).toContain('ui-button__label')
    } finally {
      document.documentElement.lang = previousLang
    }
  })
})
