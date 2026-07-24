<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import MultiSelect from 'primevue/multiselect'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolClasses,
  fetchPreschoolStudent,
  createPreschoolStudent,
  updatePreschoolStudent,
} from '@/modules/preschool/services/preschoolApi'
import {
  DEFAULT_FORM,
  AVATAR_ACCEPT_TYPE,
} from './constants/studentFormConstants'
import {
  buildStudentTypeOptions,
  buildGuardianTypeOptions,
  buildGenderOptions,
  buildStatusOptions,
  buildClassOptions,
  clearAvatarPreview as performClearAvatarPreview,
  createResetForm,
  loadStudentIntoForm,
  getStudentDisplayName,
  normalizeStudentPayload as performNormalizeStudentPayload,
  buildSuccessQuery,
} from './utils/studentFormHelpers'
import {
  getLocationDisplayName,
  fetchProvinces,
  fetchDistricts,
  fetchCommunes,
  fetchVillages,
} from '@/modules/preschool/services/cambodiaLocationService'

defineOptions({
  name: 'PreschoolAdminStudentFormPage',
})

const { t } = useLanguage()
const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const currentLocale = computed(() => (String(locale.value || 'en').toLowerCase().startsWith('kh') ? 'kh' : 'en'))

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const locationErrorMessage = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const classOptions = ref([])
const provinceItems = ref([])
const avatarFileInput = ref(null)
const avatarPreview = ref('')
const loadedStudent = ref(null)

const form = reactive({ ...DEFAULT_FORM })

const mode = computed(() => (route.name === 'dashboard-preschool-admin-students-edit' ? 'edit' : 'create'))
const isEditMode = computed(() => mode.value === 'edit')
const currentStudentId = computed(() => String(route.params.id || '').trim())
const pageTitle = computed(() =>
  isEditMode.value
    ? t('preschoolStudentInfoPage.dialog.editTitle')
    : t('preschoolStudentInfoPage.dialog.createTitle'),
)
const pageSubtitle = computed(() => t('preschoolStudentInfoPage.subtitle'))
const studentCodeDisplay = computed(() =>
  isEditMode.value && (loadedStudent.value?.publicId || form.student_code)
    ? loadedStudent.value?.publicId || form.student_code
    : t('preschoolStudentInfoPage.dialog.studentSignatureAuto'),
)
const studentTypeOptions = computed(() => buildStudentTypeOptions(t))
const guardianTypeOptions = computed(() => buildGuardianTypeOptions(t))
const genderOptions = computed(() => buildGenderOptions(t))
const statusOptions = computed(() => buildStatusOptions(t))

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeIdValue(value) {
  const text = normalizeText(value)
  if (!text) return ''

  const numeric = Number(text)
  return Number.isFinite(numeric) ? String(numeric) : text
}

function displayLocationName(item = {}) {
  return getLocationDisplayName(item, currentLocale.value)
}

