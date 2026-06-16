<script setup>
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'PreschoolFormManagementHero',
})

defineProps({
  description: {
    type: String,
    required: true,
  },
  eyebrow: {
    type: String,
    required: true,
  },
  metaLabel: {
    type: String,
    required: true,
  },
  metaNote: {
    type: String,
    required: true,
  },
  quickLinks: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="preschool-form-management-hero">
    <div class="preschool-form-management-hero__copy">
      <p class="preschool-form-management-hero__eyebrow">
        {{ eyebrow }}
      </p>
      <h2 class="preschool-form-management-hero__title">
        {{ title }}
      </h2>
      <p class="preschool-form-management-hero__description">
        {{ description }}
      </p>

      <div class="preschool-form-management-hero__meta">
        <span class="preschool-form-management-hero__meta-label">
          {{ metaLabel }}
        </span>
        <span class="preschool-form-management-hero__meta-note">
          {{ metaNote }}
        </span>
      </div>
    </div>

    <div class="preschool-form-management-hero__actions">
      <Button
        v-for="link in quickLinks"
        :key="link.label"
        :label="link.label"
        :icon="link.icon"
        rounded="xl"
        size="md"
        variant="secondary"
        @click="link.action"
      />
    </div>
  </div>
</template>

<style scoped>
.preschool-form-management-hero {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
  padding: 1.35rem;
  border: 1px solid #86efac;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.14), transparent 22%),
    linear-gradient(180deg, rgba(240, 253, 244, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  box-shadow: 0 25px 55px -38px rgba(15, 23, 42, 0.45);
}

.preschool-form-management-hero__eyebrow {
  margin: 0 0 0.25rem;
  color: #059669;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preschool-form-management-hero__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.45rem;
  font-weight: 900;
  line-height: 1.2;
}

.preschool-form-management-hero__description {
  margin: 0.7rem 0 0;
  color: #475569;
  font-size: 0.96rem;
  line-height: 1.65;
  max-width: 54rem;
}

.preschool-form-management-hero__meta {
  display: grid;
  gap: 0.1rem;
  margin-top: 1.05rem;
  padding: 0.95rem 1rem;
  border-radius: 1.15rem;
  border: 1px solid rgba(134, 239, 172, 0.9);
  background: rgba(240, 253, 244, 0.9);
}

.preschool-form-management-hero__meta-label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preschool-form-management-hero__meta-note {
  color: #059669;
  font-size: 0.92rem;
  font-weight: 600;
}

.preschool-form-management-hero__actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #86efac;
  background: linear-gradient(180deg, rgba(240, 253, 244, 0.9) 0%, rgba(220, 252, 231, 0.85) 100%);
}

@media (max-width: 900px) {
  .preschool-form-management-hero {
    grid-template-columns: 1fr;
  }

  .preschool-form-management-hero__actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .preschool-form-management-hero,
  .preschool-form-management-hero__actions {
    padding: 1rem;
  }
}
</style>
