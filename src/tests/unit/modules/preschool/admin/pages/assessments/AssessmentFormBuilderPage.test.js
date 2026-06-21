import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enPreschool from '@/i18n/en/preschool'
import AssessmentFormBuilderPage from '@/modules/preschool/admin/pages/assessments/AssessmentFormBuilderPage.vue'
import { PRESCHOOL_ASSESSMENT_FORM_BUILDER_SECTION_QUESTION_SEEDS } from '@/modules/preschool/admin/pages/assessments/constants/preschoolAssessmentFormBuilder'

const mockFetchAssessmentForm = vi.fn(() => Promise.resolve(null))
const mockFetchAssessmentFormVersions = vi.fn(() => Promise.resolve([]))
const mockFetchAssessmentQuestionTypes = vi.fn(() => Promise.resolve([]))
const mockCreateAssessmentForm = vi.fn(() => Promise.resolve({ id: 1 }))
const mockUpdateAssessmentForm = vi.fn(() => Promise.resolve({ id: 1 }))
const mockToastAdd = vi.fn()

vi.mock('@/modules/preschool/services/api/preschoolAssessmentApi', () => ({
  archiveAssessmentForm: vi.fn(() => Promise.resolve({})),
  buildFormTemplatePayload: vi.fn((payload, sections = []) => ({
    ...payload,
    sections: sections.map(section => ({
      ...section,
      questions: (section.questions || []).map(question => ({
        ...question,
        label: question.label,
        help_text: question.helpText,
        is_required: Boolean(question.required),
        max_score: Number(question.score ?? 0),
        validation_rules: {
          mode: question.validationMode,
          required: Boolean(question.required),
        },
        settings: {
          answerType: question.answerType,
          validationMode: question.validationMode,
          score: Number(question.score ?? 0),
          options: question.options,
        },
      })),
    })),
  })),
  createAssessmentForm: (...args) => mockCreateAssessmentForm(...args),
  duplicateAssessmentForm: vi.fn(() => Promise.resolve({ id: 1 })),
  fetchAssessmentForm: (...args) => mockFetchAssessmentForm(...args),
  fetchAssessmentFormVersions: (...args) => mockFetchAssessmentFormVersions(...args),
  fetchAssessmentQuestionTypes: (...args) => mockFetchAssessmentQuestionTypes(...args),
  publishAssessmentForm: vi.fn(() => Promise.resolve({})),
  restoreAssessmentForm: vi.fn(() => Promise.resolve({})),
  updateAssessmentForm: (...args) => mockUpdateAssessmentForm(...args),
}))

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: mockToastAdd,
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    Button: { props: ['label'], emits: ['click'], template: '<button @click="$emit(\'click\')">{{ label }}</button>' },
    FormBuilderQuestionPalette: { template: '<div class="palette-stub" />' },
    FormBuilderCanvas: {
      props: ['sections', 'sectionQuestions', 'selectedSectionKey'],
      emits: ['add-question', 'add-section', 'select-question', 'select-section'],
      template: `
        <div class="canvas-stub">
          <span class="canvas-total">{{ Object.values(sectionQuestions || {}).reduce((total, items) => total + items.length, 0) }}</span>
          <button
            v-for="section in sections"
            :key="\`select-\${section.key}\`"
            :class="\`canvas-question-\${section.key}\`"
            type="button"
            @click="$emit('select-question', { question: sectionQuestions?.[section.key]?.[0], section })"
          >
            select
          </button>
          <span
            v-for="section in sections"
            :key="\`count-\${section.key}\`"
            :class="\`canvas-count-\${section.key}\`"
          >
            {{ sectionQuestions?.[section.key]?.length || 0 }}
          </span>
          <button
            v-for="section in sections"
            :key="section.key"
            :class="\`canvas-add-question-\${section.key}\`"
            type="button"
            @click="$emit('add-question', { section })"
          >
            add
          </button>
        </div>
      `,
    },
    FormBuilderQuestionSettings: {
      props: ['section'],
      emits: ['update:state', 'reset', 'apply'],
      template: `
        <div class="settings-stub">
          <button
            class="settings-update"
            type="button"
            @click="$emit('update:state', {
              label: 'Updated Student Name',
              helpText: 'Updated helper text',
              required: true,
              score: 11,
              answerType: 'shortText',
              sectionKey: section?.key || 'studentProfile',
              validationMode: 'strict',
              options: 'Alpha, Beta',
            })"
          >
            update
          </button>
        </div>
      `,
    },
    AssessmentFormVersionReview: { template: '<div class="version-review-stub" />' },
    AssessmentPageHeader: { template: '<div class="page-header-stub" />' },
  }
}

