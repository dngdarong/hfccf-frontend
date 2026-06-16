<script setup>
import { computed, ref } from 'vue'
import Button from '@/components/buttons/Button.vue'
import InputText from 'primevue/inputtext'
import { useLanguage } from '@/composables/useLanguage'
import { useFormBuilderStore } from '../../stores/useFormBuilderStore'
import QuestionCard from './QuestionCard.vue'
import AddQuestionPanel from './AddQuestionPanel.vue'

const props = defineProps({
  section: { type: Object, required: true },
  formId:  { type: [String, Number], required: true },
})

const emit = defineEmits(['deleted'])

const { t }  = useLanguage()
const store  = useFormBuilderStore()

const editingTitle       = ref(false)
const localTitle         = ref(props.section.title)
const showAddQuestion    = ref(false)
const deletingSection    = ref(false)

const isPublished = computed(() => store.template?.status === 'published')

const questions = computed(() =>
  (store.template?.questions ?? [])
    .filter((q) => q.section_id === props.section.id)
    .sort((a, b) => a.order - b.order),
)

async function saveTitle() {
  if (localTitle.value.trim() && localTitle.value.trim() !== props.section.title) {
    await store.updateSection(props.section.id, { title: localTitle.value.trim() })
  }
  editingTitle.value = false
}

async function deleteSection() {
  if (!confirm(t('formBuilder.sections.deleteConfirm') || 'Delete this section?')) return
  deletingSection.value = true
  try {
    await store.deleteSection(props.section.id)
    emit('deleted')
  } finally {
    deletingSection.value = false
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden">

    <!-- Section header bar -->
    <div class="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">

      <!-- Editable title -->
      <div class="flex-1 min-w-0">
        <InputText
          v-if="editingTitle"
          v-model="localTitle"
          class="w-full text-base font-bold"
          autofocus
          @blur="saveTitle"
          @keyup.enter="saveTitle"
          @keyup.escape="editingTitle = false"
        />
        <h2
          v-else
          :class="[
            'text-base font-bold leading-tight',
            isPublished ? 'text-slate-800' : 'cursor-text text-slate-800 hover:text-blue-700',
          ]"
          @dblclick="!isPublished && (editingTitle = true)"
        >
          {{ section.title }}
        </h2>
      </div>

      <!-- Question count chip -->
      <span class="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        {{ questions.length }} {{ questions.length === 1 ? 'question' : 'questions' }}
      </span>

      <!-- Section actions -->
      <div v-if="!isPublished" class="flex shrink-0 items-center gap-1">
        <Button
          icon="pi pi-pencil"
          text size="sm"
          v-tooltip.top="'Rename'"
          class="!text-slate-400 hover:!text-blue-600"
          @click="editingTitle = true"
        />
        <Button
          icon="pi pi-trash"
          text size="sm"
          severity="danger"
          :loading="deletingSection"
          v-tooltip.top="'Delete section'"
          @click="deleteSection"
        />
      </div>
    </div>

    <!-- Scrollable questions area -->
    <div class="flex-1 overflow-y-auto px-5 py-4">
      <div class="mx-auto max-w-2xl flex flex-col gap-2.5">

        <!-- Question list -->
        <QuestionCard
          v-for="question in questions"
          :key="question.id"
          :question="question"
          :form-id="formId"
        />

        <!-- Empty state -->
        <div
          v-if="!questions.length && !showAddQuestion"
          class="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center"
        >
          <span class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <i class="pi pi-question-circle text-lg" />
          </span>
          <div>
            <p class="text-sm font-medium text-slate-500">No questions yet</p>
            <p class="mt-0.5 text-xs text-slate-400">Add your first question below.</p>
          </div>
        </div>

        <!-- Add question inline form -->
        <AddQuestionPanel
          v-if="showAddQuestion"
          :section-id="section.id"
          :form-id="formId"
          @close="showAddQuestion = false"
        />

        <!-- Add question button -->
        <button
          v-if="!showAddQuestion && !isPublished"
          class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3.5 text-sm font-medium text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          @click="showAddQuestion = true"
        >
          <i class="pi pi-plus text-xs" />
          {{ t('formBuilder.questions.addQuestion') }}
        </button>

        <!-- Published notice -->
        <div
          v-if="isPublished"
          class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
        >
          <i class="pi pi-lock mr-2" />
          This form is published and locked. Create a new version to make changes.
        </div>
      </div>
    </div>
  </div>
</template>
