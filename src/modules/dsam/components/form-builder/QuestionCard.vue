<script setup>
import { useDsamFormBuilderStore } from '../../stores/useDsamFormBuilderStore'

const props = defineProps({
  question:  { type: Object, required: true },
  sectionId: { type: Number, required: true },
})

const store = useDsamFormBuilderStore()

const typeIcon = {
  short_text:   'pi-align-left',
  long_text:    'pi-align-justify',
  number:       'pi-hashtag',
  date:         'pi-calendar',
  radio:        'pi-circle',
  checkbox:     'pi-check-square',
  dropdown:     'pi-chevron-down',
  rating_scale: 'pi-star',
  table_grid:   'pi-table',
  file_upload:  'pi-upload',
  signature:    'pi-pen-to-square',
  score_rubric: 'pi-list-check',
  conditional:  'pi-code-branch',
}

function selectQuestion() {
  store.setActiveQuestion(props.question.id)
}

async function remove() {
  if (!confirm('Delete this question?')) return
  await store.deleteQuestion(props.sectionId, props.question.id)
}
</script>

<template>
  <div
    :class="[
      'group relative rounded-lg border bg-white px-4 py-3 shadow-sm cursor-pointer transition-all',
      store.activeQuestionId === question.id
        ? 'border-blue-400 ring-1 ring-blue-400'
        : 'border-slate-200 hover:border-slate-300',
    ]"
    @click="selectQuestion"
  >
    <!-- type icon + label -->
    <div class="flex items-start gap-3">
      <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
        <i :class="['pi text-sm', typeIcon[question.question_type?.name] ?? 'pi-question-circle']" />
      </span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-slate-800 leading-snug line-clamp-2">
          {{ question.label }}
        </p>
        <p class="mt-0.5 text-xs text-slate-400">
          {{ question.question_type?.display_name ?? question.question_type?.name }}
          <span v-if="question.is_required" class="ml-1 text-red-400">*</span>
          <span v-if="question.is_scored" class="ml-1 text-emerald-500">(scored)</span>
        </p>
      </div>
    </div>

    <!-- Conditional badge -->
    <span
      v-if="question.is_conditional"
      class="absolute top-2 right-2 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600"
    >
      conditional
    </span>

    <!-- Delete button (shown only when not published) -->
    <button
      v-if="!store.isPublished"
      class="absolute bottom-2 right-2 hidden rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500 group-hover:flex"
      @click.stop="remove"
    >
      <i class="pi pi-trash text-xs" />
    </button>
  </div>
</template>
