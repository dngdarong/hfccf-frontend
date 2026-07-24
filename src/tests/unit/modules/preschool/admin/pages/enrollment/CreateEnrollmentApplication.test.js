import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import CreateEnrollmentApplication from '@/modules/preschool/admin/pages/enrollment/CreateEnrollmentApplication.vue'
import { preschoolRoutes } from '@/modules/preschool/routes'

const mockCreateEnrollment = vi.fn()
const mockFetchAcademicLifecycle = vi.fn()
const mockHttpGet = vi.fn()
const mockFetchProvinces = vi.fn()
const mockFetchDistricts = vi.fn()
const mockFetchCommunes = vi.fn()
const mockFetchVillages = vi.fn()
const mockToastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: mockToastAdd,
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolEnrollmentApi', () => ({
  createEnrollment: (...args) => mockCreateEnrollment(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolAcademicLifecycleApi', () => ({
  fetchAcademicLifecycle: (...args) => mockFetchAcademicLifecycle(...args),
}))

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
  },
}))

vi.mock('@/services/api', () => ({
  unwrapApiData: (response) => response?.data ?? response,
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
  buildLocationAddress: (source = {}) => {
    const parts = [source.village, source.commune, source.district, source.province].filter(Boolean)
    return parts.length ? parts.join(', ') : String(source.address || '').trim()
  },
}))

function mountPage() {
  return mountWithPlugins(CreateEnrollmentApplication, {
    messages: {
      en: enPreschool,
    },
    routes: [
      {
        path: '/module/preschool-admin/enrollments',
        name: 'dashboard-preschool-admin-enrollments',
        component: { template: '<div />' },
      },
      {
        path: '/module/preschool-admin/enrollments/create',
        name: 'dashboard-preschool-admin-enrollments-create',
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
        Button: {
          emits: ['click'],
          template: '<button @click="$emit(\'click\')"><slot /></button>',
        },
        Toast: { template: '<div data-testid="toast-stub" />' },
      },
    },
  })
}

async function flushAll() {
  await flushPromises()
  await flushPromises()
  await flushPromises()
  await flushPromises()
  await flushPromises()
  await flushPromises()
}

function findById(wrapper, id) {
  const node = wrapper.find(`#${id}`)
  expect(node.exists(), `missing element #${id}`).toBe(true)
  return node
}

async function waitForSelect(wrapper, id, minOptions = 2) {
  for (let index = 0; index < 10; index += 1) {
    await flushAll()
    const select = findById(wrapper, id)
    if (select.findAll('option').length >= minOptions) {
      return select
    }
  }

  return findById(wrapper, id)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockToastAdd.mockClear()

  mockCreateEnrollment.mockResolvedValue({ id: 'enrollment-1' })
  mockFetchAcademicLifecycle.mockResolvedValue({
    academicYears: [
      { id: 'ay-1', label: '2026-2027' },
    ],
    terms: [
      { id: 'term-1', name: 'Term 1' },
    ],
  })
  mockHttpGet.mockResolvedValue({
    data: [
      { id: 'class-1', name: 'Morning Stars' },
    ],
  })
  mockFetchProvinces.mockResolvedValue([
    { id: '1', code: '01', nameEn: 'Phnom Penh', nameKh: 'ភ្នំពេញ' },
    { id: '2', code: '02', nameEn: 'Kandal', nameKh: 'កណ្តាល' },
  ])
  mockFetchDistricts.mockImplementation((provinceCode) => {
    if (String(provinceCode) === '01') {
      return Promise.resolve([
        { id: '11', code: '0101', nameEn: 'Chamkarmon', nameKh: 'ចំការមន' },
      ])
    }

    if (String(provinceCode) === '02') {
      return Promise.resolve([
        { id: '21', code: '0201', nameEn: 'Sang', nameKh: 'ស្អាង' },
      ])
    }

    return Promise.resolve([])
  })
  mockFetchCommunes.mockImplementation((districtCode) => {
    if (String(districtCode) === '0101') {
      return Promise.resolve([
        { id: '111', code: '010101', nameEn: 'Tonle Bassac', nameKh: 'ទន្លេបាសាក់' },
      ])
    }

    if (String(districtCode) === '0201') {
      return Promise.resolve([
        { id: '211', code: '020101', nameEn: 'Prey Nup', nameKh: 'ព្រៃនប់' },
      ])
    }

    return Promise.resolve([])
  })
  mockFetchVillages.mockImplementation((communeCode) => {
    if (String(communeCode) === '010101') {
      return Promise.resolve([
        { id: '1111', code: '01010101', nameEn: 'Village 1', nameKh: 'ភូមិ១' },
      ])
    }

    if (String(communeCode) === '020101') {
      return Promise.resolve([
        { id: '2111', code: '02010101', nameEn: 'Village A', nameKh: 'ភូមិ អា' },
      ])
    }

    return Promise.resolve([])
  })
})

