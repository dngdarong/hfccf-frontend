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

/**
 * Normalize API/mock class data into table-safe rows.
 */
const normalizedRows = computed(() =>
  props.classes.map((item, index) => ({
    id: item.id || `class-${index + 1}`,
    code: item.code || item.classCode || '-',
    name: item.name || item.className || '-',
    teacher: item.teacher || item.teacherName || '-',
    level: item.level || item.grade || '-',
    schedule: item.schedule || item.time || '-',
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
      field="code"
      :header="t('preschoolClassesManagement.table.code')"
      sortable
    />

    <Column
      field="name"
      :header="t('preschoolClassesManagement.table.class')"
      sortable
    >
      <template #body="{ data }">
        <div class="flex items-center gap-3">
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
        </div>
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
    />

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
