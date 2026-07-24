<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from '@/components/buttons/Button.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import NotificationInboxCard from '@/modules/notifications/components/NotificationInboxCard.vue'
import NotificationFilterTabs from '@/modules/dashboard/components/notifications/NotificationFilterTabs.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useUserStore } from '@/store/userStore'
import { useNotifications } from '@/modules/notifications/composables/useNotifications'
import { useUnreadNotifications } from '@/modules/notifications/composables/useUnreadNotifications'
import {
  archiveUnifiedAlert,
  cancelUnifiedTask,
  cancelUnifiedWorkflowApproval,
  completeUnifiedTask,
  dismissUnifiedNotification,
  loadUnifiedAlerts,
  loadUnifiedApprovals,
  loadUnifiedTasks,
  markAllUnifiedNotificationsRead,
  markUnifiedAlertRead,
  markUnifiedNotificationRead,
  approveUnifiedWorkflowApproval,
  rejectUnifiedWorkflowApproval,
  returnUnifiedWorkflowApproval,
  undismissUnifiedNotification,
} from '@/modules/notifications/services/notificationCenterApi'

defineOptions({
  name: 'NotificationsPage',
})

const SUPPORTED_TABS_BY_ROLE = {
  superadmin: ['notifications', 'tasks', 'alerts', 'approvals'],
  adminpreschool: ['notifications', 'tasks', 'alerts', 'approvals'],
  'teacher-preschool': ['notifications', 'tasks', 'alerts'],
  adminsport: ['notifications'],
  coach: ['notifications'],
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { t, te } = useLanguage()
const globalNotifications = useNotifications({ defaultPerPage: 8 })
const unreadNotifications = useUnreadNotifications()

const currentRole = computed(() => String(userStore.currentUser?.role_code ?? userStore.currentUser?.role ?? ''))
const supportedTabs = computed(() => new Set(SUPPORTED_TABS_BY_ROLE[currentRole.value] || ['notifications']))

const alertsLoading = ref(false)
const alertsError = ref('')
const alertItems = ref([])
const alertSummary = ref({
  total: 0,
  unread: 0,
  read: 0,
  archived: 0,
  critical: 0,
  byType: [],
  bySeverity: [],
})

const tasksLoading = ref(false)
const tasksError = ref('')
const taskItems = ref([])
const taskSummary = ref({
  total: 0,
  open: 0,
  inProgress: 0,
  completed: 0,
  cancelled: 0,
  overdue: 0,
  today: 0,
  byType: [],
  byPriority: [],
})

const approvalsLoading = ref(false)
const approvalsError = ref('')
const approvalItems = ref([])
const approvalSummary = ref({
  total: 0,
  pendingApprovals: 0,
  approved: 0,
  rejected: 0,
  returned: 0,
  cancelled: 0,
  overdue: 0,
})

const globalNotificationItems = computed(() => globalNotifications.items?.value ?? [])
const globalUnreadCount = computed(() => unreadNotifications.unreadCount?.value ?? 0)
const tabAliases = {
  'my-notifications': 'notifications',
}

const tabDefinitions = computed(() => [
  {
    value: 'notifications',
    label: t('notifications.tabs.myNotifications'),
    count: globalUnreadCount.value || globalNotifications.pagination?.total || globalNotificationItems.value.length || 0,
    visible: true,
  },
  {
    value: 'tasks',
    label: t('notifications.tabs.tasks'),
    count: taskSummary.value.open || taskSummary.value.total || taskItems.value.length || 0,
    visible: supportedTabs.value.has('tasks'),
  },
  {
    value: 'alerts',
    label: t('notifications.tabs.alerts'),
    count: alertSummary.value.unread || alertSummary.value.total || alertItems.value.length || 0,
    visible: supportedTabs.value.has('alerts'),
  },
  {
    value: 'approvals',
    label: t('notifications.tabs.approvals'),
    count: approvalSummary.value.pendingApprovals || approvalSummary.value.total || approvalItems.value.length || 0,
    visible: supportedTabs.value.has('approvals'),
  },
])

const visibleTabs = computed(() => tabDefinitions.value.filter((tab) => tab.visible))
const activeTab = ref('notifications')
const tabLoading = computed(() =>
  globalNotifications.loading.value
  || alertsLoading.value
  || tasksLoading.value
  || approvalsLoading.value,
)

function resolveTab(value) {
  const normalized = String(value || '').trim().toLowerCase()
  const requested = tabAliases[normalized] || normalized
  const available = visibleTabs.value.map((tab) => tab.value)

  if (requested && available.includes(requested)) {
    return requested
  }

  return available[0] || 'notifications'
}

function syncRoute(tab) {
  const nextTab = tab === 'notifications' ? undefined : tab
  const nextQuery = { ...route.query }

  if (nextTab) {
    nextQuery.tab = nextTab
  } else {
    delete nextQuery.tab
  }

  if (String(route.query.tab || '') === String(nextQuery.tab || '')) {
    return
  }

  router.replace({
    name: 'dashboard-notifications',
    query: nextQuery,
  })
}

function setActiveTab(tab) {
  const resolved = resolveTab(tab)

  if (resolved === activeTab.value) {
    return
  }

  activeTab.value = resolved
  syncRoute(resolved)
}

watch(
  () => route.query.tab,
  (value) => {
    const resolved = resolveTab(value)
    const normalized = String(value || '').trim().toLowerCase()
    const requested = tabAliases[normalized] || normalized

    activeTab.value = resolved

    if (requested && requested !== resolved && normalized !== 'my-notifications') {
      syncRoute(resolved)
    }
  },
  { immediate: true },
)

watch(visibleTabs, () => {
  const resolved = resolveTab(activeTab.value)

  if (resolved !== activeTab.value) {
    activeTab.value = resolved
    syncRoute(resolved)
  }
})

function moduleLabel(moduleValue) {
  const key = `notifications.modules.${String(moduleValue || 'global').trim().toLowerCase()}`
  return te(key) ? t(key) : String(moduleValue || 'Global')
}

function formatDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function isPastDue(value) {
  if (!value) return false

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  return date.getTime() < new Date().setHours(0, 0, 0, 0)
}

function priorityTone(priority) {
  const key = String(priority || '').trim().toLowerCase()
  if (key === 'urgent' || key === 'critical') return 'rose'
  if (key === 'high') return 'amber'
  if (key === 'normal') return 'blue'
  return 'slate'
}

function statusTone(status) {
  const key = String(status || '').trim().toLowerCase()
  if (['completed', 'approved', 'resolved', 'read'].includes(key)) return 'emerald'
  if (['overdue', 'rejected', 'cancelled', 'dismissed'].includes(key)) return 'rose'
  if (['pending', 'open', 'unread'].includes(key)) return 'amber'
  return 'slate'
}

function canOpenRoute(routeName) {
  return Boolean(routeName && router.hasRoute(routeName))
}

function openRoute(routeName, routeParams = {}) {
  if (!canOpenRoute(routeName)) return

  router.push({
    name: routeName,
    params: routeParams,
  })
}

async function loadNotificationsSection() {
  await globalNotifications.loadNotifications({
    page: 1,
    perPage: 8,
  })
  await unreadNotifications.loadUnreadCount()
}

async function loadAlertsSection() {
  alertsLoading.value = true
  alertsError.value = ''

  try {
    const payload = await loadUnifiedAlerts({}, {})
    alertItems.value = payload.items
    alertSummary.value = payload.summary || alertSummary.value
  } catch (error) {
    alertsError.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
  } finally {
    alertsLoading.value = false
  }
}

async function loadTasksSection() {
  tasksLoading.value = true
  tasksError.value = ''

  try {
    const payload = await loadUnifiedTasks({}, {})
    taskItems.value = payload.items
    taskSummary.value = payload.summary || taskSummary.value
  } catch (error) {
    tasksError.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
  } finally {
    tasksLoading.value = false
  }
}

async function loadApprovalsSection() {
  approvalsLoading.value = true
  approvalsError.value = ''

  try {
    const payload = await loadUnifiedApprovals({ page: 1, perPage: 20 }, {})
    approvalItems.value = payload.items
    approvalSummary.value = payload.summary || approvalSummary.value
  } catch (error) {
    approvalsError.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
  } finally {
    approvalsLoading.value = false
  }
}

async function refreshAll() {
  const sectionLoaders = {
    notifications: loadNotificationsSection,
    alerts: loadAlertsSection,
    tasks: loadTasksSection,
    approvals: loadApprovalsSection,
  }

  await Promise.allSettled(
    visibleTabs.value.map(({ value }) => sectionLoaders[value]()),
  )
}

async function handleNotificationRead(item) {
  if (!item?.id) return

  await markUnifiedNotificationRead(item.id)
  await loadNotificationsSection()
}

async function handleNotificationDismiss(item) {
  if (!item?.id) return

  await dismissUnifiedNotification(item.id)
  await loadNotificationsSection()
}

async function handleNotificationUndismiss(item) {
  if (!item?.id) return

  await undismissUnifiedNotification(item.id)
  await loadNotificationsSection()
}

async function handleMarkAllNotificationsRead() {
  await markAllUnifiedNotificationsRead()
  await loadNotificationsSection()
}

async function handleAlertRead(item) {
  if (!item?.id) return

  await markUnifiedAlertRead(item.id)
  await loadAlertsSection()
}

async function handleAlertArchive(item) {
  if (!item?.id) return

  await archiveUnifiedAlert(item.id)
  await loadAlertsSection()
}

async function handleTaskComplete(item) {
  if (!item?.id) return

  await completeUnifiedTask(item.id)
  await loadTasksSection()
}

async function handleTaskCancel(item) {
  if (!item?.id) return

  await cancelUnifiedTask(item.id)
  await loadTasksSection()
}

async function handleApprovalApprove(item) {
  if (!item?.id) return

  await approveUnifiedWorkflowApproval(item.id)
  await loadApprovalsSection()
}

async function handleApprovalReject(item) {
  if (!item?.id) return

  await rejectUnifiedWorkflowApproval(item.id)
  await loadApprovalsSection()
}

async function handleApprovalReturn(item) {
  if (!item?.id) return

  await returnUnifiedWorkflowApproval(item.id)
  await loadApprovalsSection()
}

async function handleApprovalCancel(item) {
  if (!item?.id) return

  await cancelUnifiedWorkflowApproval(item.id)
  await loadApprovalsSection()
}

function approvalCanAct(item) {
  return supportedTabs.value.has('approvals') && Boolean(item?.canAct)
}

function approvalWorkflowId(item) {
  return String(item?.actionRouteParams?.id || item?.sourceId || item?.id || '')
}

function resolveApprovalRoute(item) {
  const workflowId = approvalWorkflowId(item)
  if (!workflowId) return null

  if (item?.actionRouteName && canOpenRoute(item.actionRouteName)) {
    return {
      name: item.actionRouteName,
      params: item.actionRouteParams || { id: workflowId },
    }
  }

  if (canOpenRoute('dashboard-preschool-admin-workflow-details')) {
    return {
      name: 'dashboard-preschool-admin-workflow-details',
      params: { id: workflowId },
    }
  }

  return null
}

function goToApprovalWorkflow(item) {
  const target = resolveApprovalRoute(item)
  if (!target) return

  router.push(target)
}

function taskDueTone(item) {
  if (item?.status === 'overdue' || isPastDue(item?.dueAt)) {
    return 'rose'
  }

  return priorityTone(item?.priority)
}

function taskCanAct(item) {
  return ['open', 'in_progress', 'overdue'].includes(String(item?.status || '').toLowerCase())
}

const sectionTabs = computed(() =>
  visibleTabs.value.map((tab) => ({
    value: tab.value,
    label: tab.label,
    count: tab.count,
  })),
)

const pageTitle = computed(() => t('notifications.title'))
const pageSubtitle = computed(() => t('notifications.unifiedSubtitle'))
const alertSubtitle = computed(() => t('notifications.alertsSubtitle'))
const taskSubtitle = computed(() => t('notifications.tasksSubtitle'))
const approvalSubtitle = computed(() => t('notifications.approvalsSubtitle'))

onMounted(refreshAll)
</script>

<template>
  <MainLayout>
    <section class="notifications-center">
      <HeaderSection
        :title="pageTitle"
        :subtitle="pageSubtitle"
      />

      <div class="notifications-center__tabbar">
        <NotificationFilterTabs
          :tabs="sectionTabs"
          :active-tab="activeTab"
          :disabled="tabLoading"
          @update:activeTab="setActiveTab"
        />
      </div>

      <div
        v-if="activeTab === 'notifications'"
        class="notifications-center__panel-stack"
      >
        <NotificationInboxCard
          :title="t('notifications.tabs.myNotifications')"
          :subtitle="t('notifications.myNotificationsSubtitle')"
          :notifications="globalNotificationItems"
          :loading="globalNotifications.loading.value"
          :loading-label="t('notifications.loadingMyNotifications')"
          :empty-title="t('notifications.noNotifications')"
          :empty-description="t('notifications.noNotificationsDescription')"
          :read-label="t('notifications.markAsRead')"
          :dismiss-label="t('notifications.dismiss')"
          :undismiss-label="t('notifications.restore')"
          :mark-all-read-label="t('notifications.markAllRead')"
          @read="handleNotificationRead"
          @dismiss="handleNotificationDismiss"
          @undismiss="handleNotificationUndismiss"
          @mark-all-read="handleMarkAllNotificationsRead"
        />

        <Card class="notifications-center__status-card">
          <template #title>
            {{ t('notifications.statusOverview') }}
          </template>

          <template #content>
            <div class="notifications-center__status-grid">
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.unreadCountLabel') }}</span>
                <strong>{{ globalUnreadCount }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.moduleLabel') }}</span>
                <strong>{{ moduleLabel('global') }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.sourceLabel') }}</span>
                <strong>{{ t('notifications.myNotificationsSource') }}</strong>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div
        v-else-if="activeTab === 'tasks'"
        class="notifications-center__panel-stack"
      >
        <Card class="notifications-center__section-card">
          <template #title>
            {{ t('notifications.tabs.tasks') }}
          </template>

          <template #content>
            <p class="notifications-center__section-subtitle">
              {{ taskSubtitle }}
            </p>

            <div
              v-if="tasksLoading"
              class="notifications-center__empty-state"
            >
              {{ t('notifications.loadingTasks') }}
            </div>

            <div
              v-else-if="tasksError"
              class="notifications-center__error-state"
            >
              {{ tasksError }}
            </div>

            <div
              v-else-if="taskItems.length === 0"
              class="notifications-center__empty-state"
            >
              {{ t('notifications.noTasks') }}
            </div>

            <div
              v-else
              class="notifications-center__item-list"
            >
              <article
                v-for="item in taskItems"
                :key="item.id"
                class="notifications-center__item-card"
              >
                <div class="notifications-center__item-head">
                  <div class="notifications-center__item-copy">
                    <h3 class="notifications-center__item-title">
                      {{ item.title }}
                    </h3>
                    <p class="notifications-center__item-summary">
                      {{ item.summary }}
                    </p>
                  </div>

                  <span :class="['notifications-center__pill', `notifications-center__pill--${taskDueTone(item)}`]">
                    {{ item.status || 'open' }}
                  </span>
                </div>

                <div class="notifications-center__meta-grid">
                  <div>
                    <span>{{ t('notifications.moduleLabel') }}</span>
                    <strong>{{ moduleLabel(item.module) }}</strong>
                  </div>
                  <div>
                    <span>{{ t('notifications.sourceLabel') }}</span>
                    <strong>{{ item.sourceType || '—' }}</strong>
                  </div>
                  <div>
                    <span>{{ t('notifications.dueLabel') }}</span>
                    <strong>{{ formatDateTime(item.dueAt) }}</strong>
                  </div>
                  <div>
                    <span>{{ t('notifications.priorityLabel') }}</span>
                    <strong>{{ item.priority || 'normal' }}</strong>
                  </div>
                </div>

                <div class="notifications-center__item-footer">
                  <span class="notifications-center__item-created">
                    {{ t('notifications.createdLabel') }}: {{ formatDateTime(item.createdAt) }}
                    <span v-if="isPastDue(item.dueAt)" class="notifications-center__item-created--overdue">
                      · {{ t('notifications.overdue') }}
                    </span>
                  </span>

                  <div class="notifications-center__actions">
                    <Button
                      v-if="canOpenRoute(item.actionRouteName)"
                      type="button"
                      severity="secondary"
                      outlined
                      size="small"
                      @click="openRoute(item.actionRouteName, item.actionRouteParams)"
                    >
                      {{ t('notifications.openItem') }}
                    </Button>
                    <Button
                      v-if="taskCanAct(item)"
                      type="button"
                      severity="secondary"
                      size="small"
                      @click="handleTaskComplete(item)"
                    >
                      {{ t('notifications.completeTask') }}
                    </Button>
                    <Button
                      v-if="taskCanAct(item)"
                      type="button"
                      severity="secondary"
                      outlined
                      size="small"
                      @click="handleTaskCancel(item)"
                    >
                      {{ t('notifications.cancelTask') }}
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </template>
        </Card>

        <Card class="notifications-center__status-card">
          <template #title>
            {{ t('notifications.taskSummaryTitle') }}
          </template>

          <template #content>
            <div class="notifications-center__status-grid">
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.openTasks') }}</span>
                <strong>{{ taskSummary.open || 0 }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.overdueTasks') }}</span>
                <strong>{{ taskSummary.overdue || 0 }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.completedTasks') }}</span>
                <strong>{{ taskSummary.completed || 0 }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.todayTasks') }}</span>
                <strong>{{ taskSummary.today || 0 }}</strong>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div
        v-else-if="activeTab === 'alerts'"
        class="notifications-center__panel-stack"
      >
        <Card class="notifications-center__section-card">
          <template #title>
            {{ t('notifications.tabs.alerts') }}
          </template>

          <template #content>
            <p class="notifications-center__section-subtitle">
              {{ alertSubtitle }}
            </p>

            <div
              v-if="alertsLoading"
              class="notifications-center__empty-state"
            >
              {{ t('notifications.loadingAlerts') }}
            </div>

            <div
              v-else-if="alertsError"
              class="notifications-center__error-state"
            >
              {{ alertsError }}
            </div>

            <div
              v-else-if="alertItems.length === 0"
              class="notifications-center__empty-state"
            >
              {{ t('notifications.noAlerts') }}
            </div>

            <div
              v-else
              class="notifications-center__item-list"
            >
              <article
                v-for="item in alertItems"
                :key="item.id"
                class="notifications-center__item-card"
              >
                <div class="notifications-center__item-head">
                  <div class="notifications-center__item-copy">
                    <h3 class="notifications-center__item-title">
                      {{ item.title }}
                    </h3>
                    <p class="notifications-center__item-summary">
                      {{ item.summary }}
                    </p>
                  </div>

                  <span :class="['notifications-center__pill', `notifications-center__pill--${statusTone(item.status)}`]">
                    {{ item.status || 'unread' }}
                  </span>
                </div>

                <div class="notifications-center__meta-grid">
                  <div>
                    <span>{{ t('notifications.moduleLabel') }}</span>
                    <strong>{{ moduleLabel(item.module) }}</strong>
                  </div>
                  <div>
                    <span>{{ t('notifications.sourceLabel') }}</span>
                    <strong>{{ item.sourceType || '—' }}</strong>
                  </div>
                  <div>
                    <span>{{ t('notifications.severityLabel') }}</span>
                    <strong>{{ item.severity || 'medium' }}</strong>
                  </div>
                  <div>
                    <span>{{ t('notifications.createdLabel') }}</span>
                    <strong>{{ formatDateTime(item.createdAt) }}</strong>
                  </div>
                </div>

                <div class="notifications-center__item-footer">
                  <span class="notifications-center__item-created">
                    {{ t('notifications.alertSummaryLabel') }}: {{ alertSummary.unread || 0 }} / {{ alertSummary.total || 0 }}
                  </span>

                  <div class="notifications-center__actions">
                    <Button
                      v-if="canOpenRoute(item.actionRouteName)"
                      type="button"
                      severity="secondary"
                      outlined
                      size="small"
                      @click="openRoute(item.actionRouteName, item.actionRouteParams)"
                    >
                      {{ t('notifications.openItem') }}
                    </Button>
                    <Button
                      v-if="String(item.status || '').toLowerCase() !== 'read'"
                      type="button"
                      severity="secondary"
                      size="small"
                      @click="handleAlertRead(item)"
                    >
                      {{ t('notifications.markAsRead') }}
                    </Button>
                    <Button
                      type="button"
                      severity="secondary"
                      outlined
                      size="small"
                      @click="handleAlertArchive(item)"
                    >
                      {{ t('notifications.archive') }}
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </template>
        </Card>

        <Card class="notifications-center__status-card">
          <template #title>
            {{ t('notifications.alertSummaryTitle') }}
          </template>

          <template #content>
            <div class="notifications-center__status-grid">
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.unreadAlerts') }}</span>
                <strong>{{ alertSummary.unread || 0 }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.criticalAlerts') }}</span>
                <strong>{{ alertSummary.critical || 0 }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.archivedAlerts') }}</span>
                <strong>{{ alertSummary.archived || 0 }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.totalAlerts') }}</span>
                <strong>{{ alertSummary.total || 0 }}</strong>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div
        v-else-if="activeTab === 'approvals'"
        class="notifications-center__panel-stack"
      >
        <Card class="notifications-center__section-card">
          <template #title>
            {{ t('notifications.tabs.approvals') }}
          </template>

          <template #content>
            <p class="notifications-center__section-subtitle">
              {{ approvalSubtitle }}
            </p>

            <div
              v-if="approvalsLoading"
              class="notifications-center__empty-state"
            >
              {{ t('notifications.loadingApprovals') }}
            </div>

            <div
              v-else-if="approvalsError"
              class="notifications-center__error-state"
            >
              {{ approvalsError }}
            </div>

            <div
              v-else-if="approvalItems.length === 0"
              class="notifications-center__empty-state"
            >
              {{ t('notifications.noApprovals') }}
            </div>

            <div
              v-else
              class="notifications-center__item-list"
            >
              <article
                v-for="item in approvalItems"
                :key="item.id"
                class="notifications-center__item-card"
              >
                <div class="notifications-center__item-head">
                  <div class="notifications-center__item-copy">
                    <h3 class="notifications-center__item-title">
                      {{ item.title }}
                    </h3>
                    <p class="notifications-center__item-summary">
                      {{ item.summary }}
                    </p>
                  </div>

                  <span :class="['notifications-center__pill', `notifications-center__pill--${statusTone(item.status)}`]">
                    {{ item.status || 'pending' }}
                  </span>
                </div>

                <div class="notifications-center__meta-grid">
                  <div>
                    <span>{{ t('notifications.moduleLabel') }}</span>
                    <strong>{{ moduleLabel(item.module) }}</strong>
                  </div>
                  <div>
                    <span>{{ t('notifications.sourceLabel') }}</span>
                    <strong>{{ item.sourceType || '—' }}</strong>
                  </div>
                  <div>
                    <span>{{ t('notifications.dueLabel') }}</span>
                    <strong>{{ formatDateTime(item.dueAt) }}</strong>
                  </div>
                  <div>
                    <span>{{ t('notifications.priorityLabel') }}</span>
                    <strong>{{ item.priority || 'normal' }}</strong>
                  </div>
                </div>

                <div class="notifications-center__item-footer">
                  <span class="notifications-center__item-created">
                    {{ t('notifications.createdLabel') }}: {{ formatDateTime(item.createdAt) }}
                  </span>

                  <div class="notifications-center__actions">
                    <Button
                      v-if="canOpenRoute(item.actionRouteName) || resolveApprovalRoute(item)"
                      type="button"
                      severity="secondary"
                      outlined
                      size="small"
                      @click="goToApprovalWorkflow(item)"
                    >
                      {{ t('notifications.openWorkflow') }}
                    </Button>
                    <Button
                      v-if="approvalCanAct(item)"
                      type="button"
                      severity="secondary"
                      size="small"
                      @click="handleApprovalApprove(item)"
                    >
                      {{ t('notifications.approve') }}
                    </Button>
                    <Button
                      v-if="approvalCanAct(item)"
                      type="button"
                      severity="secondary"
                      outlined
                      size="small"
                      @click="handleApprovalReject(item)"
                    >
                      {{ t('notifications.reject') }}
                    </Button>
                    <Button
                      v-if="approvalCanAct(item)"
                      type="button"
                      severity="secondary"
                      outlined
                      size="small"
                      @click="handleApprovalReturn(item)"
                    >
                      {{ t('notifications.return') }}
                    </Button>
                    <Button
                      v-if="approvalCanAct(item)"
                      type="button"
                      severity="secondary"
                      text
                      size="small"
                      @click="handleApprovalCancel(item)"
                    >
                      {{ t('notifications.cancelApproval') }}
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </template>
        </Card>

        <Card class="notifications-center__status-card">
          <template #title>
            {{ t('notifications.approvalSummaryTitle') }}
          </template>

          <template #content>
            <div class="notifications-center__status-grid">
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.pendingApprovals') }}</span>
                <strong>{{ approvalSummary.pendingApprovals || 0 }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.approvedApprovals') }}</span>
                <strong>{{ approvalSummary.approved || 0 }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.rejectedApprovals') }}</span>
                <strong>{{ approvalSummary.rejected || 0 }}</strong>
              </div>
              <div class="notifications-center__status-item">
                <span>{{ t('notifications.totalApprovals') }}</span>
                <strong>{{ approvalSummary.total || 0 }}</strong>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.notifications-center {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notifications-center__tabbar {
  margin-bottom: 0.2rem;
}

.notifications-center__panel-stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.notifications-center__section-card,
.notifications-center__status-card {
  border-radius: 1.15rem;
}

.notifications-center__section-subtitle {
  margin: 0 0 0.75rem;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.55;
}

.notifications-center__item-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.notifications-center__item-card {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 14px 28px -24px rgba(15, 23, 42, 0.2);
}

.notifications-center__item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.notifications-center__item-copy {
  min-width: 0;
}

.notifications-center__item-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 800;
  color: #0f172a;
}

.notifications-center__item-summary {
  margin: 0.3rem 0 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.55;
}

.notifications-center__meta-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.notifications-center__meta-grid > div,
.notifications-center__status-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.notifications-center__meta-grid span,
.notifications-center__status-item span,
.notifications-center__item-created {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.notifications-center__meta-grid strong,
.notifications-center__status-item strong {
  color: #0f172a;
  font-size: 0.92rem;
}

.notifications-center__item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
}

.notifications-center__item-created {
  text-transform: none;
  letter-spacing: 0;
}

.notifications-center__item-created--overdue {
  color: #b91c1c;
  font-weight: 800;
}

.notifications-center__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.notifications-center__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3rem;
  padding: 0.22rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.notifications-center__pill--rose {
  background: #ffe4e6;
  color: #be123c;
}

.notifications-center__pill--amber {
  background: #fef3c7;
  color: #b45309;
}

.notifications-center__pill--emerald {
  background: #d1fae5;
  color: #047857;
}

.notifications-center__pill--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.notifications-center__pill--slate {
  background: #e2e8f0;
  color: #334155;
}

.notifications-center__status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.notifications-center__error-state,
.notifications-center__empty-state {
  padding: 1rem;
  border-radius: 0.95rem;
  font-size: 0.88rem;
}

.notifications-center__error-state {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.notifications-center__empty-state {
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  color: #64748b;
}

@media (max-width: 1024px) {
  .notifications-center__meta-grid,
  .notifications-center__status-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .notifications-center__meta-grid,
  .notifications-center__status-grid {
    grid-template-columns: 1fr;
  }

  .notifications-center__item-head,
  .notifications-center__item-footer {
    flex-direction: column;
  }
}
</style>
