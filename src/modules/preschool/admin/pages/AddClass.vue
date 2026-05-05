<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AdminSummaryCards from '@/modules/super-admin/components/admin-management/AdminSummaryCards.vue'
import AdminChecklistPanel from '@/modules/super-admin/components/admin-management/AdminChecklistPanel.vue'
import AddClassIntro from '@/modules/preschool/admin/components/add-class/AddClassIntro.vue'
import AddClassFormFields from '@/modules/preschool/admin/components/add-class/AddClassFormFields.vue'
import AddClassFormActions from '@/modules/preschool/admin/components/add-class/AddClassFormActions.vue'
import { findClassRowById, upsertClassRow } from '@/modules/preschool/admin/utils/classStorage'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolAdminAddClassPage',
})

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()

const classesDirectoryPath = '/module/preschool-admin/classes'
const levelOptions = ['Nursery', 'Kindergarten A', 'Kindergarten B', 'Prep']
const statusOptions = ['Active', 'Pending', 'Closed']

const form = reactive({
  code: '',
  name: '',
  teacher: '',
  level: levelOptions[0],
  schedule: '',
  students: 0,
  status: statusOptions[0],
  room: '',
  notes: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const isKh = computed(() => language.value === 'KH')
const mode = computed(() => {
  if (route.query.mode === 'view') return 'view'
  if (route.query.mode === 'edit' || Boolean(route.query.id)) return 'edit'
  return 'add'
})
const isViewMode = computed(() => mode.value === 'view')
const isEditMode = computed(() => mode.value === 'edit')
const isFormLocked = computed(() => isSubmitting.value || isViewMode.value)

const pageTitle = computed(() => {
  if (isViewMode.value) return t('preschoolAddClass.viewTitle')
  if (isEditMode.value) return t('preschoolAddClass.updateTitle')
  return t('preschoolAddClass.title')
})
const pageSubtitle = computed(() => {
  if (isViewMode.value) return t('preschoolAddClass.viewSubtitle')
  if (isEditMode.value) return t('preschoolAddClass.updateSubtitle')
  return t('preschoolAddClass.summary')
})

const summaryCards = computed(() => [
  {
    id: 'class-level',
    title: t('preschoolAddClass.level'),
    value: form.level || '-',
    label: t('preschoolAddClass.selectedLearningStage'),
    status: 'info',
    statusLabel: 'Info',
    surfaceClass: 'bg-cyan-50/80 border-cyan-200',
  },
  {
    id: 'class-students',
    title: t('preschoolAddClass.students'),
    value: Number(form.students || 0),
    label: t('preschoolAddClass.plannedEnrollment'),
    status: Number(form.students || 0) > 0 ? 'success' : 'warning',
    statusLabel: Number(form.students || 0) > 0 ? 'Success' : 'Warning',
    surfaceClass: 'bg-lime-50/80 border-lime-200',
  },
  {
    id: 'class-status',
    title: t('preschoolAddClass.status'),
    value: form.status || '-',
    label: t('preschoolAddClass.initialClassState'),
    status: String(form.status || '').toLowerCase(),
    statusLabel: form.status || '',
    surfaceClass: 'bg-amber-50/80 border-amber-200',
  },
  {
    id: 'class-schedule',
    title: t('preschoolAddClass.schedule'),
    value: form.schedule.trim() || t('preschoolAddClass.pending'),
    label: t('preschoolAddClass.teachingTimeSlot'),
    status: form.schedule.trim() ? 'success' : 'warning',
    statusLabel: form.schedule.trim() ? t('preschoolAddClass.ready') : t('preschoolAddClass.pending'),
    surfaceClass: 'bg-rose-50/80 border-rose-200',
  },
])

const checklistItems = computed(() => [
  {
    title: t('preschoolAddClass.identity'),
    text: t('preschoolAddClass.identityDetail'),
  },
  {
    title: t('preschoolAddClass.assignment'),
    text: t('preschoolAddClass.assignmentDetail'),
  },
  {
    title: t('preschoolAddClass.schedule'),
    text: t('preschoolAddClass.scheduleDetail'),
  },
  {
    title: t('preschoolAddClass.review'),
    text: t('preschoolAddClass.reviewDetail'),
  },
])

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

function normalizeNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function validateForm() {
  if (!form.code.trim()) return t('preschoolAddClass.validation.classCodeRequired')
  if (!form.name.trim()) return t('preschoolAddClass.validation.classNameRequired')
  if (!form.teacher.trim()) return t('preschoolAddClass.validation.teacherRequired')
  if (!form.level) return t('preschoolAddClass.validation.levelRequired')
  if (!form.schedule.trim()) return t('preschoolAddClass.validation.scheduleRequired')
  if (normalizeNumber(form.students) < 0) return t('preschoolAddClass.validation.studentsNegative')
  if (!form.status) return t('preschoolAddClass.validation.statusRequired')
  return ''
}

async function goBackToClasses() {
  await router.push(classesDirectoryPath)
}

async function goToEditMode() {
  const id = String(route.query.id || '').trim()
  if (!id) return
  await router.push({ path: '/module/preschool-admin/classes/add', query: { mode: 'edit', id } })
}

async function onSubmit() {
  if (isViewMode.value) return

  resetFeedback()

  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 700))
    upsertClassRow({
      id: isEditMode.value ? String(route.query.id || '').trim() : '',
      code: form.code.trim(),
      name: form.name.trim(),
      teacher: form.teacher.trim(),
      level: form.level,
      schedule: form.schedule.trim(),
      students: normalizeNumber(form.students),
      status: form.status,
      room: form.room.trim(),
      notes: form.notes.trim(),
    })
    showSuccess.value = true
  } catch {
    errorMessage.value = isEditMode.value
      ? t('preschoolAddClass.validation.updateFailed')
      : t('preschoolAddClass.validation.createFailed')
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function onErrorClose() {
  showError.value = false
}

async function onSuccessClose() {
  showSuccess.value = false
  await goBackToClasses()
}

function populateFromClass(item) {
  form.code = item.code || ''
  form.name = item.name || ''
  form.teacher = item.teacher || ''
  form.level = item.level || levelOptions[0]
  form.schedule = item.schedule || ''
  form.students = Number(item.students || 0)
  form.status = item.status || statusOptions[0]
  form.room = item.room || ''
  form.notes = item.notes || ''
}

onMounted(() => {
  if (mode.value === 'add') return

  const id = String(route.query.id || '').trim()
  const found = findClassRowById(id)
  if (!found) return
  populateFromClass(found)
})
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'add-class-page add-class-page--kh' : 'add-class-page'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <AdminSummaryCards :cards="summaryCards" />

      <div class="add-class-page__layout">
        <Form
          class="add-class-page__form"
          :title="pageTitle"
          :description="t('preschoolAddClass.formDescription')"
          :cancel-text="t('common.cancel')"
          :loading="isSubmitting"
          :disabled="isViewMode"
          :show-cancel="true"
          @submit="onSubmit"
          @cancel="goBackToClasses"
        >
          <AddClassIntro />

          <AddClassFormFields
            :level-options="levelOptions"
            :status-options="statusOptions"
            :code="form.code"
            :name="form.name"
            :teacher="form.teacher"
            :level="form.level"
            :schedule="form.schedule"
            :students="form.students"
            :status="form.status"
            :room="form.room"
            :notes="form.notes"
            :is-locked="isFormLocked"
            @update:code="form.code = $event"
            @update:name="form.name = $event"
            @update:teacher="form.teacher = $event"
            @update:level="form.level = $event"
            @update:schedule="form.schedule = $event"
            @update:students="form.students = $event"
            @update:status="form.status = $event"
            @update:room="form.room = $event"
            @update:notes="form.notes = $event"
          />

          <template v-if="isViewMode || isEditMode" #actions>
            <AddClassFormActions
              :is-submitting="isSubmitting"
              :is-view-mode="isViewMode"
              :is-edit-mode="isEditMode"
              @back="goBackToClasses"
              @edit="goToEditMode"
            />
          </template>
        </Form>

        <div class="add-class-page__rail">
          <AdminChecklistPanel
            :title="t('preschoolAddClass.sidebarTitle')"
            :description="t('preschoolAddClass.sidebarText')"
            :items="checklistItems"
            :highlight-label="t('preschoolAddClass.selectedLevel')"
            :highlight-value="form.level"
          />
        </div>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('preschoolAddClass.validationError')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="onErrorClose"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="isEditMode ? t('preschoolAddClass.classUpdated') : t('preschoolAddClass.classCreated')"
      :message="isEditMode ? t('preschoolAddClass.updatedMessage') : t('preschoolAddClass.createdMessage')"
      :button-text="t('preschoolAddClass.backToClasses')"
      @close="onSuccessClose"
    />
  </MainLayout>
</template>

<style scoped>
.add-class-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.add-class-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 1rem;
  align-items: start;
}

.add-class-page__form {
  display: block;
}

.add-class-page__rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.add-class-page--kh :deep(.admin-checklist-panel .p-card-title),
.add-class-page--kh :deep(.admin-checklist-panel .p-card-content),
.add-class-page--kh :deep(form header h3),
.add-class-page--kh :deep(form header p),
.add-class-page--kh :deep(.p-dialog-content),
.add-class-page--kh :deep(.p-dialog-footer) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.add-class-page--kh :deep(form header p),
.add-class-page--kh :deep(.admin-checklist-panel .p-card-content p),
.add-class-page--kh :deep(.p-dialog-content p) {
  line-height: 1.7;
}

@media (max-width: 1120px) {
  .add-class-page__layout {
    grid-template-columns: 1fr;
  }

  .add-class-page__rail {
    position: static;
  }
}

</style>
