import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolDashboard from '@/modules/preschool/admin/pages/dashboard/PreschoolDashboard.vue'
import ClassesManagement from '@/modules/preschool/admin/pages/classes/ClassesManagement.vue'
import StudentInfo from '@/modules/preschool/admin/pages/students/StudentInfo.vue'
import AddClass from '@/modules/preschool/admin/pages/classes/AddClass.vue'
import AttendanceHistory from '@/modules/preschool/admin/pages/attendance/AttendanceHistory.vue'

// Keep the stable Preschool pages mount-tested so real backend data, locale
// wiring, and runtime safety regressions get caught before the UI ships.
const mockDashboard = vi.fn(() =>
  Promise.resolve({
    summary: {
      students: 20,
      classes: 4,
      teachers: 3,
      attendanceToday: 18,
      pendingPayments: 2,
      overduePayments: 1,
    },
    recentAttendance: [
      {
        studentName: 'Alice Student',
        className: 'Morning Nursery',
        attendanceDate: '2026-05-19',
        status: 'present',
      },
    ],
    upcomingClasses: [
      {
        name: 'Morning Nursery',
        teacherDisplayName: 'Teacher A',
        studentsCount: 12,
      },
    ],
    paymentSummary: {
      paid: 15,
      pending: 2,
      overdue: 1,
      cancelled: 0,
    },
  }),
)

const mockClasses = vi.fn(() =>
  Promise.resolve({
    items: [
      {
        id: 1,
        code: 'PS-01',
        name: 'Morning Nursery',
        teacherDisplayName: 'Teacher A',
        level: 'Nursery',
        schedule: 'Mon-Fri',
        studentsCount: 12,
        status: 'active',
      },
    ],
    pagination: {
      page: 1,
      perPage: 5,
      total: 1,
      totalPages: 1,
    },
  }),
)

const mockTeachers = vi.fn(() =>
  Promise.resolve({
    items: [
      {
        id: 10,
        name: 'Teacher A',
        email: 'teacher@example.com',
        status: 'active',
      },
    ],
    pagination: {
      page: 1,
      perPage: 5,
      total: 1,
      totalPages: 1,
    },
  }),
)

const mockStudents = vi.fn(() =>
  Promise.resolve({
    items: [
      {
        id: 1,
        studentCode: 'S-001',
        firstName: 'Alice',
        lastName: 'Student',
        fullName: 'Alice Student',
        gender: 'female',
        status: 'active',
        classesCount: 1,
        guardianPhone: '012345678',
      },
    ],
    pagination: {
      page: 1,
      perPage: 5,
      total: 1,
      totalPages: 1,
    },
  }),
)