function buildLocationOptions(items = []) {
  return items
    .filter(Boolean)
    .map((item) => ({
      label: displayLocationName(item),
      value: String(item.id ?? item.code ?? item.nameKh ?? item.nameEn ?? ''),
    }))
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

const guardianContactProvided = computed(() =>
  Boolean(form.guardian_name.trim() || form.guardian_phone.trim()),
)
const guardianTypeRequired = computed(() => guardianContactProvided.value)

const avatarSrc = computed(() => avatarPreview.value)

async function loadProvinceOptions() {
  try {
    provinceItems.value = await fetchProvinces()
    locationErrorMessage.value = ''
  } catch (error) {
    provinceItems.value = []
    locationErrorMessage.value = error?.message || t('preschoolStudentInfoPage.messages.locationLoadFailed')
  }
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
      form[keys.district] = ''
      form[keys.commune] = ''
      form[keys.village] = ''
      state.districtItems = []
      state.communeItems = []
      state.villageItems = []
      setError('')
      return
    }

    if (level === 'district') {
      form[keys.commune] = ''
      form[keys.village] = ''
      state.communeItems = []
      state.villageItems = []
      setError('')
      return
    }

    if (level === 'commune') {
      form[keys.village] = ''
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
      setError(error?.message || t('preschoolStudentInfoPage.messages.locationLoadFailed'))
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
      setError(error?.message || t('preschoolStudentInfoPage.messages.locationLoadFailed'))
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
      setError(error?.message || t('preschoolStudentInfoPage.messages.locationLoadFailed'))
      return null
    } finally {
      if (requestId === requestSequence) {
        state.loading = false
      }
    }
  }

  async function hydrate() {
    const provinceValue = normalizeText(form[keys.province])
    if (!provinceValue) return

    state.syncing = true
    try {
      const province = await loadDistrictOptionsForProvince(provinceValue)
      if (province) {
        form[keys.province] = normalizeIdValue(province.id || province.code || provinceValue)
      }

      if (!form[keys.province] || !form[keys.district]) return

      const district = await loadCommuneOptionsForDistrict(form[keys.district])
      if (district) {
        form[keys.district] = normalizeIdValue(district.id || district.code || form[keys.district])
      }

      if (!form[keys.district] || !form[keys.commune]) return

      const commune = await loadVillageOptionsForCommune(form[keys.commune])
      if (commune) {
        form[keys.commune] = normalizeIdValue(commune.id || commune.code || form[keys.commune])
      }

      const village = findLocationItem(state.villageItems, form[keys.village])
      if (village) {
        form[keys.village] = normalizeIdValue(village.id || village.code || form[keys.village])
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
  })
}

const birthLocation = createStructuredLocationState('birth')
const residenceLocation = createStructuredLocationState('residence')
const birthProvinceOptions = computed(() => buildLocationOptions(provinceItems.value))
const residenceProvinceOptions = computed(() => buildLocationOptions(provinceItems.value))

watch(
  () => form.birth_province_id,
  async (value) => {
    if (birthLocation.syncing) return
    birthLocation.clearChildren('province')
    if (!value) return

    await birthLocation.loadDistrictOptionsForProvince(value)
  },
)

watch(
  () => form.birth_district_id,
  async (value) => {
    if (birthLocation.syncing) return
    birthLocation.clearChildren('district')
    if (!value) return

    await birthLocation.loadCommuneOptionsForDistrict(value)
  },
)

watch(
  () => form.birth_commune_id,
  async (value) => {
    if (birthLocation.syncing) return
    birthLocation.clearChildren('commune')
    if (!value) return

    await birthLocation.loadVillageOptionsForCommune(value)
  },
)

watch(
  () => form.residence_province_id,
  async (value) => {
    if (residenceLocation.syncing) return
    residenceLocation.clearChildren('province')
    if (!value) return

    await residenceLocation.loadDistrictOptionsForProvince(value)
  },
)

watch(
  () => form.residence_district_id,
  async (value) => {
    if (residenceLocation.syncing) return
    residenceLocation.clearChildren('district')
    if (!value) return

    await residenceLocation.loadCommuneOptionsForDistrict(value)
  },
)

watch(
  () => form.residence_commune_id,
  async (value) => {
    if (residenceLocation.syncing) return
    residenceLocation.clearChildren('commune')
    if (!value) return

    await residenceLocation.loadVillageOptionsForCommune(value)
  },
)

function clearAvatarPreview() {
  performClearAvatarPreview(avatarPreview.value)
  avatarPreview.value = ''
}

function resetForm() {
  const resetData = createResetForm(DEFAULT_FORM)
  Object.assign(form, resetData)
  clearAvatarPreview()
  if (avatarFileInput.value) avatarFileInput.value.value = ''
  loadedStudent.value = null
  provinceItems.value = []
  locationErrorMessage.value = ''
  birthLocation.clearChildren('province')
  residenceLocation.clearChildren('province')
}

async function loadClasses() {
  try {
    const response = await fetchPreschoolClasses({ perPage: 100 })
    classOptions.value = buildClassOptions(response.items)
  } catch {
    classOptions.value = []
  }
}

