<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from '@/components/buttons/Button.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useUserStore } from '@/store/userStore'
import {
  archivePreschoolNotification,
  assignPreschoolAutomationTask,
  cancelPreschoolAutomationTask,
  completePreschoolAutomationTask,
  fetchPreschoolAutomationTaskSummary,
  fetchPreschoolAutomationTasks,
  fetchPreschoolNotificationSummary,
  fetchPreschoolNotifications,
  markPreschoolNotificationRead,
  runPreschoolDailyAutomationChecks,
} from '@/modules/preschool/services/api/preschoolNotificationApi'

defineOptions({
  name: 'NotificationAutomationCenter',
})

const { t } = useLanguage()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const runningDailyChecks = ref(false)
const errorMessage = ref('')
const notificationSummary = ref({
  total: 0,
  unread: 0,
  read: 0,
  archived: 0,
  critical: 0,
  byType: [],
  bySeverity: [],
})
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
const notifications = ref([])
const tasks = ref([])
const assignDialogOpen = ref(false)
const activeTask = ref(null)
const assignForm = reactive({
  assignedToUserId: '',
  assignedRole: 'adminpreschool',
  description: '',
})

const canRunDailyChecks = computed(() => ['superadmin', 'adminpreschool'].includes(userStore.currentUser?.role_code))

const roleOptions = computed(() => [
  { label: t('common.role.adminpreschool'), value: 'adminpreschool' },
  { label: t('common.role.teacher_preschool'), value: 'teacher-preschool' },
])

const summaryCards = computed(() => [
  { title: t('preschoolNotificationAutomationPage.unread'), value: notificationSummary.value.unread, tone: 'rose' },
  { title: t('preschoolNotificationAutomationPage.criticalNotifications'), value: notificationSummary.value.critical, tone: 'amber' },
  { title: t('preschoolNotificationAutomationPage.openTasks'), value: taskSummary.value.open, tone: 'blue' },
  { title: t('preschoolNotificationAutomationPage.overdueTasks'), value: taskSummary.value.overdue, tone: 'rose' },
  { title: t('preschoolNotificationAutomationPage.todaysTasks'), value: taskSummary.value.today, tone: 'emerald' },
  { title: t('preschoolNotificationAutomationPage.completedTasks'), value: taskSummary.value.completed, tone: 'slate' },
])

const unreadNotifications = computed(() => notifications.value.filter((item) => item.status === 'unread'))
const overdueTasks = computed(() => tasks.value.filter((item) => item.status === 'overdue' || isPastDue(item.dueAt)))
const todayTasks = computed(() => tasks.value.filter((item) => isToday(item.dueAt) && item.status !== 'completed' && item.status !== 'cancelled'))
const recentActivity = computed(() => [
  ...notifications.value.slice(0, 3).map((item) => ({
    id: `notification-${item.id}`,
    type: 'notification',
    title: item.title,
    text: item.body,
    status: item.status,
    createdAt: item.createdAt,
  })),
  ...tasks.value.slice(0, 3).map((item) => ({
    id: `task-${item.id}`,
    type: 'task',
    title: item.title,
    text: item.description,
    status: item.status,
    createdAt: item.createdAt,
  })),
].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))))

const notificationBreakdown = computed(() => notificationSummary.value.byType || [])
const taskBreakdown = computed(() => taskSummary.value.byType || [])

function resolveWorkflowLink(item) {
  const routeName = String(item?.workflowRoute || '').trim()

  if (!routeName || !router.hasRoute(routeName)) {
    return null
  }

  return {
    name: routeName,
    params: item?.workflowActionParams || {},
  }
}

function openRelatedWorkflow(item) {
  const target = resolveWorkflowLink(item)

  if (!target) {
    return
  }

  router.push(target)
}

function severityTone(severity) {
  const key = String(severity || '').toLowerCase()
  if (['critical', 'high'].includes(key)) return 'rose'
  if (key === 'medium') return 'amber'
  if (key === 'low') return 'emerald'
  return 'slate'
}

