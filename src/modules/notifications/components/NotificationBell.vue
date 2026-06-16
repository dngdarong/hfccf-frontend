<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Popover from 'primevue/popover'
import { useNotifications } from '@/modules/notifications/composables/useNotifications'
import { useUnreadNotifications } from '@/modules/notifications/composables/useUnreadNotifications'
import NotificationDropdown from '@/modules/notifications/components/NotificationDropdown.vue'
import NotificationTypeIcon from '@/modules/notifications/components/NotificationTypeIcon.vue'
import { useLanguage } from '@/composables/useLanguage'
import { menuButtonPt } from '@/components/navigation/config/navbar.config'

defineOptions({
  name: 'NotificationBell',
})

const router = useRouter()
const overlayRef = ref(null)
const notificationCenter = useNotifications({ defaultPerPage: 5 })
const unreadNotifications = useUnreadNotifications()
const { t } = useLanguage()

const unreadCount = computed(() => unreadNotifications.unreadCount.value)
const dropdownItems = computed(() => notificationCenter.items.value.slice(0, 5))
const dropdownLoading = computed(() => notificationCenter.loading.value)
const dropdownError = computed(() => notificationCenter.error.value)

async function loadDropdownItems() {
  await notificationCenter.loadNotifications({
    page: 1,
    perPage: 5,
  })
}

async function openDropdown(event) {
  overlayRef.value?.toggle(event)
  await loadDropdownItems()
}

async function handleRead(notification) {
  if (!notification?.id) return

  try {
    await notificationCenter.markAsRead(notification.id)
    await unreadNotifications.loadUnreadCount()
  } catch {
    // Keep the dropdown usable if the backend rejects the change.
  }
}

async function handleDismiss(notification) {
  if (!notification?.id) return

  try {
    await notificationCenter.dismiss(notification.id)
    await unreadNotifications.loadUnreadCount()
  } catch {
    // Keep the dropdown usable if the backend rejects the change.
  }
}

async function handleUndismiss(notification) {
  if (!notification?.id) return

  try {
    await notificationCenter.undismiss(notification.id)
    await loadDropdownItems()
    await unreadNotifications.loadUnreadCount()
  } catch {
    // Keep the dropdown usable if the backend rejects the change.
  }
}

async function handleMarkAllRead() {
  try {
    await notificationCenter.markAllAsRead()
    await unreadNotifications.loadUnreadCount()
  } catch {
    // Keep the dropdown usable if the backend rejects the change.
  }
}

function goToNotificationsPage() {
  overlayRef.value?.hide()
  router.push({ name: 'notifications' })
}

onMounted(() => {
  void unreadNotifications.loadUnreadCount()
})
</script>

<template>
  <div class="relative">
    <Button
      type="button"
      severity="secondary"
      text
      rounded
      class="icon-btn icon-btn--notification"
      :pt="menuButtonPt"
      :aria-label="t('common.notifications.title')"
      @click="openDropdown"
    >
      <template #icon>
        <div class="relative flex items-center justify-center">
          <NotificationTypeIcon
            type="system"
            size="sm"
          />

          <Badge
            v-if="unreadCount > 0"
            :value="unreadCount"
            severity="danger"
            class="notification-bell__badge"
          />
        </div>
      </template>
    </Button>

    <Popover
      ref="overlayRef"
      class="notification-bell__panel"
    >
      <NotificationDropdown
        :notifications="dropdownItems"
        :loading="dropdownLoading"
        :unread-count="unreadCount"
        :error="dropdownError"
        @read="handleRead"
        @dismiss="handleDismiss"
        @undismiss="handleUndismiss"
        @mark-all-read="handleMarkAllRead"
        @retry="loadDropdownItems"
        @view-all="goToNotificationsPage"
      />
    </Popover>
  </div>
</template>

<style scoped>
.notification-bell__badge {
  position: absolute;
  top: -0.4rem;
  right: -0.45rem;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.25rem;
  border: 2px solid #ffffff;
  border-radius: 9999px;
  font-size: 0.62rem;
  line-height: 1;
}

:deep(.notification-bell__panel.p-popover) {
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}
</style>
