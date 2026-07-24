<script setup>
/**
 * ClassTable
 * --------------------------------------------------------------------------
 * Preschool class table component.
 *
 * Features:
 * - PrimeVue DataTable
 * - Loading / empty states
 * - Class avatar initials
 * - Status badge
 * - View/Edit/Delete row actions
 * --------------------------------------------------------------------------
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'
import ActionsButton from '@/components/buttons/ActionsButton.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import Loading from '@/components/feedback/Loading.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'ClassTable',
})

const props = defineProps({
  classes: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: 'No classes found.',
  },
})

const emit = defineEmits(['view', 'edit', 'delete'])

const { t } = useLanguage()

const dayOrder = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const dayPatterns = [
  ['monday', /\b(mon|monday)\b/i],
  ['tuesday', /\b(tue|tues|tuesday)\b/i],
  ['wednesday', /\b(wed|weds|wednesday)\b/i],
  ['thursday', /\b(thu|thur|thurs|thursday)\b/i],
  ['friday', /\b(fri|friday)\b/i],
  ['saturday', /\b(sat|saturday)\b/i],
  ['sunday', /\b(sun|sunday)\b/i],
]

function getDayShortLabel(day) {
  return t(`preschoolClassesManagement.table.weekdaysShort.${day}`)
}

function normalizeScheduleTime(value) {
  const text = String(value || '').trim()
  if (!text) return ''

  const match = text.match(/^(\d{1,2}):(\d{2})(?:\s?(am|pm))?$/i)
  if (!match) return text

  let hours = Number(match[1])
  const minutes = match[2]
  const meridiem = match[3]?.toLowerCase()

  if (meridiem === 'am' && hours === 12) hours = 0
  if (meridiem === 'pm' && hours < 12) hours += 12

  return `${String(hours).padStart(2, '0')}:${minutes}`
}

function formatScheduleRange(startTime, endTime) {
  const start = normalizeScheduleTime(startTime)
  const end = normalizeScheduleTime(endTime)

  if (!start || !end) return ''
  return `${start}–${end}`
}

function compressDays(days = []) {
  const selected = dayOrder.filter((day) => days.includes(day))
  if (!selected.length) return ''

  const segments = []
  let segmentStart = selected[0]
  let previousIndex = dayOrder.indexOf(selected[0])

  for (let index = 1; index < selected.length; index += 1) {
    const currentDay = selected[index]
    const currentIndex = dayOrder.indexOf(currentDay)

    if (currentIndex === previousIndex + 1) {
      previousIndex = currentIndex
      continue
    }

    segments.push([segmentStart, dayOrder[previousIndex]])
    segmentStart = currentDay
    previousIndex = currentIndex
  }

  segments.push([segmentStart, dayOrder[previousIndex]])

  return segments
    .map(([start, end]) => (start === end ? getDayShortLabel(start) : `${getDayShortLabel(start)}–${getDayShortLabel(end)}`))
    .join(', ')
}

function truncateSchedule(value, maxLength = 36) {
  const text = String(value || '').trim()
  if (!text) return t('preschoolClassesManagement.table.scheduleUnavailable')
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

function parseScheduleDisplay(value) {
  const raw = String(value || '').trim()
  if (!raw) {
    return {
      mode: 'empty',
      label: t('preschoolClassesManagement.table.scheduleUnavailable'),
      title: t('preschoolClassesManagement.table.scheduleUnavailable'),
    }
  }

  const timeMatch = raw.match(/(\d{1,2}:\d{2}\s?(?:am|pm)?)[\s]*[–—-][\s]*(\d{1,2}:\d{2}\s?(?:am|pm)?)/i)
  if (!timeMatch) {
    return {
      mode: 'legacy',
      label: truncateSchedule(raw),
      title: raw,
    }
  }

  const daysPart = raw.slice(0, timeMatch.index).replace(/[,·•]+$/, '').trim()
  const selectedDays = dayPatterns
    .filter(([, pattern]) => pattern.test(daysPart))
    .map(([day]) => day)

  if (!selectedDays.length) {
    return {
      mode: 'legacy',
      label: truncateSchedule(raw),
      title: raw,
    }
  }

  const startTime = normalizeScheduleTime(timeMatch[1])
  const endTime = normalizeScheduleTime(timeMatch[2])
  const dayLabel = compressDays(selectedDays)

  if (!dayLabel || !startTime || !endTime) {
    return {
      mode: 'legacy',
      label: truncateSchedule(raw),
      title: raw,
    }
  }

  return {
    mode: 'structured',
    label: `${dayLabel} · ${formatScheduleRange(startTime, endTime)}`,
    title: raw,
  }
}

/**
 * Normalize API/mock class data into table-safe rows.
 */
const normalizedRows = computed(() =>
  props.classes.map((item, index) => ({
    id: item.id || `class-${index + 1}`,
    number: index + 1,
    code: item.code || item.classCode || '-',
    name: item.name || item.className || '-',
    teacher: item.teacher || item.teacherName || '-',
    level: item.level || item.grade || '-',
    schedule: item.schedule || item.time || '-',
    scheduleDisplay: parseScheduleDisplay(item.schedule || item.time || '-'),
    students: item.students ?? item.studentCount ?? 0,
    status: item.status || 'Active',
    raw: item,
  })),
)

/**
 * Convert class status into shared StatusBadge tone.
 */
