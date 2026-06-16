<script setup>
import { computed, ref } from 'vue'
import Button from '@/components/buttons/Button.vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentFormApi } from '../../services/assessmentFormApi'
import { useFormBuilderStore } from '../../stores/useFormBuilderStore'

const props = defineProps({
  sectionId: { type: [String, Number], required: true },
  formId:    { type: [String, Number], required: true },
})

const emit = defineEmits(['close'])

const { t }  = useLanguage()
const store  = useFormBuilderStore()

const form = ref({
  section_id:       props.sectionId,
  question_text:    '',
  help_text:        '',
  question_type_id: null,
  is_required:      false,
  order:            1,
})

const typeOptions = computed(() =>
  store.questionTypes.map((qt) => ({
    label: t(`formBuilder.questionTypes.${qt.key}`),
    value: qt.id,
    key:   qt.key,
  })),
)

const isSaving = ref(false)

async function save() {
  if (!form.value.question_text.trim() || !form.value.question_type_id) return
  isSaving.value = true
  try {
    const res = await assessmentFormApi.createQuestion(props.formId, form.value)
    if (!store.template.questions) store.template.questions = []
    store.template.questions.push(res.data.data)
    emit('close')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="rounded-xl border border-blue-200 bg-blue-50/50 p-4">

    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-700">
        {{ t('formBuilder.questions.addQuestion') }}
      </h3>
      <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
        <i class="pi pi-times text-sm" />
      </button>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">

      <!-- Question text -->
      <div class="md:col-span-2 flex flex-col gap-1.5">
        <label class="text-xs font-medium text-slate-600">
          {{ t('formBuilder.questions.questionText') }} <span class="text-red-400">*</span>
        </label>
        <InputText
          v-model="form.question_text"
          class="w-full"
          :placeholder="t('formBuilder.questions.questionText')"
          autofocus
        />
      </div>

      <!-- Question type -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium text-slate-600">
          {{ t('formBuilder.questions.questionType') }} <span class="text-red-400">*</span>
        </label>
        <Select
          v-model="form.question_type_id"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          :placeholder="t('formBuilder.questions.questionType')"
          class="w-full"
        />
      </div>

      <!-- Help text -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium text-slate-600">{{ t('formBuilder.questions.helpText') }}</label>
        <Textarea
          v-model="form.help_text"
          rows="1"
          auto-resize
          class="w-full"
          :placeholder="t('formBuilder.questions.helpText')"
        />
      </div>

      <!-- Required toggle -->
      <div class="md:col-span-2 flex items-center gap-2">
        <Checkbox v-model="form.is_required" binary input-id="q-required" />
        <label for="q-required" class="cursor-pointer text-sm text-slate-600">
          {{ t('formBuilder.questions.required') }}
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-4 flex justify-end gap-2">
      <Button :label="t('common.cancel')" severity="secondary" size="sm" @click="emit('close')" />
      <Button
        :label="t('common.save')"
        size="sm"
        :loading="isSaving"
        :disabled="!form.question_text.trim() || !form.question_type_id"
        @click="save"
      />
    </div>
  </div>
</template>
