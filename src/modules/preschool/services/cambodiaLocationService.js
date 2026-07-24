import http from '@/services/http'
import { unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeLocationRow(row = {}) {
  return {
    id: row.id ?? row.location_id ?? null,
    code: normalizeText(row.code || row.location_code),
    nameKh: normalizeText(row.nameKh || row.name_kh),
    nameEn: normalizeText(row.nameEn || row.name_en),
    provinceId: row.provinceId ?? row.province_id ?? null,
    districtId: row.districtId ?? row.district_id ?? null,
    communeId: row.communeId ?? row.commune_id ?? null,
  }
}

export function getLocationDisplayName(item = {}, locale = 'kh') {
  const nextLocale = String(locale || '').toLowerCase() === 'en' ? 'en' : 'kh'

  if (nextLocale === 'en') {
    return normalizeText(item.nameEn || item.name_en || item.nameKh || item.name_kh || item.code)
  }

  return normalizeText(item.nameKh || item.name_kh || item.nameEn || item.name_en || item.code)
}

function normalizeLocationList(response) {
  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : []

  return items.map(normalizeLocationRow)
}

function buildCacheLoader() {
  let cachedItems = null
  let cachedPromise = null

  return async (factory) => {
    if (cachedItems) return cachedItems
    if (!cachedPromise) {
      cachedPromise = factory()
        .then((items) => {
          cachedItems = items
          return items
        })
        .catch((error) => {
          cachedPromise = null
          throw error
        })
    }

    return cachedPromise
  }
}

const loadProvincesFromApi = buildCacheLoader()
const districtLoaders = new Map()
const communeLoaders = new Map()
const villageLoaders = new Map()

function loaderFor(cache, key) {
  if (!cache.has(key)) {
    cache.set(key, buildCacheLoader())
  }

  return cache.get(key)
}

export async function fetchProvinces() {
  return loadProvincesFromApi(async () => {
    const response = await http.get('/locations/provinces')
    return normalizeLocationList(response)
  })
}

export async function fetchDistricts(provinceCode) {
  const code = normalizeText(provinceCode)
  if (!code) return []

  const loadDistricts = loaderFor(districtLoaders, code)

  return loadDistricts(async () => {
    const response = await http.get('/locations/districts', {
      params: { province_code: code },
    })
    return normalizeLocationList(response)
  })
}

export async function fetchCommunes(districtCode) {
  const code = normalizeText(districtCode)
  if (!code) return []

  const loadCommunes = loaderFor(communeLoaders, code)

  return loadCommunes(async () => {
    const response = await http.get('/locations/communes', {
      params: { district_code: code },
    })
    return normalizeLocationList(response)
  })
}

export async function fetchVillages(communeCode) {
  const code = normalizeText(communeCode)
  if (!code) return []

  const loadVillages = loaderFor(villageLoaders, code)

  return loadVillages(async () => {
    const response = await http.get('/locations/villages', {
      params: { commune_code: code },
    })
    return normalizeLocationList(response)
  })
}

function resolveAddressPart(value, locale = 'kh') {
  if (value && typeof value === 'object') {
    return getLocationDisplayName(value, locale)
  }

  return normalizeText(value)
}

export function buildLocationAddress(source = {}, locale = 'kh') {
  const village = resolveAddressPart(source.village, locale)
  const commune = resolveAddressPart(source.commune, locale)
  const district = resolveAddressPart(source.district, locale)
  const province = resolveAddressPart(source.province, locale)
  const structuredParts = [village, commune, district, province].filter(Boolean)

  if (structuredParts.length) {
    return structuredParts.join(', ')
  }

  return normalizeText(source.address)
}
