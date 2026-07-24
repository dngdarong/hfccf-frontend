import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import EnrollmentApplicationDialog from '@/modules/preschool/admin/components/enrollment/EnrollmentApplicationDialog.vue'

const mockFetchProvinces = vi.fn()
const mockFetchDistricts = vi.fn()
const mockFetchCommunes = vi.fn()
const mockFetchVillages = vi.fn()

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

function mountDialog(props = {}) {
  return mountWithPlugins(EnrollmentApplicationDialog, {
    messages: {
      en: enPreschool,
    },
    props: {
      visible: true,
      academicYears: [],
      terms: [],
      classes: [],
      loading: false,
      readonly: false,
      application: null,
      ...props,
    },
    global: {
      stubs: {
        Teleport: true,
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

async function waitForSelectValue(wrapper, id, expectedValue) {
  for (let index = 0; index < 10; index += 1) {
    await flushAll()
    const select = findById(wrapper, id)
    if (select.element.value === expectedValue) {
      return select
    }
  }

  return findById(wrapper, id)
}

beforeEach(() => {
  vi.clearAllMocks()

  mockFetchProvinces.mockResolvedValue([
    { id: '1', code: '01', nameEn: 'Phnom Penh', nameKh: 'ភ្នំពេញ' },
    { id: '2', code: '02', nameEn: 'Kandal', nameKh: 'កណ្តាល' },
  ])
  mockFetchDistricts.mockImplementation((provinceCode) => {
    if (String(provinceCode) === '01') {
      return Promise.resolve([
        { id: '11', code: '0101', nameEn: 'Dangkao', nameKh: 'ដង្កោ' },
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
        { id: '1111', code: '01010101', nameEn: 'Village 1', nameKh: 'ភូមិ ១' },
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

describe('EnrollmentApplicationDialog', () => {
  it('shows and clears the other guardian type detail field', async () => {
    const wrapper = mountDialog()

    await flushAll()

    const guardianType = findById(wrapper, 'enr-guardian-type')
    await guardianType.setValue('other')
    await flushAll()

    expect(wrapper.text()).toContain('Other Guardian Type')

    const detailInput = wrapper.find('input[placeholder="Enter guardian type, e.g. Aunt, Uncle"]')
    expect(detailInput.exists()).toBe(true)
    await detailInput.setValue('Aunt')
    await guardianType.setValue('father')
    await flushAll()

    expect(wrapper.text()).not.toContain('Other Guardian Type')
    await guardianType.setValue('other')
    await flushAll()
    expect(wrapper.find('input[placeholder="Enter guardian type, e.g. Aunt, Uncle"]').element.value).toBe('')
  })

  it('cascades guardian location selections and emits a normalized payload', async () => {
    const wrapper = mountDialog()

    await flushAll()

    await findById(wrapper, 'enr-first-name').setValue('Sok')
    await findById(wrapper, 'enr-last-name').setValue('Chan')
    await findById(wrapper, 'enr-guardian-name').setValue('Sokha')
    await findById(wrapper, 'enr-guardian-type').setValue('father')
    await findById(wrapper, 'enr-guardian-phone').setValue('012345678')
    await findById(wrapper, 'enr-guardian-email').setValue('sokha@example.test')

    const provinceSelect = await waitForSelect(wrapper, 'enr-guardian-province')
    await provinceSelect.setValue(provinceSelect.findAll('option').at(1).element.value)
    await flushAll()
    const districtSelect = await waitForSelect(wrapper, 'enr-guardian-district')
    await districtSelect.setValue(districtSelect.findAll('option').at(1).element.value)
    await flushAll()
    const communeSelect = await waitForSelect(wrapper, 'enr-guardian-commune')
    await communeSelect.setValue(communeSelect.findAll('option').at(1).element.value)
    await flushAll()
    const villageSelect = await waitForSelect(wrapper, 'enr-guardian-village')
    await villageSelect.setValue(villageSelect.findAll('option').at(1).element.value)
    await flushAll()

    await wrapper.find('form').trigger('submit.prevent')
    await flushAll()

    const emitted = wrapper.emitted('save')
    expect(emitted).toHaveLength(1)
    expect(emitted[0][0]).toMatchObject({
      guardian_name: 'Sokha',
      guardian_relationship: 'father',
      guardian_phone: '012345678',
      guardian_email: 'sokha@example.test',
      guardian_address: 'Village 1, Tonle Bassac, Dangkao, Phnom Penh',
    })
    expect(emitted[0][0].province_code).toBeUndefined()
    expect(emitted[0][0].district_code).toBeUndefined()
    expect(emitted[0][0].commune_code).toBeUndefined()
    expect(emitted[0][0].village_code).toBeUndefined()
  })

  it('shows validation messages from the parent and backend-safe location errors', async () => {
    const wrapper = mountDialog({
      validationErrors: {
        guardian_name: 'Guardian name is required.',
      },
    })

    await flushAll()

    expect(wrapper.text()).toContain('Guardian name is required.')

    mockFetchProvinces.mockRejectedValueOnce(new Error('Failed to load location data.'))
    const failingWrapper = mountDialog()
    await flushAll()
    expect(failingWrapper.text()).toContain('Failed to load location data.')
  })

  it('hydrates structured location values and preserves legacy address text', async () => {
    const wrapper = mountDialog({
      application: {
        guardianName: 'Sokha',
        guardianPhone: '012345678',
        guardianAddress: 'Legacy Address 12',
        guardianProvince: '01',
        guardianDistrict: '0101',
        guardianCommune: '010101',
        guardianVillage: '01010101',
        guardianRelationship: 'father',
      },
    })

    await flushAll()

    await flushAll()
    await waitForSelectValue(wrapper, 'enr-guardian-province', 'Phnom Penh')
    await waitForSelectValue(wrapper, 'enr-guardian-district', 'Dangkao')
    await waitForSelectValue(wrapper, 'enr-guardian-commune', 'Tonle Bassac')
    await waitForSelectValue(wrapper, 'enr-guardian-village', 'Village 1')
    expect(wrapper.text()).toContain('Legacy Address 12')
  })
})
