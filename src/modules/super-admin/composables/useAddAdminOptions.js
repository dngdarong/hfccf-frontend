import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ROLES } from '@/constants/roles'
import { fetchRolePermissions } from '@/modules/super-admin/services/rolePermissionsApi'

export const roleOptions = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN_ENGLISH,
  ROLES.ADMIN_PRESCHOOL,
  ROLES.ADMIN_SCHOLARSHIP,
  ROLES.ADMIN_SPORT,
  ROLES.COACH,
  ROLES.TEACHER_ENGLISH,
  ROLES.TEACHER_PRESCHOOL,
  ROLES.TEACHER_SCHOLARSHIP,
]

export const statusOptions = ['active', 'pending', 'inactive', 'suspended']

/**
 * Role/status label helpers and reactive permission loading.
 * @param {{ roleRef: import('vue').Ref<string> }} options
 */
export function useAddAdminOptions({ roleRef }) {
  const { t } = useI18n()

  const rolePermissions = ref([])
  const rolePermissionsLoading = ref(false)
  let requestId = 0

  function statusLabel(status) {
    const normalized = String(status || '').trim()
    if (!normalized) return '-'
    const key = `common.status.${normalized.replace(/[\s-]+/g, '_').toLowerCase()}`
    const translated = t(key)
    return translated !== key ? translated : String(status || '')
  }

  function roleLabel(value) {
    const normalized = String(value || '').trim()
    if (!normalized) return '-'
    const key = `common.role.${normalized.replace(/[\s-]+/g, '_').toLowerCase()}`
    const translated = t(key)
    return translated !== key ? translated : String(value || '')
  }

  watch(
    roleRef,
    async (nextRole) => {
      const id = ++requestId
      rolePermissionsLoading.value = true
      try {
        const permissions = await fetchRolePermissions(nextRole)
        if (id === requestId) rolePermissions.value = permissions
      } catch {
        if (id === requestId) rolePermissions.value = []
      } finally {
        if (id === requestId) rolePermissionsLoading.value = false
      }
    },
    { immediate: true },
  )

  return {
    rolePermissions,
    rolePermissionsLoading,
    statusLabel,
    roleLabel,
  }
}
