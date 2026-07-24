import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import HealthRecordsDashboard from '@/modules/preschool/admin/pages/health/HealthRecordsDashboard.vue'

const mockFetchPreschoolDashboard = vi.fn()
const mockFetchPreschoolStudents = vi.fn()
const mockFetchHealthDashboardSummary = vi.fn()
const mockFetchStudentHealthSummary = vi.fn()
const mockFetchSeverityLevels = vi.fn()
const mockAcknowledgeHealthAlert = vi.fn()
const mockAssignHealthAlert = vi.fn()
const mockCloseHealthAlert = vi.fn()
const mockResolveHealthAlert = vi.fn()
const mockUpdateHealthAlertStatus = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolDashboard: (...args) => mockFetchPreschoolDashboard(...args),
  fetchPreschoolStudents: (...args) => mockFetchPreschoolStudents(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolHealthConfigurationApi', () => ({
  fetchSeverityLevels: (...args) => mockFetchSeverityLevels(...args),
  normalizeSeverityLevel: (level) => level,
}))

vi.mock('@/modules/preschool/services/api/preschoolHealthApi', () => ({
  acknowledgeHealthAlert: (...args) => mockAcknowledgeHealthAlert(...args),
  assignHealthAlert: (...args) => mockAssignHealthAlert(...args),
  closeHealthAlert: (...args) => mockCloseHealthAlert(...args),
  fetchHealthDashboardSummary: (...args) => mockFetchHealthDashboardSummary(...args),
  fetchStudentHealthSummary: (...args) => mockFetchStudentHealthSummary(...args),
  resolveHealthAlert: (...args) => mockResolveHealthAlert(...args),
  updateHealthAlertStatus: (...args) => mockUpdateHealthAlertStatus(...args),
}))

vi.mock('@/components/data-display/Pagination.vue', () => ({
  default: {
    props: ['modelValue', 'totalPages'],
    emits: ['update:modelValue', 'change'],
    template: `
      <div data-testid="pagination-stub">
        <span data-testid="pagination-state">{{ modelValue }} / {{ totalPages }}</span>
        <button
          type="button"
          data-testid="pagination-next"
          :disabled="modelValue >= totalPages"
          @click="$emit('update:modelValue', modelValue + 1); $emit('change', modelValue + 1)"
        >
          next
        </button>
      </div>
    `,
  },
}))

function mountPage() {
  return mountWithPlugins(HealthRecordsDashboard, {
    messages: {
      en: enPreschool,
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Button: {
          props: ['label', 'disabled'],
          emits: ['click'],
          template: '<button :disabled="disabled" @click="$emit(\'click\')">{{ label }}<slot /></button>',
        },
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()

  mockFetchPreschoolDashboard.mockResolvedValue({
    summary: {
      healthAlerts: 8,
      students: 42,
      classes: 6,
    },
  })

  mockFetchHealthDashboardSummary.mockResolvedValue({
    summary: {
      criticalIncidents: 1,
      severeAllergies: 2,
      missingEmergencyContacts: 3,
      overdueVaccinations: 4,
      newAlerts: 5,
      inProgressAlerts: 6,
      criticalAlerts: 7,
      resolvedThisWeek: 8,
    },
    items: [],
    unresolvedCriticalItems: [],
  })

  mockFetchSeverityLevels.mockResolvedValue([])
  mockFetchStudentHealthSummary.mockResolvedValue({
    counts: {
      allergies: 0,
      vaccinations: 0,
      medications: 0,
      incidents: 0,
      emergencyContacts: 0,
    },
    incidents: [],
  })

  mockFetchPreschoolStudents.mockImplementation(({ page = 1, perPage = 10, search = '' } = {}) => {
    if (search.trim()) {
      return Promise.resolve({
        items: [
          {
            id: 'student-search',
            fullName: 'Alice Student',
            publicId: 'STU-0001',
            className: 'Morning Stars',
          },
        ],
        pagination: { page, perPage, total: 1, totalPages: 1 },
      })
    }

    if (Number(page) === 2) {
      return Promise.resolve({
        items: [
          {
            id: 'student-page-2',
            fullName: 'Ben Student',
            publicId: 'STU-0002',
            className: 'Sunrise Class',
          },
        ],
        pagination: { page, perPage, total: 11, totalPages: 2 },
      })
    }

    return Promise.resolve({
      items: [
        {
          id: 'student-page-1',
          fullName: 'Alice Student',
          publicId: 'STU-0001',
          className: 'Morning Stars',
        },
        {
          id: 'student-page-1b',
          fullName: 'Amy Student',
          publicId: 'STU-0003',
          className: 'Morning Stars',
        },
      ],
      pagination: { page, perPage, total: 11, totalPages: 2 },
    })
  })
})

describe('HealthRecordsDashboard', () => {
  it('paginates the student list and reloads page 1 for search', async () => {
    const wrapper = mountPage()

    await flushPromises()

    expect(mockFetchPreschoolStudents).toHaveBeenCalledWith(expect.objectContaining({
      page: 1,
      perPage: 10,
      search: '',
      status: 'active',
    }))
    expect(wrapper.find('[data-testid="pagination-stub"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="pagination-state"]').text()).toBe('1 / 2')
    expect(wrapper.findAll('.health-dashboard-page__student-row')).toHaveLength(2)
    expect(wrapper.text()).toContain('Alice Student')

    await wrapper.find('[data-testid="pagination-next"]').trigger('click')
    await flushPromises()

    expect(mockFetchPreschoolStudents).toHaveBeenLastCalledWith(expect.objectContaining({
      page: 2,
      perPage: 10,
      search: '',
      status: 'active',
    }))
    expect(wrapper.find('[data-testid="pagination-state"]').text()).toBe('2 / 2')
    expect(wrapper.findAll('.health-dashboard-page__student-row')).toHaveLength(1)
    expect(wrapper.text()).toContain('Ben Student')

    const searchInput = wrapper.find('input[type="search"]')
    await searchInput.setValue('Alice')
    await flushPromises()

    expect(mockFetchPreschoolStudents).toHaveBeenLastCalledWith(expect.objectContaining({
      page: 1,
      perPage: 10,
      search: 'Alice',
      status: 'active',
    }))
    expect(wrapper.find('[data-testid="pagination-stub"]').exists()).toBe(false)
    expect(wrapper.findAll('.health-dashboard-page__student-row')).toHaveLength(1)
    expect(wrapper.text()).toContain('Alice Student')
  })
})
