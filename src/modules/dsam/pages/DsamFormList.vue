<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { dsamFormApi } from '../services/dsamFormApi'

defineOptions({ name: 'DsamFormListPage' })

const router  = useRouter()
const toast   = useToast()
const confirm = useConfirm()

const forms   = ref([])
const loading = ref(false)
const total   = ref(0)

const statusSeverity = { draft: 'warn', published: 'success', archived: 'secondary' }

async function load() {
  loading.value = true
  try {
    const res = await dsamFormApi.list()
    forms.value = res.data.data ?? []
    total.value = res.data.meta?.total ?? forms.value.length
  } finally {
    loading.value = false
  }
}

async function duplicate(id) {
  try {
    await dsamFormApi.duplicate(id)
    toast.add({ severity: 'success', summary: 'Duplicated', life: 3000 })
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 4000 })
  }
}

async function remove(id) {
  confirm.require({
    message: 'Delete this form template?',
    accept: async () => {
      try {
        await dsamFormApi.delete(id)
        toast.add({ severity: 'success', summary: 'Deleted', life: 3000 })
        await load()
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 4000 })
      }
    },
  })
}

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="flex flex-col gap-6">
      <HeaderSection title="Assessment Forms">
        <template #actions>
          <Button
            label="New Form"
            icon="pi pi-plus"
            @click="router.push({ name: 'dsam-form-builder' })"
          />
        </template>
      </HeaderSection>

      <DataTable :value="forms" :loading="loading" class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <Column field="name" header="Form Name" sortable>
          <template #body="{ data }">
            <div>
              <p class="font-medium text-slate-800">{{ data.name }}</p>
              <p v-if="data.name_kh" class="text-xs text-slate-400">{{ data.name_kh }}</p>
            </div>
          </template>
        </Column>
        <Column field="category" header="Category" />
        <Column header="Version">
          <template #body="{ data }">v{{ data.version_number }}</template>
        </Column>
        <Column field="academic_year.name" header="Year" />
        <Column header="Status">
          <template #body="{ data }">
            <Tag :severity="statusSeverity[data.status]" :value="data.status" />
          </template>
        </Column>
        <Column header="Sections">
          <template #body="{ data }">{{ data.section_count ?? '—' }}</template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                size="sm"
                title="Edit"
                @click="router.push({ name: 'dsam-form-builder-edit', params: { id: data.id } })"
              />
              <Button
                icon="pi pi-code-branch"
                severity="secondary"
                size="sm"
                title="Versions"
                @click="router.push({ name: 'dsam-form-versions', params: { id: data.id } })"
              />
              <Button
                icon="pi pi-copy"
                severity="secondary"
                size="sm"
                title="Duplicate"
                @click="duplicate(data.id)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                size="sm"
                title="Delete"
                :disabled="data.is_published"
                @click="remove(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </MainLayout>
</template>
