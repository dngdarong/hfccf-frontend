import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AddCoachFormFields from '@/modules/sport/admin/components/add-coach/AddCoachFormFields.vue'

function mountComponent(showPasswordFields) {
  return mountWithPlugins(AddCoachFormFields, {
    props: {
      profileImagePreview: '',
      roleOptions: [],
      statusOptions: [],
      permissions: [],
      name: 'Coach One',
      email: 'coach.one@example.com',
      phone: '012345678',
      role: 'coach',
      status: 'active',
      password: 'coach-pass',
      confirmPassword: 'coach-pass',
      isLocked: false,
      isPasswordVisible: false,
      isConfirmPasswordVisible: false,
      roleLabel: (value) => value,
      statusLabel: (value) => value,
      permissionLabel: (value) => value,
      showPasswordFields,
    },
    global: {
      stubs: {
        AddAdminProfileImageField: { template: '<div data-testid="profile-image-field" />' },
        AddAdminIdentityFields: { template: '<div data-testid="identity-fields" />' },
        RolePermissionsPreview: { template: '<div data-testid="permissions-preview" />' },
        AddAdminPasswordFields: { template: '<div data-testid="password-fields" />' },
      },
    },
  })
}

describe('AddCoachFormFields', () => {
  it('renders password fields in add mode', () => {
    const wrapper = mountComponent(true)

    expect(wrapper.find('[data-testid="password-fields"]').exists()).toBe(true)
  })

  it('hides password fields in edit mode', () => {
    const wrapper = mountComponent(false)

    expect(wrapper.find('[data-testid="password-fields"]').exists()).toBe(false)
  })
})
