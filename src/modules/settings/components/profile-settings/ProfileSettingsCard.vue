<script setup>
defineProps({
  section: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article class="profile-settings-card">
    <h3 class="profile-settings-card__title">{{ section.title }}</h3>
    <p class="profile-settings-card__copy">{{ section.copy }}</p>
  </article>
</template>

<style scoped>
.profile-settings-card {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.05);
}

.profile-settings-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #122f43;
}

.profile-settings-card__copy {
  margin: 0.55rem 0 0;
  font-size: 0.9rem;
  line-height: 1.65;
  color: #64748b;
}
</style>