async function loadStudent() {
  const studentId = currentStudentId.value
  if (!studentId) {
    errorMessage.value = t('preschoolStudentInfoPage.messages.loadFailed')
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const student = await fetchPreschoolStudent(studentId)
    if (!student) {
      errorMessage.value = t('preschoolStudentInfoPage.messages.loadFailed')
      return
    }

    loadedStudent.value = student
    birthLocation.syncing = true
    residenceLocation.syncing = true
    loadStudentIntoForm(student, form)
    clearAvatarPreview()
    avatarPreview.value = student.avatarUrl ? String(student.avatarUrl) : ''
    await Promise.allSettled([
      birthLocation.hydrate(),
      residenceLocation.hydrate(),
    ])
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolStudentInfoPage.messages.loadFailed')
  } finally {
    birthLocation.syncing = false
    residenceLocation.syncing = false
    loading.value = false
  }
}

function onAvatarClick() {
  avatarFileInput.value?.click()
}

function onAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  clearAvatarPreview()
  avatarPreview.value = URL.createObjectURL(file)
  form.avatar = file
  form.remove_avatar = false
}

function onAvatarRemove() {
  clearAvatarPreview()
  form.avatar = null
  form.remove_avatar = true
  if (avatarFileInput.value) avatarFileInput.value.value = ''
}

function normalizeStudentPayload() {
  return performNormalizeStudentPayload(form, isEditMode.value)
}

function validateForm() {
  if (guardianTypeRequired.value && !form.guardian_type) {
    return t('preschoolStudentInfoPage.validation.guardianTypeRequired')
  }

  return ''
}

