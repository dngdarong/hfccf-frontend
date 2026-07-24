import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import AddClass from '@/modules/preschool/admin/pages/classes/AddClass.vue'

const mockFetchTeachers = vi.fn()
const mockFetchClassLevels = vi.fn()
const mockFetchStudents = vi.fn()
const mockFetchClasses = vi.fn()
const mockFetchClass = vi.fn()
const mockCreateClass = vi.fn()
const mockUpdateClass = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolTeachers: (...args) => mockFetchTeachers(...args),
  fetchPreschoolClassLevels: (...args) => mockFetchClassLevels(...args),
  fetchPreschoolStudents: (...args) => mockFetchStudents(...args),
  fetchPreschoolClasses: (...args) => mockFetchClasses(...args),
  fetchPreschoolClass: (...args) => mockFetchClass(...args),
  createPreschoolClass: (...args) => mockCreateClass(...args),
  updatePreschoolClass: (...args) => mockUpdateClass(...args),
}))

function mountPage() {
  return mountWithPlugins(AddClass, {
    messages: {
      en: enPreschool,
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<div data-testid="header">{{ title }} {{ subtitle }}</div>' },
        AdminSummaryCards: { template: '<div data-testid="summary" />' },
        AdminChecklistPanel: { template: '<aside data-testid="checklist" />' },
        AlertError: { props: ['message'], template: '<div data-testid="error">{{ message }}</div>' },
        AlertSuccess: { props: ['message'], template: '<div data-testid="success">{{ message }}</div>' },
        MultiSelect: {
          name: 'MultiSelect',
          props: ['modelValue', 'options', 'placeholder', 'loading', 'disabled'],
          template: '<div data-testid="student-multiselect" />',
        },
      },
    },
  })
}

beforeEach(() => {
  mockFetchTeachers.mockReset()
  mockFetchClassLevels.mockReset()
  mockFetchStudents.mockReset()
  mockFetchClasses.mockReset()
  mockFetchClass.mockReset()
  mockCreateClass.mockReset()
  mockUpdateClass.mockReset()

  mockFetchTeachers.mockResolvedValue({
    items: [
      {
        id: 'teacher-1',
        fullName: 'Teacher Alpha',
      },
    ],
  })

  mockFetchClassLevels.mockResolvedValue({
    items: [
      { id: 1, nameEn: 'Nursery', nameKh: 'មត្តេយ្យកម្រិតតូច', code: 'NUR', sortOrder: 1, isActive: true },
      { id: 2, nameEn: 'Kindergarten A', nameKh: 'មត្តេយ្យ A', code: 'KGA', sortOrder: 2, isActive: true },
      { id: 3, nameEn: 'Kindergarten B', nameKh: 'មត្តេយ្យ B', code: 'KGB', sortOrder: 3, isActive: true },
      { id: 4, nameEn: 'Prep', nameKh: 'ត្រៀមចូលរៀន', code: 'PRE', sortOrder: 4, isActive: true },
    ],
  })

  mockFetchStudents.mockResolvedValue({
    items: [
      {
        id: 101,
        fullName: 'រ៉ា សុភក្ត្រា',
        publicId: 'STU-HFCCF-0005',
        avatarUrl: '',
        status: 'active',
      },
      {
        id: 202,
        fullName: 'លី មុន្នី',
        publicId: 'STU-HFCCF-0009',
        avatarUrl: '',
        status: 'active',
      },
    ],
  })

  mockFetchClasses.mockImplementation(({ classLevelId } = {}) => {
    if (String(classLevelId) === '2') {
      return Promise.resolve({
        items: [
          { code: 'PS-KGA-001' },
          { code: 'PS-KGA-002' },
        ],
      })
    }

    return Promise.resolve({
      items: [
        { code: 'PS-CLS-001' },
        { code: 'PS-CLS-002' },
      ],
    })
  })

  mockFetchClass.mockResolvedValue(null)
  mockCreateClass.mockResolvedValue({ id: 'class-1' })
  mockUpdateClass.mockResolvedValue({ id: 'class-1' })
})

