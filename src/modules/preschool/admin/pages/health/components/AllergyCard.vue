<script setup>
import { computed } from 'vue'
import CollectionCard from './CollectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  allergy: {
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

const title = computed(() => props.allergy?.allergy_name || `Allergy ${props.index + 1}`)

function updateField(key, value) {
  emit('update', { index: props.index, key, value })
}
</script>

<template>
  <CollectionCard :title="title" :index="index" @remove="$emit('remove')">
    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.allergyName') || 'Allergy Name' }}</label>
      <input
        type="text"
        class="form-input"
        :value="allergy.allergy_name || ''"
        @input="updateField('allergy_name', $event.target.value)"
        placeholder="Enter allergy name"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.severity') || 'Severity' }}</label>
      <select class="form-input" :value="allergy.severity || 'medium'" @change="updateField('severity', $event.target.value)">
        <option value="low">{{ t('preschoolHealthPage.records.severityLow') || 'Low' }}</option>
        <option value="medium">{{ t('preschoolHealthPage.records.severityMedium') || 'Medium' }}</option>
        <option value="high">{{ t('preschoolHealthPage.records.severityHigh') || 'High' }}</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.reaction') || 'Reaction' }}</label>
      <input
        type="text"
        class="form-input"
        :value="allergy.reaction || ''"
        @input="updateField('reaction', $event.target.value)"
        placeholder="Describe the allergic reaction"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('common.notes') || 'Notes' }}</label>
      <textarea class="form-input" :value="allergy.notes || ''" @input="updateField('notes', $event.target.value)" rows="2" placeholder="Add any additional notes" />
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
