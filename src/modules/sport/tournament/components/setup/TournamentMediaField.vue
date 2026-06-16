<script setup>
import { computed, ref, watch } from 'vue'
import Button from 'primevue/button'
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

function openPicker() {
  if (props.disabled) return
  inputRef.value?.click()
}

function onChange(event) {
  emit('change', event)
}

function onRemove() {
  if (props.disabled) return
  inputRef.value.value = ''
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
      <h4 class="tournament-media-field__title">{{ title }}</h4>
      <p v-if="subtitle" class="tournament-media-field__subtitle">{{ subtitle }}</p>
    </div>

    <div class="tournament-media-field__preview" :class="{ 'tournament-media-field__preview--empty': !hasPreview }">
      <img v-if="hasPreview" :src="preview" alt="" class="tournament-media-field__image">
      <div v-else class="tournament-media-field__placeholder">
        <span>{{ t('sportTournament.create.upload.placeholder') }}</span>
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
        :label="t('sportTournament.create.upload.select')"
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

