<script setup>
/**
 * PlayerInfoToolbar Component
 * Displays the page section title, summary, and a spotlight metric (like active rate).
 */
import { defineProps } from 'vue'

defineProps({
  /** Eyebrow text above the title */
  eyebrow: {
    type: String,
    required: true,
  },
  /** Main summary title */
  title: {
    type: String,
    required: true,
  },
  /** Descriptive text showing visible range */
  text: {
    type: String,
    required: true,
  },
  /** Label for the spotlight metric */
  spotlightLabel: {
    type: String,
    required: true,
  },
  /** Value for the spotlight metric */
  spotlightValue: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="player-info-toolbar">
    <div class="player-info-toolbar__copy">
      <p class="player-info-toolbar__eyebrow">{{ eyebrow }}</p>
      <h2 class="player-info-toolbar__title">{{ title }}</h2>
      <p class="player-info-toolbar__text">{{ text }}</p>
    </div>

    <div class="player-info-toolbar__actions">
      <div class="player-info-toolbar__spotlight">
        <span class="player-info-toolbar__spotlight-label">{{ spotlightLabel }}</span>
        <strong class="player-info-toolbar__spotlight-value">{{ spotlightValue }}</strong>
      </div>
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style scoped>
.player-info-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.player-info-toolbar__copy {
  min-width: 0;
}

.player-info-toolbar__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.player-info-toolbar__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.4rem;
  line-height: 1.2;
  font-weight: 800;
}

.player-info-toolbar__text {
  margin: 0.45rem 0 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.player-info-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.player-info-toolbar__spotlight {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(14, 116, 144, 0.16);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(255, 255, 255, 0.94) 100%);
}

.player-info-toolbar__spotlight-label {
  color: #0f6f8f;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.player-info-toolbar__spotlight-value {
  color: #0f172a;
  font-size: 1.3rem;
  line-height: 1;
  font-weight: 800;
}

@media (max-width: 640px) {
  .player-info-toolbar__title {
    font-size: 1.2rem;
  }
}
</style>
