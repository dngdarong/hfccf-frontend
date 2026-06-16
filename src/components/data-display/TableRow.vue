<script setup>
/**
 * UsersTableRow
 * --------------------------------------------------------------------------
 * Reusable table row for user-style data.
 *
 * Features:
 * - Dynamic columns
 * - Avatar image with initials fallback
 * - Role, permission, and status badges
 * - Row action menu
 * - Safe fallback values
 * --------------------------------------------------------------------------
 */

import { computed, ref, watch } from 'vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import RolesBadge from '@/components/badges/RolesBadge.vue'
import PermissionBadge from '@/components/badges/PermissionBadge.vue'
import ActionsButton from '@/components/buttons/ActionsButton.vue'
import { ROLES, normalizeRole } from '@/constants/roles'
import { getAvatarInitials, resolveAvatarSource } from '@/utils/avatar'

defineOptions({
  name: 'UsersTableRow',
})

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  row: {
    type: Object,
    default: null,
  },
  rowNumber: {
    type: Number,
    default: null,
  },
  columns: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['view', 'edit', 'delete'])

/**
 * Track avatar load failure for current row.
 */
const hasImageError = ref(false)
const isImageLoaded = ref(false)

/**
 * Keep permission columns compact so rows remain readable.
 */
const MAX_VISIBLE_PERMISSIONS = 3

/**
 * Prefer explicit row prop, fallback to user prop.
 */
const resolvedRow = computed(() =>
  props.row && typeof props.row === 'object' ? props.row : props.user,
)

/**
 * Default column structure.
 */
const resolvedColumns = computed(() =>
  props.columns.length
    ? props.columns
    : [
        { key: 'number', align: 'left' },
        { key: 'user', align: 'left' },
        { key: 'email', align: 'left' },
        { key: 'role', align: 'left' },
        { key: 'permission', align: 'left' },
        { key: 'status', align: 'left' },
        { key: 'phone', align: 'left' },
        { key: 'actions', align: 'right' },
      ],
)

/**
 * Normalize row status for badge tone.
 */
const statusType = computed(() => {
  const value = String(resolvedRow.value?.status || '').trim().toLowerCase()

  if (value === 'active') return 'success'
  if (value === 'pending') return 'info'
  if (value === 'inactive') return 'warning'
  if (value === 'suspended') return 'error'

  return 'info'
})

/**
 * Display status label.
 */
const statusText = computed(() =>
  String(resolvedRow.value?.status || 'Unknown'),
)

/**
 * Resolve row display number.
 */
const displayNumber = computed(() => {
  if (Number.isFinite(props.rowNumber) && props.rowNumber > 0) {
    return props.rowNumber
  }

  const parsed = Number.parseInt(
    String(resolvedRow.value?.id || '').replace(/\D/g, ''),
    10,
  )

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
})

/**
 * User ID display fallback.
 */
const userIdLabel = computed(() => {
  const value = String(resolvedRow.value?.id || '').trim()

  return value || '-'
})

/**
 * Resolve permissions from array or comma-separated string.
 */
