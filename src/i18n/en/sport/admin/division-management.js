export default {
  sportDivisionManagement: {
    title: 'Division Management',
    subtitle: 'Create and manage divisions to organize teams within the sport program.',
    addButton: 'Add Division',
    summary: {
      total: {
        title: 'Total Divisions',
        badge: '{count} active',
      },
      active: {
        title: 'Active Divisions',
        badge: '{rate}%',
      },
      teams: {
        title: 'Teams Assigned',
        badge: 'Across divisions',
      },
    },
    toolbar: {
      label: 'Divisions',
      summary: '{count} total',
    },
    table: {
      name: 'Name',
      status: 'Status',
      teams: 'Teams',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      noResults: 'No divisions yet. Create one to get started.',
    },
    messages: {
      deleteConfirm: 'Are you sure you want to delete "{name}"?',
    },
  },
}
