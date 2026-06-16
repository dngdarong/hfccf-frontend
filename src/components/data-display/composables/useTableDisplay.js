import { computed } from 'vue'

export const MAX_VISIBLE_PERMISSIONS = 3

export function statusType(row) {
  const value = String(row?.status || '').trim().toLowerCase()

  if (value === 'active') return 'success'
  if (value === 'pending') return 'info'
  if (value === 'inactive') return 'warning'
  if (value === 'suspended') return 'error'

  return 'info'
}

export function permissionList(row) {
  const explicit = Array.isArray(row?.permissions) ? row.permissions : []

  if (explicit.length) {
    return explicit
  }

  return String(row?.permission || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

export function visiblePermissions(row) {
  return permissionList(row).slice(0, MAX_VISIBLE_PERMISSIONS)
}

export function hiddenPermissionCount(row) {
  return Math.max(permissionList(row).length - MAX_VISIBLE_PERMISSIONS, 0)
}

export function hiddenPermissionLabel(row) {
  return permissionList(row)
    .slice(MAX_VISIBLE_PERMISSIONS)
    .join(', ')
}

export function usernameLabel(username) {
  const value = String(username || '').trim()

  if (!value) return '-'

  return value.startsWith('@') ? value : `@${value}`
}

export function plainValue(row, column) {
  const field = column?.field || column?.key
  const value = row?.[field]
  const normalized = String(value ?? '').trim()

  return normalized || '-'
}

export function formatDateTime(value) {
  const normalized = String(value ?? '').trim()

  if (!normalized) return '-'

  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) {
    return normalized
  }

  return date.toLocaleString()
}

export function useTableDisplay(props, t) {
  const resolvedRows = computed(() =>
    Array.isArray(props.rows) ? props.rows : props.users,
  )

  const resolvedEmptyText = computed(() =>
    props.emptyText || t('users.table.empty') || 'No rows found.',
  )

  const loadingLabel = computed(() =>
    t('users.loadingUsers') || 'Loading data',
  )

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

  const resolvedColumns = computed(() =>
    props.columns.length ? props.columns : defaultColumns.value,
  )

  const resolvedSortField = computed(() => String(props.sortField || '').trim())
  const resolvedSortOrder = computed(() => Number(props.sortOrder) || 0)

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

  return {
    resolvedRows,
    resolvedEmptyText,
    loadingLabel,
    resolvedColumns,
    resolvedSortField,
    resolvedSortOrder,
    tablePt,
  }
}