function priorityTone(priority) {
  const key = String(priority || '').toLowerCase()
  if (key === 'urgent') return 'rose'
  if (key === 'high') return 'amber'
  if (key === 'normal') return 'blue'
  return 'slate'
}

function isPastDue(dueAt) {
  if (!dueAt) return false
  return new Date(dueAt).getTime() < new Date().setHours(0, 0, 0, 0)
}

function isToday(dueAt) {
  if (!dueAt) return false
  const current = new Date()
  const value = new Date(dueAt)

  return value.getFullYear() === current.getFullYear()
    && value.getMonth() === current.getMonth()
    && value.getDate() === current.getDate()
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

function formatCount(value) {
  return Number.isFinite(Number(value)) ? String(value) : '0'
}

async function loadAll() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [notificationSummaryResponse, notificationListResponse, taskSummaryResponse, taskListResponse] = await Promise.all([
      fetchPreschoolNotificationSummary({}),
      fetchPreschoolNotifications({ page: 1, perPage: 20 }),
      fetchPreschoolAutomationTaskSummary({}),
      fetchPreschoolAutomationTasks({ page: 1, perPage: 20 }),
    ])

    notificationSummary.value = notificationSummaryResponse
    notifications.value = notificationListResponse.items
    taskSummary.value = taskSummaryResponse
    tasks.value = taskListResponse.items
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
  } finally {
    loading.value = false
  }
}

async function reload() {
  await loadAll()
}

async function markRead(notification) {
  if (!notification?.id) return

  await markPreschoolNotificationRead(notification.id)
  await loadAll()
}

async function archive(notification) {
  if (!notification?.id) return

  await archivePreschoolNotification(notification.id)
  await loadAll()
}

async function completeTask(task) {
  if (!task?.id) return

  await completePreschoolAutomationTask(task.id)
  await loadAll()
}

async function cancelTask(task) {
  if (!task?.id) return

  await cancelPreschoolAutomationTask(task.id)
  await loadAll()
}

function openAssignDialog(task) {
  activeTask.value = task
  assignForm.assignedToUserId = task?.assignedToUserId || ''
  assignForm.assignedRole = task?.assignedRole || 'adminpreschool'
  assignForm.description = task?.description || ''
  assignDialogOpen.value = true
}

async function submitAssignment() {
  if (!activeTask.value?.id) return

  await assignPreschoolAutomationTask(activeTask.value.id, {
    assignedToUserId: assignForm.assignedToUserId || null,
    assignedRole: assignForm.assignedRole || null,
  })
  assignDialogOpen.value = false
  activeTask.value = null
  await loadAll()
}

async function runDailyChecks() {
  runningDailyChecks.value = true
  errorMessage.value = ''

  try {
    await runPreschoolDailyAutomationChecks()
    await loadAll()
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
  } finally {
    runningDailyChecks.value = false
  }
}

onMounted(loadAll)
</script>

