<script setup>
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

// Keep class-level configuration editable in a compact grid so the page owns
// the structure while this section only handles the repeatable form rows.
defineOptions({
  name: 'PreschoolClassConfiguration',
})

const { t } = useLanguage()

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  levelOptions: {
    type: Array,
    default: () => [],
  },
  teacherOptions: {
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

const emit = defineEmits(['add', 'update:item', 'remove'])
</script>

<template>
  <PreschoolSettingsSectionCard
    :eyebrow="t('preschoolSettingsPage.sections.classConfiguration.eyebrow')"
    :title="t('preschoolSettingsPage.sections.classConfiguration.title')"
    :subtitle="t('preschoolSettingsPage.sections.classConfiguration.subtitle')"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-500">{{ t('preschoolSettingsPage.sections.classConfiguration.description') }}</p>
      <Button variant="primary" @click="emit('add')">{{ t('preschoolSettingsPage.actions.addClassConfiguration') }}</Button>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-2">
      <article
        v-for="(item, index) in items"
        :key="item.id || `${item.classLevel}-${index}`"
        class="class-card"
      >
        <!-- card header -->
        <div class="class-card__header">
          <div class="space-y-0.5">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">
              {{ t('preschoolSettingsPage.classCard.eyebrow') }} {{ index + 1 }}
            </p>
            <p class="text-sm font-semibold text-slate-800">{{ item.room || item.id }}</p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
          >
            {{ item.status === 'active'
              ? t('preschoolSettingsPage.statusOptions.active')
              : t('preschoolSettingsPage.statusOptions.inactive') }}
          </span>
        </div>

        <!-- fields -->
        <div class="mt-3 grid gap-3 md:grid-cols-2">
          <div class="preschool-settings-field">
            <span>{{ t('preschoolSettingsPage.fields.classLevel') }}</span>
            <Select
              :model-value="item.classLevel"
              :options="levelOptions"
              option-label="label"
              option-value="value"
              class="w-full"
              :placeholder="t('preschoolSettingsPage.placeholders.classLevel')"
              @update:model-value="emit('update:item', { index, field: 'classLevel', value: $event })"
            />
            <small v-if="errors?.[index]?.classLevel" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors[index].classLevel}`) }}</small>
          </div>

          <div class="preschool-settings-field">
            <span>{{ t('preschoolSettingsPage.fields.capacity') }}</span>
            <InputNumber
              :model-value="item.capacity"
              :min="1"
              class="preschool-settings-number"
              :placeholder="t('preschoolSettingsPage.placeholders.capacity')"
              @update:model-value="emit('update:item', { index, field: 'capacity', value: $event })"
            />
            <small v-if="errors?.[index]?.capacity" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors[index].capacity}`) }}</small>
          </div>

          <div class="preschool-settings-field">
            <span>{{ t('preschoolSettingsPage.fields.assignedTeacher') }}</span>
            <Select
              :model-value="item.assignedTeacher"
              :options="teacherOptions"
              option-label="label"
              option-value="value"
              class="w-full"
              :placeholder="t('preschoolSettingsPage.placeholders.assignedTeacher')"
              @update:model-value="emit('update:item', { index, field: 'assignedTeacher', value: $event })"
            />
          </div>

          <div class="preschool-settings-field">
            <span>{{ t('preschoolSettingsPage.fields.room') }}</span>
            <input
              :value="item.room"
              type="text"
              class="preschool-settings-input"
              :placeholder="t('preschoolSettingsPage.placeholders.room')"
              @input="emit('update:item', { index, field: 'room', value: $event.target.value })"
            />
          </div>

          <div class="preschool-settings-field md:col-span-2">
            <span>{{ t('preschoolSettingsPage.fields.status') }}</span>
            <Select
              :model-value="item.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              class="w-full"
              :placeholder="t('preschoolSettingsPage.placeholders.status')"
              @update:model-value="emit('update:item', { index, field: 'status', value: $event })"
            />
            <small v-if="errors?.[index]?.status" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors[index].status}`) }}</small>
          </div>
        </div>

        <div class="mt-4 flex justify-end border-t border-slate-100 pt-3">
          <Button variant="ghost" @click="emit('remove', index)">{{ t('preschoolSettingsPage.actions.remove') }}</Button>
        </div>
      </article>

      <div v-if="!items.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 xl:col-span-2">
        {{ t('preschoolSettingsPage.emptyStates.classConfigurations') }}
      </div>
    </div>
  </PreschoolSettingsSectionCard>
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

.preschool-settings-input {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #d7e0ea;
  background: #fff;
  padding: 0.7rem 0.9rem;
  color: #0f172a;
  font-size: 0.875rem;
}

/* class item card */
.class-card {
  border-radius: 1rem;
  border: 1px solid #e2eaf3;
  background: #f8fafc;
  padding: 1rem;
  box-shadow: 0 10px 30px -28px rgba(15, 23, 42, 0.35);
}

.class-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

/* normalize InputNumber wrapper + input to match design tokens */
:deep(.preschool-settings-number) {
  width: 100%;
}

:deep(.preschool-settings-number .p-inputnumber-input) {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #d7e0ea;
  background: #fff;
  padding: 0.7rem 0.9rem;
  color: #0f172a;
  font-size: 0.875rem;
}

:deep(.preschool-settings-number .p-inputnumber-input:focus) {
  outline: none;
  border-color: #7dd3fc;
  box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.25);
}
</style>
