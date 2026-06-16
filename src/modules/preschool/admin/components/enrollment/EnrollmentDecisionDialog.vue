<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EnrollmentClassAssignmentPanel from './EnrollmentClassAssignmentPanel.vue'

defineOptions({ name: 'EnrollmentDecisionDialog' })

const props = defineProps({
  visible: { type: Boolean, default: false },
  action: { type: String, default: '' },
  application: { type: Object, default: () => ({}) },
  classes: { type: Array, default: () => [] },
  academicYears: { type: Array, default: () => [] },
  terms: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'confirm'])
const { t } = useI18n()

const note = ref('')
const rejectionReason = ref('')
const waitlistReason = ref('')
const assignment = ref({ classId: null, academicYearId: null, termId: null })

watch(() => props.visible, (v) => {
  if (v) {
    note.value = ''
    rejectionReason.value = ''
    waitlistReason.value = ''
    assignment.value = { classId: null, academicYearId: null, termId: null }
  }
})

const title = computed(() => {
  const map = {
    approve: t('preschoolEnrollmentPage.decisionDialog.titleApprove'),
    reject: t('preschoolEnrollmentPage.decisionDialog.titleReject'),
    waitlist: t('preschoolEnrollmentPage.decisionDialog.titleWaitlist'),
    cancel: t('preschoolEnrollmentPage.decisionDialog.titleCancel'),
    enroll: t('preschoolEnrollmentPage.decisionDialog.titleEnroll'),
  }
  return map[props.action] ?? ''
})

const body = computed(() => {
  const map = {
    approve: t('preschoolEnrollmentPage.decisionDialog.bodyApprove'),
    reject: t('preschoolEnrollmentPage.decisionDialog.bodyReject'),
    waitlist: t('preschoolEnrollmentPage.decisionDialog.bodyWaitlist'),
    cancel: t('preschoolEnrollmentPage.decisionDialog.bodyCancel'),
    enroll: t('preschoolEnrollmentPage.decisionDialog.bodyEnroll'),
  }
  return map[props.action] ?? ''
})

const isDanger = computed(() => ['reject', 'cancel'].includes(props.action))

function buildPayload() {
  const p = {}
  if (note.value.trim()) p.note = note.value.trim()
  if (props.action === 'reject' && rejectionReason.value.trim()) {
    p.rejection_reason = rejectionReason.value.trim()
  }
  if (props.action === 'waitlist' && waitlistReason.value.trim()) {
    p.waitlist_reason = waitlistReason.value.trim()
  }
  if (props.action === 'enroll') {
    if (assignment.value.classId) p.class_id = assignment.value.classId
    if (assignment.value.academicYearId) p.academic_year_id = assignment.value.academicYearId
    if (assignment.value.termId) p.term_id = assignment.value.termId
  }
  return p
}

function confirm() {
  if (props.action === 'reject' && !rejectionReason.value.trim()) return
  emit('confirm', { action: props.action, payload: buildPayload() })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="enr-dialog-overlay" @click.self="emit('update:visible', false)">
      <div class="enr-dialog" role="dialog" :aria-label="title">
        <div class="enr-dialog__header">
          <h2 class="enr-dialog__title" :class="{ 'enr-dialog__title--danger': isDanger }">
            {{ title }}
          </h2>
          <button class="enr-dialog__close" @click="emit('update:visible', false)">
            <i class="pi pi-times" />
          </button>
        </div>

        <div class="enr-dialog__body">
          <p class="enr-dialog__body-text">{{ body }}</p>

          <div v-if="action === 'reject'" class="enr-dialog__field">
            <label class="enr-dialog__label">
              {{ t('preschoolEnrollmentPage.decisionDialog.fields.rejectionReason') }}
              <span class="enr-dialog__required">*</span>
            </label>
            <textarea
              v-model="rejectionReason"
              class="enr-dialog__textarea"
              rows="3"
              :placeholder="t('preschoolEnrollmentPage.decisionDialog.placeholders.rejectionReason')"
            />
          </div>

          <div v-if="action === 'waitlist'" class="enr-dialog__field">
            <label class="enr-dialog__label">
              {{ t('preschoolEnrollmentPage.decisionDialog.fields.waitlistReason') }}
            </label>
            <textarea
              v-model="waitlistReason"
              class="enr-dialog__textarea"
              rows="2"
              :placeholder="t('preschoolEnrollmentPage.decisionDialog.placeholders.waitlistReason')"
            />
          </div>

          <div v-if="action === 'enroll'" class="enr-dialog__field">
            <EnrollmentClassAssignmentPanel
              v-model="assignment"
              :classes="classes"
              :academic-years="academicYears"
              :terms="terms"
            />
          </div>

          <div v-if="!['reject'].includes(action)" class="enr-dialog__field">
            <label class="enr-dialog__label">
              {{ t('preschoolEnrollmentPage.decisionDialog.fields.note') }}
            </label>
            <textarea
              v-model="note"
              class="enr-dialog__textarea"
              rows="2"
              :placeholder="t('preschoolEnrollmentPage.decisionDialog.placeholders.note')"
            />
          </div>
        </div>

        <div class="enr-dialog__footer">
          <button class="enr-dialog__btn enr-dialog__btn--cancel" @click="emit('update:visible', false)">
            {{ t('preschoolEnrollmentPage.actions.close') }}
          </button>
          <button
            class="enr-dialog__btn"
            :class="isDanger ? 'enr-dialog__btn--danger' : 'enr-dialog__btn--confirm'"
            :disabled="loading || (action === 'reject' && !rejectionReason.trim())"
            @click="confirm"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner" />
            {{ t('preschoolEnrollmentPage.actions.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.enr-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.enr-dialog {
  background: #fff;
  border-radius: 1rem;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.enr-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 0;
}

.enr-dialog__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.enr-dialog__title--danger { color: #b91c1c; }

.enr-dialog__close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.4rem;
  transition: color 0.15s;
}

.enr-dialog__close:hover { color: #0f172a; }

.enr-dialog__body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.enr-dialog__body-text {
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.55;
}

.enr-dialog__field { display: flex; flex-direction: column; gap: 0.4rem; }

.enr-dialog__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

.enr-dialog__required { color: #ef4444; margin-left: 0.15rem; }

.enr-dialog__textarea {
  padding: 0.55rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.6rem;
  font-size: 0.875rem;
  resize: vertical;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
}

.enr-dialog__textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }

.enr-dialog__footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid #f1f5f9;
}

.enr-dialog__btn {
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

.enr-dialog__btn:disabled { opacity: 0.5; cursor: not-allowed; }

.enr-dialog__btn--cancel {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.enr-dialog__btn--cancel:hover:not(:disabled) { background: #f1f5f9; }

.enr-dialog__btn--confirm {
  background: #6366f1;
  color: #fff;
}

.enr-dialog__btn--confirm:hover:not(:disabled) { background: #4f46e5; }

.enr-dialog__btn--danger {
  background: #ef4444;
  color: #fff;
}

.enr-dialog__btn--danger:hover:not(:disabled) { background: #dc2626; }
</style>
