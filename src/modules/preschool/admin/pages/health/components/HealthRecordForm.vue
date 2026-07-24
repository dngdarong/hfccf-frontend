<script setup>
import { ref, watch } from 'vue'
import DynamicCollection from './DynamicCollection.vue'
import ConditionCard from './ConditionCard.vue'
import AllergyCard from './AllergyCard.vue'
import MedicationCard from './MedicationCard.vue'
import VaccinationCard from './VaccinationCard.vue'
import EmergencyContactCard from './EmergencyContactCard.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  student: {
    type: Object,
    default: null,
  },
  profile: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'add',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'cancel'])

const { t } = useLanguage()

// Basic Health Information
const bloodType = ref('')
const height = ref('')
const weight = ref('')
const specialNeeds = ref('')
const medicalNotes = ref('')

// Dynamic Collections
const conditions = ref([])
const allergies = ref([])
const medications = ref([])
const vaccinations = ref([])
const emergencyContacts = ref([])

// Collapsible sections (all expanded by default except non-basic sections)
const collapsedSections = ref({
  basic: false,
  conditions: true,
  allergies: true,
  medications: true,
  vaccinations: true,
  emergencyContacts: true,
})

function toggleSection(section) {
  collapsedSections.value[section] = !collapsedSections.value[section]
}

const validationErrors = ref({})
const submitError = ref('')

watch(
  () => props.profile,
  (profile) => {
    if (profile) {
      bloodType.value = profile.blood_type || ''
      height.value = profile.height || ''
      weight.value = profile.weight || ''
      specialNeeds.value = profile.special_needs || ''
      medicalNotes.value = profile.medical_notes || ''
    }
  },
  { immediate: true, deep: true }
)

function resetForm() {
  bloodType.value = ''
  height.value = ''
  weight.value = ''
  specialNeeds.value = ''
  medicalNotes.value = ''
  conditions.value = []
  allergies.value = []
  medications.value = []
  vaccinations.value = []
  emergencyContacts.value = []
  validationErrors.value = {}
  submitError.value = ''
}

function handleCancel() {
  emit('cancel')
}

// Collection handlers
function addCondition() {
  conditions.value.push({ condition_name: '', diagnosis_date: '', status: 'active', notes: '' })
}

function removeCondition(index) {
  conditions.value.splice(index, 1)
}

function updateCondition(data) {
  const item = conditions.value[data.index]
  if (item) {
    item[data.key] = data.value
  }
}

function addAllergy() {
  allergies.value.push({ allergy_name: '', severity: 'medium', reaction: '', notes: '' })
}

function removeAllergy(index) {
  allergies.value.splice(index, 1)
}

function updateAllergy(data) {
  const item = allergies.value[data.index]
  if (item) {
    item[data.key] = data.value
  }
}

