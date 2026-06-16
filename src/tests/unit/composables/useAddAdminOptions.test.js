import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { withI18nSetup } from '../../helpers/mount'
import {
  roleOptions,
  statusOptions,
  useAddAdminOptions,
} from '@/modules/super-admin/composables/useAddAdminOptions'

vi.mock('@/modules/super-admin/services/rolePermissionsApi', () => ({
  fetchRolePermissions: vi.fn(),
}))

import { fetchRolePermissions } from '@/modules/super-admin/services/rolePermissionsApi'

// ─── i18n messages ────────────────────────────────────────────────────────────

const messages = {
  en: {
    common: {
      role: {
        adminenglish: 'Admin English',
        superadmin: 'Super Admin',
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
      },
    },
  },
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('useAddAdminOptions — static exports', () => {
  it('roleOptions contains all 9 system roles', () => {
    expect(roleOptions).toHaveLength(9)
    expect(roleOptions).toContain('superadmin')
    expect(roleOptions).toContain('adminenglish')
    expect(roleOptions).toContain('adminpreschool')
    expect(roleOptions).toContain('adminscholarship')
    expect(roleOptions).toContain('adminsport')
    expect(roleOptions).toContain('coach')
    expect(roleOptions).toContain('teacher-english')
    expect(roleOptions).toContain('teacher-preschool')
    expect(roleOptions).toContain('teacher-scholarship')
  })

  it('statusOptions contains the four expected statuses in order', () => {
    expect(statusOptions).toEqual(['active', 'pending', 'inactive', 'suspended'])
  })
})

describe('useAddAdminOptions — roleLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchRolePermissions.mockResolvedValue([])
  })

  it('returns the i18n translation when the key exists', () => {
    const roleRef = ref('adminenglish')
    const { roleLabel } = withI18nSetup(() => useAddAdminOptions({ roleRef }), messages)
    expect(roleLabel('adminenglish')).toBe('Admin English')
  })

  it('falls back to the raw role value when no translation key exists', () => {
    const roleRef = ref('adminenglish')
    const { roleLabel } = withI18nSetup(() => useAddAdminOptions({ roleRef }), { en: {} })
    expect(roleLabel('adminenglish')).toBe('adminenglish')
  })

  it('returns "-" for an empty role value', () => {
    const roleRef = ref('adminenglish')
    const { roleLabel } = withI18nSetup(() => useAddAdminOptions({ roleRef }), { en: {} })
    expect(roleLabel('')).toBe('-')
    expect(roleLabel(null)).toBe('-')
  })
})

describe('useAddAdminOptions — statusLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchRolePermissions.mockResolvedValue([])
  })

  it('returns the i18n translation when the key exists', () => {
    const roleRef = ref('adminenglish')
    const { statusLabel } = withI18nSetup(() => useAddAdminOptions({ roleRef }), messages)
    expect(statusLabel('active')).toBe('Active')
    expect(statusLabel('inactive')).toBe('Inactive')
  })

  it('falls back to the raw status value when no translation key exists', () => {
    const roleRef = ref('adminenglish')
    const { statusLabel } = withI18nSetup(() => useAddAdminOptions({ roleRef }), { en: {} })
    expect(statusLabel('pending')).toBe('pending')
  })

  it('returns "-" for an empty status value', () => {
    const roleRef = ref('adminenglish')
    const { statusLabel } = withI18nSetup(() => useAddAdminOptions({ roleRef }), { en: {} })
    expect(statusLabel('')).toBe('-')
  })
})

describe('useAddAdminOptions — permission loading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchRolePermissions immediately with the initial role', async () => {
    fetchRolePermissions.mockResolvedValueOnce([{ code: 'read:users', name: 'Read Users' }])
    const roleRef = ref('adminenglish')
    const { rolePermissions } = withI18nSetup(() => useAddAdminOptions({ roleRef }), { en: {} })

    await flushPromises()

    expect(fetchRolePermissions).toHaveBeenCalledWith('adminenglish')
    expect(rolePermissions.value).toEqual([{ code: 'read:users', name: 'Read Users' }])
  })

  it('re-fetches permissions when the role ref changes', async () => {
    fetchRolePermissions.mockResolvedValue([])
    const roleRef = ref('adminenglish')
    const { rolePermissions } = withI18nSetup(() => useAddAdminOptions({ roleRef }), { en: {} })
    await flushPromises()

    fetchRolePermissions.mockResolvedValueOnce([{ code: 'coach:read', name: 'Coach Read' }])
    roleRef.value = 'coach'
    await flushPromises()

    expect(fetchRolePermissions).toHaveBeenCalledWith('coach')
    expect(rolePermissions.value).toEqual([{ code: 'coach:read', name: 'Coach Read' }])
  })

  it('sets permissions to empty array when fetchRolePermissions throws', async () => {
    fetchRolePermissions.mockRejectedValueOnce(new Error('Network error'))
    const roleRef = ref('adminenglish')
    const { rolePermissions } = withI18nSetup(() => useAddAdminOptions({ roleRef }), { en: {} })

    await flushPromises()

    expect(rolePermissions.value).toEqual([])
  })
})
