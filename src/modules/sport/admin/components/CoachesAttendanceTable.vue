<script setup>
import Button from '@/components/buttons/Button.vue'
import AttendanceStatusButton from './AttendanceStatusButton.vue'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

defineProps({
  coaches: {
    type: Array,
    required: true,
  },
  attendanceMap: {
    type: Object,
    required: true,
  },
  statusOptions: {
    type: Array,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  markedCount: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-status', 'update-note', 'mark-all', 'clear-all', 'save'])

function handleToggleStatus(coachId, value) {
  emit('toggle-status', coachId, value)
}

function handleUpdateNote(coachId, note) {
  emit('update-note', coachId, note)
}

function handleMarkAll(status) {
  emit('mark-all', status)
}

function handleClearAll() {
  emit('clear-all')
}

function handleSave() {
  emit('save')
}
</script>

<template>
  <div class="att-panel">
    <div class="att-panel__topbar">
      <span class="att-panel__summary">{{ summary }}</span>
      <div class="att-panel__actions">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          :disabled="saving"
          @click="handleMarkAll('present')"
        >
          {{ t('sportAdminCoachAttendancePage.actions.markAllPresent') }}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          :disabled="saving"
          @click="handleMarkAll('absent')"
        >
          {{ t('sportAdminCoachAttendancePage.actions.markAllAbsent') }}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          :disabled="saving"
          @click="handleClearAll"
        >
          {{ t('sportAdminCoachAttendancePage.actions.clearAll') }}
        </Button>
      </div>
    </div>

    <div class="att-panel__table-wrapper">
      <table class="att-panel__table">
        <thead>
          <tr>
            <th>{{ t('sportAdminCoachAttendancePage.columns.coach') }}</th>
            <th>{{ t('sportAdminCoachAttendancePage.columns.status') }}</th>
            <th>{{ t('sportAdminCoachAttendancePage.columns.note') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(coach, index) in coaches"
            :key="coach.id"
            :class="index % 2 === 0 ? 'is-even' : 'is-odd'"
          >
            <td>
              <p class="att-panel__person">{{ coach.displayName || coach.name || coach.username }}</p>
              <p v-if="coach.roleCode" class="att-panel__meta">{{ coach.roleCode }}</p>
            </td>
            <td>
              <div class="att-panel__status-group">
                <AttendanceStatusButton
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                  :short="option.short"
                  :active-class="option.active"
                  :ring-class="option.ring"
                  :is-active="attendanceMap[coach.id]?.status === option.value"
                  :disabled="loading || saving"
                  @click="handleToggleStatus(coach.id, option.value)"
                />
              </div>
            </td>
            <td>
              <input
                :value="attendanceMap[coach.id]?.note || ''"
                type="text"
                class="att-panel__note"
                :placeholder="t('sportAdminCoachAttendancePage.placeholders.note')"
                :disabled="loading || saving"
                @input="handleUpdateNote(coach.id, $event.target.value)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="att-panel__footer">
      <p class="att-panel__footer-note">
        {{ t('sportAdminCoachAttendancePage.messages.skippedNote') }}
      </p>
      <Button
        type="button"
        variant="primary"
        size="md"
        rounded="xl"
        :loading="saving"
        :disabled="saving || markedCount === 0"
        @click="handleSave"
      >
        {{ saving ? t('sportAdminCoachAttendancePage.actions.saving') : t('sportAdminCoachAttendancePage.actions.save') }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.att-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 1.3rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.att-panel__topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.att-panel__summary {
  color: #475569;
  font-size: 0.92rem;
  font-weight: 600;
}

.att-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.att-panel__table-wrapper {
  overflow-x: auto;
}

.att-panel__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.att-panel__table thead {
  background: #f8fafc;
  color: #64748b;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.att-panel__table th,
.att-panel__table td {
  padding: 0.85rem 0.95rem;
  text-align: left;
  border-bottom: 1px solid #eef2f7;
}

.att-panel__table tbody tr.is-even {
  background: #fff;
}

.att-panel__table tbody tr.is-odd {
  background: #f8fafc;
}

.att-panel__person {
  margin: 0;
  color: #0f172a;
  font-weight: 700;
}

.att-panel__meta {
  margin: 0.2rem 0 0;
  color: #94a3b8;
  font-size: 0.74rem;
}

.att-panel__status-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.att-panel__note {
  width: 100%;
  min-width: 160px;
  height: 2.35rem;
  border-radius: 0.65rem;
  border: 1px solid #dbe4f0;
  padding: 0 0.75rem;
  font-size: 0.8rem;
  color: #0f172a;
}

.att-panel__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 1px solid #eef2f7;
  padding-top: 0.9rem;
}

.att-panel__footer-note {
  margin: 0;
  color: #94a3b8;
  font-size: 0.78rem;
}
</style>
