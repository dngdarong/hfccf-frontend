import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AppBadge from '@/components/ui/AppBadge.vue'

describe('AppBadge', () => {
  it('renders neutral and info variants with truncation-safe attributes', () => {
    const wrapper = mountWithPlugins(AppBadge, {
      props: {
        label: 'Admin',
        variant: 'admin',
        size: 'xs',
      },
    })

    expect(wrapper.text()).toContain('Admin')
    expect(wrapper.attributes('title')).toBe('Admin')
    expect(wrapper.classes()).toContain('ui-badge')
  })

  it('accepts longer labels for sidebar/count badges', () => {
    const wrapper = mountWithPlugins(AppBadge, {
      props: {
        label: '123',
        variant: 'neutral',
        size: 'xs',
      },
    })

    expect(wrapper.text()).toContain('123')
  })
})
