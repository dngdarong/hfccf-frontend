<script setup>
import { computed, ref, watch } from 'vue'

defineOptions({
  name: 'AddAdminProfileImageField',
})

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  removeLabel: {
    type: String,
    required: true,
  },
  preview: {
    type: String,
    default: '',
  },
  fallbackLabel: {
    type: String,
    default: '?',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change', 'remove'])

const hasImageError = ref(false)
const isImageLoaded = ref(false)

const resolvedPreview = computed(() => String(props.preview || '').trim())
const shouldShowImage = computed(() =>
  Boolean(resolvedPreview.value) && Boolean(isImageLoaded.value) && !hasImageError.value,
)

watch(
  () => resolvedPreview.value,
  () => {
    hasImageError.value = false
    isImageLoaded.value = false
  },
)

function onImageLoad() {
  isImageLoaded.value = true
}

function onImageError() {
  hasImageError.value = true
  isImageLoaded.value = false
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-[0.8rem] font-bold uppercase tracking-[0.03em] text-slate-900">
      {{ props.title }}
    </span>

    <div class="flex flex-wrap items-center gap-3 rounded-[0.9rem] border border-dashed border-[#c9d9e8] bg-[#f9fcff] p-3">
      <div
        v-if="props.preview"
        class="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#c7d9ea] shadow-[0_6px_14px_-10px_rgba(15,23,42,0.6)]"
      >
        <div
          v-if="!shouldShowImage"
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 to-sky-700 text-[0.82rem] font-extrabold uppercase tracking-[0.08em] text-white"
        >
          {{ props.fallbackLabel }}
        </div>

        <img
          :src="props.preview"
          alt="Profile preview"
          class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-150"
          :class="{ 'opacity-100': shouldShowImage }"
          @load="onImageLoad"
          @error="onImageError"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="max-w-[260px] text-[0.8rem] text-slate-700"
          :disabled="props.disabled"
          @change="emit('change', $event)"
        />

        <button
          v-if="props.preview"
          type="button"
          class="rounded-[0.6rem] border border-rose-200 bg-rose-50 px-3 py-1.5 text-[0.78rem] font-semibold text-rose-700"
          :disabled="props.disabled"
          @click="emit('remove')"
        >
          {{ props.removeLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
