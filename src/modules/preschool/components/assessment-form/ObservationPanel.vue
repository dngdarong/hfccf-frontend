<script setup>
import { computed } from 'vue'
import Textarea from 'primevue/textarea'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AssessmentObservationPanel',
})

const props = defineProps({
  observation: {
    type: String,
    default: '',
  },
  teacherComment: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:observation', 'update:teacherComment'])
const { t } = useLanguage()

const observationValue = computed({
  get: () => props.observation,
  set: value => emit('update:observation', value),
})

const teacherCommentValue = computed({
  get: () => props.teacherComment,
  set: value => emit('update:teacherComment', value),
})
</script>

<template>
  <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700">{{ t('assessmentList.observation.title') }}</label>

      <Textarea
        v-model="observationValue"
        :disabled="disabled"
        :placeholder="t('assessmentList.observation.placeholderObservation')"
        rows="4"
        class="w-full"
      />

      <p class="text-xs text-slate-500">
        {{ t('assessmentList.observation.helpObservation') }}
      </p>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700">{{ t('assessmentList.observation.teacherComment') }}</label>

      <Textarea
        v-model="teacherCommentValue"
        :disabled="disabled"
        :placeholder="t('assessmentList.observation.placeholderTeacherComment')"
        rows="3"
        class="w-full"
      />

      <p class="text-xs text-slate-500">
        {{ t('assessmentList.observation.helpTeacherComment') }}
      </p>
    </div>

    <div class="flex justify-between text-xs text-slate-500">
      <span>{{ t('assessmentList.observation.observationCount') }}: {{ observationValue.length }} {{ t('assessmentList.observation.characters') }}</span>
      <span>{{ t('assessmentList.observation.commentCount') }}: {{ teacherCommentValue.length }} {{ t('assessmentList.observation.characters') }}</span>
    </div>
  </section>
</template>
