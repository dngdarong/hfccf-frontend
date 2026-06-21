import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enEnglish from '@/i18n/en/english'
import TeacherManagement from '@/modules/english/admin/pages/TeacherManagement.vue'
import { useUserStore } from '@/store/userStore'
import {
  fetchEnglishTeachers,
  resetEnglishTeacherPassword,
} from '@/modules/english/services/englishApi'

const mockToastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: mockToastAdd,
  }),
}))

vi.mock('@/modules/english/services/englishApi', () => ({
  createEnglishTeacher: vi.fn(),
  deleteEnglishTeacher: vi.fn(),
  fetchEnglishTeachers: vi.fn(),
  resetEnglishTeacherPassword: vi.fn(),
  updateEnglishTeacher: vi.fn(),
}))

function mountPage({
  currentUser = { role: 'adminenglish', permissions: ['all:*'] },
  teachers = [
    {
      id: 'teacher-1',
      firstName: 'Teacher',
      lastName: 'One',
      fullName: 'Teacher One',
      email: 'teacher.one@example.com',
      phone: '012345678',
      role: 'teacher-english',
      status: 'active',
      permissions: ['class:read'],
    },
  ],
} = {}) {
  fetchEnglishTeachers.mockImplementation(() =>
    Promise.resolve({
      items: teachers,
      pagination: {
        page: 1,
        perPage: 10,
        total: teachers.length,
        totalPages: 1,
      },
    }),
  )

  return mountWithPlugins(TeacherManagement, {
    messages: {
      en: { common: enCommon, ...enEnglish },
    },
    piniaSetup(pinia) {
      const userStore = useUserStore(pinia)
      userStore.currentUser = currentUser
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Toast: { template: '<div data-testid="toast-stub" />' },
        Pagination: { template: '<div data-testid="pagination-stub" />' },
        Button: {
          props: ['label', 'disabled', 'loading'],
          inheritAttrs: false,
          emits: ['click'],
          template: '<button :disabled="disabled" @click="$emit(\'click\')">{{ $attrs.label || label }}<slot /></button>',
        },
        UsersTable: {
          props: ['rows', 'columns', 'loading', 'emptyText'],
          template:
            '<div data-testid="teacher-table"><div v-for="row in rows" :key="row.id"><slot name="actions" :data="row" /></div></div>',
        },
        TableActions: {
          props: ['item', 'showViewAction', 'showEditAction', 'showDeleteAction', 'showResetAction'],
          emits: ['view', 'edit', 'delete', 'reset'],
          template:
            '<div data-testid="row-actions"><button v-if="showViewAction" @click="$emit(\'view\', item)">View</button><button v-if="showEditAction" @click="$emit(\'edit\', item)">Edit</button><button v-if="showResetAction" @click="$emit(\'reset\', item)">Reset Password</button><button v-if="showDeleteAction" @click="$emit(\'delete\', item)">Delete</button></div>',
        },
        AlertQuestion: {
          props: ['show', 'title', 'message', 'confirmText', 'cancelText', 'type'],
          emits: ['confirm', 'cancel'],
          template: '<div v-if="show" data-testid="delete-alert" />',
        },
        AlertSuccess: {
          props: ['show', 'title', 'message', 'buttonText'],
          emits: ['close'],
          template: '<div v-if="show" data-testid="success-alert" />',
        },
        Dialog: {
          props: ['visible', 'header'],
          template:
            '<section v-if="visible" data-testid="dialog"><header>{{ header }}</header><slot /><footer><slot name="footer" /></footer></section>',
        },
      },
    },
  })
}

async function openResetDialog(wrapper) {
  const resetButton = wrapper
    .findAll('[data-testid="row-actions"] button')
    .find((button) => button.text() === 'Reset Password')

  await resetButton.trigger('click')
  await flushPromises()
}

function getResetDialog(wrapper) {
  return wrapper.findComponent({ name: 'ResetTeacherPasswordDialog' })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockToastAdd.mockClear()
})

describe('TeacherManagement', () => {
  it('shows the reset action for adminenglish and teacher-english rows', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Reset Password')
    expect(wrapper.find('[data-testid="row-actions"]').exists()).toBe(true)
  })

  it('shows the reset action for superadmin and teacher-english rows', async () => {
    const wrapper = mountPage({
      currentUser: { role: 'superadmin', permissions: ['all:*'] },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Reset Password')
  })

  it('hides the reset action for unauthorized users', async () => {
    const wrapper = mountPage({
      currentUser: { role: 'adminpreschool', permissions: ['all:*'] },
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Reset Password')
  })

  it('hides the reset action for non teacher-english target rows', async () => {
    const wrapper = mountPage({
      teachers: [
        {
          id: 'teacher-2',
          firstName: 'Teacher',
          lastName: 'Two',
          fullName: 'Teacher Two',
          email: 'teacher.two@example.com',
          phone: '012345679',
          role: 'adminenglish',
          status: 'active',
        },
      ],
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Reset Password')
  })

  it('submits the dedicated reset payload and refreshes the teacher list', async () => {
    resetEnglishTeacherPassword.mockResolvedValueOnce({})

    const wrapper = mountPage()
    await flushPromises()

    await openResetDialog(wrapper)

    const dialog = getResetDialog(wrapper)
    await dialog.findAll('input[type="password"]')[0].setValue('teacher-pass')
    await dialog.findAll('input[type="password"]')[1].setValue('teacher-pass')
    await dialog.find('textarea').setValue('Audit rotation')
    await dialog.findAll('button').at(-1).trigger('click')
    await flushPromises()

    expect(resetEnglishTeacherPassword).toHaveBeenCalledWith('teacher-1', {
      password: 'teacher-pass',
      password_confirmation: 'teacher-pass',
      reason: 'Audit rotation',
    })
    expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      summary: 'Password reset successfully.',
    }))
    expect(fetchEnglishTeachers).toHaveBeenCalledTimes(2)
    expect(getResetDialog(wrapper).props('visible')).toBe(false)
  })

  it('displays backend error messages from the reset endpoint', async () => {
    resetEnglishTeacherPassword.mockRejectedValueOnce(new Error('Cross-section reset blocked.'))

    const wrapper = mountPage()
    await flushPromises()

    await openResetDialog(wrapper)

    const dialog = getResetDialog(wrapper)
    await dialog.findAll('input[type="password"]')[0].setValue('teacher-pass')
    await dialog.findAll('input[type="password"]')[1].setValue('teacher-pass')
    await dialog.find('textarea').setValue('Audit rotation')
    await dialog.findAll('button').at(-1).trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Cross-section reset blocked.')
    expect(mockToastAdd).not.toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }))
    expect(getResetDialog(wrapper).props('visible')).toBe(true)
  })
})
