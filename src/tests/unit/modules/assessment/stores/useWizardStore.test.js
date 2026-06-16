import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWizardStore } from '@/modules/assessment/stores/useWizardStore'

const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockSubmit = vi.fn()

vi.mock('@/modules/assessment/services/assessmentSubmissionApi', () => ({
  assessmentSubmissionApi: {
    create: (...args) => mockCreate(...args),
    update: (...args) => mockUpdate(...args),
    submit: (...args) => mockSubmit(...args),
  },
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('useWizardStore', () => {
  it('initialises at step 0 with no selection', () => {
    const store = useWizardStore()
    expect(store.currentStep).toBe(0)
    expect(store.selectedForm).toBeNull()
    expect(store.selectedStudent).toBeNull()
  })

  it('canGoNext is false at step 0 until form is selected', () => {
    const store = useWizardStore()
    expect(store.canGoNext).toBe(false)
    store.selectedForm = { id: 1, name: 'Form A' }
    expect(store.canGoNext).toBe(true)
  })

  it('canGoNext is false at step 1 until student is selected', () => {
    const store = useWizardStore()
    store.selectedForm = { id: 1 }
    store.goNext()
    expect(store.currentStep).toBe(1)
    expect(store.canGoNext).toBe(false)
    store.selectedStudent = { id: 7 }
    expect(store.canGoNext).toBe(true)
  })

  it('goNext and goBack navigate correctly', () => {
    const store = useWizardStore()
    store.selectedForm = { id: 1 }
    store.goNext()
    expect(store.currentStep).toBe(1)
    store.goBack()
    expect(store.currentStep).toBe(0)
  })

  it('canGoBack is false at first step', () => {
    const store = useWizardStore()
    expect(store.canGoBack).toBe(false)
    store.selectedForm = { id: 1 }
    store.goNext()
    expect(store.canGoBack).toBe(true)
  })

  it('isLastStep is true at step 3', () => {
    const store = useWizardStore()
    store.goToStep(3)
    expect(store.isLastStep).toBe(true)
  })

  it('setAnswer stores answers keyed by questionId_repeatIndex', () => {
    const store = useWizardStore()
    store.setAnswer(10, 'hello', 0)
    expect(store.answers['10_0']).toEqual({ question_id: 10, answer_value: 'hello', repeat_index: 0 })
  })

  it('setAnswer defaults repeatIndex to 0', () => {
    const store = useWizardStore()
    store.setAnswer(5, 42)
    expect(store.answers['5_0']).toEqual({ question_id: 5, answer_value: 42, repeat_index: 0 })
  })

  it('saveDraft creates submission on first save', async () => {
    mockCreate.mockResolvedValueOnce({ data: { data: { id: 99, status: 'draft' } } })
    const store = useWizardStore()
    store.selectedForm = { id: 1 }
    store.selectedStudent = { id: 7 }
    await store.saveDraft()
    expect(mockCreate).toHaveBeenCalledWith({
      form_template_id: 1,
      student_id: 7,
      status: 'draft',
      answers: [],
    })
    expect(store.submission?.id).toBe(99)
  })

  it('saveDraft updates existing submission on second save', async () => {
    mockCreate.mockResolvedValueOnce({ data: { data: { id: 99, status: 'draft' } } })
    mockUpdate.mockResolvedValueOnce({ data: { data: { id: 99, status: 'draft' } } })
    const store = useWizardStore()
    store.selectedForm = { id: 1 }
    store.selectedStudent = { id: 7 }
    await store.saveDraft()
    await store.saveDraft()
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  it('reset returns store to initial state', () => {
    const store = useWizardStore()
    store.selectedForm = { id: 1 }
    store.selectedStudent = { id: 7 }
    store.goToStep(2)
    store.setAnswer(1, 'x')
    store.reset()
    expect(store.currentStep).toBe(0)
    expect(store.selectedForm).toBeNull()
    expect(store.selectedStudent).toBeNull()
    expect(store.answers).toEqual({})
  })
})
