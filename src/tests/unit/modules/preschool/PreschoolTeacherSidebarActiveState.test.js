import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import PrimeVue from 'primevue/config'
import SidebarNavigation from '@/components/navigation/SidebarNavigation.vue'
import { createTestI18n } from '@/tests/helpers/mount'
import { makeTeacherPreschool } from '@/tests/helpers/factories'
import { useUserStore } from '@/store/userStore'

const sidebarRoutes = [
  { path: '/module/preschool-admin/teacher', name: 'dashboard-preschool-teacher', component: { template: '<div />' } },
  { path: '/module/preschool-admin/teacher/students', name: 'dashboard-preschool-teacher-students', component: { template: '<div />' } },
  { path: '/module/preschool-admin/teacher/schedule', name: 'dashboard-preschool-teacher-schedule', component: { template: '<div />' } },
  { path: '/module/preschool-admin/teacher/schedules/:id', name: 'dashboard-preschool-teacher-schedule-details', component: { template: '<div />' } },
  { path: '/module/preschool-admin/teacher/attendance', name: 'dashboard-preschool-teacher-attendance', component: { template: '<div />' } },
  { path: '/module/preschool-admin/teacher/attendance/sessions/:id', name: 'dashboard-preschool-teacher-attendance-session-details', component: { template: '<div />' } },
  { path: '/module/preschool-admin/teacher/report', name: 'dashboard-preschool-teacher-report', component: { template: '<div />' } },
  { path: '/module/preschool-admin/teacher/classroomresources', name: 'dashboard-preschool-teacher-classroomresources', component: { template: '<div />' } },
  { path: '/module/preschool-admin/teacher/healthy', name: 'dashboard-preschool-teacher-healthy', component: { template: '<div />' } },
]

async function mountSidebar(routeLocation) {
  const i18n = createTestI18n({ en: {}, kh: {} })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }, ...sidebarRoutes],
  })
  await router.push(routeLocation)
  await router.isReady()

  const pinia = createPinia()
  setActivePinia(pinia)

  const userStore = useUserStore()
  userStore.currentUser = makeTeacherPreschool()

  return {
    router,
    wrapper: mount(SidebarNavigation, {
      global: {
        plugins: [i18n, pinia, router, PrimeVue],
        stubs: {
          AppBadge: { props: ['label'], template: '<span class="app-badge">{{ label }}</span>' },
        },
      },
    }),
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('Preschool teacher sidebar active state', () => {
  it.each([
    [{ name: 'dashboard-preschool-teacher' }, 'dashboard-preschool-teacher'],
    [{ name: 'dashboard-preschool-teacher-students' }, 'dashboard-preschool-teacher-students'],
    [{ name: 'dashboard-preschool-teacher-schedule' }, 'dashboard-preschool-teacher-schedule'],
    [{ name: 'dashboard-preschool-teacher-attendance' }, 'dashboard-preschool-teacher-attendance'],
    [{ name: 'dashboard-preschool-teacher-report' }, 'dashboard-preschool-teacher-report'],
    [{ name: 'dashboard-preschool-teacher-classroomresources' }, 'dashboard-preschool-teacher-classroomresources'],
    [{ name: 'dashboard-preschool-teacher-healthy' }, 'dashboard-preschool-teacher-healthy'],
  ])('keeps only one active item on %o', async (routeLocation, expectedActiveRouteName) => {
    const { router, wrapper } = await mountSidebar(routeLocation)
    const activeLinks = wrapper.findAll('a.sidebar-link--active')
    const expectedHref = router.resolve({
      name: expectedActiveRouteName,
      ...(routeLocation.params ? { params: routeLocation.params } : {}),
    }).href

    expect(activeLinks).toHaveLength(1)
    expect(activeLinks[0].attributes('href')).toBe(expectedHref)
  })
})
