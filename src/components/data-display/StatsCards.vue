<script setup>
import { computed } from 'vue'
import Loading from '@/components/feedback/Loading.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'DashboardStatsCards',
})

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})
const { t, te, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')

function toCardKey(value) {
  // Build safe i18n keys from API-provided card titles/labels.
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '_')
}

function translateCardText(type, card) {
  const explicitKey = type === 'title' ? card?.titleKey : card?.labelKey

  if (explicitKey && te(explicitKey)) {
    return t(explicitKey)
  }

  const rawValue = type === 'title' ? card?.title : card?.label
  const raw = String(rawValue ?? '').trim()
  if (!raw) return ''

  const key = `common.dashboardStats.cards.${toCardKey(raw)}.${type}`

  // Avoid missing-key warnings when cards already provide display text.
  return te(key) ? t(key) : raw
}

function accentClass(status) {
  const key = (status || 'info').toLowerCase()

  if (key === 'success') {
    return [
      'border-l-hope-lime',
      '[--stats-accent:var(--hope-lime)]',
      '[--stats-accent-weak:color-mix(in_srgb,var(--hope-lime)_15%,white)]',
      '[--stats-accent-border:color-mix(in_srgb,var(--hope-lime)_30%,white)]',
    ]
  }

  if (key === 'warning') {
    return [
      'border-l-hope-yellow',
      '[--stats-accent:var(--hope-yellow)]',
      '[--stats-accent-weak:color-mix(in_srgb,var(--hope-yellow)_18%,white)]',
      '[--stats-accent-border:color-mix(in_srgb,var(--hope-yellow)_30%,white)]',
    ]
  }

  if (key === 'error') {
    return [
      'border-l-hope-red',
      '[--stats-accent:var(--hope-red)]',
      '[--stats-accent-weak:color-mix(in_srgb,var(--hope-red)_15%,white)]',
      '[--stats-accent-border:color-mix(in_srgb,var(--hope-red)_30%,white)]',
    ]
  }

  return [
    'border-l-hope-cyan',
    '[--stats-accent:var(--hope-cyan)]',
    '[--stats-accent-weak:color-mix(in_srgb,var(--hope-cyan)_15%,white)]',
    '[--stats-accent-border:color-mix(in_srgb,var(--hope-cyan)_30%,white)]',
  ]
}

function icon(status) {
  // Keep icon selection deterministic by status bucket.
  const key = (status || 'info').toLowerCase()

  if (key === 'success') {
    return 'M5 13l4 4L19 7'
  }

  if (key === 'warning') {
    return 'M12 8v4m0 4h.01M10.3 3.86l-7.5 13a1 1 0 00.87 1.5h16.66a1 1 0 00.87-1.5l-7.5-13a1 1 0 00-1.74 0z'
  }

  if (key === 'error') {
    return 'M6 18L18 6M6 6l12 12'
  }

  return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}
</script>

<template>
  <section :class="isKh ? 'stats stats--kh' : 'stats'">
    <div
      v-if="loading"
      class="rounded-[0.9rem] border border-dashed border-surface-300 bg-sky-50/40 p-4 text-sm text-surface-600"
    >
      <Loading :label="t('common.dashboardStats.loading')" size="md" />
    </div>
    <div
      v-else-if="error"
      class="rounded-[0.9rem] border border-dashed border-hope-red/40 bg-red-50 p-4 text-sm text-rose-800"
    >
      {{ error }}
    </div>

    <!-- Render order: loading -> error -> cards/empty. -->
    <div v-else class="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3 max-sm:grid-cols-1 max-sm:gap-2.5">
      <article
        v-for="card in cards"
        :key="card.title"
        class="rounded-[0.95rem] border border-surface-200 border-l-4 bg-[linear-gradient(160deg,#ffffff_0%,#f7fbff_100%)] p-4 shadow-[0_12px_24px_rgba(4,52,80,0.05)] max-sm:rounded-[0.85rem] max-sm:p-[0.72rem]"
        :class="accentClass(card.status)"
      >
        <div class="flex items-center justify-between gap-2.5">
          <p
            class="m-0 text-[0.76rem] uppercase tracking-[0.06em] text-surface-500 max-sm:text-[0.7rem]"
            :class="isKh ? 'stats__kh-title' : ''"
          >
            {{ translateCardText('title', card) }}
          </p>
          <span
            class="inline-flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-[0.58rem] border text-[var(--stats-accent)] max-[420px]:h-[1.65rem] max-[420px]:w-[1.65rem] max-[420px]:rounded-[0.5rem]"
            :style="{
              background: 'var(--stats-accent-weak)',
              borderColor: 'var(--stats-accent-border)',
            }"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path :d="icon(card.status)" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
        <p class="mt-2.5 text-[1.75rem] leading-none font-extrabold text-[#122f43] max-sm:text-[1.5rem] max-[420px]:text-[1.34rem]">
          {{ card.value }}
        </p>
        <div class="mt-1.5 flex items-center justify-between gap-2">
          <p
            class="m-0 text-[0.78rem] text-surface-500 max-sm:text-[0.74rem] max-[420px]:text-[0.7rem]"
            :class="isKh ? 'stats__kh-meta' : ''"
          >
            {{ translateCardText('label', card) }}
          </p>
          <StatusBadge :status="card.status || 'info'" size="sm" />
        </div>
      </article>
      <article
        v-if="!cards.length"
        class="col-[1/-1] rounded-[0.9rem] border border-dashed border-surface-300 bg-sky-50/40 p-4 text-center text-sm text-surface-600 max-[420px]:p-[0.82rem] max-[420px]:text-[0.8rem]"
        :class="isKh ? 'stats__kh-copy' : ''"
      >
        {{ t('common.dashboardStats.empty') }}
      </article>
    </div>
  </section>
</template>

<style scoped>
.stats svg {
  width: 1.05rem;
  height: 1.05rem;
}

.stats--kh .stats__kh-title,
.stats--kh .stats__kh-meta,
.stats--kh .stats__kh-copy {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.stats--kh .stats__kh-title {
  text-transform: none;
  letter-spacing: 0.01em;
  font-size: 0.82rem;
}

.stats--kh .stats__kh-meta {
  font-size: 0.8rem;
}
</style>