const mockAttendance = vi.fn(() =>
  Promise.resolve({
    items: [
      {
        id: 1,
        studentName: 'Alice Student',
        className: 'Morning Nursery',
        attendanceDate: '2026-05-19',
        status: 'present',
        note: 'On time',
      },
    ],
    pagination: {
      page: 1,
      perPage: 10,
      total: 1,
      totalPages: 1,
    },
  }),
)

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolDashboard: (...args) => mockDashboard(...args),
  fetchPreschoolClasses: (...args) => mockClasses(...args),
  fetchPreschoolTeachers: (...args) => mockTeachers(...args),
  fetchPreschoolStudents: (...args) => mockStudents(...args),
  fetchPreschoolAttendance: (...args) => mockAttendance(...args),
  fetchPreschoolClass: vi.fn(() => Promise.resolve(null)),
  createPreschoolClass: vi.fn(() => Promise.resolve({})),
  updatePreschoolClass: vi.fn(() => Promise.resolve({})),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function baseStubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    SearchFilterBar: { template: '<div class="search-filter-stub" />' },
    Pagination: { template: '<div class="pagination-stub" />' },
    AlertQuestion: { template: '<div class="alert-question-stub" />' },
    AlertSuccess: { template: '<div class="alert-success-stub" />' },
    AlertError: { template: '<div class="alert-error-stub" />' },
    Table: { props: ['rows'], template: '<div class="table-stub">{{ rows?.[0]?.studentName || rows?.[0]?.name }}</div>' },
    ClassTable: { props: ['classes'], template: '<div class="class-table-stub">{{ classes?.[0]?.name }}</div>' },
    Select: {
      props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'placeholder', 'loading', 'disabled'],
      template: '<div class="select-stub" />',
    },
    PreschoolDashboardSummary: { props: ['cards'], template: '<div class="summary-stub">{{ cards?.[0]?.title }}</div>' },
    PreschoolDashboardSpotlight: { props: ['title', 'text'], template: '<div class="spotlight-stub">{{ title }} {{ text }}</div>' },
    PreschoolDashboardActionList: { props: ['title', 'items'], template: '<div class="actions-stub">{{ title }} {{ items?.length }}</div>' },
    PreschoolDashboardActivity: { props: ['items'], template: '<div class="activity-stub">{{ items?.[0]?.text }}</div>' },
    PreschoolClassesSummaryGrid: { props: ['cards'], template: '<div class="summary-grid-stub">{{ cards?.[0]?.title }}</div>' },
    PreschoolClassesToolbar: { props: ['title'], template: '<div class="toolbar-stub">{{ title }}</div>' },
    PreschoolClassesHighlights: { props: ['items'], template: '<div class="highlights-stub">{{ items?.[0]?.label }}</div>' },
    AdminSummaryCards: { props: ['cards'], template: '<div class="admin-summary-stub">{{ cards?.map((card) => card.statusLabel).join(" ") }}</div>' },
    AdminChecklistPanel: { props: ['items'], template: '<div class="admin-checklist-stub">{{ items?.[0]?.title }}</div>' },
    Form: { template: '<form><slot /></form>' },
    AddClassIntro: { props: ['title', 'text'], template: '<div class="add-class-intro-stub">{{ title }} {{ text }}</div>' },
    AddClassFormFields: { template: '<div class="add-class-fields-stub" />' },
    AddClassFormActions: { props: ['isEditMode'], template: '<div class="add-class-actions-stub">{{ isEditMode }}</div>' },
    Button: { template: '<button><slot /></button>' },
    MultiSelect: { template: '<div />' },
    Dialog: { template: '<div><slot /></div>' },
  }
}

describe('Preschool real pages', () => {
  it('mounts the admin dashboard and preserves the timeline separator', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(PreschoolDashboard, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: baseStubs(),
      },
    })

    await flushPromises()

    expect(mockDashboard).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Preschool Operations Board')
    expect(wrapper.text()).toContain('Morning Nursery')
    expect(wrapper.text()).toContain('•')
    const mojibakeBullet = String.fromCharCode(0x00e2, 0x20ac, 0x00a2)
    // Regression protection: the dashboard note separator must stay a real bullet,
    // not the legacy mojibake sequence that breaks the Khmer locale scan.
    expect(wrapper.text()).not.toContain(mojibakeBullet)
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('mounts the class and student admin pages without runtime warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const classWrapper = mountWithPlugins(ClassesManagement, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: baseStubs(),
      },
    })

    const studentWrapper = mountWithPlugins(StudentInfo, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: baseStubs(),
      },
    })

    await flushPromises()

    expect(mockClasses).toHaveBeenCalled()
    expect(mockStudents).toHaveBeenCalled()
    expect(classWrapper.text()).toContain('Preschool Classes')
    expect(classWrapper.text()).toContain('Morning Nursery')
    expect(studentWrapper.text()).toContain('Student Information')
    expect(studentWrapper.text()).toContain('Add Student')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('mounts the add class page with localized summary labels', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(AddClass, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: baseStubs(),
      },
    })

    await flushPromises()

    expect(mockTeachers).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Add Class')
    expect(wrapper.text()).toContain('Info')
    expect(wrapper.text()).toContain('Warning')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('mounts the attendance history page as student-only records', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(AttendanceHistory, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: baseStubs(),
      },
    })

    await flushPromises()

    expect(mockAttendance).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Attendance History')
    expect(wrapper.text()).toContain('Alice Student')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })
})





