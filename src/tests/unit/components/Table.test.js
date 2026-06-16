import { describe, it, expect } from 'vitest'
import { mountWithPlugins } from '../../helpers/mount'
import Table from '@/components/data-display/Table.vue'
import { makeUser } from '../../helpers/factories'

// ─── i18n messages ───────────────────────────────────────────────────────────

const messages = {
  en: {
    users: {
      table: { empty: 'No rows found.' },
      loadingUsers: 'Loading data',
    },
    common: {
      table: {
        number: '#',
        user: 'User',
        email: 'Email',
        role: 'Role',
        permission: 'Permission',
        status: 'Status',
        phone: 'Phone',
        actions: 'Actions',
      },
    },
  },
}

// ─── PrimeVue stubs ───────────────────────────────────────────────────────────

/**
 * DataTable stub:
 * - Renders the #loading named slot when loading=true.
 * - Renders the #empty named slot when value is empty.
 * - Otherwise, provides rows via provide() so the Column stub can iterate them.
 *
 * The default slot (Column stubs) is rendered in the `v-else` branch, which
 * causes each Column stub to inject __tableRows and render its body slot.
 */
const DataTableStub = {
  name: 'DataTable',
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    dataKey: String,
    lazy: Boolean,
    sortField: String,
    sortOrder: Number,
    stripedRows: Boolean,
    removableSort: Boolean,
    pt: Object,
  },
  emits: ['sort'],
  provide() {
    return {
      tableRows: Array.isArray(this.value) ? this.value : [],
    }
  },
  template: `
    <div data-testid="datatable">
      <template v-if="loading">
        <div data-testid="loading-slot"><slot name="loading" /></div>
      </template>
      <template v-else-if="!value || !value.length">
        <div data-testid="empty-slot"><slot name="empty" /></div>
      </template>
      <template v-else>
        <slot />
      </template>
    </div>
  `,
}

/**
 * Column stub:
 * Injects the row array from DataTableStub and renders its #body scoped slot
 * once per row, mirroring how PrimeVue DataTable calls Column body slots.
 */
const ColumnStub = {
  name: 'Column',
  inheritAttrs: false,
  props: ['field', 'header', 'sortable', 'sortField', 'pt'],
  inject: ['tableRows'],
  template: `
    <div :data-col="field">
      <div
        v-for="(row, index) in tableRows"
        :key="index"
        data-testid="cell"
      >
        <slot name="body" :data="row" :index="index" />
      </div>
    </div>
  `,
}

// ─── shared component stubs ───────────────────────────────────────────────────

const sharedStubs = {
  DataTable: DataTableStub,
  Column: ColumnStub,
  Loading: {
    template: '<div data-testid="loading-spinner" />',
  },
  StatusBadge: {
    name: 'StatusBadge',
    props: ['status', 'label', 'size'],
    template: '<span :data-status="status" :data-label="label" />',
  },
  RolesBadge: {
    name: 'RolesBadge',
    props: ['role'],
    template: '<span :data-role="role" />',
  },
  PermissionBadge: {
    name: 'PermissionBadge',
    props: ['permission'],
    template: '<span :data-permission="permission" />',
  },
  ActionsButton: {
    name: 'ActionsButton',
    props: ['item', 'showView', 'showEdit', 'showDelete'],
    emits: ['view', 'edit', 'delete'],
    template: '<div data-testid="actions-menu" />',
  },
  Button: {
    name: 'Button',
    emits: ['click'],
    inheritAttrs: false,
    template: `<button :aria-label="$attrs['aria-label']" @click="$emit('click')" />`,
  },
}

// ─── mount helper ─────────────────────────────────────────────────────────────

