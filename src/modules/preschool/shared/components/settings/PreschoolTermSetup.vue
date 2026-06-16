<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'
import PreschoolTermDialog from './PreschoolTermDialog.vue'

// Keep term management in a dedicated section so the page can stay focused on
// layout while the reusable list/dialog combination owns the term workflow.
defineOptions({
  name: 'PreschoolTermSetup',
})

const { t } = useLanguage()

defineProps({
  terms: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  dialogVisible: {
    type: Boolean,
    default: false,
  },
  dialogTitle: {
    type: String,
    required: true,
  },
  dialogDraft: {
    type: Object,
    required: true,
  },
  dialogErrors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits([
  'open-add',
  'open-edit',
  'remove',
  'cancel',
  'save',
  'update:dialogDraft',
])

function formatDate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return '—'
  }

  return value.toLocaleDateString('en-GB')
}
</script>

<template>
  <PreschoolSettingsSectionCard
    :eyebrow="t('preschoolSettingsPage.sections.terms.eyebrow')"
    :title="t('preschoolSettingsPage.sections.terms.title')"
    :subtitle="t('preschoolSettingsPage.sections.terms.subtitle')"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-500">{{ t('preschoolSettingsPage.sections.terms.description') }}</p>
      <Button variant="primary" @click="emit('open-add')">{{ t('preschoolSettingsPage.actions.addTerm') }}</Button>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <article
        v-for="(term, index) in terms"
        :key="term.id || `${term.name}-${index}`"
        class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.45)]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h4 class="text-base font-semibold text-slate-900">{{ term.name }}</h4>
            <p class="text-sm text-slate-500">{{ formatDate(term.startDate) }} - {{ formatDate(term.endDate) }}</p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="term.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
          >
            {{ t(`preschoolSettingsPage.termStatuses.${term.status || 'inactive'}`) }}
          </span>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <Button variant="ghost" @click="emit('open-edit', index)">{{ t('preschoolSettingsPage.actions.edit') }}</Button>
          <Button variant="ghost" @click="emit('remove', index)">{{ t('preschoolSettingsPage.actions.remove') }}</Button>
        </div>
      </article>

      <div v-if="!terms.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 lg:col-span-2">
        {{ t('preschoolSettingsPage.emptyStates.terms') }}
      </div>
    </div>

    <PreschoolTermDialog
      :visible="dialogVisible"
      :title="dialogTitle"
      :draft="dialogDraft"
      :status-options="statusOptions"
      :errors="dialogErrors"
      @update:draft="emit('update:dialogDraft', $event)"
      @cancel="emit('cancel')"
      @save="emit('save')"
    />
  </PreschoolSettingsSectionCard>
</template>