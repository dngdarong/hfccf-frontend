<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { getAvatarInitials, resolveAvatarSource } from '@/utils/avatar'
import { fetchPreschoolStudent } from '@/modules/preschool/services/preschoolApi'
import {
  deleteStudentHealthAllergy,
  deleteStudentHealthContact,
  deleteStudentHealthIncident,
  deleteStudentHealthMedication,
  deleteStudentHealthVaccination,
  fetchStudentHealthAuditLogs,
  fetchStudentHealthAlerts,
  fetchStudentHealthAllergies,
  fetchStudentHealthContacts,
  fetchStudentHealthIncidents,
  fetchStudentHealthMedications,
  fetchStudentHealthSummary,
  fetchStudentHealthVaccinations,
  fetchStudentHealthChecks,
  fetchStudentMedicalProfile,
  saveStudentHealthAllergy,
  saveStudentHealthContact,
  saveStudentHealthIncident,
  saveStudentHealthMedication,
  saveStudentHealthVaccination,
  saveStudentHealthCheck,
  saveStudentMedicalProfile,
  deleteStudentHealthCheck,
} from '@/modules/preschool/services/api/preschoolHealthApi'
import HealthRecordPanel from '@/modules/preschool/admin/components/health/HealthRecordPanel.vue'

defineOptions({
  name: 'PreschoolStudentHealthProfilePage',
})

const { t } = useLanguage()
const route = useRoute()
const router = useRouter()

const student = ref(null)
const healthSummary = ref(null)
const healthAlerts = ref({
  summary: {
    newAlerts: 0,
    acknowledgedAlerts: 0,
    inProgressAlerts: 0,
    resolvedAlerts: 0,
    closedAlerts: 0,
    criticalAlerts: 0,
    resolvedThisWeek: 0,
    unresolvedItems: 0,
  },
  items: [],
  unresolvedCriticalItems: [],
})
const healthAuditLogs = ref([])
const loading = ref(false)
const errorMessage = ref('')
const savingProfile = ref(false)
const profileError = ref('')
const auditLoading = ref(false)
const auditError = ref('')
const auditActionFilter = ref('all')

const medicalProfile = reactive({
  blood_type: '',
  chronic_conditions: '',
  current_conditions: '',
  medical_notes: '',
  status: 'active',
})

function createSectionState(defaultForm) {
  return reactive({
    items: [],
    loading: false,
    saving: false,
    editingId: '',
    error: '',
    form: { ...defaultForm },
  })
}

const allergyState = createSectionState({
  allergy_name: '',
  allergy_type: '',
  severity: 'mild',
  reaction: '',
  action_taken: '',
  status: 'active',
})

const vaccinationState = createSectionState({
  vaccine_name: '',
  vaccination_date: '',
  dose_number: '',
  provider: '',
  status: 'completed',
})

const medicationState = createSectionState({
  medication_name: '',
  dosage: '',
  frequency: '',
  route: '',
  start_date: '',
  end_date: '',
  status: 'active',
})

const incidentState = createSectionState({
  incident_date: '',
  incident_type: '',
  severity: 'low',
  action_taken: '',
  notes: '',
  follow_up_needed: false,
  status: 'open',
})

const contactState = createSectionState({
  name: '',
  relationship: '',
  phone: '',
  secondary_phone: '',
  priority: 1,
  is_primary: false,
  receive_alerts: true,
  status: 'active',
})

const healthCheckState = createSectionState({
  checked_at: '',
  temperature_celsius: '',
  weight_kg: '',
  height_cm: '',
  symptoms: '',
  remarks: '',
  status: 'recorded',
})

const sectionStates = {
  allergies: allergyState,
  vaccinations: vaccinationState,
  medications: medicationState,
  incidents: incidentState,
  contacts: contactState,
  healthChecks: healthCheckState,
}

