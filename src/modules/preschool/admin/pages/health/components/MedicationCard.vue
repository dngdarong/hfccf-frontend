<script setup>
import { computed } from 'vue'
import CollectionCard from './CollectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  medication: {
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

const title = computed(() => props.medication?.medication_name || `Medication ${props.index + 1}`)

function updateField(key, value) {
  emit('update', { index: props.index, key, value })
}
</script>

<template>
  <CollectionCard :title="title" :index="index" @remove="$emit('remove')">
    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.medicationName') || 'Medication Name' }}</label>
      <input
        type="text"
        class="form-input"
        :value="medication.medication_name || ''"
        @input="updateField('medication_name', $event.target.value)"
        placeholder="Enter medication name"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.dosage') || 'Dosage' }}</label>
      <input
        type="text"
        class="form-input"
        :value="medication.dosage || ''"
        @input="updateField('dosage', $event.target.value)"
        placeholder="e.g., 500mg, 1 tablet"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.frequency') || 'Frequency' }}</label>
      <input
        type="text"
        class="form-input"
        :value="medication.frequency || ''"
        @input="updateField('frequency', $event.target.value)"
        placeholder="e.g., twice daily, once at bedtime"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">{{ t('preschoolHealthPage.records.startDate') || 'Start Date' }}</label>
        <input
          type="date"
          class="form-input"
          :value="medication.start_date || ''"
          @input="updateField('start_date', $event.target.value)"
        />
      </div>
      <div class="form-group">
        <label class="form-label">{{ t('preschoolHealthPage.records.endDate') || 'End Date (Optional)' }}</label>
        <input
          type="date"
          class="form-input"
          :value="medication.end_date || ''"
          @input="updateField('end_date', $event.target.value)"
        />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('common.notes') || 'Notes' }}</label>
      <textarea class="form-input" :value="medication.notes || ''" @input="updateField('notes', $event.target.value)" rows="2" placeholder="Add any additional notes" />
    </div>
  </CollectionCard>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
