<script setup>
import { computed, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import NotificationFilterTabs from '@/modules/dashboard/components/notifications/NotificationFilterTabs.vue'
import NotificationInboxCard from '@/modules/dashboard/components/notifications/NotificationInboxCard.vue'

const { t, language } = useLanguage()

const title = computed(() => t('common.notifications'))
const subtitle = computed(() => t('common.notificationPage.subtitle'))
const inboxLabel = computed(() => t('common.notificationPage.inbox'))
const emptyText = computed(() => t('common.notificationPage.empty'))
const markReadLabel = computed(() => t('common.notificationPage.markRead'))
const deleteLabel = computed(() => t('common.notificationPage.delete'))
const clearAllLabel = computed(() => t('common.notificationPage.clearAll'))
const cancelLabel = computed(() => t('common.notificationPage.confirm.cancel'))
const loadingLabel = computed(() => t('common.notificationPage.loading'))
const activeFilter = ref('all')
const readNotificationIds = ref([])
const deletedNotificationIds = ref([])
const confirmAction = ref(null)
const pendingNotification = ref(null)
const isLoading = ref(false)
const now = new Date()
const locale = computed(() => (language.value === 'KH' ? 'km-KH' : 'en-US'))

const notificationSeed = [
  {
    id: 'approval-requests',
    tone: 'danger',
    itemKey: 'approvalRequests',
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'schedule-updated',
    tone: 'info',
    itemKey: 'scheduleUpdated',
    createdAt: new Date(now.getTime() - 14 * 60 * 1000),
  },
  {
    id: 'backup-completed',
    tone: 'success',
    itemKey: 'backupCompleted',
    createdAt: now,
  },
]

const notifications = computed(() =>
  notificationSeed.map((item) => ({
    ...item,
    label: t(`common.notificationPage.items.${item.itemKey}.label`),
    title: t(`common.notificationPage.items.${item.itemKey}.title`),
    detail: t(`common.notificationPage.items.${item.itemKey}.detail`),
    time: formatExactTime(item.createdAt),
    relativeTime: formatRelativeTime(item.createdAt),
  })),
)

const visibleNotifications = computed(() =>
  notifications.value
    .filter((item) => !deletedNotificationIds.value.includes(item.id))
    .map((item) => ({
      ...item,
      read: readNotificationIds.value.includes(item.id),
    })),
)

const unreadNotifications = computed(() => visibleNotifications.value.filter((item) => !item.read))
const readNotifications = computed(() => visibleNotifications.value.filter((item) => item.read))
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'unread') return unreadNotifications.value
  if (activeFilter.value === 'read') return readNotifications.value
  return visibleNotifications.value
})

const filterTabs = computed(() => [
  {
    value: 'all',
    label: t('common.notificationPage.filters.all'),
    count: visibleNotifications.value.length,
  },
  {
    value: 'unread',
    label: t('common.notificationPage.filters.unread'),
    count: unreadNotifications.value.length,
  },
  {
    value: 'read',
    label: t('common.notificationPage.filters.read'),
    count: readNotifications.value.length,
  },
])

const filteredEmptyText = computed(() => {
  if (activeFilter.value === 'unread') {
    return t('common.notificationPage.emptyStates.unread')
  }

  if (activeFilter.value === 'read') {
    return t('common.notificationPage.emptyStates.read')
  }

  return emptyText.value
})

const alertTitle = computed(() => {
  if (confirmAction.value === 'clear-all') {
    return t('common.notificationPage.confirm.clearAllTitle')
  }

  return t('common.notificationPage.confirm.deleteTitle')
})

const alertMessage = computed(() => {
  if (confirmAction.value === 'clear-all') {
    return t('common.notificationPage.confirm.clearAllMessage')
  }

  const notificationTitle = pendingNotification.value?.title || t('common.notificationPage.empty')
  return t('common.notificationPage.confirm.deleteMessage', { title: notificationTitle })
})

function markNotificationRead(item) {
  if (isLoading.value) return
  if (!item?.id || readNotificationIds.value.includes(item.id)) return
  runNotificationAction(() => {
    readNotificationIds.value = [...readNotificationIds.value, item.id]
  })
}