const sectionMeta = {
  allergies: {
    title: t('preschoolHealthPage.profile.allergies'),
    subtitle: t('preschoolHealthPage.profile.allergiesSubtitle'),
    emptyText: t('preschoolHealthPage.messages.noAllergies'),
    listTitle: t('preschoolHealthPage.profile.allergies'),
    saveLabel: t('preschoolHealthPage.actions.saveAllergy'),
    addLabel: t('preschoolHealthPage.actions.addAllergy'),
    resetLabel: t('common.cancel'),
    fields: [
      { key: 'allergy_name', label: t('preschoolHealthPage.form.allergyName') },
      { key: 'allergy_type', label: t('preschoolHealthPage.form.allergyType') },
      {
        key: 'severity',
        label: t('preschoolHealthPage.form.severity'),
        type: 'select',
        options: [
          { label: t('preschoolHealthPage.status.mild'), value: 'mild' },
          { label: t('preschoolHealthPage.status.moderate'), value: 'moderate' },
          { label: t('preschoolHealthPage.status.high'), value: 'high' },
          { label: t('preschoolHealthPage.status.critical'), value: 'critical' },
        ],
      },
      { key: 'reaction', label: t('preschoolHealthPage.form.reaction'), type: 'textarea', rows: 2 },
      { key: 'action_taken', label: t('preschoolHealthPage.form.actionTaken'), type: 'textarea', rows: 2 },
      {
        key: 'status',
        label: t('preschoolHealthPage.form.status'),
        type: 'select',
        options: [
          { label: t('preschoolHealthPage.status.active'), value: 'active' },
          { label: t('preschoolHealthPage.status.inactive'), value: 'inactive' },
        ],
      },
    ],
    mapItem(item) {
      return {
        id: item.id,
        title: item.allergy_name || item.allergyName || item.name || '-',
        meta: [item.allergy_type || item.allergyType, item.severity, item.reaction].filter(Boolean).join(' - '),
        badge: item.status || '',
      }
    },
    mapForm(item) {
      return {
        allergy_name: item.allergy_name || item.allergyName || item.name || '',
        allergy_type: item.allergy_type || item.allergyType || '',
        severity: item.severity || 'mild',
        reaction: item.reaction || '',
        action_taken: item.action_taken || item.actionTaken || '',
        status: item.status || 'active',
      }
    },
    fetch: fetchStudentHealthAllergies,
    save: saveStudentHealthAllergy,
    remove: deleteStudentHealthAllergy,
  },
  vaccinations: {
    title: t('preschoolHealthPage.profile.vaccinations'),
    subtitle: t('preschoolHealthPage.profile.vaccinationsSubtitle'),
    emptyText: t('preschoolHealthPage.messages.noVaccinations'),
    listTitle: t('preschoolHealthPage.profile.vaccinations'),
    saveLabel: t('preschoolHealthPage.actions.saveVaccination'),
    addLabel: t('preschoolHealthPage.actions.addVaccination'),
    resetLabel: t('common.cancel'),
    fields: [
      { key: 'vaccine_name', label: t('preschoolHealthPage.form.vaccineName') },
      { key: 'vaccination_date', label: t('preschoolHealthPage.form.vaccinationDate'), type: 'date' },
      { key: 'dose_number', label: t('preschoolHealthPage.form.doseNumber') },
      { key: 'provider', label: t('preschoolHealthPage.form.provider') },
      {
        key: 'status',
        label: t('preschoolHealthPage.form.status'),
        type: 'select',
        options: [
          { label: t('preschoolHealthPage.status.completed'), value: 'completed' },
          { label: t('preschoolHealthPage.status.pending'), value: 'pending' },
          { label: t('preschoolHealthPage.status.overdue'), value: 'overdue' },
          { label: t('preschoolHealthPage.status.unknown'), value: 'unknown' },
        ],
      },
    ],
    mapItem(item) {
      return {
        id: item.id,
        title: item.vaccine_name || item.vaccineName || item.name || '-',
        meta: [item.vaccination_date || item.vaccinationDate, item.dose_number || item.doseNumber, item.provider].filter(Boolean).join(' - '),
        badge: item.status || '',
      }
    },
    mapForm(item) {
      return {
        vaccine_name: item.vaccine_name || item.vaccineName || item.name || '',
        vaccination_date: item.vaccination_date || item.vaccinationDate || '',
        dose_number: item.dose_number || item.doseNumber || '',
        provider: item.provider || '',
        status: item.status || 'completed',
      }
    },
    fetch: fetchStudentHealthVaccinations,
    save: saveStudentHealthVaccination,
    remove: deleteStudentHealthVaccination,
  },
  medications: {
    title: t('preschoolHealthPage.profile.medications'),
    subtitle: t('preschoolHealthPage.profile.medicationsSubtitle'),
    emptyText: t('preschoolHealthPage.messages.noMedications'),
    listTitle: t('preschoolHealthPage.profile.medications'),
    saveLabel: t('preschoolHealthPage.actions.saveMedication'),
    addLabel: t('preschoolHealthPage.actions.addMedication'),
    resetLabel: t('common.cancel'),
    fields: [
      { key: 'medication_name', label: t('preschoolHealthPage.form.medicationName') },
      { key: 'dosage', label: t('preschoolHealthPage.form.dosage') },
      { key: 'frequency', label: t('preschoolHealthPage.form.frequency') },
      { key: 'route', label: t('preschoolHealthPage.form.route') },
      { key: 'start_date', label: t('preschoolHealthPage.form.startDate'), type: 'date' },
      { key: 'end_date', label: t('preschoolHealthPage.form.endDate'), type: 'date' },
      { key: 'notes', label: t('preschoolHealthPage.form.remarks'), type: 'textarea', rows: 2 },
      {
        key: 'status',
        label: t('preschoolHealthPage.form.status'),
        type: 'select',
        options: [
          { label: t('preschoolHealthPage.status.active'), value: 'active' },
          { label: t('preschoolHealthPage.status.inactive'), value: 'inactive' },
        ],
      },
    ],
    mapItem(item) {
      return {
        id: item.id,
        title: item.medication_name || item.medicationName || item.name || '-',
        meta: [item.dosage, item.frequency, item.route].filter(Boolean).join(' - '),
        badge: item.status || '',
      }
    },
    mapForm(item) {
      return {
        medication_name: item.medication_name || item.medicationName || item.name || '',
        dosage: item.dosage || '',
        frequency: item.frequency || '',
        route: item.route || '',
        start_date: item.start_date || item.startDate || '',
        end_date: item.end_date || item.endDate || '',
        notes: item.notes || '',
        status: item.status || 'active',
      }
    },
    fetch: fetchStudentHealthMedications,
    save: saveStudentHealthMedication,
    remove: deleteStudentHealthMedication,
  },
  incidents: {
    title: t('preschoolHealthPage.profile.incidents'),
    subtitle: t('preschoolHealthPage.profile.incidentsSubtitle'),
    emptyText: t('preschoolHealthPage.messages.noIncidents'),
    listTitle: t('preschoolHealthPage.profile.incidents'),
    saveLabel: t('preschoolHealthPage.actions.saveIncident'),
    addLabel: t('preschoolHealthPage.actions.addIncident'),
    resetLabel: t('common.cancel'),
    fields: [
      { key: 'incident_date', label: t('preschoolHealthPage.form.incidentDate'), type: 'date' },
      { key: 'incident_type', label: t('preschoolHealthPage.form.incidentType') },
      {
        key: 'severity',
        label: t('preschoolHealthPage.form.severity'),
        type: 'select',
        options: [
          { label: t('preschoolHealthPage.status.mild'), value: 'mild' },
          { label: t('preschoolHealthPage.status.moderate'), value: 'moderate' },
          { label: t('preschoolHealthPage.status.high'), value: 'high' },
          { label: t('preschoolHealthPage.status.critical'), value: 'critical' },
        ],
      },
      { key: 'action_taken', label: t('preschoolHealthPage.form.actionTaken'), type: 'textarea', rows: 2 },
      { key: 'notes', label: t('preschoolHealthPage.form.remarks'), type: 'textarea', rows: 2 },
      { key: 'follow_up_needed', label: t('preschoolHealthPage.form.followUpNeeded'), type: 'checkbox', checkboxLabel: t('preschoolHealthPage.form.followUpNeeded') },
      {
        key: 'status',
        label: t('preschoolHealthPage.form.status'),
        type: 'select',
        options: [
          { label: t('preschoolHealthPage.status.open'), value: 'open' },
          { label: t('preschoolHealthPage.status.resolved'), value: 'resolved' },
          { label: t('preschoolHealthPage.status.closed'), value: 'closed' },
        ],
      },
    ],
    mapItem(item) {
      return {
        id: item.id,
        title: item.incident_type || item.incidentType || item.name || '-',
        meta: [item.incident_date || item.incidentDate, item.severity, item.action_taken || item.actionTaken].filter(Boolean).join(' - '),
        badge: item.status || '',
      }
    },
    mapForm(item) {
      return {
        incident_date: item.incident_date || item.incidentDate || '',
        incident_type: item.incident_type || item.incidentType || item.name || '',
        severity: item.severity || 'low',
        action_taken: item.action_taken || item.actionTaken || '',
        notes: item.notes || '',
        follow_up_needed: Boolean(item.follow_up_needed ?? item.followUpNeeded),
        status: item.status || 'open',
      }
    },
    fetch: fetchStudentHealthIncidents,
    save: saveStudentHealthIncident,
    remove: deleteStudentHealthIncident,
  },
  contacts: {
    title: t('preschoolHealthPage.profile.emergencyContacts'),
    subtitle: t('preschoolHealthPage.profile.emergencyContactsSubtitle'),
    emptyText: t('preschoolHealthPage.messages.noContacts'),
    listTitle: t('preschoolHealthPage.profile.emergencyContacts'),
    saveLabel: t('preschoolHealthPage.actions.saveContact'),
    addLabel: t('preschoolHealthPage.actions.addContact'),
    resetLabel: t('common.cancel'),
    fields: [
      { key: 'name', label: t('preschoolHealthPage.form.contactName') },
      { key: 'relationship', label: t('preschoolHealthPage.form.relationship') },
      { key: 'phone', label: t('preschoolHealthPage.form.phone') },
      { key: 'secondary_phone', label: t('preschoolHealthPage.form.secondaryPhone') },
      { key: 'priority', label: t('preschoolHealthPage.form.priority'), type: 'number', min: 1, step: 1 },
      { key: 'is_primary', label: t('preschoolHealthPage.form.primaryContact'), type: 'checkbox', checkboxLabel: t('preschoolHealthPage.form.primaryContact') },
      { key: 'receive_alerts', label: t('preschoolHealthPage.form.receiveAlerts'), type: 'checkbox', checkboxLabel: t('preschoolHealthPage.form.receiveAlerts') },
      { key: 'notes', label: t('preschoolHealthPage.form.remarks'), type: 'textarea', rows: 2 },
      {
        key: 'status',
        label: t('preschoolHealthPage.form.status'),
        type: 'select',
        options: [
          { label: t('preschoolHealthPage.status.active'), value: 'active' },
          { label: t('preschoolHealthPage.status.inactive'), value: 'inactive' },
        ],
      },
    ],
    mapItem(item) {
      return {
        id: item.id,
        title: item.name || item.contact_name || item.contactName || '-',
        meta: [item.relationship, item.phone, item.secondary_phone || item.secondaryPhone].filter(Boolean).join(' - '),
        badge: item.is_primary || item.primary ? t('preschoolHealthPage.form.primaryContact') : item.status || '',
      }
    },
    mapForm(item) {
      return {
        name: item.name || item.contact_name || item.contactName || '',
        relationship: item.relationship || '',
        phone: item.phone || '',
        secondary_phone: item.secondary_phone || item.secondaryPhone || '',
        priority: Number(item.priority || 1),
        is_primary: Boolean(item.is_primary ?? item.primary),
        receive_alerts: Boolean(item.receive_alerts ?? item.receiveAlerts ?? true),
        notes: item.notes || '',
        status: item.status || 'active',
      }
    },
    fetch: fetchStudentHealthContacts,
    save: saveStudentHealthContact,
    remove: deleteStudentHealthContact,
  },
  healthChecks: {
    title: t('preschoolHealthPage.profile.healthChecks'),
    subtitle: t('preschoolHealthPage.profile.healthChecksSubtitle'),
    emptyText: t('preschoolHealthPage.messages.noHealthChecks'),
    listTitle: t('preschoolHealthPage.profile.healthChecks'),
    saveLabel: t('preschoolHealthPage.actions.saveCheck'),
    addLabel: t('preschoolHealthPage.actions.addCheck'),
    resetLabel: t('common.cancel'),
    fields: [
      { key: 'checked_at', label: t('preschoolHealthPage.form.checkedAt'), type: 'date' },
      { key: 'temperature_celsius', label: t('preschoolHealthPage.form.temperature'), type: 'number', min: 0, step: '0.1' },
      { key: 'weight_kg', label: t('preschoolHealthPage.form.weight'), type: 'number', min: 0, step: '0.1' },
      { key: 'height_cm', label: t('preschoolHealthPage.form.height'), type: 'number', min: 0, step: '0.1' },
      { key: 'symptoms', label: t('preschoolHealthPage.form.symptoms'), type: 'textarea', rows: 2 },
      { key: 'remarks', label: t('preschoolHealthPage.form.remarks'), type: 'textarea', rows: 2 },
      {
        key: 'status',
        label: t('preschoolHealthPage.form.status'),
        type: 'select',
        options: [
          { label: t('preschoolHealthPage.status.recorded'), value: 'recorded' },
          { label: t('preschoolHealthPage.status.reviewed'), value: 'reviewed' },
          { label: t('preschoolHealthPage.status.followUp'), value: 'follow_up' },
        ],
      },
    ],
    mapItem(item) {
      return {
        id: item.id,
        title: item.checked_at || item.checkedAt || item.name || '-',
        meta: [item.temperature_celsius ? `${item.temperature_celsius}°C` : '', item.weight_kg ? `${item.weight_kg}kg` : '', item.height_cm ? `${item.height_cm}cm` : ''].filter(Boolean).join(' - '),
        badge: item.status || '',
      }
    },
    mapForm(item) {
      return {
        checked_at: item.checked_at || item.checkedAt || '',
        temperature_celsius: item.temperature_celsius ?? item.temperature ?? '',
        weight_kg: item.weight_kg ?? item.weight ?? '',
        height_cm: item.height_cm ?? item.height ?? '',
        symptoms: item.symptoms || '',
        remarks: item.remarks || '',
        status: item.status || 'recorded',
      }
    },
    fetch: fetchStudentHealthChecks,
    save: saveStudentHealthCheck,
    remove: deleteStudentHealthCheck,
  },
}

