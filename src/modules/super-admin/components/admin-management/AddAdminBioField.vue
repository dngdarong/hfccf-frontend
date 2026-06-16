<script setup>
defineOptions({
  name: 'AddAdminBioField',
})

defineProps({
  bio: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  helpText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:bio'])
</script>

<template>
  <label class="flex flex-col gap-2">
    <span class="text-[0.8rem] font-bold uppercase tracking-[0.03em] text-slate-900">
      {{ label }}
    </span>

    <textarea
      :value="bio"
      rows="4"
      class="min-h-[7.5rem] rounded-[0.9rem] border border-[#d4dde8] bg-[#fcfdff] px-3 py-3 text-[0.88rem] leading-6 text-slate-900 outline-none transition focus:border-[var(--hope-o-cyan-blue)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,174,239,0.15)]"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="emit('update:bio', $event.target.value)"
    />

    <span
      v-if="helpText"
      class="text-[0.76rem] leading-5 text-slate-500"
    >
      {{ helpText }}
    </span>
  </label>
</template>
