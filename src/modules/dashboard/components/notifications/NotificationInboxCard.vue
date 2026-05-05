<script setup>
import Loading from '@/components/feedback/Loading.vue'
import NotificationListItem from '@/modules/dashboard/components/notifications/NotificationListItem.vue'

defineEmits(['clear-all', 'delete-notification', 'mark-notification-read'])

defineProps({
  eyebrow: {
    type: String,
    required: true,
  },
  notifications: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: 'No notifications to show.',
  },
  markReadLabel: {
    type: String,
    default: 'Mark Read',
  },
  deleteLabel: {
    type: String,
    default: 'Delete',
  },
  clearAllLabel: {
    type: String,
    default: 'Clear All',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingLabel: {
    type: String,
    default: 'Loading',
  },
})
</script>

<template>
  <article class="notification-inbox-card">
    <header class="notification-inbox-card__header">
      <p class="notification-inbox-card__eyebrow">{{ eyebrow }}</p>

      <button
        v-if="notifications.length"
        type="button"
        class="notification-inbox-card__clear"
        :disabled="loading"
        @click="$emit('clear-all')"
      >
        <i class="pi pi-trash" aria-hidden="true" />
        <span>{{ clearAllLabel }}</span>
      </button>
    </header>

    <div class="notification-inbox-card__list">
      <NotificationListItem
        v-for="item in notifications"
        :key="item.title"
        :item="item"
        :delete-label="deleteLabel"
        :mark-read-label="markReadLabel"
        :loading="loading"
        @delete="$emit('delete-notification', $event)"
        @mark-read="$emit('mark-notification-read', $event)"
      />

      <div v-if="loading" class="notification-inbox-card__loading">
        <Loading :label="loadingLabel" size="sm" />
      </div>

      <div v-else-if="!notifications.length" class="notification-inbox-card__empty">
        {{ emptyText }}
      </div>
    </div>
  </article>
</template>

<style scoped>
.notification-inbox-card {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.05);
}

.notification-inbox-card__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hope-cyan);
}

.notification-inbox-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.notification-inbox-card__clear {
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 1px solid #fecdd3;
  border-radius: 9999px;
  padding: 0.45rem 0.75rem;
  background: #fff1f2;
  color: #be123c;
  font-size: 0.74rem;
  font-weight: 800;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;
}

.notification-inbox-card__clear:hover {
  border-color: #fda4af;
  background: #ffe4e6;
}

.notification-inbox-card__clear:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.notification-inbox-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.notification-inbox-card__loading {
  border: 1px dashed #dbe4ea;
  border-radius: 1rem;
  padding: 1.25rem;
  background: #fafcfd;
}

.notification-inbox-card__empty {
  border: 1px dashed #dbe4ea;
  border-radius: 1rem;
  padding: 1.25rem;
  background: #fafcfd;
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 640px) {
  .notification-inbox-card__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .notification-inbox-card__clear {
    width: 100%;
  }
}
</style>
