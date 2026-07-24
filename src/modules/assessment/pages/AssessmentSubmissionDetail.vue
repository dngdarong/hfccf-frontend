<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentSubmissionApi } from '../services/assessmentSubmissionApi'
import { assessmentPrintApi } from '../services/assessmentPrintApi'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

defineOptions({ name: 'AssessmentSubmissionDetailPage' })

const route = useRoute()
const router = useRouter()
const { t } = useLanguage()
const toast = useToast()
const confirm = useConfirm()

const submission = ref(null)
const isLoading = ref(false)
const isPreviewLoading = ref(false)
const isPrintLoading = ref(false)
const reviewNote = ref('')
const printTemplates = ref([])
const selectedPrintTemplateId = ref(null)
const printPreviewHtml = ref('')
const printPreviewError = ref('')

const previewTemplateOptions = computed(() =>
  printTemplates.value.map((template) => ({
    label: `${template.name}${template.is_default ? ' (Default)' : ''}`,
    value: template.id,
  })),
)

const statusSeverity = {
  draft: 'secondary',
  submitted: 'info',
  under_review: 'warn',
  approved: 'success',
  rejected: 'danger',
}

const hasPrintPreview = computed(() => Boolean(printPreviewHtml.value))

async function load() {
  isLoading.value = true
  try {
    const res = await assessmentSubmissionApi.get(route.params.id)
    submission.value = res.data.data
    await loadPrintTemplates()
  } catch (error) {
    printPreviewError.value = error?.response?.data?.message ?? t('common.error')
  } finally {
    isLoading.value = false
  }
}

async function loadPrintTemplates() {
  if (!submission.value?.form_template_id) {
    printTemplates.value = []
    selectedPrintTemplateId.value = null
    printPreviewHtml.value = ''
    printPreviewError.value = ''
    return
  }

  try {
    const response = await assessmentPrintApi.list({
      form_template_id: submission.value.form_template_id,
    })

    printTemplates.value = response.data.data ?? []
    if (!printTemplates.value.length) {
      selectedPrintTemplateId.value = null
      printPreviewHtml.value = ''
      printPreviewError.value = t('printDesigner.missingTemplates')
      return
    }

    const defaultTemplate = printTemplates.value.find((template) => template.is_default) ?? printTemplates.value[0]
    selectedPrintTemplateId.value = defaultTemplate.id
    await refreshPrintPreview()
  } catch (error) {
    printTemplates.value = []
    selectedPrintTemplateId.value = null
    printPreviewHtml.value = ''
    printPreviewError.value = error?.response?.data?.message ?? t('common.error')
  }
}

async function refreshPrintPreview() {
  if (!submission.value?.id || !selectedPrintTemplateId.value) {
    printPreviewHtml.value = ''
    return
  }

  isPreviewLoading.value = true
  printPreviewError.value = ''
  try {
    const response = await assessmentPrintApi.preview({
      submission_id: submission.value.id,
      template_id: selectedPrintTemplateId.value,
    })

    printPreviewHtml.value = response.data?.data?.html ?? ''
  } catch (error) {
    printPreviewHtml.value = ''
    printPreviewError.value = error?.response?.data?.message ?? t('common.error')
  } finally {
    isPreviewLoading.value = false
  }
}

