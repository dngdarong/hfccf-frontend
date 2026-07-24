import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import OperationsCenter from '@/modules/preschool/admin/pages/operations/OperationsCenter.vue'

const mockLoadOperations = vi.fn()
const loadingState = ref(false)
const errorMessageState = ref('')

const operationsState = ref({
  scope: 'operations',
  summary: {},
  today: {
    date: '2026-07-02',
    attendanceRate: 95,
    openAlerts: 2,
    missingSessions: 1,
    todaySessions: [
      {
        id: 1,
        className: 'Morning Stars',
        scheduleLabel: '8:00 - 10:00',
        teacherName: 'Teacher A',
        room: 'Room 1',
        status: 'scheduled',
      },
    ],
  },
  attendance: {
    summary: {
      attendanceRate: 95,
      present: 18,
      absent: 2,
      late: 1,
      excused: 1,
      unexcused: 0,
    },
    datasets: {
      recentAlerts: [
        { id: 'alert-1', alertLabel: 'Repeated absence', studentName: 'Student A', createdAt: '2026-07-02T08:00:00Z', status: 'open' },
      ],
    },
  },
  alerts: {
    datasets: {
      recentAlerts: [
        { id: 'alert-1', alertLabel: 'Repeated absence', studentName: 'Student A', createdAt: '2026-07-02T08:00:00Z', status: 'open' },
      ],
    },
  },
  guardianCommunications: {
    summary: {
      contactLogs: 5,
      followUps: 2,
      completed: 3,
      outstandingFollowUps: 1,
    },
    items: [
      { id: 'comm-1', subject: 'Follow up', message: 'Call guardian', createdAt: '2026-07-02T09:00:00Z', status: 'open' },
    ],
  },
  health: {
    summary: {
      openAlerts: 1,
      criticalAlerts: 0,
      medicationReminders: 2,
      studentsRequiringAttention: 1,
    },
    alerts: [
      { id: 'health-1', label: 'Health alert', text: 'Checkup', createdAt: '2026-07-02T10:00:00Z', status: 'open' },
    ],
  },
  payments: {
    summary: {
      overdue: 2,
      outstandingBalance: 100,
      pendingReceipts: 1,
      completed: 4,
    },
    overdue: [
      { id: 'payment-1', invoiceNumber: 'INV-001', studentName: 'Student A', createdAt: '2026-07-02T08:30:00Z', status: 'overdue' },
    ],
    outstanding: [
      { id: 'payment-2', invoiceNumber: 'INV-002', studentName: 'Student B', createdAt: '2026-07-02T08:45:00Z', status: 'pending' },
    ],
  },
  assessments: {
    summary: {
      pending: 3,
      upcomingAssessments: 2,
      overdueGrading: 1,
      completed: 5,
    },
    rows: [
      { id: 'assess-1', label: 'Math Check', studentName: 'Student A', createdAt: '2026-07-02T09:15:00Z', status: 'pending' },
    ],
  },
  teachers: {
    summary: {
      assignedClasses: 4,
      students: 20,
      attendanceSessions: 5,
      completedSessions: 4,
      todayWorkload: 3,
      pendingAttendance: 1,
    },
    breakdowns: {
      byTeacher: [
        { id: 'teacher-1', label: 'Teacher A', value: 4, createdAt: '2026-07-02T07:45:00Z' },
      ],
    },
  },
  risks: {
    healthAlerts: 1,
    guardianIssues: 2,
    overdueInvoices: 2,
    missingSessions: 1,
    openAttendanceAlerts: 2,
  },
  workflows: {
    summary: {
      total: 2,
      pendingWorkflows: 2,
      pendingApprovals: 1,
      overdueWorkflows: 0,
      escalatedWorkflows: 0,
      recentlyUpdatedWorkflows: 2,
      myAssignments: 1,
    },
    items: [
      {
        id: 'wf-1',
        workflowDefinitionName: 'Invoice Collection',
        sourceLabel: 'Invoice INV-OPS-001',
        sourceType: 'invoice',
        sourceRouteName: 'dashboard-preschool-admin-invoice-detail',
        sourceRouteParams: { id: 'INV-OPS-001' },
        sourceExists: true,
        status: 'open',
        priority: 'high',
        currentStep: { name: 'Issued' },
        updatedAt: '2026-07-02T08:00:00Z',
      },
    ],
    recentActivity: [
      {
        id: 'wf-1',
        workflowDefinitionName: 'Invoice Collection',
        sourceLabel: 'Invoice INV-OPS-001',
        sourceType: 'invoice',
        sourceRouteName: 'dashboard-preschool-admin-invoice-detail',
        sourceRouteParams: { id: 'INV-OPS-001' },
        sourceExists: true,
        status: 'open',
        priority: 'high',
        currentStep: { name: 'Issued' },
        updatedAt: '2026-07-02T08:00:00Z',
      },
    ],
  },
  timeline: [
    { id: 'timeline-1', type: 'session', label: 'Morning Stars', text: 'Session opened', status: 'open', createdAt: '2026-07-02T08:00:00Z' },
  ],
  quickActions: [
    { routeName: 'dashboard-preschool-admin-attendance', label: 'Take Attendance', labelKey: 'takeAttendance' },
    { routeName: 'dashboard-preschool-admin-reports', label: 'Generate Report', labelKey: 'viewReports' },
  ],
  generatedAt: '2026-07-02T10:00:00Z',
})