<template>
  <MainLayout>
    <section class="notification-automation-center">
      <HeaderSection
        :title="t('preschoolNotificationAutomationPage.title')"
        :subtitle="t('preschoolNotificationAutomationPage.subtitle')"
      />

      <div class="notification-automation-center__actions">
        <Button
          type="button"
          severity="secondary"
          outlined
          :disabled="loading"
          @click="reload"
        >
          {{ t('common.refresh') }}
        </Button>

        <Button
          v-if="canRunDailyChecks"
          type="button"
          :loading="runningDailyChecks"
          @click="runDailyChecks"
        >
          {{ t('preschoolNotificationAutomationPage.runDailyChecks') }}
        </Button>
      </div>

      <div
        v-if="loading"
        class="notification-automation-center__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div class="notification-automation-center__summary-grid">
        <Card
          v-for="card in summaryCards"
          :key="card.title"
          class="notification-automation-center__summary-card"
        >
          <template #title>
            <div class="flex items-center justify-between gap-3">
              <span>{{ card.title }}</span>
              <span :class="['notification-automation-center__pill', `notification-automation-center__pill--${card.tone}`]">
                {{ formatCount(card.value) }}
              </span>
            </div>
          </template>
        </Card>
      </div>

      <div
        v-if="errorMessage"
        class="notification-automation-center__error"
      >
        {{ errorMessage }}
      </div>

      <div class="notification-automation-center__grid">
        <Card class="notification-automation-center__panel">
          <template #title>
            {{ t('preschoolNotificationAutomationPage.unreadNotifications') }}
          </template>

          <template #content>
            <div
              v-if="unreadNotifications.length === 0"
              class="notification-automation-center__empty"
            >
              {{ t('preschoolNotificationAutomationPage.noNotifications') }}
            </div>

            <div
              v-else
              class="notification-automation-center__list"
            >
              <article
                v-for="notification in unreadNotifications"
                :key="notification.id"
                class="notification-automation-center__item"
              >
                <div class="notification-automation-center__item-head">
                  <div>
                    <h3 class="notification-automation-center__item-title">
                      {{ notification.title }}
                    </h3>
                    <p class="notification-automation-center__item-meta">
                      {{ notification.notificationType }} · {{ notification.sourceType || '—' }}
                    </p>
                  </div>

                  <span :class="['notification-automation-center__pill', `notification-automation-center__pill--${severityTone(notification.severity)}`]">
                    {{ notification.severity }}
                  </span>
                </div>

                <p class="notification-automation-center__item-body">
                  {{ notification.body }}
                </p>

                <div class="notification-automation-center__item-footer">
                  <div class="flex flex-col gap-1">
                    <span>{{ formatDateTime(notification.createdAt) }}</span>
                    <span v-if="notification.workflowInstanceId" class="text-xs text-slate-500">
                      {{ t('preschoolNotificationAutomationPage.relatedWorkflow') }}:
                      {{ notification.workflowStatus || notification.workflowInstanceId }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <Button
                      v-if="resolveWorkflowLink(notification)"
                      type="button"
                      severity="secondary"
                      outlined
                      size="small"
                      @click="openRelatedWorkflow(notification)"
                    >
                      {{ t('preschoolNotificationAutomationPage.openWorkflow') }}
                    </Button>
                    <Button type="button" severity="secondary" size="small" @click="markRead(notification)">
                      {{ t('preschoolNotificationAutomationPage.markAsRead') }}
                    </Button>
                    <Button type="button" severity="secondary" outlined size="small" @click="archive(notification)">
                      {{ t('preschoolNotificationAutomationPage.archive') }}
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </template>
        </Card>

        <Card class="notification-automation-center__panel">
          <template #title>
            {{ t('preschoolNotificationAutomationPage.automationTasks') }}
          </template>

          <template #content>
            <div
              v-if="tasks.length === 0"
              class="notification-automation-center__empty"
            >
              {{ t('preschoolNotificationAutomationPage.noAutomationTasks') }}
            </div>

            <div
              v-else
              class="notification-automation-center__list"
            >
              <article
                v-for="task in tasks"
                :key="task.id"
                class="notification-automation-center__item"
              >
                <div class="notification-automation-center__item-head">
                  <div>
                    <h3 class="notification-automation-center__item-title">
                      {{ task.title }}
                    </h3>
                    <p class="notification-automation-center__item-meta">
                      {{ task.taskType }} · {{ task.sourceType || '—' }}
                    </p>
                  </div>

                  <span :class="['notification-automation-center__pill', `notification-automation-center__pill--${priorityTone(task.priority)}`]">
                    {{ task.priority }}
                  </span>
                </div>

                <p class="notification-automation-center__item-body">
                  {{ task.description }}
                </p>

                <div class="notification-automation-center__item-footer">
                  <div class="flex flex-col gap-1">
                    <span>
                      {{ t('preschoolNotificationAutomationPage.dueDate') }}:
                      {{ formatDateTime(task.dueAt) }}
                    </span>
                    <span v-if="task.workflowInstanceId" class="text-xs text-slate-500">
                      {{ t('preschoolNotificationAutomationPage.relatedWorkflow') }}:
                      {{ task.workflowStatus || task.workflowInstanceId }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <Button
                      v-if="resolveWorkflowLink(task)"
                      type="button"
                      severity="secondary"
                      outlined
                      size="small"
                      @click="openRelatedWorkflow(task)"
                    >
                      {{ t('preschoolNotificationAutomationPage.openWorkflow') }}
                    </Button>
                    <Button type="button" severity="secondary" size="small" @click="completeTask(task)">
                      {{ t('preschoolNotificationAutomationPage.completeTask') }}
                    </Button>
                    <Button type="button" severity="secondary" outlined size="small" @click="cancelTask(task)">
                      {{ t('preschoolNotificationAutomationPage.cancelTask') }}
                    </Button>
                    <Button type="button" severity="secondary" text size="small" @click="openAssignDialog(task)">
                      {{ t('preschoolNotificationAutomationPage.assignTask') }}
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </template>
        </Card>
      </div>

      <div class="notification-automation-center__secondary-grid">
        <Card class="notification-automation-center__panel">
          <template #title>
            {{ t('preschoolNotificationAutomationPage.overdueTasks') }}
          </template>

          <template #content>
            <div
              v-if="overdueTasks.length === 0"
              class="notification-automation-center__empty"
            >
              {{ t('preschoolNotificationAutomationPage.noAutomationTasks') }}
            </div>

            <ul v-else class="notification-automation-center__compact-list">
              <li
                v-for="task in overdueTasks"
                :key="`overdue-${task.id}`"
              >
                <strong>{{ task.title }}</strong>
                <span> · {{ formatDateTime(task.dueAt) }}</span>
              </li>
            </ul>
          </template>
        </Card>

        <Card class="notification-automation-center__panel">
          <template #title>
            {{ t('preschoolNotificationAutomationPage.todaysTasks') }}
          </template>

          <template #content>
            <div
              v-if="todayTasks.length === 0"
              class="notification-automation-center__empty"
            >
              {{ t('preschoolNotificationAutomationPage.noAutomationTasks') }}
            </div>

            <ul v-else class="notification-automation-center__compact-list">
              <li
                v-for="task in todayTasks"
                :key="`today-${task.id}`"
              >
                <strong>{{ task.title }}</strong>
                <span> · {{ formatDateTime(task.dueAt) }}</span>
              </li>
            </ul>
          </template>
        </Card>
      </div>

      <div class="notification-automation-center__secondary-grid">
        <Card class="notification-automation-center__panel">
          <template #title>
            {{ t('preschoolNotificationAutomationPage.ruleBreakdown') }}
          </template>

          <template #content>
            <div class="notification-automation-center__breakdown">
              <div>
                <h3 class="notification-automation-center__breakdown-title">{{ t('preschoolNotificationAutomationPage.notifications') }}</h3>
                <ul class="notification-automation-center__compact-list">
                  <li v-for="item in notificationBreakdown" :key="item.notificationType || item.severity">
                    {{ item.notificationType || item.severity || '—' }}: {{ item.total }}
                  </li>
                </ul>
              </div>

              <div>
                <h3 class="notification-automation-center__breakdown-title">{{ t('preschoolNotificationAutomationPage.automationTasks') }}</h3>
                <ul class="notification-automation-center__compact-list">
                  <li v-for="item in taskBreakdown" :key="item.taskType || item.priority">
                    {{ item.taskType || item.priority || '—' }}: {{ item.total }}
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </Card>

        <Card class="notification-automation-center__panel">
          <template #title>
            {{ t('preschoolNotificationAutomationPage.recentActivity') }}
          </template>

          <template #content>
            <div
              v-if="recentActivity.length === 0"
              class="notification-automation-center__empty"
            >
              {{ t('preschoolNotificationAutomationPage.noNotifications') }}
            </div>

            <ul v-else class="notification-automation-center__compact-list">
              <li v-for="item in recentActivity" :key="item.id">
                <strong>{{ item.title }}</strong>
                <span> · {{ item.type }}</span>
                <div class="text-slate-500">{{ item.text }}</div>
              </li>
            </ul>
          </template>
        </Card>
      </div>

      <Dialog
        v-model:visible="assignDialogOpen"
        modal
        :header="t('preschoolNotificationAutomationPage.assignTask')"
        class="notification-automation-center__dialog"
      >
        <div class="notification-automation-center__dialog-body">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-slate-700">
              {{ t('preschoolNotificationAutomationPage.assignedToUserId') }}
            </label>
            <InputText
              v-model="assignForm.assignedToUserId"
              type="text"
              class="w-full"
              placeholder="usr_123"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-slate-700">
              {{ t('preschoolNotificationAutomationPage.assignedRole') }}
            </label>
            <Select
              v-model="assignForm.assignedRole"
              :options="roleOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-slate-700">
              {{ t('preschoolNotificationAutomationPage.description') }}
            </label>
            <Textarea
              v-model="assignForm.description"
              rows="3"
              class="w-full"
              disabled
            />
          </div>
        </div>

        <template #footer>
          <Button type="button" severity="secondary" outlined @click="assignDialogOpen = false">
            {{ t('common.cancel') }}
          </Button>
          <Button type="button" @click="submitAssignment">
            {{ t('preschoolNotificationAutomationPage.assignTask') }}
          </Button>
        </template>
      </Dialog>
    </section>
  </MainLayout>
</template>

<style scoped>
.notification-automation-center {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-automation-center__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.notification-automation-center__summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.75rem;
}

.notification-automation-center__summary-card {
  border-radius: 1rem;
}

.notification-automation-center__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.notification-automation-center__pill--rose {
  background: #ffe4e6;
  color: #be123c;
}

.notification-automation-center__pill--amber {
  background: #fef3c7;
  color: #b45309;
}

.notification-automation-center__pill--emerald {
  background: #d1fae5;
  color: #047857;
}

.notification-automation-center__pill--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.notification-automation-center__pill--slate {
  background: #e2e8f0;
  color: #334155;
}

.notification-automation-center__error {
  padding: 0.9rem 1rem;
  border: 1px solid #fecaca;
  border-radius: 1rem;
  background: #fef2f2;
  color: #b91c1c;
}

.notification-automation-center__loading {
  padding: 0.9rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  background: #f8fafc;
  color: #475569;
}

.notification-automation-center__grid,
.notification-automation-center__secondary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.notification-automation-center__panel {
  border-radius: 1rem;
}

.notification-automation-center__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-automation-center__item {
  padding: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  background: #ffffff;
}

.notification-automation-center__item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.notification-automation-center__item-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.notification-automation-center__item-meta,
.notification-automation-center__item-body,
.notification-automation-center__item-footer,
.notification-automation-center__compact-list {
  font-size: 0.85rem;
  color: #475569;
}

.notification-automation-center__item-body {
  margin: 0.5rem 0 0.75rem;
}

.notification-automation-center__item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.notification-automation-center__empty {
  padding: 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 0.95rem;
  color: #64748b;
  background: #f8fafc;
}

.notification-automation-center__compact-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding-left: 1rem;
}

.notification-automation-center__breakdown {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.notification-automation-center__breakdown-title {
  margin: 0 0 0.5rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.notification-automation-center__dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: min(30rem, 86vw);
}

@media (max-width: 1024px) {
  .notification-automation-center__summary-grid,
  .notification-automation-center__grid,
  .notification-automation-center__secondary-grid,
  .notification-automation-center__breakdown {
    grid-template-columns: 1fr;
  }
}
</style>
