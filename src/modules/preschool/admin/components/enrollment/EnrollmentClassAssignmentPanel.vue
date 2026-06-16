<script setup>
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'EnrollmentClassAssignmentPanel' })

const props = defineProps({
  classes: { type: Array, default: () => [] },
  academicYears: { type: Array, default: () => [] },
  terms: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({ classId: null, academicYearId: null, termId: null }) },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

function patch(key, val) {
  emit('update:modelValue', { ...props.modelValue, [key]: val })
}
</script>

<template>
  <section class="enr-assign">
    <h3 class="enr-assign__title">{{ t('preschoolEnrollmentPage.classAssignmentPanel.title') }}</h3>
    <div class="enr-assign__fields">
      <div class="enr-assign__field">
        <label class="enr-assign__label">{{ t('preschoolEnrollmentPage.decisionDialog.fields.assignClass') }}</label>
        <select
          class="enr-assign__select"
          :value="modelValue.classId"
          @change="patch('classId', $event.target.value || null)"
        >
          <option value="">{{ t('preschoolEnrollmentPage.classAssignmentPanel.selectClass') }}</option>
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>
      </div>

      <div class="enr-assign__field">
        <label class="enr-assign__label">{{ t('preschoolEnrollmentPage.decisionDialog.fields.academicYear') }}</label>
        <select
          class="enr-assign__select"
          :value="modelValue.academicYearId"
          @change="patch('academicYearId', $event.target.value || null)"
        >
          <option value="">{{ t('preschoolEnrollmentPage.classAssignmentPanel.selectYear') }}</option>
          <option v-for="yr in academicYears" :key="yr.id" :value="yr.id">{{ yr.label }}</option>
        </select>
      </div>

      <div class="enr-assign__field">
        <label class="enr-assign__label">{{ t('preschoolEnrollmentPage.decisionDialog.fields.term') }}</label>
        <select
          class="enr-assign__select"
          :value="modelValue.termId"
          @change="patch('termId', $event.target.value || null)"
        >
          <option value="">{{ t('preschoolEnrollmentPage.classAssignmentPanel.selectTerm') }}</option>
          <option v-for="term in terms" :key="term.id" :value="term.id">{{ term.name }}</option>
        </select>
      </div>
    </div>
  </section>
</template>

<style scoped>
.enr-assign {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: #fff;
}

.enr-assign__title {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
}

.enr-assign__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.enr-assign__field { display: flex; flex-direction: column; gap: 0.3rem; }

.enr-assign__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
}

.enr-assign__select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: #fff;
  outline: none;
  cursor: pointer;
}

.enr-assign__select:focus { border-color: #6366f1; }
</style>
