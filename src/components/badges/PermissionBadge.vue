<script setup>
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PermissionBadge',
})

const props = defineProps({
  permission: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()

function normalizePermission(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function toPermissionKey(value) {
  return normalizePermission(value).replace(/[\s-]+/g, '_')
}

const normalizedPermission = computed(() =>
  normalizePermission(props.permission),
)

const permissionLabel = computed(() => {
  if (!normalizedPermission.value) {
    return '-'
  }

  const key = `common.permission.${toPermissionKey(
    normalizedPermission.value,
  )}`

  const translated = t(key)

  return translated && translated !== key
    ? translated
    : normalizedPermission.value
})

const permissionPt = {
  root: {
    class: [
      '!inline-flex',
      '!items-center',
      '!gap-1.5',
      '!rounded-full',
      '!border',
      '!border-brand-200',
      '!bg-brand-50',
      '!px-2.5',
      '!py-1',
      '!text-[0.7rem]',
      '!font-semibold',
      '!tracking-[0.03em]',
      '!text-brand-800',
      'shadow-[0_6px_14px_-12px_rgba(0,174,239,0.35)]',
    ],
  },
  label: {
    class: '!leading-none',
  },
}
</script>

<template>
  <Tag
    :value="permissionLabel"
    :pt="permissionPt"
    role="status"
    aria-live="polite"
  />
</template>
