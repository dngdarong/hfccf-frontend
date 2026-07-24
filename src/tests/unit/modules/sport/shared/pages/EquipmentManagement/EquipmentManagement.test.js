import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import EquipmentManagement from '@/modules/sport/shared/pages/EquipmentManagement/EquipmentManagement.vue'
import enCommon from '@/i18n/en/common.js'
import enSport from '@/i18n/en/sport/index.js'
import khCommon from '@/i18n/kh/common.js'
import khSport from '@/i18n/kh/sport/index.js'

const routeState = reactive({ name: 'dashboard-sport-admin-equipment' })
const toastAdd = vi.fn()
const httpGet = vi.hoisted(() => vi.fn())

const {
  approveSportEquipmentRequest,
  fetchCoachTeams,
  fetchCoachEquipmentItems,
  fetchCoachEquipmentRequests,
  fetchSportEquipmentItems,
  fetchSportEquipmentRequests,
} = vi.hoisted(() => ({
  approveSportEquipmentRequest: vi.fn(),
  fetchCoachTeams: vi.fn(),
  fetchCoachEquipmentItems: vi.fn(),
  fetchCoachEquipmentRequests: vi.fn(),
  fetchSportEquipmentItems: vi.fn(),
  fetchSportEquipmentRequests: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')

  return {
    ...actual,
    useRoute: () => routeState,
  }
})

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: toastAdd }),
}))

vi.mock('@/modules/sport/services/api/sportCoachTeamsApi', () => ({
  fetchCoachTeams,
}))

vi.mock('@/services/http', () => ({
  default: { get: httpGet },
}))

vi.mock('@/modules/sport/services/sportApi', () => ({
  approveSportEquipmentRequest,
  createCoachEquipmentRequest: vi.fn(),
  createSportEquipmentItem: vi.fn(),
  fetchCoachEquipmentItems,
  fetchCoachEquipmentRequests,
  fetchSportEquipmentItems,
  fetchSportEquipmentRequests,
  issueSportEquipmentRequest: vi.fn(),
  rejectSportEquipmentRequest: vi.fn(),
  returnSportEquipmentRequest: vi.fn(),
  updateSportEquipmentItem: vi.fn(),
}))

const baseStubs = {
  MainLayout: { template: '<div><slot /></div>' },
  HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1 data-test="title">{{ title }}</h1><p>{{ subtitle }}</p></div>' },
  Button: {
    props: ['label', 'disabled', 'loading'],
    emits: ['click'],
    template: '<button type="button" :disabled="disabled || loading" @click="$emit(\'click\')">{{ label }}</button>',
  },
  StatsCards: { props: ['cards'], template: '<div data-test="stats-cards" />' },
  Pagination: { template: '<div data-test="pagination" />' },
  StatusBadge: { props: ['label'], template: '<span>{{ label }}</span>' },
  Toast: { template: '<div data-test="toast" />' },
  Card: { template: '<section><slot name="title" /><slot name="content" /><slot /></section>' },
  DataTable: { props: ['value'], template: '<div data-test="datatable"><slot /></div>' },
  Column: { template: '<div><slot /></div>' },
  Dialog: { props: ['visible'], template: '<div v-if="visible"><slot /><slot name="footer" /></div>' },
  Select: { props: ['modelValue', 'options'], emits: ['update:modelValue'], template: '<select />' },
  InputText: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input />' },
  InputNumber: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="number" />' },
  Textarea: { props: ['modelValue'], emits: ['update:modelValue'], template: '<textarea />' },
}

