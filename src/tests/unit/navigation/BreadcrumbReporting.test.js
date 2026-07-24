import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'
import { RouterLink } from 'vue-router'

describe('Breadcrumb Navigation for Reporting', () => {
  let router

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/preschool/dashboard',
          name: 'dashboard-preschool-admin',
          component: { template: '<div>Preschool Admin</div>' },
        },
        {
          path: '/preschool/reports',
          name: 'dashboard-preschool-admin-reports',
          component: { template: '<div>Reports Hub</div>' },
        },
        {
          path: '/preschool/reports/student-summary',
          name: 'dashboard-preschool-admin-reports-student-summary',
          component: { template: '<div>Student Summary Report</div>' },
        },
        {
          path: '/preschool/reports/attendance',
          name: 'dashboard-preschool-admin-reports-attendance',
          component: { template: '<div>Attendance Report</div>' },
        },
        {
          path: '/preschool/reports/assessments',
          name: 'dashboard-preschool-admin-reports-assessments',
          component: { template: '<div>Assessment Report</div>' },
        },
      ],
    })
  })

  describe('Reporting Hub Breadcrumb', () => {
    it('should display breadcrumb for reports hub', async () => {
      await router.push('/preschool/reports')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'breadcrumb.preschool': 'Preschool',
                'preschoolReportsCenterPage.pageTitle': 'Reports',
              }
              return translations[key] || key
            },
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should have clickable Preschool link in hub breadcrumb', async () => {
      await router.push('/preschool/reports')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'breadcrumb.preschool': 'Preschool',
                'preschoolReportsCenterPage.pageTitle': 'Reports',
              }
              return translations[key] || key
            },
          },
        },
      })

      const links = wrapper.findAllComponents(RouterLink)
      const preschoolLink = links.find((link) => link.props('to').name === 'dashboard-preschool-admin')
      expect(preschoolLink).toBeDefined()
    })
  })

  describe('Student Summary Report Breadcrumb', () => {
    it('should display breadcrumb for student summary report', async () => {
      await router.push('/preschool/reports/student-summary')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'preschoolReportsCenterPage.pageTitle': 'Reports',
                'breadcrumb.studentReports': 'Student Summary',
              }
              return translations[key] || key
            },
          },
        },
      })

      const text = wrapper.text()
      expect(text).toContain('Reports')
      expect(text).toContain('Student Summary')
    })

    it('should have clickable Reports link in student summary breadcrumb', async () => {
      await router.push('/preschool/reports/student-summary')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'preschoolReportsCenterPage.pageTitle': 'Reports',
                'breadcrumb.studentReports': 'Student Summary',
              }
              return translations[key] || key
            },
          },
        },
      })

      const links = wrapper.findAllComponents(RouterLink)
      const reportsLink = links.find((link) => link.props('to').name === 'dashboard-preschool-admin-reports')
      expect(reportsLink).toBeDefined()
    })

    it('should have non-clickable current page (Student Summary)', async () => {
      await router.push('/preschool/reports/student-summary')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'preschoolReportsCenterPage.pageTitle': 'Reports',
                'breadcrumb.studentReports': 'Student Summary',
              }
              return translations[key] || key
            },
          },
        },
      })

      const spans = wrapper.findAll('span')
      const currentPageSpan = spans.find((span) => span.attributes('aria-current') === 'page')
      expect(currentPageSpan).toBeDefined()
      expect(currentPageSpan?.text()).toContain('Student Summary')
    })
  })

  describe('Attendance Report Breadcrumb', () => {
    it('should display breadcrumb for attendance report', async () => {
      await router.push('/preschool/reports/attendance')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'preschoolReportsCenterPage.pageTitle': 'Reports',
                'preschoolReportsCenterPage.sections.attendance.title': 'Attendance Reports',
              }
              return translations[key] || key
            },
          },
        },
      })

      const text = wrapper.text()
      expect(text).toContain('Reports')
    })

    it('should have clickable Reports link in attendance breadcrumb', async () => {
      await router.push('/preschool/reports/attendance')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'preschoolReportsCenterPage.pageTitle': 'Reports',
                'preschoolReportsCenterPage.sections.attendance.title': 'Attendance Reports',
              }
              return translations[key] || key
            },
          },
        },
      })

      const links = wrapper.findAllComponents(RouterLink)
      const reportsLink = links.find((link) => link.props('to').name === 'dashboard-preschool-admin-reports')
      expect(reportsLink).toBeDefined()
    })
  })

  describe('Assessment Report Breadcrumb', () => {
    it('should display breadcrumb for assessment report', async () => {
      await router.push('/preschool/reports/assessments')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'preschoolReportsCenterPage.pageTitle': 'Reports',
                'preschoolReportsCenterPage.sections.assessments.title': 'Assessment Reports',
              }
              return translations[key] || key
            },
          },
        },
      })

      const text = wrapper.text()
      expect(text).toContain('Reports')
    })

    it('should have clickable Reports link in assessment breadcrumb', async () => {
      await router.push('/preschool/reports/assessments')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'preschoolReportsCenterPage.pageTitle': 'Reports',
                'preschoolReportsCenterPage.sections.assessments.title': 'Assessment Reports',
              }
              return translations[key] || key
            },
          },
        },
      })

      const links = wrapper.findAllComponents(RouterLink)
      const reportsLink = links.find((link) => link.props('to').name === 'dashboard-preschool-admin-reports')
      expect(reportsLink).toBeDefined()
    })
  })

  describe('Breadcrumb Accessibility', () => {
    it('should have proper ARIA labels for current page', async () => {
      await router.push('/preschool/reports/student-summary')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'preschoolReportsCenterPage.pageTitle': 'Reports',
                'breadcrumb.studentReports': 'Student Summary',
              }
              return translations[key] || key
            },
          },
        },
      })

      const currentPage = wrapper.find('[aria-current="page"]')
      expect(currentPage.exists()).toBe(true)
    })

    it('should have proper navigation landmark', async () => {
      await router.push('/preschool/reports')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'breadcrumb.preschool': 'Preschool',
                'preschoolReportsCenterPage.pageTitle': 'Reports',
              }
              return translations[key] || key
            },
          },
        },
      })

      const nav = wrapper.find('nav')
      expect(nav.attributes('aria-label')).toBe('Breadcrumb')
    })
  })

  describe('Breadcrumb Separators', () => {
    it('should display separators between breadcrumb items', async () => {
      await router.push('/preschool/reports/student-summary')

      const wrapper = mount(Breadcrumb, {
        global: {
          plugins: [router],
          components: { RouterLink },
          mocks: {
            t: (key) => {
              const translations = {
                'preschoolReportsCenterPage.pageTitle': 'Reports',
                'breadcrumb.studentReports': 'Student Summary',
              }
              return translations[key] || key
            },
          },
        },
      })

      const separators = wrapper.findAll('.breadcrumb__sep')
      expect(separators.length).toBeGreaterThan(0)
    })
  })
})
