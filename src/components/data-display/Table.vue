<script setup>
/**
 * UsersTable
 * --------------------------------------------------------------------------
 * Shared data table for user-style records.
 *
 * Features:
 * - PrimeVue DataTable wrapper
 * - Loading / empty states
 * - Dynamic columns
 * - User avatar fallback
 * - Role / permission / status badges
 * - Menu row actions
 * --------------------------------------------------------------------------
 */

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useSlots } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import RolesBadge from '@/components/badges/RolesBadge.vue'
import PermissionBadge from '@/components/badges/PermissionBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import TableEmptyState from '@/components/data-display/components/TableEmptyState.vue'
import TableLoadingState from '@/components/data-display/components/TableLoadingState.vue'
import TableActions from '@/components/data-display/components/TableActions.vue'
import { useTableAvatar } from './composables/useTableAvatar'
import {
  formatDateTime,
  hiddenPermissionCount,
  hiddenPermissionLabel,
  permissionList,
  plainValue,
  statusType,
  useTableDisplay,
  usernameLabel,
  visiblePermissions,
} from './composables/useTableDisplay'

defineOptions({
  name: 'UsersTable',
})

const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: '',
  },
  columns: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  showViewAction: {
    type: Boolean,
    default: true,
  },
  showEditAction: {
    type: Boolean,
    default: true,
  },
  showDeleteAction: {
    type: Boolean,
    default: true,
  },
  showResetAction: {
    type: Boolean,
    default: false,
  },
  sortField: {
    type: String,
    default: '',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  serverSide: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view', 'edit', 'delete', 'reset', 'sort'])

const { t } = useLanguage()
const slots = useSlots()

const {
  resolvedRows,
  resolvedEmptyText,
  loadingLabel,
  resolvedColumns,
  resolvedSortField,
  resolvedSortOrder,
  tablePt,
} = useTableDisplay(props, t)

const { avatarSrc, shouldShowImage, userInitials, onAvatarError, onAvatarLoad } =
  useTableAvatar(resolvedRows)

function onSort(event) {
  if (!props.serverSide) return

  emit('sort', event)
}

function humanizePaymentValue(value) {
  const key = String(value || '').trim().toLowerCase()
  const map = {
    cash: 'Cash',
    mobile_payment: 'Mobile Payment',
    bank_transfer: 'Bank Transfer',
    card: 'Card',
    other: 'Other',
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  }

  if (!key) return '-'
  if (map[key]) return map[key]

  return key
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function paymentTone(value) {
  const key = String(value || '').trim().toLowerCase()

  if (['paid', 'cash'].includes(key)) return 'success'
  if (['pending', 'mobile_payment'].includes(key)) return 'info'
  if (['overdue', 'bank_transfer'].includes(key)) return 'warning'
  if (['cancelled', 'card'].includes(key)) return 'neutral'

  return 'neutral'
}
</script>

<template>
  <DataTable
    :value="resolvedRows"
    :data-key="rowKey"
    :loading="loading"
    :lazy="serverSide"
    :sort-field="resolvedSortField || undefined"
    :sort-order="resolvedSortOrder"
    striped-rows
    removable-sort
    class="ui-data-table"
    :pt="tablePt"
    @sort="onSort"
  >
    <!-- Empty state -->
    <template #empty>
      <TableEmptyState :text="resolvedEmptyText" />
    </template>

    <!-- Loading state -->
    <template #loading>
      <TableLoadingState :label="loadingLabel" />
    </template>

    <Column
      v-for="column in resolvedColumns"
      :key="column.key"
      :field="column.field || column.key"
      :header="column.label"
      :sortable="Boolean(column.sortable)"
      :sort-field="column.sortField || column.field || column.key"
      :pt="{
        headerCell: {
          class: column.align === 'right' ? 'text-right' : 'text-left',
        },
        bodyCell: {
          class: column.align === 'right' ? 'text-right' : 'text-left',
        },
      }"
    >
      <template #body="{ data, index }">
        <!-- Row number -->
        <template v-if="column.key === 'number'">
          <span class="text-[12px] font-semibold text-surface-700 sm:text-sm">
            {{ data?.rowNumber || index + 1 }}
          </span>
        </template>

        <!-- Student profile cell -->
        <template v-else-if="column.key === 'student'">
          <div class="ui-student-cell">
            <div class="ui-user-avatar ui-user-avatar--student">
              <span
                v-if="!shouldShowImage(data)"
                class="ui-user-avatar__initials"
              >
                {{ userInitials(data) }}
              </span>
              <img
                v-if="avatarSrc(data)"
                :src="avatarSrc(data)"
                :alt="`${data.name || 'Student'} avatar`"
                class="ui-user-avatar__image"
                :class="{ 'ui-user-avatar__image--visible': shouldShowImage(data) }"
                @load="onAvatarLoad(data)"
                @error="onAvatarError(data)"
              >
            </div>
            <div class="min-w-0">
              <div class="ui-student-cell__name">{{ data.name || '-' }}</div>
              <div v-if="data.publicId || data.studentCode" class="ui-student-cell__code">
                {{ data.publicId || data.studentCode }}
              </div>
            </div>
          </div>
        </template>

        <!-- User profile cell -->
        <template v-else-if="column.key === 'user'">
          <div class="ui-teacher-cell">
            <div class="ui-user-avatar">
              <span
                v-if="!shouldShowImage(data)"
                class="ui-user-avatar__initials"
              >
                {{ userInitials(data) }}
              </span>

              <img
                v-if="avatarSrc(data)"
                :src="avatarSrc(data)"
                :alt="`${data.name || 'User'} avatar`"
                class="ui-user-avatar__image"
                :class="{ 'ui-user-avatar__image--visible': shouldShowImage(data) }"
                @load="onAvatarLoad(data)"
                @error="onAvatarError(data)"
              >
            </div>

            <div class="min-w-0">
              <div class="ui-teacher-cell__name">{{ data.name || '-' }}</div>
              <div v-if="data.username" class="ui-teacher-cell__username">{{ usernameLabel(data.username) }}</div>
            </div>
          </div>
        </template>

        <!-- Role badge -->
        <template v-else-if="column.key === 'role'">
          <RolesBadge :role="data.role" />
        </template>

        <!-- Permission badges -->
        <template v-else-if="column.key === 'permission'">
          <div class="flex flex-wrap gap-1">
            <PermissionBadge
              v-for="permission in visiblePermissions(data)"
              :key="permission"
              :permission="permission"
            />

            <span
              v-if="!permissionList(data).length"
              class="text-[11px] text-surface-400"
            >
              -
            </span>

            <span
              v-else-if="hiddenPermissionCount(data) > 0"
              class="inline-flex items-center rounded-full border border-surface-200 bg-surface-100 px-2 py-0.5 text-[0.68rem] font-semibold leading-none tracking-[0.02em] text-surface-600"
              :title="hiddenPermissionLabel(data)"
            >
              +{{ hiddenPermissionCount(data) }} more
            </span>
          </div>
        </template>

        <!-- Status badge -->
        <template v-else-if="column.key === 'status'">
          <StatusBadge
            :status="statusType(data)"
            :label="String(data.status ?? 'Unknown')"
            size="sm"
          />
        </template>

        <!-- Payment method badge -->
        <template v-else-if="column.key === 'paymentMethod'">
          <StatusBadge
            :status="paymentTone(data.paymentMethod)"
            :label="humanizePaymentValue(data.paymentMethod)"
            :translate-label="false"
            :dot="false"
            size="sm"
          />
        </template>

        <!-- Payment status badge -->
        <template v-else-if="column.key === 'paymentStatus'">
          <StatusBadge
            :status="paymentTone(data.paymentStatus)"
            :label="humanizePaymentValue(data.paymentStatus)"
            :translate-label="false"
            size="sm"
          />
        </template>

        <!-- Created at -->
        <template v-else-if="column.key === 'created_at'">
          <span class="text-[12px] text-surface-700 sm:text-sm">
            {{ formatDateTime(data.createdAt || data.created_at) }}
          </span>
        </template>

        <!-- Compact class name cell -->
        <template v-else-if="column.key === 'className'">
          <div
            class="inline-flex max-w-[14rem] items-center gap-1 overflow-hidden align-middle"
            :title="String(data.classTooltip || plainValue(data, column) || '-').trim() || '-'"
          >
            <span class="min-w-0 flex-1 truncate text-[12px] text-surface-700 sm:text-sm">
              {{ String(data.className || plainValue(data, column) || '-').trim() || '-' }}
            </span>
            <AppBadge
              v-if="Number(data.classCount || 0) > 1"
              class="shrink-0"
              size="xs"
              variant="neutral"
              :label="`+${Math.max(Number(data.extraClassCount || 0), 0)}`"
              :title="String(data.classTooltip || plainValue(data, column) || '-').trim() || '-'"
            />
          </div>
        </template>

        <!-- Row actions -->
        <template v-else-if="column.key === 'actions'">
          <slot
            v-if="slots.actions"
            name="actions"
            :data="data"
            :index="index"
          />
          <TableActions
            v-else
            :item="data"
            :show-view-action="showViewAction"
            :show-edit-action="showEditAction"
            :show-delete-action="showDeleteAction"
            :show-reset-action="showResetAction"
            @view="emit('view', $event)"
            @edit="emit('edit', $event)"
            @delete="emit('delete', $event)"
            @reset="emit('reset', $event)"
          />
        </template>

        <!-- Default plain cell -->
        <template v-else>
          <span class="text-[12px] text-surface-700 sm:text-sm">
            {{ plainValue(data, column) }}
          </span>
        </template>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
/**
 * User avatar style.
 */
.ui-user-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(
    135deg,
    var(--brand-primary-400, #38bdf8) 0%,
    var(--brand-primary-700, #0369a1) 100%
  );
  color: #ffffff;
  box-shadow:
    0 0 0 2.5px #fff,
    0 0 0 4px #e0f2fe,
    0 10px 20px -14px rgba(0, 174, 239, 0.5);
  border-radius: 9999px;
  overflow: hidden;
  flex-shrink: 0;
}

.ui-user-avatar--student {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%);
  box-shadow:
    0 0 0 2.5px #fff,
    0 0 0 4px #ede9fe,
    0 10px 20px -14px rgba(124, 58, 237, 0.5);
}

/* teacher cell layout */
.ui-teacher-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ui-teacher-cell__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 16rem;
}

.ui-teacher-cell__username {
  margin-top: 0.1rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: #0369a1;
  letter-spacing: 0.03em;
}

/* student cell layout */
.ui-student-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ui-student-cell__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 16rem;
}

.ui-student-cell__code {
  margin-top: 0.1rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: #7c3aed;
  letter-spacing: 0.03em;
}

.ui-user-avatar__initials {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.ui-user-avatar__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.ui-user-avatar__image--visible {
  opacity: 1;
}

/**
 * Inline action buttons container.
 */
.ui-data-table__row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
}

/**
 * Inline action button sizing.
 */
.ui-data-table__row-action {
  width: 2.15rem;
  height: 2.15rem;
}

/**
 * Delete action color.
 */
.ui-data-table__row-action--danger {
  color: #b42318;
}

.ui-data-table__row-action :deep(.p-button-icon) {
  font-size: 0.8rem;
}
</style>
