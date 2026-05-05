<script setup>
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import TeamSelector from '@/modules/dashboard/components/calendar/TeamSelector.vue'

const emit = defineEmits(['update-field', 'update:teamQuery', 'update:selectedTeamIds'])

defineProps({
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
  roleTitle: {
    type: String,
    default: 'Schedule details',
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

function updateField(field, value) {
  emit('update-field', { field, value })
}
</script>

<template>
  <div class="event-form-fields">
    <div class="event-form-fields__section-header">
      <span class="event-form-fields__section-icon">
        <i class="pi pi-calendar-plus" aria-hidden="true" />
      </span>
      <div>
        <p class="event-form-fields__section-kicker">{{ scheduleForLabel }}</p>
        <h3 class="event-form-fields__section-title">{{ roleTitle }}</h3>
      </div>
    </div>

    <div class="event-form-fields__grid">
      <div class="event-form-fields__field">
        <label class="event-form-fields__label" for="event-type">{{ eventTypeLabel }}</label>
        <Select
          id="event-type"
          :model-value="form.type"
          :options="eventTypes"
          option-label="label"
          option-value="value"
          :placeholder="selectEventTypeLabel"
          @update:model-value="updateField('type', $event)"
        />
      </div>

      <div class="event-form-fields__field">
        <label class="event-form-fields__label" for="event-time">{{ timeLabel }}</label>
        <input
          id="event-time"
          :value="form.time"
          type="time"
          class="event-form-fields__native-input"
          @input="updateField('time', $event.target.value)"
        />
      </div>

      <div class="event-form-fields__field event-form-fields__field--wide">
        <label class="event-form-fields__label" for="event-title">{{ titleLabel }}</label>
        <InputText
          id="event-title"
          :model-value="form.title"
          :placeholder="titlePlaceholder"
          @update:model-value="updateField('title', $event)"
        />
      </div>

      <div class="event-form-fields__field">
        <label class="event-form-fields__label" for="event-tournament">{{ contextLabel }}</label>
        <InputText
          id="event-tournament"
          :model-value="form.tournament"
          :placeholder="contextPlaceholder"
          @update:model-value="updateField('tournament', $event)"
        />
      </div>

      <div class="event-form-fields__field">
        <label class="event-form-fields__label" for="event-date">{{ dateLabel }}</label>
        <input
          id="event-date"
          :value="form.date"
          type="date"
          class="event-form-fields__native-input"
          @input="updateField('date', $event.target.value)"
        />
      </div>

      <div class="event-form-fields__field event-form-fields__field--wide">
        <label class="event-form-fields__label" for="event-comment">{{ optionalCommentLabel }}</label>
        <textarea
          id="event-comment"
          :value="form.comment"
          rows="4"
          class="event-form-fields__textarea"
          :placeholder="notePlaceholder"
          @input="updateField('comment', $event.target.value)"
        ></textarea>
      </div>
    </div>

    <TeamSelector
      :teams="teams"
      :selected-team-ids="form.teamIds"
      :query="teamQuery"
      :empty-label="targetEmptyLabel"
      :label="targetLabel"
      :search-placeholder="targetSearchPlaceholder"
      @update:query="$emit('update:teamQuery', $event)"
      @update:selected-team-ids="$emit('update:selectedTeamIds', $event)"
    />
  </div>
</template>

<style scoped>
.event-form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-form-fields__section-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid #dce8ef;
  border-radius: 0.9rem;
  padding: 0.85rem 0.95rem;
  background: #f8fbfd;
}

.event-form-fields__section-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: #e9f9ff;
  color: #0089bc;
  font-size: 0.95rem;
}

.event-form-fields__section-kicker {
  margin: 0;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.event-form-fields__section-title {
  margin: 0.12rem 0 0;
  color: #1d1d1b;
  font-size: 0.98rem;
  font-weight: 900;
}

.event-form-fields__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.event-form-fields__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.event-form-fields__field--wide {
  grid-column: 1 / -1;
}

.event-form-fields__label {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 800;
}

.event-form-fields__native-input,
.event-form-fields__textarea {
  width: 100%;
  border: 1px solid #d7dee7;
  border-radius: 0.9rem;
  padding: 0.78rem 0.9rem;
  background: #fff;
  color: #1d1d1b;
  font-size: 0.9rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.event-form-fields__native-input:focus,
.event-form-fields__textarea:focus {
  outline: none;
  border-color: #00aeef;
  box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.12);
}

.event-form-fields__textarea {
  resize: vertical;
  min-height: 6.25rem;
}

@media (max-width: 640px) {
  .event-form-fields__grid {
    grid-template-columns: 1fr;
  }
}
</style>
