<script setup>
import Button from '@/components/buttons/Button.vue'

defineProps({
  eyebrow: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  rangeLabel: {
    type: String,
    required: true,
  },
  spotlightLabel: {
    type: String,
    required: true,
  },
  spotlightValue: {
    type: Number,
    required: true,
  },
  addButtonLabel: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['add-team'])

function handleAddTeam() {
  emit('add-team')
}
</script>

<template>
  <div class="teams-toolbar">
    <div class="teams-toolbar-copy">
      <p class="teams-eyebrow">{{ eyebrow }}</p>
      <h2 class="teams-toolbar-title">{{ summary }}</h2>
      <p class="teams-toolbar-text">{{ rangeLabel }}</p>
    </div>

    <div class="teams-toolbar-actions">
      <div class="teams-spotlight">
        <span class="teams-spotlight-label">{{ spotlightLabel }}</span>
        <strong class="teams-spotlight-value">{{ spotlightValue }}</strong>
      </div>

      <Button
        type="button"
        :label="addButtonLabel"
        icon="pi pi-plus"
        class="teams-add-button"
        @click="handleAddTeam"
      />
    </div>
  </div>
</template>

<style scoped>
.teams-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.teams-toolbar-copy {
  min-width: 0;
}

.teams-eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.teams-toolbar-title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.4rem;
  line-height: 1.2;
  font-weight: 800;
}

.teams-toolbar-text {
  margin: 0.45rem 0 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.teams-spotlight {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(14, 116, 144, 0.16);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(255, 255, 255, 0.94) 100%);
}

.teams-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.teams-add-button {
  min-height: 2.8rem;
  border-radius: 0.9rem;
  font-weight: 800;
}

.teams-spotlight-label {
  color: #0f6f8f;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.teams-spotlight-value {
  color: #0f172a;
  font-size: 1.3rem;
  line-height: 1;
  font-weight: 800;
}

:deep(.teams-management-page--kh) .teams-eyebrow,
:deep(.teams-management-page--kh) .teams-spotlight-label,
:deep(.teams-management-page--kh) .teams-toolbar-text {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

:deep(.teams-management-page--kh) .teams-eyebrow,
:deep(.teams-management-page--kh) .teams-spotlight-label {
  text-transform: none;
  letter-spacing: 0.01em;
}

:deep(.teams-management-page--kh) .teams-toolbar-text {
  font-size: 0.92rem;
  line-height: 1.65;
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

@media (max-width: 640px) {
  .teams-toolbar-title {
    font-size: 1.2rem;
  }
}
</style>
