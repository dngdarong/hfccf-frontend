<script setup>
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'HealthRecordPanel',
})

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  fields: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  editingId: {
    type: [String, Number],
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: '',
  },
  listTitle: {
    type: String,
    default: '',
  },
  saveLabel: {
    type: String,
    default: 'Save',
  },
  resetLabel: {
    type: String,
    default: 'Reset',
  },
  addLabel: {
    type: String,
    default: 'Add',
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'edit', 'delete', 'reset'])

function updateField(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}

function onSave() {
  emit('save')
}

function onReset() {
  emit('reset')
}

function fieldValue(key) {
  return props.modelValue?.[key]
}

function resolveItemSummary(item = {}) {
  return item.summary || item.title || item.name || item.label || item.raw?.name || item.raw?.title || item.raw?.label || '-'
}

function resolveItemMeta(item = {}) {
  return item.meta || item.subtitle || item.note || item.raw?.note || item.raw?.status || ''
}

function resolveItemBadge(item = {}) {
  return item.badge || item.status || item.raw?.status || ''
}
</script>

<template>
  <section class="health-panel">
    <header class="health-panel__header">
      <div>
        <p v-if="subtitle" class="health-panel__subtitle">{{ subtitle }}</p>
        <h3 class="health-panel__title">{{ title }}</h3>
      </div>

      <Button
        type="button"
        variant="primary"
        size="sm"
        rounded="xl"
        :label="editingId ? saveLabel : addLabel"
        :loading="saving"
        @click="onSave"
      />
    </header>

    <div v-if="loading" class="health-panel__state">
      <i class="pi pi-spin pi-spinner" />
    </div>

    <div v-else class="health-panel__body">
      <div class="health-panel__list">
        <div class="health-panel__list-header">
          <p class="health-panel__list-title">{{ listTitle || title }}</p>
          <span class="health-panel__list-count">{{ items.length }}</span>
        </div>

        <div v-if="items.length === 0" class="health-panel__empty">
          {{ emptyText }}
        </div>

        <div v-else class="health-panel__items">
          <article
            v-for="item in items"
            :key="item.id"
            class="health-panel__item"
          >
            <div class="health-panel__item-main">
              <div class="health-panel__item-title">{{ resolveItemSummary(item) }}</div>
              <div v-if="resolveItemMeta(item)" class="health-panel__item-meta">{{ resolveItemMeta(item) }}</div>
            </div>

            <div class="health-panel__item-actions">
              <span v-if="resolveItemBadge(item)" class="health-panel__badge">{{ resolveItemBadge(item) }}</span>
              <Button type="button" variant="ghost" size="sm" @click="$emit('edit', item)">Edit</Button>
              <Button type="button" variant="ghost" severity="danger" size="sm" @click="$emit('delete', item)">Delete</Button>
            </div>
          </article>
        </div>
      </div>

      <form class="health-panel__form" @submit.prevent="onSave">
        <div
          v-for="field in fields"
          :key="field.key"
          class="health-panel__field"
          :class="{ 'health-panel__field--checkbox': field.type === 'checkbox' }"
        >
          <label class="health-panel__label" :for="field.key">{{ field.label }}</label>

          <select
            v-if="field.type === 'select'"
            :id="field.key"
            class="health-panel__input"
            :value="fieldValue(field.key)"
            @change="updateField(field.key, $event.target.value)"
          >
            <option v-for="option in field.options || []" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.key"
            class="health-panel__input health-panel__input--textarea"
            :rows="field.rows || 3"
            :placeholder="field.placeholder || ''"
            :value="fieldValue(field.key)"
            @input="updateField(field.key, $event.target.value)"
          />

          <input
            v-else-if="field.type === 'number'"
            :id="field.key"
            class="health-panel__input"
            type="number"
            :min="field.min"
            :step="field.step || '1'"
            :placeholder="field.placeholder || ''"
            :value="fieldValue(field.key)"
            @input="updateField(field.key, $event.target.value === '' ? '' : Number($event.target.value))"
          />

          <input
            v-else-if="field.type === 'date'"
            :id="field.key"
            class="health-panel__input"
            type="date"
            :value="fieldValue(field.key)"
            @input="updateField(field.key, $event.target.value)"
          />

          <label
            v-else-if="field.type === 'checkbox'"
            class="health-panel__checkbox"
            :for="field.key"
          >
            <input
              :id="field.key"
              type="checkbox"
              :checked="Boolean(fieldValue(field.key))"
              @change="updateField(field.key, $event.target.checked)"
            />
            <span>{{ field.checkboxLabel || field.label }}</span>
          </label>

          <input
            v-else
            :id="field.key"
            class="health-panel__input"
            type="text"
            :placeholder="field.placeholder || ''"
            :value="fieldValue(field.key)"
            @input="updateField(field.key, $event.target.value)"
          />

          <p v-if="field.help" class="health-panel__help">{{ field.help }}</p>
        </div>

        <div class="health-panel__actions">
          <Button type="button" variant="secondary" size="sm" rounded="xl" :label="resetLabel" @click="onReset" />
          <Button type="submit" variant="primary" size="sm" rounded="xl" :label="editingId ? saveLabel : addLabel" :loading="saving" />
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.health-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #dbe3ef;
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 18px 36px -30px rgba(15, 23, 42, 0.45);
}

.health-panel__header,
.health-panel__list-header,
.health-panel__item,
.health-panel__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.health-panel__title {
  margin: 0.1rem 0 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.health-panel__subtitle {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7c3aed;
}

.health-panel__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.9fr);
  gap: 1rem;
}

.health-panel__list,
.health-panel__form {
  min-width: 0;
}

.health-panel__list-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.health-panel__list-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.6rem;
  border-radius: 9999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 0.8rem;
  font-weight: 800;
}

.health-panel__state,
.health-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  background: #f8fafc;
}

.health-panel__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.health-panel__item {
  padding: 0.85rem 0.9rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  align-items: flex-start;
}

.health-panel__item-main {
  min-width: 0;
}

.health-panel__item-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.health-panel__item-meta {
  margin-top: 0.2rem;
  font-size: 0.82rem;
  color: #64748b;
}

.health-panel__item-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.health-panel__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.28rem 0.65rem;
  border-radius: 9999px;
  background: #ede9fe;
  color: #6d28d9;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.health-panel__form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.9rem;
  border-radius: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.health-panel__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.health-panel__field--checkbox {
  gap: 0.5rem;
}

.health-panel__label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.health-panel__input {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 0.85rem;
  background: #fff;
  color: #0f172a;
  font-size: 0.92rem;
}

.health-panel__input--textarea {
  min-height: 4.5rem;
  resize: vertical;
}

.health-panel__checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: #0f172a;
}

.health-panel__help {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
}

.health-panel__actions {
  justify-content: flex-end;
  padding-top: 0.25rem;
}

@media (max-width: 1024px) {
  .health-panel__body {
    grid-template-columns: 1fr;
  }
}
</style>
