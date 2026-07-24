<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Tag from 'primevue/tag'
import NotificationTypeIcon from '@/modules/notifications/components/NotificationTypeIcon.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'NotificationItem',
})

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
  readLabel: {
    type: String,
    default: '',
  },
  dismissLabel: {
    type: String,
    default: '',
  },
  undismissLabel: {
    type: String,
    default: '',
  },
  compact: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  timeLabel: {
    type: String,
    default: '',
  },
  relativeTimeLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['read', 'dismiss', 'undismiss', 'click'])

const { t, te } = useLanguage()

function formatTime(dateValue) {
  if (!dateValue) return ''

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue)

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function resolveLabel(value, fallback) {
  const key = `notifications.modules.${String(value || 'global').trim().toLowerCase()}`
  return te(key) ? t(key) : fallback
}

const isRead = computed(() => Boolean(props.notification?.read))
const isDismissed = computed(() => Boolean(props.notification?.dismissed))
const typeLabel = computed(() => {
  const key = `notifications.types.${String(props.notification?.type || 'system').trim().toLowerCase()}`
  return te(key) ? t(key) : props.notification?.type || 'System'
})
const moduleLabel = computed(
  () => props.notification?.badgeLabel || resolveLabel(props.notification?.module, props.notification?.module || 'Global'),
)
const resolvedTimeLabel = computed(() => props.timeLabel || formatTime(props.notification?.createdAt || props.notification?.created_at))
const resolvedRelativeTimeLabel = computed(() => props.relativeTimeLabel || '')
const resolvedReadLabel = computed(() => props.readLabel || t('common.notifications.markRead'))
const resolvedDismissLabel = computed(() => props.dismissLabel || t('common.notifications.dismiss'))
const resolvedUndismissLabel = computed(() => props.undismissLabel || t('common.notifications.undismiss'))

function handleRead() {
  if (isRead.value) return
  emit('read', props.notification)
}

function handleDismiss() {
  emit('dismiss', props.notification)
}

function handleUndismiss() {
  emit('undismiss', props.notification)
}

function handleClick() {
  emit('click', props.notification)
}
</script>

<template>
  <article
    class="notification-item"
    :class="{
      'notification-item--read': isRead,
      'notification-item--dismissed': isDismissed,
      'notification-item--compact': compact,
      'notification-item--loading': loading,
    }"
    @click="handleClick"
  >
    <NotificationTypeIcon
      :type="notification.type"
      size="md"
    />

    <div class="notification-item__body">
      <div class="notification-item__meta">
        <Tag
          :value="typeLabel"
          class="notification-item__pill"
          severity="secondary"
          rounded
        />

        <Tag
          :value="moduleLabel"
          class="notification-item__pill notification-item__pill--module"
          severity="secondary"
          rounded
        />
      </div>

      <h3 class="notification-item__title">
        {{ notification.title }}
      </h3>

      <p class="notification-item__message">
        {{ notification.message }}
      </p>

      <p
        v-if="resolvedTimeLabel"
        class="notification-item__time"
      >
        {{ resolvedTimeLabel }}
        <span
          v-if="resolvedRelativeTimeLabel"
          class="notification-item__time-separator"
        >
          •
        </span>
        <span v-if="resolvedRelativeTimeLabel">{{ resolvedRelativeTimeLabel }}</span>
      </p>
    </div>

    <div
      v-if="showActions"
      class="notification-item__actions"
    >
      <Button
        type="button"
        severity="secondary"
        text
        size="small"
        :disabled="loading || isRead || isDismissed"
        @click.stop="handleRead"
      >
        {{ resolvedReadLabel }}
      </Button>

      <Button
        v-if="!isDismissed"
        type="button"
        severity="danger"
        text
        size="small"
        @click.stop="handleDismiss"
      >
        {{ resolvedDismissLabel }}
      </Button>

      <Button
        v-else
        type="button"
        severity="secondary"
        text
        size="small"
        @click.stop="handleUndismiss"
      >
        {{ resolvedUndismissLabel }}
      </Button>
    </div>
  </article>
</template>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 14px 28px -24px rgba(15, 23, 42, 0.2);
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.notification-item:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 18px 32px -26px rgba(15, 23, 42, 0.22);
}

.notification-item--read {
  opacity: 0.8;
}

.notification-item--dismissed {
  opacity: 0.55;
}

.notification-item--compact {
  padding: 0.85rem;
}

.notification-item--loading {
  pointer-events: none;
}

.notification-item__body {
  min-width: 0;
  flex: 1;
}

.notification-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.45rem;
}

.notification-item__pill {
  border: 1px solid #dbe4ea;
  background: #f8fafc;
  color: #475569;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.notification-item__pill--module {
  background: #eff6ff;
  color: #1d4ed8;
}

.notification-item__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.96rem;
  font-weight: 800;
  line-height: 1.35;
}

.notification-item__message {
  margin: 0.3rem 0 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.6;
}

.notification-item__time {
  margin: 0.42rem 0 0;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
}

.notification-item__time-separator {
  margin-inline: 0.35rem;
}

.notification-item__actions {
  display: inline-flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.35rem;
}

@media (max-width: 640px) {
  .notification-item {
    flex-direction: column;
  }

  .notification-item__actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>

