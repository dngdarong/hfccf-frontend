<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'NotificationTypeIcon',
})

const props = defineProps({
  type: {
    type: String,
    default: 'system',
  },
  size: {
    type: String,
    default: 'md',
  },
})

const iconClass = computed(() => {
  const value = String(props.type || 'system').trim().toLowerCase()

  if (value === 'success') return 'pi pi-check-circle'
  if (value === 'warning') return 'pi pi-exclamation-triangle'
  if (value === 'error') return 'pi pi-times-circle'
  if (value === 'info') return 'pi pi-info-circle'

  return 'pi pi-bell'
})

const toneClass = computed(() => {
  const value = String(props.type || 'system').trim().toLowerCase()

  if (value === 'success') return 'notification-type-icon--success'
  if (value === 'warning') return 'notification-type-icon--warning'
  if (value === 'error') return 'notification-type-icon--error'
  if (value === 'info') return 'notification-type-icon--info'

  return 'notification-type-icon--system'
})
</script>

<template>
  <span
    class="notification-type-icon"
    :class="[toneClass, `notification-type-icon--${size}`]"
    aria-hidden="true"
  >
    <i :class="iconClass" />
  </span>
</template>

<style scoped>
.notification-type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9999px;
}

.notification-type-icon--sm {
  width: 2rem;
  height: 2rem;
  font-size: 0.9rem;
}

.notification-type-icon--md {
  width: 2.4rem;
  height: 2.4rem;
  font-size: 1rem;
}

.notification-type-icon--lg {
  width: 2.8rem;
  height: 2.8rem;
  font-size: 1.05rem;
}

.notification-type-icon--system {
  background: #eff6ff;
  color: #1d4ed8;
}

.notification-type-icon--info {
  background: #ecfeff;
  color: #0f766e;
}

.notification-type-icon--success {
  background: #ecfdf5;
  color: #15803d;
}

.notification-type-icon--warning {
  background: #fffbeb;
  color: #d97706;
}

.notification-type-icon--error {
  background: #fff1f2;
  color: #be123c;
}
</style>
