<script setup>
defineOptions({
  name: 'DashboardInsightCard',
})

defineProps({
  card: {
    type: Object,
    required: true,
  },
})

const sparklineWidth = 100
const sparklineHeight = 28
const sparklinePadding = 3

function normalizeSparkline(points = []) {
  const values = (Array.isArray(points) ? points : [])
    .map(point => Number(point?.value))
    .filter(value => Number.isFinite(value))

  if (values.length < 2) {
    return []
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const span = sparklineWidth - (sparklinePadding * 2)
  const step = span / (values.length - 1)

  return values.map((value, index) => ({
    x: sparklinePadding + (step * index),
    y: sparklinePadding + ((1 - ((value - min) / range)) * (sparklineHeight - (sparklinePadding * 2))),
  }))
}

function sparklinePath(points = []) {
  const normalized = normalizeSparkline(points)
  if (normalized.length < 2) {
    return ''
  }

  return normalized
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
}
</script>

<template>
  <article class="preschool-dashboard-page__insight-card">
    <div class="preschool-dashboard-page__insight-topline">
      <p class="preschool-dashboard-page__insight-title">{{ card.title }}</p>
      <div v-if="card.sparkline.length > 0" class="preschool-dashboard-page__sparkline" aria-hidden="true">
        <svg
          class="preschool-dashboard-page__sparkline-svg"
          :viewBox="`0 0 ${sparklineWidth} ${sparklineHeight}`"
          preserveAspectRatio="none"
        >
          <path
            class="preschool-dashboard-page__sparkline-path"
            :d="sparklinePath(card.sparkline)"
            fill="none"
          />
        </svg>
      </div>
      <p v-else class="preschool-dashboard-page__sparkline-fallback">{{ card.sparklineFallback }}</p>
    </div>
    <p class="preschool-dashboard-page__insight-value">{{ card.value }}</p>
    <p class="preschool-dashboard-page__insight-label">{{ card.label }}</p>
    <p class="preschool-dashboard-page__insight-note">{{ card.note }}</p>
    <ul class="preschool-dashboard-page__insight-list">
      <li v-for="metric in card.metrics" :key="metric.label">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </li>
    </ul>
  </article>
</template>
