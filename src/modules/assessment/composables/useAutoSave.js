import { ref, onUnmounted } from 'vue'

export function useAutoSave(saveFn, { debounceMs = 2000 } = {}) {
  const lastSavedAt = ref(null)
  const isSaving = ref(false)
  let timer = null

  function scheduleAutoSave() {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      isSaving.value = true
      try {
        await saveFn()
        lastSavedAt.value = new Date()
      } finally {
        isSaving.value = false
      }
    }, debounceMs)
  }

  function cancelAutoSave() {
    clearTimeout(timer)
  }

  onUnmounted(() => clearTimeout(timer))

  return { lastSavedAt, isSaving, scheduleAutoSave, cancelAutoSave }
}
