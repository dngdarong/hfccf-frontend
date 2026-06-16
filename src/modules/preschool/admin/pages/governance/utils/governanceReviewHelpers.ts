export function normalizeClassItem(item: any) {
  return {
    label: item.name || item.code || `#${item.id}`,
    value: item.id,
    raw: item,
  }
}

export function normalizeStudentItem(item: any) {
  return {
    label: `${item.fullName || item.name}${(item.publicId || item.studentCode) ? ` (${item.publicId || item.studentCode})` : ''}`,
    value: item.id,
    raw: item,
  }
}

export function normalizeReportPeriodItem(item: any) {
  return {
    label: `${item.label || item.periodLabel || item.period_label}${item.status ? ` (${item.status})` : ''}`,
    value: item.id,
    raw: item,
  }
}

export function buildQueryPayload(filters: any) {
  return {
    academicYearId: filters.academicYearId,
    termId: filters.termId,
    reportPeriodId: filters.reportPeriodId,
    classId: filters.classId,
    studentId: filters.studentId,
    actorUserId: filters.actorUserId,
    actionType: filters.actionType,
    entityType: filters.entityType,
    exportType: filters.exportType,
    exportFormat: filters.exportFormat,
    source: filters.source,
    generatedFrom: filters.generatedFrom,
    generatedTo: filters.generatedTo,
    search: filters.search,
  }
}

export function buildOverviewCards(overview: any, t: any) {
  return [
    {
      title: t('preschoolGovernanceReviewPage.cards.totalEvents'),
      value: overview.totalAudits ?? 0,
      caption: t('preschoolGovernanceReviewPage.cards.totalEventsCaption'),
    },
    {
      title: t('preschoolGovernanceReviewPage.cards.blockedWrites'),
      value: overview.blockedWrites ?? 0,
      caption: t('preschoolGovernanceReviewPage.cards.blockedWritesCaption'),
    },
    {
      title: t('preschoolGovernanceReviewPage.cards.overrides'),
      value: overview.overrideApprovals ?? 0,
      caption: t('preschoolGovernanceReviewPage.cards.overridesCaption'),
    },
    {
      title: t('preschoolGovernanceReviewPage.cards.exports'),
      value: overview.exportEvents ?? 0,
      caption: t('preschoolGovernanceReviewPage.cards.exportsCaption'),
    },
  ]
}

export function buildReviewSections(review: any, t: any) {
  return [
    {
      title: t('preschoolGovernanceReviewPage.sections.overrideReview'),
      description: t('preschoolGovernanceReviewPage.sections.overrideReviewCaption'),
      items: review.overrideReview || [],
      emptyLabel: t('preschoolGovernanceReviewPage.empty.overrideReview'),
    },
    {
      title: t('preschoolGovernanceReviewPage.sections.blockedWrites'),
      description: t('preschoolGovernanceReviewPage.sections.blockedWritesCaption'),
      items: review.blockedWriteReview || [],
      emptyLabel: t('preschoolGovernanceReviewPage.empty.blockedWrites'),
    },
    {
      title: t('preschoolGovernanceReviewPage.sections.exportReview'),
      description: t('preschoolGovernanceReviewPage.sections.exportReviewCaption'),
      items: review.exportReview || [],
      emptyLabel: t('preschoolGovernanceReviewPage.empty.exportReview'),
    },
  ]
}

export function resolveAuditEntityContext(entity: string, context: string, emptyLabel = '-'): string {
  if (entity === emptyLabel && context === emptyLabel) {
    return emptyLabel
  }

  if (entity === emptyLabel) {
    return context
  }

  if (context === emptyLabel) {
    return entity
  }

  return `${entity} · ${context}`
}
