export function normalize(value: string | number | undefined | null): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function statusType(status: string | undefined): string {
  const value = normalize(status)
  if (value === 'active') return 'success'
  if (value === 'pending') return 'pending'
  if (value === 'inactive') return 'warning'
  return 'info'
}

export function teamInitials(name: string | undefined): string {
  return (
    String(name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  )
}

export function teamLogoSrc(team: any): string {
  return String(team?.logo || team?.logoUrl || team?.image || '').trim()
}
