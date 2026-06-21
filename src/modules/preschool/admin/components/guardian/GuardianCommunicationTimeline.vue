<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate } from '@/utils/date'

defineOptions({
  name: 'GuardianCommunicationTimeline',
})

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  communications: { type: Array, default: () => [] },
  summary: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  showActions: { type: Boolean, default: false },
})

const emit = defineEmits(['mark-sent', 'acknowledge', 'cancel', 'refresh'])

const { t } = useLanguage()

function statusLabel(status) {
  const key = String(status || 'draft').toLowerCase()
  return t(`preschoolGuardianCommunicationPage.status.${key}`)
}

function severityLabel(severity) {
  const key = String(severity || 'medium').toLowerCase()
  return t(`preschoolGuardianCommunicationPage.severity.${key}`)
}

function channelLabel(channel) {
  const key = String(channel || 'manual_note').toLowerCase()
  return t(`preschoolGuardianCommunicationPage.channels.${key}`)
}

function sourceLabel(item) {
  const sourceType = String(item?.sourceType || '').toLowerCase()
  if (sourceType) {
    return t(`preschoolGuardianCommunicationPage.sources.${sourceType}`)
  }

  return item?.sourceLabel || t('preschoolGuardianCommunicationPage.labels.relatedEvent')
}

function isActionable(item) {
  return ['queued', 'draft', 'failed'].includes(String(item?.status || '').toLowerCase())
}
</script>

<template>
  <section class="guardian-communication-timeline">
    <header class="guardian-communication-timeline__header">
      <div>
        <p class="guardian-communication-timeline__eyebrow">
          {{ t('preschoolGuardianCommunicationPage.title') }}
        </p>
        <h3 class="guardian-communication-timeline__title">
          {{ title || t('preschoolGuardianCommunicationPage.timelineTitle') }}
        </h3>
        <p v-if="subtitle" class="guardian-communication-timeline__subtitle">
          {{ subtitle }}
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        rounded="xl"
        :label="t('common.refresh')"
        :disabled="loading"
        @click="emit('refresh')"
      />
    </header>

    <div class="guardian-communication-timeline__summary">
      <article class="guardian-communication-timeline__summary-card">
        <p>{{ t('preschoolGuardianCommunicationPage.status.total') }}</p>
        <strong>{{ summary.total ?? communications.length }}</strong>
      </article>
      <article class="guardian-communication-timeline__summary-card">
        <p>{{ t('preschoolGuardianCommunicationPage.status.queued') }}</p>
        <strong>{{ summary.queued ?? 0 }}</strong>
      </article>
      <article class="guardian-communication-timeline__summary-card">
        <p>{{ t('preschoolGuardianCommunicationPage.status.sent') }}</p>
        <strong>{{ summary.sent ?? 0 }}</strong>
      </article>
      <article class="guardian-communication-timeline__summary-card">
        <p>{{ t('preschoolGuardianCommunicationPage.status.acknowledged') }}</p>
        <strong>{{ summary.acknowledged ?? 0 }}</strong>
      </article>
    </div>

    <div v-if="loading" class="guardian-communication-timeline__state">
      {{ t('preschoolGuardianCommunicationPage.messages.loading') }}
    </div>

    <div v-else-if="!communications.length" class="guardian-communication-timeline__state guardian-communication-timeline__state--empty">
      {{ emptyText || t('preschoolGuardianCommunicationPage.messages.noCommunicationYet') }}
    </div>

    <div v-else class="guardian-communication-timeline__list">
      <article
        v-for="item in communications"
        :key="item.id"
        class="guardian-communication-timeline__item"
        :class="{ 'guardian-communication-timeline__item--compact': compact }"
      >
        <div class="guardian-communication-timeline__item-top">
          <div class="guardian-communication-timeline__copy">
            <p class="guardian-communication-timeline__item-title">{{ item.subject }}</p>
            <p class="guardian-communication-timeline__item-message">
              {{ item.message }}
            </p>
          </div>
          <div class="guardian-communication-timeline__badges">
            <span class="guardian-communication-timeline__badge" :data-status="item.status">
              {{ statusLabel(item.status) }}
            </span>
            <span class="guardian-communication-timeline__badge" :data-severity="item.severity">
              {{ severityLabel(item.severity) }}
            </span>
          </div>
        </div>

        <div class="guardian-communication-timeline__meta">
          <span>{{ t('preschoolGuardianCommunicationPage.labels.channel') }}: {{ channelLabel(item.channel) }}</span>
          <span>{{ t('preschoolGuardianCommunicationPage.labels.relatedEvent') }}: {{ sourceLabel(item) }}</span>
          <span>{{ formatDate(item.createdAt) || item.createdAt || '-' }}</span>
        </div>

        <div v-if="showActions && isActionable(item)" class="guardian-communication-timeline__actions">
          <Button
            v-if="item.status !== 'sent'"
            type="button"
            variant="secondary"
            size="sm"
            rounded="xl"
            :label="t('preschoolGuardianCommunicationPage.actions.markSent')"
            @click="emit('mark-sent', item)"
          />
          <Button
            v-if="item.status !== 'acknowledged'"
            type="button"
            variant="secondary"
            size="sm"
            rounded="xl"
            :label="t('preschoolGuardianCommunicationPage.actions.markAcknowledged')"
            @click="emit('acknowledge', item)"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            rounded="xl"
            :label="t('preschoolGuardianCommunicationPage.actions.cancel')"
            @click="emit('cancel', item)"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.guardian-communication-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.guardian-communication-timeline__header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.guardian-communication-timeline__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7c3aed;
}

