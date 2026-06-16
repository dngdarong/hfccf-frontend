import { describe, expect, it } from 'vitest'
import dashboardEn from '@/i18n/en/sport/dashboard'
import dashboardKh from '@/i18n/kh/sport/dashboard'

const bannerKeys = ['badge', 'title', 'subtitle', 'location', 'status', 'action']

describe('sport admin dashboard locale parity', () => {
  it('exposes tournament banner keys in both locales', () => {
    bannerKeys.forEach((key) => {
      expect(dashboardEn.sportAdminDashboard.tournamentBanner).toHaveProperty(key)
      expect(dashboardKh.sportAdminDashboard.tournamentBanner).toHaveProperty(key)
      expect(typeof dashboardEn.sportAdminDashboard.tournamentBanner[key]).toBe('string')
      expect(typeof dashboardKh.sportAdminDashboard.tournamentBanner[key]).toBe('string')
    })
  })
})
