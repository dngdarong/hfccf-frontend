import { describe, expect, it } from 'vitest'
import enSport from '@/i18n/en/sport'
import khSport from '@/i18n/kh/sport'

describe('sport player lifecycle locale parity', () => {
  const paths = [
    'sportPlayerLifecycle.coachRoster.title',
    'sportPlayerLifecycle.coachRoster.subtitle',
    'sportPlayerLifecycle.coachRoster.panelTitle',
    'sportPlayerLifecycle.coachRoster.summary',
    'sportPlayerLifecycle.adminLifecycle.title',
    'sportPlayerLifecycle.adminLifecycle.subtitle',
    'sportPlayerLifecycle.adminLifecycle.panelTitle',
    'sportPlayerLifecycle.common.selectTeam',
    'sportPlayerLifecycle.common.selectPlayer',
    'sportPlayerLifecycle.common.player',
    'sportPlayerLifecycle.common.team',
    'sportPlayerLifecycle.common.jersey',
    'sportPlayerLifecycle.common.position',
    'sportPlayerLifecycle.common.approval',
    'sportPlayerLifecycle.common.rosterStatus',
    'sportPlayerLifecycle.common.membershipStatus',
    'sportPlayerLifecycle.common.notes',
    'sportPlayerLifecycle.common.actions',
    'sportPlayerLifecycle.statuses.active',
    'sportPlayerLifecycle.statuses.injured',
    'sportPlayerLifecycle.statuses.suspended',
    'sportPlayerLifecycle.statuses.inactive',
    'sportPlayerLifecycle.statuses.released',
    'sportPlayerLifecycle.statuses.graduated',
    'sportPlayerLifecycle.statuses.archived',
    'sportPlayerLifecycle.approvals.pending',
    'sportPlayerLifecycle.approvals.approved',
    'sportPlayerLifecycle.approvals.rejected',
    'sportPlayerLifecycle.filters.status',
    'sportPlayerLifecycle.filters.approval',
    'sportPlayerLifecycle.filters.allStatuses',
    'sportPlayerLifecycle.filters.allApprovals',
    'sportPlayerLifecycle.actions.addToRoster',
    'sportPlayerLifecycle.actions.history',
    'sportPlayerLifecycle.actions.active',
    'sportPlayerLifecycle.actions.injured',
    'sportPlayerLifecycle.actions.suspended',
    'sportPlayerLifecycle.actions.released',
    'sportPlayerLifecycle.actions.archive',
    'sportPlayerLifecycle.history.title',
    'sportPlayerLifecycle.history.player',
    'sportPlayerLifecycle.history.joinedAt',
    'sportPlayerLifecycle.history.leftAt',
    'sportPlayerLifecycle.membership.active',
    'sportPlayerLifecycle.membership.inactive',
    'sportPlayerLifecycle.eligibility.title',
    'sportPlayerLifecycle.eligibility.rosterLocked',
    'sportPlayerLifecycle.eligibility.activeMembership',
    'sportPlayerLifecycle.eligibility.approvalRequired',
    'sportPlayerLifecycle.confirmations.archive',
    'sportPlayerLifecycle.confirmations.release',
    'sportPlayerLifecycle.confirmations.injured',
    'sportPlayerLifecycle.confirmations.suspended',
    'sportPlayerLifecycle.feedback.updated',
    'sportPlayerLifecycle.feedback.rosterUpdated',
    'sportPlayerLifecycle.feedback.historyLoaded',
    'sportPlayerLifecycle.statusNotes.coachChange',
    'sportPlayerLifecycle.statusNotes.adminChange',
  ]

  function resolvePath(source, path) {
    return path.split('.').reduce((accumulator, segment) => accumulator?.[segment], source)
  }

  it('contains matching translation keys in en and kh', () => {
    for (const path of paths) {
      expect(typeof resolvePath(enSport, path)).toBe('string')
      expect(typeof resolvePath(khSport, path)).toBe('string')
    }
  })
})
