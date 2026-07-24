<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'
import { useToast } from 'primevue/usetoast'
import { useDsamFormBuilderStore } from '../stores/useDsamFormBuilderStore'
import { dsamFormApi } from '../services/dsamFormApi'
import SectionPanel from '../components/form-builder/SectionPanel.vue'
import QuestionCard from '../components/form-builder/QuestionCard.vue'
import InspectorPanel from '../components/form-builder/InspectorPanel.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import Tag from 'primevue/tag'

defineOptions({ name: 'DsamFormBuilderPage' })

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const store  = useDsamFormBuilderStore()

const addingQuestion = ref(false)
const selectedTypeId = ref(null)

const statusSeverity = { draft: 'warn', published: 'success', archived: 'secondary' }

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await store.load(id)
  } else {
    store.reset()
    await store.load(await createNewForm())
  }
})

onUnmounted(() => store.reset())

async function createNewForm() {
  const res = await dsamFormApi.create({
    name: 'Untitled Form',
    category: 'annual_assessment',
  })
  router.replace({ name: 'dsam-form-builder-edit', params: { id: res.data.data.id } })
  return res.data.data.id
}

async function addQuestion() {
  if (!selectedTypeId.value || !store.activeSectionId) return
  await store.addQuestion(store.activeSectionId, {
    question_type_id: selectedTypeId.value,
    label: 'New question',
  })
  addingQuestion.value = false
  selectedTypeId.value = null
}

async function publish() {
  try {
    await store.publish()
    toast.add({ severity: 'success', summary: 'Published', detail: 'Form is now live.', life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 4000 })
  }
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-slate-100">
    <div class="border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
      <Breadcrumb />
    </div>

    <!-- Topbar -->
    <header class="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm">
      <button
        class="rounded p-1.5 text-slate-400 hover:bg-slate-100"
        @click="router.push({ name: 'dsam-form-list' })"
      >
        <i class="pi pi-arrow-left" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="truncate text-sm font-semibold text-slate-800">
          {{ store.template?.name ?? 'Loading…' }}
        </h1>
        <p class="text-xs text-slate-400">Form Builder</p>
      </div>
      <Tag
        v-if="store.template?.status"
        :severity="statusSeverity[store.template.status]"
        :value="store.template.status"
      />
      <Button
        v-if="!store.isPublished"
        label="Publish"
        icon="pi pi-send"
        size="sm"
        @click="publish"
      />
    </header>

    <!-- 3-panel body -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Left: Section list -->
      <SectionPanel />

      <!-- Center: Canvas -->
      <main class="flex flex-1 flex-col overflow-hidden">
        <div v-if="store.isLoading" class="flex flex-1 items-center justify-center text-slate-400">
          <i class="pi pi-spin pi-spinner text-2xl" />
        </div>

        <div v-else-if="!store.activeSection" class="flex flex-1 items-center justify-center text-center text-slate-400 p-10">
          <div>
            <i class="pi pi-layout mb-3 text-4xl" />
            <p class="font-medium">Add a section first</p>
            <p class="text-sm mt-1">Use the panel on the left to add your first section.</p>
          </div>
        </div>

        <template v-else>
          <!-- Section header -->
          <div class="flex items-center gap-2 border-b border-slate-200 bg-white px-5 py-3">
            <h2 class="flex-1 text-sm font-semibold text-slate-800">
              {{ store.activeSection.title }}
            </h2>
            <span class="text-xs text-slate-400">
              weight: {{ (Number(store.activeSection.scoring_weight) * 100).toFixed(0) }}%
            </span>
          </div>

          <!-- Questions -->
          <div class="flex-1 overflow-y-auto p-5 space-y-2">
            <QuestionCard
              v-for="question in store.activeSection.questions ?? []"
              :key="question.id"
              :question="question"
              :section-id="store.activeSection.id"
            />

            <div v-if="!(store.activeSection.questions ?? []).length" class="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No questions in this section yet.
            </div>

            <!-- Add question -->
            <div v-if="!store.isPublished">
              <div v-if="addingQuestion" class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
                <Select
                  v-model="selectedTypeId"
                  :options="store.questionTypes"
                  option-label="display_name"
                  option-value="id"
                  placeholder="Select question type…"
                  class="flex-1"
                />
                <Button label="Add" size="sm" :disabled="!selectedTypeId" @click="addQuestion" />
                <Button label="Cancel" size="sm" severity="secondary" @click="addingQuestion = false" />
              </div>
              <button
                v-else
                class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-200 py-3 text-sm text-blue-500 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                @click="addingQuestion = true"
              >
                <i class="pi pi-plus" />
                Add question
              </button>
            </div>
          </div>
        </template>
      </main>

      <!-- Right: Inspector -->
      <InspectorPanel />

    </div>
  </div>
</template>
