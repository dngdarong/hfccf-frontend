<template>
  <div class="space-y-6">
    <Breadcrumb />
    <section class="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-1.5">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {{ t('preschoolGuardianCommunicationPage.hero.kicker') }}
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
              {{ t('preschoolGuardianCommunicationPage.title') }}
            </h1>
            <AppBadge variant="staff">
              {{ t('preschoolGuardianCommunicationPage.hero.badge') }}
            </AppBadge>
          </div>
          <p class="max-w-3xl text-sm leading-6 text-slate-600">
            {{ t('preschoolGuardianCommunicationPage.hero.subtitle') }}
          </p>
        </div>

        <AppButton variant="ghost" @click="router.push({ name: 'dashboard-preschool-admin-students' })">
          {{ t('common.actions.back') }}
        </AppButton>
      </div>

      <div class="mt-5">
        <div class="space-y-1.5">
          <h2 class="text-sm font-semibold text-slate-900">
            {{ t('preschoolGuardianCommunicationPage.dashboard.title') }}
          </h2>
          <p class="text-sm text-slate-500">
            {{ t('preschoolGuardianCommunicationPage.dashboard.subtitle') }}
          </p>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div
            v-for="card in summaryCards"
            :key="card.label"
            data-testid="guardian-contact-summary-card"
            class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {{ card.label }}
            </p>
            <p class="mt-1.5 text-2xl font-bold text-slate-900" data-testid="guardian-contact-summary-value">
              {{ card.value }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-slate-900">
            {{ t('preschoolGuardianCommunicationPage.filters.filterContacts') }}
          </h2>
          <p class="text-sm text-slate-500">
            {{ t('preschoolGuardianCommunicationPage.filters.searchContacts') }}
          </p>
        </div>

        <AppButton type="button" variant="ghost" @click="clearTimelineFilters">
          {{ t('common.reset') }}
        </AppButton>
      </div>

      <div class="mt-4 grid gap-4 xl:grid-cols-12">
        <div class="xl:col-span-5">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            {{ t('preschoolGuardianCommunicationPage.filters.searchContacts') }}
          </label>
          <input
            v-model="timelineFilters.search"
            type="search"
            data-testid="guardian-contact-search"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            :placeholder="t('preschoolGuardianCommunicationPage.filters.searchPlaceholder')"
          />
        </div>

        <div class="xl:col-span-7">
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('preschoolGuardianCommunicationPage.filters.student') }}
              </label>
              <select
                v-model="timelineFilters.studentId"
                data-testid="guardian-contact-filter-student"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">{{ t('common.all') }}</option>
                <option v-for="student in studentFilterOptions" :key="student.id" :value="student.id">
                  {{ student.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('preschoolGuardianCommunicationPage.filters.guardian') }}
              </label>
              <select
                v-model="timelineFilters.guardianId"
                data-testid="guardian-contact-filter-guardian"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">{{ t('common.all') }}</option>
                <option v-for="guardian in guardianFilterOptions" :key="guardian.id" :value="guardian.id">
                  {{ guardian.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('preschoolGuardianCommunicationPage.filters.contactMethod') }}
              </label>
              <select
                v-model="timelineFilters.contactMethod"
                data-testid="guardian-contact-filter-method"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">{{ t('common.all') }}</option>
                <option v-for="option in contactMethodFilterOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('preschoolGuardianCommunicationPage.filters.reasonTopic') }}
              </label>
              <select
                v-model="timelineFilters.reasonTopic"
                data-testid="guardian-contact-filter-reason"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">{{ t('common.all') }}</option>
                <option v-for="option in reasonFilterOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('preschoolGuardianCommunicationPage.filters.outcome') }}
              </label>
              <select
                v-model="timelineFilters.outcome"
                data-testid="guardian-contact-filter-outcome"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">{{ t('common.all') }}</option>
                <option v-for="option in outcomeFilterOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('preschoolGuardianCommunicationPage.filters.followUpStatus') }}
              </label>
              <select
                v-model="timelineFilters.followUpStatus"
                data-testid="guardian-contact-filter-follow-up-status"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">{{ t('common.all') }}</option>
                <option v-for="option in followUpStatusFilterOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('preschoolGuardianCommunicationPage.filters.dateFrom') }}
              </label>
              <input
                v-model="timelineFilters.dateFrom"
                data-testid="guardian-contact-filter-date-from"
                type="date"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('preschoolGuardianCommunicationPage.filters.dateTo') }}
              </label>
              <input
                v-model="timelineFilters.dateTo"
                data-testid="guardian-contact-filter-date-to"
                type="date"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div class="space-y-6">
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header class="border-b border-slate-200 px-5 py-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-base font-semibold text-slate-900">
                  {{ t('preschoolGuardianCommunicationPage.contactForm.title') }}
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  {{ t('preschoolGuardianCommunicationPage.contactForm.subtitle') }}
                </p>
              </div>
              <AppBadge variant="staff">
                {{ currentStaffLabel }}
              </AppBadge>
            </div>
          </header>

          <form class="space-y-5 p-5" @submit.prevent="handleSubmit">
            <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 class="text-sm font-semibold text-slate-900">
                {{ t('preschoolGuardianCommunicationPage.formGroups.who') }}
              </h3>
              <p class="mt-1 text-xs text-slate-500">
                {{ t('preschoolGuardianCommunicationPage.formGroups.whoHint') }}
              </p>

              <div class="mt-4 space-y-4">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">
                    {{ t('preschoolGuardianCommunicationPage.labels.student') }}
                  </label>
                  <select
                    v-model="selectedStudentId"
                    :disabled="loadingStudents"
                    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">
                      {{ loadingStudents ? t('preschoolGuardianCommunicationPage.messages.loading') : t('preschoolGuardianCommunicationPage.messages.selectStudent') }}
                    </option>
                    <option v-for="student in studentOptions" :key="student.id" :value="student.id">
                      {{ student.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">
                    {{ t('preschoolGuardianCommunicationPage.labels.guardian') }}
                  </label>
                  <select
                    v-model="form.guardianId"
                    :disabled="!guardianOptions.length"
                    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none disabled:bg-slate-100"
                  >
                    <option value="">
                      {{ guardianPlaceholder }}
                    </option>
                    <option v-for="guardian in guardianOptions" :key="guardian.id" :value="guardian.id">
                      {{ guardian.label }}
                    </option>
                  </select>
                  <p class="mt-1 text-xs text-slate-500">
                    {{ guardianHelpText }}
                  </p>
                </div>
              </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 class="text-sm font-semibold text-slate-900">
                {{ t('preschoolGuardianCommunicationPage.formGroups.contactDetails') }}
              </h3>
              <p class="mt-1 text-xs text-slate-500">
                {{ t('preschoolGuardianCommunicationPage.formGroups.contactDetailsHint') }}
              </p>

              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">
                    {{ t('preschoolGuardianCommunicationPage.labels.channel') }}
                  </label>
                  <select
                    v-model="form.contactMethod"
                    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">
                      {{ t('preschoolGuardianCommunicationPage.messages.selectOption') }}
                    </option>
                    <option v-for="option in contactMethodOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">
                    {{ t('preschoolGuardianCommunicationPage.labels.reason') }}
                  </label>
                  <select
                    v-model="form.reasonTopic"
                    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">
                      {{ t('preschoolGuardianCommunicationPage.messages.selectOption') }}
                    </option>
                    <option v-for="option in reasonOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="mt-4">
                <label class="mb-2 block text-sm font-semibold text-slate-900">
                  {{ t('preschoolGuardianCommunicationPage.labels.summary') }}
                </label>
                <textarea
                  v-model="form.discussionSummary"
                  rows="6"
                  class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  :placeholder="t('preschoolGuardianCommunicationPage.messages.summaryPlaceholder')"
                />
              </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 class="text-sm font-semibold text-slate-900">
                {{ t('preschoolGuardianCommunicationPage.formGroups.followUp') }}
              </h3>
              <p class="mt-1 text-xs text-slate-500">
                {{ t('preschoolGuardianCommunicationPage.formGroups.followUpHint') }}
              </p>

              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">
                    {{ t('preschoolGuardianCommunicationPage.labels.outcome') }}
                  </label>
                  <select
                    v-model="form.outcome"
                    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">
                      {{ t('preschoolGuardianCommunicationPage.messages.selectOption') }}
                    </option>
                    <option v-for="option in outcomeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">
                    {{ t('preschoolGuardianCommunicationPage.labels.priority') }}
                  </label>
                  <select
                    v-model="form.followUpPriority"
                    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-700">
                    {{ t('preschoolGuardianCommunicationPage.labels.followUpRequired') }}
                  </label>
                  <select
                    v-model="form.followUpRequired"
                    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option :value="false">{{ t('preschoolGuardianCommunicationPage.binary.no') }}</option>
                    <option :value="true">{{ t('preschoolGuardianCommunicationPage.binary.yes') }}</option>
                  </select>
                </div>

                <div v-if="form.followUpRequired">
                  <label class="mb-1 block text-sm font-medium text-slate-700">
                    {{ t('preschoolGuardianCommunicationPage.labels.followUpDate') }}
                  </label>
                  <input
                    v-model="form.followUpDate"
                    type="date"
                    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <p class="text-sm font-semibold text-slate-900">
                {{ t('preschoolGuardianCommunicationPage.messages.previewLabel') }}
              </p>
              <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {{ contactPreview }}
              </p>
            </div>

            <div v-if="formErrors.length" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <ul class="list-disc space-y-1 pl-5">
                <li v-for="error in formErrors" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>

            <div v-if="submitMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {{ submitMessage }}
            </div>

            <div class="flex flex-wrap gap-3">
              <AppButton type="submit">
                {{ t('preschoolGuardianCommunicationPage.actions.saveContactLog') }}
              </AppButton>
              <AppButton type="button" variant="ghost" @click="resetForm">
                {{ t('common.reset') }}
              </AppButton>
            </div>
          </form>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                {{ t('preschoolGuardianCommunicationPage.labels.studentRoster') }}
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                {{ t('preschoolGuardianCommunicationPage.messages.studentRosterHint') }}
              </p>
            </div>
            <span class="text-sm font-medium text-slate-500">
              {{ filteredStudentOptions.length }}
            </span>
          </div>

          <div class="mt-4">
            <input
              v-model="studentSearch"
              type="search"
              class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              :placeholder="t('preschoolGuardianCommunicationPage.messages.searchStudents')"
            />
          </div>

          <div class="mt-4 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            <p v-if="loadingStudents" class="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
              {{ t('preschoolGuardianCommunicationPage.messages.loading') }}
            </p>
            <p
              v-else-if="!filteredStudentOptions.length"
              class="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500"
            >
              {{ t('preschoolGuardianCommunicationPage.messages.noStudentsFound') }}
            </p>
            <button
              v-for="student in filteredStudentOptions"
              :key="student.id"
              type="button"
              class="w-full rounded-2xl border px-4 py-3 text-left transition-colors"
              :class="student.id === selectedStudentId
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'"
              @click="selectStudent(student.id)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate font-semibold">
                    {{ student.label }}
                  </p>
                  <p class="mt-1 text-xs opacity-75">
                    {{ student.guardianLabel }}
                  </p>
                </div>
                <AppBadge variant="info" class="shrink-0">
                  {{ student.communicationCount }}
                </AppBadge>
              </div>
            </button>
          </div>
        </section>
      </div>

      <GuardianCommunicationTimeline
        :items="timelineItems"
        :loading="loadingCommunications"
        :title="t('preschoolGuardianCommunicationPage.timelineContactHistoryTitle')"
        :subtitle="t('preschoolGuardianCommunicationPage.timelineSubtitle')"
        :empty-title="timelineEmptyTitle"
        :empty-subtitle="timelineEmptySubtitle"
        show-actions
        @sent="handleMarkCompleted"
        @acknowledged="handleMarkFollowedUp"
        @cancelled="handleCloseLog"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import Breadcrumb from '@/components/navigation/Breadcrumb.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import GuardianCommunicationTimeline from '@/modules/preschool/admin/components/guardian/GuardianCommunicationTimeline.vue'
import { formatDate } from '@/utils/date'
import {
  buildGuardianContactLogMessage,
  normalizeText,
  parseGuardianContactLogMessage
} from '@/modules/preschool/admin/pages/guardian/contactLogUtils'
import { useUserStore } from '@/store/userStore'
import {
  acknowledgeGuardianCommunication,
  cancelGuardianCommunication,
  createStudentGuardianCommunication,
  fetchGuardianCommunications,
  markGuardianCommunicationSent
} from '@/modules/preschool/services/api/preschoolGuardianCommunicationApi'
import { fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const loadingStudents = ref(false)
const loadingCommunications = ref(false)
const students = ref([])
const communications = ref([])
const studentSearch = ref('')
const selectedStudentId = ref('')
const submitMessage = ref('')
const formErrors = ref([])
const timelineFilters = reactive({
  search: '',
  studentId: '',
  guardianId: '',
  contactMethod: '',
  reasonTopic: '',
  outcome: '',
  followUpStatus: '',
  dateFrom: '',
  dateTo: ''
})

const form = reactive({
  guardianId: '',
  contactMethod: '',
  reasonTopic: '',
  discussionSummary: '',
  outcome: '',
  followUpRequired: false,
  followUpDate: '',
  followUpPriority: 'medium'
})

const contactMethodOptions = computed(() => ([
  { value: 'phone-call', label: t('preschoolGuardianCommunicationPage.contactMethods.phoneCall') },
  { value: 'telegram', label: t('preschoolGuardianCommunicationPage.contactMethods.telegram') },
  { value: 'messenger', label: t('preschoolGuardianCommunicationPage.contactMethods.messenger') },
  { value: 'sms', label: t('preschoolGuardianCommunicationPage.contactMethods.sms') },
  { value: 'email', label: t('preschoolGuardianCommunicationPage.contactMethods.email') },
  { value: 'face-to-face', label: t('preschoolGuardianCommunicationPage.contactMethods.faceToFace') },
  { value: 'home-visit', label: t('preschoolGuardianCommunicationPage.contactMethods.homeVisit') },
  { value: 'other', label: t('preschoolGuardianCommunicationPage.contactMethods.other') }
]))

const reasonOptions = computed(() => ([
  { value: 'attendance', label: t('preschoolGuardianCommunicationPage.reasons.attendance') },
  { value: 'health', label: t('preschoolGuardianCommunicationPage.reasons.health') },
  { value: 'payment', label: t('preschoolGuardianCommunicationPage.reasons.payment') },
  { value: 'enrollment', label: t('preschoolGuardianCommunicationPage.reasons.enrollment') },
  { value: 'behaviour', label: t('preschoolGuardianCommunicationPage.reasons.behaviour') },
  { value: 'pickup', label: t('preschoolGuardianCommunicationPage.reasons.pickup') },
  { value: 'emergency', label: t('preschoolGuardianCommunicationPage.reasons.emergency') },
  { value: 'academic', label: t('preschoolGuardianCommunicationPage.reasons.academic') },
  { value: 'general', label: t('preschoolGuardianCommunicationPage.reasons.general') },
  { value: 'other', label: t('preschoolGuardianCommunicationPage.reasons.other') }
]))

const outcomeOptions = computed(() => ([
  { value: 'guardian-acknowledged', label: t('preschoolGuardianCommunicationPage.outcomes.guardianAcknowledged') },
  { value: 'follow-up-requested', label: t('preschoolGuardianCommunicationPage.outcomes.guardianRequestedFollowUp') },
  { value: 'guardian-unreachable', label: t('preschoolGuardianCommunicationPage.outcomes.guardianUnreachable') },
  { value: 'appointment-scheduled', label: t('preschoolGuardianCommunicationPage.outcomes.appointmentScheduled') },
  { value: 'issue-resolved', label: t('preschoolGuardianCommunicationPage.outcomes.issueResolved') },
  { value: 'other', label: t('preschoolGuardianCommunicationPage.outcomes.other') }
]))

const priorityOptions = computed(() => ([
  { value: 'low', label: t('preschoolGuardianCommunicationPage.severity.low') },
  { value: 'medium', label: t('preschoolGuardianCommunicationPage.severity.medium') },
  { value: 'high', label: t('preschoolGuardianCommunicationPage.severity.high') }
]))

const followUpStatusFilterOptions = computed(() => ([
  { value: 'required', label: t('preschoolGuardianCommunicationPage.followUpStatuses.required') },
  { value: 'today', label: t('preschoolGuardianCommunicationPage.followUpStatuses.today') },
  { value: 'upcoming', label: t('preschoolGuardianCommunicationPage.followUpStatuses.upcoming') },
  { value: 'overdue', label: t('preschoolGuardianCommunicationPage.followUpStatuses.overdue') },
  { value: 'completed', label: t('preschoolGuardianCommunicationPage.followUpStatuses.completed') }
]))

const currentStaffLabel = computed(() => {
  const user = userStore.currentUser || {}
  return user.fullName || user.name || user.email || t('common.unknown')
})

const selectedStudent = computed(() => students.value.find(student => String(student.id) === String(selectedStudentId.value)) || null)

const guardianOptions = computed(() => {
  const student = selectedStudent.value
  const guardians = student?.guardians || student?.guardian ? [].concat(student.guardians || student.guardian) : []

  return guardians
    .filter(Boolean)
    .map((guardian, index) => ({
      id: guardian.id || guardian.guardianId || guardian.userId || `${index}`,
      label: [guardian.fullName || guardian.name || guardian.displayName, guardian.phone || guardian.mobile]
        .filter(Boolean)
        .join(' • ') || t('preschoolGuardianCommunicationPage.messages.noGuardianData'),
      raw: guardian
    }))
})

const guardianPlaceholder = computed(() =>
  guardianOptions.value.length
    ? t('preschoolGuardianCommunicationPage.messages.selectGuardian')
    : t('preschoolGuardianCommunicationPage.messages.noGuardianData')
)

const guardianHelpText = computed(() =>
  guardianOptions.value.length
    ? t('preschoolGuardianCommunicationPage.messages.guardianHelp')
    : t('preschoolGuardianCommunicationPage.messages.noGuardianData')
)

const studentOptions = computed(() =>
  students.value.map(student => ({
    id: String(student.id),
    label: [student.fullName || student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(), student.publicId || student.studentCode || student.code]
      .filter(Boolean)
      .join(' — ') || t('common.unknown'),
    guardianLabel: student.guardianName || student.primaryGuardianName || t('preschoolGuardianCommunicationPage.messages.noGuardianData'),
    communicationCount: communications.value.filter(item => String(item.studentId) === String(student.id)).length
  }))
)

const filteredStudentOptions = computed(() => {
  const query = normalizeText(studentSearch.value).toLowerCase()
  if (!query) {
    return studentOptions.value
  }

  return studentOptions.value.filter(student =>
    student.label.toLowerCase().includes(query) ||
    student.guardianLabel.toLowerCase().includes(query)
  )
})

const studentFilterOptions = computed(() => studentOptions.value)

const guardianFilterOptions = computed(() => {
  const seen = new Set()
  const options = []

  normalizedCommunications.value.forEach((record) => {
    const id = record.guardianId || record.guardianLabel
    if (!record.guardianLabel || seen.has(id)) {
      return
    }

    seen.add(id)
    options.push({
      id,
      label: record.guardianLabel
    })
  })

  return options.sort((left, right) => left.label.localeCompare(right.label))
})

const contactMethodFilterOptions = computed(() => contactMethodOptions.value)
const reasonFilterOptions = computed(() => reasonOptions.value)
const outcomeFilterOptions = computed(() => outcomeOptions.value)

function getFollowUpStatusKey(record) {
  if (record.followUpStatus) {
    return record.followUpStatus
  }

  const status = String(record.status || '').toLowerCase()
  if (['sent', 'acknowledged', 'resolved', 'closed', 'cancelled', 'done'].includes(status)) {
    return 'completed'
  }

  if (!record.followUpRequired) {
    return ''
  }

  const followUpDate = record.followUpDate ? new Date(record.followUpDate) : null
  if (!followUpDate || Number.isNaN(followUpDate.getTime())) {
    return 'required'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  followUpDate.setHours(0, 0, 0, 0)

  if (followUpDate.getTime() === today.getTime()) return 'today'
  if (followUpDate < today) return 'overdue'
  return 'upcoming'
}

function createCommunicationRecord(item = {}) {
  const parsed = parseGuardianContactLogMessage(item.message)
  const createdAt = item.createdAt || item.created_at || item.updatedAt || item.updated_at || ''
  const createdDate = createdAt ? new Date(createdAt) : null
  const dateTime = createdDate && !Number.isNaN(createdDate.getTime()) ? createdDate.getTime() : 0
  const studentId = String(item.studentId || item.student_id || '')
  const guardianId = String(item.guardianId || item.guardian_id || '')
  const studentLabel = normalizeText(parsed?.student || item.studentName || item.student?.fullName || item.student?.name || item.student?.code)
  const guardianLabel = normalizeText(parsed?.guardian || item.guardianName || item.guardian?.fullName || item.guardian?.name || item.guardian?.code)
  const methodValue = normalizeText(item.channel || item.communicationType || item.sourceType || parsed?.method)
  const reasonValue = normalizeText(item.subject || parsed?.reason)
  const outcomeValue = normalizeText(item.outcome || parsed?.outcome)
  const summaryValue = normalizeText(parsed?.summary || item.message)
  const followUpRequired = Boolean(parsed?.followUpRequired || item.followUpRequired)
  const followUpDate = normalizeText(parsed?.followUpDate || item.followUpDate)
  const followUpStatus = getFollowUpStatusKey({
    ...item,
    followUpRequired,
    followUpDate,
    status: item.status
  })
  const staffLabel = normalizeText(parsed?.staff || item.createdByName || item.createdBy?.fullName || item.createdBy?.name || currentStaffLabel.value)
  const sourceEventLabel = normalizeText(parsed?.sourceEvent || item.relatedEvent?.name || item.sourceEvent || item.sourceType)

  return {
    raw: item,
    parsed,
    id: item.id || createdAt || Math.random().toString(36).slice(2),
    dateTime,
    createdAt,
    dateKey: createdDate && !Number.isNaN(createdDate.getTime()) ? createdDate.toISOString().slice(0, 10) : 'unknown',
    dateLabel: createdAt ? formatDate(createdAt) : '—',
    studentId,
    guardianId,
    studentLabel,
    guardianLabel,
    methodValue,
    methodLabel: contactMethodOptions.value.find(option => option.value === methodValue)?.label || parsed?.method || methodValue,
    reasonValue,
    reasonLabel: reasonOptions.value.find(option => option.value === reasonValue)?.label || parsed?.reason || reasonValue,
    outcomeValue,
    outcomeLabel: outcomeOptions.value.find(option => option.value === outcomeValue)?.label || parsed?.outcome || outcomeValue,
    summaryValue,
    followUpRequired,
    followUpDate,
    followUpStatus,
    followUpStatusLabel: followUpStatus ? t(`preschoolGuardianCommunicationPage.followUpStatuses.${followUpStatus}`) : '',
    followUpStatusVariant: followUpStatus === 'completed' ? 'success' : followUpStatus === 'overdue' ? 'danger' : followUpStatus === 'today' ? 'warning' : followUpStatus === 'upcoming' ? 'info' : 'warning',
    status: String(item.status || '').toLowerCase(),
    statusLabel: String(item.status || '').toLowerCase() === 'queued'
      ? t('preschoolGuardianCommunicationPage.status.queued')
      : String(item.status || '').toLowerCase() === 'sent'
        ? t('preschoolGuardianCommunicationPage.status.sent')
        : String(item.status || '').toLowerCase() === 'acknowledged'
          ? t('preschoolGuardianCommunicationPage.status.acknowledged')
          : String(item.status || '').toLowerCase() === 'failed'
            ? t('preschoolGuardianCommunicationPage.status.failed')
            : String(item.status || '').toLowerCase() === 'cancelled'
              ? t('preschoolGuardianCommunicationPage.status.cancelled')
              : t('common.unknown'),
    staffLabel,
    sourceEventLabel,
    searchText: normalizeText([
      studentLabel,
      guardianLabel,
      methodValue,
      reasonValue,
      summaryValue,
      outcomeValue,
      staffLabel,
      sourceEventLabel
    ].join(' ')).toLowerCase()
  }
}

const normalizedCommunications = computed(() =>
  [...communications.value]
    .map(createCommunicationRecord)
    .sort((left, right) => right.dateTime - left.dateTime)
)

const filteredCommunications = computed(() => {
  const query = normalizeText(timelineFilters.search).toLowerCase()

  return normalizedCommunications.value.filter((record) => {
    if (query && !record.searchText.includes(query)) {
      return false
    }

    if (timelineFilters.studentId && record.studentId !== String(timelineFilters.studentId)) {
      return false
    }

    if (timelineFilters.guardianId && record.guardianId !== String(timelineFilters.guardianId) && record.guardianLabel !== String(timelineFilters.guardianId)) {
      return false
    }

    if (timelineFilters.contactMethod && record.methodValue !== String(timelineFilters.contactMethod)) {
      return false
    }

    if (timelineFilters.reasonTopic && record.reasonValue !== String(timelineFilters.reasonTopic)) {
      return false
    }

    if (timelineFilters.outcome && record.outcomeValue !== String(timelineFilters.outcome)) {
      return false
    }

    if (timelineFilters.followUpStatus && getFollowUpStatusKey(record) !== String(timelineFilters.followUpStatus)) {
      return false
    }

    if (timelineFilters.dateFrom || timelineFilters.dateTo) {
      const recordDate = record.createdAt ? new Date(record.createdAt) : null
      if (!recordDate || Number.isNaN(recordDate.getTime())) {
        return false
      }

      const timestamp = recordDate.getTime()
      if (timelineFilters.dateFrom) {
        const fromDate = new Date(`${timelineFilters.dateFrom}T00:00:00`)
        if (!Number.isNaN(fromDate.getTime()) && timestamp < fromDate.getTime()) {
          return false
        }
      }

      if (timelineFilters.dateTo) {
        const toDate = new Date(`${timelineFilters.dateTo}T23:59:59.999`)
        if (!Number.isNaN(toDate.getTime()) && timestamp > toDate.getTime()) {
          return false
        }
      }
    }

    return true
  })
})

const timelineItems = computed(() => filteredCommunications.value.map(item => item.raw))

const timelineEmptyTitle = computed(() => {
  const hasFilters = Boolean(
    timelineFilters.search
    || timelineFilters.studentId
    || timelineFilters.guardianId
    || timelineFilters.contactMethod
    || timelineFilters.reasonTopic
    || timelineFilters.outcome
    || timelineFilters.followUpStatus
    || timelineFilters.dateFrom
    || timelineFilters.dateTo,
  )

  return hasFilters
    ? t('preschoolGuardianCommunicationPage.messages.noFilteredResults')
    : t('preschoolGuardianCommunicationPage.messages.noCommunicationYet')
})

const timelineEmptySubtitle = computed(() => {
  const hasFilters = Boolean(
    timelineFilters.search
    || timelineFilters.studentId
    || timelineFilters.guardianId
    || timelineFilters.contactMethod
    || timelineFilters.reasonTopic
    || timelineFilters.outcome
    || timelineFilters.followUpStatus
    || timelineFilters.dateFrom
    || timelineFilters.dateTo,
  )

  return hasFilters
    ? t('preschoolGuardianCommunicationPage.messages.clearFiltersHint')
    : t('preschoolGuardianCommunicationPage.messages.noCommunicationDescription')
})

const contactPreview = computed(() => {
  const method = contactMethodOptions.value.find(option => option.value === form.contactMethod)?.label || t('preschoolGuardianCommunicationPage.messages.selectOption')
  const reason = reasonOptions.value.find(option => option.value === form.reasonTopic)?.label || t('preschoolGuardianCommunicationPage.messages.selectOption')
  const outcome = outcomeOptions.value.find(option => option.value === form.outcome)?.label || t('preschoolGuardianCommunicationPage.messages.selectOption')
  const studentLabel = studentOptions.value.find(option => option.id === selectedStudentId.value)?.label || t('preschoolGuardianCommunicationPage.messages.selectStudent')

  return [
    `${studentLabel}`,
    `${method} · ${reason}`,
    form.discussionSummary || t('preschoolGuardianCommunicationPage.messages.summaryPlaceholder'),
    `${t('preschoolGuardianCommunicationPage.labels.outcome')}: ${outcome}`,
    `${t('preschoolGuardianCommunicationPage.labels.followUpRequired')}: ${form.followUpRequired ? t('preschoolGuardianCommunicationPage.binary.yes') : t('preschoolGuardianCommunicationPage.binary.no')}`,
    form.followUpRequired ? `${t('preschoolGuardianCommunicationPage.labels.followUpDate')}: ${form.followUpDate || t('preschoolGuardianCommunicationPage.messages.selectFollowUpDate')}` : '',
    `${t('preschoolGuardianCommunicationPage.labels.staffMember')}: ${currentStaffLabel.value}`
  ].filter(Boolean).join('\n')
})

const summaryCards = computed(() => {
  const items = filteredCommunications.value
  const followUpsToday = items.filter(item => item.followUpStatus === 'today').length
  const completed = items.filter(item => item.followUpStatus === 'completed').length
  const overdue = items.filter(item => item.followUpStatus === 'overdue').length
  const upcoming = items.filter(item => item.followUpStatus === 'upcoming').length

  return [
    { label: t('preschoolGuardianCommunicationPage.metrics.totalContacts'), value: items.length },
    { label: t('preschoolGuardianCommunicationPage.metrics.followUpToday'), value: followUpsToday },
    { label: t('preschoolGuardianCommunicationPage.metrics.overdueFollowUps'), value: overdue },
    { label: t('preschoolGuardianCommunicationPage.metrics.upcomingFollowUps'), value: upcoming },
    { label: t('preschoolGuardianCommunicationPage.metrics.completedFollowUps'), value: completed }
  ]
})

function unwrapList(response) {
  if (Array.isArray(response)) {
    return response
  }

  return response?.data?.items || response?.data || response?.items || response?.records || []
}

function resetForm() {
  form.guardianId = guardianOptions.value[0]?.id || ''
  form.contactMethod = ''
  form.reasonTopic = ''
  form.discussionSummary = ''
  form.outcome = ''
  form.followUpRequired = false
  form.followUpDate = ''
  form.followUpPriority = 'medium'
  formErrors.value = []
  submitMessage.value = ''
}

async function loadStudents() {
  loadingStudents.value = true

  try {
    const response = await fetchPreschoolStudents({ perPage: 200 })
    students.value = unwrapList(response)

    if (!selectedStudentId.value && students.value.length) {
      selectedStudentId.value = String(students.value[0].id)
    }
  } finally {
    loadingStudents.value = false
  }
}

async function loadCommunications() {
  loadingCommunications.value = true

  try {
    const response = await fetchGuardianCommunications({
      perPage: 100
    })

    communications.value = unwrapList(response)
  } finally {
    loadingCommunications.value = false
  }
}

function selectStudent(studentId) {
  selectedStudentId.value = String(studentId)
}

function clearTimelineFilters() {
  timelineFilters.search = ''
  timelineFilters.studentId = ''
  timelineFilters.guardianId = ''
  timelineFilters.contactMethod = ''
  timelineFilters.reasonTopic = ''
  timelineFilters.outcome = ''
  timelineFilters.followUpStatus = ''
  timelineFilters.dateFrom = ''
  timelineFilters.dateTo = ''
}

function validateForm() {
  const errors = []

  if (!selectedStudentId.value) {
    errors.push(t('preschoolGuardianCommunicationPage.validation.studentRequired'))
  }

  if (!form.contactMethod) {
    errors.push(t('preschoolGuardianCommunicationPage.validation.contactMethodRequired'))
  }

  if (!form.reasonTopic) {
    errors.push(t('preschoolGuardianCommunicationPage.validation.reasonRequired'))
  }

  if (!normalizeText(form.discussionSummary)) {
    errors.push(t('preschoolGuardianCommunicationPage.validation.summaryRequired'))
  }

  if (!form.outcome) {
    errors.push(t('preschoolGuardianCommunicationPage.validation.outcomeRequired'))
  }

  if (form.followUpRequired && !form.followUpDate) {
    errors.push(t('preschoolGuardianCommunicationPage.validation.followUpDateRequired'))
  }

  formErrors.value = errors
  return errors.length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  try {
    const guardian = guardianOptions.value.find(option => option.id === form.guardianId)
    const method = contactMethodOptions.value.find(option => option.value === form.contactMethod)?.label || form.contactMethod
    const reason = reasonOptions.value.find(option => option.value === form.reasonTopic)?.label || form.reasonTopic
    const outcome = outcomeOptions.value.find(option => option.value === form.outcome)?.label || form.outcome

    const message = buildGuardianContactLogMessage({
      student: studentOptions.value.find(option => option.id === selectedStudentId.value)?.label || '',
      guardian: guardian?.label || '',
      method,
      reason,
      summary: form.discussionSummary,
      outcome,
      followUpRequired: form.followUpRequired,
      followUpDate: form.followUpDate,
      priority: form.followUpPriority
    }, {}, currentStaffLabel.value)

    await createStudentGuardianCommunication({
      studentId: selectedStudentId.value,
      guardianId: form.guardianId || undefined,
      sourceType: 'manual_note',
      channel: form.contactMethod,
      subject: form.reasonTopic,
      message,
      severity: form.followUpPriority,
      status: 'queued'
    })

    submitMessage.value = t('preschoolGuardianCommunicationPage.messages.saveSuccess')
    resetForm()
    await loadCommunications()
  } catch {
    submitMessage.value = t('preschoolGuardianCommunicationPage.messages.saveFailed')
  }
}

async function handleMarkCompleted(item) {
  await markGuardianCommunicationSent(item.id)
  await loadCommunications()
}

async function handleMarkFollowedUp(item) {
  await acknowledgeGuardianCommunication(item.id)
  await loadCommunications()
}

async function handleCloseLog(item) {
  await cancelGuardianCommunication(item.id)
  await loadCommunications()
}

watch(selectedStudentId, async (value) => {
  const student = students.value.find(entry => String(entry.id) === String(value))
  form.guardianId = guardianOptions.value[0]?.id || student?.guardianId || ''
})

watch(guardianOptions, () => {
  if (!guardianOptions.value.length) {
    form.guardianId = ''
    return
  }

  if (!guardianOptions.value.some(option => option.id === form.guardianId)) {
    form.guardianId = guardianOptions.value[0].id
  }
}, { immediate: true })

onMounted(async () => {
  await loadStudents()
  resetForm()
  await loadCommunications()
})
</script>
