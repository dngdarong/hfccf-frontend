import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import GuardianCommunicationDashboard from '@/modules/preschool/admin/pages/guardian/GuardianCommunicationDashboard.vue'
import { buildGuardianContactLogMessage } from '@/modules/preschool/admin/pages/guardian/contactLogUtils'

const mockFetchPreschoolStudents = vi.fn()
const mockFetchGuardianCommunications = vi.fn()
const mockCreateStudentGuardianCommunication = vi.fn()
const mockMarkGuardianCommunicationSent = vi.fn()
const mockAcknowledgeGuardianCommunication = vi.fn()
const mockCancelGuardianCommunication = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolStudents: (...args) => mockFetchPreschoolStudents(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolGuardianCommunicationApi', () => ({
  fetchGuardianCommunications: (...args) => mockFetchGuardianCommunications(...args),
  createStudentGuardianCommunication: (...args) => mockCreateStudentGuardianCommunication(...args),
  markGuardianCommunicationSent: (...args) => mockMarkGuardianCommunicationSent(...args),
  acknowledgeGuardianCommunication: (...args) => mockAcknowledgeGuardianCommunication(...args),
  cancelGuardianCommunication: (...args) => mockCancelGuardianCommunication(...args),
}))

vi.mock('@/store/userStore', () => ({
  useUserStore: () => ({
    currentUser: {
      fullName: 'Ms. Dara',
      name: 'Ms. Dara',
      email: 'dara@example.com',
    },
  }),
}))

function createRoute() {
  return {
    path: '/module/preschool-admin/guardians/communications',
    name: 'dashboard-preschool-admin-guardian-communications',
    component: { template: '<div />' },
  }
}

function toInputDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function makeCommunication({
  id,
  studentId,
  studentName,
  guardianId,
  guardianName,
  channel,
  subject,
  summary,
  outcome,
  followUpRequired,
  followUpDate,
  status,
  createdAt,
  sourceEvent,
}) {
  return {
    id,
    studentId,
    studentName,
    guardianId,
    guardianName,
    channel,
    subject,
    status,
    followUpDate,
    createdAt,
    message: buildGuardianContactLogMessage({
      student: `${studentName} — STU-HFCCF-000${studentId.slice(-1)}`,
      guardian: guardianName,
      method: channel === 'phone-call' ? 'Phone Call' : channel === 'telegram' ? 'Telegram' : channel === 'sms' ? 'SMS' : channel,
      reason: subject,
      summary,
      outcome,
      followUpRequired,
      followUpDate,
      priority: 'medium',
      sourceEvent,
    }, {}, 'Ms. Dara'),
  }
}

function mockResolvedData() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(today.getDate() - 2)

  mockFetchPreschoolStudents.mockResolvedValue({
    items: [
      {
        id: 'student-1',
        fullName: 'Alice Student',
        publicId: 'STU-HFCCF-0005',
        guardians: [
          {
            id: 'guardian-1',
            fullName: 'Sokha Guardian',
            phone: '012345678',
          },
        ],
      },
      {
        id: 'student-2',
        fullName: 'Bopha Student',
        publicId: 'STU-HFCCF-0006',
        guardians: [
          {
            id: 'guardian-2',
            fullName: 'Dara Guardian',
            phone: '098765432',
          },
        ],
      },
    ],
  })

  mockFetchGuardianCommunications.mockResolvedValue({
    items: [
      makeCommunication({
        id: 'contact-1',
        studentId: 'student-1',
        studentName: 'Alice Student',
        guardianId: 'guardian-1',
        guardianName: 'Sokha Guardian',
        channel: 'phone-call',
        subject: 'attendance',
        summary: 'Pickup plan confirmed for tomorrow.',
        outcome: 'guardian-acknowledged',
        followUpRequired: true,
        followUpDate: toInputDate(today),
        status: 'queued',
        createdAt: today.toISOString(),
        sourceEvent: 'Attendance alert',
      }),
      makeCommunication({
        id: 'contact-2',
        studentId: 'student-2',
        studentName: 'Bopha Student',
        guardianId: 'guardian-2',
        guardianName: 'Dara Guardian',
        channel: 'telegram',
        subject: 'health',
        summary: 'Guardian asked about fever treatment.',
        outcome: 'guardian-requested-follow-up',
        followUpRequired: true,
        followUpDate: toInputDate(yesterday),
        status: 'queued',
        createdAt: yesterday.toISOString(),
        sourceEvent: 'Health alert',
      }),
      makeCommunication({
        id: 'contact-3',
        studentId: 'student-1',
        studentName: 'Alice Student',
        guardianId: 'guardian-1',
        guardianName: 'Sokha Guardian',
        channel: 'sms',
        subject: 'payment',
        summary: 'Payment receipt shared for the monthly fee.',
        outcome: 'issue-resolved',
        followUpRequired: true,
        followUpDate: toInputDate(tomorrow),
        status: 'queued',
        createdAt: tomorrow.toISOString(),
        sourceEvent: 'Payment reminder',
      }),
      makeCommunication({
        id: 'contact-4',
        studentId: 'student-2',
        studentName: 'Bopha Student',
        guardianId: 'guardian-2',
        guardianName: 'Dara Guardian',
        channel: 'face-to-face',
        subject: 'enrollment',
        summary: 'Enrollment documents reviewed at pickup time.',
        outcome: 'guardian-acknowledged',
        followUpRequired: false,
        followUpDate: '',
        status: 'sent',
        createdAt: twoDaysAgo.toISOString(),
        sourceEvent: 'Enrollment note',
      }),
    ],
  })

  mockCreateStudentGuardianCommunication.mockResolvedValue({ id: 'contact-1' })
  mockMarkGuardianCommunicationSent.mockResolvedValue({})
  mockAcknowledgeGuardianCommunication.mockResolvedValue({})
  mockCancelGuardianCommunication.mockResolvedValue({})
}

