<script setup>
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'PreschoolFormActionCard',
})

defineProps({
  actionLabel: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  to: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <RouterLink v-if="to" :to="to" class="preschool-form-action-card">
    <article class="preschool-form-action-card__surface">
      <div class="preschool-form-action-card__icon">
        <i :class="icon" aria-hidden="true" />
      </div>
      <div class="preschool-form-action-card__copy">
        <div class="preschool-form-action-card__topline">
          <h4>{{ title }}</h4>
          <span v-if="actionLabel">{{ actionLabel }}</span>
        </div>
        <p>{{ description }}</p>
      </div>
    </article>
  </RouterLink>

  <article v-else class="preschool-form-action-card">
    <div class="preschool-form-action-card__surface">
      <div class="preschool-form-action-card__icon">
        <i :class="icon" aria-hidden="true" />
      </div>
      <div class="preschool-form-action-card__copy">
        <div class="preschool-form-action-card__topline">
          <h4>{{ title }}</h4>
          <span v-if="actionLabel">{{ actionLabel }}</span>
        </div>
        <p>{{ description }}</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.preschool-form-action-card {
  display: block;
  text-decoration: none;
}

.preschool-form-action-card__surface {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 18px 40px -34px rgba(15, 23, 42, 0.35);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.preschool-form-action-card__surface:hover,
.preschool-form-action-card__surface:focus-within {
  transform: translateY(-2px);
  border-color: #93c5fd;
  box-shadow: 0 22px 50px -34px rgba(37, 99, 235, 0.45);
}

.preschool-form-action-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #2563eb;
  flex: none;
}

.preschool-form-action-card__copy {
  min-width: 0;
  width: 100%;
}

.preschool-form-action-card__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.preschool-form-action-card__topline h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 850;
}

.preschool-form-action-card__topline span {
  flex: none;
  padding: 0.28rem 0.62rem;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.preschool-form-action-card__copy p {
  margin: 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.5;
}
</style>
