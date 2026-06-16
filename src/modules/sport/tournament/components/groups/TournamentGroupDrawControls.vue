<script setup>
import Button from 'primevue/button'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentGroupDrawControls',
})

defineProps({
  mode: {
    type: String,
    default: 'automatic',
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  canFinalize: {
    type: Boolean,
    default: false,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  issueCount: {
    type: Number,
    default: 0,
  },
  lastGeneratedAt: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:mode', 'preview', 'save', 'finalize', 'reset'])
const { t } = useLanguage()

function actionTone(key) {
  if (key === 'preview') return 'info'
  if (key === 'finalize') return 'success'
  if (key === 'reset') return 'warning'

  return 'secondary'
}

const actions = [
  {
    key: 'preview',
    titleKey: 'sportTournament.groups.actions.preview.title',
    descriptionKey: 'sportTournament.groups.actions.preview.description',
    labelKey: 'sportTournament.groups.actions.preview.button',
  },
  {
    key: 'save',
    titleKey: 'sportTournament.groups.actions.save.title',
    descriptionKey: 'sportTournament.groups.actions.save.description',
    labelKey: 'sportTournament.groups.actions.save.button',
  },
  {
    key: 'finalize',
    titleKey: 'sportTournament.groups.actions.finalize.title',
    descriptionKey: 'sportTournament.groups.actions.finalize.description',
    labelKey: 'sportTournament.groups.actions.finalize.button',
  },
  {
    key: 'reset',
    titleKey: 'sportTournament.groups.actions.reset.title',
    descriptionKey: 'sportTournament.groups.actions.reset.description',
    labelKey: 'sportTournament.groups.actions.reset.button',
  },
]

function actionLabel(key) {
  return t(key)
}
</script>

<template>
  <section class="group-controls">
    <div class="group-controls__head">
      <div>
        <p class="group-controls__eyebrow">{{ t('sportTournament.groups.actions.title') }}</p>
        <p class="group-controls__subtitle">{{ t('sportTournament.groups.actions.subtitle') }}</p>
      </div>
      <span v-if="locked" class="group-controls__locked">{{ t('sportTournament.groups.locked') }}</span>
    </div>

    <div class="group-controls__mode">
      <button
        type="button"
        class="group-controls__mode-button"
        :class="{ 'group-controls__mode-button--active': mode === 'automatic' }"
        :disabled="!canEdit || locked"
        @click="emit('update:mode', 'automatic')"
      >
        {{ t('sportTournament.groups.mode.automatic') }}
      </button>
      <button
        type="button"
        class="group-controls__mode-button"
        :class="{ 'group-controls__mode-button--active': mode === 'manual' }"
        :disabled="!canEdit || locked"
        @click="emit('update:mode', 'manual')"
      >
        {{ t('sportTournament.groups.mode.manual') }}
      </button>
    </div>

    <div class="group-controls__grid">
      <article
        v-for="action in actions"
        :key="action.key"
        class="group-controls__card"
        :class="{ 'group-controls__card--disabled': locked || !canEdit || (action.key === 'finalize' && !canFinalize) }"
      >
        <div class="group-controls__copy">
          <h4 class="group-controls__title">{{ actionLabel(action.titleKey) }}</h4>
          <p class="group-controls__text">{{ actionLabel(action.descriptionKey) }}</p>
          <small v-if="action.key === 'preview' && lastGeneratedAt" class="group-controls__meta">
            {{ t('sportTournament.groups.actions.lastGeneratedAt') }} {{ lastGeneratedAt }}
          </small>
          <small v-if="action.key === 'finalize'" class="group-controls__meta">
            {{ issueCount }} {{ t('sportTournament.groups.actions.issues') }}
          </small>
        </div>

        <Button
          type="button"
          class="w-full rounded-xl"
          :severity="actionTone(action.key)"
          :label="actionLabel(action.labelKey)"
          :disabled="locked || !canEdit || (action.key === 'finalize' && !canFinalize)"
          @click="emit(action.key)"
        />
      </article>
    </div>
  </section>
</template>

<style scoped>
.group-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.1rem;
  border: 1px solid #dce6f2;
  border-radius: 1.35rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.group-controls__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.group-controls__eyebrow {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.group-controls__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.group-controls__locked {
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: rgba(141, 198, 63, 0.14);
  color: #3f6212;
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.group-controls__mode {
  display: inline-flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.group-controls__mode-button {
  padding: 0.65rem 0.95rem;
  border-radius: 0.95rem;
  border: 1px solid #dce6f2;
  background: #ffffff;
  color: #0f172a;
  font-weight: 700;
}

.group-controls__mode-button--active {
  border-color: rgba(0, 174, 239, 0.35);
  background: rgba(0, 174, 239, 0.12);
  color: #0369a1;
}

.group-controls__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.group-controls__card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.group-controls__card--disabled {
  opacity: 0.72;
}

.group-controls__copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.group-controls__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.35;
  font-weight: 800;
}

.group-controls__text {
  margin: 0;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.6;
}

.group-controls__meta {
  color: #94a3b8;
  font-size: 0.76rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .group-controls__grid {
    grid-template-columns: 1fr;
  }

  .group-controls__head {
    flex-direction: column;
  }
}
</style>
