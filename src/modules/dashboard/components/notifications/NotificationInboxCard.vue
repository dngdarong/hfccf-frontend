<script setup>
import { computed } from 'vue'
import ModernNotificationInboxCard from '@/modules/notifications/components/NotificationInboxCard.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'NotificationInboxCard',
})

const props = defineProps({
  eyebrow: {
    type: String,
    required: true,
  },
  notifications: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
  markReadLabel: {
    type: String,
    default: '',
  },
  deleteLabel: {
    type: String,
    default: '',
  },
  clearAllLabel: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['clear-all', 'delete-notification', 'mark-notification-read'])
const { t } = useLanguage()

const resolvedEmptyText = computed(() => props.emptyText || t('common.notifications.empty'))
const resolvedMarkReadLabel = computed(() => props.markReadLabel || t('common.notifications.markRead'))
const resolvedDeleteLabel = computed(() => props.deleteLabel || t('common.actions.delete'))
const resolvedClearAllLabel = computed(() => props.clearAllLabel || t('common.notifications.clearAll'))
const resolvedLoadingLabel = computed(() => props.loadingLabel || t('common.notifications.loading'))
</script>

<template>
  <ModernNotificationInboxCard
    :title="eyebrow"
    :subtitle="''"
    :notifications="notifications"
    :loading="loading"
    :loading-label="resolvedLoadingLabel"
    :empty-title="resolvedEmptyText"
    :empty-description="''"
    :read-label="resolvedMarkReadLabel"
    :dismiss-label="resolvedDeleteLabel"
    :mark-all-read-label="resolvedClearAllLabel"
    @mark-all-read="emit('clear-all')"
    @read="emit('mark-notification-read', $event)"
    @dismiss="emit('delete-notification', $event)"
  />
</template>
