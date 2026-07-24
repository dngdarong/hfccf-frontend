import { describe, expect, it } from 'vitest'
import {
  getFormPayload,
  initializeFormFromTeam,
  validateForm,
} from '@/modules/sport/admin/pages/forms/AddTeam/utils/addTeamHelpers'

const messages: Record<string, string> = {
  'sportAddTeam.validation.nameRequired': 'name required',
  'sportAddTeam.validation.nameTooLong': 'name too long',
  'sportAddTeam.validation.divisionTooLong': 'division too long',
  'sportAddTeam.validation.coachTooLong': 'coach too long',
  'sportAddTeam.validation.captainTooLong': 'captain too long',
  'sportAddTeam.validation.venueTooLong': 'venue too long',
  'sportAddTeam.validation.statusRequired': 'status required',
  'sportAddTeam.validation.recordInvalid': 'record invalid',
  'sportAddTeam.validation.loadFailed': 'load failed',
  'sportAddTeam.validation.rosterUpdateFailed': 'roster update failed',
  'sportAddTeam.validation.playerAlreadyAssigned': 'player already assigned',
}

function t(key: string) {
  return messages[key] || key
}

describe('addTeamHelpers', () => {
  it('accepts the backend-aligned minimal team form', () => {
    const result = validateForm(
      {
        name: 'Phoenix FC',
        division: '',
        coach: '',
        coachDisplayName: '',
        captain: '',
        matches: 0,
        venue: '',
        status: 'active',
        wins: 0,
        draws: 0,
        losses: 0,
      },
      t,
    )

    expect(result).toBe('')
  })

  it('rejects invalid lengths and negative record values', () => {
    expect(
      validateForm(
        {
          name: 'A'.repeat(192),
          division: '',
          coach: '',
          coachDisplayName: '',
          captain: '',
          matches: 0,
          venue: '',
          status: 'active',
          wins: 0,
          draws: 0,
          losses: 0,
        },
        t,
      ),
    ).toBe('name too long')

    expect(
      validateForm(
        {
          name: 'Phoenix FC',
          division: '',
          coach: '',
          coachDisplayName: '',
          captain: '',
          matches: -1,
          venue: '',
          status: 'active',
          wins: 0,
          draws: 0,
          losses: 0,
        },
        t,
      ),
    ).toBe('record invalid')
  })

  it('builds canonical payload keys from selected division and coach', () => {
    const payload = getFormPayload(
      {
        name: 'Phoenix FC',
        division: 'Senior',
        coach: 'usr_200',
        coachDisplayName: 'Coach Dara',
        captain: 'Captain One',
        matches: 6,
        venue: 'Main Stadium',
        status: 'active',
        wins: 4,
        draws: 1,
        losses: 1,
        logo: null,
        selectedPlayers: [{ id: 1 }, { id: 2 }],
      },
      {
        selectedCoach: { id: 'usr_200', fullName: 'Coach Dara' },
        selectedDivision: { id: 8, name: 'Senior' },
        selectedPlayerIds: [1, 2],
      },
    )

    expect(payload).toMatchObject({
      name: 'Phoenix FC',
      division: 'Senior',
      division_id: 8,
      coach_user_id: 'usr_200',
      coach_display_name: 'Coach Dara',
      captain_name: 'Captain One',
      players_count: 2,
      player_ids: [1, 2],
      matches_count: 6,
      venue: 'Main Stadium',
      status: 'active',
      wins: 4,
      draws: 1,
      losses: 1,
    })
  })

  it('initializes the form from the canonical team object', () => {
    const form = {
      name: '',
      division: '',
      coach: '',
      coachDisplayName: '',
      captain: '',
      matches: 0,
      venue: '',
      status: '',
      wins: 0,
      draws: 0,
      losses: 0,
      logo: null,
    }

    initializeFormFromTeam(
      {
        name: 'Phoenix FC',
        division: 'Senior',
        coachUserId: 'usr_200',
        coachDisplayName: 'Coach Dara',
        captainName: 'Captain One',
        playersCount: 18,
        matchesCount: 6,
        venue: 'Main Stadium',
        status: 'suspended',
        wins: 4,
        draws: 1,
        losses: 1,
      },
      form,
      ['active', 'pending', 'inactive', 'suspended'],
      [{ label: 'Senior', value: 'Senior' }],
      [{ label: 'Coach Dara', value: 'usr_200' }],
    )

    expect(form).toMatchObject({
      name: 'Phoenix FC',
      division: 'Senior',
      coach: 'usr_200',
      coachDisplayName: 'Coach Dara',
      captain: 'Captain One',
      matches: 6,
      venue: 'Main Stadium',
      status: 'suspended',
      wins: 4,
      draws: 1,
      losses: 1,
    })
  })
})
