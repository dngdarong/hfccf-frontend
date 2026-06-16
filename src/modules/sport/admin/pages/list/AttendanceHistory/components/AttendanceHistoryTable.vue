<script setup>
import StatusBadge from '@/components/badges/StatusBadge.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { statusLabel, typeLabel, teamLabel } from '../utils/attendanceHistoryHelpers'

defineProps({
  records: {
    type: Array,
    required: true,
  },
  pagination: {
    type: Object,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  teamOptions: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:currentPage'])

const { t } = useLanguage()

function handlePageChange(page) {
  emit('update:currentPage', page)
}
</script>

<template>
  <div class="att-history-table-panel">
    <div class="overflow-x-auto">
      <table class="att-history-table">
        <thead>
          <tr>
            <th>{{ t('sportAdminAttendanceHistoryPage.columns.date') }}</th>
            <th>{{ t('sportAdminAttendanceHistoryPage.columns.type') }}</th>
            <th>{{ t('sportAdminAttendanceHistoryPage.columns.team') }}</th>
            <th>{{ t('sportAdminAttendanceHistoryPage.columns.person') }}</th>
            <th>{{ t('sportAdminAttendanceHistoryPage.columns.status') }}</th>
            <th>{{ t('sportAdminAttendanceHistoryPage.columns.note') }}</th>
            <th>{{ t('sportAdminAttendanceHistoryPage.columns.recordedBy') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(record, index) in records"
            :key="record.id || `${record.attendanceDate}-${index}`"
            :class="index % 2 === 0 ? 'is-even' : 'is-odd'"
          >
            <td>{{ record.attendanceDate || '-' }}</td>
            <td>{{ typeLabel(record.attendanceType, t) }}</td>
            <td>{{ record.teamName || teamLabel(record.teamId, teamOptions) || '-' }}</td>
            <td>{{ record.personName || record.playerName || record.coachName || '-' }}</td>
            <td>
              <StatusBadge
                :status="record.status"
                :label="statusLabel(record.status, t)"
                :translate-label="false"
                size="sm"
              />
            </td>
            <td>{{ record.note || '-' }}</td>
            <td>{{ record.recordedByName || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.totalPages > 1" class="att-history-table-pagination">
      <Pagination
        :model-value="currentPage"
        :total-pages="pagination.totalPages"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.att-history-table-panel {
  padding: 1rem 1.1rem;
  border-radius: 1.3rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.att-history-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 920px;
}

.att-history-table thead {
  background: #f8fafc;
  color: #64748b;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.att-history-table th,
.att-history-table td {
  padding: 0.85rem 0.95rem;
  text-align: left;
  border-bottom: 1px solid #eef2f7;
}

.att-history-table tbody tr.is-even {
  background: #fff;
}

.att-history-table tbody tr.is-odd {
  background: #f8fafc;
}

.att-history-table tbody tr:hover {
  background: #eff6ff;
}

.att-history-table-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}
</style>
