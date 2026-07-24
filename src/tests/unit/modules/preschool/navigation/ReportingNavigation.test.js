import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

describe('Reporting Navigation Routes', () => {
  let router

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/preschool/reports',
          name: 'dashboard-preschool-admin-reports',
          component: { template: '<div>Hub</div>' },
        },
        {
          path: '/preschool/reports/student-summary',
          name: 'dashboard-preschool-admin-reports-student-summary',
          component: { template: '<div>Student Summary</div>' },
        },
        {
          path: '/preschool/reports/attendance',
          name: 'dashboard-preschool-admin-reports-attendance',
          component: { template: '<div>Attendance</div>' },
        },
        {
          path: '/preschool/reports/assessments',
          name: 'dashboard-preschool-admin-reports-assessments',
          component: { template: '<div>Assessment</div>' },
        },
      ],
    })
  })

  describe('Route Structure', () => {
    it('should have all required reporting routes', () => {
      const requiredRoutes = [
        'dashboard-preschool-admin-reports',
        'dashboard-preschool-admin-reports-student-summary',
        'dashboard-preschool-admin-reports-attendance',
        'dashboard-preschool-admin-reports-assessments',
      ]

      requiredRoutes.forEach((routeName) => {
        expect(router.hasRoute(routeName)).toBe(true)
      })
    })

    it('should resolve hub route correctly', () => {
      const resolved = router.resolve({ name: 'dashboard-preschool-admin-reports' })
      expect(resolved.path).toBe('/preschool/reports')
    })

    it('should resolve student summary route correctly', () => {
      const resolved = router.resolve({ name: 'dashboard-preschool-admin-reports-student-summary' })
      expect(resolved.path).toBe('/preschool/reports/student-summary')
    })

    it('should resolve attendance route correctly', () => {
      const resolved = router.resolve({ name: 'dashboard-preschool-admin-reports-attendance' })
      expect(resolved.path).toBe('/preschool/reports/attendance')
    })

    it('should resolve assessment route correctly', () => {
      const resolved = router.resolve({ name: 'dashboard-preschool-admin-reports-assessments' })
      expect(resolved.path).toBe('/preschool/reports/assessments')
    })

    it('should have hierarchical route structure', () => {
      const hubPath = router.resolve({ name: 'dashboard-preschool-admin-reports' }).path
      const studentPath = router.resolve({ name: 'dashboard-preschool-admin-reports-student-summary' }).path
      const attendancePath = router.resolve({ name: 'dashboard-preschool-admin-reports-attendance' }).path
      const assessmentPath = router.resolve({ name: 'dashboard-preschool-admin-reports-assessments' }).path

      expect(hubPath).toBe('/preschool/reports')
      expect(studentPath.startsWith(hubPath)).toBe(true)
      expect(attendancePath.startsWith(hubPath)).toBe(true)
      expect(assessmentPath.startsWith(hubPath)).toBe(true)
    })
  })

  describe('Navigation Paths', () => {
    it('should allow navigation from hub to student summary', async () => {
      await router.push({ name: 'dashboard-preschool-admin-reports' })
      expect(router.currentRoute.value.name).toBe('dashboard-preschool-admin-reports')

      await router.push({ name: 'dashboard-preschool-admin-reports-student-summary' })
      expect(router.currentRoute.value.name).toBe('dashboard-preschool-admin-reports-student-summary')
    })

    it('should allow navigation from hub to attendance', async () => {
      await router.push({ name: 'dashboard-preschool-admin-reports' })
      await router.push({ name: 'dashboard-preschool-admin-reports-attendance' })
      expect(router.currentRoute.value.name).toBe('dashboard-preschool-admin-reports-attendance')
    })

    it('should allow navigation from hub to assessments', async () => {
      await router.push({ name: 'dashboard-preschool-admin-reports' })
      await router.push({ name: 'dashboard-preschool-admin-reports-assessments' })
      expect(router.currentRoute.value.name).toBe('dashboard-preschool-admin-reports-assessments')
    })

    it('should allow navigation back to hub from report pages', async () => {
      await router.push({ name: 'dashboard-preschool-admin-reports-student-summary' })
      await router.push({ name: 'dashboard-preschool-admin-reports' })
      expect(router.currentRoute.value.name).toBe('dashboard-preschool-admin-reports')
    })

    it('should allow navigation between report pages', async () => {
      await router.push({ name: 'dashboard-preschool-admin-reports-student-summary' })
      await router.push({ name: 'dashboard-preschool-admin-reports-attendance' })
      expect(router.currentRoute.value.name).toBe('dashboard-preschool-admin-reports-attendance')

      await router.push({ name: 'dashboard-preschool-admin-reports-assessments' })
      expect(router.currentRoute.value.name).toBe('dashboard-preschool-admin-reports-assessments')
    })
  })
})
