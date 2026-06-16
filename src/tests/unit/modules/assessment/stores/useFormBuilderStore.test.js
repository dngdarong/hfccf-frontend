import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFormBuilderStore } from '@/modules/assessment/stores/useFormBuilderStore'

const mockGet = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockPublish = vi.fn()
const mockListSections = vi.fn()
const mockCreateSection = vi.fn()
const mockUpdateSection = vi.fn()
const mockDeleteSection = vi.fn()
const mockListTypes = vi.fn()

vi.mock('@/modules/assessment/services/assessmentFormApi', () => ({
  assessmentFormApi: {
    get: (...args) => mockGet(...args),
    create: (...args) => mockCreate(...args),
    update: (...args) => mockUpdate(...args),
    publish: (...args) => mockPublish(...args),
    listSections: (...args) => mockListSections(...args),
    createSection: (...args) => mockCreateSection(...args),
    updateSection: (...args) => mockUpdateSection(...args),
    deleteSection: (...args) => mockDeleteSection(...args),
  },
}))

vi.mock('@/modules/assessment/services/assessmentQuestionTypeApi', () => ({
  assessmentQuestionTypeApi: {
    list: (...args) => mockListTypes(...args),
  },
}))

function okData(data) {
  return { data: { data } }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('useFormBuilderStore', () => {
  it('initialises with empty state', () => {
    const store = useFormBuilderStore()
    expect(store.template).toBeNull()
    expect(store.sections).toEqual([])
    expect(store.isDirty).toBe(false)
  })

  it('loadTemplate fetches form and sections in parallel', async () => {
    mockGet.mockResolvedValueOnce(okData({ id: 1, name: 'Form A', status: 'draft' }))
    mockListSections.mockResolvedValueOnce(okData([{ id: 10, title: 'Sec 1', order: 1 }]))
    const store = useFormBuilderStore()
    await store.loadTemplate(1)
    expect(store.template?.id).toBe(1)
    expect(store.sections).toHaveLength(1)
    expect(store.isLoading).toBe(false)
  })

  it('loadQuestionTypes fetches and caches types', async () => {
    mockListTypes.mockResolvedValueOnce(okData([{ id: 1, key: 'short_text', label: 'Short Text' }]))
    const store = useFormBuilderStore()
    await store.loadQuestionTypes()
    expect(store.questionTypes).toHaveLength(1)
    // Second call should not re-fetch
    await store.loadQuestionTypes()
    expect(mockListTypes).toHaveBeenCalledTimes(1)
  })

  it('saveTemplate creates when no id', async () => {
    mockCreate.mockResolvedValueOnce(okData({ id: 5, name: 'New Form', status: 'draft' }))
    const store = useFormBuilderStore()
    await store.saveTemplate({ name: 'New Form', module: 'preschool' })
    expect(mockCreate).toHaveBeenCalled()
    expect(store.template?.id).toBe(5)
    expect(store.isDirty).toBe(false)
  })

  it('saveTemplate updates when id exists', async () => {
    mockGet.mockResolvedValueOnce(okData({ id: 3, name: 'Existing', status: 'draft' }))
    mockListSections.mockResolvedValueOnce(okData([]))
    mockUpdate.mockResolvedValueOnce(okData({ id: 3, name: 'Updated', status: 'draft' }))
    const store = useFormBuilderStore()
    await store.loadTemplate(3)
    await store.saveTemplate({ name: 'Updated' })
    expect(mockUpdate).toHaveBeenCalledWith(3, { name: 'Updated' })
    expect(store.isDirty).toBe(false)
  })

  it('sortedSections returns sections ordered by order field', async () => {
    mockGet.mockResolvedValueOnce(okData({ id: 1, name: 'F', status: 'draft' }))
    mockListSections.mockResolvedValueOnce(okData([
      { id: 2, title: 'B', order: 2 },
      { id: 1, title: 'A', order: 1 },
      { id: 3, title: 'C', order: 3 },
    ]))
    const store = useFormBuilderStore()
    await store.loadTemplate(1)
    expect(store.sortedSections.map((s) => s.order)).toEqual([1, 2, 3])
  })

  it('addSection appends new section to sections list', async () => {
    mockGet.mockResolvedValueOnce(okData({ id: 1, status: 'draft' }))
    mockListSections.mockResolvedValueOnce(okData([]))
    mockCreateSection.mockResolvedValueOnce(okData({ id: 20, title: 'New', order: 1 }))
    const store = useFormBuilderStore()
    await store.loadTemplate(1)
    await store.addSection({ title: 'New', order: 1 })
    expect(store.sections).toHaveLength(1)
    expect(store.sections[0].id).toBe(20)
  })

  it('deleteSection removes section from list', async () => {
    mockGet.mockResolvedValueOnce(okData({ id: 1, status: 'draft' }))
    mockListSections.mockResolvedValueOnce(okData([{ id: 10, title: 'Sec', order: 1 }]))
    mockDeleteSection.mockResolvedValueOnce(okData(null))
    const store = useFormBuilderStore()
    await store.loadTemplate(1)
    await store.deleteSection(10)
    expect(store.sections).toHaveLength(0)
  })

  it('markDirty sets isDirty to true', () => {
    const store = useFormBuilderStore()
    store.markDirty()
    expect(store.isDirty).toBe(true)
  })

  it('reset clears all state', async () => {
    mockGet.mockResolvedValueOnce(okData({ id: 1, status: 'draft' }))
    mockListSections.mockResolvedValueOnce(okData([{ id: 10, title: 'S', order: 1 }]))
    const store = useFormBuilderStore()
    await store.loadTemplate(1)
    store.markDirty()
    store.reset()
    expect(store.template).toBeNull()
    expect(store.sections).toEqual([])
    expect(store.isDirty).toBe(false)
  })
})
