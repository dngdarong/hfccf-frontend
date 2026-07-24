<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { getCommandCenterTone } from './commandCenterTone'

defineOptions({
  name: 'DepartmentHealthItem',
})

const props = defineProps({
  department: {
    type: Object,
    required: true,
  },
})

const tone = computed(() => getCommandCenterTone(props.department.status))
</script>

<template>
  <article
    class="rounded-[0.95rem] border border-surface-200 bg-white p-4 shadow-[0_14px_30px_-28px_rgba(15,23,42,0.3)]"
    :class="[tone.surfaceClass]"
  >
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h4 class="text-[0.96rem] font-bold text-slate-900">
            {{ department.name }}
          </h4>
          <StatusBadge :status="department.status" :label="department.statusLabel" size="sm" />
        </div>
        <p v-if="department.reportingLabel" class="mt-1 text-[0.84rem] text-slate-600">
          {{ department.issueCount }} {{ department.issueLabel }}
          <span class="mx-1 text-slate-400">&bull;</span>
          {{ department.completeness }} {{ department.reportingLabel }}
        </p>
      </div>

      <Button
        v-if="department.actionLabel"
        type="button"
        severity="secondary"
        text
        rounded
        :label="department.actionLabel"
        class="!px-0 !text-[0.8rem] !font-semibold !text-brand-700"
        icon="pi pi-arrow-right"
        icon-pos="right"
      />
    </div>
  </article>
</template>

