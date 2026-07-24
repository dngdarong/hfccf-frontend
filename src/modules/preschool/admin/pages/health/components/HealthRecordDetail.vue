<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { resolveAvatarSource } from '@/utils/avatar'

defineProps({
  student: {
    type: Object,
    default: null,
  },
  profile: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close', 'edit', 'delete'])

const { t } = useLanguage()
</script>

<template>
  <div class="health-record-detail-overlay" @click="$emit('close')">
    <div class="health-record-detail-dialog" @click.stop>
      <div class="health-record-detail-header">
        <h3>{{ t('preschoolHealthPage.records.viewHealth') }}</h3>
        <button class="health-record-detail-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="health-record-detail-body">
        <div v-if="loading" class="health-record-detail-loading">
          <i class="pi pi-spin pi-spinner" />
        </div>

        <template v-else-if="profile">
          <!-- Student Summary -->
          <div class="health-record-detail-student">
            <img
              v-if="student?.avatarUrl"
              :src="resolveAvatarSource(student.avatarUrl)"
              :alt="student?.fullName"
              class="health-record-detail-avatar"
            />
            <div v-else class="health-record-detail-avatar health-record-detail-avatar--fallback">
              {{ (student?.fullName || '?').charAt(0) }}
            </div>
            <div class="health-record-detail-student-info">
              <h4 class="health-record-detail-name">{{ student?.fullName || '-' }}</h4>
              <div class="health-record-detail-meta">{{ student?.studentCode || student?.publicId || '-' }}</div>
            </div>
          </div>

          <div class="health-record-detail-grid">
            <div class="health-record-detail-row">
              <div class="health-record-detail-field">
                <div class="health-record-detail-label">{{ t('preschoolHealthPage.records.gender') }}</div>
                <div class="health-record-detail-value">{{ student?.gender || '-' }}</div>
              </div>
              <div class="health-record-detail-field">
                <div class="health-record-detail-label">{{ t('preschoolHealthPage.records.dateOfBirth') }}</div>
                <div class="health-record-detail-value">{{ student?.dateOfBirth || '-' }}</div>
              </div>
            </div>

            <div class="health-record-detail-row">
              <div class="health-record-detail-field">
                <div class="health-record-detail-label">{{ t('preschoolHealthPage.records.class') }}</div>
                <div class="health-record-detail-value">{{ student?.className || '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="health-record-detail-divider" />

          <!-- Health Profile Fields -->
          <div class="health-record-detail-section">
            <h4 class="health-record-detail-section-title">{{ t('preschoolHealthPage.records.healthInformation') }}</h4>

            <div class="health-record-detail-field-block">
              <div class="health-record-detail-label">{{ t('preschoolHealthPage.records.bloodType') }}</div>
              <div class="health-record-detail-value">{{ profile?.blood_type || '-' }}</div>
            </div>

            <div class="health-record-detail-field-block">
              <div class="health-record-detail-label">{{ t('preschoolHealthPage.records.medicalCondition') }}</div>
              <div class="health-record-detail-value">
                <template v-if="profile?.current_conditions && profile.current_conditions.length">
                  <div v-for="(condition, index) in profile.current_conditions" :key="index" class="health-record-detail-list-item">
                    {{ condition }}
                  </div>
                </template>
                <template v-else>
                  -
                </template>
              </div>
            </div>

            <div class="health-record-detail-field-block">
              <div class="health-record-detail-label">{{ t('preschoolHealthPage.records.medicalNotes') }}</div>
              <div class="health-record-detail-value health-record-detail-notes">{{ profile?.medical_notes || '-' }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="health-record-detail-empty">
            {{ t('preschoolHealthPage.records.noProfile') }}
          </div>
        </template>
      </div>

      <div class="health-record-detail-footer">
        <Button
          type="button"
          variant="secondary"
          size="md"
          rounded="lg"
          :label="t('common.close')"
          @click="$emit('close')"
        />
        <div class="health-record-detail-actions">
          <Button
            v-if="profile"
            type="button"
            variant="secondary"
            size="md"
            rounded="lg"
            :label="t('common.edit')"
            @click="$emit('edit')"
          />
          <Button
            v-if="profile"
            type="button"
            variant="danger"
            size="md"
            rounded="lg"
            :label="t('common.delete')"
            @click="$emit('delete')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-record-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.health-record-detail-dialog {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 20px 50px -30px rgba(0, 0, 0, 0.3);
  max-width: 36rem;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.health-record-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.health-record-detail-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.health-record-detail-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.health-record-detail-close:hover {
  color: #0f172a;
}

.health-record-detail-body {
  padding: 1.5rem;
}

.health-record-detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 6rem;
  color: #64748b;
}

.health-record-detail-student {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.health-record-detail-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  object-fit: cover;
  background: #e2e8f0;
  flex-shrink: 0;
}

.health-record-detail-avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  font-weight: 800;
  font-size: 1.2rem;
}

.health-record-detail-student-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.health-record-detail-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.health-record-detail-meta {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.health-record-detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.health-record-detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.health-record-detail-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.health-record-detail-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.health-record-detail-value {
  font-size: 0.95rem;
  color: #0f172a;
  line-height: 1.5;
}

.health-record-detail-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1rem 0;
}

.health-record-detail-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.health-record-detail-section-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.health-record-detail-field-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.health-record-detail-notes {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.health-record-detail-list-item {
  padding: 0.25rem 0;
}

.health-record-detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 6rem;
  color: #64748b;
  text-align: center;
}

.health-record-detail-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: center;
}

.health-record-detail-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