function deleteNotification(item) {
  if (isLoading.value) return
  if (!item?.id || deletedNotificationIds.value.includes(item.id)) return
  pendingNotification.value = item
  confirmAction.value = 'delete'
}

function clearAllNotifications() {
  if (isLoading.value) return
  if (!visibleNotifications.value.length) return
  pendingNotification.value = null
  confirmAction.value = 'clear-all'
}

function cancelQuestion() {
  confirmAction.value = null
  pendingNotification.value = null
}

function confirmQuestion() {
  if (isLoading.value) return
  const action = confirmAction.value
  const notificationId = pendingNotification.value?.id

  cancelQuestion()

  runNotificationAction(() => {
    if (action === 'delete' && notificationId) {
      deletedNotificationIds.value = [...deletedNotificationIds.value, notificationId]
    }

    if (action === 'clear-all') {
      deletedNotificationIds.value = notifications.value.map((item) => item.id)
    }
  })
}

function runNotificationAction(callback) {
  isLoading.value = true
  window.setTimeout(() => {
    callback()
    isLoading.value = false
  }, 350)
}

function formatRelativeTime(dateValue) {
  const value = dateValue instanceof Date ? dateValue : new Date(dateValue)
  const diffMs = now.getTime() - value.getTime()
  const absMinutes = Math.round(Math.abs(diffMs) / 60000)
  const absHours = Math.round(Math.abs(diffMs) / 3600000)

  if (absMinutes < 1) {
    return t('common.notificationPage.time.justNow')
  }

  if (absMinutes < 60) {
    return absMinutes === 1
      ? t('common.notificationPage.time.minuteAgo', { count: absMinutes })
      : t('common.notificationPage.time.minuteAgoPlural', { count: absMinutes })
  }

  if (absHours < 24) {
    return absHours === 1
      ? t('common.notificationPage.time.hourAgo', { count: absHours })
      : t('common.notificationPage.time.hourAgoPlural', { count: absHours })
  }

  return t('common.notificationPage.time.today')
}

function formatExactTime(dateValue) {
  const value = dateValue instanceof Date ? dateValue : new Date(dateValue)
  return new Intl.DateTimeFormat(locale.value, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(value)
}
</script>

<template>
  <MainLayout>
    <section :class="language === 'KH' ? 'global-page global-page--kh' : 'global-page'">
      <HeaderSection :title="title" :subtitle="subtitle" />

      <NotificationFilterTabs
        v-model:active-tab="activeFilter"
        :tabs="filterTabs"
        :disabled="isLoading"
      />

      <NotificationInboxCard
        :eyebrow="inboxLabel"
        :notifications="filteredNotifications"
        :empty-text="filteredEmptyText"
        :mark-read-label="markReadLabel"
        :delete-label="deleteLabel"
        :clear-all-label="clearAllLabel"
        :loading="isLoading"
        :loading-label="loadingLabel"
        @clear-all="clearAllNotifications"
        @mark-notification-read="markNotificationRead"
        @delete-notification="deleteNotification"
      />

      <AlertQuestion
        :show="Boolean(confirmAction)"
        :title="alertTitle"
        :message="alertMessage"
        :confirm-text="confirmAction === 'clear-all' ? clearAllLabel : deleteLabel"
        :cancel-text="cancelLabel"
        type="danger"
        @confirm="confirmQuestion"
        @cancel="cancelQuestion"
      />
    </section>
  </MainLayout>
</template>

<style scoped>
.global-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.global-page--kh :deep(.notification-inbox-card__eyebrow),
.global-page--kh :deep(.notification-inbox-card__empty),
.global-page--kh :deep(.notification-filter-tabs__button),
.global-page--kh :deep(.notification-list-item__pill),
.global-page--kh :deep(.notification-list-item__title),
.global-page--kh :deep(.notification-list-item__detail),
.global-page--kh :deep(.notification-list-item__time),
.global-page--kh :deep(.alert-question__title),
.global-page--kh :deep(.alert-question__message) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.global-page--kh :deep(.notification-inbox-card__eyebrow) {
  text-transform: none;
  letter-spacing: 0.01em;
}
</style>
