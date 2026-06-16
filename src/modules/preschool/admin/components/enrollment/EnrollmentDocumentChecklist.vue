<script setup>
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'EnrollmentDocumentChecklist' })

const props = defineProps({
  documents: { type: Array, default: () => [] },
  canEdit: { type: Boolean, default: false },
  applicationId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update'])
const { t } = useI18n()

function docLabel(type) {
  const map = {
    birth_certificate: t('preschoolEnrollmentPage.documentChecklist.types.birth_certificate'),
    family_book: t('preschoolEnrollmentPage.documentChecklist.types.family_book'),
    vaccination_card: t('preschoolEnrollmentPage.documentChecklist.types.vaccination_card'),
    parent_id: t('preschoolEnrollmentPage.documentChecklist.types.parent_id'),
    photo: t('preschoolEnrollmentPage.documentChecklist.types.photo'),
    consent_form: t('preschoolEnrollmentPage.documentChecklist.types.consent_form'),
  }
  return map[type] ?? type
}

function toggleReceived(doc) {
  if (!props.canEdit) return
  emit('update', { documentId: doc.id, payload: { is_received: !doc.isReceived } })
}
</script>

<template>
  <section class="enr-docs">
    <h3 class="enr-docs__title">{{ t('preschoolEnrollmentPage.documentChecklist.title') }}</h3>
    <p class="enr-docs__subtitle">{{ t('preschoolEnrollmentPage.documentChecklist.subtitle') }}</p>

    <div v-if="documents.length === 0" class="enr-docs__empty">
      {{ t('preschoolEnrollmentPage.empty.noDocuments') }}
    </div>

    <table v-else class="enr-docs__table">
      <thead>
        <tr>
          <th>{{ t('preschoolEnrollmentPage.documentChecklist.columns.document') }}</th>
          <th>{{ t('preschoolEnrollmentPage.documentChecklist.columns.required') }}</th>
          <th>{{ t('preschoolEnrollmentPage.documentChecklist.columns.received') }}</th>
          <th>{{ t('preschoolEnrollmentPage.documentChecklist.columns.receivedDate') }}</th>
          <th>{{ t('preschoolEnrollmentPage.documentChecklist.columns.note') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documents" :key="doc.id">
          <td>{{ docLabel(doc.documentType) }}</td>
          <td>
            <span
              class="enr-docs__badge"
              :class="doc.isRequired ? 'enr-docs__badge--required' : 'enr-docs__badge--optional'"
            >
              {{
                doc.isRequired
                  ? t('preschoolEnrollmentPage.documentChecklist.badges.required')
                  : t('preschoolEnrollmentPage.documentChecklist.badges.optional')
              }}
            </span>
          </td>
          <td>
            <button
              class="enr-docs__check"
              :class="{ 'enr-docs__check--on': doc.isReceived }"
              :disabled="!canEdit"
              :title="doc.isReceived
                ? t('preschoolEnrollmentPage.documentChecklist.badges.received')
                : t('preschoolEnrollmentPage.documentChecklist.badges.pending')"
              @click="toggleReceived(doc)"
            >
              <i :class="doc.isReceived ? 'pi pi-check-circle' : 'pi pi-circle'" />
              {{ doc.isReceived
                ? t('preschoolEnrollmentPage.documentChecklist.badges.received')
                : t('preschoolEnrollmentPage.documentChecklist.badges.pending') }}
            </button>
          </td>
          <td>{{ doc.receivedDate ?? '—' }}</td>
          <td>{{ doc.note ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.enr-docs {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: #fff;
}

.enr-docs__title {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
}

.enr-docs__subtitle {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.enr-docs__empty {
  padding: 1.5rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
}

.enr-docs__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.enr-docs__table th {
  padding: 0.6rem 0.75rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #e2e8f0;
}

.enr-docs__table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.enr-docs__table tbody tr:last-child td { border-bottom: none; }

.enr-docs__badge {
  display: inline-block;
  padding: 0.18em 0.55em;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.enr-docs__badge--required { background: #fee2e2; color: #b91c1c; }
.enr-docs__badge--optional { background: #f1f5f9; color: #64748b; }

.enr-docs__check {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.22rem 0.55rem;
  border-radius: 0.4rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.78rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;
}

.enr-docs__check--on {
  background: #dcfce7;
  border-color: #86efac;
  color: #15803d;
}

.enr-docs__check:disabled { cursor: default; opacity: 0.75; }
</style>
