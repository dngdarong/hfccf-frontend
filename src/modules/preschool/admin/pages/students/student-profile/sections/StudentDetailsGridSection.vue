<script setup>
import { useI18n } from 'vue-i18n'
import { formatDate } from '@/utils/date'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'StudentDetailsGridSection',
})

defineProps({
  student: {
    type: Object,
    default: null,
  },
  statusLabel: {
    type: String,
    default: '',
  },
  birthLocationDisplay: {
    type: String,
    default: '',
  },
  currentResidenceDisplay: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()
const { locale } = useI18n()

function resolveLocationLabel(location) {
  const localeKey = String(locale.value || 'en').toLowerCase().startsWith('kh') ? 'kh' : 'en'

  if (localeKey === 'en') {
    return location?.nameEn
      || location?.name_en
      || location?.nameKh
      || location?.name_kh
      || location?.code
      || '-'
  }

  return location?.nameKh
    || location?.name_kh
    || location?.nameEn
    || location?.name_en
    || location?.code
    || '-'
}

function resolveValue(value) {
  return String(value ?? '').trim() || '-'
}
</script>

<template>
  <div class="student-profile-page__content-grid">
    <section class="student-profile-page__panel">
      <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.sections.personal') }}</h3>
      <dl class="student-profile-page__details">
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.signature') }}</dt>
          <dd>{{ student?.publicId || student?.studentCode || '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.latinName') }}</dt>
          <dd>{{ student?.latinName || student?.latin_name || '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.gender') }}</dt>
          <dd>{{ student?.gender ? t(`preschoolStudentInfoPage.options.${student.gender}`) : '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.dateOfBirth') }}</dt>
          <dd>{{ formatDate(student?.dateOfBirth) || student?.dateOfBirth || '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.studentType') }}</dt>
          <dd>{{ student?.studentType ? t(`preschoolStudentInfoPage.options.${student.studentType}`) : '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.nationality') }}</dt>
          <dd>{{ student?.nationality || '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.ethnicity') }}</dt>
          <dd>{{ student?.ethnicity || '-' }}</dd>
        </div>
      </dl>
    </section>

    <section class="student-profile-page__panel">
      <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.sections.birthLocation') }}</h3>
      <dl class="student-profile-page__details student-profile-page__details--location">
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.birthLocation') }}</dt>
          <dd>{{ birthLocationDisplay || '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.province') }}</dt>
          <dd>{{ resolveLocationLabel(student?.birthProvince || student?.birth_province) }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.district') }}</dt>
          <dd>{{ resolveLocationLabel(student?.birthDistrict || student?.birth_district) }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.commune') }}</dt>
          <dd>{{ resolveLocationLabel(student?.birthCommune || student?.birth_commune) }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.village') }}</dt>
          <dd>{{ resolveLocationLabel(student?.birthVillage || student?.birth_village) }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.address') }}</dt>
          <dd>{{ resolveValue(student?.placeOfBirth || student?.place_of_birth) }}</dd>
        </div>
      </dl>
    </section>

    <section class="student-profile-page__panel">
      <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.sections.currentResidence') }}</h3>
      <dl class="student-profile-page__details student-profile-page__details--location">
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.currentResidence') }}</dt>
          <dd>{{ currentResidenceDisplay || '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.province') }}</dt>
          <dd>{{ resolveLocationLabel(student?.residenceProvince || student?.residence_province) }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.district') }}</dt>
          <dd>{{ resolveLocationLabel(student?.residenceDistrict || student?.residence_district) }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.commune') }}</dt>
          <dd>{{ resolveLocationLabel(student?.residenceCommune || student?.residence_commune) }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.village') }}</dt>
          <dd>{{ resolveLocationLabel(student?.residenceVillage || student?.residence_village) }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentInfoPage.dialog.address') }}</dt>
          <dd>{{ resolveValue(student?.address) }}</dd>
        </div>
      </dl>
    </section>

    <section class="student-profile-page__panel">
      <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.sections.guardian') }}</h3>
      <dl class="student-profile-page__details">
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.guardianName') }}</dt>
          <dd>{{ student?.guardianName || '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.guardianPhone') }}</dt>
          <dd>{{ student?.guardianPhone || '-' }}</dd>
        </div>
      </dl>
    </section>

    <section class="student-profile-page__panel student-profile-page__panel--wide">
      <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.sections.record') }}</h3>
      <dl class="student-profile-page__details student-profile-page__details--four">
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.status') }}</dt>
          <dd>{{ statusLabel }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.createdAt') }}</dt>
          <dd>{{ formatDate(student?.createdAt) || student?.createdAt || '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.updatedAt') }}</dt>
          <dd>{{ formatDate(student?.updatedAt) || student?.updatedAt || '-' }}</dd>
        </div>
        <div>
          <dt>{{ t('preschoolStudentProfilePage.fields.classesCount') }}</dt>
          <dd>{{ student?.classesCount || profileClasses.length || 0 }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>