function mountPage(locale = 'en') {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: {
      en: { ...enCommon, ...enSport },
      kh: { ...khCommon, ...khSport },
    },
    missingWarn: false,
    fallbackWarn: false,
  })

  return mount(EquipmentManagement, {
    global: {
      plugins: [i18n, createPinia()],
      stubs: baseStubs,
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  routeState.name = 'dashboard-sport-admin-equipment'

  fetchCoachTeams.mockResolvedValue({
    items: [{ id: 'team-1', name: 'Team One', status: 'active' }],
    pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
  })

  fetchSportEquipmentItems.mockResolvedValue({
    items: [
      {
        id: 'item-1',
        equipmentCode: 'EQ-001',
        name: 'Training Cones',
        category: 'Field',
        unit: 'set',
        totalQuantity: 10,
        availableQuantity: 4,
        minimumStockLevel: 5,
        status: 'active',
        isLowStock: true,
      },
    ],
    pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    summary: { totalActiveItems: 1, availableItems: 1, lowStockItems: 1, outOfStockItems: 0 },
  })

  fetchSportEquipmentRequests.mockResolvedValue({
    items: [],
    pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 },
    summary: { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, issuedRequests: 0, returnedRequests: 0 },
  })

  fetchCoachEquipmentItems.mockResolvedValue({
    items: [
      {
        id: 'item-2',
        equipmentCode: 'EQ-002',
        name: 'Match Balls',
        category: 'Ball',
        unit: 'pc',
        totalQuantity: 6,
        availableQuantity: 6,
        minimumStockLevel: 2,
        status: 'active',
      },
    ],
    pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    summary: { totalActiveItems: 1, availableItems: 1, lowStockItems: 0, outOfStockItems: 0 },
  })

  fetchCoachEquipmentRequests.mockResolvedValue({
    items: [],
    pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 },
    summary: { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, issuedRequests: 0, returnedRequests: 0 },
  })
})

