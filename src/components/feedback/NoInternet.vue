<script setup>
/**
 * NoInternetState
 * --------------------------------------------------------------------------
 * Reusable offline/online connection state component.
 *
 * Features:
 * - Detects browser online/offline events
 * - Supports fullscreen and inline modes
 * - Emits online/offline/retry events
 * - Can optionally show when online
 * - Accessible status message
 * --------------------------------------------------------------------------
 */

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'NoInternetState',
})

const props = defineProps({
  /**
   * When true, component shows while online instead of offline.
   */
  showWhenOnline: {
    type: Boolean,
    default: false,
  },

  /**
   * Render as a full-screen state.
   */
  fullscreen: {
    type: Boolean,
    default: false,
  },

  /**
   * Main title text.
   */
  title: {
    type: String,
    default: 'No Internet Connection',
  },

  /**
   * Supporting message text.
   */
  message: {
    type: String,
    default: 'Please check your network and try again.',
  },

  /**
   * Retry button text.
   */
  buttonText: {
    type: String,
    default: 'Try Again',
  },
})

const emit = defineEmits(['retry', 'online', 'offline'])

/**
 * Browser-safe initial connection state.
 */
const isOnline = ref(
  typeof navigator !== 'undefined'
    ? navigator.onLine
    : true,
)

/**
 * Controls whether the component should be visible.
 */
const shouldShow = computed(() =>
  props.showWhenOnline
    ? isOnline.value
    : !isOnline.value,
)

/**
 * Outer wrapper classes.
 */
const wrapperClass = computed(() => [
  'w-full',
  'p-4',
  props.fullscreen
    ? 'grid min-h-screen place-items-center bg-[var(--color-surface)]'
    : '',
])

/**
 * Sync local state with browser connection status.
 */
function syncConnectionStatus() {
  if (typeof navigator === 'undefined') return

  const next = navigator.onLine

  if (next === isOnline.value) return

  isOnline.value = next
  emit(next ? 'online' : 'offline')
}

/**
 * Retry button handler.
 */
function onRetry() {
  syncConnectionStatus()
  emit('retry', isOnline.value)
}

onMounted(() => {
  syncConnectionStatus()

  window.addEventListener('online', syncConnectionStatus)
  window.addEventListener('offline', syncConnectionStatus)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', syncConnectionStatus)
  window.removeEventListener('offline', syncConnectionStatus)
})
</script>

<template>
  <section
    v-if="shouldShow"
    :class="wrapperClass"
    role="status"
    aria-live="polite"
  >
    <div
      class="mx-auto max-w-[420px] rounded-2xl border border-rose-200 bg-white p-5 text-center shadow-[0_10px_24px_rgba(237,28,36,0.08)]"
    >
      <!-- Offline icon -->
      <div
        class="mx-auto mb-3 inline-grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-hope-red"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          class="h-6 w-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.53 16.11a6 6 0 016.95 0M5.76 13.34a10 10 0 0112.48 0M3 10.58a14 14 0 0118 0M1 1l22 22"
          />
        </svg>
      </div>

      <h3 class="m-0 text-lg font-extrabold text-surface-900">
        {{ title }}
      </h3>

      <p class="mb-4 mt-2 text-[0.92rem] text-surface-600">
        {{ message }}
      </p>

      <Button
        type="button"
        class="mt-2"
        block
        @click="onRetry"
      >
        {{ buttonText }}
      </Button>
    </div>
  </section>
</template>
