<script setup>
import Card from 'primevue/card'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'ConfigurationDiffViewer',
})

const { t } = useLanguage()

defineProps({
  title: {
    type: String,
    default: '',
  },
  beforeState: {
    type: [Object, Array, String, Number, Boolean],
    default: null,
  },
  afterState: {
    type: [Object, Array, String, Number, Boolean],
    default: null,
  },
})

function prettyJson(value) {
  if (value === null || value === undefined || value === '') {
    return '{}'
  }

  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return '{}'
  }
}
</script>

<template>
  <Card>
    <template #title>{{ title }}</template>
    <template #content>
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{{ t('governance.labels.before') }}</p>
          <pre class="whitespace-pre-wrap break-words text-xs text-slate-700">{{ prettyJson(beforeState) }}</pre>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{{ t('governance.labels.after') }}</p>
          <pre class="whitespace-pre-wrap break-words text-xs text-slate-700">{{ prettyJson(afterState) }}</pre>
        </div>
      </div>
    </template>
  </Card>
</template>
