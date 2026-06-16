<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'EnrollmentApplicationDialog' })

const props = defineProps({
  visible: { type: Boolean, default: false },
  application: { type: Object, default: null },
  academicYears: { type: Array, default: () => [] },
  terms: { type: Array, default: () => [] },
  classes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])
const { t } = useI18n()

const form = ref({})

watch(() => props.visible, (v) => {
  if (v) {
    form.value = props.application
      ? {
          first_name: props.application.firstName ?? '',
          last_name: props.application.lastName ?? '',
          khmer_name: props.application.khmerName ?? '',
          gender: props.application.gender ?? '',
          date_of_birth: props.application.dateOfBirth ?? '',
          place_of_birth: props.application.placeOfBirth ?? '',
          nationality: props.application.nationality ?? '',
          requested_level: props.application.requestedLevel ?? '',
          requested_academic_year_id: props.application.requestedAcademicYearId ?? '',
          requested_term_id: props.application.requestedTermId ?? '',
          preferred_class_id: props.application.preferredClassId ?? '',
          requested_start_date: props.application.requestedStartDate ?? '',
          guardian_name: props.application.guardianName ?? '',
          guardian_relationship: props.application.guardianRelationship ?? '',
          guardian_phone: props.application.guardianPhone ?? '',
          guardian_email: props.application.guardianEmail ?? '',
          guardian_address: props.application.guardianAddress ?? '',
          guardian_can_pickup: props.application.guardianCanPickup ?? false,
          guardian_is_emergency: props.application.guardianIsEmergency ?? false,
        }
      : {
          first_name: '', last_name: '', khmer_name: '', gender: '',
          date_of_birth: '', place_of_birth: '', nationality: '',
          requested_level: '', requested_academic_year_id: '',
          requested_term_id: '', preferred_class_id: '', requested_start_date: '',
          guardian_name: '', guardian_relationship: '', guardian_phone: '',
          guardian_email: '', guardian_address: '',
          guardian_can_pickup: false, guardian_is_emergency: false,
        }
  }
})

const dialogTitle = computed(() => {
  if (props.readonly) return t('preschoolEnrollmentPage.applicationDialog.titleView')
  if (props.application) return t('preschoolEnrollmentPage.applicationDialog.titleEdit')
  return t('preschoolEnrollmentPage.applicationDialog.titleNew')
})

const f = (key) => t(`preschoolEnrollmentPage.applicationDialog.fields.${key}`)
const p = (key) => t(`preschoolEnrollmentPage.applicationDialog.placeholders.${key}`)

