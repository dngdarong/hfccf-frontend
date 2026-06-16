<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Rating from 'primevue/rating'
import FileUpload from 'primevue/fileupload'

const props = defineProps({
  question: { type: Object, required: true },
  modelValue: { type: [String, Number, Array, Object, Boolean], default: null },
})

const emit = defineEmits(['update:modelValue'])

const typeKey = computed(() => props.question.question_type_key ?? props.question.question_type?.key)

const optionItems = computed(() =>
  (props.question.options ?? []).map((o) => ({ label: o.option_text, value: o.id })),
)

function update(val) {
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="question-renderer">
    <div class="question-renderer__label">
      {{ question.question_text }}
      <span v-if="question.is_required" class="question-renderer__required">*</span>
    </div>
    <div v-if="question.help_text" class="question-renderer__help">{{ question.help_text }}</div>

    <!-- short_text -->
    <InputText
      v-if="typeKey === 'short_text'"
      :model-value="modelValue"
      :placeholder="question.placeholder"
      class="w-full"
      @update:model-value="update"
    />

    <!-- long_text -->
    <Textarea
      v-else-if="typeKey === 'long_text'"
      :model-value="modelValue"
      :placeholder="question.placeholder"
      rows="4"
      class="w-full"
      @update:model-value="update"
    />

    <!-- number -->
    <InputNumber
      v-else-if="typeKey === 'number'"
      :model-value="modelValue"
      class="w-full"
      @update:model-value="update"
    />

    <!-- date -->
    <DatePicker
      v-else-if="typeKey === 'date'"
      :model-value="modelValue"
      date-format="yy-mm-dd"
      class="w-full"
      @update:model-value="update"
    />

    <!-- radio -->
    <div v-else-if="typeKey === 'radio'" class="question-renderer__options">
      <div v-for="opt in optionItems" :key="opt.value" class="question-renderer__option">
        <RadioButton
          :input-id="`q${question.id}_${opt.value}`"
          :model-value="modelValue"
          :value="opt.value"
          @update:model-value="update"
        />
        <label :for="`q${question.id}_${opt.value}`">{{ opt.label }}</label>
      </div>
    </div>

    <!-- checkbox -->
    <div v-else-if="typeKey === 'checkbox'" class="question-renderer__options">
      <div v-for="opt in optionItems" :key="opt.value" class="question-renderer__option">
        <Checkbox
          :input-id="`q${question.id}_${opt.value}`"
          :model-value="Array.isArray(modelValue) ? modelValue : []"
          :value="opt.value"
          @update:model-value="update"
        />
        <label :for="`q${question.id}_${opt.value}`">{{ opt.label }}</label>
      </div>
    </div>

    <!-- dropdown -->
    <Select
      v-else-if="typeKey === 'dropdown'"
      :model-value="modelValue"
      :options="optionItems"
      option-label="label"
      option-value="value"
      class="w-full"
      @update:model-value="update"
    />

    <!-- multi_select -->
    <MultiSelect
      v-else-if="typeKey === 'multi_select'"
      :model-value="modelValue"
      :options="optionItems"
      option-label="label"
      option-value="value"
      class="w-full"
      @update:model-value="update"
    />

    <!-- rating_scale -->
    <Rating
      v-else-if="typeKey === 'rating_scale'"
      :model-value="modelValue"
      :stars="question.config?.max ?? 5"
      @update:model-value="update"
    />

    <!-- file_upload / image_upload -->
    <FileUpload
      v-else-if="typeKey === 'file_upload' || typeKey === 'image_upload'"
      mode="basic"
      :accept="typeKey === 'image_upload' ? 'image/*' : undefined"
      auto
    />

    <!-- score_rubric, matrix, dynamic_table, calculated, conditional, repeating_group, signature, gps_location -->
    <div v-else class="question-renderer__unsupported">
      <i class="pi pi-info-circle" />
      <span>{{ typeKey }}</span>
    </div>
  </div>
</template>

<style scoped>
.question-renderer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-renderer__label {
  font-weight: 500;
  font-size: 0.9375rem;
}

.question-renderer__required {
  color: var(--red-500);
  margin-left: 2px;
}

.question-renderer__help {
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
}

.question-renderer__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-renderer__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.question-renderer__unsupported {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  font-style: italic;
}
</style>
