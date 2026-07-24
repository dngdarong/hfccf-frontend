<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import AppBadge from '@/components/ui/AppBadge.vue'

defineOptions({
  name: 'PermissionBadge',
  inheritAttrs: false,
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
  if (!normalizedPermission.value) return '-'
  const key = `common.permission.${toPermissionKey(normalizedPermission.value)}`
  const translated = t(key)
  return translated && translated !== key ? translated : normalizedPermission.value
})
</script>

<template>
  <AppBadge :label="permissionLabel" variant="info" size="sm" :title="permissionLabel" />
</template>
