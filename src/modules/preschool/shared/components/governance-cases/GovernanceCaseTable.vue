<script setup>
import GovernanceCaseSeverityBadge from './GovernanceCaseSeverityBadge.vue'
import GovernanceCaseStatusBadge from './GovernanceCaseStatusBadge.vue'
import { formatDatetimeShort } from '@/utils/date'

defineOptions({
  name: 'GovernanceCaseTable',
})

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  selectedCaseId: {
    type: [String, Number],
    default: '',
  },
  columns: {
    type: Object,
    default: () => ({}),
  },
  emptyLabel: {
    type: String,
    default: 'No governance cases match the current filters.',
  },
  sourceLabelMap: {
    type: Object,
    default: () => ({}),
  },
  statusLabelMap: {
    type: Object,
    default: () => ({}),
  },
  severityLabelMap: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['select-case'])

function selectCase(record) {
  emit('select-case', record)
}
</script>

<template>
  <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3">{{ columns.case || 'Case' }}</th>
          <th class="px-4 py-3">{{ columns.severity || 'Severity' }}</th>
          <th class="px-4 py-3">{{ columns.status || 'Status' }}</th>
          <th class="px-4 py-3">{{ columns.owner || 'Owner' }}</th>
          <th class="px-4 py-3">{{ columns.dueDate || 'Due Date' }}</th>
          <th class="px-4 py-3">{{ columns.source || 'Source' }}</th>
          <th class="px-4 py-3">{{ columns.updatedAt || 'Updated' }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 bg-white">
        <tr
          v-for="record in items"
          :key="record.id"
          class="cursor-pointer hover:bg-slate-50"
          :class="String(selectedCaseId) === String(record.id) ? 'bg-blue-50/70' : ''"
          @click="selectCase(record)"
        >
          <td class="px-4 py-3">
            <p class="font-semibold text-slate-900">{{ record.caseKey }}</p>
            <p class="line-clamp-1 text-xs text-slate-500">{{ record.title }}</p>
          </td>
          <td class="px-4 py-3">
            <GovernanceCaseSeverityBadge :severity="record.severity" :label="severityLabelMap[record.severity] || record.severity" />
          </td>
          <td class="px-4 py-3">
            <GovernanceCaseStatusBadge :status="record.status" :label="statusLabelMap[record.status] || record.status" />
          </td>
          <td class="px-4 py-3 text-slate-600">
            {{ record.owner?.displayName || '-' }}
          </td>
          <td class="px-4 py-3 text-slate-600">
            {{ record.dueDate || '-' }}
          </td>
          <td class="px-4 py-3 text-slate-600">
            {{ sourceLabelMap[record.sourceType] || record.sourceType || '-' }}
          </td>
          <td class="px-4 py-3 text-slate-600">
            {{ formatDatetimeShort(record.updatedAt) }}
          </td>
        </tr>
        <tr v-if="!items.length">
          <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">
            {{ emptyLabel }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
