import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import { assessmentSubmissionApi } from '@/modules/assessment/services/assessmentSubmissionApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

function ok(data) {
  return { data: { success: true, data } }
}

beforeEach(() => vi.clearAllMocks())

describe('assessmentSubmissionApi', () => {
  it('list passes status filter param', async () => {
    http.get.mockResolvedValueOnce(ok([]))
    await assessmentSubmissionApi.list({ status: 'submitted' })
    expect(http.get).toHaveBeenCalledWith('/assessment/submissions', { params: { status: 'submitted' } })
  })

  it('create posts submission payload', async () => {
    http.post.mockResolvedValueOnce(ok({ id: 1 }))
    await assessmentSubmissionApi.create({ form_template_id: 1, student_id: 2, status: 'draft' })
    expect(http.post).toHaveBeenCalledWith('/assessment/submissions', {
      form_template_id: 1,
      student_id: 2,
      status: 'draft',
    })
  })

  it('submit posts to the submit endpoint', async () => {
    http.post.mockResolvedValueOnce(ok({ id: 1, status: 'submitted' }))
    await assessmentSubmissionApi.submit(1)
    expect(http.post).toHaveBeenCalledWith('/assessment/submissions/1/submit')
  })

  it('review posts action and note', async () => {
    http.post.mockResolvedValueOnce(ok({ id: 1, status: 'approved' }))
    await assessmentSubmissionApi.review(1, { action: 'approve', note: 'Good' })
    expect(http.post).toHaveBeenCalledWith('/assessment/submissions/1/review', {
      action: 'approve',
      note: 'Good',
    })
  })

  it('delete calls delete on submission endpoint', async () => {
    http.delete.mockResolvedValueOnce(ok(null))
    await assessmentSubmissionApi.delete(1)
    expect(http.delete).toHaveBeenCalledWith('/assessment/submissions/1')
  })
})
