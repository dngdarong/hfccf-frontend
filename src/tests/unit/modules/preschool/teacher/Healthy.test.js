import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import Healthy from '@/modules/preschool/teacher/pages/Healthy.vue'

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchMyPreschoolStudents: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolHealthApi', () => ({
  fetchStudentHealthSummary: vi.fn(),
}))

import { fetchMyPreschoolStudents } from '@/modules/preschool/services/preschoolApi'

describe('Preschool Teacher Health Page - Read-Only', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title and subtitle', () => {
    fetchMyPreschoolStudents.mockResolvedValue({ items: [] })

    const wrapper = mountWithPlugins(Healthy, {
      messages: {
        en: {
          preschoolHealthPage: {
            teacher: {
              studentHealthTitle: 'Student Health Information',
              studentHealthSubtitle: 'View health information for students assigned to your classes.',
              searchStudents: 'Search by student name or code...',
              student: 'Student',
              class: 'Class',
              healthRecord: 'Health Record',
              available: 'Available',
              notAdded: 'Not Added',
              noStudentsAssigned: 'No students are currently assigned to your classes.',
              noSearchResults: 'No students match your search.',
              back: 'Back',
            },
          },
          common: { no: 'No.', gender: 'Gender', dateOfBirth: 'Date of Birth', view: 'View', action: 'Action' },
        },
      },
    })

    expect(wrapper.text()).toContain('Student Health Information')
    expect(wrapper.text()).toContain('View health information for students assigned to your classes.')
  })

  it('displays no students message when list is empty', async () => {
    fetchMyPreschoolStudents.mockResolvedValue({ items: [] })

    const wrapper = mountWithPlugins(Healthy, {
      messages: {
        en: {
          preschoolHealthPage: {
            teacher: {
              studentHealthTitle: 'Student Health Information',
              studentHealthSubtitle: 'View health information for students assigned to your classes.',
              searchStudents: 'Search by student name or code...',
              student: 'Student',
              class: 'Class',
              healthRecord: 'Health Record',
              available: 'Available',
              notAdded: 'Not Added',
              noStudentsAssigned: 'No students are currently assigned to your classes.',
              noSearchResults: 'No students match your search.',
              back: 'Back',
            },
          },
          common: { no: 'No.', gender: 'Gender', dateOfBirth: 'Date of Birth', view: 'View', action: 'Action' },
        },
      },
    })

    // Wait for the component to mount and fetch data
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.text()).toContain('No students are currently assigned to your classes.')
  })

  it('displays students list when data is available', async () => {
    const mockStudents = [
      {
        id: 1,
        fullName: 'John Doe',
        studentCode: 'STU001',
        gender: 'Male',
        dateOfBirth: '2020-01-15',
        classes: [{ id: 1, name: 'Class A' }],
      },
    ]

    fetchMyPreschoolStudents.mockResolvedValue({ items: mockStudents })

    const wrapper = mountWithPlugins(Healthy, {
      messages: {
        en: {
          preschoolHealthPage: {
            teacher: {
              studentHealthTitle: 'Student Health Information',
              studentHealthSubtitle: 'View health information for students assigned to your classes.',
              searchStudents: 'Search by student name or code...',
              student: 'Student',
              class: 'Class',
              healthRecord: 'Health Record',
              available: 'Available',
              notAdded: 'Not Added',
              noStudentsAssigned: 'No students are currently assigned to your classes.',
              noSearchResults: 'No students match your search.',
              back: 'Back',
            },
          },
          common: { no: 'No.', gender: 'Gender', dateOfBirth: 'Date of Birth', view: 'View', action: 'Action' },
        },
      },
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('STU001')
  })

  it('search filters students by name', async () => {
    const mockStudents = [
      { id: 1, fullName: 'John Doe', studentCode: 'STU001', gender: 'Male', dateOfBirth: '2020-01-15', classes: [] },
      { id: 2, fullName: 'Jane Smith', studentCode: 'STU002', gender: 'Female', dateOfBirth: '2020-02-10', classes: [] },
    ]

    fetchMyPreschoolStudents.mockResolvedValue({ items: mockStudents })

    const wrapper = mountWithPlugins(Healthy, {
      messages: {
        en: {
          preschoolHealthPage: {
            teacher: {
              studentHealthTitle: 'Student Health Information',
              studentHealthSubtitle: 'View health information for students assigned to your classes.',
              searchStudents: 'Search by student name or code...',
              student: 'Student',
              class: 'Class',
              healthRecord: 'Health Record',
              available: 'Available',
              notAdded: 'Not Added',
              noStudentsAssigned: 'No students are currently assigned to your classes.',
              noSearchResults: 'No students match your search.',
              back: 'Back',
            },
          },
          common: { no: 'No.', gender: 'Gender', dateOfBirth: 'Date of Birth', view: 'View', action: 'Action' },
        },
      },
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    // Find and update the search input
    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('John')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).not.toContain('Jane Smith')
  })

  it('does not render any Create/Edit/Delete buttons', async () => {
    const mockStudents = [
      {
        id: 1,
        fullName: 'John Doe',
        studentCode: 'STU001',
        gender: 'Male',
        dateOfBirth: '2020-01-15',
        classes: [],
      },
    ]

    fetchMyPreschoolStudents.mockResolvedValue({ items: mockStudents })

    const wrapper = mountWithPlugins(Healthy, {
      messages: {
        en: {
          preschoolHealthPage: {
            teacher: {
              studentHealthTitle: 'Student Health Information',
              studentHealthSubtitle: 'View health information for students assigned to your classes.',
              searchStudents: 'Search by student name or code...',
              student: 'Student',
              class: 'Class',
              healthRecord: 'Health Record',
              available: 'Available',
              notAdded: 'Not Added',
              noStudentsAssigned: 'No students are currently assigned to your classes.',
              noSearchResults: 'No students match your search.',
              back: 'Back',
            },
          },
          common: { no: 'No.', gender: 'Gender', dateOfBirth: 'Date of Birth', view: 'View', action: 'Action' },
        },
      },
    })

    await wrapper.vm.$nextTick()

    const html = wrapper.html()
    expect(html).not.toContain('logIncident')
    expect(html).not.toContain('logCheck')
    expect(html).not.toContain('addAllergy')
    expect(html).not.toContain('addVaccination')
    expect(html).not.toContain('addMedication')
    expect(html).not.toContain('addContact')
  })

  it('displays health record availability status', async () => {
    const mockStudents = [
      {
        id: 1,
        fullName: 'John Doe',
        studentCode: 'STU001',
        gender: 'Male',
        dateOfBirth: '2020-01-15',
        classes: [],
      },
    ]

    fetchMyPreschoolStudents.mockResolvedValue({ items: mockStudents })

    const wrapper = mountWithPlugins(Healthy, {
      messages: {
        en: {
          preschoolHealthPage: {
            teacher: {
              studentHealthTitle: 'Student Health Information',
              studentHealthSubtitle: 'View health information for students assigned to your classes.',
              searchStudents: 'Search by student name or code...',
              student: 'Student',
              class: 'Class',
              healthRecord: 'Health Record',
              available: 'Available',
              notAdded: 'Not Added',
              noStudentsAssigned: 'No students are currently assigned to your classes.',
              noSearchResults: 'No students match your search.',
              back: 'Back',
            },
          },
          common: { no: 'No.', gender: 'Gender', dateOfBirth: 'Date of Birth', view: 'View', action: 'Action' },
        },
      },
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.text()).toContain('Not Added')
  })
})
