export default {
  sportPlayingStyleManagement: {
    title: 'Playing Style Management',
    subtitle: 'Create and manage playing styles to classify team tactics and strategies.',
    addButton: 'Add Style',
    summary: {
      total: {
        title: 'Total Styles',
        badge: '{count} active',
      },
      active: {
        title: 'Active Styles',
        badge: '{rate}%',
      },
      teams: {
        title: 'Teams Using',
        badge: 'Across styles',
      },
    },
    toolbar: {
      label: 'Playing Styles',
      summary: '{count} total',
    },
    table: {
      name: 'Name',
      status: 'Status',
      teams: 'Teams',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      noResults: 'No playing styles yet. Create one to get started.',
    },
    messages: {
      deleteConfirm: 'Are you sure you want to delete "{name}"?',
    },
  },
}
