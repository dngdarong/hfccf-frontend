<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import EventFormFields from '@/modules/dashboard/components/calendar/EventFormFields.vue'

defineEmits([
  'update:visible',
  'save',
  'cancel',
  'delete',
  'update-field',
  'update:teamQuery',
  'update:selectedTeamIds',
])

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'create',
  },
  form: {
    type: Object,
    required: true,
  },
  eventTypes: {
    type: Array,
    default: () => [],
  },
  teams: {
    type: Array,
    default: () => [],
  },
  teamQuery: {
    type: String,
    default: '',
  },
  createTitle: {
    type: String,
    default: 'Create Schedule Event',
  },
  editTitle: {
    type: String,
    default: 'Edit Schedule Event',
  },
  roleTitle: {
    type: String,
    default: 'Schedule details',
  },
  description: {
    type: String,
    default: '',
  },
  contextLabel: {
    type: String,
    default: 'Tournament',
  },
  contextPlaceholder: {
    type: String,
    default: 'Enter tournament name',
  },
  titlePlaceholder: {
    type: String,
    default: 'Enter event title',
  },
  notePlaceholder: {
    type: String,
    default: 'Add context, notes, or any urgent reminders',
  },
  targetLabel: {
    type: String,
    default: 'Teams',
  },
  targetSearchPlaceholder: {
    type: String,
    default: 'Search teams',
  },
  targetEmptyLabel: {
    type: String,
    default: 'No teams match your search.',
  },
  updateLabel: {
    type: String,
    default: 'Update',
  },
  createLabel: {
    type: String,
    default: 'Create',
  },
  saveChangesLabel: {
    type: String,
    default: 'Save Changes',
  },
  saveEventLabel: {
    type: String,
    default: 'Save Event',
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  deleteLabel: {
    type: String,
    default: 'Delete',
  },
  scheduleForLabel: {
    type: String,
    default: 'Schedule for',
  },
  eventTypeLabel: {
    type: String,
    default: 'Event type',
  },
  timeLabel: {
    type: String,
    default: 'Time',
  },
  titleLabel: {
    type: String,
    default: 'Title',
  },
  dateLabel: {
    type: String,
    default: 'Date',
  },
  optionalCommentLabel: {
    type: String,
    default: 'Optional comment',
  },
  selectEventTypeLabel: {
    type: String,
    default: 'Select event type',
  },
})

const dialogTitle = computed(() => (props.mode === 'edit' ? props.editTitle : props.createTitle))

const submitLabel = computed(() => (props.mode === 'edit' ? props.saveChangesLabel : props.saveEventLabel))
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :closable="true"
    :style="{ width: 'min(44rem, calc(100vw - 1.5rem))' }"
    :pt="{
      root: { class: 'rounded-[1.4rem] overflow-hidden' },
      header: { class: 'px-6 pt-6 pb-2' },
      content: { class: 'px-6 pb-5 pt-2' },
      footer: { class: 'px-6 pb-6 pt-0' },
    }"
    @update:visible="$emit('update:visible', $event)"
    @hide="$emit('cancel')"
  >
    <template #header>
      <div class="event-form-modal__header">
        <p class="event-form-modal__eyebrow">{{ mode === 'edit' ? updateLabel : createLabel }}</p>
        <h2 class="event-form-modal__title">{{ dialogTitle }}</h2>
        <p v-if="description" class="event-form-modal__description">{{ description }}</p>
      </div>
    </template>

    <EventFormFields
      :form="form"
      :event-types="eventTypes"
      :teams="teams"
      :team-query="teamQuery"
      :context-label="contextLabel"
      :context-placeholder="contextPlaceholder"
      :note-placeholder="notePlaceholder"
      :role-title="roleTitle"
      :target-empty-label="targetEmptyLabel"
      :target-label="targetLabel"
      :target-search-placeholder="targetSearchPlaceholder"
      :title-placeholder="titlePlaceholder"
      :schedule-for-label="scheduleForLabel"
      :event-type-label="eventTypeLabel"
      :time-label="timeLabel"
      :title-label="titleLabel"
      :date-label="dateLabel"
      :optional-comment-label="optionalCommentLabel"
      :select-event-type-label="selectEventTypeLabel"
      @update-field="$emit('update-field', $event)"
      @update:team-query="$emit('update:teamQuery', $event)"
      @update:selected-team-ids="$emit('update:selectedTeamIds', $event)"
    />

    <template #footer>
      <div class="event-form-modal__footer">
        <button
          v-if="mode === 'edit'"
          type="button"
          class="event-form-modal__delete"
          @click="$emit('delete')"
        >
          {{ deleteLabel }}
        </button>

        <div class="event-form-modal__actions">
          <button type="button" class="event-form-modal__cancel" @click="$emit('cancel')">
            {{ cancelLabel }}
          </button>
          <button type="button" class="event-form-modal__save" @click="$emit('save')">
            {{ submitLabel }}
          </button>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.event-form-modal__header {
  display: flex;
  flex-direction: column;
}

.event-form-modal__eyebrow {
  margin: 0;
  color: #00aeef;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.event-form-modal__title {
  margin: 0.35rem 0 0;
  color: #1d1d1b;
  font-size: 1.3rem;
  font-weight: 900;
}

.event-form-modal__description {
  margin: 0.55rem 0 0;
  max-width: 36rem;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.55;
}

.event-form-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.event-form-modal__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.event-form-modal__cancel,
.event-form-modal__save,
.event-form-modal__delete {
  border-radius: 9999px;
  padding: 0.8rem 1.2rem;
  font-size: 0.86rem;
  font-weight: 800;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.event-form-modal__cancel {
  border: 1px solid #d7dee7;
  background: #fff;
  color: #334155;
}

.event-form-modal__save {
  border: 0;
  background: linear-gradient(180deg, #00aeef 0%, #0097d3 100%);
  color: #fff;
  box-shadow: 0 20px 28px -22px rgba(0, 174, 239, 0.82);
}

.event-form-modal__delete {
  border: 1px solid #ffd7da;
  background: #fff5f5;
  color: #c81e1e;
}

.event-form-modal__cancel:hover,
.event-form-modal__save:hover,
.event-form-modal__delete:hover {
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .event-form-modal__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .event-form-modal__actions {
    margin-left: 0;
    justify-content: stretch;
    flex-direction: column;
  }

  .event-form-modal__cancel,
  .event-form-modal__save,
  .event-form-modal__delete {
    width: 100%;
  }
}
</style>