vi.mock('@/modules/preschool/admin/pages/operations/composables/useOperationsData', () => ({
  useOperationsData: () => ({
    loading: loadingState,
    errorMessage: errorMessageState,
    operations: operationsState,
    hasOperationsData: ref(true),
    loadOperations: (...args) => mockLoadOperations(...args),
  }),
}))

function createRoute() {
  return {
    path: '/module/preschool-admin/operations',
    name: 'dashboard-preschool-admin-operations',
    component: { template: '<div />' },
  }
}

function createWorkflowRoute() {
  return {
    path: '/module/preschool-admin/workflows/:id',
    name: 'dashboard-preschool-admin-workflow-details',
    component: { template: '<div />' },
  }
}

async function mountPage() {
  const wrapper = mountWithPlugins(OperationsCenter, {
    messages: {
      en: enPreschool,
    },
    routes: [createRoute(), createWorkflowRoute()],
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
      },
    },
  })

  await wrapper.vm.$router.push({ name: 'dashboard-preschool-admin-operations' })
  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  loadingState.value = false
  errorMessageState.value = ''
  operationsState.value = {
    scope: 'operations',
    summary: {},
    today: {
      date: '2026-07-02',
      attendanceRate: 95,
      openAlerts: 2,
      missingSessions: 1,
      todaySessions: [
        {
          id: 1,
          className: 'Morning Stars',
          scheduleLabel: '8:00 - 10:00',
          teacherName: 'Teacher A',
          room: 'Room 1',
          status: 'scheduled',
        },
      ],
    },
    attendance: {
      summary: {
        attendanceRate: 95,
        present: 18,
        absent: 2,
        late: 1,
        excused: 1,
        unexcused: 0,
      },
      datasets: {
        recentAlerts: [
          { id: 'alert-1', alertLabel: 'Repeated absence', studentName: 'Student A', createdAt: '2026-07-02T08:00:00Z', status: 'open' },
        ],
      },
    },
    alerts: {
      datasets: {
        recentAlerts: [
          { id: 'alert-1', alertLabel: 'Repeated absence', studentName: 'Student A', createdAt: '2026-07-02T08:00:00Z', status: 'open' },
        ],
      },
    },
    guardianCommunications: {
      summary: {
        contactLogs: 5,
        followUps: 2,
        completed: 3,
        outstandingFollowUps: 1,
      },
      items: [
        { id: 'comm-1', subject: 'Follow up', message: 'Call guardian', createdAt: '2026-07-02T09:00:00Z', status: 'open' },
      ],
    },
    health: {
      summary: {
        openAlerts: 1,
        criticalAlerts: 0,
        medicationReminders: 2,
        studentsRequiringAttention: 1,
      },
      alerts: [
        { id: 'health-1', label: 'Health alert', text: 'Checkup', createdAt: '2026-07-02T10:00:00Z', status: 'open' },
      ],
    },
    payments: {
      summary: {
        overdue: 2,
        outstandingBalance: 100,
        pendingReceipts: 1,
        completed: 4,
      },
      overdue: [
        { id: 'payment-1', invoiceNumber: 'INV-001', studentName: 'Student A', createdAt: '2026-07-02T08:30:00Z', status: 'overdue' },
      ],
      outstanding: [
        { id: 'payment-2', invoiceNumber: 'INV-002', studentName: 'Student B', createdAt: '2026-07-02T08:45:00Z', status: 'pending' },
      ],
    },
    assessments: {
      summary: {
        pending: 3,
        upcomingAssessments: 2,
        overdueGrading: 1,
        completed: 5,
      },
      rows: [
        { id: 'assess-1', label: 'Math Check', studentName: 'Student A', createdAt: '2026-07-02T09:15:00Z', status: 'pending' },
      ],
    },
    teachers: {
      summary: {
        assignedClasses: 4,
        students: 20,
        attendanceSessions: 5,
        completedSessions: 4,
        todayWorkload: 3,
        pendingAttendance: 1,
      },
      breakdowns: {
        byTeacher: [
          { id: 'teacher-1', label: 'Teacher A', value: 4, createdAt: '2026-07-02T07:45:00Z' },
        ],
      },
    },
    risks: {
      healthAlerts: 1,
      guardianIssues: 2,
      overdueInvoices: 2,
      missingSessions: 1,
      openAttendanceAlerts: 2,
    },
    workflows: {
      summary: {
        total: 2,
        pendingWorkflows: 2,
        pendingApprovals: 1,
        overdueWorkflows: 0,
        escalatedWorkflows: 0,
        recentlyUpdatedWorkflows: 2,
        myAssignments: 1,
      },
      items: [
        {
          id: 'wf-1',
          workflowDefinitionName: 'Invoice Collection',
          sourceLabel: 'Invoice INV-OPS-001',
          sourceType: 'invoice',
          sourceRouteName: 'dashboard-preschool-admin-invoice-detail',
          sourceRouteParams: { id: 'INV-OPS-001' },
          sourceExists: true,
          status: 'open',
          priority: 'high',
          currentStep: { name: 'Issued' },
          updatedAt: '2026-07-02T08:00:00Z',
        },
      ],
      recentActivity: [
        {
          id: 'wf-1',
          workflowDefinitionName: 'Invoice Collection',
          sourceLabel: 'Invoice INV-OPS-001',
          sourceType: 'invoice',
          sourceRouteName: 'dashboard-preschool-admin-invoice-detail',
          sourceRouteParams: { id: 'INV-OPS-001' },
          sourceExists: true,
          status: 'open',
          priority: 'high',
          currentStep: { name: 'Issued' },
          updatedAt: '2026-07-02T08:00:00Z',
        },
      ],
    },
    timeline: [
      { id: 'timeline-1', type: 'session', label: 'Morning Stars', text: 'Session opened', status: 'open', createdAt: '2026-07-02T08:00:00Z' },
    ],
    quickActions: [
      { routeName: 'dashboard-preschool-admin-attendance', label: 'Take Attendance', labelKey: 'takeAttendance' },
      { routeName: 'dashboard-preschool-admin-reports', label: 'Generate Report', labelKey: 'viewReports' },
    ],
    generatedAt: '2026-07-02T10:00:00Z',
  }
})

