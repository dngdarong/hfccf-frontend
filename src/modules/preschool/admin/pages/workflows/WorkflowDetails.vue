<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import MainLayout from '@/layouts/MainLayout.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useWorkflowActions } from './composables/useWorkflowActions'
import { useWorkflowDetailsData } from './composables/useWorkflowDetailsData'
import WorkflowDetailsHeaderSection from './sections/WorkflowDetailsHeaderSection.vue'
import WorkflowDetailsOverviewSection from './sections/WorkflowDetailsOverviewSection.vue'
import WorkflowDetailsApprovalsSection from './sections/WorkflowDetailsApprovalsSection.vue'
import WorkflowDetailsTimelineSection from './sections/WorkflowDetailsTimelineSection.vue'
import WorkflowDetailsActionsSection from './sections/WorkflowDetailsActionsSection.vue'

defineOptions({
  name: 'PreschoolWorkflowDetailsPage',
})

const route = useRoute()
const router = useRouter()
const { t } = useLanguage()
const {
  loading,
  errorMessage,
  workflow,
  timeline,
  approvals,
  loadWorkflowDetails,
} = useWorkflowDetailsData()
const {
  canManageWorkflows,
  assignWorkflow,
  transitionWorkflow,
  completeWorkflow,
  cancelWorkflow,
  escalateWorkflow,
  approveApproval,
  rejectApproval,
  returnApproval,
  cancelApproval,
} = useWorkflowActions()

const activeAction = ref('')
const activeApproval = ref(null)
const actionDialogOpen = ref(false)
const actionOptions = computed(() => [
  { label: t('common.role.adminpreschool'), value: 'adminpreschool' },
  { label: t('common.role.teacher_preschool'), value: 'teacher-preschool' },
])

const actionForm = reactive({
  assignedToUserId: '',
  assignedRole: 'adminpreschool',
  nextStepKey: '',
  decisionNotes: '',
})

const labels = computed(() => ({
  workflowDetails: t('preschoolWorkflowsPage.workflowDetails'),
  workflow: t('preschoolWorkflowsPage.workflow'),
  currentStep: t('preschoolWorkflowsPage.currentStep'),
  sourceEntity: t('preschoolWorkflowsPage.sourceEntity'),
  workflowSource: t('preschoolWorkflowsPage.workflowSource'),
  sourceUnavailable: t('preschoolWorkflowsPage.sourceUnavailable'),
  sourceId: t('preschoolWorkflowsPage.sourceId'),
  assignee: t('preschoolWorkflowsPage.assignee'),
  dueDate: t('preschoolWorkflowsPage.dueDate'),
  sla: t('preschoolWorkflowsPage.sla'),
  priority: t('preschoolWorkflowsPage.priority'),
  status: t('preschoolWorkflowsPage.status'),
  approvals: t('preschoolWorkflowsPage.approvals'),
  timeline: t('preschoolWorkflowsPage.timeline'),
  noTimeline: t('preschoolWorkflowsPage.noTimeline'),
  noPendingApprovals: t('preschoolWorkflowsPage.noPendingApprovals'),
  viewSource: t('preschoolWorkflowsPage.viewSource'),
  assign: t('preschoolWorkflowsPage.assign'),
  transition: t('preschoolWorkflowsPage.transition'),
  completeWorkflow: t('preschoolWorkflowsPage.completeWorkflow'),
  cancelWorkflow: t('preschoolWorkflowsPage.cancelWorkflow'),
  escalateWorkflow: t('preschoolWorkflowsPage.escalateWorkflow'),
  approve: t('preschoolWorkflowsPage.approve'),
  reject: t('preschoolWorkflowsPage.reject'),
  return: t('preschoolWorkflowsPage.return'),
  assignment: t('preschoolWorkflowsPage.assignment'),
  decisionNotes: t('preschoolWorkflowsPage.decisionNotes'),
  sourceTypes: {
    enrollmentApplication: t('preschoolWorkflowsPage.sourceTypes.enrollmentApplication'),
    healthAlert: t('preschoolWorkflowsPage.sourceTypes.healthAlert'),
    invoice: t('preschoolWorkflowsPage.sourceTypes.invoice'),
    assessmentReview: t('preschoolWorkflowsPage.sourceTypes.assessmentReview'),
    attendanceFollowUp: t('preschoolWorkflowsPage.sourceTypes.attendanceFollowUp'),
    automationTask: t('preschoolWorkflowsPage.sourceTypes.automationTask'),
  },
}))