async function printSubmission() {
  if (!submission.value?.id || !selectedPrintTemplateId.value) {
    return
  }

  isPrintLoading.value = true
  try {
    const response = await assessmentPrintApi.print(submission.value.id, selectedPrintTemplateId.value)
    const blob = response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `assessment-${submission.value.id}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } finally {
    isPrintLoading.value = false
  }
}

async function approve() {
  confirm.require({
    message: t('submissions.confirmApprove'),
    accept: async () => {
      await assessmentSubmissionApi.review(route.params.id, { action: 'approve', note: reviewNote.value })
      toast.add({ severity: 'success', summary: t('common.success'), life: 3000 })
      load()
    },
  })
}

async function reject() {
  confirm.require({
    message: t('submissions.confirmReject'),
    accept: async () => {
      await assessmentSubmissionApi.review(route.params.id, { action: 'reject', note: reviewNote.value })
      toast.add({ severity: 'success', summary: t('common.success'), life: 3000 })
      load()
    },
  })
}

onMounted(load)

watch(selectedPrintTemplateId, () => {
  refreshPrintPreview()
})
</script>

<template>
  <MainLayout>
    <div class="submission-detail">
      <HeaderSection :title="t('submissions.title')">
        <template #actions>
          <Button
            :label="t('submissions.actions.back')"
            icon="pi pi-arrow-left"
            severity="secondary"
            @click="router.back()"
          />
          <template v-if="submission?.status === 'submitted'">
            <Button :label="t('submissions.actions.approve')" icon="pi pi-check" @click="approve" />
            <Button :label="t('submissions.actions.reject')" icon="pi pi-times" severity="danger" @click="reject" />
          </template>
        </template>
      </HeaderSection>

      <div v-if="isLoading" class="submission-detail__loading">
        <i class="pi pi-spin pi-spinner" />
      </div>

      <template v-else-if="submission">
        <div class="submission-detail__meta">
          <div class="submission-detail__meta-item">
            <span class="submission-detail__meta-label">{{ t('submissions.student') }}</span>
            <span>{{ submission.student?.full_name ?? '—' }}</span>
          </div>
          <div class="submission-detail__meta-item">
            <span class="submission-detail__meta-label">{{ t('submissions.form') }}</span>
            <span>{{ submission.form_template?.name ?? '—' }}</span>
          </div>
          <div class="submission-detail__meta-item">
            <span class="submission-detail__meta-label">{{ t('submissions.status') }}</span>
            <Tag :severity="statusSeverity[submission.status]" :value="t(`submissions.statuses.${submission.status}`)" />
          </div>
          <div class="submission-detail__meta-item">
            <span class="submission-detail__meta-label">{{ t('scoring.totalScore') }}</span>
            <span>{{ submission.total_score ?? '—' }}</span>
          </div>
        </div>

        <div class="submission-detail__review">
          <label>{{ t('submissions.reviewNote') }}</label>
          <Textarea v-model="reviewNote" rows="3" class="w-full" />
        </div>

        <Divider />

        <section class="submission-print">
          <div class="submission-print__header">
            <div>
              <h3>{{ t('printDesigner.preview.title') }}</h3>
              <p>{{ t('printDesigner.preview.subtitle') }}</p>
            </div>
            <div class="submission-print__actions">
              <Select
                v-model="selectedPrintTemplateId"
                :options="previewTemplateOptions"
                option-label="label"
                option-value="value"
                class="submission-print__selector"
                :placeholder="t('printDesigner.templateLibrary.title')"
                :disabled="!previewTemplateOptions.length"
              />
              <Button
                :label="t('printDesigner.print')"
                icon="pi pi-print"
                :disabled="!selectedPrintTemplateId"
                :loading="isPrintLoading"
                @click="printSubmission"
              />
            </div>
          </div>

          <div v-if="printPreviewError" class="submission-print__error">
            {{ printPreviewError }}
          </div>

          <div v-else class="submission-print__frame">
            <div v-if="isPreviewLoading" class="submission-print__loading">
              <i class="pi pi-spin pi-spinner" />
            </div>
            <iframe v-else-if="hasPrintPreview" :srcdoc="printPreviewHtml" title="assessment-print-preview" sandbox="allow-same-origin" />
            <div v-else class="submission-print__empty">
              {{ t('printDesigner.missingTemplates') }}
            </div>
          </div>
        </section>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.submission-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.submission-detail__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.submission-detail__meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1.25rem;
}

.submission-detail__meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.submission-detail__meta-label {
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.submission-detail__review {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submission-print {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submission-print__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.submission-print__header h3 {
  margin: 0 0 0.25rem;
}

.submission-print__header p {
  margin: 0;
  color: var(--text-color-secondary);
}

.submission-print__actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.submission-print__selector {
  min-width: 280px;
}

.submission-print__frame {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #fff;
  min-height: 720px;
}

.submission-print__frame iframe {
  width: 100%;
  min-height: 720px;
  border: 0;
}

.submission-print__loading,
.submission-print__empty,
.submission-print__error {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.submission-print__error {
  color: var(--red-500, #dc2626);
  border: 1px solid rgba(220, 38, 38, 0.2);
  background: rgba(254, 242, 242, 0.7);
  border-radius: 12px;
}
</style>
