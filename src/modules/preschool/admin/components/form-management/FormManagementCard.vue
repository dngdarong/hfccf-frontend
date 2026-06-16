<script setup>
import { RouterLink } from 'vue-router'
import Card from 'primevue/card'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolFormManagementCard',
})

const props = defineProps({
  badge: {
    type: String,
    required: true,
  },
  card: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: '',
  },
})

const { t, te } = useLanguage()

function safeText(key, fallback) {
  return te(key) ? t(key) : fallback
}
</script>

<template>
  <RouterLink :to="props.card.to" class="preschool-form-management-card">
    <Card :class="['preschool-form-management-card__surface', props.cardClass]">
      <template #content>
        <div class="preschool-form-management-card__content">
          <div class="preschool-form-management-card__icon">
            <i :class="props.card.icon" aria-hidden="true" />
          </div>

          <div class="preschool-form-management-card__copy">
            <div class="preschool-form-management-card__topline">
              <h4>{{ safeText(props.card.titleKey, props.card.titleFallback) }}</h4>
              <span>{{ badge }}</span>
            </div>
            <p>{{ props.card.description }}</p>
          </div>
        </div>
      </template>
    </Card>
  </RouterLink>
</template>

<style scoped>
.preschool-form-management-card {
  display: block;
  text-decoration: none;
}

.preschool-form-management-card__surface {
  height: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 1.15rem;
  background: #fff;
  box-shadow: 0 18px 40px -34px rgba(15, 23, 42, 0.35);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.preschool-form-management-card__surface--manage {
  border-color: rgba(191, 219, 254, 0.95);
}

.preschool-form-management-card__surface--build {
  border-color: rgba(191, 219, 254, 0.95);
}

.preschool-form-management-card__surface--review {
  border-color: rgba(221, 214, 254, 0.9);
}

.preschool-form-management-card__surface:hover,
.preschool-form-management-card__surface:focus-within {
  transform: translateY(-2px);
  border-color: #93c5fd;
  box-shadow: 0 22px 50px -34px rgba(37, 99, 235, 0.45);
}

.preschool-form-management-card__content {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
}

.preschool-form-management-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 0.95rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #2563eb;
  flex: none;
}

.preschool-form-management-card__copy {
  min-width: 0;
  width: 100%;
}

.preschool-form-management-card__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.preschool-form-management-card__topline h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 850;
}

.preschool-form-management-card__topline span {
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

.preschool-form-management-card__copy p {
  margin: 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.5;
}
</style>
