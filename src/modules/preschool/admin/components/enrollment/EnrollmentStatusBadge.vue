<script setup>
defineOptions({ name: 'EnrollmentStatusBadge' })

defineProps({
  status: { type: String, default: '' },
})

const TONE = {
  draft: 'neutral',
  submitted: 'info',
  under_review: 'warning',
  approved: 'success',
  waitlisted: 'warning',
  rejected: 'danger',
  enrolled: 'success',
  cancelled: 'muted',
}

const LABEL = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
  enrolled: 'Enrolled',
  cancelled: 'Cancelled',
}
</script>

<template>
  <span class="enr-badge" :class="`enr-badge--${TONE[status] ?? 'neutral'}`">
    {{ LABEL[status] ?? status }}
  </span>
</template>

<style scoped>
.enr-badge {
  display: inline-block;
  padding: 0.22em 0.65em;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.enr-badge--info { background: #dbeafe; color: #1d4ed8; }
.enr-badge--success { background: #dcfce7; color: #15803d; }
.enr-badge--warning { background: #fef9c3; color: #a16207; }
.enr-badge--danger { background: #fee2e2; color: #b91c1c; }
.enr-badge--neutral { background: #f1f5f9; color: #475569; }
.enr-badge--muted { background: #f1f5f9; color: #94a3b8; }
</style>
