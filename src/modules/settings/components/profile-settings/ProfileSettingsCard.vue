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
    <div class="profile-settings-card__header">
      <h3 class="profile-settings-card__title">{{ section.title }}</h3>
      <span
        v-if="section.tag"
        class="profile-settings-card__tag"
      >
        {{ section.tag }}
      </span>
    </div>

    <p class="profile-settings-card__copy">{{ section.copy }}</p>
  </article>
</template>

<style scoped>
.profile-settings-card {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1.15rem 1.2rem;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.95) 100%);
  box-shadow:
    0 16px 32px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.profile-settings-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.profile-settings-card__title {
  margin: 0;
  min-width: 0;
  flex: 1 1 auto;
  font-size: 1rem;
  font-weight: 800;
  color: #122f43;
}

.profile-settings-card__tag {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  border: 1px solid #dbeafe;
  border-radius: 9999px;
  background: #eff6ff;
  padding: 0.28rem 0.58rem;
  color: #1d4ed8;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.2;
  overflow-wrap: anywhere;
  text-transform: uppercase;
  text-align: right;
  white-space: normal;
}

.profile-settings-card__copy {
  margin: 0.55rem 0 0;
  font-size: 0.9rem;
  line-height: 1.65;
  color: #64748b;
  overflow-wrap: anywhere;
}
</style>