function statusType(status) {
  const value = String(status || '').trim().toLowerCase()

  if (value === 'active' || value === 'open') return 'success'
  if (value === 'pending') return 'info'
  if (value === 'inactive' || value === 'closed') return 'warning'
  if (value === 'suspended') return 'error'

  return 'info'
}

/**
 * Build initials from class name.
 */
function classInitials(name) {
  return (
    String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  )
}

/**
 * PrimeVue table pass-through styling.
 */
const tablePt = computed(() => ({
  root: {
    class: '!overflow-hidden !rounded-2xl !border !border-surface-200 !bg-white',
  },
  tableContainer: {
    class: '!bg-white',
  },
  table: {
    class: '!bg-white',
  },
  headerRow: {
    class: '!bg-slate-50',
  },
  headerCell: {
    class:
      '!border-b !border-surface-200 !bg-slate-50 !px-4 !py-3.5 !text-[0.75rem] !font-bold !tracking-[0.06em] !text-surface-600 uppercase md:!px-4',
  },
  bodyRow: {
    class: 'odd:!bg-white even:!bg-sky-50/30 hover:!bg-brand-50/60 transition-colors',
  },
  bodyCell: {
    class: '!border-b !border-slate-100 !bg-transparent !px-4 !py-3.5 !text-surface-700 md:!px-4',
  },
  emptyMessage: {
    class: '!bg-white',
  },
}))
</script>

<template>
  <DataTable
    :value="normalizedRows"
    data-key="id"
    striped-rows
    removable-sort
    class="class-table"
    :loading="loading"
    :pt="tablePt"
  >
    <!-- Empty state -->
    <template #empty>
      <div class="px-4 py-7 text-center text-sm text-surface-500">
        {{ emptyText }}
      </div>
    </template>

    <!-- Loading state -->
    <template #loading>
      <div class="px-4 py-8">
        <Loading
          :label="t('preschoolClassesManagement.loading') || 'Loading classes...'"
          size="md"
        />
      </div>
    </template>

    <Column
      field="number"
      :header="t('preschoolClassesManagement.table.number')"
      sortable
    >
      <template #body="{ data }">
        <span class="font-semibold text-slate-700">
          {{ data.number }}
        </span>
      </template>
    </Column>

    <Column
      field="name"
      :header="t('preschoolClassesManagement.table.class')"
      sortable
    >
      <template #body="{ data }">
        <RouterLink
          :to="{ name: 'dashboard-preschool-admin-class-details', params: { id: data.id } }"
          class="flex items-center gap-3 rounded-xl text-inherit no-underline transition-colors hover:text-brand-700"
        >
          <Avatar
            :label="classInitials(data.name)"
            shape="circle"
            class="class-table__avatar"
          />

          <div class="min-w-0">
            <div class="truncate text-[13px] font-semibold leading-5 text-surface-900 sm:text-sm">
              {{ data.name }}
            </div>

            <div class="text-[11px] text-surface-500 sm:text-xs">
              {{ data.code }}
            </div>
          </div>
        </RouterLink>
      </template>
    </Column>

    <Column
      field="teacher"
      :header="t('preschoolClassesManagement.table.teacher')"
      sortable
    />

    <Column
      field="level"
      :header="t('preschoolClassesManagement.table.level')"
      sortable
    >
      <template #body="{ data }">
        <span class="class-table__level-chip">
          {{ data.level }}
        </span>
      </template>
    </Column>

    <Column
      field="schedule"
      :header="t('preschoolClassesManagement.table.schedule')"
    >
      <template #body="{ data }">
        <span
          class="block max-w-[16rem] overflow-hidden text-ellipsis whitespace-nowrap text-surface-700"
          :title="data.scheduleDisplay.title"
        >
          {{ data.scheduleDisplay.label }}
        </span>
        <span
          v-if="data.scheduleDisplay.mode === 'legacy'"
          class="mt-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700"
        >
          {{ t('preschoolClassesManagement.table.legacySchedule') }}
        </span>
      </template>
    </Column>

    <Column
      field="students"
      :header="t('preschoolClassesManagement.table.students')"
      sortable
    >
      <template #body="{ data }">
        <span class="font-semibold text-slate-700">
          {{ data.students }}
        </span>
      </template>
    </Column>

    <Column
      field="status"
      :header="t('common.table.status')"
      sortable
    >
      <template #body="{ data }">
        <StatusBadge
          :status="statusType(data.status)"
          :label="data.status"
          size="sm"
        />
      </template>
    </Column>

    <Column
      :header="t('common.table.actions')"
      :pt="{
        headerCell: { class: 'text-right' },
        bodyCell: { class: 'text-right' },
      }"
    >
      <template #body="{ data }">
        <div class="flex justify-end">
          <ActionsButton
            :item="data.raw"
            :show-view="true"
            :show-edit="true"
            :show-delete="true"
            @view="emit('view', $event)"
            @edit="emit('edit', $event)"
            @delete="emit('delete', $event)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
/**
 * Class avatar style.
 */
.class-table__avatar.p-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(
    135deg,
    var(--brand-primary-500) 0%,
    var(--brand-primary-700) 100%
  );
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 8px 16px -10px rgba(0, 174, 239, 0.5);
}

/**
 * Level chip style.
 */
.class-table__level-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.32rem 0.7rem;
  border-radius: 999px;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 0.74rem;
  font-weight: 700;
}

</style>
