import { computed } from 'vue'
import { useUserStore } from '@/store/userStore'
import {
  approvePreschoolWorkflowApproval,
  assignPreschoolWorkflow,
  cancelPreschoolWorkflow,
  cancelPreschoolWorkflowApproval,
  completePreschoolWorkflow,
  escalatePreschoolWorkflow,
  rejectPreschoolWorkflowApproval,
  returnPreschoolWorkflowApproval,
  transitionPreschoolWorkflow,
} from '@/modules/preschool/services/api/preschoolWorkflowApi'

const MANAGER_ROLES = new Set(['superadmin', 'adminpreschool'])

function resolvePayload(payload = {}) {
  if (payload === null || payload === undefined) {
    return {}
  }

  return { ...payload }
}

export function useWorkflowActions() {
  const userStore = useUserStore()
  const currentRole = computed(() => String(userStore.currentUser?.role_code ?? userStore.currentUser?.role ?? ''))
  const currentUserId = computed(() => String(userStore.currentUser?.id ?? ''))

  const canManageWorkflows = computed(() => MANAGER_ROLES.has(currentRole.value))

  function isApprovalTarget(approval = {}) {
    const requestedUserId = String(approval.requestedToUserId ?? approval.requested_to_user_id ?? '')
    const requestedRole = String(approval.requestedToRole ?? approval.requested_to_role ?? '')

    return canManageWorkflows.value
      || (currentUserId.value && requestedUserId && currentUserId.value === requestedUserId)
      || (currentRole.value && requestedRole && currentRole.value === requestedRole)
  }

  async function run(action, id, payload, onSuccess) {
    const response = await action(id, resolvePayload(payload))
    if (typeof onSuccess === 'function') {
      await onSuccess(response)
    }
    return response
  }

  return {
    canManageWorkflows,
    isApprovalTarget,
    assignWorkflow: (id, payload, onSuccess) => run(assignPreschoolWorkflow, id, payload, onSuccess),
    transitionWorkflow: (id, payload, onSuccess) => run(transitionPreschoolWorkflow, id, payload, onSuccess),
    completeWorkflow: (id, payload, onSuccess) => run(completePreschoolWorkflow, id, payload, onSuccess),
    cancelWorkflow: (id, payload, onSuccess) => run(cancelPreschoolWorkflow, id, payload, onSuccess),
    escalateWorkflow: (id, payload, onSuccess) => run(escalatePreschoolWorkflow, id, payload, onSuccess),
    approveApproval: (id, payload, onSuccess) => run(approvePreschoolWorkflowApproval, id, payload, onSuccess),
    rejectApproval: (id, payload, onSuccess) => run(rejectPreschoolWorkflowApproval, id, payload, onSuccess),
    returnApproval: (id, payload, onSuccess) => run(returnPreschoolWorkflowApproval, id, payload, onSuccess),
    cancelApproval: (id, payload, onSuccess) => run(cancelPreschoolWorkflowApproval, id, payload, onSuccess),
  }
}
