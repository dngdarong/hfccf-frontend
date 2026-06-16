import { describe, expect, it } from 'vitest'
import attendanceEn from '@/i18n/en/sport/attendance'
import attendanceKh from '@/i18n/kh/sport/attendance'

describe('sport attendance locale parity', () => {
  it('exposes the main attendance keys in both locales', () => {
    expect(attendanceEn.sportAttendanceStatus.present).toBeTruthy()
    expect(attendanceKh.sportAttendanceStatus.present).toBeTruthy()
    expect(attendanceEn.sportAttendanceType.player).toBeTruthy()
    expect(attendanceKh.sportAttendanceType.coach).toBeTruthy()
    expect(attendanceEn.sportAttendanceHubPage.cards.players.title).toBeTruthy()
    expect(attendanceKh.sportAttendanceHubPage.cards.history.description).toBeTruthy()
    expect(attendanceEn.sportAdminPlayerAttendancePage.actions.save).toBeTruthy()
    expect(attendanceKh.sportAdminCoachAttendancePage.messages.saved).toBeTruthy()
    expect(attendanceEn.sportAdminAttendanceHistoryPage.actions.apply).toBeTruthy()
    expect(attendanceKh.sportAdminAttendanceHistoryPage.messages.noRecords).toBeTruthy()
  })
})