async function onSubmit() {
  errorMessage.value = ''

  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  saving.value = true

  try {
    const payload = normalizeStudentPayload()
    if (isEditMode.value) {
      await updatePreschoolStudent(currentStudentId.value, payload)
      successMessage.value = t('preschoolStudentInfoPage.messages.updateSuccess')
    } else {
      await createPreschoolStudent(payload)
      successMessage.value = t('preschoolStudentInfoPage.messages.createSuccess')
    }
    showSuccess.value = true
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolStudentInfoPage.messages.saveFailed')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push({ name: 'dashboard-preschool-admin-students' })
}

function onSuccessClose() {
  showSuccess.value = false
  router.push({
    name: 'dashboard-preschool-admin-students',
    query: buildSuccessQuery(isEditMode.value),
  })
}

function onCancel() {
  if (saving.value) return
  goBack()
}

async function initializePage() {
  resetForm()
  await Promise.allSettled([
    loadClasses(),
    loadProvinceOptions(),
  ])

  if (isEditMode.value) {
    await loadStudent()
  }
}

watch(
  () => [route.name, route.params.id],
  async () => {
    await initializePage()
  },
)

onMounted(async () => {
  await initializePage()
})

onUnmounted(clearAvatarPreview)
</script>

<template>
  <MainLayout>
    <section class="student-form-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div class="student-form-page__shell">
        <div class="student-form-page__toolbar">
          <div>
            <p class="student-form-page__eyebrow">
              {{ isEditMode ? t('preschoolStudentInfoPage.dialog.editTitle') : t('preschoolStudentInfoPage.dialog.createTitle') }}
            </p>
            <p class="student-form-page__lead">
              {{ t('preschoolStudentInfoPage.formDescription') }}
            </p>
          </div>

          <Button type="button" variant="ghost" rounded="xl" @click="goBack">
            {{ t('preschoolStudentProfilePage.actions.back') }}
          </Button>
        </div>

        <div v-if="loading" class="student-form-page__state">
          {{ t('common.states.loading') }}
        </div>

        <div v-else class="student-form-page__body">
          <div v-if="errorMessage" class="student-form-page__state student-form-page__state--error">
            {{ errorMessage }}
          </div>

          <div v-if="locationErrorMessage" class="student-form-page__state student-form-page__state--error">
            {{ locationErrorMessage }}
          </div>

          <form class="student-form-page__form" @submit.prevent="onSubmit">
            <div class="student-form-page__hero">
              <div class="student-form-page__avatar-wrap">
                <button
                  type="button"
                  class="student-form-page__avatar"
                  :class="{ 'student-form-page__avatar--empty': !avatarSrc }"
                  @click="onAvatarClick"
                >
                  <img v-if="avatarSrc" :src="avatarSrc" alt="Student avatar" class="student-form-page__avatar-img" />
                  <span v-else class="student-form-page__avatar-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21a8 8 0 0 0-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                </button>
                <input ref="avatarFileInput" class="student-form-page__file-input" type="file" :accept="AVATAR_ACCEPT_TYPE" @change="onAvatarChange" />
              </div>

              <div class="student-form-page__hero-content">
                <div class="student-form-page__hero-row">
                  <div>
                    <p class="student-form-page__hero-eyebrow">
                      {{ isEditMode ? t('preschoolStudentInfoPage.dialog.editTitle') : t('preschoolStudentInfoPage.dialog.createTitle') }}
                    </p>
                    <h2 class="student-form-page__hero-title">
                      {{ getStudentDisplayName(form.first_name, form.last_name) }}
                    </h2>
                    <p class="student-form-page__hero-subtitle">
                      {{ studentCodeDisplay }}
                    </p>
                  </div>

                  <span class="student-form-page__hero-status">
                    {{ t(`preschoolStudentInfoPage.options.${form.status}`) || form.status }}
                  </span>
                </div>

                <div class="student-form-page__hero-actions">
                  <button
                    v-if="avatarPreview || form.avatar"
                    type="button"
                    class="student-form-page__avatar-remove"
                    @click="onAvatarRemove"
                  >
                    {{ t('preschoolStudentInfoPage.dialog.removeAvatar') }}
                  </button>
                </div>
              </div>
            </div>

            <div class="student-form-page__grid">
              <section class="student-form-page__panel">
                <p class="student-form-page__panel-title">{{ t('preschoolStudentInfoPage.dialog.sectionPersonal') }}</p>
                <div class="student-form-page__fields">
                  <div class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.studentSignature') }}</span>
                    <div class="student-form-page__readonly">
                      {{ studentCodeDisplay }}
                    </div>
                  </div>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.studentType') }}</span>
                    <select v-model="form.student_type" class="student-form-page__input">
                      <option v-for="opt in studentTypeOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.status') }}</span>
                    <select v-model="form.status" class="student-form-page__input">
                      <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.firstName') }}</span>
                    <input v-model="form.first_name" class="student-form-page__input" type="text" :placeholder="t('preschoolStudentInfoPage.dialog.firstName')" />
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.lastName') }}</span>
                    <input v-model="form.last_name" class="student-form-page__input" type="text" :placeholder="t('preschoolStudentInfoPage.dialog.lastName')" />
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.latinName') }}</span>
                    <input v-model="form.latin_name" class="student-form-page__input" type="text" :placeholder="t('preschoolStudentInfoPage.dialog.latinName')" />
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.gender') }}</span>
                    <select v-model="form.gender" class="student-form-page__input">
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.gender') }}</option>
                      <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.dateOfBirth') }}</span>
                    <input v-model="form.date_of_birth" class="student-form-page__input" type="date" />
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.nationality') }}</span>
                    <input v-model="form.nationality" class="student-form-page__input" type="text" :placeholder="t('preschoolStudentInfoPage.dialog.nationality')" />
                  </label>

                  <label class="student-form-page__field student-form-page__field--full">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.ethnicity') }}</span>
                    <input v-model="form.ethnicity" class="student-form-page__input" type="text" :placeholder="t('preschoolStudentInfoPage.dialog.ethnicity')" />
                  </label>
                </div>
              </section>

              <section class="student-form-page__panel">
                <p class="student-form-page__panel-title">{{ t('preschoolStudentInfoPage.dialog.birthLocation') }}</p>
                <div v-if="birthLocation.errorMessage" class="student-form-page__state student-form-page__state--error">
                  {{ birthLocation.errorMessage }}
                </div>
                <div class="student-form-page__fields">
                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.province') }}</span>
                    <select v-model="form.birth_province_id" class="student-form-page__input">
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.selectProvince') }}</option>
                      <option v-for="opt in birthProvinceOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.district') }}</span>
                    <select v-model="form.birth_district_id" class="student-form-page__input" :disabled="!form.birth_province_id || birthLocation.loading">
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.selectDistrict') }}</option>
                      <option v-for="opt in birthLocation.districtOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.commune') }}</span>
                    <select v-model="form.birth_commune_id" class="student-form-page__input" :disabled="!form.birth_district_id || birthLocation.loading">
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.selectCommune') }}</option>
                      <option v-for="opt in birthLocation.communeOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.village') }}</span>
                    <select v-model="form.birth_village_id" class="student-form-page__input" :disabled="!form.birth_commune_id || birthLocation.loading">
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.selectVillage') }}</option>
                      <option v-for="opt in birthLocation.villageOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>
                </div>
              </section>

              <section class="student-form-page__panel">
                <p class="student-form-page__panel-title">{{ t('preschoolStudentInfoPage.dialog.currentResidence') }}</p>
                <div v-if="residenceLocation.errorMessage" class="student-form-page__state student-form-page__state--error">
                  {{ residenceLocation.errorMessage }}
                </div>
                <div class="student-form-page__fields">
                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.province') }}</span>
                    <select v-model="form.residence_province_id" class="student-form-page__input">
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.selectProvince') }}</option>
                      <option v-for="opt in residenceProvinceOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.district') }}</span>
                    <select v-model="form.residence_district_id" class="student-form-page__input" :disabled="!form.residence_province_id || residenceLocation.loading">
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.selectDistrict') }}</option>
                      <option v-for="opt in residenceLocation.districtOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.commune') }}</span>
                    <select v-model="form.residence_commune_id" class="student-form-page__input" :disabled="!form.residence_district_id || residenceLocation.loading">
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.selectCommune') }}</option>
                      <option v-for="opt in residenceLocation.communeOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.village') }}</span>
                    <select v-model="form.residence_village_id" class="student-form-page__input" :disabled="!form.residence_commune_id || residenceLocation.loading">
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.selectVillage') }}</option>
                      <option v-for="opt in residenceLocation.villageOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>
                </div>
              </section>

              <section class="student-form-page__panel">
                <p class="student-form-page__panel-title">{{ t('preschoolStudentInfoPage.dialog.sectionGuardian') }}</p>
                <div class="student-form-page__fields">
                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.guardianName') }}</span>
                    <input v-model="form.guardian_name" class="student-form-page__input" type="text" :placeholder="t('preschoolStudentInfoPage.dialog.guardianName')" />
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.guardianPhone') }}</span>
                    <input v-model="form.guardian_phone" class="student-form-page__input" type="text" :placeholder="t('preschoolStudentInfoPage.dialog.guardianPhone')" />
                  </label>

                  <label class="student-form-page__field">
                    <span class="student-form-page__label">
                      {{ t('preschoolStudentInfoPage.dialog.guardianType') }}
                    </span>
                    <select
                      v-model="form.guardian_type"
                      class="student-form-page__input"
                      :required="guardianTypeRequired"
                    >
                      <option value="">{{ t('preschoolStudentInfoPage.dialog.guardianType') }}</option>
                      <option v-for="opt in guardianTypeOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </label>
                </div>
              </section>

              <section class="student-form-page__panel student-form-page__panel--full">
                <p class="student-form-page__panel-title">{{ t('preschoolStudentInfoPage.dialog.sectionEnrollment') }}</p>
                <div class="student-form-page__fields student-form-page__fields--enrollment">
                  <label class="student-form-page__field student-form-page__field--full">
                    <span class="student-form-page__label">{{ t('preschoolStudentInfoPage.dialog.assignClasses') }}</span>
                    <MultiSelect
                      v-model="form.class_ids"
                      :options="classOptions"
                      option-label="label"
                      option-value="value"
                      display="chip"
                      filter
                      class="student-form-page__multiselect"
                      :placeholder="t('preschoolStudentInfoPage.dialog.assignClasses')"
                    />
                  </label>
                </div>
              </section>
            </div>

            <div class="student-form-page__actions">
              <Button type="button" variant="ghost" rounded="xl" @click="onCancel">
                {{ t('preschoolStudentInfoPage.dialog.cancel') }}
              </Button>
              <Button type="submit" variant="primary" rounded="xl" :loading="saving" :disabled="saving">
                {{ t('preschoolStudentInfoPage.dialog.save') }}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <AlertSuccess
      :show="showSuccess"
      :title="t('preschoolStudentInfoPage.alerts.successTitle')"
      :message="successMessage"
      :button-text="t('preschoolStudentInfoPage.alerts.close')"
      @close="onSuccessClose"
    />
  </MainLayout>
</template>

<style scoped>
.student-form-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.student-form-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #dce6f2;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.99) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.student-form-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.student-form-page__eyebrow {
  margin: 0;
  color: #7c3aed;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.student-form-page__lead {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.6;
}

