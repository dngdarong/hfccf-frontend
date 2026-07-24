import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import ActionsButton from '@/components/buttons/ActionsButton.vue'

describe('ActionsButton', () => {
  it('renders a visible trigger icon with an accessible label', () => {
    const wrapper = mountWithPlugins(ActionsButton, {
      props: {
        item: { id: 1 },
      },
      global: {
        stubs: {
          Menu: {
            name: 'Menu',
            template: '<div data-testid="menu-stub" />',
          },
        },
      },
      messages: {
        en: {
          common: {
            actions: {
              menu: 'Actions',
              view: 'View',
              edit: 'Edit',
              delete: 'Delete',
              reset: 'Reset',
            },
          },
        },
      },
    })

    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.html()).toContain('pi-ellipsis-h')
    expect(wrapper.find('[aria-label="Actions"]').exists()).toBe(true)
    expect(wrapper.find('.ui-button__icon i').exists()).toBe(true)
    expect(wrapper.find('.ui-button__content').classes()).toContain('ui-button__content--icon-only')
  })
})
