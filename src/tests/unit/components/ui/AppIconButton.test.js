import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AppIconButton from '@/components/ui/AppIconButton.vue'

describe('AppIconButton', () => {
  it('requires an accessible label and renders compact square sizing', () => {
    const wrapper = mountWithPlugins(AppIconButton, {
      props: {
        ariaLabel: 'Refresh dashboard',
        type: 'button',
      },
      slots: {
        icon: '<i class="pi pi-refresh" aria-hidden="true"></i>',
      },
    })

    expect(wrapper.attributes('aria-label')).toBe('Refresh dashboard')
    expect(wrapper.classes()).toContain('ui-icon-button')
  })

  it('forwards default slot icon markup for compatibility with legacy call sites', () => {
    const wrapper = mountWithPlugins(AppIconButton, {
      props: {
        ariaLabel: 'Toggle sidebar',
        type: 'button',
      },
      slots: {
        default: '<svg data-testid="sidebar-icon" viewBox="0 0 24 24" aria-hidden="true"></svg>',
      },
    })

    expect(wrapper.find('[data-testid="sidebar-icon"]').exists()).toBe(true)
    expect(wrapper.classes()).toContain('ui-icon-button')
    expect(wrapper.find('.ui-button__content').exists()).toBe(true)
  })

  it('renders the icon prop when no custom icon slot is provided', () => {
    const wrapper = mountWithPlugins(AppIconButton, {
      props: {
        ariaLabel: 'Refresh dashboard',
        icon: 'pi pi-refresh',
        type: 'button',
      },
      messages: {
        en: {
          common: { states: { loading: 'Loading' } },
        },
      },
    })

    expect(wrapper.attributes('aria-label')).toBe('Refresh dashboard')
    expect(wrapper.html()).toContain('pi-refresh')
    expect(wrapper.classes()).toContain('ui-icon-button')
    expect(wrapper.classes()).toContain('!text-surface-700')
    expect(wrapper.find('.ui-button__icon').exists()).toBe(true)
  })

  it('emits clicks when enabled and stays disabled while loading', async () => {
    const wrapper = mountWithPlugins(AppIconButton, {
      props: {
        ariaLabel: 'Open calendar',
        loading: true,
        type: 'button',
      },
      slots: {
        icon: '<i class="pi pi-calendar" aria-hidden="true"></i>',
      },
    })

    expect(wrapper.attributes('aria-busy')).toBe('true')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
