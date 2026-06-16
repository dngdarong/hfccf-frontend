import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import { assessmentFormApi } from '@/modules/assessment/services/assessmentFormApi'

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

describe('assessmentFormApi', () => {
  it('list passes module and status params', async () => {
    http.get.mockResolvedValueOnce(ok([]))
    await assessmentFormApi.list({ module: 'preschool', status: 'published' })
    expect(http.get).toHaveBeenCalledWith('/assessment/forms', {
      params: { module: 'preschool', status: 'published' },
    })
  })

  it('create posts form data', async () => {
    http.post.mockResolvedValueOnce(ok({ id: 1, name: 'Test Form' }))
    await assessmentFormApi.create({ name: 'Test Form', module: 'preschool' })
    expect(http.post).toHaveBeenCalledWith('/assessment/forms', { name: 'Test Form', module: 'preschool' })
  })

  it('publish posts to the correct endpoint', async () => {
    http.post.mockResolvedValueOnce(ok({ id: 1, status: 'published' }))
    await assessmentFormApi.publish(1)
    expect(http.post).toHaveBeenCalledWith('/assessment/forms/1/publish')
  })

  it('duplicate posts to the correct endpoint', async () => {
    http.post.mockResolvedValueOnce(ok({ id: 2 }))
    await assessmentFormApi.duplicate(1)
    expect(http.post).toHaveBeenCalledWith('/assessment/forms/1/duplicate')
  })

  it('listSections fetches sections for a form', async () => {
    http.get.mockResolvedValueOnce(ok([]))
    await assessmentFormApi.listSections(5)
    expect(http.get).toHaveBeenCalledWith('/assessment/forms/5/sections')
  })

  it('createSection posts to sections endpoint', async () => {
    http.post.mockResolvedValueOnce(ok({ id: 10, title: 'Intro' }))
    await assessmentFormApi.createSection(5, { title: 'Intro', order: 1 })
    expect(http.post).toHaveBeenCalledWith('/assessment/forms/5/sections', { title: 'Intro', order: 1 })
  })

  it('reorderSections posts ordered ids', async () => {
    http.post.mockResolvedValueOnce(ok(null))
    await assessmentFormApi.reorderSections(5, [3, 1, 2])
    expect(http.post).toHaveBeenCalledWith('/assessment/forms/5/sections/reorder', [3, 1, 2])
  })

  it('createQuestion posts to questions endpoint', async () => {
    http.post.mockResolvedValueOnce(ok({ id: 20 }))
    await assessmentFormApi.createQuestion(5, { question_text: 'Q1', section_id: 10 })
    expect(http.post).toHaveBeenCalledWith('/assessment/forms/5/questions', {
      question_text: 'Q1',
      section_id: 10,
    })
  })

  it('delete calls delete on the form endpoint', async () => {
    http.delete.mockResolvedValueOnce(ok(null))
    await assessmentFormApi.delete(1)
    expect(http.delete).toHaveBeenCalledWith('/assessment/forms/1')
  })
})
