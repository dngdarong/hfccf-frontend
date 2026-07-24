import { describe, expect, it } from 'vitest'
import mainSidebar from '@/data/sidebar/main.json'
import sportSidebar from '@/data/sidebar/sport.json'
import {
  resolvePreschoolSidebarIconComponent,
  resolveSidebarNavigationIconComponent,
  sidebarIconByName,
} from '@/components/navigation/sidebarIcons'
import {
  IconCalendarTime,
  IconClipboardCheck,
  IconClipboardList,
  IconFileCheck,
  IconFileDescription,
  IconHomeBolt,
  IconLayoutDashboard,
  IconPackage,
  IconScoreboard,
  IconShirtSport,
  IconTimelineEvent,
  IconTrophy,
  IconUserCheck,
  IconUserCog,
  IconUsersGroup,
  IconUsersPlus,
} from '@tabler/icons-vue'

const sportSection = sportSidebar.sections[0]
const mainSection = mainSidebar.sections[0]
const coachItemIds = [
  'sport-coach-dashboard',
  'sport-player-attendance',
  'sport-training-schedule',
  'sport-my-teams',
  'sport-team-roster',
  'sport-equipment',
  'sport-my-requests',
]

const expectedItemOrder = [
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
]

const expectedIconRefs = {
  'sport-dashboard': IconLayoutDashboard,
  'sport-attendance': IconClipboardCheck,
  'sport-coaches': IconUserCog,
  'sport-teams': IconUsersGroup,
  'sport-players': IconShirtSport,
  'sport-coach-team-assignments': IconUsersPlus,
  'sport-equipment': IconPackage,
  'sport-matches': IconScoreboard,
  'sport-tournaments': IconTrophy,
  'sport-pending-player-approvals': IconUserCheck,
  'sport-pending-match-approvals': IconFileCheck,
  'sport-player-lifecycle': IconTimelineEvent,
}

const expectedCoachIconRefs = {
  'sport-coach-dashboard': IconHomeBolt,
  'sport-player-attendance': IconClipboardCheck,
  'sport-training-schedule': IconCalendarTime,
  'sport-my-teams': IconUsersGroup,
  'sport-team-roster': IconClipboardList,
  'sport-equipment': IconPackage,
  'sport-my-requests': IconFileDescription,
}

const expectedMainSportAdminIconRefs = {
  'sport-coaches': IconUserCog,
  'sport-teams': IconUsersGroup,
  'sport-players': IconShirtSport,
  'sport-matches': IconScoreboard,
  'sport-tournaments': IconTrophy,
  'sport-training-schedule-admin': IconCalendarTime,
  'sport-coach-team-assignments': IconUsersPlus,
  'sport-pending-player-approvals': IconUserCheck,
  'sport-pending-match-approvals': IconFileCheck,
  'sport-player-lifecycle': IconTimelineEvent,
}

