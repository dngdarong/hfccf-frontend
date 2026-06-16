import { OPERATIONAL_STATES, STATUS_VALUES } from '../constants/preschoolSettingsConstants'

export function toDateOrNull(value: any): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatLifecycleDate(value: any): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function formatPreviewDate(value: any, language: string): string {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat(language === 'KH' ? 'km-KH' : 'en-GB', {
    dateStyle: 'medium',
  }).format(date)
}

export function formatLastSavedLabel(lastSavedAt: any, language: string, t: any): string {
  if (!lastSavedAt) {
    return t('preschoolSettingsPage.emptyStates.unsaved')
  }

  return new Intl.DateTimeFormat(language === 'KH' ? 'km-KH' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(lastSavedAt)
}

export function buildOperationalState(hasValidationIssues: boolean, lastSavedAt: any, t: any) {
  if (hasValidationIssues) {
    return {
      label: t('preschoolSettingsPage.operationalStates.needsAttention'),
      tone: OPERATIONAL_STATES.NEEDS_ATTENTION,
    }
  }

  if (lastSavedAt) {
    return {
      label: t('preschoolSettingsPage.operationalStates.saved'),
      tone: OPERATIONAL_STATES.SAVED,
    }
  }

  return {
    label: t('preschoolSettingsPage.operationalStates.ready'),
    tone: OPERATIONAL_STATES.READY,
  }
}

export function buildStatusOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.statusOptions.active'), value: STATUS_VALUES.ACTIVE },
    { label: t('preschoolSettingsPage.statusOptions.inactive'), value: STATUS_VALUES.INACTIVE },
  ]
}

export function buildClassLevelOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.classLevels.nursery'), value: 'nursery' },
    { label: t('preschoolSettingsPage.classLevels.kindergarten1'), value: 'kindergarten-1' },
    { label: t('preschoolSettingsPage.classLevels.kindergarten2'), value: 'kindergarten-2' },
    { label: t('preschoolSettingsPage.classLevels.prep'), value: 'prep' },
  ]
}

export function buildTeacherOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.teacherOptions.leadTeacher'), value: 'lead-teacher' },
    { label: t('preschoolSettingsPage.teacherOptions.assistantTeacher'), value: 'assistant-teacher' },
    { label: t('preschoolSettingsPage.teacherOptions.floatingTeacher'), value: 'floating-teacher' },
  ]
}

export function buildAbsenceRuleOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.absenceRules.windowAndThreshold'), value: 'window-and-threshold' },
    { label: t('preschoolSettingsPage.absenceRules.strict'), value: 'strict' },
  ]
}

export function buildPaymentCycleOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.paymentCycles.monthly'), value: 'monthly' },
    { label: t('preschoolSettingsPage.paymentCycles.term'), value: 'term' },
    { label: t('preschoolSettingsPage.paymentCycles.quarterly'), value: 'quarterly' },
  ]
}

export function buildLateFeeRuleOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.lateFeeRules.fixed'), value: 'fixed' },
    { label: t('preschoolSettingsPage.lateFeeRules.perDay'), value: 'per-day' },
    { label: t('preschoolSettingsPage.lateFeeRules.percentage'), value: 'percentage' },
  ]
}

export function buildAssessmentCycleOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.assessmentCycles.term'), value: 'term' },
    { label: t('preschoolSettingsPage.assessmentCycles.semester'), value: 'semester' },
    { label: t('preschoolSettingsPage.assessmentCycles.monthly'), value: 'monthly' },
  ]
}

export function buildFinalizationModeOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.finalizationModes.publishOnly'), value: 'publish-only' },
    { label: t('preschoolSettingsPage.finalizationModes.manualReview'), value: 'manual-review' },
    { label: t('preschoolSettingsPage.finalizationModes.draftOnly'), value: 'draft-only' },
  ]
}

export function buildWeeklyModeOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.weeklyModes.fiveDay'), value: 'five-day' },
    { label: t('preschoolSettingsPage.weeklyModes.sixDay'), value: 'six-day' },
  ]
}

export function buildPlanningWindowOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.planningWindows.weekly'), value: 'weekly' },
    { label: t('preschoolSettingsPage.planningWindows.term'), value: 'term' },
    { label: t('preschoolSettingsPage.planningWindows.monthly'), value: 'monthly' },
  ]
}

export function buildEnrollmentCycleOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.enrollmentCycles.term'), value: 'term' },
    { label: t('preschoolSettingsPage.enrollmentCycles.yearly'), value: 'yearly' },
    { label: t('preschoolSettingsPage.enrollmentCycles.rolling'), value: 'rolling' },
  ]
}

export function buildTransferPolicyOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.transferPolicies.adminOnly'), value: 'admin-only' },
    { label: t('preschoolSettingsPage.transferPolicies.adminPlusTeacher'), value: 'admin-plus-teacher' },
    { label: t('preschoolSettingsPage.transferPolicies.teacherRequest'), value: 'teacher-request' },
  ]
}

export function buildCapacityReviewOptions(t: any) {
  return [
    { label: t('preschoolSettingsPage.capacityReviewModes.manual'), value: 'manual' },
    { label: t('preschoolSettingsPage.capacityReviewModes.automatic'), value: 'automatic' },
  ]
}

export function buildAcademicYearOptions(academicYears: any[]) {
  return academicYears.map((year) => ({
    label: year.label || year.code || `Year ${year.id}`,
    value: year.id,
  }))
}

export function syncBackboneAcademicDraft(settings: any, currentAcademicYearRecord: any, currentLifecycleTerms: any[]) {
  const year = currentAcademicYearRecord

  if (year) {
    settings.academicYear = {
      currentAcademicYear: year.label || year.code || '',
      startDate: toDateOrNull(year.startDate),
      endDate: toDateOrNull(year.endDate),
      status: year.status || 'active',
    }
  }

  settings.terms = currentLifecycleTerms.map((term) => ({
    id: term.id,
    name: term.name,
    startDate: toDateOrNull(term.startDate),
    endDate: toDateOrNull(term.endDate),
    status: term.status || 'active',
  }))
}
