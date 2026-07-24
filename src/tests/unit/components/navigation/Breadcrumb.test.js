import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'
import enBreadcrumb from '@/i18n/en/breadcrumb'
import enDashboardNav from '@/i18n/en/dashboard/nav'
import enPreschool from '@/i18n/en/preschool'
import khBreadcrumb from '@/i18n/kh/breadcrumb'
import khDashboardNav from '@/i18n/kh/dashboard/nav'
import khPreschool from '@/i18n/kh/preschool'
import { createTestI18n, createTestRouter } from '@/tests/helpers/mount'

async function mountAtRoute(routeName, routes, locale = 'en') {
  const router = createTestRouter(routes)

  await router.push({ name: routeName })
  await router.isReady()

  const i18n = createTestI18n({
    en: {
      ...enBreadcrumb,
      nav: enDashboardNav,
      ...enPreschool,
    },
    kh: {
      ...khBreadcrumb,
      nav: khDashboardNav,
      ...khPreschool,
    },
  })
  i18n.global.locale.value = locale

  return mount(Breadcrumb, {
    global: {
      plugins: [
        i18n,
        router,
      ],
    },
  })
}

describe('Breadcrumb', () => {
  it('renders the enrollment create breadcrumb trail', async () => {
    const wrapper = await mountAtRoute('dashboard-preschool-admin-enrollments-create', [
      {
        path: '/module/preschool-admin',
        name: 'dashboard-preschool-admin',
        component: { template: '<div />' },
      },
      {
        path: '/module/preschool-admin/enrollments',
        name: 'dashboard-preschool-admin-enrollments',
        component: { template: '<div />' },
      },
      {
        path: '/module/preschool-admin/enrollments/create',
        name: 'dashboard-preschool-admin-enrollments-create',
        component: { template: '<div />' },
      },
    ])

    expect(wrapper.text()).toContain('Preschool')
    expect(wrapper.text()).toContain('Enrollment')
    expect(wrapper.text()).toContain('New Application')
    expect(wrapper.findAll('a')).toHaveLength(2)
  })

  it('renders the guardian communication breadcrumb trail', async () => {
    const wrapper = await mountAtRoute('dashboard-preschool-admin-guardian-communications', [
      {
        path: '/module/preschool-admin',
        name: 'dashboard-preschool-admin',
        component: { template: '<div />' },
      },
      {
        path: '/module/preschool-admin/guardians/communications',
        name: 'dashboard-preschool-admin-guardian-communications',
        component: { template: '<div />' },
      },
    ])

    expect(wrapper.text()).toContain('Preschool')
    expect(wrapper.text()).toContain('Guardian Contact Log')
    expect(wrapper.findAll('a')).toHaveLength(1)
  })

  it('renders the preschool analytics breadcrumb trail', async () => {
    const wrapper = await mountAtRoute('dashboard-super-admin-command-center-preschool-analytics', [
      {
        path: '/module/super-admin/dashboard',
        name: 'dashboard-super-admin',
        component: { template: '<div />' },
      },
      {
        path: '/module/super-admin/command-center/preschool-analytics',
        name: 'dashboard-super-admin-command-center-preschool-analytics',
        component: { template: '<div />' },
      },
    ])

    expect(wrapper.text()).toContain('Command Center')
    expect(wrapper.text()).toContain('Preschool Analytics')
    expect(wrapper.findAll('a')).toHaveLength(1)
  })

  it('renders the preschool preferences breadcrumb trail in Khmer', async () => {
    const wrapper = await mountAtRoute('dashboard-preschool-admin-settings-preferences', [
      {
        path: '/module/preschool-admin',
        name: 'dashboard-preschool-admin',
        component: { template: '<div />' },
      },
      {
        path: '/preschool/settings',
        name: 'dashboard-preschool-admin-settings',
        component: { template: '<div />' },
      },
      {
        path: '/preschool/settings/preferences',
        name: 'dashboard-preschool-admin-settings-preferences',
        component: { template: '<div />' },
      },
    ], 'kh')

    expect(wrapper.text()).toContain('មត្តេយ្យ')
    expect(wrapper.text()).toContain('ការកំណត់')
    expect(wrapper.text()).toContain('ចំណូលចិត្ត')
  })

  it('stays empty on redirect-only compatibility routes', async () => {
    const wrapper = await mountAtRoute('dashboard-preschool-admin-notifications', [
      {
        path: '/module/preschool-admin',
        name: 'dashboard-preschool-admin',
        component: { template: '<div />' },
      },
      {
        path: '/module/preschool-admin/notifications',
        name: 'dashboard-preschool-admin-notifications',
        component: { template: '<div />' },
      },
    ])

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('stays empty for the stale sport coach attendance route name', async () => {
    const wrapper = await mountAtRoute('dashboard-sport-admin-attendance-coaches', [
      {
        path: '/module/sport-admin',
        name: 'dashboard-sport-admin',
        component: { template: '<div />' },
      },
      {
        path: '/module/sport-admin/attendance',
        name: 'dashboard-sport-admin-attendance',
        component: { template: '<div />' },
      },
      {
        path: '/module/sport-admin/attendance/coaches',
        name: 'dashboard-sport-admin-attendance-coaches',
        component: { template: '<div />' },
      },
    ])

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('renders the coach attendance breadcrumb trail in English', async () => {
    const wrapper = await mountAtRoute('dashboard-sport-coach-attendance', [
      {
        path: '/module/sport-coach',
        name: 'dashboard-sport-coach',
        component: { template: '<div />' },
      },
      {
        path: '/module/sport-coach/attendance',
        name: 'dashboard-sport-coach-attendance',
        component: { template: '<div />' },
      },
    ])

    expect(wrapper.text()).toContain('Coach Dashboard')
    expect(wrapper.text()).toContain('Player Attendance')
    expect(wrapper.findAll('a')).toHaveLength(1)
  })

  it('renders the coach attendance breadcrumb trail in Khmer', async () => {
    const wrapper = await mountAtRoute('dashboard-sport-coach-attendance', [
      {
        path: '/module/sport-coach',
        name: 'dashboard-sport-coach',
        component: { template: '<div />' },
      },
      {
        path: '/module/sport-coach/attendance',
        name: 'dashboard-sport-coach-attendance',
        component: { template: '<div />' },
      },
    ], 'kh')

    expect(wrapper.text()).toContain('ផ្ទាំងគ្រប់គ្រងគ្រូបង្វឹក')
    expect(wrapper.text()).toContain('វត្តមានកីឡាករ')
    expect(wrapper.findAll('a')).toHaveLength(1)
  })
})
