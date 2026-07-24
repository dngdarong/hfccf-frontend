const MARKER_START = '[contact-log]'
const MARKER_END = '[/contact-log]'

const FIELD_KEYS = [
  'student',
  'guardian',
  'method',
  'reason',
  'summary',
  'outcome',
  'followUpRequired',
  'followUpDate',
  'priority',
  'staff',
  'sourceEvent'
]

function normalizeText(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

function toDisplayValue(value) {
  const text = normalizeText(value)
  return text || '—'
}

function buildGuardianContactLogMessage(fields = {}, labels = {}, staffName = '') {
  void labels

  const lines = [MARKER_START]

  const values = {
    student: toDisplayValue(fields.student),
    guardian: toDisplayValue(fields.guardian),
    method: toDisplayValue(fields.method),
    reason: toDisplayValue(fields.reason),
    summary: normalizeText(fields.summary),
    outcome: toDisplayValue(fields.outcome),
    followUpRequired: fields.followUpRequired ? 'yes' : 'no',
    followUpDate: toDisplayValue(fields.followUpDate),
    priority: toDisplayValue(fields.priority),
    staff: toDisplayValue(staffName || fields.staff),
    sourceEvent: toDisplayValue(fields.sourceEvent)
  }

  lines.push(`student: ${values.student}`)
  lines.push(`guardian: ${values.guardian}`)
  lines.push(`method: ${values.method}`)
  lines.push(`reason: ${values.reason}`)
  lines.push('summary:')

  if (values.summary) {
    values.summary.split(/\r?\n/).forEach(line => {
      lines.push(line)
    })
  } else {
    lines.push('')
  }

  lines.push(`outcome: ${values.outcome}`)
  lines.push(`followUpRequired: ${values.followUpRequired}`)
  lines.push(`followUpDate: ${values.followUpDate}`)
  lines.push(`priority: ${values.priority}`)
  lines.push(`staff: ${values.staff}`)
  lines.push(`sourceEvent: ${values.sourceEvent}`)
  lines.push(MARKER_END)

  return lines.join('\n')
}

function parseGuardianContactLogMessage(message) {
  const text = normalizeText(message)

  if (!text) {
    return null
  }

  const lines = text.split(/\r?\n/)
  const startIndex = lines.indexOf(MARKER_START)
  const endIndex = lines.lastIndexOf(MARKER_END)

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null
  }

  const result = Object.fromEntries(FIELD_KEYS.map(key => [key, '']))
  let currentKey = null

  for (let index = startIndex + 1; index < endIndex; index += 1) {
    const line = lines[index]
    const separatorIndex = line.indexOf(':')

    if (separatorIndex > -1) {
      const key = line.slice(0, separatorIndex).trim()
      const value = line.slice(separatorIndex + 1).trimStart()

      if (FIELD_KEYS.includes(key)) {
        currentKey = key
        result[key] = value
        continue
      }
    }

    if (currentKey === 'summary') {
      result.summary = result.summary ? `${result.summary}\n${line}` : line
    }
  }

  result.followUpRequired = ['yes', 'true', '1'].includes(result.followUpRequired?.toLowerCase?.() || '')

  return result
}

function isToday(value) {
  if (!value) {
    return false
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function isOverdueFollowUp(item = {}, parsedMessage = null) {
  const followUpRequired = parsedMessage?.followUpRequired || item.followUpRequired
  const followUpDate = parsedMessage?.followUpDate || item.followUpDate
  const status = normalizeText(item.status).toLowerCase()

  if (!followUpRequired || !followUpDate) {
    return false
  }

  const date = new Date(followUpDate)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  return date < today && !['sent', 'acknowledged', 'resolved', 'closed', 'cancelled', 'done'].includes(status)
}

export {
  buildGuardianContactLogMessage,
  isOverdueFollowUp,
  isToday,
  normalizeText,
  parseGuardianContactLogMessage,
  toDisplayValue
}
