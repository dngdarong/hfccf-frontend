<script setup>
import ProfileSettingsCard from '@/modules/settings/components/profile-settings/ProfileSettingsCard.vue'

defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="profile-settings-grid">
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 1000px) {
  .profile-settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
