<script setup>
// FormSectionPanel is kept for backwards compatibility.
// The builder now uses FormSectionCanvas for the 2-panel layout.
import { defineEmits } from 'vue'
import FormSectionCanvas from './FormSectionCanvas.vue'

defineProps({
  section: { type: Object, required: true },
  formId:  { type: [String, Number], default: null },
  index:   { type: Number, default: 0 },
})

const emit = defineEmits(['deleted'])
</script>

<template>
  <FormSectionCanvas
    :section="section"
    :form-id="formId ?? $attrs['form-id']"
    @deleted="emit('deleted')"
  />
</template>