describe('CreateEnrollmentApplication', () => {
  it('registers the create enrollment route', () => {
    expect(
      preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-enrollments-create'),
    ).toBe(true)
  })

  it('renders the redesigned student information sections', async () => {
    const wrapper = mountPage()

    await flushAll()

    expect(wrapper.text()).toContain('New Enrollment Application')
    expect(wrapper.text()).toContain('Student Information')
    expect(wrapper.text()).toContain('Identity Information')
    expect(wrapper.text()).toContain('Birth Location')
    expect(wrapper.text()).toContain('Current Residence')
    expect(wrapper.text()).toContain('Enrollment Request')
    expect(wrapper.text()).toContain('Guardian Information')
    expect(wrapper.text()).toContain('Guardian Location')
    expect(wrapper.text()).toContain('Authorization')
    expect(wrapper.text()).toContain('Back to Enrollments')
    expect(findById(wrapper, 'enr-birth-province').exists()).toBe(true)
    expect(findById(wrapper, 'enr-residence-province').exists()).toBe(true)
    expect(findById(wrapper, 'enr-guardian-province').exists()).toBe(true)
  })

  it('submits structured student and guardian location payloads', async () => {
    const wrapper = mountPage()

    await flushAll()

    await findById(wrapper, 'enr-first-name').setValue('Sok')
    await findById(wrapper, 'enr-last-name').setValue('Chan')
    await findById(wrapper, 'enr-latin-name').setValue('Sok Chan')
    await findById(wrapper, 'enr-gender').setValue('male')
    await findById(wrapper, 'enr-date-of-birth').setValue('2019-05-02')
    await findById(wrapper, 'enr-nationality').setValue('Cambodian')
    await findById(wrapper, 'enr-ethnicity').setValue('Khmer')

    const formWrapper = wrapper.findComponent({ name: 'EnrollmentApplicationForm' })
    formWrapper.vm.form.birth_province_id = '1'
    await flushAll()
    formWrapper.vm.form.birth_district_id = '11'
    await flushAll()
    formWrapper.vm.form.birth_commune_id = '111'
    await flushAll()
    formWrapper.vm.form.birth_village_id = '1111'
    await flushAll()
    formWrapper.vm.form.residence_province_id = '2'
    await flushAll()
    formWrapper.vm.form.residence_district_id = '21'
    await flushAll()
    formWrapper.vm.form.residence_commune_id = '211'
    await flushAll()
    formWrapper.vm.form.residence_village_id = '2111'
    await flushAll()

    await findById(wrapper, 'enr-guardian-name').setValue('Sokha')
    await findById(wrapper, 'enr-guardian-type').setValue('father')
    await findById(wrapper, 'enr-guardian-phone').setValue('012345678')
    await findById(wrapper, 'enr-guardian-email').setValue('sokha@example.test')

    const guardianProvince = await waitForSelect(wrapper, 'enr-guardian-province')
    await guardianProvince.setValue(guardianProvince.findAll('option').at(1).element.value)
    await flushAll()
    const guardianDistrict = await waitForSelect(wrapper, 'enr-guardian-district')
    await guardianDistrict.setValue(guardianDistrict.findAll('option').at(1).element.value)
    await flushAll()
    const guardianCommune = await waitForSelect(wrapper, 'enr-guardian-commune')
    await guardianCommune.setValue(guardianCommune.findAll('option').at(1).element.value)
    await flushAll()
    const guardianVillage = await waitForSelect(wrapper, 'enr-guardian-village')
    await guardianVillage.setValue(guardianVillage.findAll('option').at(1).element.value)
    await flushAll()

    await wrapper.find('form').trigger('submit.prevent')
    await flushAll()

    expect(mockCreateEnrollment).toHaveBeenCalledWith(expect.objectContaining({
      first_name: 'Sok',
      last_name: 'Chan',
      latin_name: 'Sok Chan',
      khmer_name: 'Sok Chan',
      gender: 'male',
      date_of_birth: '2019-05-02',
      nationality: 'Cambodian',
      ethnicity: 'Khmer',
      birth_province_id: 1,
      birth_district_id: 11,
      birth_commune_id: 111,
      birth_village_id: 1111,
      residence_province_id: 2,
      residence_district_id: 21,
      residence_commune_id: 211,
      residence_village_id: 2111,
      guardian_name: 'Sokha',
      guardian_relationship: 'father',
      guardian_phone: '012345678',
      guardian_email: 'sokha@example.test',
      guardian_address: 'Village 1, Tonle Bassac, Chamkarmon, Phnom Penh',
    }))
    expect(mockCreateEnrollment.mock.calls[0][0].province_code).toBeUndefined()
    expect(mockCreateEnrollment.mock.calls[0][0].district_code).toBeUndefined()
    expect(mockCreateEnrollment.mock.calls[0][0].commune_code).toBeUndefined()
    expect(mockCreateEnrollment.mock.calls[0][0].village_code).toBeUndefined()
    expect(wrapper.vm.$router.currentRoute.value.name).toBe('dashboard-preschool-admin-enrollments')
  })

  it('shows server validation errors through the form contract', async () => {
    mockCreateEnrollment.mockRejectedValueOnce({
      validationErrors: {
        first_name: 'Given name is required.',
      },
    })

    const wrapper = mountPage()

    await flushAll()

    await findById(wrapper, 'enr-first-name').setValue('Sok')
    await findById(wrapper, 'enr-last-name').setValue('Chan')
    await findById(wrapper, 'enr-guardian-name').setValue('Sokha')
    await findById(wrapper, 'enr-guardian-type').setValue('father')
    await findById(wrapper, 'enr-guardian-phone').setValue('012345678')
    const guardianProvince = await waitForSelect(wrapper, 'enr-guardian-province')
    await guardianProvince.setValue(guardianProvince.findAll('option').at(1).element.value)
    await flushAll()
    const guardianDistrict = await waitForSelect(wrapper, 'enr-guardian-district')
    await guardianDistrict.setValue(guardianDistrict.findAll('option').at(1).element.value)
    await flushAll()
    const guardianCommune = await waitForSelect(wrapper, 'enr-guardian-commune')
    await guardianCommune.setValue(guardianCommune.findAll('option').at(1).element.value)
    await flushAll()
    const guardianVillage = await waitForSelect(wrapper, 'enr-guardian-village')
    await guardianVillage.setValue(guardianVillage.findAll('option').at(1).element.value)
    await flushAll()
    await wrapper.find('form').trigger('submit.prevent')
    await flushAll()

    expect(wrapper.text()).toContain('Given name is required.')
  })

  it('submits a custom relationship when other guardian type is selected', async () => {
    const wrapper = mountPage()

    await flushAll()

    await findById(wrapper, 'enr-guardian-name').setValue('Sokha')
    await findById(wrapper, 'enr-guardian-type').setValue('other')
    await flushAll()
    await findById(wrapper, 'enr-guardian-type-other').setValue('Uncle')
    await findById(wrapper, 'enr-guardian-phone').setValue('012345678')
    await findById(wrapper, 'enr-first-name').setValue('Sok')
    await findById(wrapper, 'enr-last-name').setValue('Chan')
    const guardianProvince = await waitForSelect(wrapper, 'enr-guardian-province')
    await guardianProvince.setValue(guardianProvince.findAll('option').at(1).element.value)
    await flushAll()
    const guardianDistrict = await waitForSelect(wrapper, 'enr-guardian-district')
    await guardianDistrict.setValue(guardianDistrict.findAll('option').at(1).element.value)
    await flushAll()
    const guardianCommune = await waitForSelect(wrapper, 'enr-guardian-commune')
    await guardianCommune.setValue(guardianCommune.findAll('option').at(1).element.value)
    await flushAll()
    const guardianVillage = await waitForSelect(wrapper, 'enr-guardian-village')
    await guardianVillage.setValue(guardianVillage.findAll('option').at(1).element.value)
    await flushAll()
    await findById(wrapper, 'enr-guardian-type-other').setValue('Uncle')
    await flushAll()

    await wrapper.find('form').trigger('submit.prevent')
    await flushAll()

    expect(mockCreateEnrollment).toHaveBeenCalledWith(expect.objectContaining({
      guardian_relationship: 'Uncle',
    }))
  })

  it('navigates back when cancel is clicked', async () => {
    const wrapper = mountPage()

    await flushAll()

    await wrapper.find('button.enr-app-btn--cancel').trigger('click')
    await flushAll()

    expect(wrapper.vm.$router.currentRoute.value.name).toBe('dashboard-preschool-admin-enrollments')
  })
})
