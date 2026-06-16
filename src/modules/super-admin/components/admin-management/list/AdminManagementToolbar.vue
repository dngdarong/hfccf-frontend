<script setup>
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'AdminManagementToolbar',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  countText: {
    type: String,
    default: '',
  },
  addLabel: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['add'])
</script>

<template>
  <div
    class="flex flex-col gap-4 rounded-2xl border border-surface-200/90 bg-white p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.42)] md:flex-row md:items-center md:justify-between md:p-5"
  >
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        <span class="h-2.5 w-2.5 rounded-full bg-cyan-500" aria-hidden="true"></span>
        <p class="text-[0.74rem] font-bold uppercase tracking-[0.18em] text-slate-500">
          {{ title }}
        </p>
      </div>
      <p v-if="note" class="mt-2 text-[0.92rem] leading-6 text-slate-600">
        {{ note }}
      </p>
      <p v-if="countText" class="mt-1 text-[0.84rem] font-semibold text-slate-500">
        {{ countText }}
      </p>
    </div>

    <div
      class="flex flex-col gap-2 rounded-[1.15rem] border border-cyan-100 bg-gradient-to-b from-cyan-50/70 to-white p-2 shadow-[0_16px_30px_-26px_rgba(0,174,239,0.45)] sm:flex-row sm:items-center"
    >
      <Button
        type="button"
        variant="primary"
        size="md"
        rounded="xl"
        class="min-w-36 justify-center !px-5 !py-3 !text-[0.88rem] !font-extrabold sm:min-w-40"
        @click="emit('add')"
      >
        <template #iconLeft>
          <i class="pi pi-plus" aria-hidden="true"></i>
        </template>
        {{ addLabel }}
      </Button>
    </div>
  </div>
</template>
