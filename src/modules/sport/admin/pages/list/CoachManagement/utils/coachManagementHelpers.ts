export function normalize(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function filterCoaches(
  coaches: any[],
  searchQuery: string,
  roleFilter: string,
  statusFilter: string,
): any[] {
  const query = normalize(searchQuery)

  return coaches.filter((user) => {
    let isMatch = true

    if (query) {
      const haystack = `${user.name} ${user.email} ${user.role} ${user.permissions.join(' ')}`.toLowerCase()
      isMatch = haystack.includes(query)
    }

    if (isMatch && roleFilter) {
      isMatch = normalize(user.role) === normalize(roleFilter)
    }

    if (isMatch && statusFilter) {
      isMatch = normalize(user.status) === normalize(statusFilter)
    }

    return isMatch
  })
}

export function getPaginatedCoaches(coaches: any[], currentPage: number, pageSize: number): any[] {
  const start = (currentPage - 1) * pageSize
  return coaches.slice(start, start + pageSize).map((user, index) => ({
    ...user,
    rowNumber: start + index + 1,
  }))
}

export function calculateCoachMetrics(coaches: any[]) {
  const totalCoaches = coaches.length
  const activeCount = coaches.filter((user) => normalize(user.status) === 'active').length
  const pendingCount = coaches.filter((user) => normalize(user.status) === 'pending').length
  const attentionCount = coaches.filter((user) =>
    ['inactive', 'suspended'].includes(normalize(user.status)),
  ).length

  return {
    totalCoaches,
    activeCount,
    pendingCount,
    attentionCount,
    activeRate: totalCoaches ? `${Math.round((activeCount / totalCoaches) * 100)}%` : '0%',
  }
}

export function getHighlightItems(coaches: any[], pendingCount: number, attentionCount: number, t: any) {
  return [
    {
      label: t('sportCoachManagement.highlights.visibleRoster'),
      value: coaches.length,
    },
    {
      label: t('sportCoachManagement.highlights.pendingReview'),
      value: pendingCount,
    },
    {
      label: t('sportCoachManagement.highlights.attentionItems'),
      value: attentionCount,
    },
  ]
}