describe('EquipmentManagement page', () => {
  it('loads the admin inventory entry point and uses the equipment workflow', async () => {
    const wrapper = mountPage('en')
    await flushPromises()

    expect(fetchSportEquipmentItems).toHaveBeenCalled()
    expect(fetchSportEquipmentRequests).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Training Equipment Management')
    expect(wrapper.text()).toContain('Inventory')
    expect(wrapper.text()).toContain('Requests')
    expect(wrapper.text()).toContain('Add Equipment')
    expect(wrapper.vm.assignmentState).toBeDefined()
    expect(wrapper.vm.assignmentState.fetchAssignments).toBeTypeOf('function')

    await wrapper.findAll('button').find((button) => button.text() === 'Requests')?.trigger('click')
    await flushPromises()

    expect(fetchSportEquipmentRequests).toHaveBeenCalled()
  })

  it('loads the coach entry point and keeps admin actions hidden', async () => {
    routeState.name = 'dashboard-sport-coach-equipment'
    const wrapper = mountPage('en')
    await flushPromises()

    expect(fetchCoachTeams).toHaveBeenCalled()
    expect(fetchCoachEquipmentItems).toHaveBeenCalled()
    expect(fetchSportEquipmentItems).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Equipment Requests')
    expect(wrapper.text()).toContain('Available Equipment')
    expect(wrapper.text()).toContain('My Requests')
    expect(wrapper.text()).not.toContain('Add Equipment')
    expect(wrapper.vm.assignmentState).toBeDefined()

    await wrapper.findAll('button').find((button) => button.text() === 'My Requests')?.trigger('click')
    await flushPromises()

    expect(fetchCoachEquipmentRequests).toHaveBeenCalled()
  })

  it('loads the Admin Assignments tab and opens read-only detail', async () => {
    httpGet
      .mockResolvedValueOnce({
        data: {
          data: {
            items: [{
              id: 'assignment-1',
              assignmentCode: 'EQUIP-ASGN-1',
              equipmentName: 'Training Cones',
              equipmentCode: 'EQ-001',
              teamName: 'Team One',
              coachName: 'Coach User',
              assignedQuantity: 5,
              returnedQuantity: 2,
              damagedQuantity: 1,
              missingQuantity: 0,
              remainingQuantity: 2,
              status: 'assigned',
              assignedAt: '2026-07-18T08:00:00Z',
              notes: '',
            }],
            pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            assignment: {
              id: 'assignment-1',
              assignmentCode: 'EQUIP-ASGN-1',
              equipmentName: 'Training Cones',
              equipmentCode: 'EQ-001',
              teamName: 'Team One',
              coachName: 'Coach User',
              assignedQuantity: 5,
              returnedQuantity: 2,
              damagedQuantity: 1,
              missingQuantity: 0,
              remainingQuantity: 2,
              status: 'returned',
              assignedAt: '2026-07-18T08:00:00Z',
              returnedAt: '2026-07-19T08:00:00Z',
              notes: null,
            },
          },
        },
      })

    const wrapper = mountPage('en')
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'Assignments')?.trigger('click')
    await flushPromises()

    expect(httpGet).toHaveBeenCalledWith('/sport/admin/equipment-assignments', expect.any(Object))
    expect(wrapper.vm.assignmentState.assignments.value).toHaveLength(1)
    expect(wrapper.vm.assignmentState.assignments.value[0].remainingQuantity).toBe(2)

    await wrapper.vm.openAssignmentDetail(wrapper.vm.assignmentState.assignments.value[0])
    await flushPromises()

    expect(httpGet).toHaveBeenCalledWith('/sport/admin/equipment-assignments/assignment-1', expect.any(Object))
    expect(wrapper.text()).toContain('No notes available.')
    expect(wrapper.text()).not.toContain('Edit Assignment')
  })

  it('loads Coach My Assignments through the Coach endpoint without mutation actions', async () => {
    httpGet.mockResolvedValueOnce({
      data: { data: { items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 } } },
    })

    routeState.name = 'dashboard-sport-coach-equipment'
    const wrapper = mountPage('en')
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'My Assignments')?.trigger('click')
    await flushPromises()

    expect(httpGet).toHaveBeenCalledWith('/sport/coach/equipment/assignments', expect.any(Object))
    expect(wrapper.text()).toContain('No assignments found.')
    expect(wrapper.text()).not.toContain('Issue')
    expect(wrapper.text()).not.toContain('Return')
    expect(wrapper.text()).not.toContain('Approve')
  })

  it('renders the localized assignment load error', async () => {
    httpGet.mockRejectedValueOnce(new Error('Assignment API unavailable'))

    const wrapper = mountPage('en')
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text() === 'Assignments')?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Assignment API unavailable')
  })

  it('renders Khmer labels without raw translation keys', async () => {
    routeState.name = 'dashboard-sport-coach-equipment'
    const wrapper = mountPage('kh')
    await flushPromises()

    expect(wrapper.text()).toContain('សំណើឧបករណ៍')
    expect(wrapper.text()).toContain('ឧបករណ៍មាន')
    expect(wrapper.text()).toContain('សំណើរបស់ខ្ញុំ')
    expect(wrapper.text()).not.toContain('sportEquipment.')
  })

  it('auto-generates the equipment code when opening the create dialog', async () => {
    const wrapper = mountPage('en')
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'Add Equipment')?.trigger('click')
    await flushPromises()

    const codePreview = wrapper.get('[data-testid="equipment-code-preview"]').text()
    expect(codePreview).toContain('EQ-')
    expect(codePreview).toContain('Generated automatically')
  })

  it('initializes the approval quantity from the requested quantity and falls back to 1', async () => {
    const wrapper = mountPage('en')
    await flushPromises()

    wrapper.vm.openRequestActionDialog('approve', { id: 'request-1', requestedQuantity: 4 })
    expect(wrapper.vm.requestActionForm.approvedQuantity).toBe(4)

    wrapper.vm.closeRequestActionDialog()
    wrapper.vm.openRequestActionDialog('approve', { id: 'request-2' })
    expect(wrapper.vm.requestActionForm.approvedQuantity).toBe(1)
  })

  it('submits approval using approved_quantity and only shows success after the backend resolves', async () => {
    const wrapper = mountPage('en')
    await flushPromises()

    approveSportEquipmentRequest.mockResolvedValueOnce({
      request: {
        id: 'request-1',
        status: 'approved',
      },
    })

    wrapper.vm.openRequestActionDialog('approve', { id: 'request-1', requestedQuantity: 3 })
    wrapper.vm.requestActionForm.approvedQuantity = 2
    wrapper.vm.requestActionForm.adminNote = 'Approved'

    await wrapper.vm.saveRequestAction()
    await flushPromises()

    expect(approveSportEquipmentRequest).toHaveBeenCalledWith('request-1', {
      approved_quantity: 2,
      admin_note: 'Approved',
    })
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }))
  })

  it('surfaces approved quantity validation errors in the approve dialog', async () => {
    const wrapper = mountPage('en')
    await flushPromises()

    approveSportEquipmentRequest.mockRejectedValueOnce({
      validationErrors: {
        approved_quantity: ['Approved quantity must be greater than zero.'],
      },
    })

    wrapper.vm.openRequestActionDialog('approve', { id: 'request-1', requestedQuantity: 3 })
    wrapper.vm.requestActionForm.approvedQuantity = 0

    await wrapper.vm.saveRequestAction()
    await flushPromises()

    expect(wrapper.vm.requestActionFieldErrors.approved_quantity).toBe('Approved quantity must be greater than zero.')
    expect(wrapper.vm.requestActionDialogError).toBe('')
    expect(wrapper.text()).toContain('Approved quantity must be greater than zero.')
    expect(toastAdd).not.toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }))
  })
})
