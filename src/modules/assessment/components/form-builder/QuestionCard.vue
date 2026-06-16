<script setup>
import Button from '@/components/buttons/Button.vue'
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentFormApi } from '../../services/assessmentFormApi'
import { useFormBuilderStore } from '../../stores/useFormBuilderStore'

const props = defineProps({
  question: { type: Object, required: true },
  formId:   { type: [String, Number], required: true },
})

const { t }  = useLanguage()
const store  = useFormBuilderStore()

// Icon per question type key
const typeIcon = {
  short_text:   'pi-align-left',
  long_text:    'pi-align-justify',
  number:       'pi-hashtag',
  date:         'pi-calendar',
  radio:        'pi-circle',
  checkbox:     'pi-check-square',
  dropdown:     'pi-chevron-down',
  rating:       'pi-star',
  file:         'pi-upload',
  signature:    'pi-pen-to-square',
  matrix:       'pi-table',
  score_rubric: 'pi-list-check',
}

async function deleteQuestion() {
  await assessmentFormApi.deleteQuestion(props.formId, props.question.id)
  if (store.template?.questions) {
    store.template.questions = store.template.questions.filter((q) => q.id !== props.question.id)
  }
}
</script>

<template>
  <div class="group flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-slate-300 hover:bg-white hover:shadow-sm">

    <!-- Type icon -->
    <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
      <i :class="['pi text-sm', typeIcon[question.question_type_key] ?? 'pi-question-circle']" />
    </span>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-medium text-slate-800 leading-snug">
          {{ question.question_text }}
        </span>
        <span v-if="question.is_required" class="text-xs font-semibold text-red-500">*</span>
      </div>
      <div class="mt-1 flex items-center gap-2">
        <Tag
          :value="t(`formBuilder.questionTypes.${question.question_type_key}`)"
          severity="secondary"
          class="!text-xs !py-0 !px-1.5"
        />
        <span v-if="question.help_text" class="text-xs text-slate-400 truncate">{{ question.help_text }}</span>
      </div>
    </div>

    <!-- Actions (appear on hover) -->
    <div class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Button icon="pi pi-trash" text size="small" severity="danger" @click="deleteQuestion" />
    </div>
  </div>
</template>
