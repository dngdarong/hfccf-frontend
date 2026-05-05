<script setup>
import { computed, ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'
import Loading from '@/components/feedback/Loading.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import RolesBadge from '@/components/badges/RolesBadge.vue'
import PermissionBadge from '@/components/badges/PermissionBadge.vue'
import ActionsButton from '@/components/buttons/ActionsButton.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

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
  actionStyle: {
    type: String,
    default: 'menu',
    validator: (value) => ['menu', 'buttons'].includes(value),
  },
})

const emit = defineEmits(['view', 'edit', 'delete'])
const { t } = useLanguage()
const hasImageError = ref({})

const resolvedRows = computed(() => (Array.isArray(props.rows) ? props.rows : props.users))
const resolvedEmptyText = computed(() => props.emptyText || t('users.table.empty') || 'No rows found.')
const loadingLabel = computed(() => t('users.loadingUsers') || 'Loading data')
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
  bodyRow: ({ context }) => ({
    class: context?.stripedRows
      ? 'odd:!bg-white even:!bg-sky-50/30 hover:!bg-brand-50/60 transition-colors'
      : 'hover:!bg-brand-50/60 transition-colors',
  }),
  bodyCell: {
    class: '!border-b !border-slate-100 !bg-transparent !px-4 !py-3.5 !text-surface-700 md:!px-4',
  },
  loadingOverlay: {
    class: '!bg-white/80 backdrop-blur-[1px]',
  },
  emptyMessage: {
    class: '!bg-white',
  },
}))
const defaultColumns = computed(() => [
  { key: 'number', label: t('common.table.number'), align: 'left' },
  { key: 'user', label: t('common.table.user'), align: 'left' },
  { key: 'email', label: t('common.table.email'), align: 'left' },
  { key: 'role', label: t('common.table.role'), align: 'left' },
  { key: 'permission', label: t('common.table.permission'), align: 'left' },
  { key: 'status', label: t('common.table.status'), align: 'left' },
  { key: 'phone', label: t('common.table.phone'), align: 'left' },
  { key: 'actions', label: t('common.table.actions'), align: 'right' },
])
const resolvedColumns = computed(() => (props.columns.length ? props.columns : defaultColumns.value))
const useButtonActions = computed(() => props.actionStyle === 'buttons')

function statusType(row) {
  const value = String(row?.status ?? '').toLowerCase()
  if (value === 'active') return 'success'
  if (value === 'pending') return 'pending'
  if (value === 'inactive') return 'warning'
  if (value === 'suspended') return 'error'
  return 'info'
}

