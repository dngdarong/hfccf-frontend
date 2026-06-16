// Keep Preschool assessment mapping isolated so backend response shape changes
// do not leak into pages and composables later in the reporting roadmap.
function normalizeText(value) {
  return String(value ?? '').trim()
}

export function normalizeAssessmentCategory(row = {}) {
  return {
    id: row.id ?? '',
    code: normalizeText(row.code),
    name: normalizeText(row.name),
    description: normalizeText(row.description),
    sortOrder: Number(row.sortOrder ?? row.sort_order ?? 0),
    isActive: Boolean(row.isActive ?? row.is_active ?? false),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

export function normalizeAssessment(row = {}) {
  const category = row.category || {}

  return {
    id: row.id ?? '',
    studentId: row.studentId ?? row.student_id ?? '',
    studentPublicId: normalizeText(row.studentPublicId || row.student_public_id),
    studentName: normalizeText(row.studentName || row.student_name),
    classId: row.classId ?? row.class_id ?? '',
    className: normalizeText(row.className || row.class_name),
    categoryId: row.categoryId ?? row.category_id ?? category.id ?? '',
    categoryCode: normalizeText(row.categoryCode || row.category_code || category.code),
    categoryName: normalizeText(row.categoryName || row.category_name || category.name),
    category: row.category ? normalizeAssessmentCategory(row.category) : null,
    assessedByUserId: row.assessedByUserId ?? row.assessed_by_user_id ?? '',
    assessedByName: normalizeText(row.assessedByName || row.assessed_by_name),
    periodLabel: normalizeText(row.periodLabel || row.period_label),
    assessmentDate: row.assessmentDate || row.assessment_date || '',
    score: row.score ?? null,
    rating: normalizeText(row.rating),
    observation: normalizeText(row.observation),
    teacherComment: normalizeText(row.teacherComment || row.teacher_comment),
    status: normalizeText(row.status),
    finalizedAt: row.finalizedAt || row.finalized_at || '',
    finalizedByUserId: row.finalizedByUserId ?? row.finalized_by_user_id ?? '',
    finalizedByName: normalizeText(row.finalizedByName || row.finalized_by_name),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

export function normalizeProgressSummary(row = {}) {
  const summary = row.summary || row.data?.summary || {}
  const sourceCategories = row.categories || row.data?.categories || []
  const sourceRecentAssessments = row.recentAssessments || row.data?.recentAssessments || []

  const categories = Array.isArray(sourceCategories)
    ? sourceCategories.map((category) => ({
        ...category,
        category: category.category ? normalizeAssessmentCategory(category.category) : normalizeAssessmentCategory(category),
      }))
    : []
  const recentAssessments = Array.isArray(sourceRecentAssessments)
    ? sourceRecentAssessments.map(normalizeAssessment)
    : []

  return {
    summary: {
      totalAssessments: Number(summary.totalAssessments ?? summary.total_assessments ?? 0),
      draftAssessments: Number(summary.draftAssessments ?? summary.draft_assessments ?? 0),
      finalizedAssessments: Number(summary.finalizedAssessments ?? summary.finalized_assessments ?? 0),
      archivedAssessments: Number(summary.archivedAssessments ?? summary.archived_assessments ?? 0),
      averageScore: summary.averageScore ?? summary.average_score ?? null,
      latestAssessmentDate: summary.latestAssessmentDate || summary.latest_assessment_date || '',
    },
    categories,
    recentAssessments,
    source: String(row.source || row.data?.source || 'live').trim() || 'live',
    snapshot: row.snapshot || row.data?.snapshot || null,
    frozen: Boolean(row.frozen || row.data?.frozen || false),
    raw: row,
  }
}
