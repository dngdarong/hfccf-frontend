import { describe, it, expect } from 'vitest'
import { mountWithPlugins } from '../../helpers/mount'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'

// Provide translations so the component can resolve common.status.* keys.
const messages = {
  en: {
    common: {
      status: {
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        info: 'Info',
        pending: 'Pending',
        neutral: 'Neutral',
      },
    },
  },
}

function mount(props = {}) {
  return mountWithPlugins(AppStatusChip, { props, messages })
}

describe('AppStatusChip', () => {
  // ─── rendering ─────────────────────────────────────────────────────────────

  it('renders without errors', () => {
    const wrapper = mount({ status: 'active' })
    expect(wrapper.exists()).toBe(true)
  })

  it('has role="status" for accessibility', () => {
    const wrapper = mount({ status: 'active' })
    expect(wrapper.attributes('role')).toBe('status')
  })

  // ─── size prop ─────────────────────────────────────────────────────────────

  it('applies the default compact size classes', () => {
    const wrapper = mount({ status: 'active' })
    expect(wrapper.classes()).toContain('ui-status-chip')
  })

  it('accepts size="lg"', () => {
    const wrapper = mount({ status: 'active', size: 'lg' })
    expect(wrapper.classes()).toContain('ui-status-chip')
  })

  // ─── status normalization and label translation ─────────────────────────────

  it('"active" normalizes to success and shows the translated "Success" label', () => {
    expect(mount({ status: 'active' }).attributes('aria-label')).toBe('Success')
    expect(mount({ status: 'active' }).attributes('data-status')).toBe('success')
  })

  it('"stable" normalizes to success', () => {
    expect(mount({ status: 'stable' }).attributes('aria-label')).toBe('Success')
  })

  it('"watch" normalizes to warning', () => {
    expect(mount({ status: 'watch' }).attributes('aria-label')).toBe('Warning')
  })

  it('"critical" normalizes to error', () => {
    expect(mount({ status: 'critical' }).attributes('aria-label')).toBe('Error')
  })

  it('"danger" normalizes to error', () => {
    expect(mount({ status: 'danger' }).attributes('aria-label')).toBe('Error')
  })

  it('"pending" normalizes to warning', () => {
    expect(mount({ status: 'pending' }).attributes('aria-label')).toBe('Warning')
  })

  it('falls back to normalized status name when no translation exists', () => {
    const wrapper = mountWithPlugins(AppStatusChip, {
      props: { status: 'active' },
      messages: { en: {} },
    })
    expect(wrapper.attributes('aria-label')).toBe('success')
  })

  // ─── custom label prop ─────────────────────────────────────────────────────

  it('uses custom label as-is when translateLabel is false', () => {
    const wrapper = mount({ status: 'active', label: 'My Custom Status', translateLabel: false })
    expect(wrapper.attributes('aria-label')).toBe('My Custom Status')
  })

  it('translates custom label key when translateLabel is true and the key exists', () => {
    const wrapper = mountWithPlugins(AppStatusChip, {
      props: { status: 'active', label: 'success', translateLabel: true },
      messages,
    })
    expect(wrapper.attributes('aria-label')).toBe('Success')
  })

  it('uses custom label verbatim when translateLabel is true but no translation exists', () => {
    const wrapper = mount({ status: 'active', label: 'UnknownLabel', translateLabel: true })
    expect(wrapper.attributes('aria-label')).toBe('UnknownLabel')
  })
})
