import { describe, expect, it } from 'vitest'
import {
  coachDisplayName,
  resolveAssignmentErrorMessage,
  teamDisplayName,
} from '@/modules/sport/admin/pages/approval/utils/coachTeamAssignmentsHelpers'

describe('coach team assignments helpers', () => {
  it('derives the coach display name from the loaded coach relation', () => {
    expect(
      coachDisplayName({
        coach: {
          firstName: 'Alex',
          lastName: 'Coach',
          username: 'Alex Coach',
          email: 'alex.coach@hfccf.org',
        },
      }),
    ).toBe('Alex Coach')
  })

  it('falls back to the team name from the loaded team relation', () => {
    expect(
      teamDisplayName({
        team: {
          name: 'Lions FC',
        },
      }),
    ).toBe('Lions FC')
  })

  it('maps assignment errors to the backend message or the shared fallback', () => {
    const t = (key) => (key === 'sportCoachTeamManagement.common.loadError' ? 'Unable to load data right now.' : key)

    expect(resolveAssignmentErrorMessage(new Error('Assignment failed'), t)).toBe('Assignment failed')
    expect(resolveAssignmentErrorMessage(null, t)).toBe('Unable to load data right now.')
  })
})