function addMedication() {
  medications.value.push({ medication_name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' })
}

function removeMedication(index) {
  medications.value.splice(index, 1)
}

function updateMedication(data) {
  const item = medications.value[data.index]
  if (item) {
    item[data.key] = data.value
  }
}

function addVaccination() {
  vaccinations.value.push({ vaccine_name: '', vaccination_date: '', next_due_date: '', status: 'completed', notes: '' })
}

function removeVaccination(index) {
  vaccinations.value.splice(index, 1)
}

function updateVaccination(data) {
  const item = vaccinations.value[data.index]
  if (item) {
    item[data.key] = data.value
  }
}

function addEmergencyContact() {
  emergencyContacts.value.push({ contact_name: '', relationship: '', phone_number: '', hospital_clinic: '', notes: '' })
}

function removeEmergencyContact(index) {
  emergencyContacts.value.splice(index, 1)
}

function updateEmergencyContact(data) {
  const item = emergencyContacts.value[data.index]
  if (item) {
    item[data.key] = data.value
  }
}

async function submitForm() {
  validationErrors.value = {}
  submitError.value = ''

  const payload = {
    basicInfo: {
      blood_type: bloodType.value || null,
      height: height.value ? parseInt(height.value) : null,
      weight: weight.value ? parseInt(weight.value) : null,
      special_needs: specialNeeds.value || null,
      medical_notes: medicalNotes.value || null,
      status: 'active',
    },
    conditions: conditions.value,
    allergies: allergies.value,
    medications: medications.value,
    vaccinations: vaccinations.value,
    emergencyContacts: emergencyContacts.value,
  }

  try {
    emit('save', payload)
  } catch (error) {
    if (error?.response?.status === 422) {
      validationErrors.value = error.response.data?.errors || {}
    } else {
      submitError.value = error?.message || t('preschoolHealthPage.messages.saveFailed')
    }
    throw error
  }
}

defineExpose({
  submitForm,
  resetForm,
  handleCancel,
})
</script>

<template>
  <div class="health-record-form">
    <!-- Student Information Card -->
    <div class="student-info-card">
      <div class="student-info-item">
        <span class="student-info-label">{{ t('preschoolHealthPage.records.student') }}</span>
        <span class="student-info-value">{{ student?.fullName || '-' }}</span>
      </div>
      <div class="student-info-divider" />
      <div class="student-info-item">
        <span class="student-info-label">{{ t('preschoolHealthPage.records.gender') }}</span>
        <span class="student-info-value">{{ student?.gender || '-' }}</span>
      </div>
      <div class="student-info-divider" />
      <div class="student-info-item">
        <span class="student-info-label">{{ t('preschoolHealthPage.records.class') }}</span>
        <span class="student-info-value">{{ student?.className || '-' }}</span>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="submitError" class="health-record-form-error">
      {{ submitError }}
    </div>

    <!-- Section 1: Basic Health Information -->
    <div class="collapsible-section">
      <button class="section-header" @click="toggleSection('basic')">
        <div class="section-header-content">
          <span class="section-title">{{ t('preschoolHealthPage.records.healthInformation') }}</span>
          <span class="section-description">Height, weight, blood type, and medical notes</span>
        </div>
        <span class="section-icon" :class="{ collapsed: collapsedSections.basic }">▼</span>
      </button>

      <div v-if="!collapsedSections.basic" class="section-content">
        <div class="form-grid">
          <div class="form-group">
            <label class="health-record-form-label">{{ t('preschoolHealthPage.records.bloodType') }}</label>
            <select v-model="bloodType" class="health-record-form-input">
              <option value="">{{ t('common.none') }}</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div class="form-group">
            <label class="health-record-form-label">{{ t('preschoolHealthPage.records.height') }}</label>
            <input
              v-model="height"
              type="number"
              class="health-record-form-input"
              placeholder="Height in cm"
              min="0"
              max="300"
            />
          </div>

          <div class="form-group">
            <label class="health-record-form-label">{{ t('preschoolHealthPage.records.weight') }}</label>
            <input
              v-model="weight"
              type="number"
              class="health-record-form-input"
              placeholder="Weight in kg"
              min="0"
              max="200"
            />
          </div>

          <div class="form-group">
            <label class="health-record-form-label">{{ t('preschoolHealthPage.records.specialNeeds') }}</label>
            <input
              v-model="specialNeeds"
              type="text"
              class="health-record-form-input"
              :placeholder="t('common.none')"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="health-record-form-label">{{ t('preschoolHealthPage.records.medicalNotes') }}</label>
          <textarea
            v-model="medicalNotes"
            class="health-record-form-textarea"
            :placeholder="t('preschoolHealthPage.records.notesPlaceholder')"
            rows="3"
          />
        </div>
      </div>
    </div>

    <!-- Section 2: Medical Conditions -->
    <div class="collapsible-section">
      <button class="section-header" @click="toggleSection('conditions')">
        <div class="section-header-content">
          <span class="section-title">{{ t('preschoolHealthPage.records.conditions') }}</span>
          <span class="section-description">Chronic conditions, diagnosis dates, and status</span>
        </div>
        <span class="section-icon" :class="{ collapsed: collapsedSections.conditions }">▼</span>
      </button>

      <div v-if="!collapsedSections.conditions" class="section-content">
        <DynamicCollection
          :items="conditions"
          :emptyMessage="t('preschoolHealthPage.records.noRecords') || 'No records added.'"
          :addButtonLabel="t('preschoolHealthPage.records.conditions')"
          @add="addCondition"
          @remove="removeCondition"
        >
          <template #item="{ item, index, onRemove }">
            <ConditionCard :condition="item" :index="index" @remove="onRemove" @update="updateCondition" />
          </template>
        </DynamicCollection>
      </div>
    </div>

    <!-- Section 3: Allergies -->
    <div class="collapsible-section">
      <button class="section-header" @click="toggleSection('allergies')">
        <div class="section-header-content">
          <span class="section-title">{{ t('preschoolHealthPage.records.allergies') }}</span>
          <span class="section-description">Known allergies, severity levels, and reactions</span>
        </div>
        <span class="section-icon" :class="{ collapsed: collapsedSections.allergies }">▼</span>
      </button>

      <div v-if="!collapsedSections.allergies" class="section-content">
        <DynamicCollection
          :items="allergies"
          :emptyMessage="t('preschoolHealthPage.records.noRecords') || 'No records added.'"
          :addButtonLabel="t('preschoolHealthPage.records.allergies')"
          @add="addAllergy"
          @remove="removeAllergy"
        >
          <template #item="{ item, index, onRemove }">
            <AllergyCard :allergy="item" :index="index" @remove="onRemove" @update="updateAllergy" />
          </template>
        </DynamicCollection>
      </div>
    </div>

    <!-- Section 4: Medications -->
    <div class="collapsible-section">
      <button class="section-header" @click="toggleSection('medications')">
        <div class="section-header-content">
          <span class="section-title">{{ t('preschoolHealthPage.records.medications') }}</span>
          <span class="section-description">Current and past medications with dosages</span>
        </div>
        <span class="section-icon" :class="{ collapsed: collapsedSections.medications }">▼</span>
      </button>

      <div v-if="!collapsedSections.medications" class="section-content">
        <DynamicCollection
          :items="medications"
          :emptyMessage="t('preschoolHealthPage.records.noRecords') || 'No records added.'"
          :addButtonLabel="t('preschoolHealthPage.records.medications')"
          @add="addMedication"
          @remove="removeMedication"
        >
          <template #item="{ item, index, onRemove }">
            <MedicationCard :medication="item" :index="index" @remove="onRemove" @update="updateMedication" />
          </template>
        </DynamicCollection>
      </div>
    </div>

    <!-- Section 5: Vaccinations -->
    <div class="collapsible-section">
      <button class="section-header" @click="toggleSection('vaccinations')">
        <div class="section-header-content">
          <span class="section-title">{{ t('preschoolHealthPage.records.vaccinations') }}</span>
          <span class="section-description">Vaccination history and completion status</span>
        </div>
        <span class="section-icon" :class="{ collapsed: collapsedSections.vaccinations }">▼</span>
      </button>

      <div v-if="!collapsedSections.vaccinations" class="section-content">
        <DynamicCollection
          :items="vaccinations"
          :emptyMessage="t('preschoolHealthPage.records.noRecords') || 'No records added.'"
          :addButtonLabel="t('preschoolHealthPage.records.vaccinations')"
          @add="addVaccination"
          @remove="removeVaccination"
        >
          <template #item="{ item, index, onRemove }">
            <VaccinationCard :vaccination="item" :index="index" @remove="onRemove" @update="updateVaccination" />
          </template>
        </DynamicCollection>
      </div>
    </div>

    <!-- Section 6: Emergency Contacts -->
    <div class="collapsible-section">
      <button class="section-header" @click="toggleSection('emergencyContacts')">
        <div class="section-header-content">
          <span class="section-title">{{ t('preschoolHealthPage.records.emergencyContacts') }}</span>
          <span class="section-description">Guardian contacts and emergency phone numbers</span>
        </div>
        <span class="section-icon" :class="{ collapsed: collapsedSections.emergencyContacts }">▼</span>
      </button>

      <div v-if="!collapsedSections.emergencyContacts" class="section-content">
        <DynamicCollection
          :items="emergencyContacts"
          :emptyMessage="t('preschoolHealthPage.records.noRecords') || 'No records added.'"
          :addButtonLabel="t('preschoolHealthPage.records.emergencyContacts')"
          @add="addEmergencyContact"
          @remove="removeEmergencyContact"
        >
          <template #item="{ item, index, onRemove }">
            <EmergencyContactCard :contact="item" :index="index" @remove="onRemove" @update="updateEmergencyContact" />
          </template>
        </DynamicCollection>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-record-form {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 100%;
}

/* Student Information Card */
.student-info-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #f0f4f8;
  border: 1px solid #d4dfe7;
  border-radius: 0.85rem;
}

.student-info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.student-info-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.student-info-value {
  font-size: 0.95rem;
  color: #0f172a;
  font-weight: 600;
}

.student-info-divider {
  width: 1px;
  background: #cbd5e1;
}

.health-record-form-error {
  padding: 1rem;
  background: #fff1f2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  color: #b91c1c;
  font-size: 0.9rem;
}

/* Collapsible Sections */
.collapsible-section {
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  overflow: hidden;
}

.section-header {
  width: 100%;
  padding: 1rem;
  background: #f8fafc;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
  border-bottom: 1px solid #e2e8f0;
}

.section-header:hover {
  background: #f1f5f9;
}

.section-header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.section-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.section-description {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 400;
}

.section-icon {
  font-size: 0.75rem;
  color: #64748b;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.section-icon.collapsed {
  transform: rotate(-90deg);
}

.section-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.health-record-form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.health-record-form-input,
.health-record-form-textarea {
  padding: 0.7rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  color: #0f172a;
  background: #fff;
  font-family: inherit;
  transition: all 0.2s ease;
}

.health-record-form-input:focus,
.health-record-form-textarea:focus {
  outline: none;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}

.health-record-form-textarea {
  resize: vertical;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .student-info-card {
    flex-direction: column;
  }

  .student-info-divider {
    height: 1px;
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .section-content {
    padding: 1.25rem;
  }
}
</style>
