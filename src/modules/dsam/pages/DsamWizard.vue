<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useDsamWizardStore } from '../stores/useDsamWizardStore'
import QuestionRendererFactory from '../components/wizard/QuestionRendererFactory.vue'
import Button from '@/components/buttons/Button.vue'
import ProgressBar from 'primevue/progressbar'

defineOptions({ name: 'DsamWizardPage' })

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const store  = useDsamWizardStore()

const showReview = ref(false)

// Auto-save every 30 seconds
let autoSaveInterval = null

onMounted(async () => {
  const submissionId = route.query.submission
  const formId       = route.query.form
  const studentId    = route.query.student
  const yearId       = route.query.year

  if (submissionId) {
    await store.resume(submissionId)
  } else if (formId && studentId && yearId) {
    await store.start(Number(formId), Number(studentId), Number(yearId))
  }

  autoSaveInterval = setInterval(() => { store.saveDraft() }, 30_000)
})

onUnmounted(() => {
  clearInterval(autoSaveInterval)
  store.reset()
})

function getAnswer(questionId) {
  const a = store.answers[questionId] ?? {}
  // Return the typed field that's populated
  return a.json_value ?? a.text_value ?? a.number_value ?? a.date_value ?? null
}

function setAnswer(question, value) {
  const typeName = question.question_type?.name
  let payload
  if (['checkbox'].includes(typeName)) {
    payload = { json_value: value }
  } else if (['number', 'rating_scale'].includes(typeName)) {
    payload = { number_value: value }
  } else if (typeName === 'date') {
    payload = { date_value: value instanceof Date ? value.toISOString().split('T')[0] : value }
  } else {
    payload = { text_value: value }
  }
  store.setAnswer(question.id, payload)
}

async function handleNext() {
  if (store.isLastStep) {
    showReview.value = true
  } else {
    await store.next()
  }
}

async function handleSubmit() {
  const ok = await store.submit()
  if (ok) {
    toast.add({ severity: 'success', summary: 'Submitted', detail: 'Assessment submitted for review.', life: 4000 })
    router.push({ name: 'dsam-submission-list' })
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: store.error?.message, life: 5000 })
  }
}

const lastSavedLabel = computed(() => {
  if (!store.lastSavedAt) return null
  return 'Saved at ' + store.lastSavedAt.toLocaleTimeString()
})
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-slate-50">

    <!-- Topbar with progress -->
    <header class="shrink-0 border-b border-slate-200 bg-white shadow-sm">
      <div class="flex items-center gap-3 px-4 py-3">
        <button class="rounded p-1.5 text-slate-400 hover:bg-slate-100" @click="router.back()">
          <i class="pi pi-arrow-left" />
        </button>
        <div class="flex-1">
          <h1 class="text-sm font-semibold text-slate-800">
            {{ store.submission?.form_template?.name ?? 'Assessment Wizard' }}
          </h1>
          <p class="text-xs text-slate-400">
            {{ store.submission?.student?.full_name }}
          </p>
        </div>
        <span v-if="lastSavedLabel" class="text-xs text-slate-400 flex items-center gap-1">
          <i class="pi pi-check text-emerald-500" />{{ lastSavedLabel }}
        </span>
        <span v-if="store.isSaving" class="text-xs text-slate-400">
          <i class="pi pi-spin pi-spinner" /> Saving…
        </span>
      </div>
      <ProgressBar :value="store.progressPct" :show-value="false" class="h-1 rounded-none" />
    </header>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex flex-1 items-center justify-center text-slate-400">
      <i class="pi pi-spin pi-spinner text-3xl" />
    </div>

    <!-- Review page -->
    <div v-else-if="showReview" class="flex flex-1 flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-4">
        <h2 class="text-lg font-bold text-slate-800">Review & Submit</h2>
        <p class="text-sm text-slate-500">Please review your answers before submitting.</p>

        <div
          v-for="section in store.sections"
          :key="section.id"
          class="rounded-xl border border-slate-200 bg-white p-4"
        >
          <h3 class="mb-3 text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            {{ section.title }}
          </h3>
          <div
            v-for="q in section.questions ?? []"
            :key="q.id"
            class="mb-3"
          >
            <p class="text-xs text-slate-500">{{ q.label }}</p>
            <p class="text-sm font-medium text-slate-800 mt-0.5">
              {{ getAnswer(q.id) ?? '—' }}
            </p>
          </div>
        </div>
      </div>

      <footer class="shrink-0 border-t border-slate-200 bg-white px-6 py-3 flex justify-between">
        <Button label="Back" severity="secondary" @click="showReview = false" />
        <Button
          label="Submit Assessment"
          icon="pi pi-send"
          :loading="store.isSubmitting"
          @click="handleSubmit"
        />
      </footer>
    </div>

    <!-- Step content -->
    <template v-else-if="store.currentSection">
      <div class="flex-1 overflow-y-auto p-6">
        <div class="mx-auto max-w-2xl space-y-6">

          <!-- Section header -->
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-medium text-blue-600">
                Step {{ store.currentStep + 1 }} of {{ store.totalSteps }}
              </span>
            </div>
            <h2 class="text-xl font-bold text-slate-800">{{ store.currentSection.title }}</h2>
            <p v-if="store.currentSection.description" class="mt-1 text-sm text-slate-500">
              {{ store.currentSection.description }}
            </p>
          </div>

          <!-- Questions -->
          <div class="space-y-5">
            <div
              v-for="question in store.currentSection.questions ?? []"
              :key="question.id"
              class="rounded-xl border border-slate-200 bg-white p-5"
            >
              <p class="mb-3 text-sm font-medium text-slate-800">
                {{ question.label }}
                <span v-if="question.is_required" class="text-red-500 ml-0.5">*</span>
              </p>
              <p v-if="question.help_text" class="mb-3 text-xs text-slate-400">
                {{ question.help_text }}
              </p>
              <QuestionRendererFactory
                :question="question"
                :model-value="getAnswer(question.id)"
                @update:model-value="(v) => setAnswer(question, v)"
              />
            </div>

            <div v-if="!(store.currentSection.questions ?? []).length" class="text-center py-8 text-sm text-slate-400">
              This section has no questions.
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation footer -->
      <footer class="shrink-0 border-t border-slate-200 bg-white px-6 py-3 flex items-center justify-between">
        <Button
          label="Back"
          severity="secondary"
          icon="pi pi-arrow-left"
          :disabled="store.currentStep === 0"
          @click="store.prev()"
        />
        <span class="text-xs text-slate-400">
          {{ store.currentStep + 1 }} / {{ store.totalSteps }}
        </span>
        <Button
          :label="store.isLastStep ? 'Review' : 'Next'"
          :icon="store.isLastStep ? 'pi pi-list' : 'pi pi-arrow-right'"
          icon-pos="right"
          :loading="store.isSaving"
          @click="handleNext"
        />
      </footer>
    </template>

    <!-- No submission -->
    <div v-else class="flex flex-1 items-center justify-center text-slate-400 text-center p-10">
      <div>
        <i class="pi pi-exclamation-triangle mb-3 text-4xl" />
        <p class="font-medium">Nothing to show</p>
        <p class="text-sm mt-1">Please start from the submission list.</p>
      </div>
    </div>
  </div>
</template>
