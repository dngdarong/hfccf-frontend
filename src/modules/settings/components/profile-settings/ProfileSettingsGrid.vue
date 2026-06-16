<script setup>
import ProfileSettingsCard from '@/modules/settings/components/profile-settings/ProfileSettingsCard.vue'

defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Number,
    default: 3,
  },
})
</script>

<template>
  <div
    class="profile-settings-grid"
    :style="{ '--profile-settings-columns': `repeat(${columns}, minmax(0, 1fr))` }"
  >
    <ProfileSettingsCard
      v-for="section in sections"
      :key="section.title"
      :section="section"
    />
  </div>
</template>

<style scoped>
.profile-settings-grid {
  display: grid;
  gap: 1rem;
  align-items: start;
  grid-template-columns: var(--profile-settings-columns, repeat(3, minmax(0, 1fr)));
}

@media (max-width: 1000px) {
  .profile-settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
