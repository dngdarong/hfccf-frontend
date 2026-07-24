<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'StudentProfileHeader',
})

defineProps({
  student: {
    type: Object,
    default: null,
  },
  avatarSrc: {
    type: String,
    default: '',
  },
  initials: {
    type: String,
    default: '?',
  },
  statusLabel: {
    type: String,
    default: '',
  },
  statusClass: {
    type: String,
    default: '',
  },
  backLabel: {
    type: String,
    default: '',
  },
  healthLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['back', 'health'])

const { t } = useLanguage()
</script>

<template>
  <div class="student-profile-page__toolbar">
    <Button type="button" variant="ghost" rounded="xl" @click="emit('back')">
      {{ backLabel || t('preschoolStudentProfilePage.actions.back') }}
    </Button>
    <Button type="button" variant="secondary" rounded="xl" @click="emit('health')">
      {{ healthLabel || t('preschoolStudentProfilePage.actions.health') }}
    </Button>
  </div>

  <div v-if="student" class="student-profile-page__hero">
    <div class="student-profile-page__avatar-wrap">
      <div class="student-profile-page__avatar">
        <img
          v-if="avatarSrc"
          :src="avatarSrc"
          :alt="t('preschoolStudentProfilePage.avatarAlt')"
          class="student-profile-page__avatar-img"
        />
        <span v-else class="student-profile-page__avatar-initials">{{ initials }}</span>
      </div>
    </div>

    <div class="student-profile-page__hero-content">
      <div class="student-profile-page__hero-row">
        <div>
          <p class="student-profile-page__eyebrow">{{ t('preschoolStudentProfilePage.hero.eyebrow') }}</p>
          <h2 class="student-profile-page__name">{{ student?.fullName || student?.name || '-' }}</h2>
          <p class="student-profile-page__code">
            {{ student?.publicId || student?.studentCode || '-' }}
          </p>
        </div>
        <span class="student-profile-page__status" :class="statusClass">
          {{ statusLabel }}
        </span>
      </div>

      <p class="student-profile-page__summary">
        {{ t('preschoolStudentProfilePage.hero.summary') }}
      </p>
    </div>
  </div>
</template>
