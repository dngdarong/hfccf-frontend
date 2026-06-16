function humanizeSegment(segment) {
  return String(segment || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}

function pickFirstTextValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function splitCombinedText(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return { entity: '', context: '' }

  if (raw.includes(' ')) {
    const [entity, ...contextParts] = raw.split(/\s+/)
    const context = contextParts.join(' ').trim()

    if (entity && context) {
      return { entity, context }
    }
  }

  return { entity: raw, context: '' }
}

export function formatAuditCodeFallback(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return '-'

  if (/^\d+$/.test(raw)) return `#${raw}`

  const withoutHash = raw.startsWith('#') ? raw.slice(1).trim() : raw
  if (!withoutHash) return '-'

  if (/^\d+$/.test(withoutHash)) return `#${withoutHash}`
  if (/^[A-Z0-9]+$/.test(withoutHash)) return withoutHash
  if (!/[._-]/.test(withoutHash) && /[A-Z]/.test(withoutHash) && /[a-z]/.test(withoutHash)) return withoutHash

  return withoutHash
    .split('.')
    .map((segment) => humanizeSegment(segment))
    .join(' ')
}

export function splitLifecycleEntityContext(value) {
  if (value && typeof value === 'object') {
    const entity = pickFirstTextValue(value, [
      'entity',
      'entityType',
      'entity_type',
      'entityCode',
      'entity_code',
      'type',
      'code',
      'name',
      'label',
    ])

    const context = pickFirstTextValue(value, [
      'context',
      'contextLabel',
      'context_label',
      'contextCode',
      'context_code',
      'entityId',
      'entity_id',
      'id',
      'value',
    ])

    if (entity && !context) {
      const split = splitCombinedText(entity)
      if (split.context) {
        return split
      }
    }

    if (context && !entity) {
      const split = splitCombinedText(context)
      if (split.context) {
        return split
      }
    }

    if (entity || context) {
      return {
        entity: entity || '',
        context: context || '',
      }
    }
  }

  const raw = String(value ?? '').trim()
  if (!raw) {
    return { entity: '', context: '' }
  }

  return splitCombinedText(raw)
}

function hasLocaleKey(te, key) {
  return typeof te === 'function' && te(key)
}

function actionKeyCandidates(raw) {
  const candidates = [`preschoolLifecycleAuditPage.actions.${raw}`]

  if (!raw.includes('.') && raw.includes('_')) {
    const lastUnderscore = raw.lastIndexOf('_')
    if (lastUnderscore > 0 && lastUnderscore < raw.length - 1) {
      candidates.push(`preschoolLifecycleAuditPage.actions.${raw.slice(0, lastUnderscore)}.${raw.slice(lastUnderscore + 1)}`)
    }
  }

  return candidates
}

export function resolveLifecycleActionLabel(t, action, te) {
  const raw = String(action ?? '').trim()
  if (!raw) return '-'

  for (const key of actionKeyCandidates(raw)) {
    if (hasLocaleKey(te, key)) {
      return t(key)
    }
  }

  return formatAuditCodeFallback(raw)
}

export function resolveLifecycleEntityLabel(t, entity, te) {
  const { entity: raw } = splitLifecycleEntityContext(entity)
  if (!raw) return '-'

  const key = `preschoolLifecycleAuditPage.entities.${raw}`
  if (typeof te === 'function' && te(key)) {
    return t(key)
  }

  return formatAuditCodeFallback(raw)
}

function normalizeContextKey(value) {
  return String(value ?? '')
    .trim()
    .replace(/^#/, '')
    .replace(/[._-]+/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

export function resolveLifecycleContextLabel(t, context, te) {
  const { context: rawContext, entity: entityFallback } = splitLifecycleEntityContext(context)
  const raw = rawContext || entityFallback
  if (!raw) return '-'

  const key = `preschoolLifecycleAuditPage.contexts.${normalizeContextKey(raw)}`
  if (typeof te === 'function' && te(key)) {
    return t(key)
  }

  return formatAuditCodeFallback(raw)
}