const currentWorkflowId = computed(() => route.params.id)
const currentWorkflow = computed(() => workflow.value || {})
const isTerminalWorkflow = computed(() => ['completed', 'cancelled', 'approved', 'rejected'].includes(String(currentWorkflow.value.status || '').toLowerCase()))

function resolveSourceRoute(workflowItem) {
  const workflowRoute = String(workflowItem?.sourceRouteName || '').trim()
  const workflowParams = workflowItem?.sourceRouteParams || {}

  if (workflowItem?.sourceExists === false) {
    return null
  }

  if (workflowRoute && router.hasRoute(workflowRoute)) {
    return { name: workflowRoute, params: workflowParams }
  }

  const sourceType = String(workflowItem?.sourceType || '').toLowerCase()
  const sourceId = String(workflowItem?.sourceId || '')

  if (sourceType.includes('enrollment') && router.hasRoute('dashboard-preschool-admin-enrollments')) {
    return { name: 'dashboard-preschool-admin-enrollments', params: {} }
  }

  if (sourceType.includes('health') && router.hasRoute('dashboard-preschool-admin-health')) {
    return { name: 'dashboard-preschool-admin-health', params: {} }
  }

  if (sourceType.includes('invoice') && sourceId && router.hasRoute('dashboard-preschool-admin-invoice-detail')) {
    return { name: 'dashboard-preschool-admin-invoice-detail', params: { id: sourceId } }
  }

  if ((sourceType.includes('attendance') || sourceType.includes('follow')) && sourceId && router.hasRoute('dashboard-preschool-admin-attendance-session-details')) {
    return { name: 'dashboard-preschool-admin-attendance-session-details', params: { id: sourceId } }
  }

  if (sourceType.includes('automation') && router.hasRoute('dashboard-preschool-admin-notifications')) {
    return { name: 'dashboard-preschool-admin-notifications', params: {} }
  }

  return null
}

const sourceRoute = computed(() => resolveSourceRoute(currentWorkflow.value))

function resetActionForm() {
  actionForm.assignedToUserId = ''
  actionForm.assignedRole = 'adminpreschool'
  actionForm.nextStepKey = ''
  actionForm.decisionNotes = ''
}

function openAction(action, approval = null) {
  activeAction.value = action
  activeApproval.value = approval
  resetActionForm()
  if (action === 'assign') {
    actionForm.assignedRole = 'adminpreschool'
  }
  actionDialogOpen.value = true
}

function closeActionDialog() {
  actionDialogOpen.value = false
  activeAction.value = ''
  activeApproval.value = null
}

async function reloadWorkflow() {
  await loadWorkflowDetails(currentWorkflowId.value)
}

async function submitAction() {
  if (!currentWorkflow.value?.id) {
    return
  }

  const reload = reloadWorkflow
  const notes = actionForm.decisionNotes || ''

  if (activeAction.value === 'assign') {
    await assignWorkflow(currentWorkflow.value.id, {
      assignedToUserId: actionForm.assignedToUserId || null,
      assignedRole: actionForm.assignedRole || null,
    }, reload)
  } else if (activeAction.value === 'transition') {
    await transitionWorkflow(currentWorkflow.value.id, {
      nextStepKey: actionForm.nextStepKey || null,
      decisionNotes: notes || null,
    }, reload)
  } else if (activeAction.value === 'complete') {
    await completeWorkflow(currentWorkflow.value.id, {
      decisionNotes: notes || null,
    }, reload)
  } else if (activeAction.value === 'cancel') {
    await cancelWorkflow(currentWorkflow.value.id, {
      decisionNotes: notes || null,
    }, reload)
  } else if (activeAction.value === 'escalate') {
    await escalateWorkflow(currentWorkflow.value.id, {
      decisionNotes: notes || null,
    }, reload)
  } else if (activeAction.value === 'approve' && activeApproval.value?.id) {
    await approveApproval(activeApproval.value.id, {
      decisionNotes: notes || null,
    }, reload)
  } else if (activeAction.value === 'reject' && activeApproval.value?.id) {
    await rejectApproval(activeApproval.value.id, {
      decisionNotes: notes || null,
    }, reload)
  } else if (activeAction.value === 'return' && activeApproval.value?.id) {
    await returnApproval(activeApproval.value.id, {
      decisionNotes: notes || null,
    }, reload)
  } else if (activeAction.value === 'cancel-approval' && activeApproval.value?.id) {
    await cancelApproval(activeApproval.value.id, {
      decisionNotes: notes || null,
    }, reload)
  }

  closeActionDialog()
}