.guardian-communication-timeline__title {
  margin: 0.2rem 0 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}

.guardian-communication-timeline__subtitle {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.92rem;
}

.guardian-communication-timeline__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.guardian-communication-timeline__summary-card,
.guardian-communication-timeline__item,
.guardian-communication-timeline__state {
  border: 1px solid #dbe3ef;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
}

.guardian-communication-timeline__summary-card {
  padding: 0.9rem 1rem;
}

.guardian-communication-timeline__summary-card p {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.guardian-communication-timeline__summary-card strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.45rem;
  color: #0f172a;
}

.guardian-communication-timeline__state {
  padding: 1rem;
  color: #64748b;
  text-align: center;
}

.guardian-communication-timeline__state--empty {
  border-style: dashed;
}

.guardian-communication-timeline__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.guardian-communication-timeline__item {
  padding: 1rem;
}

.guardian-communication-timeline__item--compact {
  padding: 0.85rem;
}

.guardian-communication-timeline__item-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.guardian-communication-timeline__copy {
  min-width: 0;
}

.guardian-communication-timeline__item-title {
  margin: 0;
  font-weight: 800;
  color: #0f172a;
}

.guardian-communication-timeline__item-message {
  margin: 0.25rem 0 0;
  color: #475569;
  font-size: 0.92rem;
}

.guardian-communication-timeline__badges {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: end;
}

.guardian-communication-timeline__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  background: #eef2ff;
  color: #3730a3;
}

.guardian-communication-timeline__badge[data-severity='high'],
.guardian-communication-timeline__badge[data-severity='critical'] {
  background: #fee2e2;
  color: #b91c1c;
}

.guardian-communication-timeline__badge[data-status='queued'],
.guardian-communication-timeline__badge[data-status='draft'] {
  background: #fef3c7;
  color: #92400e;
}

.guardian-communication-timeline__badge[data-status='sent'],
.guardian-communication-timeline__badge[data-status='acknowledged'] {
  background: #dcfce7;
  color: #166534;
}

.guardian-communication-timeline__badge[data-status='failed'] {
  background: #fee2e2;
  color: #b91c1c;
}

.guardian-communication-timeline__meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.85rem;
  font-size: 0.82rem;
  color: #64748b;
}

.guardian-communication-timeline__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.85rem;
}

@media (max-width: 960px) {
  .guardian-communication-timeline__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .guardian-communication-timeline__header,
  .guardian-communication-timeline__item-top {
    flex-direction: column;
  }

  .guardian-communication-timeline__summary {
    grid-template-columns: 1fr;
  }
}
</style>
