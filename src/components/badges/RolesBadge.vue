<script setup>
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'
import { ROLES, normalizeRole } from '@/constants/roles'

defineOptions({
  name: 'RolesBadge',
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
  const translated = t(key)

  return translated && translated !== key
    ? translated
    : humanizeRole(normalizedRole.value)
})

const sizeClass = computed(() => {
  const classes = {
    xs: '!px-2 !py-0.5 !text-[0.62rem]',
    sm: '!px-2.5 !py-1 !text-[0.7rem]',
    md: '!px-3 !py-1.5 !text-[0.75rem]',
    lg: '!px-3.5 !py-1.5 !text-[0.8rem]',
  }

  return classes[props.size] || classes.sm
})

const toneClass = computed(() => {
  const role = normalizedRole.value

  if (role === ROLES.SUPER_ADMIN) {
    return [
      '!border-indigo-200',
      '!bg-indigo-50',
      '!text-indigo-800',
      'shadow-[0_8px_18px_-14px_rgba(79,70,229,0.38)]',
    ]
  }

  if (role === ROLES.ADMIN_SPORT || role === ROLES.COACH) {
    return [
      '!border-rose-200',
      '!bg-rose-50',
      '!text-rose-800',
      'shadow-[0_8px_18px_-14px_rgba(225,29,72,0.28)]',
    ]
  }

  if (
    role === ROLES.ADMIN_SCHOLARSHIP ||
    role === ROLES.TEACHER_SCHOLARSHIP
  ) {
    return [
      '!border-amber-200',
      '!bg-amber-50',
      '!text-amber-800',
      'shadow-[0_8px_18px_-14px_rgba(245,158,11,0.28)]',
    ]
  }

  if (role === ROLES.ADMIN_ENGLISH || role === ROLES.TEACHER_ENGLISH) {
    return [
      '!border-brand-200',
      '!bg-brand-50',
      '!text-brand-800',
      'shadow-[0_8px_18px_-14px_rgba(0,174,239,0.28)]',
    ]
  }

  if (role === ROLES.ADMIN_PRESCHOOL || role === ROLES.TEACHER_PRESCHOOL) {
    return [
      '!border-lime-200',
      '!bg-lime-50',
      '!text-lime-800',
      'shadow-[0_8px_18px_-14px_rgba(101,163,13,0.28)]',
    ]
  }

  return [
    '!border-surface-200',
    '!bg-surface-50',
    '!text-surface-700',
    'shadow-[0_8px_18px_-16px_rgba(15,23,42,0.16)]',
  ]
})

const rolePt = computed(() => ({
  root: {
    class: [
      '!inline-flex',
      '!items-center',
      '!rounded-full',
      '!border',
      '!font-semibold',
      '!tracking-[0.03em]',
      '!leading-none',
      ...toneClass.value,
      sizeClass.value,
    ],
  },
  label: {
    class: '!leading-none',
  },
}))
</script>

<template>
  <Tag
    :value="roleLabel"
    class="ui-role-tag"
    :pt="rolePt"
    role="status"
    aria-live="polite"
  />
</template>
