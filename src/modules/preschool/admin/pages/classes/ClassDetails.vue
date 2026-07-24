<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useClassDetailsData } from './class-details/composables/useClassDetailsData'
import { useClassDetailsActions } from './class-details/composables/useClassDetailsActions'
import ClassDetailsHeader from './class-details/sections/ClassDetailsHeader.vue'
import ClassSummaryCardsSection from './class-details/sections/ClassSummaryCardsSection.vue'
import ClassScheduleSection from './class-details/sections/ClassScheduleSection.vue'
import ClassTeacherSection from './class-details/sections/ClassTeacherSection.vue'
import ClassStudentRosterSection from './class-details/sections/ClassStudentRosterSection.vue'
import ClassRoomSection from './class-details/sections/ClassRoomSection.vue'
import ClassNotesSection from './class-details/sections/ClassNotesSection.vue'

defineOptions({
  name: 'PreschoolAdminClassDetailsPage',
})

const { t } = useLanguage()
const {
  loading,
  errorMessage,
  classDetails,
  teacherDetails,
  studentRoster,
  teacherName,
  teacherEmail,
  teacherPhone,
  teacherStatus,
  teacherAvatar,
  teacherInitials,
  schedule,
  totalStudents,
  recentActivity,
  summaryCards,
} = useClassDetailsData()
const {
  goBack,
  goEdit,
  goToAttendance,
  goToSchedule,
} = useClassDetailsActions()
</script>

<template>
  <MainLayout>
    <section class="class-details-page">
      <HeaderSection
        :title="t('preschoolClassDetailsPage.title')"
        :subtitle="t('preschoolClassDetailsPage.subtitle')"
      />

      <div class="class-details-page__shell">
        <div v-if="loading" class="class-details-page__state">
          {{ t('preschoolClassDetailsPage.messages.loading') }}
        </div>

        <div v-else-if="errorMessage" class="class-details-page__state class-details-page__state--error">
          {{ errorMessage }}
        </div>

        <template v-else-if="classDetails">
          <ClassDetailsHeader
            :class-details="classDetails"
            :teacher-name="teacherName"
            :back-label="t('preschoolClassDetailsPage.backToClasses')"
            :edit-label="t('preschoolClassDetailsPage.editClass')"
            :attendance-label="t('preschoolClassDetailsPage.attendance')"
            :schedule-label="t('preschoolClassDetailsPage.schedule')"
            @back="goBack"
            @edit="goEdit"
            @attendance="goToAttendance"
            @schedule="goToSchedule"
          />

          <ClassSummaryCardsSection
            :title="t('preschoolClassDetailsPage.classSummary')"
            :cards="summaryCards"
          />

          <div class="class-details-page__columns">
            <div class="class-details-page__stack">
          <ClassScheduleSection
                :title="t('preschoolClassDetailsPage.classSchedule')"
                :schedule="schedule"
                :days-label="t('preschoolClassDetailsPage.days')"
                :start-time-label="t('preschoolClassDetailsPage.startTime')"
                :end-time-label="t('preschoolClassDetailsPage.endTime')"
                :schedule-status-label="t('preschoolClassDetailsPage.scheduleStatus')"
                :legacy-schedule-label="t('preschoolClassDetailsPage.legacySchedule')"
                :schedule-unavailable-label="t('preschoolClassDetailsPage.scheduleUnavailable')"
              />

              <ClassTeacherSection
                :title="t('preschoolClassDetailsPage.teacher')"
                :teacher="{
                  ...(teacherDetails || {}),
                  avatar: teacherAvatar,
                  initials: teacherInitials,
                  status: teacherStatus,
                  email: teacherEmail,
                  phone: teacherPhone,
                }"
                :teacher-name="teacherName"
                :email-label="t('preschoolClassDetailsPage.email')"
                :phone-label="t('preschoolClassDetailsPage.phone')"
                :no-teacher-label="t('preschoolClassDetailsPage.noTeacherAssigned')"
                :assigned-teacher-label="t('preschoolClassDetailsPage.assignedTeacher')"
                :teacher-status-label="t('preschoolClassDetailsPage.teacherStatus')"
              />
            </div>

            <div class="class-details-page__stack">
              <ClassRoomSection
                :title="t('preschoolClassDetailsPage.roomAndCapacity')"
                :room="classDetails.room"
                :student-count="totalStudents"
                :capacity="classDetails.capacity"
                :notes="classDetails.notes"
                :room-label="t('preschoolAddClass.room')"
                :student-count-label="t('preschoolClassDetailsPage.totalStudents')"
                :capacity-label="t('preschoolClassDetailsPage.capacity')"
                :notes-label="t('preschoolClassDetailsPage.notes')"
                :no-data-label="t('common.states.noData')"
              />

              <ClassNotesSection
                :title="t('preschoolClassDetailsPage.notes')"
                :notes="classDetails.notes"
                :recent-activity="recentActivity"
                :empty-label="t('preschoolClassDetailsPage.noNotes')"
                :recent-activity-label="t('preschoolClassDetailsPage.recentActivity')"
              />
            </div>
          </div>

          <ClassStudentRosterSection
            :title="t('preschoolClassDetailsPage.studentRoster')"
            :students="studentRoster"
            :empty-title="t('preschoolClassDetailsPage.noStudentsAssigned')"
            :empty-description="t('preschoolClassDetailsPage.noStudentsAssigned')"
            :view-student-profile-label="t('preschoolClassDetailsPage.viewStudentProfile')"
          />
        </template>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.class-details-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.class-details-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.class-details-page__columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.class-details-page__stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.class-details-page__state {
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid #dbe5ef;
  background: #fff;
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 700;
}

.class-details-page__state--error {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #be123c;
}

@media (max-width: 960px) {
  .class-details-page__columns {
    grid-template-columns: 1fr;
  }
}
</style>
