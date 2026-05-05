const STORAGE_KEY = 'preschool-admin-classes'

const defaultClassRows = [
  {
    id: 'preschool-class-1',
    code: 'PS-NUR-01',
    name: 'Morning Nursery',
    teacher: 'Srey Pov',
    level: 'Nursery',
    schedule: 'Mon-Fri, 8:00 AM',
    students: 18,
    status: 'Active',
    room: 'Room A1',
    notes: '',
  },
  {
    id: 'preschool-class-2',
    code: 'PS-KA-02',
    name: 'Kindergarten A Blue',
    teacher: 'Dara',
    level: 'Kindergarten A',
    schedule: 'Mon-Fri, 9:30 AM',
    students: 22,
    status: 'Active',
    room: 'Room B2',
    notes: '',
  },
  {
    id: 'preschool-class-3',
    code: 'PS-KB-01',
    name: 'Kindergarten B Red',
    teacher: 'Malis',
    level: 'Kindergarten B',
    schedule: 'Mon-Fri, 1:00 PM',
    students: 20,
    status: 'Pending',
    room: 'Room C1',
    notes: '',
  },
  {
    id: 'preschool-class-4',
    code: 'PS-PRE-01',
    name: 'Prep Readiness Group',
    teacher: 'Sokha',
    level: 'Prep',
    schedule: 'Mon-Fri, 2:30 PM',
    students: 16,
    status: 'Active',
    room: 'Room D1',
    notes: '',
  },
  {
    id: 'preschool-class-5',
    code: 'PS-NUR-02',
    name: 'Afternoon Nursery',
    teacher: 'Chanthy',
    level: 'Nursery',
    schedule: 'Mon-Fri, 1:30 PM',
    students: 17,
    status: 'Closed',
    room: 'Room A2',
    notes: '',
  },
  {
    id: 'preschool-class-6',
    code: 'PS-KA-03',
    name: 'Kindergarten A Green',
    teacher: 'Pisey',
    level: 'Kindergarten A',
    schedule: 'Sat, 8:30 AM',
    students: 14,
    status: 'Active',
    room: 'Room B1',
    notes: '',
  },
  {
    id: 'preschool-class-7',
    code: 'PS-KB-02',
    name: 'Kindergarten B Yellow',
    teacher: 'Ratha',
    level: 'Kindergarten B',
    schedule: 'Sat, 10:00 AM',
    students: 15,
    status: 'Pending',
    room: 'Room C2',
    notes: '',
  },
]

function isClient() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }))
}

export function getDefaultClassRows() {
  return cloneRows(defaultClassRows)
}

export function getStoredClassRows() {
  if (!isClient()) return getDefaultClassRows()

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const defaults = getDefaultClassRows()
    saveClassRows(defaults)
    return defaults
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.length) {
      const defaults = getDefaultClassRows()
      saveClassRows(defaults)
      return defaults
    }
    return cloneRows(parsed)
  } catch {
    const defaults = getDefaultClassRows()
    saveClassRows(defaults)
    return defaults
  }
}

export function saveClassRows(rows) {
  if (!isClient()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneRows(rows)))
}

export function findClassRowById(id) {
  const targetId = String(id || '').trim()
  if (!targetId) return null
  return getStoredClassRows().find((row) => String(row.id) === targetId) || null
}

export function upsertClassRow(row) {
  const rows = getStoredClassRows()
  const id = String(row?.id || '').trim() || `preschool-class-${Date.now()}`
  const normalizedRow = {
    notes: '',
    room: '',
    ...row,
    id,
    students: Number(row?.students || 0),
  }

  const index = rows.findIndex((item) => String(item.id) === id)
  if (index >= 0) rows.splice(index, 1, normalizedRow)
  else rows.unshift(normalizedRow)

  saveClassRows(rows)
  return normalizedRow
}

export function removeClassRow(id) {
  const targetId = String(id || '').trim()
  if (!targetId) return getStoredClassRows()

  const rows = getStoredClassRows().filter((row) => String(row.id) !== targetId)
  saveClassRows(rows)
  return rows
}
