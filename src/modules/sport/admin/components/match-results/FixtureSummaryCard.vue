<script setup>
/**
 * FixtureSummaryCard
 * Reusable sports fixture header for admin workflows that need compact match context.
 */
import Card from 'primevue/card'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'FixtureSummaryCard',
})

defineProps({
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  homeScore: {
    type: [Number, String],
    default: 0,
  },
  awayScore: {
    type: [Number, String],
    default: 0,
  },
  matchDate: {
    type: String,
    required: true,
  },
  matchTime: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  competition: {
    type: String,
    required: true,
  },
  showScore: {
    type: Boolean,
    default: true,
  },
})

const { t } = useLanguage()
</script>

<template>
  <Card class="fixture-summary-card">
    <template #content>
      <div class="grid gap-5">
        <div class="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <!-- Home Team (Right) -->
          <div class="min-w-0">
            <span class="fixture-summary-card__label">
              {{ t('sportMatchesManagement.resultsEntry.fixture.home') }}
            </span>
            <h3 class="mt-1 text-[1.15rem] leading-tight font-black break-words text-[#1D1D1B]">
              {{ homeTeam }}
            </h3>
          </div>

          <!-- Score Center -->
          <div class="flex flex-col items-center gap-1.5 md:justify-self-center">
            <div
              v-if="showScore"
              class="flex h-14 w-32 items-center justify-between rounded-2xl bg-slate-900 px-5 text-white shadow-[0_12px_24px_-10px_rgba(15,23,42,0.6)]"
            >
              <span class="w-8 text-center font-mono text-2xl font-black tracking-tighter">
                {{ Number(homeScore || 0) }}
              </span>
              <span class="flex h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-brand-400"></span>
              <span class="w-8 text-center font-mono text-2xl font-black tracking-tighter">
                {{ Number(awayScore || 0) }}
              </span>
            </div>
            <div
              v-else
              class="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-3 text-[0.82rem] font-black text-[#00AEEF]"
            >
              {{ t('sportMatchesManagement.resultsEntry.fixture.vs') }}
            </div>
            <span class="text-[0.62rem] font-bold tracking-[0.15em] uppercase text-slate-400">
              {{ t('sportMatchesManagement.resultsEntry.scorePreview') }}
            </span>
          </div>

          <!-- Away Team (Left) -->
          <div class="min-w-0 md:text-right">
            <span class="fixture-summary-card__label">
              {{ t('sportMatchesManagement.resultsEntry.fixture.away') }}
            </span>
            <h3 class="mt-1 text-[1.15rem] leading-tight font-black break-words text-[#1D1D1B]">
              {{ awayTeam }}
            </h3>
          </div>
        </div>

        <!-- Keep fixture metadata grouped so result-entry pages can scan match context quickly. -->
        <dl
          class="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2 xl:grid-cols-4"
          :aria-label="t('sportMatchesManagement.resultsEntry.fixture.details')"
        >
          <div class="min-w-0">
            <dt class="fixture-summary-card__label">
              {{ t('sportMatchesManagement.resultsEntry.fixture.date') }}
            </dt>
            <dd class="fixture-summary-card__value">{{ matchDate }}</dd>
          </div>
          <div class="min-w-0">
            <dt class="fixture-summary-card__label">
              {{ t('sportMatchesManagement.resultsEntry.fixture.time') }}
            </dt>
            <dd class="fixture-summary-card__value">{{ matchTime }}</dd>
          </div>
          <div class="min-w-0">
            <dt class="fixture-summary-card__label">
              {{ t('sportMatchesManagement.resultsEntry.fixture.venue') }}
            </dt>
            <dd class="fixture-summary-card__value">{{ venue }}</dd>
          </div>
          <div class="min-w-0">
            <dt class="fixture-summary-card__label">
              {{ t('sportMatchesManagement.resultsEntry.fixture.competition') }}
            </dt>
            <dd class="fixture-summary-card__value">{{ competition }}</dd>
          </div>
        </dl>
      </div>
    </template>
  </Card>
</template>

<style scoped>
:deep(.fixture-summary-card.p-card) {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #ffffff;
  box-shadow: 0 18px 40px -32px rgba(29, 29, 27, 0.32);
}

:deep(.fixture-summary-card .p-card-body),
:deep(.fixture-summary-card .p-card-content) {
  padding: 0;
}

:deep(.fixture-summary-card .p-card-content) {
  padding: 1.25rem;
}

.fixture-summary-card__label {
  display: block;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fixture-summary-card__value {
  margin: 0.3rem 0 0;
  color: #1d1d1b;
  font-size: 0.9rem;
  line-height: 1.35;
  font-weight: 700;
  overflow-wrap: anywhere;
}
</style>