const permissionList = computed(() => {
  const explicit = Array.isArray(resolvedRow.value?.permissions)
    ? resolvedRow.value.permissions
    : []

  if (explicit.length) {
    return explicit
  }

  return String(resolvedRow.value?.permission || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
})

/**
 * Render only the first few permission badges in the cell.
 */
const visiblePermissions = computed(() =>
  permissionList.value.slice(0, MAX_VISIBLE_PERMISSIONS),
)

/**
 * Count the hidden permissions that collapse into the overflow pill.
 */
const hiddenPermissionCount = computed(() =>
  Math.max(permissionList.value.length - MAX_VISIBLE_PERMISSIONS, 0),
)

/**
 * Show the remaining permission labels in the tooltip for quick inspection.
 */
const hiddenPermissionLabel = computed(() =>
  permissionList.value.slice(MAX_VISIBLE_PERMISSIONS).join(', '),
)

/**
 * Format phone text.
 */
function phoneLabel(phone) {
  const value = String(phone || '').trim()

  return value || '-'
}

/**
 * Format username with @ prefix.
 */
function usernameLabel(username) {
  const value = String(username || '').trim()

  if (!value) return '-'

  return value.startsWith('@') ? value : `@${value}`
}

/**
 * Resolve avatar source from supported fields.
 */
function avatarSrc(row) {
  if (hasImageError.value) return ''

  return resolveAvatarSource(row?.avatar || row?.avatarUrl || row?.profileImage || row?.photo)
}

/**
 * Determine whether the avatar image should be rendered.
 */
const shouldShowImage = computed(() =>
  Boolean(avatarSrc(resolvedRow.value)) && Boolean(isImageLoaded.value) && !hasImageError.value,
)

/**
 * Build initials from user name.
 */
function userInitials(row) {
  return getAvatarInitials(row?.name, '?')
}

/**
 * Avatar background class by role.
 */
function getInitialBadgeClass(role) {
  const normalized = normalizeRole(role)

  if (normalized === ROLES.SUPER_ADMIN) return 'bg-indigo-600'
  if (normalized === ROLES.COACH) return 'bg-hope-yellow'
  if (normalized === ROLES.ADMIN_SPORT) return 'bg-hope-red'

  if (
    normalized === ROLES.TEACHER_PRESCHOOL ||
    normalized === ROLES.ADMIN_PRESCHOOL
  ) {
    return 'bg-hope-lime'
  }

  if (
    normalized === ROLES.TEACHER_ENGLISH ||
    normalized === ROLES.ADMIN_ENGLISH
  ) {
    return 'bg-hope-cyan'
  }

  if (
    normalized === ROLES.TEACHER_SCHOLARSHIP ||
    normalized === ROLES.ADMIN_SCHOLARSHIP
  ) {
    return 'bg-hope-yellow'
  }

  if (normalized.startsWith('admin')) {
    return 'bg-hope-cyan'
  }

  return 'bg-surface-400'
}

/**
 * Avatar ring class by role.
 */
function avatarRingClass(role) {
  const normalized = normalizeRole(role)

  if (normalized === ROLES.SUPER_ADMIN) return 'ring-indigo-300'
  if (normalized === ROLES.COACH) return 'ring-amber-300'
  if (normalized === ROLES.ADMIN_SPORT) return 'ring-rose-300'

  if (
    normalized === ROLES.TEACHER_PRESCHOOL ||
    normalized === ROLES.ADMIN_PRESCHOOL
  ) {
    return 'ring-lime-300'
  }

  if (
    normalized === ROLES.TEACHER_ENGLISH ||
    normalized === ROLES.ADMIN_ENGLISH
  ) {
    return 'ring-cyan-300'
  }

  if (
    normalized === ROLES.TEACHER_SCHOLARSHIP ||
    normalized === ROLES.ADMIN_SCHOLARSHIP
  ) {
    return 'ring-yellow-300'
  }

  if (normalized.startsWith('admin')) {
    return 'ring-cyan-300'
  }

  return 'ring-surface-300'
}

/**
 * Avatar text color by role.
 */
function avatarTextClass(role) {
  const normalized = normalizeRole(role)

  if (
    normalized === ROLES.COACH ||
    normalized === ROLES.TEACHER_PRESCHOOL ||
    normalized === ROLES.TEACHER_SCHOLARSHIP
  ) {
    return 'text-gray-900'
  }

  return 'text-white'
}

/**
 * Generic fallback cell value.
 */
function resolvePlainValue(column) {
  const field = column?.field || column?.key
  const value = resolvedRow.value?.[field]
  const normalized = String(value ?? '').trim()

  return normalized || '-'
}

/**
 * Table cell alignment/padding class.
 */
function cellClass(column) {
  const align = column?.align === 'right' ? 'text-right' : 'text-left'

  return `px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 whitespace-nowrap ${align}`
}

/**
 * Reset image error when any avatar source changes.
 */
watch(
  () => [
    resolvedRow.value?.avatar,
    resolvedRow.value?.avatarUrl,
    resolvedRow.value?.profileImage,
    resolvedRow.value?.photo,
  ],
  () => {
    hasImageError.value = false
    isImageLoaded.value = false
  },
)

/**
 * Mark avatar as broken.
 */
function onAvatarError() {
  hasImageError.value = true
  isImageLoaded.value = false
}

/**
 * Mark avatar as loaded.
 */
function onAvatarLoad() {
  isImageLoaded.value = true
}
</script>

<template>
  <tr class="transition-colors hover:bg-brand-50/60">
    <td
      v-for="column in resolvedColumns"
      :key="column.key"
      :class="cellClass(column)"
    >
      <!-- Row number -->
      <template v-if="column.key === 'number'">
        <span class="text-[12px] font-semibold text-surface-700 sm:text-sm">
          {{ displayNumber || '-' }}
        </span>
      </template>

      <!-- User profile -->
      <template v-else-if="column.key === 'user'">
        <div class="flex items-center gap-3">
          <div
            :class="[
              'relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm ring-2',
              avatarRingClass(resolvedRow.role),
            ]"
          >
            <div
              v-if="!shouldShowImage"
              :class="[
                'flex h-full w-full items-center justify-center text-[11px] font-bold uppercase tracking-[0.08em]',
                getInitialBadgeClass(resolvedRow.role),
                avatarTextClass(resolvedRow.role),
              ]"
              :title="resolvedRow.name || 'User'"
            >
              {{ userInitials(resolvedRow) }}
            </div>

            <img
              v-if="avatarSrc(resolvedRow)"
              :src="avatarSrc(resolvedRow)"
              :alt="`${resolvedRow.name || 'User'} avatar`"
              class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-150"
              :class="{ 'opacity-100': shouldShowImage }"
              @load="onAvatarLoad"
              @error="onAvatarError"
            >
          </div>

          <div class="min-w-0">
            <div class="truncate text-[13px] font-semibold leading-5 text-surface-900 sm:text-sm">
              {{ resolvedRow.name || '-' }}
            </div>

            <div class="text-[11px] text-surface-500 sm:text-xs">
              ID: {{ userIdLabel }}
            </div>

            <div class="truncate text-[11px] text-surface-600 sm:text-xs">
              {{ usernameLabel(resolvedRow.username) }}
            </div>
          </div>
        </div>
      </template>

      <!-- Email -->
      <template v-else-if="column.key === 'email'">
        <span class="text-[12px] text-surface-700 sm:text-sm">
          {{ resolvedRow.email || '-' }}
        </span>
      </template>

      <!-- Role -->
      <template v-else-if="column.key === 'role'">
        <RolesBadge :role="resolvedRow.role" />
      </template>

      <!-- Permissions -->
      <template v-else-if="column.key === 'permission'">
        <div class="flex flex-wrap gap-1">
          <PermissionBadge
            v-for="permission in visiblePermissions"
            :key="permission"
            :permission="permission"
            size="sm"
          />

          <span
            v-if="!permissionList.length"
            class="text-[11px] text-surface-400"
          >
            -
          </span>

          <span
            v-else-if="hiddenPermissionCount > 0"
            class="inline-flex items-center rounded-full border border-surface-200 bg-surface-100 px-2 py-0.5 text-[0.68rem] font-semibold leading-none tracking-[0.02em] text-surface-600"
            :title="hiddenPermissionLabel"
          >
            +{{ hiddenPermissionCount }} more
          </span>
        </div>
      </template>

      <!-- Status -->
      <template v-else-if="column.key === 'status'">
        <StatusBadge
          :status="statusType"
          :label="statusText"
          size="sm"
        />
      </template>

      <!-- Phone -->
      <template v-else-if="column.key === 'phone'">
        <span class="text-[12px] text-surface-700 sm:text-sm">
          {{ phoneLabel(resolvedRow.phone) }}
        </span>
      </template>

      <!-- Actions -->
      <template v-else-if="column.key === 'actions'">
        <ActionsButton
          :item="resolvedRow"
          @view="emit('view', resolvedRow)"
          @edit="emit('edit', resolvedRow)"
          @delete="emit('delete', resolvedRow)"
        />
      </template>

      <!-- Generic fallback -->
      <template v-else>
        <span class="text-[12px] text-surface-700 sm:text-sm">
          {{ resolvePlainValue(column) }}
        </span>
      </template>
    </td>
  </tr>
</template>