.student-form-page__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.student-form-page__state {
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  color: #0f172a;
  font-weight: 600;
}

.student-form-page__state--error {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff 0%, #fff7f7 100%);
  color: #b91c1c;
}

.student-form-page__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.student-form-page__hero {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.15rem;
  border-radius: 1.25rem;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.student-form-page__avatar-wrap {
  flex-shrink: 0;
}

.student-form-page__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  padding: 0;
  border: 0;
  border-radius: 9999px;
  overflow: hidden;
  background: linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%);
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 4.5px #ede9fe,
    0 12px 24px -14px rgba(124, 58, 237, 0.55);
  cursor: pointer;
}

.student-form-page__avatar--empty {
  outline: 2.5px dashed #c4b5fd;
  outline-offset: 3px;
}

.student-form-page__avatar-img,
.student-form-page__avatar-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-form-page__avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.92);
}

.student-form-page__avatar-placeholder svg {
  width: 2rem;
  height: 2rem;
}

.student-form-page__file-input {
  display: none;
}

.student-form-page__hero-content {
  flex: 1;
  min-width: 0;
}

.student-form-page__hero-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.student-form-page__hero-eyebrow {
  margin: 0;
  color: #7c3aed;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.student-form-page__hero-title {
  margin: 0.2rem 0 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.25;
}