function approveApprovalAction(approval) {
  openAction('approve', approval)
}

function rejectApprovalAction(approval) {
  openAction('reject', approval)
}

function returnApprovalAction(approval) {
  openAction('return', approval)
}

function cancelApprovalAction(approval) {
  openAction('cancel-approval', approval)
}

watch(
  () => currentWorkflowId.value,
  async (id) => {
    await loadWorkflowDetails(id)
  },
  { immediate: true },
)
</script>

<template>
  <MainLayout>
    <section class="workflow-details-page">
      <div
        v-if="errorMessage"
        class="workflow-details-page__error"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="workflow-details-page__loading"
      >
        {{ t('preschoolWorkflowsPage.loading') }}
      </div>

      <WorkflowDetailsHeaderSection
        v-if="currentWorkflow.id"
        :workflow="currentWorkflow"
        :labels="labels"
      />

      <WorkflowDetailsOverviewSection
        v-if="currentWorkflow.id"
        :workflow="currentWorkflow"
        :labels="labels"
        :source-route-name="sourceRoute?.name || ''"
        :source-route-params="sourceRoute?.params || {}"
        :source-exists="currentWorkflow.sourceExists !== false"
        @view-source="sourceRoute && router.push(sourceRoute)"
      />

      <WorkflowDetailsApprovalsSection
        :approvals="approvals"
        :labels="labels"
        :can-act="canManageWorkflows"
        @approve="approveApprovalAction"
        @reject="rejectApprovalAction"
        @return="returnApprovalAction"
        @cancel="cancelApprovalAction"
      />

      <WorkflowDetailsTimelineSection
        :events="timeline"
        :labels="labels"
      />

      <WorkflowDetailsActionsSection
        v-if="canManageWorkflows && !isTerminalWorkflow"
        :can-manage-workflows="canManageWorkflows"
        :is-terminal="isTerminalWorkflow"
        :labels="labels"
        @assign="openAction('assign')"
        @transition="openAction('transition')"
        @complete="openAction('complete')"
        @cancel="openAction('cancel')"
        @escalate="openAction('escalate')"
      />

      <Dialog
        v-model:visible="actionDialogOpen"
        modal
        :header="labels.workflowDetails"
        class="workflow-details-page__dialog"
      >
        <div class="workflow-details-page__dialog-body">
          <div
            v-if="activeAction === 'assign'"
            class="workflow-details-page__field-grid"
          >
            <div class="workflow-details-page__field">
              <label>{{ labels.assign }}</label>
              <InputText
                v-model="actionForm.assignedToUserId"
                class="w-full"
                placeholder="user-id"
              />
            </div>
            <div class="workflow-details-page__field">
              <label>{{ labels.assignment }}</label>
              <Select
                v-model="actionForm.assignedRole"
                :options="actionOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>
          </div>

          <div
            v-if="activeAction === 'transition'"
            class="workflow-details-page__field"
          >
            <label>{{ labels.transition }}</label>
            <InputText
              v-model="actionForm.nextStepKey"
              class="w-full"
              placeholder="review"
            />
          </div>

          <div class="workflow-details-page__field">
            <label>{{ labels.decisionNotes }}</label>
            <Textarea
              v-model="actionForm.decisionNotes"
              rows="4"
              class="w-full"
            />
          </div>
        </div>

        <template #footer>
          <Button type="button" severity="secondary" outlined @click="closeActionDialog">
            {{ t('common.cancel') }}
          </Button>
          <Button type="button" @click="submitAction">
            {{ t('common.save') }}
          </Button>
        </template>
      </Dialog>
    </section>
  </MainLayout>
</template>

<style scoped>
.workflow-details-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workflow-details-page__error,
.workflow-details-page__loading {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
}

.workflow-details-page__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.workflow-details-page__loading {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
}

.workflow-details-page__dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: min(32rem, 88vw);
}

.workflow-details-page__field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.workflow-details-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.workflow-details-page__field label {
  font-size: 0.84rem;
  font-weight: 700;
  color: #475569;
}

@media (max-width: 768px) {
  .workflow-details-page__field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
