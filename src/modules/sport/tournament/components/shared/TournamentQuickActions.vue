<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentQuickActions',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  actions: {
    type: Array,
    default: () => [],
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['action'])
const { t, te } = useLanguage()

function actionLabel(action) {
  if (!action) return ''

  if (action.label) return action.label

  return te(action.labelKey) ? t(action.labelKey) : String(action.key || '')
}

function actionDescription(action) {
  if (!action?.descriptionKey) return ''
  return te(action.descriptionKey) ? t(action.descriptionKey) : ''
}

function actionTone(action) {
  const tone = String(action?.tone || 'info').trim().toLowerCase()

  if (tone === 'success') return 'success'
  if (tone === 'warning') return 'warning'
  if (tone === 'neutral') return 'secondary'

  return 'info'
}
</script>

<template>
  <section class="tournament-actions">
    <div class="tournament-actions__head">
      <div>
        <p v-if="title" class="tournament-actions__eyebrow">{{ title }}</p>
        <p v-if="subtitle" class="tournament-actions__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div class="tournament-actions__grid" :class="{ 'tournament-actions__grid--compact': compact }">
      <article
        v-for="action in actions"
        :key="action.key"
        class="tournament-actions__card"
        :class="{ 'tournament-actions__card--disabled': action.disabled }"
      >
        <div class="tournament-actions__copy">
          <h4 class="tournament-actions__title">{{ actionLabel(action) }}</h4>
          <p v-if="actionDescription(action)" class="tournament-actions__text">
            {{ actionDescription(action) }}
          </p>
        </div>

        <Button
          type="button"
          class="w-full"
          :severity="actionTone(action)"
          :label="actionLabel(action)"
          :disabled="action.disabled"
          @click="emit('action', action)"
        />
      </article>
    </div>
  </section>
</template>

<style scoped>
.tournament-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #dce6f2;
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at top left, rgba(0, 174, 239, 0.08), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.tournament-actions__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.tournament-actions__eyebrow {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.tournament-actions__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.tournament-actions__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.tournament-actions__grid--compact {
  grid-template-columns: 1fr;
}

.tournament-actions__card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #dce6f2;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.96);
}

.tournament-actions__card--disabled {
  opacity: 0.72;
}

.tournament-actions__copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.tournament-actions__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.98rem;
  line-height: 1.35;
  font-weight: 800;
}

.tournament-actions__text {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .tournament-actions {
    padding: 1rem;
  }

  .tournament-actions__grid {
    grid-template-columns: 1fr;
  }
}
</style>

