import { describe, it, expect } from 'vitest'
import router from '@/router'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import mainSidebar from '@/data/sidebar/main.json'
import sportSidebar from '@/data/sidebar/sport.json'
import {
  makeAdminSport,
  makeCoach,
} from '../../helpers/factories'

const t = (key) => ({
  'nav.items.attendance': 'Attendance',
  'nav.items.trainingSchedule': 'Training Schedule',
  'nav.items.myTeams': 'My Teams',
  'nav.items.teamRoster': 'Team Roster',
  'nav.items.equipment': 'Equipment',
  'nav.items.myRequests': 'My Requests',
  'nav.dashboard': 'Dashboard',
}[key] || key)

const sidebarConfig = {
  sections: [...mainSidebar.sections, ...sportSidebar.sections],
}

function getResolvedRoutes(user) {
  return buildSidebarSections({ config: sidebarConfig, router, user, t })
}

describe('sidebar route targets', () => {
  it('exposes the sport admin sidebar section for adminsport', () => {
    const sections = getResolvedRoutes(makeAdminSport())
    const sportSection = sections.find((section) => section.id === 'sport')

    expect(sportSection).toBeDefined()
    expect(sportSection.items.map((item) => item.id)).toEqual(expect.arrayContaining([
      'sport-dashboard',
      'sport-attendance',
      'sport-coaches',
      'sport-teams',
      'sport-players',
      'sport-coach-team-assignments',
      'sport-equipment',
      'sport-matches',
      'sport-tournaments',
      'sport-pending-player-approvals',
      'sport-pending-match-approvals',
      'sport-player-lifecycle',
    ]))
  })

  it('does not expose the sport admin sidebar section for coach', () => {
    const sections = getResolvedRoutes(makeCoach())
    const sportSection = sections.find((section) => section.id === 'sport')

    expect(sportSection).toBeUndefined()
  })

  it('does not expose parametric sidebar routes for sport admin', () => {
    const sections = getResolvedRoutes(makeAdminSport())
    const routePaths = sections.flatMap((section) => section.items.map((item) => item.routePath))
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))

    expect(routePaths.every((path) => !path.includes(':'))).toBe(true)
    expect(routeNames).not.toContain('dashboard-sport-admin-match-squad-review')
  })

  it('does not expose parametric sidebar routes for sport coach', () => {
    const sections = getResolvedRoutes(makeCoach())
    const routePaths = sections.flatMap((section) => section.items.map((item) => item.routePath))
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))

    expect(routePaths.every((path) => !path.includes(':'))).toBe(true)
    expect(routeNames).not.toContain('dashboard-sport-coach-match-squad-selection')
  })

  it('exposes the coach sidebar with player attendance and keeps the admin attendance hub hidden', () => {
    const sections = getResolvedRoutes(makeCoach())
    const mainSection = sections.find((section) => section.id === 'main')

    expect(mainSection).toBeDefined()
    expect(mainSection.items.map((item) => item.id)).toEqual([
      'sport-coach-dashboard',
      'sport-player-attendance',
      'sport-training-schedule',
      'sport-my-teams',
      'sport-team-roster',
      'sport-equipment',
      'sport-my-requests',
    ])

    const attendanceItem = mainSection.items.find((item) => item.id === 'sport-player-attendance')
    const equipmentItem = mainSection.items.find((item) => item.id === 'sport-equipment')
    expect(attendanceItem.routeName).toBe('dashboard-sport-coach-attendance')
    expect(attendanceItem.routePath).toBe('/module/sport-coach/attendance')
    expect(attendanceItem.label).toBe('Attendance')
    expect(equipmentItem.routeName).toBe('dashboard-sport-coach-equipment')
    expect(equipmentItem.routePath).toBe('/module/sport-coach/equipment')
    expect(equipmentItem.label).toBe('Equipment')
    expect(mainSection.items.every((item) => !Object.prototype.hasOwnProperty.call(item, 'badgeKey'))).toBe(true)
    expect(mainSection.items.map((item) => item.routeName)).not.toContain('dashboard-sport-admin-attendance')
  })
})
