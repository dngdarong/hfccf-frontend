import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AddPlayerFormActions from '@/modules/sport/admin/components/add-player/AddPlayerFormActions.vue'

describe('AddPlayerFormActions', () => {
  it('renders a read-only edit action in view mode', () => {
    const wrapper = mountWithPlugins(AddPlayerFormActions, {
      props: {
        isViewMode: true,
        isEditMode: false,
        isSubmitting: false,
      },
      messages: {
        en: {
          sportAddPlayer: {
            editAction: 'Edit Player',
            createAction: 'Create Player',
            updateAction: 'Save Changes',
          },
          common: {
            cancel: 'Cancel',
          },
        },
      },
      global: {
        stubs: {
          Button: {
            template: '<button type="button"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Edit Player')
    expect(wrapper.text()).not.toContain('Create Player')
    expect(wrapper.text()).not.toContain('Save Changes')
  })

  it('renders the cancel and submit actions in edit mode', () => {
    const wrapper = mountWithPlugins(AddPlayerFormActions, {
      props: {
        isViewMode: false,
        isEditMode: true,
        isSubmitting: false,
      },
      messages: {
        en: {
          sportAddPlayer: {
            editAction: 'Edit Player',
            createAction: 'Create Player',
            updateAction: 'Save Changes',
          },
          common: {
            cancel: 'Cancel',
          },
        },
      },
      global: {
        stubs: {
          Button: {
            template: '<button type="button"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Save Changes')
    expect(wrapper.text()).not.toContain('Edit Player')
  })
})
