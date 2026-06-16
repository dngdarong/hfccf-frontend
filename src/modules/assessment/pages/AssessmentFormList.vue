<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentFormApi } from '../services/assessmentFormApi'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

defineOptions({ name: 'AssessmentFormListPage' })

const router = useRouter()
const { t } = useLanguage()
const confirm = useConfirm()
const toast = useToast()

const forms = ref([])
const isLoading = ref(false)
const total = ref(0)

const statusSeverity = {
  draft: 'warn',
  published: 'success',
  archived: 'secondary',
}

async function load() {
  isLoading.value = true
  try {
    const res = await assessmentFormApi.list({ module: 'preschool' })
    forms.value = res.data.data
    total.value = res.data.meta?.total ?? forms.value.length
  } finally {
    isLoading.value = false
  }
}

async function archive(id) {
  confirm.require({
    message: t('formBuilder.archiveConfirm'),
    accept: async () => {
      try {
        await assessmentFormApi.archive(id)
        toast.add({ severity: 'success', summary: t('common.success'), life: 3000 })
        await load()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: t('common.error'),
          detail: error?.message || t('common.errorTryAgain'),
          life: 4000,
        })
      }
    },
  })
}

async function duplicate(id) {
  try {
    await assessmentFormApi.duplicate(id)
    toast.add({ severity: 'success', summary: t('common.success'), life: 3000 })
    await load()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error?.message || t('common.errorTryAgain'),
      life: 4000,
    })
  }
}

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="assessment-form-list">
      <HeaderSection :title="t('formBuilder.title')">
        <template #actions>
          <Button
            :label="t('formBuilder.newForm')"
            icon="pi pi-plus"
            @click="router.push({ name: 'assessment-form-create' })"
          />
        </template>
      </HeaderSection>

      <div class="form-guidance">
        <p class="form-guidance__action">
          <span class="form-guidance__icon">📝</span>
          <strong>Create new:</strong> Build forms from scratch or use templates
        </p>
        <p class="form-guidance__action">
          <span class="form-guidance__icon">✏️</span>
          <strong>Edit existing:</strong> Update form structure and settings
        </p>
        <p class="form-guidance__action">
          <span class="form-guidance__icon">📋</span>
          <strong>Manage versions:</strong> Duplicate forms to preserve history
        </p>
      </div>

      <DataTable :value="forms" :loading="isLoading" class="assessment-form-list__table">
        <Column field="name" :header="t('formBuilder.formName')" />
        <Column field="module" :header="t('formBuilder.module')" />
        <Column :header="t('formBuilder.status')">
          <template #body="{ data }">
            <Tag :severity="statusSeverity[data.status]" :value="t(`formBuilder.statuses.${data.status}`)" />
          </template>
        </Column>
        <Column field="current_version" :header="t('formBuilder.version')" />
        <Column :header="t('common.table.actions')">
          <template #body="{ data }">
            <div class="assessment-form-list__actions">
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  size="sm"
                  @click="router.push({ name: 'assessment-form-edit', params: { id: data.id } })"
                />
                <Button
                  icon="pi pi-copy"
                  severity="secondary"
                  size="sm"
                  @click="duplicate(data.id)"
                />
                <Button
                  icon="pi pi-inbox"
                  severity="secondary"
                  size="sm"
                  @click="archive(data.id)"
                />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </MainLayout>
</template>

<style scoped>
.assessment-form-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-guidance {
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-guidance__action {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #1e40af;
}

.form-guidance__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.assessment-form-list__actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .form-guidance {
    gap: 0.5rem;
    padding: 1rem;
  }

  .form-guidance__action {
    font-size: 0.9rem;
  }
}
</style>