function permissionList(row) {
  const explicit = Array.isArray(row?.permissions) ? row.permissions : []
  if (explicit.length) return explicit
  return String(row?.permission ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function usernameLabel(username) {
  const value = String(username ?? '').trim()
  if (!value) return '-'
  return value.startsWith('@') ? value : `@${value}`
}

function avatarSrc(row) {
  const key = row?.id || row?.email || row?.username || row?.name
  if (hasImageError.value[key]) return ''
  return String(row?.avatar || row?.avatarUrl || row?.profileImage || row?.photo || '').trim()
}

function userInitials(row) {
  const name = String(row?.name ?? '').trim()
  if (!name) return '?'
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  )
}

function plainValue(row, column) {
  const field = column?.field || column?.key
  const value = row?.[field]
  const normalized = String(value ?? '').trim()
  return normalized || '-'
}

function onAvatarError(row) {
  const key = row?.id || row?.email || row?.username || row?.name
  hasImageError.value = { ...hasImageError.value, [key]: true }
}

watch(
  () => resolvedRows.value,
  () => {
    hasImageError.value = {}
  },
  { deep: true },
)
</script>

<template>
  <DataTable
    :value="resolvedRows"
    :data-key="rowKey"
    :loading="loading"
    striped-rows
    removable-sort
    class="ui-data-table"
    :pt="tablePt"
  >
    <template #empty>
      <div class="px-4 py-7 text-center text-sm text-surface-500">
        {{ resolvedEmptyText }}
      </div>
    </template>

    <template #loading>
      <div class="px-4 py-8">
        <div class="flex justify-center">
          <Loading :label="loadingLabel" size="md" />
        </div>
      </div>
    </template>

    <Column
      v-for="column in resolvedColumns"
      :key="column.key"
      :field="column.field || column.key"
      :header="column.label"
      :pt="{
        headerCell: { class: column.align === 'right' ? 'text-right' : 'text-left' },
        bodyCell: { class: column.align === 'right' ? 'text-right' : 'text-left' },
      }"
    >
      <template #body="{ data, index }">
        <template v-if="column.key === 'number'">
          <span class="text-[12px] font-semibold text-surface-700 sm:text-sm">
            {{ data?.rowNumber || index + 1 }}
          </span>
        </template>

        <template v-else-if="column.key === 'user'">
          <div class="flex items-center gap-3">
            <Avatar
              :label="avatarSrc(data) ? undefined : userInitials(data)"
              :image="avatarSrc(data) || undefined"
              shape="circle"
              class="ui-user-avatar"
              @image-error="onAvatarError(data)"
            />
            <div>
              <div class="text-[13px] font-semibold leading-5 text-surface-900 sm:text-sm">
                {{ data.name || '-' }}
              </div>
              <div class="text-[11px] text-surface-500 sm:text-xs">
                ID: {{ data.id || '-' }}
              </div>
              <div class="text-[11px] text-surface-600 sm:text-xs">
                {{ usernameLabel(data.username) }}
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="column.key === 'role'">
          <RolesBadge :role="data.role" />
        </template>

        <template v-else-if="column.key === 'permission'">
          <div class="flex flex-wrap gap-1">
            <PermissionBadge
              v-for="permission in permissionList(data)"
              :key="permission"
              :permission="permission"
            />
            <span v-if="!permissionList(data).length" class="text-[11px] text-surface-400">-</span>
          </div>
        </template>

        <template v-else-if="column.key === 'status'">
          <StatusBadge :status="statusType(data)" :label="String(data.status ?? 'Unknown')" size="sm" />
        </template>

        <template v-else-if="column.key === 'actions'">
          <div v-if="useButtonActions" class="ui-data-table__row-actions">
            <Button
              type="button"
              icon="pi pi-eye"
              rounded="full"
              variant="ghost"
              size="sm"
              class="ui-data-table__row-action"
              @click="emit('view', data)"
            />
            <Button
              type="button"
              icon="pi pi-pencil"
              rounded="full"
              variant="ghost"
              size="sm"
              class="ui-data-table__row-action"
              @click="emit('edit', data)"
            />
            <Button
              type="button"
              icon="pi pi-trash"
              rounded="full"
              variant="ghost"
              size="sm"
              class="ui-data-table__row-action ui-data-table__row-action--danger"
              @click="emit('delete', data)"
            />
          </div>
          <ActionsButton
            v-else
            :item="data"
            @view="emit('view', data)"
            @edit="emit('edit', data)"
            @delete="emit('delete', data)"
          />
        </template>

        <template v-else>
          <span class="text-[12px] text-surface-700 sm:text-sm">{{ plainValue(data, column) }}</span>
        </template>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
:deep(.ui-user-avatar.p-avatar) {
  width: 2.75rem;
  height: 2.75rem;
  background: linear-gradient(135deg, var(--brand-primary-500) 0%, var(--brand-primary-700) 100%);
  color: #fff;
  box-shadow: 0 10px 18px -14px rgba(0, 174, 239, 0.55);
}

.ui-data-table__row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
}

.ui-data-table__row-action {
  width: 2.15rem;
  height: 2.15rem;
}

.ui-data-table__row-action--danger {
  color: #b42318;
}

.ui-data-table__row-action :deep(.p-button-icon) {
  font-size: 0.8rem;
}
</style>
