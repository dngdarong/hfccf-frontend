import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import EnrollmentManagement from '@/modules/preschool/admin/pages/enrollment/EnrollmentManagement.vue'

const mockFetchEnrollmentSummary = vi.fn()
const mockFetchEnrollments = vi.fn()
const mockFetchEnrollment = vi.fn()
const mockCreateEnrollment = vi.fn()
const mockUpdateEnrollment = vi.fn()
const mockSubmitEnrollment = vi.fn()
const mockReviewEnrollment = vi.fn()
const mockApproveEnrollment = vi.fn()
const mockRejectEnrollment = vi.fn()
const mockWaitlistEnrollment = vi.fn()
const mockCancelEnrollment = vi.fn()
const mockEnrollStudent = vi.fn()
const mockUpdateEnrollmentDocument = vi.fn()
const mockFetchAcademicLifecycle = vi.fn()
const mockHttpGet = vi.fn()
const mockToastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: mockToastAdd,
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolEnrollmentApi', () => ({
  fetchEnrollmentSummary: (...args) => mockFetchEnrollmentSummary(...args),
  fetchEnrollments: (...args) => mockFetchEnrollments(...args),
  fetchEnrollment: (...args) => mockFetchEnrollment(...args),
  createEnrollment: (...args) => mockCreateEnrollment(...args),
  updateEnrollment: (...args) => mockUpdateEnrollment(...args),
  submitEnrollment: (...args) => mockSubmitEnrollment(...args),
  reviewEnrollment: (...args) => mockReviewEnrollment(...args),
  approveEnrollment: (...args) => mockApproveEnrollment(...args),
  rejectEnrollment: (...args) => mockRejectEnrollment(...args),
  waitlistEnrollment: (...args) => mockWaitlistEnrollment(...args),
  cancelEnrollment: (...args) => mockCancelEnrollment(...args),
  enrollStudent: (...args) => mockEnrollStudent(...args),
  updateEnrollmentDocument: (...args) => mockUpdateEnrollmentDocument(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolAcademicLifecycleApi', () => ({
  fetchAcademicLifecycle: (...args) => mockFetchAcademicLifecycle(...args),
}))

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
  },
}))

vi.mock('@/services/api', () => ({
  unwrapApiData: (response) => response?.data ?? response,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockToastAdd.mockClear()

  mockFetchEnrollmentSummary.mockResolvedValue({ total: 1, pending: 0, approved: 1, enrolled: 0, rejected: 0 })
  mockFetchEnrollments.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } })
  mockFetchEnrollment.mockResolvedValue({})
  mockCreateEnrollment.mockResolvedValue({})
  mockUpdateEnrollment.mockResolvedValue({})
  mockSubmitEnrollment.mockResolvedValue({})
  mockReviewEnrollment.mockResolvedValue({})
  mockApproveEnrollment.mockResolvedValue({})
  mockRejectEnrollment.mockResolvedValue({})
  mockWaitlistEnrollment.mockResolvedValue({})
  mockCancelEnrollment.mockResolvedValue({})
  mockEnrollStudent.mockResolvedValue({})
  mockUpdateEnrollmentDocument.mockResolvedValue({})
  mockFetchAcademicLifecycle.mockResolvedValue({ academicYears: [], terms: [] })
  mockHttpGet.mockResolvedValue({ data: [] })
})

function mountPage() {
  return mountWithPlugins(EnrollmentManagement, {
    messages: {
      en: enPreschool,
    },
    routes: [
      {
        path: '/module/preschool-admin/enrollments',
        name: 'dashboard-preschool-admin-enrollments',
        component: { template: '<div />' },
      },
      {
        path: '/module/preschool-admin/enrollments/create',
        name: 'dashboard-preschool-admin-enrollments-create',
        component: { template: '<div />' },
      },
    ],
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Toast: { template: '<div />' },
        Button: {
          inheritAttrs: false,
          emits: ['click'],
          template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
        },
        EnrollmentSummaryCards: { template: '<div />' },
        EnrollmentFilterBar: { template: '<div />' },
        EnrollmentApplicationTable: { template: '<div />' },
        EnrollmentApplicationDialog: { template: '<div />' },
        EnrollmentDecisionDialog: { template: '<div />' },
        EnrollmentReviewPanel: { template: '<div />' },
        EnrollmentGuardianSection: { template: '<div />' },
        EnrollmentDocumentChecklist: { template: '<div />' },
        EnrollmentTimeline: { template: '<div />' },
      },
    },
  })
}

describe('EnrollmentManagement', () => {
  it('navigates to the create page when New Application is clicked', async () => {
    const wrapper = mountPage()

    await flushPromises()

    await wrapper.find('button.preschool-enrollment-page__toolbar-action').trigger('click')
    await flushPromises()

    expect(wrapper.vm.$router.currentRoute.value.name).toBe('dashboard-preschool-admin-enrollments-create')
  })
})
