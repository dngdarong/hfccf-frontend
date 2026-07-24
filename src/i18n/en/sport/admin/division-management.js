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
    form: {
      editTitle: 'Edit Division',
      createTitle: 'Create New Division',
      editSubtitle: 'Update division details',
      createSubtitle: 'Add a new division to organize teams',
      name: 'Division Name',
      namePlaceholder: 'e.g., Division A, Premier League',
      description: 'Description',
      descriptionPlaceholder: 'Enter division description (optional)',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      saving: 'Saving...',
      update: 'Update Division',
      create: 'Create Division',
      cancel: 'Cancel',
      nameRequired: 'Division name is required',
      nameTooLong: 'Division name must be 100 characters or less',
      saveFailed: 'Failed to save division',
      loadFailed: 'Failed to load division',
    },
  },
}