const selectedStudent = computed(() => student.value)
const avatarSrc = computed(() => resolveAvatarSource(student.value?.avatarUrl || ''))
const initials = computed(() => getAvatarInitials(student.value?.fullName || student.value?.name || '', '?'))

const summaryCards = computed(() => [
  { label: t('preschoolHealthPage.summary.allergies'), value: healthSummary.value?.counts?.allergies ?? 0 },
  { label: t('preschoolHealthPage.summary.vaccinations'), value: healthSummary.value?.counts?.vaccinations ?? 0 },
  { label: t('preschoolHealthPage.summary.medications'), value: healthSummary.value?.counts?.medications ?? 0 },
  { label: t('preschoolHealthPage.summary.incidents'), value: healthSummary.value?.counts?.incidents ?? 0 },
  { label: t('preschoolHealthPage.summary.contacts'), value: healthSummary.value?.counts?.emergencyContacts ?? 0 },
  { label: t('preschoolHealthPage.summary.checks'), value: healthSummary.value?.counts?.healthChecks ?? 0 },
  { label: t('preschoolHealthPage.summary.auditLogs'), value: healthAuditLogs.value.length },
])

const alertSummaryCards = computed(() => [
  { label: t('preschoolHealthPage.alerts.new'), value: healthAlerts.value.summary?.newAlerts ?? 0, note: t('preschoolHealthPage.alerts.newNote') },
  { label: t('preschoolHealthPage.alerts.inProgress'), value: healthAlerts.value.summary?.inProgressAlerts ?? 0, note: t('preschoolHealthPage.alerts.inProgressNote') },
  { label: t('preschoolHealthPage.alerts.critical'), value: healthAlerts.value.summary?.criticalAlerts ?? 0, note: t('preschoolHealthPage.alerts.criticalNote') },
  { label: t('preschoolHealthPage.alerts.resolvedThisWeek'), value: healthAlerts.value.summary?.resolvedThisWeek ?? 0, note: t('preschoolHealthPage.alerts.resolvedThisWeekNote') },
])

