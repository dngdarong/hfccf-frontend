import { describe, expect, it } from 'vitest'
import enSport from '@/i18n/en/sport'
import khSport from '@/i18n/kh/sport'
import enNav from '@/i18n/en/dashboard/nav'
import khNav from '@/i18n/kh/dashboard/nav'

const paths = [
  'sportMatchSquad.coach.title',
  'sportMatchSquad.coach.subtitle',
  'sportMatchSquad.coach.panelTitle',
  'sportMatchSquad.coach.summary',
  'sportMatchSquad.coach.noTeamSelected',
  'sportMatchSquad.coach.matchFallback',
  'sportMatchSquad.admin.title',
  'sportMatchSquad.admin.subtitle',
  'sportMatchSquad.admin.panelTitle',
  'sportMatchSquad.admin.summary',
  'sportMatchSquad.admin.matchFallback',
  'sportMatchSquad.common.selectTeam',
  'sportMatchSquad.common.match',
  'sportMatchSquad.common.team',
  'sportMatchSquad.common.player',
  'sportMatchSquad.common.eligibility',
  'sportMatchSquad.common.role',
  'sportMatchSquad.common.reason',
  'sportMatchSquad.common.notes',
  'sportMatchSquad.common.selectRole',
  'sportMatchSquad.common.noPosition',
  'sportMatchSquad.actions.saveDraft',
  'sportMatchSquad.actions.submitSquad',
  'sportMatchSquad.actions.approve',
  'sportMatchSquad.actions.lock',
  'sportMatchSquad.statuses.draft',
  'sportMatchSquad.statuses.submitted',
  'sportMatchSquad.statuses.approved',
  'sportMatchSquad.statuses.locked',
  'sportMatchSquad.roles.starter',
  'sportMatchSquad.roles.substitute',
  'sportMatchSquad.roles.reserve',
  'sportMatchSquad.roles.unavailable',
  'sportMatchSquad.eligibility.eligible',
  'sportMatchSquad.eligibility.pending',
  'sportMatchSquad.eligibility.injured',
  'sportMatchSquad.eligibility.suspended',
  'sportMatchSquad.eligibility.inactive',
  'sportMatchSquad.eligibility.released',
  'sportMatchSquad.eligibility.archived',
  'sportMatchSquad.eligibility.not_member',
  'sportMatchSquad.review.title',
  'sportMatchSquad.review.team',
  'sportMatchSquad.review.players',
  'sportMatchSquad.review.status',
  'sportMatchSquad.review.submittedAt',
  'sportMatchSquad.review.lockedAt',
  'sportMatchSquad.review.noTeam',
  'sportMatchSquad.sections.starters',
  'sportMatchSquad.sections.substitutes',
  'sportMatchSquad.sections.reserves',
  'sportMatchSquad.sections.unavailable',
  'sportMatchSquad.sections.emptyStarters',
  'sportMatchSquad.sections.emptySubstitutes',
  'sportMatchSquad.sections.emptyReserves',
  'sportMatchSquad.sections.emptyUnavailable',
  'sportMatchSquad.emptyPlayers',
  'sportMatchSquad.emptySection',
]

function resolvePath(source, path) {
  return path.split('.').reduce((accumulator, segment) => accumulator?.[segment], source)
}

describe('match squad locale parity', () => {
  it('contains matching translation keys in en and kh', () => {
    for (const path of paths) {
      expect(typeof resolvePath(enSport, path)).toBe('string')
      expect(typeof resolvePath(khSport, path)).toBe('string')
    }

    expect(typeof resolvePath(enNav, 'items.matchSquadSelection')).toBe('string')
    expect(typeof resolvePath(khNav, 'items.matchSquadSelection')).toBe('string')
    expect(typeof resolvePath(enNav, 'items.matchSquadReview')).toBe('string')
    expect(typeof resolvePath(khNav, 'items.matchSquadReview')).toBe('string')
  })
})
