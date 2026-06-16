import { PAGE_SIZE, FALLBACK_NOTES } from '../constants/classroomResourcesConstants'

export function buildCategoryOptions(t: any) {
  return [
    { label: t('preschoolClassroomResources.categories.books'), value: 'books' },
    { label: t('preschoolClassroomResources.categories.toys'), value: 'toys' },
    { label: t('preschoolClassroomResources.categories.equipment'), value: 'equipment' },
    { label: t('preschoolClassroomResources.categories.supplies'), value: 'supplies' },
    { label: t('preschoolClassroomResources.categories.digital'), value: 'digital' },
  ]
}

export function buildConditionOptions(t: any) {
  return [
    { label: t('preschoolClassroomResources.conditions.good'), value: 'good' },
    { label: t('preschoolClassroomResources.conditions.fair'), value: 'fair' },
    { label: t('preschoolClassroomResources.conditions.poor'), value: 'poor' },
  ]
}

export function buildTableColumns(t: any) {
  return [
    { key: 'number', label: t('preschoolClassroomResources.columns.no'), align: 'left' },
    { key: 'name', label: t('preschoolClassroomResources.columns.name'), align: 'left' },
    { key: 'categoryLabel', label: t('preschoolClassroomResources.columns.category'), align: 'left' },
    { key: 'quantity', label: t('preschoolClassroomResources.columns.quantity'), align: 'left' },
    { key: 'conditionLabel', label: t('preschoolClassroomResources.columns.condition'), align: 'left' },
    { key: 'notes', label: t('preschoolClassroomResources.columns.notes'), align: 'left' },
    { key: 'actions', label: t('preschoolClassroomResources.columns.actions'), align: 'right' },
  ]
}

export function mapResources(resources: any[], t: any, currentPage: number) {
  return resources.map((r, i) => ({
    ...r,
    number: (currentPage - 1) * PAGE_SIZE + i + 1,
    categoryLabel: t(`preschoolClassroomResources.categories.${r.category}`),
    conditionLabel: t(`preschoolClassroomResources.conditions.${r.condition}`),
    notes: r.notes || FALLBACK_NOTES,
  }))
}

export function calculateSummaries(resources: any[]) {
  return {
    total: resources.length,
    good: resources.filter((r) => r.condition === 'good').length,
    attention: resources.filter((r) => r.condition !== 'good').length,
  }
}

export function validateForm(form: any, t: any) {
  if (!form.name.trim()) {
    return { valid: false, error: t('preschoolClassroomResources.messages.nameMissing') }
  }
  if (form.quantity < 0) {
    return { valid: false, error: t('preschoolClassroomResources.messages.quantityInvalid') }
  }
  return { valid: true, error: '' }
}

export function buildPayload(form: any) {
  return {
    name: form.name.trim(),
    category: form.category,
    quantity: form.quantity,
    condition: form.condition,
    notes: form.notes.trim() || null,
  }
}

export function loadResourceFormIntoFormObject(resource: any, form: any) {
  form.name = resource.name
  form.category = resource.category
  form.quantity = resource.quantity
  form.condition = resource.condition
  form.notes = resource.notes === FALLBACK_NOTES ? '' : resource.notes
}

export function resetFormState(form: any) {
  form.name = ''
  form.category = 'supplies'
  form.quantity = 0
  form.condition = 'good'
  form.notes = ''
}

export function extractResourcesFromResponse(response: any) {
  return response?.items ?? []
}

export function extractPaginationFromResponse(response: any, defaultPagination: any) {
  return response?.pagination ?? defaultPagination
}
