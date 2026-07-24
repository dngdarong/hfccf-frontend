<script setup>
import { computed } from 'vue'
import CollectionCard from './CollectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  condition: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['remove', 'update'])

const { t } = useLanguage()

const title = computed(() => props.condition?.condition_name || `Condition ${props.index + 1}`)

function updateField(key, value) {
  emit('update', { index: props.index, key, value })
}
</script>

<template>
  <CollectionCard :title="title" :index="index" @remove="$emit('remove')">
    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.conditionName') || 'Condition Name' }}</label>
      <input
        type="text"
        class="form-input"
        :value="condition.condition_name || ''"
        @input="updateField('condition_name', $event.target.value)"
        placeholder="Enter condition name"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.diagnosisDate') || 'Diagnosis Date' }}</label>
      <input
        type="date"
        class="form-input"
        :value="condition.diagnosis_date || ''"
        @input="updateField('diagnosis_date', $event.target.value)"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.status') || 'Status' }}</label>
      <select class="form-input" :value="condition.status || 'active'" @change="updateField('status', $event.target.value)">
        <option value="active">{{ t('preschoolHealthPage.records.statusActive') || 'Active' }}</option>
        <option value="recovered">{{ t('preschoolHealthPage.records.statusRecovered') || 'Recovered' }}</option>
        <option value="chronic">{{ t('preschoolHealthPage.records.statusChronic') || 'Chronic' }}</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('common.notes') || 'Notes' }}</label>
      <textarea class="form-input" :value="condition.notes || ''" @input="updateField('notes', $event.target.value)" rows="2" placeholder="Add any additional notes" />
    </div>
  </CollectionCard>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #0f172a;
}

.form-input {
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  color: #0f172a;
  background: #fff;
}

.form-input:focus {
  outline: none;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}

textarea.form-input {
  resize: vertical;
  font-family: inherit;
}
</style>