describe('OperationsCenter', () => {
  it('loads the operations dashboard endpoint and renders operational sections', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = await mountPage()

    expect(mockLoadOperations).toHaveBeenCalledWith({
      dateFrom: '',
      dateTo: '',
      classId: '',
      teacherUserId: '',
      status: '',
    })

    expect(wrapper.text()).toContain('Executive Operations Center')
    expect(wrapper.text()).toContain('Today’s Overview')
    expect(wrapper.text()).toContain('Operational Summary')
    expect(wrapper.text()).toContain('Today’s Sessions')
    expect(wrapper.text()).toContain('Attendance Monitoring')
    expect(wrapper.text()).toContain('Guardian Follow-up')
    expect(wrapper.text()).toContain('Health Monitoring')
    expect(wrapper.text()).toContain('Payment Operations')
    expect(wrapper.text()).toContain('Assessment Operations')
    expect(wrapper.text()).toContain('Teacher Operations')
    expect(wrapper.text()).toContain('Operational Risks')
    expect(wrapper.text()).toContain('Workflow Visibility')
    expect(wrapper.text()).toContain('Workflow Activity')
    expect(wrapper.text()).toContain('Pending Workflows')
    expect(wrapper.text()).toContain('Pending Approvals')
    expect(wrapper.text()).toContain('Overdue Workflows')
    expect(wrapper.text()).toContain('Escalated Workflows')
    expect(wrapper.text()).toContain('Recently Updated Workflows')
    expect(wrapper.text()).toContain('Open Workflow')
    expect(wrapper.text()).toContain('Timeline')
    expect(wrapper.text()).toContain('Quick Actions')

    const rawIsoTimestamps = [
      '2026-06-29T07:56:49.000000Z',
      '2026-07-02T10:00:00Z',
      '2026-07-02T08:00:00Z',
      '2026-07-02T09:00:00Z',
      '2026-07-02T08:30:00Z',
      '2026-07-02T08:45:00Z',
      '2026-07-02T09:15:00Z',
      '2026-07-02T07:45:00Z',
    ]

    rawIsoTimestamps.forEach((timestamp) => {
      expect(wrapper.text()).not.toContain(timestamp)
    })

    const unresolvedButtonWarnings = warnSpy.mock.calls.filter((call) =>
      String(call[0] ?? '').includes('Failed to resolve component: Button'),
    )
    expect(unresolvedButtonWarnings).toHaveLength(0)

    warnSpy.mockRestore()
  })

  it('renders loading and error states when backend data changes', async () => {
    loadingState.value = true
    errorMessageState.value = 'Failed to load operations dashboard.'

    const wrapper = await mountPage()

    expect(wrapper.find('[data-testid="operations-loading"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load operations dashboard.')
  })

  it('renders empty states when the operations payload is empty', async () => {
    operationsState.value = {
      scope: 'operations',
      summary: {},
      today: {},
      attendance: {},
      alerts: {},
      guardianCommunications: {},
      health: {},
      payments: {},
      assessments: {},
      teachers: {},
      risks: {},
      workflows: {},
      timeline: [],
      quickActions: [],
      generatedAt: '',
    }

    const wrapper = await mountPage()

    expect(wrapper.find('[data-testid="operations-loading"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('No sessions available.')
    expect(wrapper.text()).toContain('No operational risks available.')
    expect(wrapper.text()).toContain('No timeline events available.')
    expect(wrapper.text()).toContain('No operational data available.')
  })
})
