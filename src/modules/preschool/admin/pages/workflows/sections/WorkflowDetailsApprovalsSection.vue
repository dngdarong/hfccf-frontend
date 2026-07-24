<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import { useUserStore } from '@/store/userStore'
import WorkflowApprovalCard from '../components/WorkflowApprovalCard.vue'
import WorkflowEmptyState from '../components/WorkflowEmptyState.vue'

defineProps({
  approvals: {
    type: Array,
    default: () => [],
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
  canAct: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['approve', 'reject', 'return', 'cancel', 'view-workflow'])

const userStore = useUserStore()
const currentRole = computed(() => String(userStore.currentUser?.role_code ?? userStore.currentUser?.role ?? ''))
const currentUserId = computed(() => String(userStore.currentUser?.id ?? ''))
const canManageWorkflows = computed(() => ['superadmin', 'adminpreschool'].includes(currentRole.value))

function canActForApproval(approval) {
  if (canManageWorkflows.value) {
    return true
  }

  const requestedUserId = String(approval?.requestedToUserId ?? approval?.requested_to_user_id ?? '')
  const requestedRole = String(approval?.requestedToRole ?? approval?.requested_to_role ?? '')

  return (currentUserId.value && requestedUserId && currentUserId.value === requestedUserId)
    || (currentRole.value && requestedRole && currentRole.value === requestedRole)
}
</script>

<template>
  <Card class="workflow-section-card">
    <template #title>
      {{ labels.approvals || 'Approvals' }}
    </template>

    <template #content>
      <WorkflowEmptyState
        v-if="approvals.length === 0"
        :title="labels.noPendingApprovals || 'No Pending Approvals'"
      />

      <div
        v-else
        class="workflow-section-card__list"
      >
        <WorkflowApprovalCard
          v-for="approval in approvals"
          :key="approval.id"
          :approval="approval"
          :can-act="canActForApproval(approval)"
          :labels="labels"
          @approve="$emit('approve', $event)"
          @reject="$emit('reject', $event)"
          @return="$emit('return', $event)"
          @cancel="$emit('cancel', $event)"
          @view-workflow="$emit('view-workflow', $event)"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.workflow-section-card {
  border-radius: 1rem;
}

.workflow-section-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
