import { describe, expect, it } from 'vitest'
import enCommon from '@/i18n/en/common'
import enDashboardNav from '@/i18n/en/dashboard/nav'
import attendanceEn from '@/i18n/en/sport/attendance'
import khCommon from '@/i18n/kh/common'
import khDashboardNav from '@/i18n/kh/dashboard/nav'
import attendanceKh from '@/i18n/kh/sport/attendance'

describe('sport attendance locale parity', () => {
  it('exposes the main attendance keys in both locales', () => {
    expect(attendanceEn.sportAttendanceStatus.present).toBeTruthy()
    expect(attendanceKh.sportAttendanceStatus.present).toBeTruthy()
    expect(attendanceEn.sportAttendanceHubPage.cards.players.title).toBeTruthy()
    expect(attendanceKh.sportAttendanceHubPage.cards.history.description).toBeTruthy()
    expect(enDashboardNav.items.attendance).toBe('Attendance')
    expect(khDashboardNav.items.attendance).toBe('វត្តមាន')
    expect(attendanceEn.sportAdminPlayerAttendancePage.actions.save).toBeTruthy()
    expect(attendanceEn.sportCoachPlayerAttendancePage.title).toBeTruthy()
    expect(attendanceKh.sportCoachPlayerAttendancePage.title).toBeTruthy()
    expect(attendanceEn.sportCoachPlayerAttendancePage.messages.noTeams).toBeTruthy()
    expect(attendanceKh.sportCoachPlayerAttendancePage.messages.noTeams).toBeTruthy()
    expect(attendanceEn.sportAdminAttendanceHistoryPage.actions.apply).toBeTruthy()
    expect(attendanceKh.sportAdminAttendanceHistoryPage.messages.noRecords).toBeTruthy()
    expect(enCommon.today).toBe('Today')
    expect(khCommon.today).toBe('ថ្ងៃនេះ')
    expect(enCommon.loading).toBe('Loading')
    expect(khCommon.loading).toBe('កំពុងផ្ទុក')
    expect(enCommon.table.number).toBe('No.')
    expect(khCommon.table.number).toBe('ល.រ')
    expect(attendanceKh.sportAttendanceShared.playersEyebrow).toBe('កីឡាករ')
    expect(attendanceKh.sportAttendanceShared.progress).toBe('វឌ្ឍនភាព')
    expect(attendanceKh.sportAttendanceShared.historyEyebrow).toBe('ប្រវត្តិវត្តមាន')
    expect(attendanceEn.sportAttendanceHubPage.cards.coaches).toBeUndefined()
    expect(attendanceKh.sportAttendanceHubPage.cards.coaches).toBeUndefined()
    expect(attendanceEn.sportAdminCoachAttendancePage).toBeUndefined()
    expect(attendanceKh.sportAdminCoachAttendancePage).toBeUndefined()
    expect(attendanceEn.sportAttendanceShared.coachesEyebrow).toBeUndefined()
    expect(attendanceKh.sportAttendanceShared.coachesEyebrow).toBeUndefined()
  })
})
