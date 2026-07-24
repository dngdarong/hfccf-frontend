<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Dialog from 'primevue/dialog'
import TournamentGroupGrid from './TournamentGroupGrid.vue'
import TournamentGroupStats from './TournamentGroupStats.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentDrawPreviewDialog',
})

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  groups: {
    type: Array,
    default: () => [],
  },
  summary: {
    type: Object,
    default: () => ({}),
  },
  warnings: {
    type: Array,
    default: () => [],
  },
  canApply: {
    type: Boolean,
    default: false,
  },
  pending: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible', 'close', 'apply'])
const { t } = useLanguage()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    dismissable-mask
    class="group-preview-dialog"
    :style="{ width: 'min(92vw, 78rem)' }"
    :header="title || t('sportTournament.groups.preview.title')"
    @hide="emit('close')"
  >
    <div class="group-preview-dialog__content">
      <p class="group-preview-dialog__subtitle">
        {{ subtitle || t('sportTournament.groups.preview.subtitle') }}
      </p>

      <TournamentGroupStats :summary="summary" />

      <TournamentGroupGrid :groups="groups" :compact="true" />

      <div v-if="warnings.length" class="group-preview-dialog__warnings">
        <p class="group-preview-dialog__warnings-title">{{ t('sportTournament.groups.preview.warningsTitle') }}</p>
        <ul class="group-preview-dialog__warning-list">
          <li v-for="warning in warnings" :key="warning.type" class="group-preview-dialog__warning-item">
            {{ t(warning.messageKey) }}
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="group-preview-dialog__footer">
        <Button
          type="button"
          class="rounded-xl"
          outlined
          :label="t('common.cancel')"
          @click="emit('close')"
        />
        <Button
          type="button"
          class="rounded-xl"
          severity="success"
          :label="t('sportTournament.groups.preview.apply')"
          :disabled="pending || !canApply"
          @click="emit('apply')"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.group-preview-dialog__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-preview-dialog__subtitle {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.group-preview-dialog__warnings {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(253, 193, 22, 0.22);
  background: rgba(255, 251, 235, 0.86);
}

.group-preview-dialog__warnings-title {
  margin: 0 0 0.55rem;
  color: #92400e;
  font-size: 0.9rem;
  font-weight: 800;
}

.group-preview-dialog__warning-list {
  margin: 0;
  padding-left: 1.1rem;
  color: #92400e;
  line-height: 1.6;
}

.group-preview-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>