function save() {
  emit('save', { ...form.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="enr-app-overlay" @click.self="emit('update:visible', false)">
      <div class="enr-app-dialog" role="dialog" :aria-label="dialogTitle">
        <div class="enr-app-dialog__header">
          <h2 class="enr-app-dialog__title">{{ dialogTitle }}</h2>
          <button class="enr-app-dialog__close" @click="emit('update:visible', false)">
            <i class="pi pi-times" />
          </button>
        </div>

        <div class="enr-app-dialog__body">
          <section class="enr-app-section">
            <h3 class="enr-app-section__title">
              {{ t('preschoolEnrollmentPage.applicationDialog.sections.student') }}
            </h3>
            <div class="enr-app-grid">
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('firstName') }} *</label>
                <input v-model="form.first_name" class="enr-app-input" :disabled="readonly" :placeholder="p('firstName')" />
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('lastName') }} *</label>
                <input v-model="form.last_name" class="enr-app-input" :disabled="readonly" :placeholder="p('lastName')" />
              </div>
              <div class="enr-app-field enr-app-field--full">
                <label class="enr-app-label">{{ f('khmerName') }}</label>
                <input v-model="form.khmer_name" class="enr-app-input" :disabled="readonly" :placeholder="p('khmerName')" />
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('gender') }} *</label>
                <select v-model="form.gender" class="enr-app-select" :disabled="readonly">
                  <option value="">—</option>
                  <option value="male">{{ t('preschoolEnrollmentPage.applicationDialog.genders.male') }}</option>
                  <option value="female">{{ t('preschoolEnrollmentPage.applicationDialog.genders.female') }}</option>
                </select>
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('dateOfBirth') }} *</label>
                <input v-model="form.date_of_birth" type="date" class="enr-app-input" :disabled="readonly" />
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('placeOfBirth') }}</label>
                <input v-model="form.place_of_birth" class="enr-app-input" :disabled="readonly" :placeholder="p('placeOfBirth')" />
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('nationality') }}</label>
                <input v-model="form.nationality" class="enr-app-input" :disabled="readonly" :placeholder="p('nationality')" />
              </div>
            </div>
          </section>

          <section class="enr-app-section">
            <h3 class="enr-app-section__title">
              {{ t('preschoolEnrollmentPage.applicationDialog.sections.enrollment') }}
            </h3>
            <div class="enr-app-grid">
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('requestedLevel') }}</label>
                <input v-model="form.requested_level" class="enr-app-input" :disabled="readonly" />
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('requestedAcademicYear') }}</label>
                <select v-model="form.requested_academic_year_id" class="enr-app-select" :disabled="readonly">
                  <option value="">—</option>
                  <option v-for="yr in academicYears" :key="yr.id" :value="yr.id">{{ yr.label }}</option>
                </select>
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('requestedTerm') }}</label>
                <select v-model="form.requested_term_id" class="enr-app-select" :disabled="readonly">
                  <option value="">—</option>
                  <option v-for="term in terms" :key="term.id" :value="term.id">{{ term.name }}</option>
                </select>
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('preferredClass') }}</label>
                <select v-model="form.preferred_class_id" class="enr-app-select" :disabled="readonly">
                  <option value="">—</option>
                  <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                </select>
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('requestedStartDate') }}</label>
                <input v-model="form.requested_start_date" type="date" class="enr-app-input" :disabled="readonly" />
              </div>
            </div>
          </section>

          <section class="enr-app-section">
            <h3 class="enr-app-section__title">
              {{ t('preschoolEnrollmentPage.applicationDialog.sections.guardian') }}
            </h3>
            <div class="enr-app-grid">
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('guardianName') }} *</label>
                <input v-model="form.guardian_name" class="enr-app-input" :disabled="readonly" :placeholder="p('guardianName')" />
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('guardianRelationship') }}</label>
                <input v-model="form.guardian_relationship" class="enr-app-input" :disabled="readonly" />
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('guardianPhone') }} *</label>
                <input v-model="form.guardian_phone" class="enr-app-input" :disabled="readonly" :placeholder="p('guardianPhone')" />
              </div>
              <div class="enr-app-field">
                <label class="enr-app-label">{{ f('guardianEmail') }}</label>
                <input v-model="form.guardian_email" type="email" class="enr-app-input" :disabled="readonly" :placeholder="p('guardianEmail')" />
              </div>
              <div class="enr-app-field enr-app-field--full">
                <label class="enr-app-label">{{ f('guardianAddress') }}</label>
                <textarea v-model="form.guardian_address" class="enr-app-textarea" rows="2" :disabled="readonly" :placeholder="p('guardianAddress')" />
              </div>
              <div class="enr-app-field enr-app-field--check">
                <label class="enr-app-check">
                  <input v-model="form.guardian_can_pickup" type="checkbox" :disabled="readonly" />
                  {{ f('guardianCanPickup') }}
                </label>
              </div>
              <div class="enr-app-field enr-app-field--check">
                <label class="enr-app-check">
                  <input v-model="form.guardian_is_emergency" type="checkbox" :disabled="readonly" />
                  {{ f('guardianIsEmergency') }}
                </label>
              </div>
            </div>
          </section>
        </div>

        <div class="enr-app-dialog__footer">
          <button class="enr-app-btn enr-app-btn--cancel" @click="emit('update:visible', false)">
            {{ t('preschoolEnrollmentPage.actions.close') }}
          </button>
          <button
            v-if="!readonly"
            class="enr-app-btn enr-app-btn--save"
            :disabled="loading"
            @click="save"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner" />
            {{ t('preschoolEnrollmentPage.actions.save') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.enr-app-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  overflow-y: auto;
}

.enr-app-dialog {
  background: #fff;
  border-radius: 1rem;
  width: 100%;
  max-width: 680px;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
}

.enr-app-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 0;
}

.enr-app-dialog__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.enr-app-dialog__close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.4rem;
}

.enr-app-dialog__close:hover { color: #0f172a; }

.enr-app-dialog__body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 70vh;
}

.enr-app-section__title {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.enr-app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.enr-app-field { display: flex; flex-direction: column; gap: 0.3rem; }
.enr-app-field--full { grid-column: 1 / -1; }
.enr-app-field--check { justify-content: flex-end; }

.enr-app-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
}

.enr-app-input,
.enr-app-select,
.enr-app-textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: #fff;
  outline: none;
  font-family: inherit;
}

.enr-app-input:focus,
.enr-app-select:focus,
.enr-app-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }

.enr-app-input:disabled,
.enr-app-select:disabled,
.enr-app-textarea:disabled { background: #f8fafc; color: #64748b; cursor: default; }

.enr-app-textarea { resize: vertical; }

.enr-app-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #334155;
  cursor: pointer;
}

.enr-app-dialog__footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid #f1f5f9;
}

.enr-app-btn {
  padding: 0.55rem 1.25rem;
  border-radius: 0.6rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.enr-app-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.enr-app-btn--cancel {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.enr-app-btn--cancel:hover:not(:disabled) { background: #f1f5f9; }

.enr-app-btn--save {
  background: #6366f1;
  color: #fff;
}

.enr-app-btn--save:hover:not(:disabled) { background: #4f46e5; }
</style>
