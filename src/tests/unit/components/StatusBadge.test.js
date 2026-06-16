import { describe, it, expect } from 'vitest'
import { mountWithPlugins } from '../../helpers/mount'
import StatusBadge from '@/components/badges/StatusBadge.vue'

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
  return mountWithPlugins(StatusBadge, { props, messages })
}

// The Tag stub in mountWithPlugins renders:
//   <span v-bind="$attrs" :data-status-label="value">...</span>
// So wrapper.attributes('data-status-label') gives us the resolved statusLabel,
// and wrapper.classes() gives us the class bindings passed to Tag.

describe('StatusBadge', () => {
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

  it('applies ui-tag--md class by default', () => {
    const wrapper = mount({ status: 'active' })
    expect(wrapper.classes()).toContain('ui-tag--md')
  })

  it('applies ui-tag--lg class when size="lg"', () => {
    const wrapper = mount({ status: 'active', size: 'lg' })
    expect(wrapper.classes()).toContain('ui-tag--lg')
    expect(wrapper.classes()).not.toContain('ui-tag--md')
  })

  it('applies ui-tag--sm class when size="sm"', () => {
    const wrapper = mount({ status: 'active', size: 'sm' })
    expect(wrapper.classes()).toContain('ui-tag--sm')
  })

  // ─── status normalization and label translation ─────────────────────────────

  it('"active" normalizes to success and shows the translated "Success" label', () => {
    // normalizeStatus('active') → 'success'
    // te('common.status.success') → true → t('common.status.success') → 'Success'
    expect(mount({ status: 'active' }).attributes('data-status-label')).toBe('Success')
  })

  it('"stable" normalizes to success', () => {
    expect(mount({ status: 'stable' }).attributes('data-status-label')).toBe('Success')
  })

  it('"watch" normalizes to warning', () => {
    expect(mount({ status: 'watch' }).attributes('data-status-label')).toBe('Warning')
  })

  it('"critical" normalizes to error', () => {
    expect(mount({ status: 'critical' }).attributes('data-status-label')).toBe('Error')
  })

  it('"pending" normalizes to info', () => {
    expect(mount({ status: 'pending' }).attributes('data-status-label')).toBe('Info')
  })

  it('falls back to normalized status name when no translation exists', () => {
    // Mount without providing any translations so te() returns false.
    const wrapper = mountWithPlugins(StatusBadge, {
      props: { status: 'active' },
      messages: { en: {} },
    })
    expect(wrapper.attributes('data-status-label')).toBe('success')
  })

  // ─── custom label prop ─────────────────────────────────────────────────────

  it('uses custom label as-is when translateLabel is false', () => {
    const wrapper = mount({ status: 'active', label: 'My Custom Status', translateLabel: false })
    expect(wrapper.attributes('data-status-label')).toBe('My Custom Status')
  })

  it('translates custom label key when translateLabel is true and the key exists', () => {
    const wrapper = mountWithPlugins(StatusBadge, {
      props: { status: 'active', label: 'success', translateLabel: true },
      messages,
    })
    // toStatusKey('success') = 'success' → te('common.status.success') = true → 'Success'
    expect(wrapper.attributes('data-status-label')).toBe('Success')
  })

  it('uses custom label verbatim when translateLabel is true but no translation exists', () => {
    const wrapper = mount({ status: 'active', label: 'UnknownLabel', translateLabel: true })
    // te('common.status.unknownlabel') = false → falls back to raw label
    expect(wrapper.attributes('data-status-label')).toBe('UnknownLabel')
  })
})
