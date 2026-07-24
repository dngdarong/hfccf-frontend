<script setup>
import { computed, ref, watch } from 'vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentMediaField',
})

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  preview: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: 'image/jpeg,image/png,image/webp',
  },
})

const emit = defineEmits(['change', 'remove'])
const { t } = useLanguage()
const inputRef = ref(null)

const hasPreview = computed(() => Boolean(String(props.preview || '').trim()))
const actionLabel = computed(() =>
  hasPreview.value
    ? t('sportTournament.create.upload.replace')
    : t('sportTournament.create.upload.upload'),
)

function openPicker() {
  if (props.disabled) return
  inputRef.value?.click()
}

function onChange(event) {
  emit('change', event)
}

function onRemove() {
  if (props.disabled) return
  if (inputRef.value) {
    inputRef.value.value = ''
  }
  emit('remove')
}

watch(
  () => props.preview,
  (value) => {
    if (!value && inputRef.value) {
      inputRef.value.value = ''
    }
  },
)
</script>

<template>
  <div class="tournament-media-field">
    <div class="tournament-media-field__copy">
      <div>
        <h4 class="tournament-media-field__title">{{ title }}</h4>
        <p v-if="subtitle" class="tournament-media-field__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div class="tournament-media-field__preview-block">
      <div class="tournament-media-field__preview-head">
        <span>{{ t('sportTournament.create.upload.preview') }}</span>
      </div>

      <div
        class="tournament-media-field__preview"
        :class="{ 'tournament-media-field__preview--empty': !hasPreview }"
      >
      <img v-if="hasPreview" :src="preview" alt="" class="tournament-media-field__image">
      <div v-else class="tournament-media-field__placeholder">
        <span>{{ t('sportTournament.create.upload.placeholder') }}</span>
        <p>{{ t('sportTournament.create.upload.previewHint') }}</p>
      </div>
      </div>
    </div>

    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      class="hidden"
      @change="onChange"
    >

    <div class="tournament-media-field__actions">
      <Button
        type="button"
        severity="secondary"
        text
        rounded
        :label="actionLabel"
        :disabled="disabled"
        @click="openPicker"
      />

      <Button
        type="button"
        severity="danger"
        text
        rounded
        :label="t('sportTournament.create.upload.remove')"
        :disabled="disabled || !hasPreview"
        @click="onRemove"
      />
    </div>
  </div>
</template>

<style scoped>
.tournament-media-field {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-height: 100%;
  padding: 0.95rem;
  border-radius: 1.1rem;
  border: 1px solid #dbe7f3;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(247, 250, 253, 0.98) 100%);
  box-shadow: 0 16px 34px -32px rgba(15, 23, 42, 0.45);
}

.tournament-media-field__copy {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.tournament-media-field__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.tournament-media-field__subtitle {
  margin: 0.22rem 0 0;
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.45;
}

.tournament-media-field__preview-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tournament-media-field__preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tournament-media-field__preview {
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(236, 243, 251, 0.98) 100%);
}

.tournament-media-field__preview--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.tournament-media-field__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tournament-media-field__placeholder {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 16rem;
  text-align: center;
  color: #64748b;
}

.tournament-media-field__placeholder span {
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 800;
}

.tournament-media-field__placeholder p {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
}

.tournament-media-field__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.tournament-media-field__actions :deep(button) {
  width: 100%;
}

@media (max-width: 480px) {
  .tournament-media-field {
    padding: 0.85rem;
  }

  .tournament-media-field__actions {
    grid-template-columns: 1fr;
  }
}
</style>
