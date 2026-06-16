export const PAGE_SIZE = 20

export const DEFAULT_PAGINATION = {
  page: 1,
  perPage: PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

export const DEFAULT_FORM = {
  name: '',
  category: 'supplies',
  quantity: 0,
  condition: 'good',
  notes: '',
}

export const MODAL_MODES = {
  CREATE: 'create',
  EDIT: 'edit',
}

export const RESOURCE_CATEGORIES = {
  BOOKS: 'books',
  TOYS: 'toys',
  EQUIPMENT: 'equipment',
  SUPPLIES: 'supplies',
  DIGITAL: 'digital',
}

export const RESOURCE_CONDITIONS = {
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
}

export const FALLBACK_NOTES = '—'
