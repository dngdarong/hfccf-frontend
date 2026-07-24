import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import Button from '@/components/buttons/Button.vue'

describe('Button wrapper', () => {
  it('forwards default slot text and icon slots to AppButton', () => {
    const wrapper = mountWithPlugins(Button, {
      props: {
        type: 'button',
        variant: 'secondary',
      },
      slots: {
        default: 'Health Records',
        iconLeft: '<i class="pi pi-heart" aria-hidden="true"></i>',
        iconRight: '<i class="pi pi-arrow-right" aria-hidden="true"></i>',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.text()).toContain('Health Records')
    expect(wrapper.html()).toContain('pi-heart')
    expect(wrapper.html()).toContain('pi-arrow-right')
  })

  it('maps legacy severity and icon slot props to the shared button system', () => {
    const wrapper = mountWithPlugins(Button, {
      props: {
        type: 'button',
        severity: 'danger',
      },
      slots: {
        default: 'Delete',
        icon: '<i class="pi pi-trash" aria-hidden="true"></i>',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.text()).toContain('Delete')
    expect(wrapper.html()).toContain('pi-trash')
    expect(wrapper.classes()).toContain('!bg-rose-600')
  })

  it('supports legacy link-style buttons and disabled state', () => {
    const wrapper = mountWithPlugins(Button, {
      props: {
        type: 'button',
        link: true,
        disabled: true,
      },
      slots: {
        default: 'Read more',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.text()).toContain('Read more')
    expect(wrapper.classes()).toContain('!px-0')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('forwards label prop text through the wrapper', () => {
    const wrapper = mountWithPlugins(Button, {
      props: {
        type: 'button',
        variant: 'ghost',
        label: 'ត្រឡប់ទៅបញ្ជីសិស្ស',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.text()).toContain('ត្រឡប់ទៅបញ្ជីសិស្ស')
  })

  it('supports legacy icon-only usage and right-positioned icons', () => {
    const wrapper = mountWithPlugins(Button, {
      props: {
        type: 'button',
        outlined: true,
        icon: 'pi pi-arrow-right',
        iconPos: 'right',
        label: 'Open',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.text()).toContain('Open')
    expect(wrapper.html()).toContain('pi-arrow-right')
    expect(wrapper.find('.p-button-label').exists()).toBe(true)
  })
})
