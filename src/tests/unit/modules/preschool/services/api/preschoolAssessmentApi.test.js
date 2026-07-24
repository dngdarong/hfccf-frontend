// Keep the Preschool assessment API contract under test so page code cannot
// silently regress into over-sized requests or broken response mapping.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  archiveAssessment,
  buildFormTemplatePayload,
  approveAssessmentFormReview,
  createStudentAssessment,
  fetchAssessmentCategories,
  fetchAssessmentFormReviewHistory,
  fetchAssessmentFormReviewQueue,
  fetchProgressSummary,
  fetchStudentAssessments,
  finalizeAssessment,
  isPersistedId,
  rejectAssessmentFormReview,
  startAssessmentFormReview,
  submitAssessmentFormForReview,
  stripTemporaryIdsForPayload,
  updateAssessment,
} from '@/modules/preschool/services/api/preschoolAssessmentApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool assessment api', () => {
  it('strips temporary ids and normalizes persisted ids in form template payloads', () => {
    expect(isPersistedId(12)).toBe(true)
    expect(isPersistedId('12')).toBe(true)
    expect(isPersistedId('question-temp')).toBe(false)

    const payload = buildFormTemplatePayload(
      {
        id: '21',
        name: 'Sample Form',
      },
      [
        {
          id: 'section-temp',
          code: 'studentProfile',
          title: 'Student Profile',
          questions: [
            {
              id: 'question-temp',
              code: 'student_name',
              title: 'Student name',
              answerType: 'shortText',
              options: [
                { id: 'option-temp', label: 'Draft option', value: 'draft_option' },
                { id: '42', label: 'Saved option', value: 'saved_option' },
              ],
            },
          ],
        },
        {
          id: '34',
          code: 'family',
          title: 'Family Information',
          questions: [
            {
              id: 35,
              code: 'guardian_name',
              title: 'Guardian name',
              answerType: 'shortText',
              options: 'First, Second',
            },
          ],
        },
      ],
    )

    expect(payload.id).toBe(21)
    expect(payload.sections[0].id).toBeUndefined()
    expect(payload.sections[1].id).toBe(34)
    expect(payload.sections[0].questions[0].id).toBeUndefined()
    expect(payload.sections[1].questions[0].id).toBe(35)
    expect(payload.sections[0].questions[0].options[0]).toMatchObject({
      label: 'Draft option',
      value: 'draft_option',
    })
    expect(payload.sections[0].questions[0].options[0]).not.toHaveProperty('id')
    expect(payload.sections[0].questions[0].options[1].id).toBe(42)
    expect(payload.sections[1].questions[0].options).toMatchObject([
      { label: 'First', value: 'first' },
      { label: 'Second', value: 'second' },
    ])

    const cleaned = stripTemporaryIdsForPayload({
      id: 'not-persisted',
      sections: [
        {
          id: '19',
          questions: [
            {
              id: 'question-temp',
              options: [
                { id: 'option-temp', label: 'Temp' },
              ],
            },
          ],
        },
      ],
    })

    expect(cleaned).not.toHaveProperty('id')
    expect(cleaned.sections[0].id).toBe(19)
    expect(cleaned.sections[0].questions[0]).not.toHaveProperty('id')
    expect(cleaned.sections[0].questions[0].options[0]).not.toHaveProperty('id')
  })

  it('loads categories and clamps oversized assessment pages safely', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse([
        { id: 1, code: 'learning_progress', name: 'Learning Progress', sort_order: 1, is_active: true },
      ]),
    )

    await expect(fetchAssessmentCategories()).resolves.toMatchObject([
      {
        id: 1,
        code: 'learning_progress',
        name: 'Learning Progress',
        isActive: true,
      },
    ])
    expect(http.get).toHaveBeenCalledWith('/preschool/assessment-categories', { signal: undefined })

    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 11,
            student_id: 5,
            category: { id: 1, code: 'behavior', name: 'Behavior' },
            rating: 'developing',
            assessment_date: '2026-05-19',
          },
        ],
        pagination: { page: 2, per_page: 100, total: 1, last_page: 1 },
      }),
    )

    await expect(
      fetchStudentAssessments(5, {
        page: 2,
        perPage: 200,
        status: 'draft',
        categoryId: 1,
        periodLabel: 'Term 1',
        search: 'behavior',
        sortBy: 'assessment_date',
        sortDirection: 'asc',
        classId: 7,
      }),
    ).resolves.toMatchObject({
      items: [
        {
          id: 11,
          studentId: 5,
          categoryCode: 'behavior',
          rating: 'developing',
        },
      ],
      pagination: {
        page: 2,
        perPage: 100,
        total: 1,
      },
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/students/5/assessments', {
      params: {
        page: 2,
        per_page: 100,
        status: 'draft',
        category_id: 1,
        period_label: 'Term 1',
        search: 'behavior',
        sort_by: 'assessment_date',
        sort_direction: 'asc',
        class_id: 7,
      },
      signal: undefined,
    })
  })

  it('creates, updates, finalizes, archives, and loads progress summaries', async () => {
    http.post.mockResolvedValueOnce(
      stubResponse({
        assessment: {
          id: 21,
          student_id: 6,
          category_id: 2,
          status: 'draft',
        },
      }),
    )

    await expect(createStudentAssessment(6, { category_id: 2 })).resolves.toMatchObject({
      id: 21,
      studentId: 6,
      categoryId: 2,
      status: 'draft',
    })

    http.put.mockResolvedValueOnce(
      stubResponse({
        assessment: {
          id: 21,
          student_id: 6,
          category_id: 2,
          status: 'draft',
        },
      }),
    )

    await expect(updateAssessment(21, { teacher_comment: 'Updated' })).resolves.toMatchObject({
      id: 21,
      studentId: 6,
    })

    http.post.mockResolvedValueOnce(
      stubResponse({
        assessment: {
          id: 21,
          student_id: 6,
          category_id: 2,
          status: 'finalized',
        },
      }),
    )

    await expect(finalizeAssessment(21)).resolves.toMatchObject({
      id: 21,
      status: 'finalized',
    })

    http.post.mockResolvedValueOnce(
      stubResponse({
        assessment: {
          id: 21,
          student_id: 6,
          category_id: 2,
          status: 'archived',
        },
      }),
    )

    await expect(archiveAssessment(21)).resolves.toMatchObject({
      id: 21,
      status: 'archived',
    })

    http.get.mockResolvedValueOnce(
      stubResponse({
        summary: {
          total_assessments: 4,
          draft_assessments: 1,
          finalized_assessments: 2,
          archived_assessments: 1,
          average_score: 86.5,
          latest_assessment_date: '2026-05-19',
        },
        categories: [
          {
            category: { id: 1, code: 'learning_progress', name: 'Learning Progress' },
            count: 2,
            average_score: 90,
          },
        ],
        recentAssessments: [
          {
            id: 31,
            student_id: 6,
            category: { id: 1, code: 'learning_progress', name: 'Learning Progress' },
            status: 'finalized',
          },
        ],
      }),
    )

    await expect(fetchProgressSummary(6)).resolves.toMatchObject({
      summary: {
        totalAssessments: 4,
        draftAssessments: 1,
        finalizedAssessments: 2,
        archivedAssessments: 1,
        averageScore: 86.5,
      },
      categories: [
        {
          category: {
            code: 'learning_progress',
          },
        },
      ],
      recentAssessments: [
        {
          id: 31,
          studentId: 6,
        },
      ],
    })
  })

  it('loads and normalizes the preschool review queue response', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 91,
            name: 'Preschool Development Checklist',
            code: 'PDC-2026',
            module: 'preschool',
            status: 'draft',
            review_status: 'submitted',
            submitted_by: { id: 7, name: 'Admin Preschool' },
            submitted_at: '2026-06-17T01:02:03Z',
            review_started_by: 8,
            review_started_at: '2026-06-17T04:05:06Z',
            reviewed_by: null,
            reviewed_at: null,
            created_by: 6,
            updated_by: 7,
            created_at: '2026-06-16T08:00:00Z',
            updated_at: '2026-06-17T05:00:00Z',
            sections: [
              {
                id: 11,
                title: 'Student Profile',
                questions: [{ id: 101 }, { id: 102 }],
              },
            ],
            versions: [
              {
                version_number: 1,
                is_current: true,
                snapshot: {
                  template: {
                    review_status: 'submitted',
                    submitted_by: 7,
                    submitted_by_name: 'Admin Preschool',
                    submitted_at: '2026-06-17T01:02:03Z',
                    review_started_by: 8,
                    review_started_by_name: 'Reviewer One',
                    review_started_at: '2026-06-17T04:05:06Z',
                  },
                },
              },
            ],
          },
        ],
        summary: {
          pending_review: 1,
          in_review: 0,
          approved: 0,
          rejected: 0,
        },
      }),
    )

    await expect(
      fetchAssessmentFormReviewQueue({
        page: 2,
        perPage: 25,
        search: 'Preschool',
        status: 'draft',
        reviewStatus: 'submitted',
        sortBy: 'name',
        sortDirection: 'asc',
      }),
    ).resolves.toMatchObject({
      items: [
        {
          id: 91,
          reviewStatus: 'submitted',
          submittedBy: {
            id: 7,
            name: 'Admin Preschool',
          },
          reviewStartedBy: {
            id: 8,
            name: '',
          },
          createdBy: {
            id: 6,
            name: '',
          },
          updatedBy: {
            id: 7,
            name: '',
          },
          isUnderReview: true,
          sections: [
            {
              id: 11,
            },
          ],
        },
      ],
      summary: {
        pendingReview: 1,
        inReview: 0,
        approved: 0,
        rejected: 0,
      },
      pagination: {
        page: 2,
        perPage: 25,
      },
    })

    expect(http.get).toHaveBeenCalledWith('/assessment/forms/review-queue', {
      params: {
        page: 2,
        per_page: 25,
        search: 'Preschool',
        status: 'draft',
        review_status: 'submitted',
        sort_by: 'name',
        sort_direction: 'asc',
      },
      signal: undefined,
    })
  })

  it('sends review workflow actions to the expected endpoints', async () => {
    http.post.mockResolvedValueOnce(
      stubResponse({
        id: 101,
        name: 'Queue Form',
        module: 'preschool',
        status: 'draft',
        review_status: 'submitted',
        submitted_by: { id: 11, name: 'Admin One' },
      }),
    )
    await expect(
      submitAssessmentFormForReview(101, { reviewNotes: 'Ready for review' }),
    ).resolves.toMatchObject({
      id: 101,
      reviewStatus: 'submitted',
      submittedBy: {
        id: 11,
        name: 'Admin One',
      },
    })
    expect(http.post).toHaveBeenCalledWith('/assessment/forms/101/submit-review', {
      review_notes: 'Ready for review',
    })

    http.post.mockResolvedValueOnce(
      stubResponse({
        id: 101,
        name: 'Queue Form',
        module: 'preschool',
        status: 'draft',
        review_status: 'in_review',
        review_started_by: { id: 12, name: 'Reviewer One' },
      }),
    )
    await expect(startAssessmentFormReview(101)).resolves.toMatchObject({
      reviewStatus: 'in_review',
      reviewStartedBy: {
        id: 12,
        name: 'Reviewer One',
      },
    })
    expect(http.post).toHaveBeenCalledWith('/assessment/forms/101/start-review')

    http.post.mockResolvedValueOnce(
      stubResponse({
        id: 101,
        name: 'Queue Form',
        module: 'preschool',
        status: 'draft',
        review_status: 'approved',
        reviewed_by: { id: 13, name: 'Approver One' },
        review_notes: 'Approved with comments',
      }),
    )
    await expect(
      approveAssessmentFormReview(101, { reviewNotes: 'Approved with comments' }),
    ).resolves.toMatchObject({
      reviewStatus: 'approved',
      reviewedBy: {
        id: 13,
        name: 'Approver One',
      },
    })
    expect(http.post).toHaveBeenCalledWith('/assessment/forms/101/approve', {
      review_notes: 'Approved with comments',
    })

    http.post.mockResolvedValueOnce(
      stubResponse({
        id: 101,
        name: 'Queue Form',
        module: 'preschool',
        status: 'draft',
        review_status: 'rejected',
        reviewed_by: { id: 14, name: 'Reviewer Two' },
        review_notes: 'Needs corrections',
      }),
    )
    await expect(
      rejectAssessmentFormReview(101, {
        rejectionReason: 'Please fix the scoring.',
        reviewNotes: 'Needs corrections',
      }),
    ).resolves.toMatchObject({
      reviewStatus: 'rejected',
      reviewedBy: {
        id: 14,
        name: 'Reviewer Two',
      },
    })
    expect(http.post).toHaveBeenCalledWith('/assessment/forms/101/reject', {
      rejection_reason: 'Please fix the scoring.',
      review_notes: 'Needs corrections',
    })

    http.get.mockResolvedValueOnce(
      stubResponse([
        {
          id: 9001,
          action: 'form.review.approved',
          entity_label: 'Queue Form',
          actor: { id: 13, name: 'Approver One' },
          created_at: '2026-06-17T05:06:07Z',
          meta: {
            review_notes: 'Approved with comments',
          },
        },
      ]),
    )

    await expect(fetchAssessmentFormReviewHistory(101)).resolves.toMatchObject([
      {
        action: 'form.review.approved',
        actor: {
          id: 13,
          name: 'Approver One',
        },
        createdAt: '2026-06-17T05:06:07Z',
      },
    ])
    expect(http.get).toHaveBeenCalledWith('/assessment/forms/101/review-history', {
      signal: undefined,
    })
  })
})
