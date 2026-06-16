<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'NotificationErrorState',
})

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  retryLabel: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['retry'])
const { t } = useLanguage()

const resolvedTitle = computed(() => props.title || t('common.notifications.error'))
const resolvedDescription = computed(() => props.description || t('common.notifications.errorDescription'))
const resolvedRetryLabel = computed(() => props.retryLabel || t('common.notifications.retry'))
</script>

<template>
  <div class="notification-error-state">
    <div class="notification-error-state__copy">
      <h3 class="notification-error-state__title">
        {{ resolvedTitle }}
      </h3>

      <p class="notification-error-state__description">
        {{ resolvedDescription }}
      </p>
    </div>

    <Button
      type="button"
      severity="secondary"
      outlined
      :loading="loading"
      @click="emit('retry')"
    >
      {{ resolvedRetryLabel }}
    </Button>
  </div>
</template>

<style scoped>
.notification-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding: 1.5rem;
  text-align: center;
}

.notification-error-state__copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 28rem;
}

.notification-error-state__title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.notification-error-state__description {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}
</style>
