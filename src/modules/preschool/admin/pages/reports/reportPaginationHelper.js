// Helper to fetch all pages of data from paginated APIs
// Ensures complete dataset is returned regardless of perPage limits

export async function fetchAllPages(fetchFunction, params = {}) {
  const allItems = []
  let currentPage = 1
  let totalPages = 1

  do {
    const response = await fetchFunction({
      ...params,
      page: currentPage,
      perPage: params.perPage || 100,
    })

    if (response?.items) {
      allItems.push(...response.items)
    }

    // Extract pagination metadata
    if (response?.pagination) {
      totalPages = Number(response.pagination.totalPages || totalPages || 1)
    } else if (!response?.items || response.items.length === 0) {
      // If no items and no pagination metadata, assume we're done
      break
    }

    currentPage += 1
  } while (currentPage <= totalPages)

  return {
    items: allItems,
    pagination: {
      totalPages,
      totalItems: allItems.length,
    },
  }
}
