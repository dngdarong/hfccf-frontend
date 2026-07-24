import { describe, expect, it } from 'vitest'
import {
  buildScheduleSessionIndex,
  getScheduleSessionActionKey,
  getScheduleSessionStatusTone,
  normalizeScheduleSessionStatus,
  resolveScheduleSession,
} from '@/modules/preschool/shared/components/schedule/scheduleSessionOverlay'

describe('scheduleSessionOverlay', () => {
  it('normalizes status and action mapping', () => {
    expect(normalizeScheduleSessionStatus('OPEN')).toBe('open')
    expect(getScheduleSessionStatusTone('scheduled')).toBe('info')
    expect(getScheduleSessionActionKey('scheduled')).toBe('openSession')
    expect(getScheduleSessionActionKey('completed')).toBe('viewSession')
  })

  it('resolves sessions by schedule id and class/date fallback', () => {
    const index = buildScheduleSessionIndex([
      { id: 's1', scheduleId: 'schedule-1', classId: 'class-1', attendanceDate: '2026-07-01' },
      { id: 's2', classId: 'class-2', attendanceDate: '2026-07-01' },
    ])

    expect(resolveScheduleSession({ id: 'schedule-1' }, index, '2026-07-01')?.id).toBe('s1')
    expect(resolveScheduleSession({ classId: 'class-2' }, index, '2026-07-01')?.id).toBe('s2')
  })
})