describe('AddClass', () => {
  it('renders generated code, student multiselect, and schedule controls', async () => {
    const wrapper = mountPage()

    await flushPromises()

    expect(mockFetchTeachers).toHaveBeenCalled()
    expect(mockFetchClassLevels).toHaveBeenCalled()
    expect(mockFetchStudents).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'active',
        perPage: 100,
      }),
    )
    expect(mockFetchClasses).toHaveBeenCalledWith(
      expect.objectContaining({
        classLevelId: '',
      }),
    )
    expect(wrapper.text()).toContain('PS-CLS-003')
    expect(wrapper.text()).toContain('Create Class')
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Selected: 0 students')
    expect(wrapper.text()).toContain('Select days and times to preview the schedule.')

    expect(wrapper.find('[data-testid="add-class-level-select"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-class-schedule-input"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="add-class-code-preview"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="student-multiselect"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-class-schedule-day-monday"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-class-schedule-day-friday"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-class-schedule-start-time"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-class-schedule-end-time"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-class-schedule-preview"]').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(false)
  })

  it('updates the selected student count, schedule preview, and submits student ids', async () => {
    const wrapper = mountPage()
    const fields = wrapper.findComponent({ name: 'AddClassFormFields' })

    await flushPromises()

    fields.vm.$emit('update:name', 'Morning Nursery Blue')
    fields.vm.$emit('update:teacher', 'teacher-1')
    fields.vm.$emit('update:selectedStudentIds', [101, 202])
    fields.vm.$emit('update:room', 'A1')
    fields.vm.$emit('update:notes', 'Optional note')
    fields.vm.$emit('update:status', 'active')

    await wrapper.find('[data-testid="add-class-schedule-day-monday"]').setChecked()
    await wrapper.find('[data-testid="add-class-schedule-day-tuesday"]').setChecked()
    await wrapper.find('[data-testid="add-class-schedule-day-wednesday"]').setChecked()
    await wrapper.find('[data-testid="add-class-schedule-day-thursday"]').setChecked()
    await wrapper.find('[data-testid="add-class-schedule-day-friday"]').setChecked()
    await wrapper.find('[data-testid="add-class-schedule-start-time"]').setValue('08:00')
    await wrapper.find('[data-testid="add-class-schedule-end-time"]').setValue('11:00')
    await wrapper.find('[data-testid="add-class-level-select"]').setValue('2')
    await flushPromises()

    expect(wrapper.text()).toContain('PS-KGA-003')
    expect(wrapper.text()).toContain('Selected: 2 students')
    expect(wrapper.find('[data-testid="add-class-schedule-preview"]').text()).toContain('Monday, Tuesday, Wednesday, Thursday, Friday')
    expect(wrapper.find('[data-testid="add-class-schedule-preview"]').text()).toContain('08:00–11:00')

    expect(mockFetchClasses).toHaveBeenCalledWith(
      expect.objectContaining({
        classLevelId: '2',
      }),
    )

    await wrapper.find('form').trigger('submit.prevent')

    expect(mockCreateClass).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'PS-KGA-003',
        name: 'Morning Nursery Blue',
        teacher_user_id: 'teacher-1',
        class_level_id: '2',
        level: 'Kindergarten A',
        schedule: 'Monday, Tuesday, Wednesday, Thursday, Friday, 08:00–11:00',
        students_count: 2,
        student_ids: [101, 202],
        status: 'active',
        room: 'A1',
        notes: 'Optional note',
      }),
    )
  })

  it('falls back to the CLS prefix for numeric levels and keeps a 3-digit sequence', async () => {
    const wrapper = mountPage()

    await flushPromises()

    await wrapper.find('[data-testid="add-class-level-select"]').setValue('')
    await flushPromises()

    expect(wrapper.text()).toContain('PS-CLS-003')
    expect(mockFetchClasses).toHaveBeenCalledWith(
      expect.objectContaining({
        classLevelId: '',
      }),
    )
  })

  it('shows structured schedule validation errors', async () => {
    const wrapper = mountPage()
    const fields = wrapper.findComponent({ name: 'AddClassFormFields' })

    await flushPromises()

    fields.vm.$emit('update:name', 'Morning Nursery Blue')
    fields.vm.$emit('update:teacher', 'teacher-1')
    fields.vm.$emit('update:classLevelId', '2')
    fields.vm.$emit('update:status', 'active')
    await wrapper.find('[data-testid="add-class-schedule-start-time"]').setValue('08:00')
    await wrapper.find('[data-testid="add-class-schedule-end-time"]').setValue('11:00')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Select at least one day.')
    expect(mockCreateClass).not.toHaveBeenCalled()
  })

  it('shows an end time validation error when the range is invalid', async () => {
    const wrapper = mountPage()
    const fields = wrapper.findComponent({ name: 'AddClassFormFields' })

    await flushPromises()

    fields.vm.$emit('update:name', 'Morning Nursery Blue')
    fields.vm.$emit('update:teacher', 'teacher-1')
    fields.vm.$emit('update:classLevelId', '2')
    fields.vm.$emit('update:status', 'active')
    await wrapper.find('[data-testid="add-class-schedule-day-monday"]').setChecked()
    await wrapper.find('[data-testid="add-class-schedule-start-time"]').setValue('11:00')
    await wrapper.find('[data-testid="add-class-schedule-end-time"]').setValue('08:00')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('End time must be after start time.')
    expect(mockCreateClass).not.toHaveBeenCalled()
  })

  it('keeps a raw unparseable schedule in edit mode and preserves it on submit', async () => {
    mockFetchClass.mockResolvedValueOnce({
      id: 'class-1',
      code: 'PS-KIN-02',
      name: 'Kindergarten A',
      teacherUserId: 'teacher-1',
      teacherDisplayName: 'Teacher Alpha',
      classLevelId: 2,
      classLevel: { id: 2, nameEn: 'Kindergarten A', code: 'KGA' },
      level: 'Kindergarten A',
      schedule: 'Mon-Fri, 8:00 AM',
      studentsCount: 5,
      studentAssignments: [],
      activeStudentAssignments: [],
      status: 'active',
      room: 'Room 1',
      notes: '',
    })

    const wrapper = mountPage()

    await wrapper.vm.$router.push({ query: { mode: 'edit', id: 'class-1' } })
    await flushPromises()

    expect(wrapper.text()).toContain('Mon-Fri, 8:00 AM')
    expect(wrapper.text()).toContain('Unable to parse existing schedule.')
    expect(wrapper.text()).toContain('Custom schedule preserved.')

    await wrapper.find('form').trigger('submit.prevent')

    expect(mockUpdateClass).toHaveBeenCalledWith(
      'class-1',
      expect.objectContaining({
        schedule: 'Mon-Fri, 8:00 AM',
        students_count: 5,
      }),
    )

    expect(mockUpdateClass.mock.calls[0][1]).not.toHaveProperty('student_ids')
  })

  it('exposes the localized student selector copy in both languages', () => {
    expect(enPreschool.preschoolAddClass.selectStudents).toBe('Select students')
    expect(enPreschool.preschoolAddClass.noStudentsFound).toBe('No students found')
    expect(enPreschool.preschoolAddClass.loadingStudents).toBe('Loading students...')
    expect(enPreschool.preschoolAddClass.selectedStudentsCount).toBe('Selected: {count} students')
    expect(enPreschool.preschoolAddClass.studentAssignment).toBe('Student assignment')
    expect(enPreschool.preschoolAddClass.selectedStudents).toBe('Selected students')
    expect(enPreschool.preschoolAddClass.schedulePreview).toBe('Schedule preview')
    expect(enPreschool.preschoolAddClass.schedulePreviewEmpty).toBe('Select days and times to preview the schedule.')
    expect(enPreschool.preschoolAddClass.unableToParseExistingSchedule).toBe('Unable to parse existing schedule.')
    expect(enPreschool.preschoolAddClass.customSchedulePreserved).toBe('Custom schedule preserved.')
    expect(enPreschool.preschoolAddClass.days).toBe('Days')
    expect(enPreschool.preschoolAddClass.time).toBe('Time')
    expect(enPreschool.preschoolAddClass.weekdays.monday).toBe('Monday')
    expect(enPreschool.preschoolAddClass.weekdays.friday).toBe('Friday')

    expect(khPreschool.preschoolAddClass.selectStudents).toBe('ជ្រើសរើសសិស្ស')
    expect(khPreschool.preschoolAddClass.noStudentsFound).toBe('រកមិនឃើញសិស្ស')
    expect(khPreschool.preschoolAddClass.loadingStudents).toBe('កំពុងផ្ទុកសិស្ស...')
    expect(khPreschool.preschoolAddClass.selectedStudentsCount).toBe('បានជ្រើស: {count} នាក់')
    expect(khPreschool.preschoolAddClass.studentAssignment).toBe('ការចាត់តាំងសិស្ស')
    expect(khPreschool.preschoolAddClass.selectedStudents).toBe('សិស្សដែលបានជ្រើស')
    expect(khPreschool.preschoolAddClass.schedulePreview).toBe('មើលកាលវិភាគ')
    expect(khPreschool.preschoolAddClass.schedulePreviewEmpty).toBe('ជ្រើសរើសថ្ងៃ និងម៉ោង ដើម្បីមើលកាលវិភាគ។')
    expect(khPreschool.preschoolAddClass.unableToParseExistingSchedule).toBe('មិនអាចបំបែកកាលវិភាគដែលមានស្រាប់បានទេ។')
    expect(khPreschool.preschoolAddClass.customSchedulePreserved).toBe('បានរក្សាកាលវិភាគផ្ទាល់ខ្លួន។')
    expect(khPreschool.preschoolAddClass.days).toBe('ថ្ងៃ')
    expect(khPreschool.preschoolAddClass.time).toBe('ម៉ោង')
    expect(khPreschool.preschoolAddClass.weekdays.monday).toBe('ថ្ងៃចន្ទ')
    expect(khPreschool.preschoolAddClass.weekdays.friday).toBe('ថ្ងៃសុក្រ')
  })
})
