import { createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import PrimeVue from 'primevue/config'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestI18n } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import { canAccessRoute } from '@/services/accessControl'
import { makeAdminPreschool, makeSuperAdmin, makeTeacherPreschool } from '@/tests/helpers/factories'
import { preschoolRoutes } from '@/modules/preschool/routes'

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

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchPreschoolStudents.mockResolvedValue({ items: [] })
  mockFetchGuardianCommunications.mockResolvedValue({ items: [] })
  mockCreateStudentGuardianCommunication.mockResolvedValue({})
  mockMarkGuardianCommunicationSent.mockResolvedValue({})
  mockAcknowledgeGuardianCommunication.mockResolvedValue({})
  mockCancelGuardianCommunication.mockResolvedValue({})
})

function createRouterHarness() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      ...preschoolRoutes,
    ],
  })
}

function getGuardianShellRoute() {
  return preschoolRoutes.find((route) => route.path === '/module/preschool-admin/guardians')
}

describe('GuardianCommunication route shell', () => {
  it('keeps the guardian contact log nested under the preschool admin shell', () => {
    const shellRoute = getGuardianShellRoute()

    expect(shellRoute).toBeTruthy()
    expect(shellRoute.path).toBe('/module/preschool-admin/guardians')
    expect(typeof shellRoute.component).toBe('function')
    expect(Array.isArray(shellRoute.children)).toBe(true)

    const communicationsRoute = shellRoute.children.find((route) => route.name === 'dashboard-preschool-admin-guardian-communications')
    expect(communicationsRoute).toBeTruthy()
    expect(communicationsRoute.path).toBe('communications')
    expect(typeof communicationsRoute.component).toBe('function')
    expect(communicationsRoute.access.domains).toContain('preschool')
    expect(communicationsRoute.access.scopes).toContain('admin')
  })

  it('resolves the canonical route name and preserves the student query inside the shell', async () => {
    const router = createRouterHarness()
    const i18n = createTestI18n({ en: enPreschool, kh: khPreschool })
    const route = router.resolve({
      name: 'dashboard-preschool-admin-guardian-communications',
      query: { studentId: '5' },
    })

    expect(route.fullPath).toBe('/module/preschool-admin/guardians/communications?studentId=5')
    expect(route.matched.length).toBeGreaterThan(1)

    await router.push(route.fullPath)
    await router.isReady()

    const wrapper = mount(
      { template: '<RouterView />' },
      {
        global: {
          plugins: [i18n, createPinia(), router, PrimeVue],
          stubs: {
            MainLayout: { template: '<div data-testid="main-layout-shell"><slot /></div>' },
            Breadcrumb: { template: '<nav data-testid="breadcrumb-stub" />' },
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
      },
    )

    await flushPromises()

    expect(wrapper.find('[data-testid="main-layout-shell"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Guardian Contact Log')
    expect(wrapper.text()).toContain('Follow-up Dashboard')
    expect(router.currentRoute.value.name).toBe('dashboard-preschool-admin-guardian-communications')
    expect(router.currentRoute.value.query.studentId).toBe('5')
  })

  it('keeps the guardian contact log route restricted to Preschool admin and superadmin access patterns', () => {
    const shellRoute = getGuardianShellRoute()
    const communicationsRoute = shellRoute.children.find((route) => route.name === 'dashboard-preschool-admin-guardian-communications')

    expect(canAccessRoute(makeAdminPreschool(), { matched: [shellRoute, communicationsRoute] })).toBe(true)
    expect(canAccessRoute(makeSuperAdmin(), { matched: [shellRoute, communicationsRoute] })).toBe(true)
    expect(canAccessRoute(makeTeacherPreschool(), { matched: [shellRoute, communicationsRoute] })).toBe(false)
  })
})
