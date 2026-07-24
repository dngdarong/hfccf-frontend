<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { ROLES, normalizeRole } from '@/constants/roles'
import AppBadge from '@/components/ui/AppBadge.vue'

defineOptions({
  name: 'RolesBadge',
  inheritAttrs: false,
})

const props = defineProps({
  role: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value),
  },
})

const { t } = useLanguage()

function toRoleKey(value) {
  return normalizeRole(value).replace(/[\s-]+/g, '_')
}

function humanizeRole(value) {
  return String(value || '')
    .trim()
    .split(/[\s-]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const normalizedRole = computed(() => normalizeRole(props.role))

const roleLabel = computed(() => {
  if (!normalizedRole.value) return '-'
  const key = `common.role.${toRoleKey(normalizedRole.value)}`
  return t(key) !== key ? t(key) : humanizeRole(normalizedRole.value)
})

const variant = computed(() => {
  const role = normalizedRole.value
  if (role === ROLES.SUPER_ADMIN) return 'admin'
  if (
    role === ROLES.ADMIN_SPORT ||
    role === ROLES.COACH ||
    role === ROLES.ADMIN_SCHOLARSHIP ||
    role === ROLES.TEACHER_SCHOLARSHIP ||
    role === ROLES.ADMIN_ENGLISH ||
    role === ROLES.TEACHER_ENGLISH ||
    role === ROLES.ADMIN_PRESCHOOL ||
    role === ROLES.TEACHER_PRESCHOOL
  ) {
    return 'staff'
  }
  return 'neutral'
})
</script>

<template>
  <AppBadge :label="roleLabel" :variant="variant" :size="size" :title="roleLabel" />
</template>
