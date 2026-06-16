import { describe, expect, it } from 'vitest'
import { formatMatchEventMinute, sortMatchTimeline } from '@/modules/sport/tournament/services/sortMatchTimeline'

describe('sortMatchTimeline', () => {
  it('sorts events by minute, stoppage minute, createdAt, and order', () => {
    const events = [
      { id: 'c', minute: 45, stoppageMinute: 2, createdAt: '2026-05-01T10:00:02.000Z', order: 1 },
      { id: 'a', minute: 90, stoppageMinute: 0, createdAt: '2026-05-01T10:00:01.000Z', order: 0 },
      { id: 'b', minute: 45, stoppageMinute: 1, createdAt: '2026-05-01T10:00:01.000Z', order: 0 },
    ]

    const sorted = sortMatchTimeline(events)

    expect(sorted.map((event) => event.id)).toEqual(['b', 'c', 'a'])
  })

  it('formats stoppage time correctly', () => {
    expect(formatMatchEventMinute({ minute: 45, stoppageMinute: 2 })).toBe("45+2'")
    expect(formatMatchEventMinute({ minute: 0, stoppageMinute: 0 })).toBe("0'")
  })
})
