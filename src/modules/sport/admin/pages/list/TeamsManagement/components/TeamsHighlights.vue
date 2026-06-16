<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="teams-highlights">
    <div v-for="item in items" :key="item.label" class="teams-highlight">
      <span class="teams-highlight-label">{{ item.label }}</span>
      <strong class="teams-highlight-value">{{ item.value }}</strong>
    </div>
  </div>
</template>

<style scoped>
.teams-highlights {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.teams-highlight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.82);
}

.teams-highlight-label {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
}

.teams-highlight-value {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 800;
}

:deep(.teams-management-page--kh) .teams-highlight-label {
  font-size: 0.92rem;
  line-height: 1.65;
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}
</style>
