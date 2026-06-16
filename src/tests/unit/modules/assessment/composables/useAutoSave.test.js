import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useAutoSave } from '@/modules/assessment/composables/useAutoSave'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useAutoSave', () => {
  it('does not call saveFn immediately on scheduleAutoSave', () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const { scheduleAutoSave } = useAutoSave(saveFn, { debounceMs: 500 })
    scheduleAutoSave()
    expect(saveFn).not.toHaveBeenCalled()
  })

  it('calls saveFn after debounce delay', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const { scheduleAutoSave, lastSavedAt } = useAutoSave(saveFn, { debounceMs: 500 })
    scheduleAutoSave()
    vi.advanceTimersByTime(500)
    await Promise.resolve()
    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(lastSavedAt.value).toBeInstanceOf(Date)
  })

  it('debounces: only calls saveFn once if scheduled multiple times', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const { scheduleAutoSave } = useAutoSave(saveFn, { debounceMs: 500 })
    scheduleAutoSave()
    scheduleAutoSave()
    scheduleAutoSave()
    vi.advanceTimersByTime(500)
    await Promise.resolve()
    expect(saveFn).toHaveBeenCalledTimes(1)
  })

  it('cancelAutoSave prevents saveFn from being called', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const { scheduleAutoSave, cancelAutoSave } = useAutoSave(saveFn, { debounceMs: 500 })
    scheduleAutoSave()
    cancelAutoSave()
    vi.advanceTimersByTime(500)
    await Promise.resolve()
    expect(saveFn).not.toHaveBeenCalled()
  })

  it('sets isSaving to true during save and false after', async () => {
    let resolveSave
    const saveFn = vi.fn().mockReturnValue(new Promise((r) => { resolveSave = r }))
    const { scheduleAutoSave, isSaving } = useAutoSave(saveFn, { debounceMs: 100 })
    scheduleAutoSave()
    vi.advanceTimersByTime(100)
    await Promise.resolve()
    expect(isSaving.value).toBe(true)
    resolveSave()
    await Promise.resolve()
    await Promise.resolve()
    expect(isSaving.value).toBe(false)
  })
})
