import { vi, describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { mount as vtuMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { mountWithPlugins, createTestI18n, createTestRouter } from '../../helpers/mount'
import AddAdmin from '@/modules/super-admin/pages/AddAdmin.vue'

// ─── mock service layer ───────────────────────────────────────────────────────

vi.mock('@/modules/super-admin/services/adminUsersApi', () => ({
  createAdminUser: vi.fn(),
  findAdminUserById: vi.fn(),
  updateAdminUser: vi.fn(),
}))

vi.mock('@/modules/super-admin/services/rolePermissionsApi', () => ({
  fetchRolePermissions: vi.fn(),
}))

vi.mock('@/utils/imageOptimization', () => ({
  optimizeImageFile: vi.fn(async (file) => file),
}))

import { createAdminUser, findAdminUserById, updateAdminUser } from '@/modules/super-admin/services/adminUsersApi'
import { fetchRolePermissions } from '@/modules/super-admin/services/rolePermissionsApi'
import { optimizeImageFile } from '@/utils/imageOptimization'

// ─── i18n messages ────────────────────────────────────────────────────────────

const messages = {
  en: {
    common: {
      cancel: 'Cancel',
      close: 'Close',
    },
    users: {
      addAdmin: {
        title: 'Add User',
        updateTitle: 'Update User',
      },
    },
  },
}

// ─── component stubs ─────────────────────────────────────────────────────────

const stubs = {
  MainLayout: { template: '<slot />' },
  HeaderSection: { props: ['title', 'subtitle'], template: '<div />' },
  Form: {
    name: 'Form',
    props: ['loading'],
    emits: ['submit', 'cancel'],
    template: `<form @submit.prevent="$emit('submit')">
      <slot />
      <slot name="actions" />
    </form>`,
  },
  Button: {
    props: ['loading', 'disabled', 'type'],
    emits: ['click'],
    template: `<button :type="type || 'button'" :disabled="disabled" @click="$emit('click')">
      <slot />
    </button>`,
  },
  AlertSuccess: {
    name: 'AlertSuccess',
    props: ['show', 'title', 'message', 'buttonText'],
    emits: ['close'],
    template: `<div v-if="show" data-testid="alert-success" :data-title="title" @click="$emit('close')" />`,
  },
  AlertError: {
    name: 'AlertError',
    props: ['show', 'title', 'message', 'buttonText'],
    emits: ['close'],
    template: `<div v-if="show" data-testid="alert-error" :data-message="message" @click="$emit('close')" />`,
  },
  AdminSummaryCards: { props: ['cards'], template: '<div />' },
  AdminChecklistPanel: {
    props: ['title', 'description', 'items', 'highlightLabel', 'highlightValue'],
    template: '<div />',
  },
  AddAdminProfileImageField: {
    name: 'AddAdminProfileImageField',
    props: ['title', 'preview', 'fallbackLabel', 'removeLabel', 'disabled'],
    emits: ['change', 'remove'],
    template: '<div data-testid="profile-image-field" />',
  },
  AddAdminIdentityFields: {
    name: 'AddAdminIdentityFields',
    props: [
      'name', 'email', 'phone', 'role', 'status',
      'roleOptions', 'statusOptions', 'disabled',
      'nameLabel', 'emailLabel', 'phoneLabel', 'roleLabelText', 'statusLabelText',
      'namePlaceholder', 'emailPlaceholder', 'phonePlaceholder',
      'roleLabel', 'statusLabel',
    ],
    emits: ['update:name', 'update:email', 'update:phone', 'update:role', 'update:status'],
    template: '<div data-testid="identity-fields" />',
  },
  AddAdminBioField: {
    name: 'AddAdminBioField',
    props: ['bio', 'label', 'placeholder', 'helpText', 'disabled'],
    emits: ['update:bio'],
    template: '<div data-testid="bio-field" />',
  },
  AddAdminPasswordFields: {
    name: 'AddAdminPasswordFields',
    props: [
      'password', 'confirmPassword', 'disabled',
      'passwordVisible', 'confirmPasswordVisible',
      'passwordLabel', 'confirmPasswordLabel',
      'passwordPlaceholder', 'confirmPasswordPlaceholder',
      'showPasswordLabel', 'hidePasswordLabel',
    ],
    emits: ['update:password', 'update:confirmPassword', 'toggle-password', 'toggle-confirm-password'],
    template: '<div data-testid="password-fields" />',
  },
  RolePermissionsPreview: {
    name: 'RolePermissionsPreview',
    props: ['role', 'permissions', 'loading'],
    template: '<div data-testid="role-permissions" />',
  },
}

// ─── mount helpers ────────────────────────────────────────────────────────────

function mountCreate() {
  return mountWithPlugins(AddAdmin, {
    messages,
    routes: [{ path: '/module/super-admin/users/manage', component: { template: '<div />' } }],
    global: { stubs },
  })
}

async function mountEdit(userId = 'usr_0001') {
  const i18n = createTestI18n(messages)
  const pinia = createPinia()
  const router = createTestRouter([
    { path: '/module/super-admin/users/manage', component: { template: '<div />' } },
  ])
  // Navigate BEFORE mounting so isEditMode is true when onMounted fires.
  await router.push({ path: '/', query: { id: userId } })

  return vtuMount(AddAdmin, {
    global: {
      plugins: [i18n, pinia, router],
      stubs,
    },
  })
}

// ─── fill helpers ─────────────────────────────────────────────────────────────

function fillValidCreateForm(wrapper) {
  const id = wrapper.findComponent({ name: 'AddAdminIdentityFields' })
  id.vm.$emit('update:name', 'John Doe')
  id.vm.$emit('update:email', 'john@test.com')
  id.vm.$emit('update:role', 'adminenglish')
  id.vm.$emit('update:status', 'active')
  const pw = wrapper.findComponent({ name: 'AddAdminPasswordFields' })
  pw.vm.$emit('update:password', 'password123')
  pw.vm.$emit('update:confirmPassword', 'password123')
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('AddAdmin page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchRolePermissions.mockResolvedValue([])
  })

  // ─── initial render ─────────────────────────────────────────────────────────

  it('renders all major field components', async () => {
    const wrapper = mountCreate()
    await flushPromises()

    expect(wrapper.find('[data-testid="identity-fields"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="bio-field"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="password-fields"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="role-permissions"]').exists()).toBe(true)
  })

  it('does not show success or error alerts on initial render', async () => {
    const wrapper = mountCreate()
    await flushPromises()

    expect(wrapper.find('[data-testid="alert-success"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="alert-error"]').exists()).toBe(false)
  })

  it('fetches permissions for the default role on mount', async () => {
    mountCreate()
    await flushPromises()

    expect(fetchRolePermissions).toHaveBeenCalledWith('adminenglish')
  })

  it('re-fetches permissions when role changes', async () => {
    const wrapper = mountCreate()
    await flushPromises()

    wrapper.findComponent({ name: 'AddAdminIdentityFields' }).vm.$emit('update:role', 'adminsport')
    await flushPromises()

    expect(fetchRolePermissions).toHaveBeenCalledWith('adminsport')
  })

  // ─── create mode — validation ─────────────────────────────────────────────

  it('shows error and does not submit when name is empty', async () => {
    const wrapper = mountCreate()
    await flushPromises()

    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    expect(wrapper.find('[data-testid="alert-error"]').exists()).toBe(true)
    expect(createAdminUser).not.toHaveBeenCalled()
  })

  it('shows error when password is shorter than 8 characters', async () => {
    const wrapper = mountCreate()
    await flushPromises()

    const id = wrapper.findComponent({ name: 'AddAdminIdentityFields' })
    id.vm.$emit('update:name', 'John Doe')
    id.vm.$emit('update:email', 'john@test.com')
    wrapper.findComponent({ name: 'AddAdminPasswordFields' }).vm.$emit('update:password', 'short')
    await nextTick()

    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    expect(wrapper.find('[data-testid="alert-error"]').exists()).toBe(true)
    expect(createAdminUser).not.toHaveBeenCalled()
  })

  it('shows error when passwords do not match', async () => {
    const wrapper = mountCreate()
    await flushPromises()

    const id = wrapper.findComponent({ name: 'AddAdminIdentityFields' })
    id.vm.$emit('update:name', 'John Doe')
    id.vm.$emit('update:email', 'john@test.com')
    const pw = wrapper.findComponent({ name: 'AddAdminPasswordFields' })
    pw.vm.$emit('update:password', 'password123')
    pw.vm.$emit('update:confirmPassword', 'differentpass')
    await nextTick()

    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    expect(wrapper.find('[data-testid="alert-error"]').exists()).toBe(true)
    expect(createAdminUser).not.toHaveBeenCalled()
  })

  // ─── create mode — submit ─────────────────────────────────────────────────

  it('calls createAdminUser with the correct payload on valid submit', async () => {
    createAdminUser.mockResolvedValueOnce({ id: 'usr_0001' })
    const wrapper = mountCreate()
    await flushPromises()

    fillValidCreateForm(wrapper)
    await nextTick()

    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    expect(createAdminUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@test.com',
        role: 'adminenglish',
        status: 'active',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    )
  })

  it('submits the optimized avatar file when one is selected', async () => {
    const optimizedAvatar = new File([new Uint8Array([1, 2, 3])], 'compressed-avatar.jpg', {
      type: 'image/jpeg',
    })
    optimizeImageFile.mockResolvedValueOnce(optimizedAvatar)
    createAdminUser.mockResolvedValueOnce({ id: 'usr_0001' })

    const wrapper = mountCreate()
    await flushPromises()

    fillValidCreateForm(wrapper)
    await nextTick()

    const originalAvatar = new File([new Uint8Array([9, 8, 7])], 'avatar.jpg', {
      type: 'image/jpeg',
    })

    wrapper.findComponent({ name: 'AddAdminProfileImageField' }).vm.$emit('change', {
      target: { files: [originalAvatar], value: '' },
    })
    await flushPromises()

    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    expect(optimizeImageFile).toHaveBeenCalledWith(
      originalAvatar,
      expect.objectContaining({
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.84,
      }),
    )
    expect(createAdminUser).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar: optimizedAvatar,
      }),
    )
  })

  it('shows success alert after successful create', async () => {
    createAdminUser.mockResolvedValueOnce({ id: 'usr_0001' })
    const wrapper = mountCreate()
    await flushPromises()

    fillValidCreateForm(wrapper)
    await nextTick()

    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    expect(wrapper.find('[data-testid="alert-success"]').exists()).toBe(true)
  })

  it('shows error alert with the server message when createAdminUser rejects', async () => {
    createAdminUser.mockRejectedValueOnce(new Error('Email already taken.'))
    const wrapper = mountCreate()
    await flushPromises()

    fillValidCreateForm(wrapper)
    await nextTick()

    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    const alert = wrapper.find('[data-testid="alert-error"]')
    expect(alert.exists()).toBe(true)
    expect(alert.attributes('data-message')).toBe('Email already taken.')
  })

  it('hides error alert after close', async () => {
    const wrapper = mountCreate()
    await flushPromises()

    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    expect(wrapper.find('[data-testid="alert-error"]').exists()).toBe(true)
    wrapper.findComponent({ name: 'AlertError' }).vm.$emit('close')
    await nextTick()
    expect(wrapper.find('[data-testid="alert-error"]').exists()).toBe(false)
  })

  // ─── edit mode ────────────────────────────────────────────────────────────

  it('calls findAdminUserById and populates form fields in edit mode', async () => {
    findAdminUserById.mockResolvedValueOnce({
      id: 'usr_0001',
      name: 'Jane Admin',
      email: 'jane@test.com',
      phone: '012345678',
      bio: 'Test bio',
      role: 'adminenglish',
      status: 'active',
      avatar: null,
    })

    const wrapper = await mountEdit('usr_0001')
    await flushPromises()

    expect(findAdminUserById).toHaveBeenCalledWith('usr_0001')
    const identityFields = wrapper.findComponent({ name: 'AddAdminIdentityFields' })
    expect(identityFields.props('name')).toBe('Jane Admin')
    expect(identityFields.props('email')).toBe('jane@test.com')
  })

  it('calls updateAdminUser on submit in edit mode', async () => {
    findAdminUserById.mockResolvedValueOnce({
      id: 'usr_0001',
      name: 'Jane Admin',
      email: 'jane@test.com',
      role: 'adminenglish',
      status: 'active',
      avatar: null,
    })
    updateAdminUser.mockResolvedValueOnce({ id: 'usr_0001' })

    const wrapper = await mountEdit('usr_0001')
    await flushPromises()

    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    expect(updateAdminUser).toHaveBeenCalledWith(
      'usr_0001',
      expect.objectContaining({ name: 'Jane Admin', email: 'jane@test.com' }),
    )
  })

  it('in edit mode, empty password is allowed (no validation error)', async () => {
    findAdminUserById.mockResolvedValueOnce({
      id: 'usr_0001',
      name: 'Jane Admin',
      email: 'jane@test.com',
      role: 'adminenglish',
      status: 'active',
      avatar: null,
    })
    updateAdminUser.mockResolvedValueOnce({ id: 'usr_0001' })

    const wrapper = await mountEdit('usr_0001')
    await flushPromises()

    // Do NOT fill password — it should be optional in edit mode
    wrapper.findComponent({ name: 'Form' }).vm.$emit('submit')
    await flushPromises()

    expect(updateAdminUser).toHaveBeenCalled()
    expect(wrapper.find('[data-testid="alert-error"]').exists()).toBe(false)
  })

  // ─── avatar error propagation ─────────────────────────────────────────────

  it('shows error alert when profile image has an invalid type', async () => {
    const wrapper = mountCreate()
    await flushPromises()

    const fakeFile = { type: 'image/gif', size: 1000 }
    wrapper.findComponent({ name: 'AddAdminProfileImageField' }).vm.$emit('change', {
      target: { files: [fakeFile], value: '' },
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="alert-error"]').exists()).toBe(true)
  })

  it('shows error alert when profile image exceeds 2 MB', async () => {
    const wrapper = mountCreate()
    await flushPromises()

    const fakeFile = { type: 'image/jpeg', size: 3 * 1024 * 1024 }
    wrapper.findComponent({ name: 'AddAdminProfileImageField' }).vm.$emit('change', {
      target: { files: [fakeFile], value: '' },
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="alert-error"]').exists()).toBe(true)
  })
})
