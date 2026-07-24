<script setup>
import { computed } from 'vue'
import CollectionCard from './CollectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  contact: {
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

const title = computed(() => props.contact?.contact_name || `Contact ${props.index + 1}`)

function updateField(key, value) {
  emit('update', { index: props.index, key, value })
}
</script>

<template>
  <CollectionCard :title="title" :index="index" @remove="$emit('remove')">
    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.contactName') || 'Name' }}</label>
      <input
        type="text"
        class="form-input"
        :value="contact.contact_name || ''"
        @input="updateField('contact_name', $event.target.value)"
        placeholder="Enter contact name"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.relationship') || 'Relationship' }}</label>
      <input
        type="text"
        class="form-input"
        :value="contact.relationship || ''"
        @input="updateField('relationship', $event.target.value)"
        placeholder="e.g., Mother, Father, Guardian"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.phoneNumber') || 'Phone Number' }}</label>
      <input
        type="tel"
        class="form-input"
        :value="contact.phone_number || ''"
        @input="updateField('phone_number', $event.target.value)"
        placeholder="Enter phone number"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('preschoolHealthPage.records.hospital') || 'Hospital / Clinic (Optional)' }}</label>
      <input
        type="text"
        class="form-input"
        :value="contact.hospital_clinic || ''"
        @input="updateField('hospital_clinic', $event.target.value)"
        placeholder="Enter hospital or clinic name"
      />
    </div>

    <div class="form-group">
      <label class="form-label">{{ t('common.notes') || 'Notes' }}</label>
      <textarea class="form-input" :value="contact.notes || ''" @input="updateField('notes', $event.target.value)" rows="2" placeholder="Add any additional notes" />
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
