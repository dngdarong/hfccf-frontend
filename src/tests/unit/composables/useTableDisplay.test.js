import { describe, expect, it } from 'vitest'
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
} from '@/components/data-display/composables/useTableDisplay'

const t = (key) => {
  const messages = {
    'users.table.empty': 'No rows found.',
    'users.loadingUsers': 'Loading data',
    'common.table.number': '#',
    'common.table.user': 'User',
    'common.table.email': 'Email',
    'common.table.role': 'Role',
    'common.table.permission': 'Permission',
    'common.table.status': 'Status',
    'common.table.phone': 'Phone',
    'common.table.actions': 'Actions',
  }

  return messages[key] || key
}

describe('useTableDisplay', () => {
  it('resolves rows, columns, labels, and table state consistently', () => {
    const { resolvedRows, resolvedEmptyText, loadingLabel, resolvedColumns, resolvedSortField, resolvedSortOrder } =
      useTableDisplay(
        {
          users: [{ id: 1 }],
          rows: null,
          emptyText: '',
          columns: [],
          actionStyle: 'buttons',
          sortField: 'name',
          sortOrder: 1,
        },
        t,
      )

    expect(resolvedRows.value).toEqual([{ id: 1 }])
    expect(resolvedEmptyText.value).toBe('No rows found.')
    expect(loadingLabel.value).toBe('Loading data')
    expect(resolvedColumns.value).toHaveLength(8)
    expect(resolvedColumns.value[0]).toMatchObject({ key: 'number', label: '#', align: 'left' })
    expect(resolvedColumns.value[7]).toMatchObject({ key: 'actions', label: 'Actions', align: 'right' })
    expect(resolvedSortField.value).toBe('name')
    expect(resolvedSortOrder.value).toBe(1)
  })

  it('normalizes helper values for table cells', () => {
    expect(statusType({ status: 'active' })).toBe('success')
    expect(statusType({ status: 'pending' })).toBe('info')
    expect(statusType({ status: 'inactive' })).toBe('warning')
    expect(statusType({ status: 'suspended' })).toBe('error')
    expect(statusType({ status: 'unknown' })).toBe('info')

    expect(permissionList({ permissions: ['a', 'b'] })).toEqual(['a', 'b'])
    expect(permissionList({ permission: 'read, write' })).toEqual(['read', 'write'])
    expect(visiblePermissions({ permission: 'a,b,c,d' })).toEqual(['a', 'b', 'c'])
    expect(hiddenPermissionCount({ permission: 'a,b,c,d' })).toBe(1)
    expect(hiddenPermissionLabel({ permission: 'a,b,c,d' })).toBe('d')

    expect(usernameLabel('john')).toBe('@john')
    expect(usernameLabel('@john')).toBe('@john')
    expect(usernameLabel('')).toBe('-')

    expect(plainValue({ phone: '123' }, { key: 'phone' })).toBe('123')
    expect(plainValue({ phone: '' }, { key: 'phone' })).toBe('-')
    expect(formatDateTime('')).toBe('-')
  })
})
