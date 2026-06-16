<script setup>
// Keep conflict feedback centralized so timetable forms and list pages show
// the same readable overlap explanation when a save is rejected.
defineProps({
  conflicts: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div v-if="conflicts.length" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    <div class="space-y-1">
      <p v-if="title" class="font-semibold">{{ title }}</p>
      <p v-if="subtitle" class="text-amber-700">{{ subtitle }}</p>
    </div>
    <ul class="mt-3 space-y-2">
      <li v-for="conflict in conflicts" :key="`${conflict.type}-${conflict.schedule?.id}`" class="rounded-xl bg-white/70 px-3 py-2">
        <p class="font-semibold capitalize">{{ conflict.type }}</p>
        <p>{{ conflict.message }}</p>
        <p class="text-xs text-amber-700">
          {{ conflict.schedule?.activityLabel }} - {{ conflict.schedule?.startTime }} to {{ conflict.schedule?.endTime }}
        </p>
      </li>
    </ul>
  </div>
</template>