describe('sport sidebar icon family', () => {
  it('keeps the sport admin items in the expected order', () => {
    expect(sportSection.items.map((item) => item.id)).toEqual(expectedItemOrder)
  })

  it('removes redundant item-level admin badges from the sport section', () => {
    expect(sportSection.items.every((item) => !Object.prototype.hasOwnProperty.call(item, 'badgeKey'))).toBe(true)
  })

  it('removes redundant item-level staff badges from the coach sidebar items', () => {
    expect(mainSection.items.filter((item) => coachItemIds.includes(item.id))
      .every((item) => !Object.prototype.hasOwnProperty.call(item, 'badgeKey'))).toBe(true)
  })

  it('resolves a concrete component for every sport sidebar icon key', () => {
    sportSection.items.forEach((item) => {
      const resolved = resolveSidebarNavigationIconComponent(item)
      expect(resolved).toBe(expectedIconRefs[item.id])
      expect(sidebarIconByName[item.icon]).toBe(resolved)
      expect(resolved).not.toBeNull()
    })
  })

  it('resolves the sport admin items in the main sidebar to the standardized Tabler icons', () => {
    const sportAdminItems = mainSection.items.filter((item) => Object.prototype.hasOwnProperty.call(expectedMainSportAdminIconRefs, item.id))

    expect(sportAdminItems.map((item) => item.id)).toEqual([
      'sport-coaches',
      'sport-teams',
      'sport-players',
      'sport-matches',
      'sport-tournaments',
      'sport-training-schedule-admin',
      'sport-coach-team-assignments',
      'sport-pending-player-approvals',
      'sport-pending-match-approvals',
      'sport-player-lifecycle',
    ])

    sportAdminItems.forEach((item) => {
      const resolved = resolveSidebarNavigationIconComponent(item)
      expect(resolved).toBe(expectedMainSportAdminIconRefs[item.id])
      expect(sidebarIconByName[item.icon]).toBe(resolved)
      expect(resolved).not.toBeNull()
    })
  })

  it('keeps the approval and relationship icons distinct', () => {
    expect(sidebarIconByName['sport-player-approval']).not.toBe(sidebarIconByName['sport-match-approval'])
    expect(sidebarIconByName['sport-coach']).not.toBe(sidebarIconByName['sport-team'])
    expect(sidebarIconByName['sport-coach']).not.toBe(sidebarIconByName['sport-players'])
    expect(sidebarIconByName['sport-team']).not.toBe(sidebarIconByName['sport-players'])
    expect(sidebarIconByName['sport-assignment']).not.toBe(sidebarIconByName['sport-player-approval'])
  })

  it('resolves Coach workspace items to dedicated operational icons', () => {
    const coachItems = mainSection.items.filter((item) => coachItemIds.includes(item.id))

    expect(coachItems.map((item) => item.id)).toEqual(coachItemIds)

    coachItems.forEach((item) => {
      const resolved = resolveSidebarNavigationIconComponent(item)
      expect(resolved).toBe(expectedCoachIconRefs[item.id])
      expect(sidebarIconByName[item.icon]).toBe(resolved)
      expect(resolved).not.toBeNull()
    })
  })

  it('keeps explicit Sport Tabler icons ahead of the dashboard fallback heuristic', () => {
    expect(
      resolveSidebarNavigationIconComponent({
        id: 'sport-teams',
        routeName: 'dashboard-sport-admin-teams',
        labelKey: 'nav.items.teams',
        icon: 'sport-team',
      }),
    ).toBe(IconUsersGroup)

    expect(
      resolveSidebarNavigationIconComponent({
        id: 'sport-pending-match-approvals',
        routeName: 'dashboard-sport-admin-pending-match-approvals',
        labelKey: 'nav.items.pendingMatchApprovals',
        icon: 'sport-match-approval',
      }),
    ).toBe(IconFileCheck)
  })

  it('still allows the preschool heuristic to act as a fallback for unkeyed items', () => {
    expect(
      resolvePreschoolSidebarIconComponent({
        id: 'dashboard-preschool-admin-unknown',
        routeName: 'dashboard-preschool-admin-unknown',
        labelKey: 'nav.items.unknown',
      }),
    ).toBe(IconLayoutDashboard)
  })

  it('keeps Coach operations visually distinct from Sport Admin approvals and assignments', () => {
    expect(sidebarIconByName['sport-coach-dashboard']).not.toBe(sidebarIconByName['sport-dashboard'])
    expect(sidebarIconByName['sport-coach-training']).not.toBe(sidebarIconByName['sport-match-approval'])
    expect(sidebarIconByName['sport-coach-roster']).not.toBe(sidebarIconByName['sport-player'])
    expect(sidebarIconByName['sport-coach-requests']).not.toBe(sidebarIconByName['sport-player-approval'])
    expect(sidebarIconByName['sport-coach-requests']).not.toBe(sidebarIconByName['sport-match-approval'])
    expect(sidebarIconByName['sport-coach-requests']).not.toBe(sidebarIconByName['sport-assignment'])
  })
})
