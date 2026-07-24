<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  buildLocationAddress,
  getLocationDisplayName,
  fetchProvinces,
  fetchDistricts,
  fetchCommunes,
  fetchVillages,
} from '@/modules/preschool/services/cambodiaLocationService'

defineOptions({ name: 'EnrollmentApplicationForm' })

const props = defineProps({
  application: { type: Object, default: null },
  academicYears: { type: Array, default: () => [] },
  terms: { type: Array, default: () => [] },
  classes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  saveLabel: { type: String, default: '' },
  cancelLabel: { type: String, default: '' },
  validationErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['cancel', 'save'])
const { t, locale } = useI18n()
const currentLocale = computed(() => (String(locale.value || 'kh').toLowerCase() === 'en' ? 'en' : 'kh'))

const form = ref({})
const validationMessage = ref('')
const localFieldErrors = ref({})
const isFormHydrating = ref(false)
const provinceItems = ref([])
const provinceLoadErrorMessage = ref('')
const isProvinceOptionsLoading = ref(false)

const guardianDistrictItems = ref([])
const guardianCommuneItems = ref([])
const guardianVillageItems = ref([])
const guardianLocationErrorMessage = ref('')
const guardianLocationLoading = ref(false)
const guardianLocationSyncing = ref(false)

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeValue(value) {
  const text = normalizeText(value)
  return text === '' ? '' : text
}

function fieldId(name) {
  return `enr-${name}`
}

function displayLocationName(item = {}) {
  return getLocationDisplayName(item, currentLocale.value)
}

function buildLocationOptions(items = []) {
  return items.filter(Boolean).map((item) => ({
    label: displayLocationName(item),
    value: String(item.id ?? item.code ?? item.nameKh ?? item.nameEn ?? ''),
  }))
}

function buildDisplayLocationOptions(items = []) {
  return items.filter(Boolean).map((item) => {
    const label = displayLocationName(item)
    return { label, value: label }
  })
}

function findLocationItem(items = [], selectedValue = '') {
  const normalized = normalizeText(selectedValue)
  if (!normalized) return null

  return items.filter(Boolean).find((item) => (
    [
      item.id,
      item.code,
      item.nameEn,
      item.nameKh,
      displayLocationName(item),
    ].some((candidate) => normalizeText(candidate) === normalized)
  )) || null
}

function normalizeFieldError(value) {
  if (Array.isArray(value)) {
    return normalizeText(value[0] ?? '')
  }

  return normalizeText(value)
}

function fieldError(field) {
  return normalizeFieldError(props.validationErrors?.[field] ?? localFieldErrors.value?.[field])
}

function isKnownGuardianType(value) {
  return ['father', 'mother', 'grandfather', 'grandmother', 'other'].includes(normalizeText(value).toLowerCase())
}

function resolveGuardianRelationship(rawValue) {
  const normalized = normalizeText(rawValue)
  if (!normalized) {
    return { type: '', detail: '' }
  }

  if (isKnownGuardianType(normalized)) {
    return { type: normalized.toLowerCase(), detail: '' }
  }

  return { type: 'other', detail: normalized }
}

function readApplicationValue(application, camelKey, snakeKey, nestedKey = '') {
  if (!application) return ''

  const nested = nestedKey ? application?.[nestedKey] : null
  const nestedId = nested && typeof nested === 'object' ? nested.id : ''
  return normalizeValue(application?.[camelKey] ?? application?.[snakeKey] ?? nestedId)
}

function readApplicationText(application, camelKey, snakeKey) {
  if (!application) return ''

  return normalizeValue(application?.[camelKey] ?? application?.[snakeKey])
}

function createStructuredLocationState(prefix) {
  const state = reactive({
    districtItems: [],
    communeItems: [],
    villageItems: [],
    errorMessage: '',
    loading: false,
    syncing: false,
  })
  let requestSequence = 0

  const keys = {
    province: `${prefix}_province_id`,
    district: `${prefix}_district_id`,
    commune: `${prefix}_commune_id`,
    village: `${prefix}_village_id`,
  }

  const districtOptions = computed(() => buildLocationOptions(state.districtItems))
  const communeOptions = computed(() => buildLocationOptions(state.communeItems))
  const villageOptions = computed(() => buildLocationOptions(state.villageItems))

  function setError(message = '') {
    state.errorMessage = normalizeText(message)
  }

  function clearChildren(level = 'province') {
    if (level === 'province') {
      form.value[keys.district] = ''
      form.value[keys.commune] = ''
      form.value[keys.village] = ''
      state.districtItems = []
      state.communeItems = []
      state.villageItems = []
      setError('')
      return
    }

    if (level === 'district') {
      form.value[keys.commune] = ''
      form.value[keys.village] = ''
      state.communeItems = []
      state.villageItems = []
      setError('')
      return
    }

    if (level === 'commune') {
      form.value[keys.village] = ''
      state.villageItems = []
      setError('')
    }
  }

  async function loadDistrictOptionsForProvince(provinceValue) {
    const province = findLocationItem(provinceItems.value, provinceValue)
    if (!province) {
      state.districtItems = []
      state.communeItems = []
      state.villageItems = []
      return null
    }

    const requestId = ++requestSequence
    state.loading = true
    try {
      const items = await fetchDistricts(province.code)
      if (requestId !== requestSequence) return province

      state.districtItems = items
      setError('')
      return province
    } catch (error) {
      if (requestId !== requestSequence) return null

      state.districtItems = []
      state.communeItems = []
      state.villageItems = []
      setError(error?.message || t('preschoolEnrollmentPage.messages.locationLoadFailed'))
      return null
    } finally {
      if (requestId === requestSequence) {
        state.loading = false
      }
    }
  }

  async function loadCommuneOptionsForDistrict(districtValue) {
    const district = findLocationItem(state.districtItems, districtValue)
    if (!district) {
      state.communeItems = []
      state.villageItems = []
      return null
    }

    const requestId = ++requestSequence
    state.loading = true
    try {
      const items = await fetchCommunes(district.code)
      if (requestId !== requestSequence) return district

      state.communeItems = items
      setError('')
      return district
    } catch (error) {
      if (requestId !== requestSequence) return null

      state.communeItems = []
      state.villageItems = []
      setError(error?.message || t('preschoolEnrollmentPage.messages.locationLoadFailed'))
      return null
    } finally {
      if (requestId === requestSequence) {
        state.loading = false
      }
    }
  }

  async function loadVillageOptionsForCommune(communeValue) {
    const commune = findLocationItem(state.communeItems, communeValue)
    if (!commune) {
      state.villageItems = []
      return null
    }

    const requestId = ++requestSequence
    state.loading = true
    try {
      const items = await fetchVillages(commune.code)
      if (requestId !== requestSequence) return commune

      state.villageItems = items
      setError('')
      return commune
    } catch (error) {
      if (requestId !== requestSequence) return null

      state.villageItems = []
      setError(error?.message || t('preschoolEnrollmentPage.messages.locationLoadFailed'))
      return null
    } finally {
      if (requestId === requestSequence) {
        state.loading = false
      }
    }
  }

  async function hydrate() {
    const provinceValue = normalizeText(form.value[keys.province])
    if (!provinceValue) return

    state.syncing = true
    try {
      const province = await loadDistrictOptionsForProvince(provinceValue)
      if (province) {
        form.value[keys.province] = String(province.id)
      }

      if (!form.value[keys.province] || !form.value[keys.district]) return

      const district = await loadCommuneOptionsForDistrict(form.value[keys.district])
      if (district) {
        form.value[keys.district] = String(district.id)
      }

      if (!form.value[keys.district] || !form.value[keys.commune]) return

      const commune = await loadVillageOptionsForCommune(form.value[keys.commune])
      if (commune) {
        form.value[keys.commune] = String(commune.id)
      }

      const village = findLocationItem(state.villageItems, form.value[keys.village])
      if (village) {
        form.value[keys.village] = String(village.id)
      }
    } finally {
      queueMicrotask(() => {
        state.syncing = false
      })
    }
  }

  return Object.assign(state, {
    keys,
    districtOptions,
    communeOptions,
    villageOptions,
    clearChildren,
    loadDistrictOptionsForProvince,
    loadCommuneOptionsForDistrict,
    loadVillageOptionsForCommune,
    hydrate,
    setError,
  })
}

const birthLocation = createStructuredLocationState('birth')
const residenceLocation = createStructuredLocationState('residence')

const birthProvinceOptions = computed(() => buildLocationOptions(provinceItems.value))
const residenceProvinceOptions = computed(() => buildLocationOptions(provinceItems.value))
const guardianProvinceOptions = computed(() => buildDisplayLocationOptions(provinceItems.value))
const guardianDistrictOptions = computed(() => buildDisplayLocationOptions(guardianDistrictItems.value))
const guardianCommuneOptions = computed(() => buildDisplayLocationOptions(guardianCommuneItems.value))
const guardianVillageOptions = computed(() => buildDisplayLocationOptions(guardianVillageItems.value))

const guardianTypeOptions = computed(() => [
  { label: t('preschoolEnrollmentPage.applicationDialog.guardianTypes.father'), value: 'father' },
  { label: t('preschoolEnrollmentPage.applicationDialog.guardianTypes.mother'), value: 'mother' },
  { label: t('preschoolEnrollmentPage.applicationDialog.guardianTypes.grandfather'), value: 'grandfather' },
  { label: t('preschoolEnrollmentPage.applicationDialog.guardianTypes.grandmother'), value: 'grandmother' },
  { label: t('preschoolEnrollmentPage.applicationDialog.guardianTypes.other'), value: 'other' },
])

const isOtherGuardianType = computed(() => normalizeText(form.value.guardian_relationship) === 'other')

const hasGuardianStructuredLocation = computed(() => Boolean(
  form.value.guardian_province ||
  form.value.guardian_district ||
  form.value.guardian_commune ||
  form.value.guardian_village,
))

const legacyBirthPlace = computed(() => normalizeText(
  props.application?.placeOfBirth
  ?? props.application?.place_of_birth
  ?? form.value.place_of_birth
  ?? '',
))

const legacyResidenceText = computed(() => normalizeText(
  props.application?.currentResidenceDisplay
  ?? props.application?.address
  ?? props.application?.guardianAddress
  ?? props.application?.guardian_address
  ?? '',
))

const showBirthLegacyNote = computed(() => Boolean(
  legacyBirthPlace.value &&
  !form.value.birth_province_id &&
  !form.value.birth_district_id &&
  !form.value.birth_commune_id &&
  !form.value.birth_village_id,
))
const showResidenceLegacyNote = computed(() => Boolean(legacyResidenceText.value && !form.value.residence_province_id && !form.value.residence_district_id && !form.value.residence_commune_id && !form.value.residence_village_id))

function setTopValidationMessage(message = '') {
  validationMessage.value = normalizeText(message)
}

function resetProvinceData() {
  provinceItems.value = []
  birthLocation.clearChildren('province')
  residenceLocation.clearChildren('province')
  clearGuardianLocationChildren('province')
}

function createEmptyForm(application = null) {
  const relationship = resolveGuardianRelationship(
    application?.guardianRelationship
    ?? application?.guardian_relationship
    ?? application?.relationship
    ?? application?.guardianType
    ?? application?.guardian_type,
  )

  return {
    first_name: readApplicationValue(application, 'firstName', 'first_name'),
    last_name: readApplicationValue(application, 'lastName', 'last_name'),
    latin_name: readApplicationValue(application, 'latinName', 'latin_name') || readApplicationValue(application, 'khmerName', 'khmer_name'),
    khmer_name: readApplicationValue(application, 'latinName', 'latin_name') || readApplicationValue(application, 'khmerName', 'khmer_name'),
    gender: readApplicationValue(application, 'gender', 'gender'),
    date_of_birth: readApplicationValue(application, 'dateOfBirth', 'date_of_birth'),
    nationality: readApplicationText(application, 'nationality', 'nationality'),
    ethnicity: readApplicationText(application, 'ethnicity', 'ethnicity'),
    place_of_birth: readApplicationText(application, 'placeOfBirth', 'place_of_birth'),
    birth_province_id: readApplicationValue(application, 'birthProvinceId', 'birth_province_id', 'birthProvince'),
    birth_district_id: readApplicationValue(application, 'birthDistrictId', 'birth_district_id', 'birthDistrict'),
    birth_commune_id: readApplicationValue(application, 'birthCommuneId', 'birth_commune_id', 'birthCommune'),
    birth_village_id: readApplicationValue(application, 'birthVillageId', 'birth_village_id', 'birthVillage'),
    residence_province_id: readApplicationValue(application, 'residenceProvinceId', 'residence_province_id', 'residenceProvince'),
    residence_district_id: readApplicationValue(application, 'residenceDistrictId', 'residence_district_id', 'residenceDistrict'),
    residence_commune_id: readApplicationValue(application, 'residenceCommuneId', 'residence_commune_id', 'residenceCommune'),
    residence_village_id: readApplicationValue(application, 'residenceVillageId', 'residence_village_id', 'residenceVillage'),
    requested_level: application?.requestedLevel ?? application?.requested_level ?? '',
    requested_academic_year_id: readApplicationValue(application, 'requestedAcademicYearId', 'requested_academic_year_id'),
    requested_term_id: readApplicationValue(application, 'requestedTermId', 'requested_term_id'),
    preferred_class_id: readApplicationValue(application, 'preferredClassId', 'preferred_class_id'),
    requested_start_date: readApplicationValue(application, 'requestedStartDate', 'requested_start_date'),
    guardian_name: application?.guardianName ?? application?.guardian_name ?? '',
    guardian_relationship: relationship.type,
    guardian_relationship_detail: relationship.detail,
    guardian_phone: application?.guardianPhone ?? application?.guardian_phone ?? '',
    guardian_email: application?.guardianEmail ?? application?.guardian_email ?? '',
    guardian_address: application?.guardianAddress ?? application?.guardian_address ?? '',
    guardian_province: application?.guardianProvince ?? application?.guardian_province ?? application?.province ?? '',
    guardian_district: application?.guardianDistrict ?? application?.guardian_district ?? application?.district ?? '',
    guardian_commune: application?.guardianCommune ?? application?.guardian_commune ?? application?.commune ?? '',
    guardian_village: application?.guardianVillage ?? application?.guardian_village ?? application?.village ?? '',
    guardian_can_pickup: Boolean(application?.guardianCanPickup ?? application?.guardian_can_pickup),
    guardian_is_emergency: Boolean(application?.guardianIsEmergency ?? application?.guardian_is_emergency),
  }
}

function normalizePayloadId(value) {
  const text = normalizeText(value)
  if (!text) return null

  const numeric = Number(text)
  return Number.isFinite(numeric) ? numeric : null
}

function buildSubmitPayload() {
  const guardianAddress = buildLocationAddress({
    province: form.value.guardian_province,
    district: form.value.guardian_district,
    commune: form.value.guardian_commune,
    village: form.value.guardian_village,
    address: form.value.guardian_address,
  }, 'kh')
  const guardianRelationship = isOtherGuardianType.value
    ? normalizeText(form.value.guardian_relationship_detail)
    : normalizeText(form.value.guardian_relationship)

  return {
    first_name: normalizeText(form.value.first_name) || null,
    last_name: normalizeText(form.value.last_name) || null,
    latin_name: normalizeText(form.value.latin_name) || null,
    khmer_name: normalizeText(form.value.latin_name) || null,
    gender: normalizeText(form.value.gender) || null,
    date_of_birth: normalizeText(form.value.date_of_birth) || null,
    nationality: normalizeText(form.value.nationality) || null,
    ethnicity: normalizeText(form.value.ethnicity) || null,
    place_of_birth: normalizeText(form.value.place_of_birth) || null,
    birth_province_id: normalizePayloadId(form.value.birth_province_id),
    birth_district_id: normalizePayloadId(form.value.birth_district_id),
    birth_commune_id: normalizePayloadId(form.value.birth_commune_id),
    birth_village_id: normalizePayloadId(form.value.birth_village_id),
    residence_province_id: normalizePayloadId(form.value.residence_province_id),
    residence_district_id: normalizePayloadId(form.value.residence_district_id),
    residence_commune_id: normalizePayloadId(form.value.residence_commune_id),
    residence_village_id: normalizePayloadId(form.value.residence_village_id),
    requested_level: normalizeText(form.value.requested_level) || null,
    requested_academic_year_id: normalizePayloadId(form.value.requested_academic_year_id),
    requested_term_id: normalizePayloadId(form.value.requested_term_id),
    preferred_class_id: normalizePayloadId(form.value.preferred_class_id),
    requested_start_date: normalizeText(form.value.requested_start_date) || null,
    guardian_name: normalizeText(form.value.guardian_name) || null,
    guardian_relationship: guardianRelationship || null,
    guardian_phone: normalizeText(form.value.guardian_phone) || null,
    guardian_email: normalizeText(form.value.guardian_email) || null,
    guardian_address: guardianAddress || null,
    guardian_can_pickup: Boolean(form.value.guardian_can_pickup),
    guardian_is_emergency: Boolean(form.value.guardian_is_emergency),
  }
}

function validateForm() {
  const errors = {}

  if (!normalizeText(form.value.first_name)) {
    errors.first_name = t('preschoolEnrollmentPage.validation.firstNameRequired')
  }

  if (!normalizeText(form.value.last_name)) {
    errors.last_name = t('preschoolEnrollmentPage.validation.lastNameRequired')
  }

  if (!normalizeText(form.value.guardian_name)) {
    errors.guardian_name = t('preschoolEnrollmentPage.validation.guardianNameRequired')
  }

  if (!normalizeText(form.value.guardian_phone)) {
    errors.guardian_phone = t('preschoolEnrollmentPage.validation.guardianPhoneRequired')
  }

  if (!normalizeText(form.value.guardian_relationship)) {
    errors.guardian_relationship = t('preschoolEnrollmentPage.validation.guardianTypeRequired')
  }

  if (isOtherGuardianType.value && !normalizeText(form.value.guardian_relationship_detail)) {
    errors.guardian_relationship_detail = t('preschoolEnrollmentPage.validation.guardianTypeOtherRequired')
  }

  if (!hasGuardianStructuredLocation.value && !normalizeText(form.value.guardian_address)) {
    errors.guardian_province = t('preschoolEnrollmentPage.validation.guardianProvinceRequired')
    errors.guardian_district = t('preschoolEnrollmentPage.validation.guardianDistrictRequired')
    errors.guardian_commune = t('preschoolEnrollmentPage.validation.guardianCommuneRequired')
    errors.guardian_village = t('preschoolEnrollmentPage.validation.guardianVillageRequired')
  }

  localFieldErrors.value = errors
  const firstError = Object.values(errors)[0] || ''
  setTopValidationMessage(firstError)
  return Object.keys(errors).length === 0
}

async function loadProvinceOptions() {
  isProvinceOptionsLoading.value = true
  try {
    provinceItems.value = await fetchProvinces()
    provinceLoadErrorMessage.value = ''
  } catch (error) {
    provinceItems.value = []
    birthLocation.clearChildren('province')
    residenceLocation.clearChildren('province')
    clearGuardianLocationChildren('province')
    provinceLoadErrorMessage.value = error?.message || t('preschoolEnrollmentPage.messages.locationLoadFailed')
  } finally {
    isProvinceOptionsLoading.value = false
  }
}

async function hydrateBirthLocation() {
  await birthLocation.hydrate()
}

async function hydrateResidenceLocation() {
  await residenceLocation.hydrate()
}

function resetGuardianLocationOptions() {
  guardianDistrictItems.value = []
  guardianCommuneItems.value = []
  guardianVillageItems.value = []
  guardianLocationErrorMessage.value = ''
}

function clearGuardianLocationChildren(level = 'province') {
  if (level === 'province') {
    form.value.guardian_district = ''
    form.value.guardian_commune = ''
    form.value.guardian_village = ''
    guardianDistrictItems.value = []
    guardianCommuneItems.value = []
    guardianVillageItems.value = []
    guardianLocationErrorMessage.value = ''
    return
  }

  if (level === 'district') {
    form.value.guardian_commune = ''
    form.value.guardian_village = ''
    guardianCommuneItems.value = []
    guardianVillageItems.value = []
    guardianLocationErrorMessage.value = ''
    return
  }

  if (level === 'commune') {
    form.value.guardian_village = ''
    guardianVillageItems.value = []
    guardianLocationErrorMessage.value = ''
  }
}

async function loadGuardianDistrictOptionsForProvince(provinceValue) {
  const province = findLocationItem(provinceItems.value, provinceValue)
  if (!province) {
    guardianDistrictItems.value = []
    guardianCommuneItems.value = []
    guardianVillageItems.value = []
    return null
  }

  guardianLocationLoading.value = true
  try {
    guardianDistrictItems.value = await fetchDistricts(province.code)
    guardianLocationErrorMessage.value = ''
    return province
  } catch (error) {
    guardianDistrictItems.value = []
    guardianCommuneItems.value = []
    guardianVillageItems.value = []
    guardianLocationErrorMessage.value = error?.message || t('preschoolEnrollmentPage.messages.locationLoadFailed')
    return null
  } finally {
    guardianLocationLoading.value = false
  }
}

async function loadGuardianCommuneOptionsForDistrict(districtValue) {
  const district = findLocationItem(guardianDistrictItems.value, districtValue)
  if (!district) {
    guardianCommuneItems.value = []
    guardianVillageItems.value = []
    return null
  }

  guardianLocationLoading.value = true
  try {
    guardianCommuneItems.value = await fetchCommunes(district.code)
    guardianLocationErrorMessage.value = ''
    return district
  } catch (error) {
    guardianCommuneItems.value = []
    guardianVillageItems.value = []
    guardianLocationErrorMessage.value = error?.message || t('preschoolEnrollmentPage.messages.locationLoadFailed')
    return null
  } finally {
    guardianLocationLoading.value = false
  }
}

async function loadGuardianVillageOptionsForCommune(communeValue) {
  const commune = findLocationItem(guardianCommuneItems.value, communeValue)
  if (!commune) {
    guardianVillageItems.value = []
    return null
  }

  guardianLocationLoading.value = true
  try {
    guardianVillageItems.value = await fetchVillages(commune.code)
    guardianLocationErrorMessage.value = ''
    return commune
  } catch (error) {
    guardianVillageItems.value = []
    guardianLocationErrorMessage.value = error?.message || t('preschoolEnrollmentPage.messages.locationLoadFailed')
    return null
  } finally {
    guardianLocationLoading.value = false
  }
}

async function hydrateGuardianLocation() {
  const provinceValue = normalizeText(form.value.guardian_province)
  if (!provinceValue) return

  guardianLocationSyncing.value = true
  try {
    const province = await loadGuardianDistrictOptionsForProvince(provinceValue)
    if (province) {
      form.value.guardian_province = displayLocationName(province)
    }

    if (!form.value.guardian_province || !form.value.guardian_district) return

    const district = await loadGuardianCommuneOptionsForDistrict(form.value.guardian_district)
    if (district) {
      form.value.guardian_district = displayLocationName(district)
    }

    if (!form.value.guardian_district || !form.value.guardian_commune) return

    const commune = await loadGuardianVillageOptionsForCommune(form.value.guardian_commune)
    if (commune) {
      form.value.guardian_commune = displayLocationName(commune)
    }

    const village = findLocationItem(guardianVillageItems.value, form.value.guardian_village)
    if (village) {
      form.value.guardian_village = displayLocationName(village)
    }
  } finally {
    queueMicrotask(() => {
      guardianLocationSyncing.value = false
    })
  }
}

async function prepareForm() {
  isFormHydrating.value = true
  try {
    form.value = createEmptyForm(props.application)

    localFieldErrors.value = {}
    setTopValidationMessage('')
    provinceLoadErrorMessage.value = ''
    resetGuardianLocationOptions()
    birthLocation.setError('')
    residenceLocation.setError('')
    resetProvinceData()

    await loadProvinceOptions()
    await hydrateBirthLocation()
    await hydrateResidenceLocation()
    await hydrateGuardianLocation()
  } finally {
    queueMicrotask(() => {
      isFormHydrating.value = false
    })
  }
}

watch(
  () => props.application,
  async () => {
    await prepareForm()
  },
  { immediate: true },
)

watch(
  () => form.value.birth_province_id,
  async (value) => {
    if (isFormHydrating.value || birthLocation.syncing) return
    birthLocation.clearChildren('province')
    if (!value) return

    await birthLocation.loadDistrictOptionsForProvince(value)
  },
)

watch(
  () => form.value.birth_district_id,
  async (value) => {
    if (isFormHydrating.value || birthLocation.syncing) return
    birthLocation.clearChildren('district')
    if (!value) return

    await birthLocation.loadCommuneOptionsForDistrict(value)
  },
)

watch(
  () => form.value.birth_commune_id,
  async (value) => {
    if (isFormHydrating.value || birthLocation.syncing) return
    birthLocation.clearChildren('commune')
    if (!value) return

    await birthLocation.loadVillageOptionsForCommune(value)
  },
)

watch(
  () => form.value.residence_province_id,
  async (value) => {
    if (isFormHydrating.value || residenceLocation.syncing) return
    residenceLocation.clearChildren('province')
    if (!value) return

    await residenceLocation.loadDistrictOptionsForProvince(value)
  },
)

watch(
  () => form.value.residence_district_id,
  async (value) => {
    if (isFormHydrating.value || residenceLocation.syncing) return
    residenceLocation.clearChildren('district')
    if (!value) return

    await residenceLocation.loadCommuneOptionsForDistrict(value)
  },
)

watch(
  () => form.value.residence_commune_id,
  async (value) => {
    if (isFormHydrating.value || residenceLocation.syncing) return
    residenceLocation.clearChildren('commune')
    if (!value) return

    await residenceLocation.loadVillageOptionsForCommune(value)
  },
)

watch(
  () => form.value.guardian_province,
  async (value) => {
    if (isFormHydrating.value || guardianLocationSyncing.value) return
    clearGuardianLocationChildren('province')
    if (!value) return

    await loadGuardianDistrictOptionsForProvince(value)
  },
)

watch(
  () => form.value.guardian_relationship,
  (value, previousValue) => {
    if (normalizeText(previousValue) === 'other' && normalizeText(value) !== 'other') {
      form.value.guardian_relationship_detail = ''
    }
  },
)

watch(
  () => form.value.guardian_district,
  async (value) => {
    if (isFormHydrating.value || guardianLocationSyncing.value) return
    clearGuardianLocationChildren('district')
    if (!value) return

    await loadGuardianCommuneOptionsForDistrict(value)
  },
)

watch(
  () => form.value.guardian_commune,
  async (value) => {
    if (isFormHydrating.value || guardianLocationSyncing.value) return
    clearGuardianLocationChildren('commune')
    if (!value) return

    await loadGuardianVillageOptionsForCommune(value)
  },
)

function cancel() {
  emit('cancel')
}

function save() {
  if (!validateForm()) return

  emit('save', buildSubmitPayload())
}
</script>

<template>
  <form class="enr-app-form" @submit.prevent="save" novalidate>
    <div v-if="validationMessage" class="enr-app-state enr-app-state--error" role="alert" aria-live="polite">
      {{ validationMessage }}
    </div>

    <div v-if="provinceLoadErrorMessage" class="enr-app-state enr-app-state--error" role="alert" aria-live="polite">
      {{ provinceLoadErrorMessage }}
    </div>

    <section class="enr-app-card">
      <div class="enr-app-card__header">
        <div>
          <h3 class="enr-app-card__title">
            {{ t('preschoolEnrollmentPage.applicationDialog.sections.student') }}
          </h3>
          <p class="enr-app-card__subtitle">
            {{ t('preschoolEnrollmentPage.applicationDialog.sectionDescriptions.student') }}
          </p>
        </div>
      </div>

      <div class="enr-app-card__body">
        <div class="enr-app-group">
          <div class="enr-app-group__header">
            <h4 class="enr-app-group__title">{{ t('preschoolEnrollmentPage.applicationDialog.subsections.identity') }}</h4>
          </div>

          <div class="enr-app-grid enr-app-grid--identity">
            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.givenName') }}</span>
                <span class="enr-app-label__required" aria-hidden="true">*</span>
              </span>
              <input
                :id="fieldId('first-name')"
                v-model="form.first_name"
                type="text"
                class="enr-app-control"
                :class="{ 'enr-app-control--error': fieldError('first_name') }"
                :disabled="readonly"
                :placeholder="t('preschoolEnrollmentPage.applicationDialog.placeholders.givenName')"
                autocomplete="given-name"
                :aria-invalid="Boolean(fieldError('first_name'))"
              />
              <p v-if="fieldError('first_name')" class="enr-app-error">{{ fieldError('first_name') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.familyName') }}</span>
                <span class="enr-app-label__required" aria-hidden="true">*</span>
              </span>
              <input
                :id="fieldId('last-name')"
                v-model="form.last_name"
                type="text"
                class="enr-app-control"
                :class="{ 'enr-app-control--error': fieldError('last_name') }"
                :disabled="readonly"
                :placeholder="t('preschoolEnrollmentPage.applicationDialog.placeholders.familyName')"
                autocomplete="family-name"
                :aria-invalid="Boolean(fieldError('last_name'))"
              />
              <p v-if="fieldError('last_name')" class="enr-app-error">{{ fieldError('last_name') }}</p>
            </label>

            <label class="enr-app-field enr-app-field--full">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.latinName') }}</span>
              </span>
              <input
                :id="fieldId('latin-name')"
                v-model="form.latin_name"
                type="text"
                class="enr-app-control"
                :class="{ 'enr-app-control--error': fieldError('latin_name') }"
                :disabled="readonly"
                :placeholder="t('preschoolEnrollmentPage.applicationDialog.placeholders.latinName')"
                autocomplete="name"
                :aria-invalid="Boolean(fieldError('latin_name'))"
              />
              <p v-if="fieldError('latin_name')" class="enr-app-error">{{ fieldError('latin_name') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.gender') }}</span>
              </span>
              <select
                :id="fieldId('gender')"
                v-model="form.gender"
                class="enr-app-control enr-app-select"
                :class="{ 'enr-app-control--error': fieldError('gender') }"
                :disabled="readonly"
                :aria-invalid="Boolean(fieldError('gender'))"
              >
                <option value="">{{ t('preschoolEnrollmentPage.applicationDialog.placeholders.selectGender') }}</option>
                <option value="male">{{ t('preschoolEnrollmentPage.applicationDialog.genders.male') }}</option>
                <option value="female">{{ t('preschoolEnrollmentPage.applicationDialog.genders.female') }}</option>
                <option value="other">{{ t('preschoolEnrollmentPage.applicationDialog.genders.other') }}</option>
              </select>
              <p v-if="fieldError('gender')" class="enr-app-error">{{ fieldError('gender') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.dateOfBirth') }}</span>
              </span>
              <input
                :id="fieldId('date-of-birth')"
                v-model="form.date_of_birth"
                type="date"
                class="enr-app-control"
                :class="{ 'enr-app-control--error': fieldError('date_of_birth') }"
                :disabled="readonly"
                :aria-invalid="Boolean(fieldError('date_of_birth'))"
              />
              <p v-if="fieldError('date_of_birth')" class="enr-app-error">{{ fieldError('date_of_birth') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.nationality') }}</span>
              </span>
              <input
                :id="fieldId('nationality')"
                v-model="form.nationality"
                type="text"
                class="enr-app-control"
                :class="{ 'enr-app-control--error': fieldError('nationality') }"
                :disabled="readonly"
                :placeholder="t('preschoolEnrollmentPage.applicationDialog.placeholders.nationality')"
                :aria-invalid="Boolean(fieldError('nationality'))"
              />
              <p v-if="fieldError('nationality')" class="enr-app-error">{{ fieldError('nationality') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.ethnicity') }}</span>
              </span>
              <input
                :id="fieldId('ethnicity')"
                v-model="form.ethnicity"
                type="text"
                class="enr-app-control"
                :class="{ 'enr-app-control--error': fieldError('ethnicity') }"
                :disabled="readonly"
                :placeholder="t('preschoolEnrollmentPage.applicationDialog.placeholders.ethnicity')"
                :aria-invalid="Boolean(fieldError('ethnicity'))"
              />
              <p v-if="fieldError('ethnicity')" class="enr-app-error">{{ fieldError('ethnicity') }}</p>
            </label>
          </div>
        </div>

        <div class="enr-app-group">
          <div class="enr-app-group__header">
            <h4 class="enr-app-group__title">{{ t('preschoolEnrollmentPage.applicationDialog.subsections.birthLocation') }}</h4>
          </div>

          <div class="enr-app-grid enr-app-grid--location">
            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.province') }}</span>
              </span>
              <select
                :id="fieldId('birth-province')"
                v-model="form.birth_province_id"
                class="enr-app-control enr-app-select"
                :class="{ 'enr-app-control--error': fieldError('birth_province_id') }"
                :disabled="readonly || isProvinceOptionsLoading"
                :aria-busy="isProvinceOptionsLoading"
                :aria-invalid="Boolean(fieldError('birth_province_id'))"
              >
                <option value="">{{ isProvinceOptionsLoading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : provinceItems.length === 0 ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectProvince') }}</option>
                <option v-for="(opt, index) in birthProvinceOptions" :key="opt?.value || index" :value="opt?.value">{{ opt?.label }}</option>
              </select>
              <p v-if="fieldError('birth_province_id')" class="enr-app-error">{{ fieldError('birth_province_id') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.district') }}</span>
              </span>
              <select
                :id="fieldId('birth-district')"
                v-model="form.birth_district_id"
                class="enr-app-control enr-app-select"
                :class="{ 'enr-app-control--error': fieldError('birth_district_id') }"
                :disabled="readonly || !form.birth_province_id || birthLocation.loading"
                :aria-busy="birthLocation.loading"
                :aria-invalid="Boolean(fieldError('birth_district_id'))"
              >
                <option value="">{{ birthLocation.loading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : birthLocation.districtOptions.length === 0 && form.birth_province_id ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectDistrict') }}</option>
                <option v-for="(opt, index) in birthLocation.districtOptions" :key="opt?.value || index" :value="opt?.value">{{ opt?.label }}</option>
              </select>
              <p v-if="fieldError('birth_district_id')" class="enr-app-error">{{ fieldError('birth_district_id') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.commune') }}</span>
              </span>
              <select
                :id="fieldId('birth-commune')"
                v-model="form.birth_commune_id"
                class="enr-app-control enr-app-select"
                :class="{ 'enr-app-control--error': fieldError('birth_commune_id') }"
                :disabled="readonly || !form.birth_district_id || birthLocation.loading"
                :aria-busy="birthLocation.loading"
                :aria-invalid="Boolean(fieldError('birth_commune_id'))"
              >
                <option value="">{{ birthLocation.loading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : birthLocation.communeOptions.length === 0 && form.birth_district_id ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectCommune') }}</option>
                <option v-for="(opt, index) in birthLocation.communeOptions" :key="opt?.value || index" :value="opt?.value">{{ opt?.label }}</option>
              </select>
              <p v-if="fieldError('birth_commune_id')" class="enr-app-error">{{ fieldError('birth_commune_id') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.village') }}</span>
              </span>
              <select
                :id="fieldId('birth-village')"
                v-model="form.birth_village_id"
                class="enr-app-control enr-app-select"
                :class="{ 'enr-app-control--error': fieldError('birth_village_id') }"
                :disabled="readonly || !form.birth_commune_id || birthLocation.loading"
                :aria-busy="birthLocation.loading"
                :aria-invalid="Boolean(fieldError('birth_village_id'))"
              >
                <option value="">{{ birthLocation.loading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : birthLocation.villageOptions.length === 0 && form.birth_commune_id ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectVillage') }}</option>
                <option v-for="(opt, index) in birthLocation.villageOptions" :key="opt?.value || index" :value="opt?.value">{{ opt?.label }}</option>
              </select>
              <p v-if="fieldError('birth_village_id')" class="enr-app-error">{{ fieldError('birth_village_id') }}</p>
            </label>

            <div v-if="showBirthLegacyNote" class="enr-app-legacy enr-app-field enr-app-field--full">
              <span class="enr-app-label">{{ t('preschoolEnrollmentPage.applicationDialog.legacy.birthPlaceLabel') }}</span>
              <div class="enr-app-legacy__value">
                {{ t('preschoolEnrollmentPage.applicationDialog.legacy.birthPlaceValue', { value: legacyBirthPlace }) }}
              </div>
            </div>

            <div v-if="birthLocation.errorMessage" class="enr-app-state enr-app-state--error enr-app-field--full" role="alert" aria-live="polite">
              {{ birthLocation.errorMessage }}
            </div>
          </div>
        </div>

        <div class="enr-app-group">
          <div class="enr-app-group__header">
            <h4 class="enr-app-group__title">{{ t('preschoolEnrollmentPage.applicationDialog.subsections.currentResidence') }}</h4>
          </div>

          <div class="enr-app-grid enr-app-grid--location">
            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.province') }}</span>
              </span>
              <select
                :id="fieldId('residence-province')"
                v-model="form.residence_province_id"
                class="enr-app-control enr-app-select"
                :class="{ 'enr-app-control--error': fieldError('residence_province_id') }"
                :disabled="readonly || isProvinceOptionsLoading"
                :aria-busy="isProvinceOptionsLoading"
                :aria-invalid="Boolean(fieldError('residence_province_id'))"
              >
                <option value="">{{ isProvinceOptionsLoading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : provinceItems.length === 0 ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectProvince') }}</option>
                <option v-for="(opt, index) in residenceProvinceOptions" :key="opt?.value || index" :value="opt?.value">{{ opt?.label }}</option>
              </select>
              <p v-if="fieldError('residence_province_id')" class="enr-app-error">{{ fieldError('residence_province_id') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.district') }}</span>
              </span>
              <select
                :id="fieldId('residence-district')"
                v-model="form.residence_district_id"
                class="enr-app-control enr-app-select"
                :class="{ 'enr-app-control--error': fieldError('residence_district_id') }"
                :disabled="readonly || !form.residence_province_id || residenceLocation.loading"
                :aria-busy="residenceLocation.loading"
                :aria-invalid="Boolean(fieldError('residence_district_id'))"
              >
                <option value="">{{ residenceLocation.loading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : residenceLocation.districtOptions.length === 0 && form.residence_province_id ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectDistrict') }}</option>
                <option v-for="(opt, index) in residenceLocation.districtOptions" :key="opt?.value || index" :value="opt?.value">{{ opt?.label }}</option>
              </select>
              <p v-if="fieldError('residence_district_id')" class="enr-app-error">{{ fieldError('residence_district_id') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.commune') }}</span>
              </span>
              <select
                :id="fieldId('residence-commune')"
                v-model="form.residence_commune_id"
                class="enr-app-control enr-app-select"
                :class="{ 'enr-app-control--error': fieldError('residence_commune_id') }"
                :disabled="readonly || !form.residence_district_id || residenceLocation.loading"
                :aria-busy="residenceLocation.loading"
                :aria-invalid="Boolean(fieldError('residence_commune_id'))"
              >
                <option value="">{{ residenceLocation.loading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : residenceLocation.communeOptions.length === 0 && form.residence_district_id ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectCommune') }}</option>
                <option v-for="(opt, index) in residenceLocation.communeOptions" :key="opt?.value || index" :value="opt?.value">{{ opt?.label }}</option>
              </select>
              <p v-if="fieldError('residence_commune_id')" class="enr-app-error">{{ fieldError('residence_commune_id') }}</p>
            </label>

            <label class="enr-app-field">
              <span class="enr-app-label">
                <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.village') }}</span>
              </span>
              <select
                :id="fieldId('residence-village')"
                v-model="form.residence_village_id"
                class="enr-app-control enr-app-select"
                :class="{ 'enr-app-control--error': fieldError('residence_village_id') }"
                :disabled="readonly || !form.residence_commune_id || residenceLocation.loading"
                :aria-busy="residenceLocation.loading"
                :aria-invalid="Boolean(fieldError('residence_village_id'))"
              >
                <option value="">{{ residenceLocation.loading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : residenceLocation.villageOptions.length === 0 && form.residence_commune_id ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectVillage') }}</option>
                <option v-for="(opt, index) in residenceLocation.villageOptions" :key="opt?.value || index" :value="opt?.value">{{ opt?.label }}</option>
              </select>
              <p v-if="fieldError('residence_village_id')" class="enr-app-error">{{ fieldError('residence_village_id') }}</p>
            </label>

            <div v-if="showResidenceLegacyNote" class="enr-app-legacy enr-app-field enr-app-field--full">
              <span class="enr-app-label">{{ t('preschoolEnrollmentPage.applicationDialog.legacy.currentResidenceLabel') }}</span>
              <div class="enr-app-legacy__value">
                {{ t('preschoolEnrollmentPage.applicationDialog.legacy.currentResidenceValue', { value: legacyResidenceText }) }}
              </div>
            </div>

            <div v-if="residenceLocation.errorMessage" class="enr-app-state enr-app-state--error enr-app-field--full" role="alert" aria-live="polite">
              {{ residenceLocation.errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="enr-app-card">
      <div class="enr-app-card__header">
        <div>
          <h3 class="enr-app-card__title">
            {{ t('preschoolEnrollmentPage.applicationDialog.sections.enrollment') }}
          </h3>
        </div>
      </div>

      <div class="enr-app-card__body">
        <div class="enr-app-grid enr-app-grid--enrollment">
          <label class="enr-app-field">
            <span class="enr-app-label">{{ t('preschoolEnrollmentPage.applicationDialog.fields.requestedLevel') }}</span>
            <input
              :id="fieldId('requested-level')"
              v-model="form.requested_level"
              type="text"
              class="enr-app-control"
              :disabled="readonly"
            />
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">{{ t('preschoolEnrollmentPage.applicationDialog.fields.requestedAcademicYear') }}</span>
            <select
              :id="fieldId('requested-academic-year')"
              v-model="form.requested_academic_year_id"
              class="enr-app-control enr-app-select"
              :disabled="readonly"
            >
              <option value="">—</option>
              <option v-for="yr in academicYears" :key="yr.id" :value="String(yr.id)">{{ yr.label }}</option>
            </select>
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">{{ t('preschoolEnrollmentPage.applicationDialog.fields.requestedTerm') }}</span>
            <select
              :id="fieldId('requested-term')"
              v-model="form.requested_term_id"
              class="enr-app-control enr-app-select"
              :disabled="readonly"
            >
              <option value="">—</option>
              <option v-for="term in terms" :key="term.id" :value="String(term.id)">{{ term.name }}</option>
            </select>
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">{{ t('preschoolEnrollmentPage.applicationDialog.fields.preferredClass') }}</span>
            <select
              :id="fieldId('preferred-class')"
              v-model="form.preferred_class_id"
              class="enr-app-control enr-app-select"
              :disabled="readonly"
            >
              <option value="">—</option>
              <option v-for="cls in classes" :key="cls.id" :value="String(cls.id)">{{ cls.name }}</option>
            </select>
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">{{ t('preschoolEnrollmentPage.applicationDialog.fields.requestedStartDate') }}</span>
            <input
              :id="fieldId('requested-start-date')"
              v-model="form.requested_start_date"
              type="date"
              class="enr-app-control"
              :disabled="readonly"
            />
          </label>
        </div>
      </div>
    </section>

    <section class="enr-app-card">
      <div class="enr-app-card__header">
        <div>
          <h3 class="enr-app-card__title">
            {{ t('preschoolEnrollmentPage.applicationDialog.sections.guardian') }}
          </h3>
        </div>
      </div>

      <div class="enr-app-card__body">
        <div class="enr-app-grid enr-app-grid--guardian">
          <label class="enr-app-field enr-app-field--full">
            <span class="enr-app-label">
              <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.guardianName') }}</span>
              <span class="enr-app-label__required" aria-hidden="true">*</span>
            </span>
            <input
              :id="fieldId('guardian-name')"
              v-model="form.guardian_name"
              type="text"
              class="enr-app-control"
              :class="{ 'enr-app-control--error': fieldError('guardian_name') }"
              :disabled="readonly"
              :placeholder="t('preschoolEnrollmentPage.applicationDialog.placeholders.guardianName')"
              autocomplete="name"
              :aria-invalid="Boolean(fieldError('guardian_name'))"
            />
            <p v-if="fieldError('guardian_name')" class="enr-app-error">{{ fieldError('guardian_name') }}</p>
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">
              <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.guardianType') }}</span>
              <span class="enr-app-label__required" aria-hidden="true">*</span>
            </span>
            <select
              :id="fieldId('guardian-type')"
              v-model="form.guardian_relationship"
              class="enr-app-control enr-app-select"
              :class="{ 'enr-app-control--error': fieldError('guardian_relationship') }"
              :disabled="readonly"
              :aria-invalid="Boolean(fieldError('guardian_relationship'))"
            >
              <option value="">{{ t('preschoolEnrollmentPage.applicationDialog.placeholders.selectGuardianType') }}</option>
              <option v-for="(opt, index) in guardianTypeOptions" :key="opt?.value || index" :value="opt?.value">
                {{ opt?.label }}
              </option>
            </select>
            <p v-if="fieldError('guardian_relationship')" class="enr-app-error">{{ fieldError('guardian_relationship') }}</p>
          </label>

          <label v-if="isOtherGuardianType" class="enr-app-field">
            <span class="enr-app-label">
              <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.guardianTypeOther') }}</span>
              <span class="enr-app-label__required" aria-hidden="true">*</span>
            </span>
            <input
              :id="fieldId('guardian-type-other')"
              v-model="form.guardian_relationship_detail"
              type="text"
              class="enr-app-control"
              :class="{ 'enr-app-control--error': fieldError('guardian_relationship_detail') }"
              :disabled="readonly"
              :placeholder="t('preschoolEnrollmentPage.applicationDialog.placeholders.guardianTypeOther')"
              :aria-invalid="Boolean(fieldError('guardian_relationship_detail'))"
            />
            <p v-if="fieldError('guardian_relationship_detail')" class="enr-app-error">{{ fieldError('guardian_relationship_detail') }}</p>
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">
              <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.guardianPhone') }}</span>
              <span class="enr-app-label__required" aria-hidden="true">*</span>
            </span>
            <input
              :id="fieldId('guardian-phone')"
              v-model="form.guardian_phone"
              type="text"
              class="enr-app-control"
              :class="{ 'enr-app-control--error': fieldError('guardian_phone') }"
              :disabled="readonly"
              :placeholder="t('preschoolEnrollmentPage.applicationDialog.placeholders.guardianPhone')"
              inputmode="tel"
              autocomplete="tel"
              :aria-invalid="Boolean(fieldError('guardian_phone'))"
            />
            <p v-if="fieldError('guardian_phone')" class="enr-app-error">{{ fieldError('guardian_phone') }}</p>
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">{{ t('preschoolEnrollmentPage.applicationDialog.fields.guardianEmail') }}</span>
            <input
              :id="fieldId('guardian-email')"
              v-model="form.guardian_email"
              type="email"
              class="enr-app-control"
              :class="{ 'enr-app-control--error': fieldError('guardian_email') }"
              :disabled="readonly"
              :placeholder="t('preschoolEnrollmentPage.applicationDialog.placeholders.guardianEmail')"
              autocomplete="email"
              :aria-invalid="Boolean(fieldError('guardian_email'))"
            />
            <p v-if="fieldError('guardian_email')" class="enr-app-error">{{ fieldError('guardian_email') }}</p>
          </label>
        </div>
      </div>
    </section>

    <section class="enr-app-card">
      <div class="enr-app-card__header">
        <div>
          <h3 class="enr-app-card__title">
            {{ t('preschoolEnrollmentPage.applicationDialog.sections.guardianLocation') }}
          </h3>
        </div>
      </div>

      <div class="enr-app-card__body">
        <div class="enr-app-grid enr-app-grid--location">
          <label class="enr-app-field">
            <span class="enr-app-label">
              <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.province') }}</span>
              <span class="enr-app-label__required" aria-hidden="true">*</span>
            </span>
            <select
              :id="fieldId('guardian-province')"
              v-model="form.guardian_province"
              class="enr-app-control enr-app-select"
              :class="{ 'enr-app-control--error': fieldError('guardian_province') }"
              :disabled="readonly || isProvinceOptionsLoading"
              :aria-invalid="Boolean(fieldError('guardian_province'))"
            >
              <option value="">{{ isProvinceOptionsLoading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : provinceItems.length === 0 ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectProvince') }}</option>
              <option v-for="(opt, index) in guardianProvinceOptions" :key="opt?.value || index" :value="opt?.value">
                {{ opt?.label }}
              </option>
            </select>
            <p v-if="fieldError('guardian_province')" class="enr-app-error">{{ fieldError('guardian_province') }}</p>
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">
              <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.district') }}</span>
              <span class="enr-app-label__required" aria-hidden="true">*</span>
            </span>
            <select
              :id="fieldId('guardian-district')"
              v-model="form.guardian_district"
              class="enr-app-control enr-app-select"
              :class="{ 'enr-app-control--error': fieldError('guardian_district') }"
              :disabled="readonly || !form.guardian_province || guardianLocationLoading"
              :aria-busy="guardianLocationLoading"
              :aria-invalid="Boolean(fieldError('guardian_district'))"
            >
              <option value="">{{ guardianLocationLoading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : guardianDistrictOptions.length === 0 && form.guardian_province ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectDistrict') }}</option>
              <option v-for="(opt, index) in guardianDistrictOptions" :key="opt?.value || index" :value="opt?.value">
                {{ opt?.label }}
              </option>
            </select>
            <p v-if="fieldError('guardian_district')" class="enr-app-error">{{ fieldError('guardian_district') }}</p>
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">
              <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.commune') }}</span>
              <span class="enr-app-label__required" aria-hidden="true">*</span>
            </span>
            <select
              :id="fieldId('guardian-commune')"
              v-model="form.guardian_commune"
              class="enr-app-control enr-app-select"
              :class="{ 'enr-app-control--error': fieldError('guardian_commune') }"
              :disabled="readonly || !form.guardian_district || guardianLocationLoading"
              :aria-busy="guardianLocationLoading"
              :aria-invalid="Boolean(fieldError('guardian_commune'))"
            >
              <option value="">{{ guardianLocationLoading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : guardianCommuneOptions.length === 0 && form.guardian_district ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectCommune') }}</option>
              <option v-for="(opt, index) in guardianCommuneOptions" :key="opt?.value || index" :value="opt?.value">
                {{ opt?.label }}
              </option>
            </select>
            <p v-if="fieldError('guardian_commune')" class="enr-app-error">{{ fieldError('guardian_commune') }}</p>
          </label>

          <label class="enr-app-field">
            <span class="enr-app-label">
              <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.village') }}</span>
              <span class="enr-app-label__required" aria-hidden="true">*</span>
            </span>
            <select
              :id="fieldId('guardian-village')"
              v-model="form.guardian_village"
              class="enr-app-control enr-app-select"
              :class="{ 'enr-app-control--error': fieldError('guardian_village') }"
              :disabled="readonly || !form.guardian_commune || guardianLocationLoading"
              :aria-busy="guardianLocationLoading"
              :aria-invalid="Boolean(fieldError('guardian_village'))"
            >
              <option value="">{{ guardianLocationLoading ? t('preschoolEnrollmentPage.applicationDialog.placeholders.loadingLocations') : guardianVillageOptions.length === 0 && form.guardian_commune ? t('preschoolEnrollmentPage.applicationDialog.placeholders.noLocationOptions') : t('preschoolEnrollmentPage.applicationDialog.placeholders.selectVillage') }}</option>
              <option v-for="(opt, index) in guardianVillageOptions" :key="opt?.value || index" :value="opt?.value">
                {{ opt?.label }}
              </option>
            </select>
            <p v-if="fieldError('guardian_village')" class="enr-app-error">{{ fieldError('guardian_village') }}</p>
          </label>

          <div class="enr-app-address enr-app-field enr-app-field--full">
            <span class="enr-app-label">{{ t('preschoolEnrollmentPage.applicationDialog.fields.fullAddress') }}</span>
            <div class="enr-app-address__panel">
              <span class="enr-app-address__eyebrow">
                {{ t('preschoolEnrollmentPage.applicationDialog.fields.fullAddress') }}
              </span>
              <div class="enr-app-address__rows">
                <div class="enr-app-address__row">
                  <span class="enr-app-address__row-label">{{ t('preschoolEnrollmentPage.applicationDialog.addressLabels.village') }}:</span>
                  <span class="enr-app-address__row-value">{{ form.guardian_village || '-' }}</span>
                </div>
                <div class="enr-app-address__row">
                  <span class="enr-app-address__row-label">{{ t('preschoolEnrollmentPage.applicationDialog.addressLabels.communeWard') }}:</span>
                  <span class="enr-app-address__row-value">{{ form.guardian_commune || '-' }}</span>
                </div>
                <div class="enr-app-address__row">
                  <span class="enr-app-address__row-label">{{ t('preschoolEnrollmentPage.applicationDialog.addressLabels.districtKhan') }}:</span>
                  <span class="enr-app-address__row-value">{{ form.guardian_district || '-' }}</span>
                </div>
                <div class="enr-app-address__row">
                  <span class="enr-app-address__row-label">{{ t('preschoolEnrollmentPage.applicationDialog.addressLabels.provinceCapital') }}:</span>
                  <span class="enr-app-address__row-value">{{ form.guardian_province || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="guardianLocationErrorMessage" class="enr-app-state enr-app-state--error enr-app-field--full" role="alert" aria-live="polite">
            {{ guardianLocationErrorMessage }}
          </div>
        </div>
      </div>
    </section>

    <section class="enr-app-card">
      <div class="enr-app-card__header">
        <div>
          <h3 class="enr-app-card__title">
            {{ t('preschoolEnrollmentPage.applicationDialog.sections.authorization') }}
          </h3>
        </div>
      </div>

      <div class="enr-app-card__body">
        <div class="enr-app-grid enr-app-grid--authorization">
          <label class="enr-app-check">
            <input v-model="form.guardian_can_pickup" type="checkbox" :disabled="readonly" />
            <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.guardianCanPickup') }}</span>
          </label>
          <label class="enr-app-check">
            <input v-model="form.guardian_is_emergency" type="checkbox" :disabled="readonly" />
            <span>{{ t('preschoolEnrollmentPage.applicationDialog.fields.guardianIsEmergency') }}</span>
          </label>
        </div>
      </div>
    </section>

    <div class="enr-app-form__footer">
      <div class="enr-app-form__actions">
        <button type="button" class="enr-app-btn enr-app-btn--cancel" @click="cancel">
          {{ cancelLabel || t('preschoolEnrollmentPage.actions.close') }}
        </button>
          <button
            v-if="!readonly"
            type="submit"
            class="enr-app-btn enr-app-btn--save"
          :disabled="loading || isProvinceOptionsLoading || birthLocation.loading || residenceLocation.loading || guardianLocationLoading"
          >
          <i v-if="loading" class="pi pi-spin pi-spinner" aria-hidden="true" />
          {{ saveLabel || t('preschoolEnrollmentPage.actions.save') }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.enr-app-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.enr-app-state {
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  color: #0f172a;
  font-weight: 600;
}

.enr-app-state--error {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff 0%, #fff7f7 100%);
  color: #b91c1c;
}

.enr-app-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 20px 48px -34px rgba(15, 23, 42, 0.28);
}

.enr-app-card__header {
  padding: 1rem 1.1rem 0.9rem;
  border-bottom: 1px solid #edf2f7;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.88) 100%);
}

.enr-app-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.enr-app-card__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.5;
}

.enr-app-card__body {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.enr-app-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.enr-app-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.15rem;
}

.enr-app-group__title {
  margin: 0;
  color: #1e293b;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.enr-app-grid {
  display: grid;
  gap: 0.95rem;
}

.enr-app-grid--identity {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.enr-app-grid--location,
.enr-app-grid--enrollment,
.enr-app-grid--guardian,
.enr-app-grid--authorization {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.enr-app-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.enr-app-field--full {
  grid-column: 1 / -1;
}

.enr-app-label {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.35rem;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.35;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}

.enr-app-label__required {
  color: #dc2626;
}

.enr-app-control {
  width: 100%;
  min-height: 3rem;
  padding: 0.78rem 0.95rem;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.45;
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.enr-app-control:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.enr-app-control--error {
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px rgba(252, 165, 165, 0.1);
}

.enr-app-select {
  padding-right: 2.35rem;
}

.enr-app-control:disabled {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

.enr-app-error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.35;
}

.enr-app-legacy {
  min-width: 0;
}

.enr-app-legacy__value {
  display: flex;
  align-items: center;
  min-height: 3rem;
  padding: 0.75rem 0.9rem;
  border: 1px dashed #c4b5fd;
  border-radius: 1rem;
  background: #faf5ff;
  color: #6d28d9;
  font-size: 0.92rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.enr-app-address {
  min-width: 0;
}

.enr-app-address__panel {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.95rem 1rem;
  border: 1px dashed #c4b5fd;
  border-radius: 1rem;
  background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%);
}

.enr-app-address__eyebrow {
  color: #6d28d9;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.enr-app-address__rows {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.enr-app-address__row {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.enr-app-address__row-label {
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 700;
}

.enr-app-address__row-value {
  color: #0f172a;
  font-size: 0.94rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.enr-app-check {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 3rem;
  padding: 0.75rem 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
  color: #334155;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.enr-app-check input {
  width: 1rem;
  height: 1rem;
  margin: 0;
}

.enr-app-form__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 0.1rem;
}

.enr-app-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  width: 100%;
}

.enr-app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 3rem;
  padding: 0.72rem 1.2rem;
  border-radius: 0.95rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.enr-app-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.enr-app-btn--cancel {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.enr-app-btn--cancel:hover:not(:disabled) {
  background: #f1f5f9;
}

.enr-app-btn--save {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  box-shadow: 0 20px 32px -22px rgba(79, 70, 229, 0.75);
}

.enr-app-btn--save:hover:not(:disabled) {
  transform: translateY(-1px);
}

@media (max-width: 1100px) {
  .enr-app-grid--identity {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .enr-app-grid--identity,
  .enr-app-grid--location,
  .enr-app-grid--enrollment,
  .enr-app-grid--guardian,
  .enr-app-grid--authorization {
    grid-template-columns: 1fr;
  }

  .enr-app-form__actions {
    flex-direction: column;
  }

  .enr-app-btn {
    width: 100%;
  }
}
</style>
