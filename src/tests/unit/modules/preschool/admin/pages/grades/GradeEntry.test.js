import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import GradeEntry from '@/modules/preschool/admin/pages/grades/GradeEntry.vue'
import { downloadGradeEntryReportPdf } from '@/modules/preschool/services/api/preschoolGradeApi'

const toastAdd = vi.fn()
const loadMonthlyEntry = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({ name: 'dashboard-preschool-admin-grades' }),
  useRouter: () => ({ back: vi.fn() }),
}))

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: toastAdd }),
}))

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({ t: (key, fallback) => fallback || key }),
}))

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: vi.fn(async () => ({ items: [{ id: 7, name: 'Lotus' }] })),
  fetchPreschoolStudents: vi.fn(async () => ({
    items: [
      { id: 1, fullName: 'សុភា រ៉ា', studentCode: 'PS-GRADE-0001' },
      { id: 2, fullName: 'សុខា Chan', studentCode: 'PS-GRADE-0002' },
    ],
  })),
  fetchMyPreschoolClasses: vi.fn(),
  fetchMyPreschoolStudents: vi.fn(),
  fetchAcademicLifecycle: vi.fn(async () => ({
    academicYears: [{ id: 3, label: 'Academic Year 2026', isCurrent: true }],
  })),
}))

vi.mock('@/modules/preschool/composables/useGradeData', async () => {
  const { ref } = await import('vue')
  return {
    useGradeData: () => ({
      errorMessage: ref(''),
      loadMonthlyEntry,
    }),
  }
})

vi.mock('@/modules/preschool/composables/useGradeMutations', async () => {
  const { ref } = await import('vue')
  return {
    useGradeMutations: () => ({
      isSubmitting: ref(false),
      saveBatchGrades: vi.fn(),
    }),
  }
})

vi.mock('@/modules/preschool/services/api/preschoolGradeApi', () => ({
  downloadGradeEntryReportPdf: vi.fn(async () => ({
    blob: new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
    filename: 'GradeEntry_2026-07.pdf',
    mimeType: 'application/pdf',
  })),
}))

vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    aoa_to_sheet: vi.fn(rows => ({ rows })),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}))

const SelectStub = {
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  template: `
    <select data-test="class-select" :value="modelValue" @change="$emit('update:modelValue', Number($event.target.value))">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  `,
}

const ButtonStub = {
  emits: ['click'],
  props: ['loading', 'disabled'],
  template: '<button type="button" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
}

async function mountLoadedPage() {
  loadMonthlyEntry.mockResolvedValue({
    status: 'draft',
    academic_year: 'Academic Year 2026',
    month: 'July',
    year: '2026',
    assessments: [
      {
        student_id: 1,
        student_gender: 'female',
        student_date_of_birth: '2020-01-15',
        class_name: 'Lotus',
        grade: 0,
        rating: 'A',
      },
    ],
  })

  const wrapper = mount(GradeEntry, {
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: true,
        Button: ButtonStub,
        Select: SelectStub,
        Dialog: true,
      },
    },
  })

  await flushPromises()
  await wrapper.find('[data-test="class-select"]').setValue('7')
  await flushPromises()

  return wrapper
}

describe('GradeEntry exports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:test-pdf'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('downloads PDF from the backend blob endpoint without using window.print', async () => {
    const click = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(tag => {
      const element = originalCreateElement(tag)
      if (tag === 'a') {
        element.click = click
      }
      return element
    })
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = await mountLoadedPage()

    await wrapper.findAll('button').find(button => button.text().includes('PDF')).trigger('click')
    await flushPromises()

    expect(downloadGradeEntryReportPdf).toHaveBeenCalledWith({
      academicYearId: 3,
      classId: 7,
      month: 7,
      year: 2026,
      filename: 'GradeEntry_7_2026.pdf',
    })
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalledTimes(1)
    expect(print).not.toHaveBeenCalled()
    expect(document.querySelector('a[download="GradeEntry_2026-07.pdf"]')).toBeNull()
  })

  it('exports a structured Khmer Excel workbook and preserves score zero', async () => {
    const wrapper = await mountLoadedPage()

    await wrapper.findAll('button').find(button => button.text().includes('Excel')).trigger('click')
    await flushPromises()

    const rows = XLSX.utils.aoa_to_sheet.mock.calls.at(-1)[0]
    expect(rows[0]).toEqual(['ព្រះរាជាណាចក្រកម្ពុជា'])
    expect(rows[3]).toEqual(['បញ្ជីពិន្ទុសិស្សប្រចាំខែ'])
    expect(rows[4][0]).toBe('ថ្នាក់៖ Lotus')
    expect(rows[4][2]).toBe('ឆ្នាំសិក្សា៖ Academic Year 2026')
    expect(rows[6]).toEqual([
      'ល.រ',
      'អត្តលេខសិស្ស',
      'គោត្តនាម-នាម',
      'ភេទ',
      'ថ្ងៃខែឆ្នាំកំណើត',
      'ថ្នាក់',
      'ពិន្ទុ',
      'និទ្ទេស',
    ])
    expect(rows[7]).toEqual([1, 'PS-GRADE-0001', 'សុភា រ៉ា', 'ស្រី', '2020-01-15', 'Lotus', 0, 'A'])
    expect(rows[8][6]).toBe('')
    expect(rows[6]).toHaveLength(8)
    expect(rows[7]).toHaveLength(8)
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), 'បញ្ជីពិន្ទុសិស្ស')
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.any(Object), 'GradeEntry_7_2026.xlsx')
  })
})
