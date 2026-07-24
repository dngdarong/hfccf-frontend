import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import StudentForm from '@/modules/preschool/admin/pages/students/StudentForm.vue'

const mockFetchPreschoolClasses = vi.fn()
const mockFetchPreschoolStudent = vi.fn()
const mockCreatePreschoolStudent = vi.fn()
const mockUpdatePreschoolStudent = vi.fn()
const mockFetchProvinces = vi.fn()
const mockFetchDistricts = vi.fn()
const mockFetchCommunes = vi.fn()
const mockFetchVillages = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: (...args) => mockFetchPreschoolClasses(...args),
  fetchPreschoolStudent: (...args) => mockFetchPreschoolStudent(...args),
  createPreschoolStudent: (...args) => mockCreatePreschoolStudent(...args),
  updatePreschoolStudent: (...args) => mockUpdatePreschoolStudent(...args),
}))

vi.mock('@/modules/preschool/services/cambodiaLocationService', () => ({
  fetchProvinces: (...args) => mockFetchProvinces(...args),
  fetchDistricts: (...args) => mockFetchDistricts(...args),
  fetchCommunes: (...args) => mockFetchCommunes(...args),
  fetchVillages: (...args) => mockFetchVillages(...args),
  getLocationDisplayName: (item = {}, locale = 'kh') => {
    if (String(locale).toLowerCase() === 'en') {
      return String(item.nameEn || item.name_en || item.nameKh || item.name_kh || item.code || '').trim()
    }

    return String(item.nameKh || item.name_kh || item.nameEn || item.name_en || item.code || '').trim()
  },
}))

function mountPage(messages = { en: enPreschool, kh: khPreschool }) {
  return mountWithPlugins(StudentForm, {
    messages,
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        AlertSuccess: {
          props: ['show'],
          template: '<div v-if="show" data-testid="alert-success-stub" />',
        },
        Button: {
          props: ['disabled', 'loading'],
          emits: ['click'],
          template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
        },
        MultiSelect: {
          props: ['modelValue', 'options'],
          template: '<div data-testid="multi-select-stub" />',
        },
      },
    },
  })
}

function findPanel(wrapper, title) {
  return wrapper.findAll('.student-form-page__panel').find((panel) => panel.text().includes(title))
}

function findFieldControl(panel, labelText) {
  const field = panel.findAll('.student-form-page__field').find((item) => item.text().includes(labelText))
  expect(field, `field with label ${labelText}`).toBeTruthy()
  return field.find('input, select')
}

beforeEach(() => {
  vi.clearAllMocks()

  mockFetchPreschoolClasses.mockResolvedValue({
    items: [
      {
        id: 'class-1',
        code: 'PS-01',
        name: 'Morning Stars',
      },
    ],
    pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
  })

  mockFetchProvinces.mockResolvedValue([
    { id: 1, code: '01', nameEn: 'Phnom Penh', nameKh: 'ភ្នំពេញ' },
    { id: 2, code: '08', nameEn: 'Kandal', nameKh: 'កណ្ដាល' },
  ])

  mockFetchDistricts.mockImplementation((provinceCode) => {
    if (String(provinceCode) === '01') {
      return Promise.resolve([
        { id: 11, code: '0102', nameEn: 'Dangkao', nameKh: 'ដង្កោ' },
        { id: 12, code: '0103', nameEn: 'Sen Sok', nameKh: 'សែនសុខ' },
      ])
    }

    if (String(provinceCode) === '08') {
      return Promise.resolve([
        { id: 21, code: '0801', nameEn: 'Khsach Kandal', nameKh: 'ខ្សាច់កណ្ដាល' },
      ])
    }

    return Promise.resolve([])
  })

  mockFetchCommunes.mockImplementation((districtCode) => {
    if (String(districtCode) === '0102') {
      return Promise.resolve([
        { id: 111, code: '010201', nameEn: 'Prek Pra', nameKh: 'ព្រែកប្រា' },
        { id: 112, code: '010202', nameEn: 'Prek Kampeus', nameKh: 'ព្រែកកំពឹស' },
      ])
    }

    if (String(districtCode) === '0801') {
      return Promise.resolve([
        { id: 221, code: '080101', nameEn: 'Akreiy Ksatr', nameKh: 'អរិយក្សត្រ' },
      ])
    }

    return Promise.resolve([])
  })

  mockFetchVillages.mockImplementation((communeCode) => {
    if (String(communeCode) === '010201') {
      return Promise.resolve([
        { id: 1111, code: '01020101', nameEn: 'Village 1', nameKh: 'ភូមិ១' },
        { id: 1112, code: '01020102', nameEn: 'Village 2', nameKh: 'ភូមិ២' },
      ])
    }

    if (String(communeCode) === '080101') {
      return Promise.resolve([
        { id: 2221, code: '08010101', nameEn: 'Village A', nameKh: 'ភូមិអា' },
      ])
    }

    return Promise.resolve([])
  })

  mockFetchPreschoolStudent.mockResolvedValue(null)
  mockCreatePreschoolStudent.mockResolvedValue({ id: 'student-1' })
  mockUpdatePreschoolStudent.mockResolvedValue({ id: 'student-1' })
})

