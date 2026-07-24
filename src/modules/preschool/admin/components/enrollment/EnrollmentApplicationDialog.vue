<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import EnrollmentApplicationForm from './EnrollmentApplicationForm.vue'

defineOptions({ name: 'EnrollmentApplicationDialog' })

const props = defineProps({
  visible: { type: Boolean, default: false },
  application: { type: Object, default: null },
  academicYears: { type: Array, default: () => [] },
  terms: { type: Array, default: () => [] },
  classes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  validationErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:visible', 'save'])
const { t } = useI18n()

const dialogTitle = computed(() => {
  if (props.readonly) return t('preschoolEnrollmentPage.applicationDialog.titleView')
  if (props.application) return t('preschoolEnrollmentPage.applicationDialog.titleEdit')
  return t('preschoolEnrollmentPage.applicationDialog.titleNew')
})
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
          <EnrollmentApplicationForm
            :application="application"
            :academic-years="academicYears"
            :terms="terms"
            :classes="classes"
            :loading="loading"
            :readonly="readonly"
            :validation-errors="validationErrors"
            :cancel-label="t('preschoolEnrollmentPage.actions.close')"
            :save-label="t('preschoolEnrollmentPage.actions.save')"
            @cancel="emit('update:visible', false)"
            @save="emit('save', $event)"
          />
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
  border-radius: 1.35rem;
  width: 100%;
  max-width: 1040px;
  box-shadow: 0 28px 68px rgba(15, 23, 42, 0.24);
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.85);
}

.enr-app-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.35rem 0.9rem;
  border-bottom: 1px solid #edf2f7;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.enr-app-dialog__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.enr-app-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  color: #94a3b8;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.enr-app-dialog__close:hover {
  color: #0f172a;
  border-color: #cbd5e1;
  background: #f8fafc;
}

.enr-app-dialog__body {
  padding: 1rem 1.35rem 1.35rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

@media (max-width: 900px) {
  .enr-app-overlay {
    padding: 0.75rem;
  }

  .enr-app-dialog {
    max-height: calc(100vh - 1.5rem);
  }

  .enr-app-dialog__header,
  .enr-app-dialog__body {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
