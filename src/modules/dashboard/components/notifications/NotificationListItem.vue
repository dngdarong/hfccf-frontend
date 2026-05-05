<script setup>
import { computed } from 'vue'

defineEmits(['delete', 'mark-read'])

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  markReadLabel: {
    type: String,
    default: 'Mark Read',
  },
  deleteLabel: {
    type: String,
    default: 'Delete',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  time: {
    type: String,
    default: '',
  },
  relativeTime: {
    type: String,
    default: '',
  },
})

const toneIcon = computed(() => {
  if (props.item.tone === 'danger') return 'pi pi-exclamation-triangle'
  if (props.item.tone === 'success') return 'pi pi-check-circle'
  return 'pi pi-info-circle'
})
</script>

<template>
  <div
    class="notification-list-item"
    :class="[
      `notification-list-item--${item.tone}`,
      { 'notification-list-item--read': item.read },
    ]"
  >
    <div class="notification-list-item__main">
      <span class="notification-list-item__icon" aria-hidden="true">
        <i :class="toneIcon" />
      </span>

      <div>
        <div class="notification-list-item__pill">{{ item.label }}</div>
        <p class="notification-list-item__title">{{ item.title }}</p>
        <p class="notification-list-item__detail">{{ item.detail }}</p>
        <p v-if="time" class="notification-list-item__time">
          <span>{{ time }}</span>
          <span v-if="relativeTime" class="notification-list-item__time-separator">•</span>
          <span v-if="relativeTime">{{ relativeTime }}</span>
        </p>
      </div>
    </div>

    <div class="notification-list-item__actions-wrap">
      <div class="notification-list-item__actions">
        <button
          type="button"
          class="notification-list-item__button notification-list-item__button--read"
          :disabled="item.read || loading"
          @click="$emit('mark-read', item)"
        >
          <i class="pi pi-check" aria-hidden="true" />
          <span>{{ markReadLabel }}</span>
        </button>

        <button
          type="button"
          class="notification-list-item__button notification-list-item__button--delete"
          :disabled="loading"
          @click="$emit('delete', item)"
        >
          <i class="pi pi-trash" aria-hidden="true" />
          <span>{{ deleteLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-list-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #e7eef6;
  background: white;
}

.notification-list-item--read {
  opacity: 0.72;
}

.notification-list-item--danger {
  border-left: 4px solid var(--hope-red);
}

.notification-list-item--info {
  border-left: 4px solid var(--hope-cyan);
}

.notification-list-item--success {
  border-left: 4px solid var(--hope-lime);
}

.notification-list-item__icon {
  width: 2.35rem;
  height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 0.8rem;
  background: #eef6fb;
  color: #0f6e96;
  font-size: 0.95rem;
}

.notification-list-item__main {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
}

.notification-list-item--danger .notification-list-item__icon {
  background: #fff1f2;
  color: #be123c;
}

.notification-list-item--info .notification-list-item__icon {
  background: #eff6ff;
  color: #1d4ed8;
}

.notification-list-item--success .notification-list-item__icon {
  background: #ecfdf5;
  color: #15803d;
}

.notification-list-item__pill {
  display: inline-flex;
  align-items: center;
  margin-bottom: 0.25rem;
  padding: 0.28rem 0.7rem;
  border-radius: 9999px;
  background: #eef6fb;
  color: #0f6e96;
  font-size: 0.7rem;
  font-weight: 800;
  text-align: center;
}

.notification-list-item__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #122f43;
}

.notification-list-item__detail {
  margin: 0.25rem 0 0;
  font-size: 0.86rem;
  line-height: 1.6;
  color: #64748b;
}

.notification-list-item__time {
  margin: 0.35rem 0 0;
  color: #0f6e96;
  font-size: 0.75rem;
  font-weight: 700;
}

.notification-list-item__time-separator {
  margin-inline: 0.35rem;
  color: #94a3b8;
}

.notification-list-item__actions-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.notification-list-item__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification-list-item__button {
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 9999px;
  padding: 0.45rem 0.75rem;
  font-size: 0.74rem;
  font-weight: 800;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.notification-list-item__button--read {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}

.notification-list-item__button--read:hover:not(:disabled) {
  border-color: #93c5fd;
  background: #dbeafe;
}

.notification-list-item__button--read:disabled {
  cursor: not-allowed;
  border-color: #d1fae5;
  background: #ecfdf5;
  color: #15803d;
}

.notification-list-item__button--delete {
  border: 1px solid #fecdd3;
  background: #fff1f2;
  color: #be123c;
}

.notification-list-item__button--delete:hover {
  border-color: #fda4af;
  background: #ffe4e6;
}

.notification-list-item__button:disabled {
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .notification-list-item {
    flex-direction: column;
    gap: 1rem;
  }

  .notification-list-item__pill {
    min-width: 0;
  }

  .notification-list-item__icon {
    width: 2.2rem;
    height: 2.2rem;
  }

  .notification-list-item__main,
  .notification-list-item__actions-wrap,
  .notification-list-item__actions {
    width: 100%;
  }

  .notification-list-item__main {
    gap: 0.9rem;
  }

  .notification-list-item__button {
    flex: 1;
  }
}
</style>