.student-form-page__hero-subtitle {
  margin: 0.28rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.student-form-page__hero-status {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  background: #ecfeff;
  color: #0f766e;
  border: 1px solid #a5f3fc;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: capitalize;
}

.student-form-page__hero-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.65rem;
}

.student-form-page__avatar-remove {
  border: 0;
  background: transparent;
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.student-form-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.student-form-page__panel {
  padding: 1.15rem 1.2rem;
  border-radius: 1.2rem;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.student-form-page__panel--full {
  grid-column: 1 / -1;
}

.student-form-page__panel-title {
  margin: 0 0 0.9rem;
  color: #7c3aed;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.student-form-page__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem 0.95rem;
}

.student-form-page__fields--enrollment {
  grid-template-columns: 1fr;
}

.student-form-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.32rem;
}

.student-form-page__field--full {
  grid-column: 1 / -1;
}

.student-form-page__label {
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.student-form-page__readonly {
  display: flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.7rem 0.85rem;
  border: 1px dashed #c4b5fd;
  border-radius: 0.9rem;
  background: #faf5ff;
  color: #6d28d9;
  font-size: 0.92rem;
  font-weight: 700;
}

.student-form-page__readonly--address {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.student-form-page__readonly-label {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.student-form-page__readonly-value {
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 700;
}

.student-form-page__input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.9rem;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.92rem;
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.student-form-page__input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.student-form-page__textarea {
  min-height: 7rem;
  resize: vertical;
}

.student-form-page__multiselect {
  width: 100%;
}

.student-form-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .student-form-page__toolbar,
  .student-form-page__hero,
  .student-form-page__hero-row {
    flex-direction: column;
  }

  .student-form-page__grid,
  .student-form-page__fields {
    grid-template-columns: 1fr;
  }
}
</style>
