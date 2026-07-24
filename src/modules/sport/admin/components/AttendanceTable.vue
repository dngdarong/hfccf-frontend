<script setup>
import Button from '@/components/buttons/Button.vue'
import AttendanceStatusButton from './AttendanceStatusButton.vue'
import { useLanguage } from '@/composables/useLanguage'

const { t, language } = useLanguage()

function formatDateOfBirth(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return '—'
  }

  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return new Intl.DateTimeFormat(language.value === 'KH' ? 'km-KH' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return '—'
  }
}

function formatGender(genderValue) {
  if (!genderValue) {
    return '—'
  }

  const key = String(genderValue).trim().toLowerCase()
  const translationKey = `sportAddPlayer.genderOptions.${key}`

  if (t(translationKey) !== translationKey) {
    return t(translationKey)
  }

  return String(genderValue).trim()
}

defineProps({
  players: {
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

function handleToggleStatus(playerId, value) {
  emit('toggle-status', playerId, value)
}

function handleUpdateNote(playerId, note) {
  emit('update-note', playerId, note)
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
    <div class="att-panel__summary-area">
      <div class="att-panel__summary-header">
        <span class="att-panel__summary-label">{{ t('sportAttendanceShared.progress') }}</span>
        <span class="att-panel__summary-count">{{ markedCount }} / {{ players.length }}</span>
      </div>
      <div class="att-panel__progress-bar">
        <div
          class="att-panel__progress-fill"
          :style="{ width: players.length > 0 ? `${(markedCount / players.length) * 100}%` : '0%' }"
        ></div>
      </div>
    </div>

    <div class="att-panel__legend">
      <span
        v-for="option in statusOptions"
        :key="option.value"
        class="att-panel__legend-item"
        :data-status="option.value"
      >
        <span class="att-panel__legend-short">{{ option.short }}</span>
        <span class="att-panel__legend-label">{{ option.label }}</span>
      </span>
    </div>

    <div class="att-panel__table-wrapper">
      <table class="att-panel__table">
        <thead>
          <tr>
            <th class="att-panel__number-header">{{ t('common.table.number') }}</th>
            <th>{{ t('sportAdminPlayerAttendancePage.columns.player') }}</th>
            <th>{{ t('sportAdminPlayerAttendancePage.columns.dateOfBirth') }}</th>
            <th>{{ t('sportAdminPlayerAttendancePage.columns.gender') }}</th>
            <th>{{ t('sportAdminPlayerAttendancePage.columns.status') }}</th>
            <th>{{ t('sportAdminPlayerAttendancePage.columns.note') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, index) in players"
            :key="player.id"
            :class="index % 2 === 0 ? 'is-even' : 'is-odd'"
          >
            <td class="att-panel__number-cell">{{ index + 1 }}</td>
            <td>
              <p class="att-panel__person">{{ player.fullName || player.name }}</p>
              <p v-if="player.playerCode" class="att-panel__meta">{{ player.playerCode }}</p>
            </td>
            <td class="att-panel__dob-cell">{{ formatDateOfBirth(player.dateOfBirth) }}</td>
            <td class="att-panel__gender-cell">{{ formatGender(player.gender) }}</td>
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
                  :is-active="attendanceMap[player.id]?.status === option.value"
                  :disabled="loading || saving"
                  @click="handleToggleStatus(player.id, option.value)"
                />
              </div>
            </td>
            <td>
              <input
                :value="attendanceMap[player.id]?.note || ''"
                type="text"
                class="att-panel__note"
                :placeholder="t('sportAdminPlayerAttendancePage.placeholders.reason')"
                :disabled="loading || saving"
                @input="handleUpdateNote(player.id, $event.target.value)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="att-panel__footer">
      <div class="att-panel__footer-actions">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          :disabled="saving"
          @click="handleMarkAll('present')"
        >
          {{ t('sportAdminPlayerAttendancePage.actions.markAllPresent') }}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          :disabled="saving"
          @click="handleMarkAll('absent')"
        >
          {{ t('sportAdminPlayerAttendancePage.actions.markAllAbsent') }}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          :disabled="saving"
          @click="handleClearAll"
        >
          {{ t('sportAdminPlayerAttendancePage.actions.clearAll') }}
        </Button>
      </div>

      <div class="att-panel__footer-right">
        <p class="att-panel__footer-note">
          {{ t('sportAdminPlayerAttendancePage.messages.skippedNote') }}
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
          {{ saving ? t('sportAdminPlayerAttendancePage.actions.saving') : t('sportAdminPlayerAttendancePage.actions.save') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.att-panel {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0.95rem 1.05rem;
  border-radius: 1.2rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 22px 55px -38px rgba(15, 23, 42, 0.48);
}

.att-panel__summary-area {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.att-panel__summary-header {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.att-panel__summary-label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.att-panel__summary-count {
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 800;
}

.att-panel__progress-bar {
  width: 100%;
  height: 0.35rem;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.att-panel__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 300ms ease-out;
}

.att-panel__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.att-panel__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  border: 1px solid #dbe4f0;
  background: #f8fafc;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
}

/* Status-specific legend styling to match button colors */
.att-panel__legend-item[data-status="present"] .att-panel__legend-short {
  background: #10b981;
  color: white;
}

.att-panel__legend-item[data-status="absent"] .att-panel__legend-short {
  background: #e11d48;
  color: white;
}

.att-panel__legend-item[data-status="late"] .att-panel__legend-short {
  background: #d97706;
  color: white;
}

.att-panel__legend-item[data-status="excused"] .att-panel__legend-short {
  background: #2563eb;
  color: white;
}

.att-panel__legend-short {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 0.65rem;
  font-weight: 800;
  transition: all 150ms ease-in-out;
}

.att-panel__legend-label {
  white-space: nowrap;
}

.att-panel__table-wrapper {
  overflow-x: auto;
}

.att-panel__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 850px;
}

.att-panel__table thead {
  background: #f8fafc;
  color: #64748b;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.att-panel__table th,
.att-panel__table td {
  padding: 0.75rem 0.85rem;
  text-align: left;
  border-bottom: 1px solid #eef2f7;
}

.att-panel__number-header,
.att-panel__number-cell {
  width: 3.2rem;
  text-align: center;
  white-space: nowrap;
}

.att-panel__number-cell {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
}

.att-panel__table tbody tr.is-even {
  background: #fff;
}

.att-panel__table tbody tr.is-odd {
  background: #f8fafc;
}

.att-panel__person {
  margin: 0 0 0.15rem;
  color: #0f172a;
  font-weight: 800;
  font-size: 0.95rem;
}

.att-panel__meta {
  margin: 0;
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 500;
}

.att-panel__dob-cell,
.att-panel__gender-cell {
  color: #475569;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.att-panel__status-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.att-panel__note {
  width: 100%;
  min-width: 140px;
  height: 2.2rem;
  border-radius: 0.6rem;
  border: 1px solid #dbe4f0;
  padding: 0 0.7rem;
  font-size: 0.75rem;
  color: #0f172a;
  background: #fff;
  transition: border-color 150ms ease;
}

.att-panel__note::placeholder {
  color: #cbd5e1;
}

.att-panel__note:focus {
  outline: none;
  border-color: #0f766e;
  box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.1);
}

.att-panel__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border-top: 1px solid #eef2f7;
  padding-top: 0.8rem;
}

.att-panel__footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
}

.att-panel__footer-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.att-panel__footer-note {
  margin: 0;
  color: #94a3b8;
  font-size: 0.73rem;
  font-weight: 500;
  white-space: nowrap;
}
</style>
