import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AppFilterChip from '@/components/ui/AppFilterChip.vue'

describe('AppFilterChip', () => {
  it('renders selected and unselected states', () => {
    const wrapper = mountWithPlugins(AppFilterChip, {
      props: {
        label: 'Today',
        selected: true,
      },
    })

    expect(wrapper.attributes('aria-pressed')).toBe('true')
    expect(wrapper.classes()).toContain('!bg-brand-primary-50')
  })

  it('blocks interaction when disabled', async () => {
    const wrapper = mountWithPlugins(AppFilterChip, {
      props: {
        label: 'Active',
        disabled: true,
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
