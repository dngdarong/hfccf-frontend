<script setup>
import { computed } from 'vue'
import NotificationItem from '@/modules/notifications/components/NotificationItem.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'NotificationListItem',
})

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  markReadLabel: {
    type: String,
    default: '',
  },
  deleteLabel: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  time: {
    type: String,
    default: '',
  },
  relativeTime: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['delete', 'mark-read'])
const { t } = useLanguage()

const resolvedMarkReadLabel = computed(() => props.markReadLabel || t('common.notifications.markRead'))
const resolvedDeleteLabel = computed(() => props.deleteLabel || t('common.actions.delete'))

const notification = computed(() => ({
  ...props.item,
  id: props.item?.id || props.item?.key || props.item?.title || '',
  title: props.item?.title || '',
  message: props.item?.detail || props.item?.message || '',
  type: props.item?.tone || props.item?.type || 'system',
  module: props.item?.label || props.item?.module || 'global',
  read: Boolean(props.item?.read),
  createdAt: props.item?.createdAt || props.item?.created_at || '',
  badgeLabel: props.item?.label || '',
  timeLabel: props.time,
  relativeTimeLabel: props.relativeTime,
}))
</script>

<template>
  <NotificationItem
  :notification="notification"
  :read-label="resolvedMarkReadLabel"
  :dismiss-label="resolvedDeleteLabel"
  :show-actions="true"
  :loading="loading"
    :time-label="time"
    :relative-time-label="relativeTime"
    @read="emit('mark-read', $event)"
    @dismiss="emit('delete', $event)"
  />
</template>
