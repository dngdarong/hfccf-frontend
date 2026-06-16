<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import Rating from 'primevue/rating'

const props = defineProps({
  question: { type: Object, required: true },
  modelValue: { type: [String, Number, Array, Object], default: null },
})

const emit = defineEmits(['update:modelValue'])

const val = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const typeName = computed(() => props.question.question_type?.name ?? '')
</script>

<template>
  <div class="space-y-1">
    <!-- Short text -->
    <InputText
      v-if="typeName === 'short_text'"
      v-model="val"
      class="w-full"
      :placeholder="question.placeholder"
    />

    <!-- Long text -->
    <Textarea
      v-else-if="typeName === 'long_text'"
      v-model="val"
      class="w-full"
      rows="4"
      auto-resize
      :placeholder="question.placeholder"
    />

    <!-- Number -->
    <InputNumber
      v-else-if="typeName === 'number'"
      v-model="val"
      class="w-full"
      :min="question.validation_rules?.min"
      :max="question.validation_rules?.max"
    />

    <!-- Date -->
    <DatePicker
      v-else-if="typeName === 'date'"
      v-model="val"
      class="w-full"
      date-format="yy-mm-dd"
    />

    <!-- Radio -->
    <div v-else-if="typeName === 'radio'" class="space-y-2">
      <div
        v-for="opt in question.options ?? []"
        :key="opt.id"
        class="flex items-center gap-2"
      >
        <RadioButton :inputId="`r_${opt.id}`" :value="opt.value" v-model="val" />
        <label :for="`r_${opt.id}`" class="cursor-pointer text-sm text-slate-700">{{ opt.label }}</label>
      </div>
    </div>

    <!-- Checkbox (multi) -->
    <div v-else-if="typeName === 'checkbox'" class="space-y-2">
      <div
        v-for="opt in question.options ?? []"
        :key="opt.id"
        class="flex items-center gap-2"
      >
        <Checkbox :inputId="`c_${opt.id}`" :value="opt.value" v-model="val" />
        <label :for="`c_${opt.id}`" class="cursor-pointer text-sm text-slate-700">{{ opt.label }}</label>
      </div>
    </div>

    <!-- Dropdown -->
    <Select
      v-else-if="typeName === 'dropdown'"
      v-model="val"
      :options="question.options ?? []"
      option-label="label"
      option-value="value"
      class="w-full"
      :placeholder="question.placeholder || 'Select...'"
    />

    <!-- Rating scale -->
    <div v-else-if="typeName === 'rating_scale'" class="flex items-center gap-3">
      <span class="text-xs text-slate-500">{{ question.config?.min_label }}</span>
      <Rating v-model="val" :stars="question.config?.max ?? 5" />
      <span class="text-xs text-slate-500">{{ question.config?.max_label }}</span>
    </div>

    <!-- File upload (placeholder) -->
    <div v-else-if="typeName === 'file_upload'" class="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
      <i class="pi pi-upload mb-2 text-2xl" />
      <p>Click to upload a file</p>
    </div>

    <!-- Fallback -->
    <div v-else class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 italic">
      {{ typeName }} — renderer not yet implemented
    </div>
  </div>
</template>
