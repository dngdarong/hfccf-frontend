import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import HealthRecordsPage from '@/modules/preschool/admin/pages/health/HealthRecordsPage.vue'

const mockFetchPreschoolStudents = vi.fn()
const mockFetchStudentMedicalProfile = vi.fn()
const mockDeleteStudentMedicalProfile = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolStudents: (...args) => mockFetchPreschoolStudents(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolHealthApi', () => ({
  fetchStudentMedicalProfile: (...args) => mockFetchStudentMedicalProfile(...args),
  deleteStudentMedicalProfile: (...args) => mockDeleteStudentMedicalProfile(...args),
}))

vi.mock('@/components/data-display/Pagination.vue', () => ({
  default: {
    props: ['modelValue', 'totalPages'],
    emits: ['update:modelValue'],
    template: '<div data-testid="pagination-stub"></div>',
  },
}))

function mountPage() {
  return mountWithPlugins(HealthRecordsPage, {
    messages: {
      en: enPreschool,
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header></header>',
        },
        Button: true,
        HealthRecordForm: true,
        HealthRecordDetail: true,
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchPreschoolStudents.mockResolvedValue({
    items: [
      {
        id: '1',
        fullName: 'Alice Student',
        publicId: 'S-001',
        gender: 'Female',
        dateOfBirth: '2019-04-02',
        classes: [{ code: 'KG1', name: 'Kindergarten 1' }],
        hasHealthProfile: true,
        avatarUrl: null,
      },
    ],
    pagination: {
      page: 1,
      perPage: 10,
      total: 1,
      totalPages: 1,
    },
  })

  mockFetchStudentMedicalProfile.mockResolvedValue({
    medicalProfile: {
      id: '1',
      blood_type: 'O+',
      medical_conditions: 'None',
      medical_notes: 'Healthy',
    },
  })
})

describe('HealthRecordsPage - Delete Functionality', () => {
  it('loads students on mount', async () => {
    const _wrapper = mountPage()
    await flushPromises()

    expect(mockFetchPreschoolStudents).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        perPage: 10,
        status: 'active',
      })
    )
  })

  it('calls deleteStudentMedicalProfile when delete is confirmed', async () => {
    mockDeleteStudentMedicalProfile.mockResolvedValue(true)

    const wrapper = mountPage()
    await flushPromises()

    // Simulate calling handleDeleteConfirm directly
    wrapper.vm.selectedStudent = { id: '1', fullName: 'Alice Student' }
    wrapper.vm.confirmDeleteDialogOpen = true
    await flushPromises()

    // Call the delete handler
    await wrapper.vm.handleDeleteConfirm()
    await flushPromises()

    expect(mockDeleteStudentMedicalProfile).toHaveBeenCalledWith('1')
  })

  it('closes detail dialog after deletion', async () => {
    mockDeleteStudentMedicalProfile.mockResolvedValue(true)

    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.selectedStudent = { id: '1', fullName: 'Alice Student' }
    wrapper.vm.detailDialogOpen = true
    wrapper.vm.confirmDeleteDialogOpen = true
    await flushPromises()

    await wrapper.vm.handleDeleteConfirm()
    await flushPromises()

    expect(wrapper.vm.detailDialogOpen).toBe(false)
  })

  it('reloads students after deletion', async () => {
    mockDeleteStudentMedicalProfile.mockResolvedValue(true)

    const wrapper = mountPage()
    await flushPromises()

    const initialCallCount = mockFetchPreschoolStudents.mock.calls.length

    wrapper.vm.selectedStudent = { id: '1', fullName: 'Alice Student' }
    wrapper.vm.confirmDeleteDialogOpen = true
    await flushPromises()

    await wrapper.vm.handleDeleteConfirm()
    await flushPromises()

    // Should reload students
    expect(mockFetchPreschoolStudents.mock.calls.length).toBeGreaterThan(initialCallCount)
  })

  it('closes confirmation dialog after deletion', async () => {
    mockDeleteStudentMedicalProfile.mockResolvedValue(true)

    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.selectedStudent = { id: '1', fullName: 'Alice Student' }
    wrapper.vm.confirmDeleteDialogOpen = true
    await flushPromises()

    await wrapper.vm.handleDeleteConfirm()
    await flushPromises()

    expect(wrapper.vm.confirmDeleteDialogOpen).toBe(false)
  })

  it('opens delete dialog when openDeleteDialog is called', async () => {
    const wrapper = mountPage()
    await flushPromises()

    const student = { id: '1', fullName: 'Alice Student' }
    wrapper.vm.openDeleteDialog(student)
    await flushPromises()

    expect(wrapper.vm.selectedStudent).toEqual(student)
    expect(wrapper.vm.confirmDeleteDialogOpen).toBe(true)
  })
})