describe('AssessmentFormBuilderPage', () => {
  it('mounts without TDZ errors and seeds the initial question map', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const expectedQuestionCount = Object.values(PRESCHOOL_ASSESSMENT_FORM_BUILDER_SECTION_QUESTION_SEEDS)
      .reduce((total, seeds) => total + seeds.length, 0)

    const wrapper = mountWithPlugins(AssessmentFormBuilderPage, {
      messages: {
        en: { common: enCommon, ...enPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    expect(mockFetchAssessmentQuestionTypes).toHaveBeenCalled()
    expect(mockFetchAssessmentForm).not.toHaveBeenCalled()
    expect(mockFetchAssessmentFormVersions).not.toHaveBeenCalled()
    expect(wrapper.find('.canvas-stub').text()).toContain(String(expectedQuestionCount))
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('shows a friendly toast when save draft validation fails', async () => {
    const validationError = new Error('Validation failed')
    validationError.response = {
      status: 422,
      data: {
        message: 'sections.0.questions.0.id field must be an integer.',
        errors: {
          'sections.0.questions.0.id': ['sections.0.questions.0.id field must be an integer.'],
        },
      },
    }
    mockCreateAssessmentForm.mockRejectedValueOnce(validationError)

    const wrapper = mountWithPlugins(AssessmentFormBuilderPage, {
      messages: {
        en: { common: enCommon, ...enPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    const buttons = wrapper.findAll('button')
    const saveDraftButton = buttons.find(button => button.text().includes('Save Draft'))

    expect(saveDraftButton).toBeTruthy()

    await saveDraftButton.trigger('click')
    await flushPromises()

    expect(mockCreateAssessmentForm).toHaveBeenCalled()
    expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      detail: expect.stringContaining('field must be an integer'),
    }))
    expect(wrapper.text()).toContain('field must be an integer')
  })

  it('persists question settings changes and adds questions to the clicked section', async () => {
    const wrapper = mountWithPlugins(AssessmentFormBuilderPage, {
      messages: {
        en: { common: enCommon, ...enPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    await wrapper.find('.canvas-question-studentProfile').trigger('click')
    await flushPromises()

    const familyCountBefore = Number(wrapper.find('.canvas-count-family').text())

    await wrapper.find('.settings-update').trigger('click')
    await flushPromises()

    await wrapper.find('.canvas-add-question-family').trigger('click')
    await flushPromises()

    const saveDraftButton = wrapper.findAll('button').find(button => button.text().includes('Save Draft'))
    expect(saveDraftButton).toBeTruthy()

    await saveDraftButton.trigger('click')
    await flushPromises()

    expect(mockCreateAssessmentForm).toHaveBeenCalled()

    const payload = mockCreateAssessmentForm.mock.calls[0][0]
    expect(payload.sections[0].questions[0]).toMatchObject({
      label: 'Updated Student Name',
      help_text: 'Updated helper text',
      is_required: true,
      max_score: 11,
      validation_rules: {
        mode: 'strict',
        required: true,
      },
    })
    expect(payload.sections[0].questions[0].settings).toMatchObject({
      answerType: 'shortText',
      validationMode: 'strict',
      score: 11,
      options: 'Alpha, Beta',
    })
    expect(payload.sections[1].questions).toHaveLength(familyCountBefore + 1)
    expect(payload.sections[1].questions.some(question => question.label === 'Updated Student Name')).toBe(true)
    expect(payload.sections[1].questions[payload.sections[1].questions.length - 1]).toMatchObject({
      label: 'Updated Student Name',
      is_required: true,
      max_score: 11,
    })
  })
})
