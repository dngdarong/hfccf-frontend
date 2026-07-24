<script setup>
import { useLanguage } from '@/composables/useLanguage'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import PreschoolDashboardSpotlight from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardSpotlight.vue'
import DashboardAcademicContext from '@/modules/preschool/admin/pages/dashboard/components/DashboardAcademicContext.vue'
import DashboardHeaderActions from '@/modules/preschool/admin/pages/dashboard/components/DashboardHeaderActions.vue'

defineOptions({
  name: 'DashboardHeroSection',
})

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  academicYear: {
    type: String,
    default: '',
  },
  academicTerm: {
    type: String,
    default: '',
  },
  lastUpdated: {
    type: String,
    default: '',
  },
  spotlightTitle: {
    type: String,
    required: true,
  },
  spotlightText: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  primaryLabel: {
    type: String,
    required: true,
  },
  menuLabel: {
    type: String,
    required: true,
  },
  refreshLabel: {
    type: String,
    required: true,
  },
  menuItems: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['refresh', 'primary'])
const { t } = useLanguage()

function onRefresh() {
  emit('refresh')
}

function onPrimary() {
  emit('primary')
}
</script>

<template>
  <div class="preschool-dashboard-page__header">
    <HeaderSection
      class="preschool-dashboard-page__header-copy"
      :title="props.title"
      :subtitle="props.subtitle"
    />
    <div class="preschool-dashboard-page__header-toolbar">
      <div class="preschool-dashboard-page__header-context">
        <DashboardAcademicContext
          :academic-year="props.academicYear"
          :academic-term="props.academicTerm"
          :last-updated="props.lastUpdated ? t('preschoolDashboardPage.header.lastUpdated', { time: props.lastUpdated }) : ''"
          :academic-year-label="t('preschoolDashboardPage.header.academicYear')"
          :academic-term-label="t('preschoolDashboardPage.header.term')"
        />
      </div>
      <div class="preschool-dashboard-page__header-spacer" aria-hidden="true" />
      <DashboardHeaderActions
        :loading="props.loading"
        :show-primary-action="true"
        :primary-label="props.primaryLabel"
        :menu-label="props.menuLabel"
        :refresh-label="props.refreshLabel"
        :menu-items="props.menuItems"
        @refresh="onRefresh"
        @primary="onPrimary"
      />
    </div>
  </div>
  <PreschoolDashboardSpotlight
    :title="props.spotlightTitle"
    :text="props.spotlightText"
  />
</template>