const activeAlerts = computed(() => (healthAlerts.value.items || []).filter((alert) => !['resolved', 'closed'].includes(String(alert.status || '').trim())))
const resolvedAlerts = computed(() => (healthAlerts.value.items || []).filter((alert) => ['resolved', 'closed'].includes(String(alert.status || '').trim())).slice(0, 6))
const assignedStaffNames = computed(() => {
  const names = new Set()
  activeAlerts.value.forEach((alert) => {
    const assigned = alert.assignedTo?.fullName || alert.assignedTo?.username || ''
    if (assigned) names.add(assigned)
  })
  return Array.from(names)
})

const filteredAuditLogs = computed(() => {
  if (auditActionFilter.value === 'all') {
    return healthAuditLogs.value
  }

  return healthAuditLogs.value.filter((entry) => String(entry.action || '').startsWith(auditActionFilter.value))
})

function getStudentId() {
  return String(route.params.id || '').trim()
}

function setProfileFromHealthPayload(payload = {}) {
  medicalProfile.blood_type = payload.blood_type || payload.bloodType || ''
  medicalProfile.chronic_conditions = Array.isArray(payload.chronic_conditions || payload.chronicConditions)
    ? (payload.chronic_conditions || payload.chronicConditions).join(', ')
    : (payload.chronic_conditions || payload.chronicConditions || '')
  medicalProfile.current_conditions = Array.isArray(payload.current_conditions || payload.currentConditions)
    ? (payload.current_conditions || payload.currentConditions).join(', ')
    : (payload.current_conditions || payload.currentConditions || '')
  medicalProfile.medical_notes = payload.medical_notes || payload.medicalNotes || ''
  medicalProfile.status = payload.status || 'active'
}

function resetProfile() {
  setProfileFromHealthPayload({})
}

function updateSectionForm(sectionKey, value) {
  sectionStates[sectionKey].form = { ...value }
}

function resetSection(sectionKey) {
  sectionStates[sectionKey].editingId = ''
  sectionStates[sectionKey].form = sectionMeta[sectionKey].fields.reduce((acc, field) => {
    if (field.type === 'checkbox') {
      acc[field.key] = false
    } else if (field.type === 'number') {
      acc[field.key] = ''
    } else if (field.type === 'select' && field.options?.length) {
      acc[field.key] = field.options[0].value
    } else {
      acc[field.key] = ''
    }
    return acc
  }, {})
}

function loadSectionForm(sectionKey, item) {
  sectionStates[sectionKey].editingId = String(item?.id || '').trim()
  sectionStates[sectionKey].form = { ...sectionMeta[sectionKey].mapForm(item?.raw || item || {}) }
}

