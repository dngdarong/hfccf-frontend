import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import PreschoolClassesToolbar from '@/modules/preschool/admin/components/classes-management/PreschoolClassesToolbar.vue'

describe('PreschoolClassesToolbar', () => {
  it('renders the add class action as a visible button', () => {
    const wrapper = mountWithPlugins(PreschoolClassesToolbar, {
      props: {
        eyebrow: 'Class directory',
        title: '4 classes in view',
        description: 'Showing 1-4 of 4 classes',
        spotlightLabel: 'Active classes',
        spotlightValue: 4,
        addButtonLabel: 'Add Class',
      },
      messages: {
        en: {
          common: {
            states: { loading: 'Loading' },
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Add Class')
    expect(wrapper.html()).toContain('pi-plus')
  })
})
