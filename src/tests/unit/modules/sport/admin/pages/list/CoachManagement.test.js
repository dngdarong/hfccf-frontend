import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enSport from '@/i18n/en/sport'
import CoachManagement from '@/modules/sport/admin/pages/list/CoachManagement/CoachManagement.vue'
import { useUserStore } from '@/store/userStore'
import {
  fetchSportCoaches,
  resetSportCoachPassword,
} from '@/modules/sport/services/sportApi'

const mockToastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: mockToastAdd,
  }),
}))

vi.mock('@/modules/sport/services/sportApi', () => ({
  deleteSportCoach: vi.fn(),
  fetchSportCoaches: vi.fn(),
  resetSportCoachPassword: vi.fn(),
}))

function mountPage({
  currentUser = { role: 'adminsport', permissions: ['all:*'] },
  coaches = [
    {
      id: 'coach-1',
      name: 'Coach One',
      fullName: 'Coach One',
      email: 'coach.one@example.com',
      phone: '012345678',
      role: 'coach',
      status: 'active',
      permissions: ['training:write'],
    },
  ],
} = {}) {
  fetchSportCoaches.mockImplementation(() =>
    Promise.resolve({
      items: coaches,
      pagination: {
        page: 1,
        perPage: 10,
        total: coaches.length,
        totalPages: 1,
      },
    }),
  )

  return mountWithPlugins(CoachManagement, {
    messages: {
      en: { common: enCommon, ...enSport },
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
        SearchFilterBar: {
          props: ['searchPlaceholder', 'roleOptions', 'statusOptions'],
          template: '<div data-testid="filter-bar" />',
        },
        CoachManagementSummaryGrid: { template: '<div data-testid="summary-grid" />' },
        CoachManagementToolbar: {
          props: ['eyebrow', 'title', 'description', 'spotlightLabel', 'spotlightValue', 'buttonLabel', 'buttonCaption', 'isKh'],
          emits: ['add'],
          template: '<div data-testid="toolbar"><button @click="$emit(\'add\')">Add Coach</button></div>',
        },
        CoachManagementHighlights: { template: '<div data-testid="highlights" />' },
        Table: {
          props: ['rows', 'columns', 'emptyText'],
          template:
            '<div data-testid="coach-table"><div v-for="row in rows" :key="row.id"><slot name="actions" :data="row" /></div></div>',
        },
        TableActions: {
          props: ['item', 'showViewAction', 'showEditAction', 'showDeleteAction', 'showResetAction', 'resetLabel'],
          emits: ['view', 'edit', 'delete', 'reset'],
          template:
            '<div data-testid="row-actions"><button v-if="showViewAction" @click="$emit(\'view\', item)">View</button><button v-if="showEditAction" @click="$emit(\'edit\', item)">Edit</button><button v-if="showResetAction" @click="$emit(\'reset\', item)">Reset Password</button><button v-if="showDeleteAction" @click="$emit(\'delete\', item)">Delete</button></div>',
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
  return wrapper.findComponent({ name: 'ResetCoachPasswordDialog' })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockToastAdd.mockClear()
})

describe('CoachManagement', () => {
  it('shows the reset action for adminsport and coach rows', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Reset Password')
    expect(wrapper.find('[data-testid="row-actions"]').exists()).toBe(true)
  })

  it('shows the reset action for superadmin and coach rows', async () => {
    const wrapper = mountPage({
      currentUser: { role: 'superadmin', permissions: ['all:*'] },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Reset Password')
  })

  it('hides the reset action for unauthorized users', async () => {
    const wrapper = mountPage({
      currentUser: { role: 'adminenglish', permissions: ['all:*'] },
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Reset Password')
  })

  it('hides the reset action for non-coach target rows', async () => {
    const wrapper = mountPage({
      coaches: [
        {
          id: 'player-1',
          name: 'Player One',
          fullName: 'Player One',
          email: 'player.one@example.com',
          phone: '012345679',
          role: 'player',
          status: 'active',
        },
      ],
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Reset Password')
  })

  it('submits the dedicated reset payload and refreshes the coach list', async () => {
    resetSportCoachPassword.mockResolvedValueOnce({})

    const wrapper = mountPage()
    await flushPromises()

    await openResetDialog(wrapper)

    const dialog = getResetDialog(wrapper)
    await dialog.findAll('input[type="password"]')[0].setValue('coach-pass')
    await dialog.findAll('input[type="password"]')[1].setValue('coach-pass')
    await dialog.find('textarea').setValue('Audit rotation')
    await dialog.findAll('button').at(-1).trigger('click')
    await flushPromises()

    expect(resetSportCoachPassword).toHaveBeenCalledWith('coach-1', {
      password: 'coach-pass',
      password_confirmation: 'coach-pass',
      reason: 'Audit rotation',
    })
    expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      summary: 'Password reset successfully.',
    }))
    expect(fetchSportCoaches).toHaveBeenCalledTimes(2)
    expect(getResetDialog(wrapper).props('visible')).toBe(false)
  })

  it('displays backend error messages from the reset endpoint', async () => {
    resetSportCoachPassword.mockRejectedValueOnce(new Error('Cross-section reset blocked.'))

    const wrapper = mountPage()
    await flushPromises()

    await openResetDialog(wrapper)

    const dialog = getResetDialog(wrapper)
    await dialog.findAll('input[type="password"]')[0].setValue('coach-pass')
    await dialog.findAll('input[type="password"]')[1].setValue('coach-pass')
    await dialog.find('textarea').setValue('Audit rotation')
    await dialog.findAll('button').at(-1).trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Cross-section reset blocked.')
    expect(mockToastAdd).not.toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }))
    expect(getResetDialog(wrapper).props('visible')).toBe(true)
  })
})
