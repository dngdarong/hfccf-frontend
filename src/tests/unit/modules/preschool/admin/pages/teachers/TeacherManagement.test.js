import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enPreschool from '@/i18n/en/preschool'
import TeacherManagement from '@/modules/preschool/admin/pages/teachers/TeacherManagement.vue'
import { useUserStore } from '@/store/userStore'
import { fetchPreschoolTeachers } from '@/modules/preschool/services/preschoolApi'
import { resetAdminUserPassword } from '@/modules/super-admin/services/adminUsersApi'

const mockToastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: mockToastAdd,
  }),
}))

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolTeachers: vi.fn(),
  deletePreschoolTeacher: vi.fn(),
}))

vi.mock('@/modules/super-admin/services/adminUsersApi', () => ({
  resetAdminUserPassword: vi.fn(),
}))

function mountPage({
  currentUser = { role: 'adminpreschool', permissions: ['all:*'] },
  teachers = [
    {
      id: 'teacher-1',
      name: 'Teacher One',
      email: 'teacher.one@example.com',
      role: 'teacher-preschool',
      status: 'active',
      permissions: ['class:read'],
    },
  ],
} = {}) {
  fetchPreschoolTeachers.mockImplementation(() =>
    Promise.resolve({
    items: teachers,
    pagination: {
      page: 1,
      perPage: 8,
      total: teachers.length,
      totalPages: 1,
    },
    }),
  )

  return mountWithPlugins(TeacherManagement, {
    messages: {
      en: { common: enCommon, ...enPreschool },
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
        Pagination: { template: '<div data-testid="pagination-stub" />' },
        Toast: { template: '<div data-testid="toast-stub" />' },
        Button: {
          props: ['label', 'disabled', 'loading'],
          emits: ['click'],
          template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot />{{ label }}</button>',
        },
        Table: {
          props: ['rows', 'columns', 'loading', 'emptyText'],
          template:
            '<div data-testid="teacher-table"><div v-for="(row, index) in rows" :key="row.id"><slot name="actions" :data="row" :index="index" /></div></div>',
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
  it('shows the reset action for an allowed preschool admin and preschool teacher row', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Reset Password')
    expect(wrapper.find('[data-testid="row-actions"]').exists()).toBe(true)
  })

  it('hides the reset action for non-preschool admins', async () => {
    const wrapper = mountPage({
      currentUser: { role: 'adminenglish', permissions: ['all:*'] },
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Reset Password')
  })

  it('hides the reset action for disallowed target roles', async () => {
    const wrapper = mountPage({
      teachers: [
        {
          id: 'teacher-2',
          name: 'Teacher Two',
          email: 'teacher.two@example.com',
          role: 'teacher-english',
          status: 'active',
        },
      ],
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Reset Password')
  })

  it('submits the dedicated reset payload and refreshes the teacher list', async () => {
    resetAdminUserPassword.mockResolvedValueOnce({})

    const wrapper = mountPage()
    await flushPromises()

    await openResetDialog(wrapper)

    const dialog = getResetDialog(wrapper)
    await dialog.findAll('input[type="password"]')[0].setValue('teacher-pass')
    await dialog.findAll('input[type="password"]')[1].setValue('teacher-pass')
    await dialog.find('textarea').setValue('Audit rotation')
    await dialog.findAll('button').find((button) => button.text() === 'Reset Password').trigger('click')
    await flushPromises()

    expect(resetAdminUserPassword).toHaveBeenCalledWith('teacher-1', {
      password: 'teacher-pass',
      confirmPassword: 'teacher-pass',
      reason: 'Audit rotation',
    })
    expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      summary: 'Password reset successfully.',
    }))
    expect(fetchPreschoolTeachers).toHaveBeenCalledTimes(2)
    expect(getResetDialog(wrapper).props('visible')).toBe(false)
  })

  it('displays backend error messages from the reset endpoint', async () => {
    resetAdminUserPassword.mockRejectedValueOnce(new Error('Cross-section reset blocked.'))

    const wrapper = mountPage()
    await flushPromises()

    await openResetDialog(wrapper)

    const dialog = getResetDialog(wrapper)
    await dialog.findAll('input[type="password"]')[0].setValue('teacher-pass')
    await dialog.findAll('input[type="password"]')[1].setValue('teacher-pass')
    await dialog.find('textarea').setValue('Audit rotation')
    await dialog.findAll('button').find((button) => button.text() === 'Reset Password').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Cross-section reset blocked.')
    expect(mockToastAdd).not.toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }))
    expect(getResetDialog(wrapper).props('visible')).toBe(true)
  })
})
