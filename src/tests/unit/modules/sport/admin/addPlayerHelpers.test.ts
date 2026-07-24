import { describe, expect, it } from 'vitest'
import {
  ALLOWED_PROFILE_IMAGE_TYPES,
} from '@/modules/sport/admin/pages/forms/AddPlayer/constants/addPlayerConstants'
import {
  getFormPayload,
  getRegistrationStatusLabel,
  initializeFormFromPlayer,
  validate,
} from '@/modules/sport/admin/pages/forms/AddPlayer/utils/addPlayerHelpers'

const messages: Record<string, string> = {
  'sportAddPlayer.validation.nameRequired': 'name required',
  'sportAddPlayer.validation.teamRequired': 'team required',
  'sportAddPlayer.validation.divisionRequired': 'division required',
  'sportAddPlayer.validation.statusRequired': 'status required',
  'sportAddPlayer.validation.statsInvalid': 'stats invalid',
  'sportAddPlayer.validation.goalsTooHigh': 'goals too high',
  'sportAddPlayer.sportsProfileStatus.registrationStatusOptions.registered': 'Registered',
  'sportAddPlayer.sportsProfileStatus.registrationStatusOptions.pending': 'Pending',
  'sportAddPlayer.sportsProfileStatus.registrationStatusOptions.unregistered': 'Unregistered',
}

function t(key: string) {
  return messages[key] || key
}

function te(key: string) {
  return key in messages
}

describe('addPlayerHelpers', () => {
  it('keeps image validation aligned with the backend supported types', () => {
    expect(ALLOWED_PROFILE_IMAGE_TYPES).toEqual(['image/jpeg', 'image/png', 'image/webp'])
    expect(ALLOWED_PROFILE_IMAGE_TYPES).not.toContain('image/gif')
  })

  it('localizes registration status labels from the add-player namespace', () => {
    expect(getRegistrationStatusLabel('registered', t, te)).toBe('Registered')
    expect(getRegistrationStatusLabel('pending', t, te)).toBe('Pending')
    expect(getRegistrationStatusLabel('unregistered', t, te)).toBe('Unregistered')
    expect(getRegistrationStatusLabel('custom-value', t, te)).toBe('custom-value')
  })

  it('builds and hydrates the canonical player payload', () => {
    const payload = getFormPayload({
      name: 'Sok Dara',
      phone: '+855 12 300 300',
      gender: 'male',
      team: 'Lions FC',
      division: 'Senior',
      jerseyNumber: 10,
      age: 18,
      status: 'active',
      matchesPlayed: 12,
      goalsScored: 4,
      profileImage: null,
      heightCm: 172,
      weightKg: 63,
      preferredFoot: 'Right',
      bloodType: 'O',
      village: 'Phum 1',
      commune: 'Commune 2',
      district: 'District 3',
      province: 'Province 4',
      currentSchool: 'HFCCF High School',
      gradeYear: 'Grade 12',
      primaryPosition: 'Forward',
      registrationStatus: 'registered',
    })

    expect(payload).toMatchObject({
      name: 'Sok Dara',
      team: 'Lions FC',
      division: 'Senior',
      jerseyNumber: 10,
      age: 18,
      matchesPlayed: 12,
      goalsScored: 4,
      heightCm: 172,
      weightKg: 63,
      preferredFoot: 'Right',
      bloodType: 'O',
      primaryPosition: 'Forward',
      registrationStatus: 'registered',
    })

    const form: Record<string, any> = {
      name: '',
      phone: '',
      gender: '',
      team: '',
      division: '',
      jerseyNumber: null,
      age: null,
      status: '',
      matchesPlayed: 0,
      goalsScored: 0,
      heightCm: null,
      weightKg: null,
      preferredFoot: '',
      bloodType: '',
      village: '',
      commune: '',
      district: '',
      province: '',
      currentSchool: '',
      gradeYear: '',
      primaryPosition: '',
      registrationStatus: '',
    }

    initializeFormFromPlayer(
      {
        name: 'Sok Dara',
        phone: '+855 12 300 300',
        gender: 'male',
        team: 'Lions FC',
        division: 'Senior',
        jerseyNumber: 10,
        age: 18,
        status: 'active',
        matchesPlayed: 12,
        goalsScored: 4,
        heightCm: 172,
        weightKg: 63,
        preferredFoot: 'Right',
        bloodType: 'O',
        village: 'Phum 1',
        commune: 'Commune 2',
        district: 'District 3',
        province: 'Province 4',
        currentSchool: 'HFCCF High School',
        gradeYear: 'Grade 12',
        primaryPosition: 'Forward',
        registrationStatus: 'registered',
      },
      form,
    )

    expect(form).toMatchObject({
      name: 'Sok Dara',
      team: 'Lions FC',
      division: 'Senior',
      jerseyNumber: 10,
      age: 18,
      status: 'active',
      matchesPlayed: 12,
      goalsScored: 4,
      heightCm: 172,
      weightKg: 63,
      preferredFoot: 'Right',
      bloodType: 'O',
      primaryPosition: 'Forward',
      registrationStatus: 'registered',
    })
  })

  it('keeps the frontend validation rules intact', () => {
    expect(
      validate(
        {
          name: 'Sok Dara',
          team: 'Lions FC',
          division: 'Senior',
          status: 'active',
          matchesPlayed: 3,
          goalsScored: 2,
        },
        t,
      ),
    ).toBe('')

    expect(
      validate(
        {
          name: '',
          team: 'Lions FC',
          division: 'Senior',
          status: 'active',
          matchesPlayed: 3,
          goalsScored: 2,
        },
        t,
      ),
    ).toBe('name required')
  })
})
