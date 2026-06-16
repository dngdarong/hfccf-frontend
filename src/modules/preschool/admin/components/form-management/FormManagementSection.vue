<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import FormManagementCard from './FormManagementCard.vue'

defineOptions({
  name: 'PreschoolFormManagementSection',
})

const props = defineProps({
  badge: {
    type: String,
    default: '',
  },
  cardClass: {
    type: String,
    default: '',
  },
  cards: {
    type: Array,
    required: true,
  },
  eyebrow: {
    type: String,
    required: true,
  },
  gridClass: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})

const { t, te } = useLanguage()

const badgeText = computed(() => (props.badge ? props.badge : ''))

function safeText(key, fallback) {
  return te(key) ? t(key) : fallback
}
</script>

<template>
  <div class="preschool-form-management-section">
    <div class="preschool-form-management-section__header">
      <div>
        <p class="preschool-form-management-section__eyebrow">
          {{ eyebrow }}
        </p>
        <h3>{{ title }}</h3>
      </div>

      <span v-if="badgeText" class="preschool-form-management-section__badge">
        {{ badgeText }}
      </span>
    </div>

    <div :class="['preschool-form-management-section__grid', gridClass]">
      <FormManagementCard
        v-for="card in cards"
        :key="card.key"
        :card="card"
        :badge="badgeText || safeText('preschoolScaffold.formManagement.hero.openLabel', 'Open')"
        :card-class="cardClass"
      />
    </div>
  </div>
</template>

<style scoped>
.preschool-form-management-section {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.preschool-form-management-section__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.preschool-form-management-section__eyebrow {
  margin: 0 0 0.25rem;
  color: #2563eb;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preschool-form-management-section__header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.45rem;
  font-weight: 900;
  line-height: 1.2;
}

.preschool-form-management-section__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.preschool-form-management-section__grid {
  display: grid;
  gap: 1rem;
}

.preschool-form-management-section__grid--three {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.preschool-form-management-section__grid--two {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

@media (max-width: 640px) {
  .preschool-form-management-section__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