describe('StudentForm', () => {
  it('renders the new identity and split location fields', async () => {
    const wrapper = mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('Latin Name')
    expect(wrapper.text()).toContain('Nationality')
    expect(wrapper.text()).toContain('Ethnicity')
    expect(wrapper.text()).toContain('Birth Location')
    expect(wrapper.text()).toContain('Current Residence')

    const birthPanel = findPanel(wrapper, 'Birth Location')
    const residencePanel = findPanel(wrapper, 'Current Residence')

    expect(findFieldControl(birthPanel, 'Province').element.tagName).toBe('SELECT')
    expect(findFieldControl(residencePanel, 'Province').element.tagName).toBe('SELECT')
  })

  it('keeps birth and current residence location state independent', async () => {
    const wrapper = mountPage()

    await flushPromises()

    const birthPanel = findPanel(wrapper, 'Birth Location')
    const residencePanel = findPanel(wrapper, 'Current Residence')

    const birthProvince = findFieldControl(birthPanel, 'Province')
    const birthDistrict = findFieldControl(birthPanel, 'District')
    const birthCommune = findFieldControl(birthPanel, 'Commune')
    const birthVillage = findFieldControl(birthPanel, 'Village')
    const residenceProvince = findFieldControl(residencePanel, 'Province')
    const residenceDistrict = findFieldControl(residencePanel, 'District')
    const residenceCommune = findFieldControl(residencePanel, 'Commune')
    const residenceVillage = findFieldControl(residencePanel, 'Village')

    await birthProvince.setValue('1')
    await flushPromises()
    expect(mockFetchDistricts).toHaveBeenCalledWith('01')
    expect(birthDistrict.findAll('option').map((option) => option.text())).toContain('Dangkao')

    await residenceProvince.setValue('2')
    await flushPromises()
    expect(mockFetchDistricts).toHaveBeenCalledWith('08')
    expect(residenceDistrict.findAll('option').map((option) => option.text())).toContain('Khsach Kandal')

    await birthDistrict.setValue('11')
    await flushPromises()
    expect(mockFetchCommunes).toHaveBeenCalledWith('0102')

    await residenceDistrict.setValue('21')
    await flushPromises()
    expect(mockFetchCommunes).toHaveBeenCalledWith('0801')

    await birthCommune.setValue('111')
    await flushPromises()
    expect(mockFetchVillages).toHaveBeenCalledWith('010201')
    expect(birthVillage.findAll('option').map((option) => option.text())).toContain('Village 1')

    expect(residenceProvince.element.value).toBe('2')
    expect(residenceDistrict.element.value).toBe('21')
    expect(residenceCommune.element.value).toBe('')
    expect(residenceVillage.element.value).toBe('')
  })

  it('clears invalid child selections when a parent changes', async () => {
    const wrapper = mountPage()

    await flushPromises()

    const birthPanel = findPanel(wrapper, 'Birth Location')
    const birthProvince = findFieldControl(birthPanel, 'Province')
    const birthDistrict = findFieldControl(birthPanel, 'District')
    const birthCommune = findFieldControl(birthPanel, 'Commune')
    const birthVillage = findFieldControl(birthPanel, 'Village')

    await birthProvince.setValue('1')
    await flushPromises()
    await birthDistrict.setValue('11')
    await flushPromises()
    await birthCommune.setValue('111')
    await flushPromises()
    await birthVillage.setValue('1111')
    await flushPromises()

    expect(birthDistrict.element.value).toBe('11')
    expect(birthCommune.element.value).toBe('111')
    expect(birthVillage.element.value).toBe('1111')

    await birthProvince.setValue('2')
    await flushPromises()

    expect(birthDistrict.element.value).toBe('')
    expect(birthCommune.element.value).toBe('')
    expect(birthVillage.element.value).toBe('')
  })

  it('submits the structured identity and location payload once', async () => {
    const wrapper = mountPage()

    await flushPromises()

    const personalPanel = findPanel(wrapper, 'Personal information')
    const guardianPanel = findPanel(wrapper, 'Guardian contact')
    const birthPanel = findPanel(wrapper, 'Birth Location')
    const residencePanel = findPanel(wrapper, 'Current Residence')

    await findFieldControl(personalPanel, 'First name').setValue('Alice')
    await findFieldControl(personalPanel, 'Last name').setValue('Student')
    await findFieldControl(personalPanel, 'Latin Name').setValue('Alice Student')
    await findFieldControl(personalPanel, 'Nationality').setValue('Cambodia')
    await findFieldControl(personalPanel, 'Ethnicity').setValue('Khmer')
    await findFieldControl(guardianPanel, 'Guardian name').setValue('Sokha')
    await findFieldControl(guardianPanel, 'Guardian phone').setValue('012345678')
    await findFieldControl(guardianPanel, 'Guardian Type').setValue('mother')
    await findFieldControl(birthPanel, 'Province').setValue('1')
    await flushPromises()
    await findFieldControl(birthPanel, 'District').setValue('11')
    await flushPromises()
    await findFieldControl(birthPanel, 'Commune').setValue('111')
    await flushPromises()
    await findFieldControl(birthPanel, 'Village').setValue('1111')
    await flushPromises()
    await findFieldControl(residencePanel, 'Province').setValue('2')
    await flushPromises()
    await findFieldControl(residencePanel, 'District').setValue('21')
    await flushPromises()
    await findFieldControl(residencePanel, 'Commune').setValue('221')
    await flushPromises()
    await findFieldControl(residencePanel, 'Village').setValue('2221')
    await flushPromises()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockCreatePreschoolStudent).toHaveBeenCalledTimes(1)
    expect(mockCreatePreschoolStudent).toHaveBeenCalledWith(expect.objectContaining({
      first_name: 'Alice',
      last_name: 'Student',
      latin_name: 'Alice Student',
      nationality: 'Cambodia',
      ethnicity: 'Khmer',
      guardian_name: 'Sokha',
      guardian_phone: '012345678',
      guardian_type: 'mother',
      birth_province_id: 1,
      birth_district_id: 11,
      birth_commune_id: 111,
      birth_village_id: 1111,
      residence_province_id: 2,
      residence_district_id: 21,
      residence_commune_id: 221,
      residence_village_id: 2221,
    }))
  })

  it('hydrates saved identity and location values in edit mode', async () => {
    mockFetchPreschoolStudent.mockResolvedValueOnce({
      id: 'student-1',
      studentCode: 'ST-1',
      firstName: 'Alice',
      lastName: 'Student',
      latinName: 'Alice Student',
      nationality: 'Cambodia',
      ethnicity: 'Khmer',
      guardianName: 'Sokha',
      guardianPhone: '012345678',
      relationshipType: 'mother',
      birthProvinceId: 1,
      birthDistrictId: 11,
      birthCommuneId: 111,
      birthVillageId: 1111,
      residenceProvinceId: 2,
      residenceDistrictId: 21,
      residenceCommuneId: 221,
      residenceVillageId: 2221,
      avatarUrl: 'https://example.test/avatar.jpg',
      classes: [{ id: 'class-1' }],
    })

    const wrapper = mountWithPlugins(StudentForm, {
      messages: {
        en: enPreschool,
        kh: khPreschool,
      },
      routes: [
        {
          path: '/students/:id/edit',
          name: 'dashboard-preschool-admin-students-edit',
          component: { template: '<div />' },
        },
      ],
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: {
            props: ['title', 'subtitle'],
            template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
          },
          AlertSuccess: {
            props: ['show'],
            template: '<div v-if="show" data-testid="alert-success-stub" />',
          },
          Button: {
            props: ['disabled', 'loading'],
            emits: ['click'],
            template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
          },
          MultiSelect: {
            props: ['modelValue', 'options'],
            template: '<div data-testid="multi-select-stub" />',
          },
        },
      },
    })

    await wrapper.vm.$router.push({ name: 'dashboard-preschool-admin-students-edit', params: { id: 'student-1' } })

    await flushPromises()
    await flushPromises()

    const personalPanel = findPanel(wrapper, 'Personal information')
    const guardianPanel = findPanel(wrapper, 'Guardian contact')
    const birthPanel = findPanel(wrapper, 'Birth Location')
    const residencePanel = findPanel(wrapper, 'Current Residence')

    expect(findFieldControl(personalPanel, 'Latin Name').element.value).toBe('Alice Student')
    expect(findFieldControl(personalPanel, 'Nationality').element.value).toBe('Cambodia')
    expect(findFieldControl(personalPanel, 'Ethnicity').element.value).toBe('Khmer')
    expect(findFieldControl(guardianPanel, 'Guardian Type').element.value).toBe('mother')
    expect(findFieldControl(birthPanel, 'Province').element.value).toBe('1')
    expect(findFieldControl(birthPanel, 'District').element.value).toBe('11')
    expect(findFieldControl(birthPanel, 'Commune').element.value).toBe('111')
    expect(findFieldControl(birthPanel, 'Village').element.value).toBe('1111')
    expect(findFieldControl(residencePanel, 'Province').element.value).toBe('2')
    expect(findFieldControl(residencePanel, 'District').element.value).toBe('21')
    expect(findFieldControl(residencePanel, 'Commune').element.value).toBe('221')
    expect(findFieldControl(residencePanel, 'Village').element.value).toBe('2221')
  })

  it('renders Khmer labels when the locale switches', async () => {
    const wrapper = mountPage()

    await flushPromises()

    wrapper.vm.$i18n.locale = 'kh'
    await flushPromises()

    expect(wrapper.text()).toContain('ឈ្មោះឡាតាំង')
    expect(wrapper.text()).toContain('ទីកន្លែងកំណើត')
    expect(wrapper.text()).toContain('ទីលំនៅបច្ចុប្បន្ន')
  })
})