async function mountDashboard() {
  const wrapper = mountWithPlugins(GuardianCommunicationDashboard, {
    messages: {
      en: enPreschool,
      kh: khPreschool,
    },
    routes: [createRoute()],
    global: {
      stubs: {
        AppButton: {
          props: ['type', 'variant', 'size'],
          emits: ['click'],
          template: '<button :type="type" @click="$emit(\'click\')"><slot /></button>',
        },
        AppBadge: {
          props: ['variant'],
          template: '<span><slot /></span>',
        },
      },
    },
  })

  await flushPromises()
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  mockResolvedData()
})

describe('GuardianCommunicationDashboard', () => {
  it('renders the contact log dashboard, search, filters, and summary cards', async () => {
    const wrapper = await mountDashboard()

    expect(mockFetchPreschoolStudents).toHaveBeenCalledWith({ perPage: 200 })
    expect(mockFetchGuardianCommunications).toHaveBeenCalledWith({ perPage: 100 })
    expect(wrapper.text()).toContain('Guardian Contact Log')
    expect(wrapper.text()).toContain('Follow-up Dashboard')
    expect(wrapper.text()).toContain('Search contacts')
    expect(wrapper.text()).toContain('Filter contacts')
    expect(wrapper.text()).toContain('Save contact log')
    expect(wrapper.text()).toContain('Contact History')

    const summaryValues = wrapper.findAll('[data-testid="guardian-contact-summary-value"]').map(node => node.text())
    expect(summaryValues).toEqual(['4', '1', '1', '1', '1'])
    expect(wrapper.findAll('[data-testid="guardian-contact-record"]').length).toBe(4)
  })

  it('filters visible timeline records with search and structured filters', async () => {
    const wrapper = await mountDashboard()

    await wrapper.get('[data-testid="guardian-contact-search"]').setValue('fever')
    await flushPromises()
    expect(wrapper.findAll('[data-testid="guardian-contact-record"]').length).toBe(1)
    expect(wrapper.text()).toContain('Guardian asked about fever treatment.')

    await wrapper.get('[data-testid="guardian-contact-search"]').setValue('')
    await wrapper.get('[data-testid="guardian-contact-filter-student"]').setValue('student-2')
    await wrapper.get('[data-testid="guardian-contact-filter-guardian"]').setValue('guardian-2')
    await wrapper.get('[data-testid="guardian-contact-filter-method"]').setValue('telegram')
    await wrapper.get('[data-testid="guardian-contact-filter-reason"]').setValue('health')
    await wrapper.get('[data-testid="guardian-contact-filter-outcome"]').setValue('guardian-requested-follow-up')
    await wrapper.get('[data-testid="guardian-contact-filter-follow-up-status"]').setValue('overdue')
    await wrapper.get('[data-testid="guardian-contact-filter-date-from"]').setValue(toInputDate(new Date(Date.now() - 86400000)))
    await wrapper.get('[data-testid="guardian-contact-filter-date-to"]').setValue(toInputDate(new Date(Date.now() - 86400000)))
    await flushPromises()

    expect(wrapper.findAll('[data-testid="guardian-contact-record"]').length).toBe(1)
    expect(wrapper.text()).toContain('Bopha Student')
    expect(wrapper.text()).toContain('Dara Guardian')
    expect(wrapper.text()).toContain('Telegram')
    expect(wrapper.text()).toContain('Health')
  })

  it('saves a structured contact log using the current backend payload shape', async () => {
    const wrapper = await mountDashboard()
    const formSelects = wrapper.find('form').findAll('select')
    const textarea = wrapper.find('textarea')

    await formSelects[2].setValue('phone-call')
    await formSelects[3].setValue('attendance')
    await textarea.setValue('Guardian confirmed the pickup plan for tomorrow.')
    await formSelects[4].setValue('guardian-acknowledged')
    await formSelects[5].setValue('high')
    await formSelects[6].setValue('false')
    await flushPromises()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockCreateStudentGuardianCommunication).toHaveBeenCalledTimes(1)
    expect(mockCreateStudentGuardianCommunication).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'student-1',
        guardianId: 'guardian-1',
        sourceType: 'manual_note',
        channel: 'phone-call',
        subject: 'attendance',
        severity: 'high',
        status: 'queued',
        message: expect.stringContaining('[contact-log]'),
      }),
    )
    expect(mockCreateStudentGuardianCommunication.mock.calls[0][0].message).toContain('Guardian confirmed the pickup plan for tomorrow.')
  })

  it('renders the empty history state when there are no communication records', async () => {
    mockFetchGuardianCommunications.mockResolvedValue({ items: [] })
    const wrapper = await mountDashboard()

    expect(wrapper.text()).toContain('No contact history yet')
    expect(wrapper.text()).toContain('Record the first guardian contact from this page.')
  })
})