async function loadStudent() {
  const studentId = getStudentId()
  if (!studentId) {
    errorMessage.value = t('preschoolHealthPage.messages.studentRequired')
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    student.value = await fetchPreschoolStudent(studentId)
    if (!student.value) {
      errorMessage.value = t('preschoolHealthPage.messages.studentNotFound')
      return
    }

    healthSummary.value = await fetchStudentHealthSummary(studentId)
    healthAlerts.value = await fetchStudentHealthAlerts(studentId)

    const medicalResponse = await fetchStudentMedicalProfile(studentId)
    setProfileFromHealthPayload(medicalResponse?.medicalProfile || {})

    await Promise.all([
      loadSection('allergies'),
      loadSection('vaccinations'),
      loadSection('medications'),
      loadSection('incidents'),
      loadSection('contacts'),
      loadSection('healthChecks'),
    ])
    await loadAuditLogs(studentId)
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolHealthPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

async function loadAuditLogs(studentId = getStudentId()) {
  const id = String(studentId || '').trim()
  if (!id) {
    healthAuditLogs.value = []
    return
  }

  auditLoading.value = true
  auditError.value = ''

  try {
    const payload = await fetchStudentHealthAuditLogs(id, { per_page: 25 })
    healthAuditLogs.value = payload.items || []
  } catch (error) {
    healthAuditLogs.value = []
    auditError.value = error?.message || t('preschoolHealthPage.messages.auditLoadFailed')
  } finally {
    auditLoading.value = false
  }
}

async function loadSection(sectionKey) {
  const studentId = getStudentId()
  const config = sectionMeta[sectionKey]
  const state = sectionStates[sectionKey]
  state.loading = true
  state.error = ''

  try {
    const items = await config.fetch(studentId)
    state.items = Array.isArray(items)
      ? items.map((item) => ({
        ...config.mapItem(item.raw || item),
        raw: item.raw || item,
      }))
      : []
  } catch (error) {
    state.items = []
    state.error = error?.message || t('preschoolHealthPage.messages.loadFailed')
  } finally {
    state.loading = false
  }
}

async function saveMedicalProfile() {
  const studentId = getStudentId()
  if (!studentId) return

  savingProfile.value = true
  profileError.value = ''

  try {
    await saveStudentMedicalProfile(studentId, {
      blood_type: medicalProfile.blood_type,
      chronic_conditions: String(medicalProfile.chronic_conditions || '')
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
      current_conditions: String(medicalProfile.current_conditions || '')
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
      medical_notes: medicalProfile.medical_notes,
      status: medicalProfile.status,
    })
    healthSummary.value = await fetchStudentHealthSummary(studentId)
    healthAlerts.value = await fetchStudentHealthAlerts(studentId)
    await loadAuditLogs(studentId)
  } catch (error) {
    profileError.value = error?.message || t('preschoolHealthPage.messages.saveFailed')
  } finally {
    savingProfile.value = false
  }
}

async function saveSection(sectionKey) {
  const studentId = getStudentId()
  const config = sectionMeta[sectionKey]
  const state = sectionStates[sectionKey]
  state.saving = true
  state.error = ''

  try {
    const payload = { ...state.form }
    if (state.editingId) {
      payload.id = state.editingId
    }

    await config.save(studentId, payload)
    resetSection(sectionKey)
    await loadSection(sectionKey)
    healthSummary.value = await fetchStudentHealthSummary(studentId)
    healthAlerts.value = await fetchStudentHealthAlerts(studentId)
    await loadAuditLogs(studentId)
  } catch (error) {
    state.error = error?.message || t('preschoolHealthPage.messages.saveFailed')
  } finally {
    state.saving = false
  }
}

async function editSectionItem(sectionKey, item) {
  loadSectionForm(sectionKey, item)
}

async function deleteSectionItem(sectionKey, item) {
  const studentId = getStudentId()
  const config = sectionMeta[sectionKey]
  const rowId = String(item?.id || '').trim()
  if (!studentId || !rowId) return

  const state = sectionStates[sectionKey]
  state.saving = true
  state.error = ''

  try {
    await config.remove(studentId, rowId)
    if (state.editingId === rowId) {
      resetSection(sectionKey)
    }
    await loadSection(sectionKey)
    healthSummary.value = await fetchStudentHealthSummary(studentId)
    healthAlerts.value = await fetchStudentHealthAlerts(studentId)
    await loadAuditLogs(studentId)
  } catch (error) {
    state.error = error?.message || t('preschoolHealthPage.messages.deleteFailed')
  } finally {
    state.saving = false
  }
}

function goBack() {
  router.push({ name: 'dashboard-preschool-admin-students' })
}

watch(() => route.params.id, () => {
  loadStudent()
})

onMounted(async () => {
  resetProfile()
  Object.keys(sectionStates).forEach((sectionKey) => resetSection(sectionKey))
  await loadStudent()
})
</script>

<template>
  <MainLayout>
    <section class="health-profile-page">
      <HeaderSection
        :title="t('preschoolHealthPage.profile.title')"
        :subtitle="t('preschoolHealthPage.profile.subtitle')"
      />

      <div class="health-profile-page__shell">
        <div class="health-profile-page__toolbar">
          <Button type="button" variant="ghost" rounded="xl" @click="goBack">
            {{ t('preschoolHealthPage.actions.backToStudents') }}
          </Button>
        </div>

        <div v-if="loading" class="health-profile-page__state">
          {{ t('preschoolHealthPage.messages.loading') }}
        </div>

        <div v-else-if="errorMessage" class="health-profile-page__state health-profile-page__state--error">
          {{ errorMessage }}
        </div>

        <template v-else-if="selectedStudent">
          <div class="health-profile-page__hero">
            <div class="health-profile-page__avatar">
              <img v-if="avatarSrc" :src="avatarSrc" :alt="selectedStudent.fullName || selectedStudent.name || 'Student avatar'" class="health-profile-page__avatar-img" />
              <span v-else class="health-profile-page__avatar-initials">{{ initials }}</span>
            </div>

            <div class="health-profile-page__hero-copy">
              <p class="health-profile-page__eyebrow">{{ t('preschoolHealthPage.profile.eyebrow') }}</p>
              <h2 class="health-profile-page__name">{{ selectedStudent.fullName || selectedStudent.name || '-' }}</h2>
              <p class="health-profile-page__code">{{ selectedStudent.publicId || selectedStudent.studentCode || '-' }}</p>
              <p class="health-profile-page__summary">{{ t('preschoolHealthPage.profile.summary') }}</p>
            </div>

            <div class="health-profile-page__hero-actions">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                rounded="xl"
                :label="t('preschoolHealthPage.actions.openAdminDashboard')"
                @click="router.push({ name: 'dashboard-preschool-admin-health' })"
              />
            </div>
          </div>

          <div class="health-profile-page__cards">
            <article v-for="card in summaryCards" :key="card.label" class="health-profile-page__card">
              <p class="health-profile-page__card-label">{{ card.label }}</p>
              <p class="health-profile-page__card-value">{{ card.value }}</p>
            </article>
          </div>

          <div class="health-profile-page__alert-summary">
            <article v-for="card in alertSummaryCards" :key="card.label" class="health-profile-page__alert-card">
              <p class="health-profile-page__card-label">{{ card.label }}</p>
              <p class="health-profile-page__card-value">{{ card.value }}</p>
              <p class="health-profile-page__card-note">{{ card.note }}</p>
            </article>
          </div>

          <div class="health-profile-page__alert-panels">
            <section class="health-profile-page__panel health-profile-page__panel--alerts">
              <div class="health-profile-page__medical-header">
                <div>
                  <p class="health-profile-page__section-eyebrow">{{ t('preschoolHealthPage.alerts.eyebrow') }}</p>
                  <h3 class="health-profile-page__section-title">{{ t('preschoolHealthPage.alerts.activeAlerts') }}</h3>
                </div>
              </div>

              <div v-if="!activeAlerts.length" class="health-profile-page__state">
                {{ t('preschoolHealthPage.alerts.noActiveAlerts') }}
              </div>
              <div v-else class="health-profile-page__alert-list">
                <article v-for="alert in activeAlerts" :key="alert.id" class="health-profile-page__alert-item">
                  <div class="health-profile-page__alert-copy">
                    <p class="health-profile-page__audit-action">{{ alert.title || t('preschoolHealthPage.summary.alert') }}</p>
                    <p class="health-profile-page__audit-meta">
                      {{ alert.description || t('preschoolHealthPage.alerts.noDescription') }}
                    </p>
                    <p class="health-profile-page__audit-meta">
                      {{ t('preschoolHealthPage.alerts.source') }}: {{ alert.sourceType || '-' }}
                    </p>
                    <p class="health-profile-page__audit-meta">
                      {{ t('preschoolHealthPage.alerts.assignedTo') }}:
                      {{ alert.assignedTo?.fullName || alert.assignedTo?.username || t('preschoolHealthPage.alerts.unassigned') }}
                    </p>
                  </div>
                  <div class="health-profile-page__alert-badges">
                    <span class="health-profile-page__status-badge" :data-severity="alert.severity || 'medium'">
                      {{ t(`preschoolHealthPage.severity.${alert.severity || 'medium'}`) }}
                    </span>
                    <span class="health-profile-page__status-badge" :data-status="alert.status || 'new'">
                      {{ t(`preschoolHealthPage.status.${alert.status || 'new'}`) }}
                    </span>
                  </div>
                </article>
              </div>
            </section>

            <section class="health-profile-page__panel health-profile-page__panel--alerts">
              <div class="health-profile-page__medical-header">
                <div>
                  <p class="health-profile-page__section-eyebrow">{{ t('preschoolHealthPage.alerts.resolutionHistory') }}</p>
                  <h3 class="health-profile-page__section-title">{{ t('preschoolHealthPage.alerts.recentResolutions') }}</h3>
                </div>
              </div>

              <div v-if="!resolvedAlerts.length" class="health-profile-page__state">
                {{ t('preschoolHealthPage.alerts.noRecentResolutions') }}
              </div>
              <div v-else class="health-profile-page__alert-list">
                <article v-for="alert in resolvedAlerts" :key="alert.id" class="health-profile-page__alert-item">
                  <div class="health-profile-page__alert-copy">
                    <p class="health-profile-page__audit-action">{{ alert.title || t('preschoolHealthPage.summary.alert') }}</p>
                    <p class="health-profile-page__audit-meta">
                      {{ t('preschoolHealthPage.alerts.resolvedBy') }}:
                      {{ alert.resolvedBy?.fullName || alert.resolvedBy?.username || '-' }}
                    </p>
                    <p class="health-profile-page__audit-meta">
                      {{ alert.resolutionNotes || alert.description || t('preschoolHealthPage.alerts.noDescription') }}
                    </p>
                  </div>
                  <div class="health-profile-page__alert-badges">
                    <span class="health-profile-page__status-badge" :data-status="alert.status || 'resolved'">
                      {{ t(`preschoolHealthPage.status.${alert.status || 'resolved'}`) }}
                    </span>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <div v-if="assignedStaffNames.length" class="health-profile-page__assigned-staff">
            <span class="health-profile-page__assigned-label">{{ t('preschoolHealthPage.alerts.filterAssigneeLabel') }}</span>
            <span v-for="name in assignedStaffNames" :key="name" class="health-profile-page__assigned-pill">{{ name }}</span>
          </div>

          <div class="health-profile-page__medical">
            <div class="health-profile-page__medical-header">
              <div>
                <p class="health-profile-page__section-eyebrow">{{ t('preschoolHealthPage.profile.medicalProfile') }}</p>
                <h3 class="health-profile-page__section-title">{{ t('preschoolHealthPage.profile.medicalProfileTitle') }}</h3>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                rounded="xl"
                :label="t('preschoolHealthPage.actions.saveProfile')"
                :loading="savingProfile"
                @click="saveMedicalProfile"
              />
            </div>

            <div v-if="profileError" class="health-profile-page__inline-error">{{ profileError }}</div>

            <div class="health-profile-page__profile-grid">
              <label class="health-profile-page__field">
                <span>{{ t('preschoolHealthPage.form.bloodType') }}</span>
                <input v-model="medicalProfile.blood_type" type="text" class="health-profile-page__input" />
              </label>

              <label class="health-profile-page__field">
                <span>{{ t('preschoolHealthPage.form.status') }}</span>
                <select v-model="medicalProfile.status" class="health-profile-page__input">
                  <option value="active">{{ t('preschoolHealthPage.status.active') }}</option>
                  <option value="inactive">{{ t('preschoolHealthPage.status.inactive') }}</option>
                </select>
              </label>

              <label class="health-profile-page__field health-profile-page__field--full">
                <span>{{ t('preschoolHealthPage.form.chronicConditions') }}</span>
                <textarea v-model="medicalProfile.chronic_conditions" class="health-profile-page__input health-profile-page__input--textarea" rows="2" />
              </label>

              <label class="health-profile-page__field health-profile-page__field--full">
                <span>{{ t('preschoolHealthPage.form.currentConditions') }}</span>
                <textarea v-model="medicalProfile.current_conditions" class="health-profile-page__input health-profile-page__input--textarea" rows="2" />
              </label>

              <label class="health-profile-page__field health-profile-page__field--full">
                <span>{{ t('preschoolHealthPage.form.medicalNotes') }}</span>
                <textarea v-model="medicalProfile.medical_notes" class="health-profile-page__input health-profile-page__input--textarea" rows="3" />
              </label>
            </div>
          </div>

          <div class="health-profile-page__panels">
            <HealthRecordPanel
              :title="sectionMeta.allergies.title"
              :subtitle="sectionMeta.allergies.subtitle"
              :items="allergyState.items"
              :fields="sectionMeta.allergies.fields"
              :model-value="allergyState.form"
              :editing-id="allergyState.editingId"
              :loading="allergyState.loading"
              :saving="allergyState.saving"
              :empty-text="sectionMeta.allergies.emptyText"
              :list-title="sectionMeta.allergies.listTitle"
              :save-label="sectionMeta.allergies.saveLabel"
              :add-label="sectionMeta.allergies.addLabel"
              :reset-label="sectionMeta.allergies.resetLabel"
              @update:model-value="(value) => updateSectionForm('allergies', value)"
              @save="saveSection('allergies')"
              @edit="(item) => editSectionItem('allergies', item)"
              @delete="(item) => deleteSectionItem('allergies', item)"
              @reset="resetSection('allergies')"
            />

            <HealthRecordPanel
              :title="sectionMeta.vaccinations.title"
              :subtitle="sectionMeta.vaccinations.subtitle"
              :items="vaccinationState.items"
              :fields="sectionMeta.vaccinations.fields"
              :model-value="vaccinationState.form"
              :editing-id="vaccinationState.editingId"
              :loading="vaccinationState.loading"
              :saving="vaccinationState.saving"
              :empty-text="sectionMeta.vaccinations.emptyText"
              :list-title="sectionMeta.vaccinations.listTitle"
              :save-label="sectionMeta.vaccinations.saveLabel"
              :add-label="sectionMeta.vaccinations.addLabel"
              :reset-label="sectionMeta.vaccinations.resetLabel"
              @update:model-value="(value) => updateSectionForm('vaccinations', value)"
              @save="saveSection('vaccinations')"
              @edit="(item) => editSectionItem('vaccinations', item)"
              @delete="(item) => deleteSectionItem('vaccinations', item)"
              @reset="resetSection('vaccinations')"
            />

            <HealthRecordPanel
              :title="sectionMeta.medications.title"
              :subtitle="sectionMeta.medications.subtitle"
              :items="medicationState.items"
              :fields="sectionMeta.medications.fields"
              :model-value="medicationState.form"
              :editing-id="medicationState.editingId"
              :loading="medicationState.loading"
              :saving="medicationState.saving"
              :empty-text="sectionMeta.medications.emptyText"
              :list-title="sectionMeta.medications.listTitle"
              :save-label="sectionMeta.medications.saveLabel"
              :add-label="sectionMeta.medications.addLabel"
              :reset-label="sectionMeta.medications.resetLabel"
              @update:model-value="(value) => updateSectionForm('medications', value)"
              @save="saveSection('medications')"
              @edit="(item) => editSectionItem('medications', item)"
              @delete="(item) => deleteSectionItem('medications', item)"
              @reset="resetSection('medications')"
            />

            <HealthRecordPanel
              :title="sectionMeta.incidents.title"
              :subtitle="sectionMeta.incidents.subtitle"
              :items="incidentState.items"
              :fields="sectionMeta.incidents.fields"
              :model-value="incidentState.form"
              :editing-id="incidentState.editingId"
              :loading="incidentState.loading"
              :saving="incidentState.saving"
              :empty-text="sectionMeta.incidents.emptyText"
              :list-title="sectionMeta.incidents.listTitle"
              :save-label="sectionMeta.incidents.saveLabel"
              :add-label="sectionMeta.incidents.addLabel"
              :reset-label="sectionMeta.incidents.resetLabel"
              @update:model-value="(value) => updateSectionForm('incidents', value)"
              @save="saveSection('incidents')"
              @edit="(item) => editSectionItem('incidents', item)"
              @delete="(item) => deleteSectionItem('incidents', item)"
              @reset="resetSection('incidents')"
            />

            <HealthRecordPanel
              :title="sectionMeta.contacts.title"
              :subtitle="sectionMeta.contacts.subtitle"
              :items="contactState.items"
              :fields="sectionMeta.contacts.fields"
              :model-value="contactState.form"
              :editing-id="contactState.editingId"
              :loading="contactState.loading"
              :saving="contactState.saving"
              :empty-text="sectionMeta.contacts.emptyText"
              :list-title="sectionMeta.contacts.listTitle"
              :save-label="sectionMeta.contacts.saveLabel"
              :add-label="sectionMeta.contacts.addLabel"
              :reset-label="sectionMeta.contacts.resetLabel"
              @update:model-value="(value) => updateSectionForm('contacts', value)"
              @save="saveSection('contacts')"
              @edit="(item) => editSectionItem('contacts', item)"
              @delete="(item) => deleteSectionItem('contacts', item)"
              @reset="resetSection('contacts')"
            />

            <HealthRecordPanel
              :title="sectionMeta.healthChecks.title"
              :subtitle="sectionMeta.healthChecks.subtitle"
              :items="healthCheckState.items"
              :fields="sectionMeta.healthChecks.fields"
              :model-value="healthCheckState.form"
              :editing-id="healthCheckState.editingId"
              :loading="healthCheckState.loading"
              :saving="healthCheckState.saving"
              :empty-text="sectionMeta.healthChecks.emptyText"
              :list-title="sectionMeta.healthChecks.listTitle"
              :save-label="sectionMeta.healthChecks.saveLabel"
              :add-label="sectionMeta.healthChecks.addLabel"
              :reset-label="sectionMeta.healthChecks.resetLabel"
              @update:model-value="(value) => updateSectionForm('healthChecks', value)"
              @save="saveSection('healthChecks')"
              @edit="(item) => editSectionItem('healthChecks', item)"
              @delete="(item) => deleteSectionItem('healthChecks', item)"
              @reset="resetSection('healthChecks')"
            />

            <section class="health-profile-page__audit">
              <div class="health-profile-page__audit-header">
                <div>
                  <p class="health-profile-page__section-eyebrow">{{ t('preschoolHealthPage.audit.eyebrow') }}</p>
                  <h3 class="health-profile-page__section-title">{{ t('preschoolHealthPage.audit.title') }}</h3>
                </div>
                <label class="health-profile-page__audit-filter">
                  <span>{{ t('preschoolHealthPage.audit.filterLabel') }}</span>
                  <select v-model="auditActionFilter" class="health-profile-page__input">
                    <option value="all">{{ t('preschoolHealthPage.audit.filters.all') }}</option>
                    <option value="created">{{ t('preschoolHealthPage.audit.filters.created') }}</option>
                    <option value="updated">{{ t('preschoolHealthPage.audit.filters.updated') }}</option>
                    <option value="deleted">{{ t('preschoolHealthPage.audit.filters.deleted') }}</option>
                    <option value="alert">{{ t('preschoolHealthPage.audit.filters.alert') }}</option>
                  </select>
                </label>
              </div>

              <div v-if="auditLoading" class="health-profile-page__state">
                <i class="pi pi-spin pi-spinner" />
              </div>
              <div v-else-if="auditError" class="health-profile-page__inline-error">
                {{ auditError }}
              </div>
              <div v-else-if="!filteredAuditLogs.length" class="health-profile-page__state">
                {{ t('preschoolHealthPage.messages.noAuditLogs') }}
              </div>
              <div v-else class="health-profile-page__audit-list">
                <article v-for="entry in filteredAuditLogs" :key="entry.id" class="health-profile-page__audit-item">
                  <div class="health-profile-page__audit-copy">
                    <p class="health-profile-page__audit-action">{{ t(`preschoolHealthPage.audit.actions.${entry.action}`) }}</p>
                    <p class="health-profile-page__audit-meta">
                      {{ entry.entityType }}#{{ entry.entityId || '-' }} - {{ entry.createdAt || entry.created_at || '-' }}
                    </p>
                    <p v-if="entry.message" class="health-profile-page__audit-message">{{ entry.message }}</p>
                  </div>
                  <div class="health-profile-page__audit-badges">
                    <span v-if="entry.severity" class="health-profile-page__status-badge" :data-severity="entry.severity">
                      {{ t(`preschoolHealthPage.severity.${entry.severity}`) }}
                    </span>
                    <span class="health-profile-page__status-badge" :data-visibility="entry.visibility">
                      {{ t(`preschoolHealthPage.audit.visibility.${entry.visibility || 'admin'}`) }}
                    </span>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </template>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.health-profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.health-profile-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #dbe3ef;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.99) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.health-profile-page__toolbar {
  display: flex;
  justify-content: flex-end;
}

.health-profile-page__state {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  background: #fff;
}

.health-profile-page__state--error {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fff1f2;
}

.health-profile-page__hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1.1rem;
  border-radius: 1.35rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(135deg, #0f2e63 0%, #12356f 45%, #0f2a58 100%);
  color: #fff;
}

.health-profile-page__avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 9999px;
  overflow: hidden;
  background: linear-gradient(135deg, #c4b5fd, #7c3aed);
  border: 4px solid rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.health-profile-page__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.health-profile-page__avatar-initials {
  font-size: 1.8rem;
  font-weight: 800;
}

.health-profile-page__eyebrow,
.health-profile-page__section-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #93c5fd;
}

.health-profile-page__name,
.health-profile-page__section-title {
  margin: 0.25rem 0 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: inherit;
}

.health-profile-page__code,
.health-profile-page__summary {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.86);
}

