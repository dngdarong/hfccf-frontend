<script setup>
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

// Academic year edits belong to the settings backbone, but the lifecycle page
// owns the record state and current-year promotion rules.
defineOptions({
  name: 'PreschoolAcademicYearDialog',
})

const { t } = useLanguage()

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  draft: {
    type: Object,
    required: true,
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['cancel', 'save', 'update:draft'])

function updateField(field, value) {
  emit('update:draft', {
    ...field.model,
    [field.key]: value,
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="false"
    class="preschool-settings-term-dialog"
    :style="{ width: 'min(92vw, 40rem)' }"
  >
    <template #header>
      <div>
        <h4 class="text-lg font-semibold text-slate-900">{{ title }}</h4>
        <p class="text-sm text-slate-500">{{ t('preschoolLifecyclePage.dialogs.academicYear.subtitle') }}</p>
      </div>
    </template>

    <div class="grid gap-4 md:grid-cols-2 px-1 py-2">
      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolLifecyclePage.fields.yearCode') }}</span>
        <InputText
          :model-value="draft.code"
          class="w-full"
          :placeholder="t('preschoolLifecyclePage.placeholders.yearCode')"
          @update:model-value="updateField({ model: draft, key: 'code' }, $event)"
        />
        <small v-if="errors.code" class="text-xs font-medium text-rose-600">{{ t(`preschoolLifecyclePage.validation.${errors.code}`) }}</small>
      </label>

      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolLifecyclePage.fields.yearLabel') }}</span>
        <InputText
          :model-value="draft.label"
          class="w-full"
          :placeholder="t('preschoolLifecyclePage.placeholders.yearLabel')"
          @update:model-value="updateField({ model: draft, key: 'label' }, $event)"
        />
        <small v-if="errors.label" class="text-xs font-medium text-rose-600">{{ t(`preschoolLifecyclePage.validation.${errors.label}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.startDate') }}</span>
        <DatePicker
          :model-value="draft.startDate"
          date-format="yy-mm-dd"
          show-icon
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.startDate')"
          @update:model-value="updateField({ model: draft, key: 'startDate' }, $event)"
        />
        <small v-if="errors.startDate" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.startDate}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.endDate') }}</span>
        <DatePicker
          :model-value="draft.endDate"
          date-format="yy-mm-dd"
          show-icon
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.endDate')"
          @update:model-value="updateField({ model: draft, key: 'endDate' }, $event)"
        />
        <small v-if="errors.endDate" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.endDate}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.status') }}</span>
        <Select
          :model-value="draft.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.status')"
          @update:model-value="updateField({ model: draft, key: 'status' }, $event)"
        />
        <small v-if="errors.status" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.status}`) }}</small>
      </label>

      <label class="preschool-settings-field md:col-span-2 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <span>{{ t('preschoolLifecyclePage.fields.currentYear') }}</span>
          <p class="text-xs text-slate-500">{{ t('preschoolLifecyclePage.help.currentYear') }}</p>
        </div>
        <input
          :checked="draft.isCurrent"
          type="checkbox"
          class="h-5 w-5 rounded border-slate-300 text-sky-600"
          @change="updateField({ model: draft, key: 'isCurrent' }, $event.target.checked)"
        />
      </label>

      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolLifecyclePage.fields.notes') }}</span>
        <Textarea
          :model-value="draft.notes"
          class="w-full"
          rows="3"
          auto-resize
          :placeholder="t('preschoolLifecyclePage.placeholders.notes')"
          @update:model-value="updateField({ model: draft, key: 'notes' }, $event)"
        />
      </label>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-3">
        <Button variant="ghost" @click="emit('cancel')">{{ t('preschoolSettingsPage.actions.cancel') }}</Button>
        <Button variant="primary" @click="emit('save')">{{ t('preschoolLifecyclePage.actions.saveAcademicYear') }}</Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.preschool-settings-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.preschool-settings-field > span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}
</style>
