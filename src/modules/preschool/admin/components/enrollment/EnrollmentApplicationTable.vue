<script setup>
import { useI18n } from 'vue-i18n'
import EnrollmentStatusBadge from './EnrollmentStatusBadge.vue'

defineOptions({ name: 'EnrollmentApplicationTable' })

defineProps({
  applications: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  canManage: { type: Boolean, default: false },
})

const emit = defineEmits(['view', 'edit', 'action'])
const { t } = useI18n()

function rowAction(type, app) {
  emit('action', { type, application: app })
}

function nextAction(app) {
  const map = {
    draft: 'submit',
    submitted: 'review',
    under_review: 'approve',
    approved: 'enroll',
  }
  return map[app.status] ?? null
}

function nextActionLabel(app) {
  const action = nextAction(app)
  if (!action) return null
  const map = {
    submit: t('preschoolEnrollmentPage.actions.submit'),
    review: t('preschoolEnrollmentPage.actions.review'),
    approve: t('preschoolEnrollmentPage.actions.approve'),
    enroll: t('preschoolEnrollmentPage.actions.enroll'),
  }
  return map[action] ?? action
}
</script>

<template>
  <div class="enr-table-wrap">
    <table class="enr-table">
      <thead>
        <tr>
          <th>{{ t('preschoolEnrollmentPage.columns.no') }}</th>
          <th>{{ t('preschoolEnrollmentPage.columns.code') }}</th>
          <th>{{ t('preschoolEnrollmentPage.columns.applicant') }}</th>
          <th>{{ t('preschoolEnrollmentPage.columns.level') }}</th>
          <th>{{ t('preschoolEnrollmentPage.columns.guardian') }}</th>
          <th>{{ t('preschoolEnrollmentPage.columns.status') }}</th>
          <th>{{ t('preschoolEnrollmentPage.columns.appliedDate') }}</th>
          <th>{{ t('preschoolEnrollmentPage.columns.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="i in 6" :key="i">
            <td colspan="8"><div class="enr-table__skeleton" /></td>
          </tr>
        </template>
        <template v-else-if="applications.length === 0">
          <tr>
            <td colspan="8" class="enr-table__empty">
              <p>{{ t('preschoolEnrollmentPage.empty.noApplications') }}</p>
              <span>{{ t('preschoolEnrollmentPage.empty.noApplicationsHint') }}</span>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="(app, idx) in applications" :key="app.id">
            <td class="enr-table__num">{{ idx + 1 }}</td>
            <td class="enr-table__code">{{ app.applicationCode }}</td>
            <td>
              <div class="enr-table__name">{{ app.fullName }}</div>
              <div v-if="app.khmerName" class="enr-table__sub">{{ app.khmerName }}</div>
            </td>
            <td>{{ app.requestedLevel ?? '—' }}</td>
            <td>
              <div class="enr-table__name">{{ app.guardianName ?? '—' }}</div>
              <div v-if="app.guardianPhone" class="enr-table__sub">{{ app.guardianPhone }}</div>
            </td>
            <td><EnrollmentStatusBadge :status="app.status" /></td>
            <td class="enr-table__date">{{ app.applicationDate ?? '—' }}</td>
            <td>
              <div class="enr-table__actions">
                <button class="enr-table__btn enr-table__btn--ghost" @click="emit('view', app)">
                  {{ t('preschoolEnrollmentPage.actions.view') }}
                </button>
                <button
                  v-if="canManage && !['enrolled','rejected','cancelled'].includes(app.status)"
                  class="enr-table__btn enr-table__btn--ghost"
                  @click="emit('edit', app)"
                >
                  {{ t('preschoolEnrollmentPage.actions.edit') }}
                </button>
                <button
                  v-if="canManage && nextAction(app)"
                  class="enr-table__btn enr-table__btn--primary"
                  @click="rowAction(nextAction(app), app)"
                >
                  {{ nextActionLabel(app) }}
                </button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.enr-table-wrap {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.enr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.enr-table thead th {
  padding: 0.75rem 1rem;
  text-align: left;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.enr-table tbody tr:hover { background: #f8fafc; }

.enr-table tbody td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
}

.enr-table tbody tr:last-child td { border-bottom: none; }

.enr-table__num { color: #94a3b8; font-size: 0.8rem; }
.enr-table__code { font-family: monospace; font-size: 0.8rem; color: #475569; }
.enr-table__name { font-weight: 600; color: #0f172a; }
.enr-table__sub { font-size: 0.78rem; color: #94a3b8; }
.enr-table__date { font-size: 0.8rem; color: #64748b; white-space: nowrap; }

.enr-table__skeleton {
  height: 28px;
  border-radius: 0.4rem;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.enr-table__empty {
  text-align: center;
  padding: 3rem 1rem !important;
  color: #94a3b8;
}

.enr-table__empty p { font-size: 1rem; font-weight: 600; margin: 0 0 0.25rem; color: #64748b; }
.enr-table__empty span { font-size: 0.85rem; }

.enr-table__actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.enr-table__btn {
  padding: 0.3rem 0.7rem;
  border-radius: 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s;
  white-space: nowrap;
}

.enr-table__btn--ghost {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

.enr-table__btn--ghost:hover { background: #e2e8f0; }

.enr-table__btn--primary {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

.enr-table__btn--primary:hover { background: #4f46e5; }
</style>