function mountTable(props = {}) {
  return mountWithPlugins(Table, {
    props,
    messages,
    global: { stubs: sharedStubs },
  })
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('Table', () => {
  // ─── basic rendering ────────────────────────────────────────────────────────

  it('renders without errors', () => {
    expect(mountTable().exists()).toBe(true)
  })

  it('renders the datatable root element', () => {
    expect(mountTable().find('[data-testid="datatable"]').exists()).toBe(true)
  })

  // ─── empty state ────────────────────────────────────────────────────────────

  it('shows the empty slot when rows is an empty array', () => {
    const wrapper = mountTable({ rows: [] })
    expect(wrapper.find('[data-testid="empty-slot"]').exists()).toBe(true)
  })

  it('shows custom emptyText in the empty slot', () => {
    const wrapper = mountTable({ rows: [], emptyText: 'Nothing here yet' })
    expect(wrapper.find('[data-testid="empty-slot"]').text()).toContain('Nothing here yet')
  })

  it('falls back to i18n empty text when emptyText prop is blank', () => {
    const wrapper = mountTable({ rows: [], emptyText: '' })
    expect(wrapper.find('[data-testid="empty-slot"]').text()).toContain('No rows found.')
  })

  it('does not show the empty slot when rows has items', () => {
    const wrapper = mountTable({ rows: [makeUser()] })
    expect(wrapper.find('[data-testid="empty-slot"]').exists()).toBe(false)
  })

  // ─── loading state ───────────────────────────────────────────────────────────

  it('shows the loading slot when loading=true', () => {
    const wrapper = mountTable({ loading: true })
    expect(wrapper.find('[data-testid="loading-slot"]').exists()).toBe(true)
  })

  it('renders the Loading spinner inside the loading slot', () => {
    const wrapper = mountTable({ loading: true })
    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
  })

  it('does not show the loading slot when loading=false', () => {
    const wrapper = mountTable({ rows: [makeUser()], loading: false })
    expect(wrapper.find('[data-testid="loading-slot"]').exists()).toBe(false)
  })

  it('does not show the empty slot while loading', () => {
    const wrapper = mountTable({ rows: [], loading: true })
    expect(wrapper.find('[data-testid="empty-slot"]').exists()).toBe(false)
  })

  // ─── row resolution (rows vs users) ──────────────────────────────────────────

  it('uses rows prop when provided', () => {
    const wrapper = mountTable({ rows: [makeUser({ id: 1 }), makeUser({ id: 2 })] })
    expect(wrapper.findAll('[data-testid="cell"]').length).toBeGreaterThan(0)
  })

  it('falls back to users prop when rows is null', () => {
    const users = [makeUser({ id: 1 }), makeUser({ id: 2 })]
    const wrapper = mountTable({ users, rows: null, columns: [{ key: 'number', label: '#' }] })
    // 2 users → 2 cells in the number column
    expect(wrapper.findAll('[data-testid="cell"]')).toHaveLength(2)
  })

  it('prefers rows over users when both are provided', () => {
    const rows = [makeUser({ id: 10 })]
    const users = [makeUser({ id: 20 }), makeUser({ id: 21 })]
    const wrapper = mountTable({ rows, users, columns: [{ key: 'number', label: '#' }] })
    expect(wrapper.findAll('[data-testid="cell"]')).toHaveLength(1)
  })

  // ─── column: number ──────────────────────────────────────────────────────────

  it('renders index + 1 as the row number', () => {
    const rows = [makeUser({ id: 1 }), makeUser({ id: 2 })]
    const wrapper = mountTable({ rows, columns: [{ key: 'number', label: '#' }] })
    const cells = wrapper.findAll('[data-testid="cell"]')
    expect(cells[0].text()).toContain('1')
    expect(cells[1].text()).toContain('2')
  })

  it('uses rowNumber field when present instead of index', () => {
    const rows = [makeUser({ id: 1, rowNumber: 42 })]
    const wrapper = mountTable({ rows, columns: [{ key: 'number', label: '#' }] })
    expect(wrapper.find('[data-testid="cell"]').text()).toContain('42')
  })

  // ─── column: status ──────────────────────────────────────────────────────────

  it('renders a StatusBadge in the status column', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, status: 'active' })],
      columns: [{ key: 'status', label: 'Status' }],
    })
    expect(wrapper.find('[data-status]').exists()).toBe(true)
  })

  it('maps "active" status to success tone', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, status: 'active' })],
      columns: [{ key: 'status', label: 'Status' }],
    })
    expect(wrapper.find('[data-status]').attributes('data-status')).toBe('success')
  })

  it('maps "pending" status to info tone', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, status: 'pending' })],
      columns: [{ key: 'status', label: 'Status' }],
    })
    expect(wrapper.find('[data-status]').attributes('data-status')).toBe('info')
  })

  it('maps "inactive" status to warning tone', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, status: 'inactive' })],
      columns: [{ key: 'status', label: 'Status' }],
    })
    expect(wrapper.find('[data-status]').attributes('data-status')).toBe('warning')
  })

  it('maps "suspended" status to error tone', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, status: 'suspended' })],
      columns: [{ key: 'status', label: 'Status' }],
    })
    expect(wrapper.find('[data-status]').attributes('data-status')).toBe('error')
  })

  it('passes the raw status string as the label', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, status: 'active' })],
      columns: [{ key: 'status', label: 'Status' }],
    })
    expect(wrapper.find('[data-status]').attributes('data-label')).toBe('active')
  })

  // ─── column: role ────────────────────────────────────────────────────────────

  it('renders a RolesBadge in the role column with the correct role', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, role: 'admin-english' })],
      columns: [{ key: 'role', label: 'Role' }],
    })
    expect(wrapper.find('[data-role]').attributes('data-role')).toBe('admin-english')
  })

  // ─── column: permission ───────────────────────────────────────────────────────

  it('renders one PermissionBadge per permission (up to 3)', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, permissions: ['read', 'write', 'delete'] })],
      columns: [{ key: 'permission', label: 'Permission' }],
    })
    expect(wrapper.findAll('[data-permission]')).toHaveLength(3)
  })

  it('caps visible PermissionBadges at 3 when there are more', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, permissions: ['a', 'b', 'c', 'd', 'e'] })],
      columns: [{ key: 'permission', label: 'Permission' }],
    })
    expect(wrapper.findAll('[data-permission]')).toHaveLength(3)
  })

  it('shows an overflow badge with correct count when permissions exceed 3', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, permissions: ['a', 'b', 'c', 'd'] })],
      columns: [{ key: 'permission', label: 'Permission' }],
    })
    expect(wrapper.text()).toContain('+1 more')
  })

  it('shows a dash when the row has no permissions', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1, permissions: [] })],
      columns: [{ key: 'permission', label: 'Permission' }],
    })
    expect(wrapper.findAll('[data-permission]')).toHaveLength(0)
    expect(wrapper.text()).toContain('-')
  })

  it('parses comma-separated permission string', () => {
    const wrapper = mountTable({
      rows: [{ id: 1, permission: 'read, write' }],
      columns: [{ key: 'permission', label: 'Permission' }],
    })
    expect(wrapper.findAll('[data-permission]')).toHaveLength(2)
  })

  // ─── column: plain (default cell) ────────────────────────────────────────────

  it('renders the field value for an unrecognized column key', () => {
    const wrapper = mountTable({
      rows: [{ id: 1, phone: '+855-12-999-888' }],
      columns: [{ key: 'phone', label: 'Phone' }],
    })
    expect(wrapper.find('[data-testid="cell"]').text()).toContain('+855-12-999-888')
  })

  it('renders a dash when the field value is absent', () => {
    const wrapper = mountTable({
      rows: [{ id: 1 }],
      columns: [{ key: 'phone', label: 'Phone' }],
    })
    expect(wrapper.find('[data-testid="cell"]').text()).toContain('-')
  })

  // ─── column: created_at ───────────────────────────────────────────────────────

  it('renders a dash for created_at when the value is empty', () => {
    const wrapper = mountTable({
      rows: [{ id: 1, created_at: '' }],
      columns: [{ key: 'created_at', label: 'Created' }],
    })
    expect(wrapper.find('[data-testid="cell"]').text()).toContain('-')
  })

  // ─── actions: menu style (default) ───────────────────────────────────────────

  it('renders ActionsButton by default (actionStyle="menu")', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1 })],
      columns: [{ key: 'actions', label: 'Actions' }],
    })
    expect(wrapper.find('[data-testid="actions-menu"]').exists()).toBe(true)
  })

  it('does not render inline buttons when actionStyle="menu"', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1 })],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'menu',
    })
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  // ─── actions: buttons style ───────────────────────────────────────────────────

  it('renders inline action buttons when actionStyle="buttons"', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1 })],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'buttons',
    })
    expect(wrapper.findAll('button').length).toBeGreaterThan(0)
  })

  it('renders View, Edit, Delete buttons by default', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1 })],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'buttons',
    })
    const labels = wrapper.findAll('button').map(b => b.attributes('aria-label'))
    expect(labels).toContain('View')
    expect(labels).toContain('Edit')
    expect(labels).toContain('Delete')
  })

  it('hides the View button when showViewAction=false', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1 })],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'buttons',
      showViewAction: false,
    })
    const labels = wrapper.findAll('button').map(b => b.attributes('aria-label'))
    expect(labels).not.toContain('View')
    expect(labels).toContain('Edit')
    expect(labels).toContain('Delete')
  })

  it('hides the Edit button when showEditAction=false', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1 })],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'buttons',
      showEditAction: false,
    })
    const labels = wrapper.findAll('button').map(b => b.attributes('aria-label'))
    expect(labels).not.toContain('Edit')
  })

  it('hides the Delete button when showDeleteAction=false', () => {
    const wrapper = mountTable({
      rows: [makeUser({ id: 1 })],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'buttons',
      showDeleteAction: false,
    })
    const labels = wrapper.findAll('button').map(b => b.attributes('aria-label'))
    expect(labels).not.toContain('Delete')
  })

  // ─── events emitted by inline buttons ────────────────────────────────────────

  it('emits "view" with row data when the View button is clicked', async () => {
    const row = makeUser({ id: 1 })
    const wrapper = mountTable({
      rows: [row],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'buttons',
    })
    await wrapper.find('[aria-label="View"]').trigger('click')
    expect(wrapper.emitted('view')).toBeTruthy()
    expect(wrapper.emitted('view')[0][0]).toMatchObject({ id: 1 })
  })

  it('emits "edit" with row data when the Edit button is clicked', async () => {
    const row = makeUser({ id: 2 })
    const wrapper = mountTable({
      rows: [row],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'buttons',
    })
    await wrapper.find('[aria-label="Edit"]').trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0][0]).toMatchObject({ id: 2 })
  })

  it('emits "delete" with row data when the Delete button is clicked', async () => {
    const row = makeUser({ id: 3 })
    const wrapper = mountTable({
      rows: [row],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'buttons',
    })
    await wrapper.find('[aria-label="Delete"]').trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')[0][0]).toMatchObject({ id: 3 })
  })

  // ─── events emitted via ActionsButton (menu style) ───────────────────────────

  it('emits "view" when ActionsButton fires view', async () => {
    const row = makeUser({ id: 5 })
    const wrapper = mountTable({
      rows: [row],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'menu',
    })
    const actionsButton = wrapper.findComponent({ name: 'ActionsButton' })
    await actionsButton.vm.$emit('view', row)
    expect(wrapper.emitted('view')).toBeTruthy()
  })

  it('emits "edit" when ActionsButton fires edit', async () => {
    const row = makeUser({ id: 5 })
    const wrapper = mountTable({
      rows: [row],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'menu',
    })
    const actionsButton = wrapper.findComponent({ name: 'ActionsButton' })
    await actionsButton.vm.$emit('edit', row)
    expect(wrapper.emitted('edit')).toBeTruthy()
  })

  it('emits "delete" when ActionsButton fires delete', async () => {
    const row = makeUser({ id: 5 })
    const wrapper = mountTable({
      rows: [row],
      columns: [{ key: 'actions', label: 'Actions' }],
      actionStyle: 'menu',
    })
    const actionsButton = wrapper.findComponent({ name: 'ActionsButton' })
    await actionsButton.vm.$emit('delete', row)
    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  // ─── sorting ─────────────────────────────────────────────────────────────────

  it('emits "sort" when serverSide=true and DataTable fires sort', async () => {
    const wrapper = mountTable({ serverSide: true })
    const datatable = wrapper.findComponent({ name: 'DataTable' })
    await datatable.vm.$emit('sort', { sortField: 'name', sortOrder: 1 })
    expect(wrapper.emitted('sort')).toBeTruthy()
    expect(wrapper.emitted('sort')[0][0]).toMatchObject({ sortField: 'name', sortOrder: 1 })
  })

  it('does not emit "sort" when serverSide=false', async () => {
    const wrapper = mountTable({ serverSide: false })
    const datatable = wrapper.findComponent({ name: 'DataTable' })
    await datatable.vm.$emit('sort', { sortField: 'name' })
    expect(wrapper.emitted('sort')).toBeFalsy()
  })

  // ─── default columns ─────────────────────────────────────────────────────────

  it('renders default columns when columns prop is an empty array', () => {
    const wrapper = mountTable({ rows: [makeUser()], columns: [] })
    // Default has 8 columns: number, user, email, role, permission, status, phone, actions
    // Each renders one cell per row → 8 data-col divs visible
    const columnDivs = wrapper.findAll('[data-col]')
    expect(columnDivs.length).toBe(8)
  })

  it('renders only the provided columns when columns prop is non-empty', () => {
    const wrapper = mountTable({
      rows: [makeUser()],
      columns: [
        { key: 'number', label: '#' },
        { key: 'status', label: 'Status' },
      ],
    })
    const columnDivs = wrapper.findAll('[data-col]')
    expect(columnDivs.length).toBe(2)
  })

  // ─── public API preserved ─────────────────────────────────────────────────────

  it('accepts all documented props without warnings', () => {
    expect(() =>
      mountTable({
        users: [],
        rows: [],
        loading: false,
        emptyText: 'empty',
        columns: [],
        rowKey: 'id',
        actionStyle: 'menu',
        showViewAction: true,
        showEditAction: true,
        showDeleteAction: true,
        sortField: 'name',
        sortOrder: 1,
        serverSide: false,
      }),
    ).not.toThrow()
  })
})
