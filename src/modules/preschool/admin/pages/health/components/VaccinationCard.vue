<script setup>
import { computed } from 'vue'
import CollectionCard from './CollectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  vaccination: {
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

const title = computed(() => props.vaccination?.vaccine_name || `Vaccination ${props.index + 1}`)

function updateField(key, value) {
  emit('update', { index: props.index, key, value })
}
</script>

<template>
  <CollectionCard :title="title" :index="index" @remove="$emit('remove')">
    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.vaccineName') || 'Vaccine Name' }}</label>
      <input
        type="text"
        class="form-input"
        :value="vaccination.vaccine_name || ''"
        @input="updateField('vaccine_name', $event.target.value)"
        placeholder="Enter vaccine name"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">{{ t('preschoolHealthPage.records.vaccinationDate') || 'Vaccination Date' }}</label>
        <input
          type="date"
          class="form-input"
          :value="vaccination.vaccination_date || ''"
          @input="updateField('vaccination_date', $event.target.value)"
        />
      </div>
      <div class="form-group">
        <label class="form-label">{{ t('preschoolHealthPage.records.nextDueDate') || 'Next Due Date' }}</label>
        <input
          type="date"
          class="form-input"
          :value="vaccination.next_due_date || ''"
          @input="updateField('next_due_date', $event.target.value)"
        />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.status') || 'Status' }}</label>
      <select class="form-input" :value="vaccination.status || 'completed'" @change="updateField('status', $event.target.value)">
        <option value="completed">{{ t('preschoolHealthPage.records.statusCompleted') || 'Completed' }}</option>
        <option value="pending">{{ t('preschoolHealthPage.records.statusPending') || 'Pending' }}</option>
        <option value="expired">{{ t('preschoolHealthPage.records.statusExpired') || 'Expired' }}</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('common.notes') || 'Notes' }}</label>
      <textarea class="form-input" :value="vaccination.notes || ''" @input="updateField('notes', $event.target.value)" rows="2" placeholder="Add any additional notes" />
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
