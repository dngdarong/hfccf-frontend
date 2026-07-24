import { describe, expect, it } from 'vitest'
import {
  calculateLiveSessionsCount,
  filterSessions,
  getFilterOptions,
  getPaginatedSessions,
  normalize,
} from '@/modules/sport/admin/pages/list/TrainingSchedule/utils/trainingScheduleHelpers'

const sessions = [
  {
    id: 'train_001',
    title: 'Tactical Set Piece Drills',
    team: 'Victory Academy',
    venue: 'Training Ground A',
    focus: 'Defensive positioning',
    intensity: 'high',
    status: 'scheduled',
  },
  {
    id: 'train_002',
    title: 'Conditioning & Endurance',
    team: 'HFCCF Juniors',
    venue: 'Main Stadium',
    focus: 'Aerobic capacity',
    intensity: 'medium',
    status: 'live',
  },
  {
    id: 'train_003',
    title: 'Recovery & Stretching',
    team: 'Victory Academy',
    venue: 'Academy Court',
    focus: 'Flexibility work',
    intensity: 'low',
    status: 'completed',
  },
]

describe('trainingScheduleHelpers', () => {
  it('normalizes text values', () => {
    expect(normalize('  Live  ')).toBe('live')
    expect(normalize(null)).toBe('')
  })

  it('filters sessions by query and selected filters', () => {
    expect(filterSessions(sessions, 'academy', '', '', '')).toHaveLength(2)
    expect(filterSessions(sessions, '', 'high', '', '')).toEqual([sessions[0]])
    expect(filterSessions(sessions, '', '', 'live', '')).toEqual([sessions[1]])
    expect(filterSessions(sessions, '', '', '', 'victory academy')).toHaveLength(2)
  })

  it('returns stable filter options from session data', () => {
    expect(getFilterOptions(sessions, 'team')).toEqual(['HFCCF Juniors', 'Victory Academy'])
    expect(getFilterOptions(sessions, 'intensity')).toEqual(['high', 'low', 'medium'])
    expect(getFilterOptions(sessions, 'status')).toEqual(['completed', 'live', 'scheduled'])
  })

  it('paginates and counts active live sessions', () => {
    expect(getPaginatedSessions(sessions, 1, 2)).toEqual([sessions[0], sessions[1]])
    expect(getPaginatedSessions(sessions, 2, 2)).toEqual([sessions[2]])
    expect(calculateLiveSessionsCount(sessions)).toBe(1)
  })
})