.health-profile-page__hero-actions {
  align-self: start;
}

.health-profile-page__cards {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.75rem;
}

.health-profile-page__alert-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.health-profile-page__alert-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.health-profile-page__card,
.health-profile-page__medical {
  border-radius: 1.25rem;
  border: 1px solid #dbe3ef;
  background: #fff;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
}

.health-profile-page__card {
  padding: 1rem;
}

.health-profile-page__card-label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #64748b;
}

.health-profile-page__card-value {
  margin: 0.35rem 0 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
}

.health-profile-page__alert-card {
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dbe3ef;
  background: #fff;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
}

.health-profile-page__card-note {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.health-profile-page__medical {
  padding: 1rem;
}

.health-profile-page__medical-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.health-profile-page__inline-error {
  padding: 0.75rem 0.9rem;
  border-radius: 0.9rem;
  background: #fff1f2;
  color: #b91c1c;
  margin-bottom: 0.85rem;
}

.health-profile-page__profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.health-profile-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.health-profile-page__field--full {
  grid-column: 1 / -1;
}

.health-profile-page__field span {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.health-profile-page__input {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 0.85rem;
  background: #fff;
  color: #0f172a;
  font-size: 0.92rem;
}

.health-profile-page__input--textarea {
  min-height: 4rem;
  resize: vertical;
}

.health-profile-page__panels {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.health-profile-page__audit {
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dbe3ef;
  background: #fff;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
}

.health-profile-page__audit-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.9rem;
}

.health-profile-page__audit-filter {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 12rem;
}

.health-profile-page__audit-filter span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.health-profile-page__audit-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.health-profile-page__alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.health-profile-page__alert-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.health-profile-page__alert-copy {
  min-width: 0;
}

.health-profile-page__alert-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: flex-start;
}

.health-profile-page__assigned-staff {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.75rem;
}

.health-profile-page__assigned-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.health-profile-page__assigned-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 9999px;
  background: #e0f2fe;
  color: #075985;
  font-size: 0.82rem;
  font-weight: 700;
}

.health-profile-page__audit-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.health-profile-page__audit-action {
  margin: 0;
  font-weight: 800;
  color: #0f172a;
}

.health-profile-page__audit-meta,
.health-profile-page__audit-message {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.health-profile-page__audit-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: flex-start;
}

.health-profile-page__status-badge[data-severity='critical'] {
  background: #fee2e2;
  color: #991b1b;
}

.health-profile-page__status-badge[data-severity='high'] {
  background: #fef3c7;
  color: #92400e;
}

.health-profile-page__status-badge[data-severity='medium'] {
  background: #dbeafe;
  color: #1d4ed8;
}

.health-profile-page__status-badge[data-visibility='teacher'] {
  background: #ecfccb;
  color: #3f6212;
}

@media (max-width: 1100px) {
  .health-profile-page__cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .health-profile-page__hero {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .health-profile-page__hero-actions {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .health-profile-page__cards,
  .health-profile-page__profile-grid {
    grid-template-columns: 1fr;
  }

  .health-profile-page__hero {
    grid-template-columns: 1fr;
  }

  .health-profile-page__medical-header {
    flex-direction: column;
  }

  .health-profile-page__audit-header,
  .health-profile-page__audit-item {
    flex-direction: column;
  }
}
</style>
