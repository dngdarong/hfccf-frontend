<script setup>
import Button from 'primevue/button'

defineOptions({
  name: 'PreschoolClassesToolbar',
})

defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  spotlightLabel: {
    type: String,
    default: '',
  },
  spotlightValue: {
    type: [String, Number],
    default: '',
  },
  addButtonLabel: {
    type: String,
    default: '',
  },
  isKh: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add'])
</script>

<template>
  <div :class="isKh ? 'classes-toolbar classes-toolbar--kh' : 'classes-toolbar'">
    <div class="classes-toolbar__copy">
      <p class="classes-toolbar__eyebrow">{{ eyebrow }}</p>
      <h2 class="classes-toolbar__title">{{ title }}</h2>
      <p class="classes-toolbar__text">{{ description }}</p>
    </div>

    <div class="classes-toolbar__actions">
      <div class="classes-toolbar__spotlight">
        <span class="classes-toolbar__spotlight-label">{{ spotlightLabel }}</span>
        <strong class="classes-toolbar__spotlight-value">{{ spotlightValue }}</strong>
      </div>

      <Button
        type="button"
        :label="addButtonLabel"
        icon="pi pi-plus"
        class="classes-toolbar__add-button"
        @click="$emit('add')"
      />
    </div>
  </div>
</template>

<style scoped>
.classes-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.classes-toolbar__copy {
  min-width: 0;
}

.classes-toolbar__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.classes-toolbar__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.4rem;
  line-height: 1.2;
  font-weight: 800;
}

.classes-toolbar__text {
  margin: 0.45rem 0 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.classes-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.classes-toolbar__spotlight {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(14, 116, 144, 0.16);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(255, 255, 255, 0.94) 100%);
}

.classes-toolbar__spotlight-label {
  color: #0f6f8f;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.classes-toolbar__spotlight-value {
  color: #0f172a;
  font-size: 1.3rem;
  line-height: 1;
  font-weight: 800;
}

.classes-toolbar__add-button {
  min-height: 2.8rem;
  border-radius: 0.9rem;
  font-weight: 800;
}

.classes-toolbar--kh .classes-toolbar__eyebrow,
.classes-toolbar--kh .classes-toolbar__spotlight-label,
.classes-toolbar--kh .classes-toolbar__text {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.classes-toolbar--kh .classes-toolbar__eyebrow,
.classes-toolbar--kh .classes-toolbar__spotlight-label {
  text-transform: none;
  letter-spacing: 0.01em;
}

.classes-toolbar--kh .classes-toolbar__text {
  font-size: 0.92rem;
  line-height: 1.65;
}

@media (max-width: 640px) {
  .classes-toolbar__title {
    font-size: 1.2rem;
  }
}
</style>
