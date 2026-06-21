<script setup>
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

// The term dialog stays focused on editing one lifecycle term at a time while
// the parent page owns state, persistence, and RBAC decisions.
defineOptions({
  name: 'PreschoolTermDialog',
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
  yearOptions: {
    type: Array,
    default: () => [],
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
        <p class="text-sm text-slate-500">{{ t('preschoolAcademicSettingsPage.dialogs.term.subtitle') }}</p>
      </div>
    </template>

    <div class="grid gap-4 md:grid-cols-2 px-1 py-2">
      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolAcademicSettingsPage.fields.academicYear') }}</span>
        <Select
          :model-value="draft.academicYearId"
          :options="yearOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolAcademicSettingsPage.placeholders.academicYear')"
          @update:model-value="updateField({ model: draft, key: 'academicYearId' }, $event)"
        />
        <small v-if="errors.academicYearId" class="text-xs font-medium text-rose-600">{{ t(`preschoolAcademicSettingsPage.validation.${errors.academicYearId}`) }}</small>
      </label>

      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolAcademicSettingsPage.fields.code') }}</span>
        <InputText
          :model-value="draft.code"
          class="w-full"
          :placeholder="t('preschoolAcademicSettingsPage.placeholders.code')"
          @update:model-value="updateField({ model: draft, key: 'code' }, $event)"
        />
      </label>

      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolAcademicSettingsPage.fields.name') }}</span>
        <InputText
          :model-value="draft.name"
          class="w-full"
          :placeholder="t('preschoolAcademicSettingsPage.placeholders.name')"
          @update:model-value="updateField({ model: draft, key: 'name' }, $event)"
        />
        <small v-if="errors.name" class="text-xs font-medium text-rose-600">{{ t(`preschoolAcademicSettingsPage.validation.${errors.name}`) }}</small>
      </label>

      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolAcademicSettingsPage.fields.description') }}</span>
        <Textarea
          :model-value="draft.description"
          class="w-full"
          rows="3"
          auto-resize
          :placeholder="t('preschoolAcademicSettingsPage.placeholders.description')"
          @update:model-value="updateField({ model: draft, key: 'description' }, $event)"
        />
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolAcademicSettingsPage.fields.startDate') }}</span>
        <DatePicker
          :model-value="draft.startDate"
          date-format="yy-mm-dd"
          show-icon
          class="w-full"
          :placeholder="t('preschoolAcademicSettingsPage.placeholders.startDate')"
          @update:model-value="updateField({ model: draft, key: 'startDate' }, $event)"
        />
        <small v-if="errors.startDate" class="text-xs font-medium text-rose-600">{{ t(`preschoolAcademicSettingsPage.validation.${errors.startDate}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolAcademicSettingsPage.fields.endDate') }}</span>
        <DatePicker
          :model-value="draft.endDate"
          date-format="yy-mm-dd"
          show-icon
          class="w-full"
          :placeholder="t('preschoolAcademicSettingsPage.placeholders.endDate')"
          @update:model-value="updateField({ model: draft, key: 'endDate' }, $event)"
        />
        <small v-if="errors.endDate" class="text-xs font-medium text-rose-600">{{ t(`preschoolAcademicSettingsPage.validation.${errors.endDate}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolAcademicSettingsPage.fields.status') }}</span>
        <Select
          :model-value="draft.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolAcademicSettingsPage.placeholders.status')"
          @update:model-value="updateField({ model: draft, key: 'status' }, $event)"
        />
        <small v-if="errors.status" class="text-xs font-medium text-rose-600">{{ t(`preschoolAcademicSettingsPage.validation.${errors.status}`) }}</small>
      </label>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-3">
        <Button variant="ghost" @click="emit('cancel')">{{ t('common.cancel') }}</Button>
        <Button variant="primary" @click="emit('save')">{{ t('preschoolAcademicSettingsPage.actions.saveTerm') }}</Button>
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
