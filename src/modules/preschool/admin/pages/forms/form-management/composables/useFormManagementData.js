import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { useFormManagementActions } from './useFormManagementActions'
import {
  FORM_MANAGEMENT_HERO_LINK_DEFINITIONS,
  FORM_MANAGEMENT_OVERVIEW_METRIC_DEFINITIONS,
  FORM_MANAGEMENT_QUICK_ACTION_DEFINITIONS,
  FORM_MANAGEMENT_RESOURCE_DEFINITIONS,
  FORM_MANAGEMENT_ROUTE_NAMES,
  FORM_MANAGEMENT_WORKFLOW_STEP_DEFINITIONS,
} from '../../formManagementData'

function safeText(t, te, key, fallback) {
  return te(key) ? t(key) : fallback
}

function mapDefinitions(definitions, mapper) {
  return definitions.map(mapper)
}

export function useFormManagementData() {
  const { t, te } = useLanguage()
  const actions = useFormManagementActions()

  const hero = computed(() => ({
    eyebrow: safeText(t, te, 'preschoolScaffold.formManagement.eyebrow', 'Forms overview'),
    title: safeText(t, te, 'preschoolScaffold.formManagement.title', 'Forms Overview'),
    description: safeText(
      t,
      te,
      'preschoolScaffold.formManagement.description',
      'Manage the launch points for the forms overview, template library, builder, submissions, and review tools.',
    ),
    metaLabel: safeText(t, te, 'preschoolScaffold.formManagement.hero.metricForms', 'Launcher ready'),
    metaNote: safeText(
      t,
      te,
      'preschoolScaffold.formManagement.pages.overview.summary',
      'Choose a section below to open the overview, template library, builder, or review workspace.',
    ),
    quickLinks: mapDefinitions(FORM_MANAGEMENT_HERO_LINK_DEFINITIONS, (definition) => ({
      icon: definition.icon,
      label: safeText(t, te, definition.titleKey, definition.titleFallback),
      action: {
        [FORM_MANAGEMENT_ROUTE_NAMES.manage]: actions.goToManageTemplates,
        [FORM_MANAGEMENT_ROUTE_NAMES.build]: actions.goToBuildForm,
        [FORM_MANAGEMENT_ROUTE_NAMES.review]: actions.goToReviewForms,
      }[definition.routeName],
    })),
  }))

  const overviewMetrics = computed(() =>
    mapDefinitions(FORM_MANAGEMENT_OVERVIEW_METRIC_DEFINITIONS, (definition) => ({
      description: safeText(t, te, definition.descriptionKey, definition.descriptionFallback),
      icon: definition.icon,
      title: safeText(t, te, definition.titleKey, definition.titleFallback),
    })),
  )

  const quickActions = computed(() =>
    mapDefinitions(FORM_MANAGEMENT_QUICK_ACTION_DEFINITIONS, (definition) => ({
      description: safeText(t, te, definition.descriptionKey, definition.descriptionFallback),
      icon: definition.icon,
      title: safeText(t, te, definition.titleKey, definition.titleFallback),
      to: { name: definition.routeName },
    })),
  )

  const workflowSteps = computed(() =>
    mapDefinitions(FORM_MANAGEMENT_WORKFLOW_STEP_DEFINITIONS, (definition) => ({
      description: safeText(t, te, definition.descriptionKey, definition.descriptionFallback),
      icon: definition.icon,
      title: safeText(t, te, definition.titleKey, definition.titleFallback),
    })),
  )

  const resourceLinks = computed(() =>
    mapDefinitions(FORM_MANAGEMENT_RESOURCE_DEFINITIONS, (definition) => ({
      description: safeText(t, te, definition.descriptionKey, definition.descriptionFallback),
      icon: definition.icon,
      title: safeText(t, te, definition.titleKey, definition.titleFallback),
      to: { name: definition.routeName },
    })),
  )

  const sectionHeaders = computed(() => ({
    overview: {
      eyebrow: safeText(t, te, 'preschoolScaffold.formManagement.pages.overview.eyebrow', 'Overview metrics'),
      title: safeText(t, te, 'preschoolScaffold.formManagement.pages.overview.title', 'Overview metrics'),
      description: safeText(
        t,
        te,
        'preschoolScaffold.formManagement.pages.overview.description',
        'A static snapshot of the template lifecycle for quick orientation.',
      ),
    },
    quickActions: {
      eyebrow: safeText(t, te, 'preschoolScaffold.formManagement.pages.quickActions.eyebrow', 'Quick actions'),
      title: safeText(t, te, 'preschoolScaffold.formManagement.pages.quickActions.title', 'Quick actions'),
      description: safeText(
        t,
        te,
        'preschoolScaffold.formManagement.pages.quickActions.description',
        'Jump into the core Preschool forms tasks without extra navigation.',
      ),
    },
    workflow: {
      eyebrow: safeText(t, te, 'preschoolScaffold.formManagement.pages.workflow.eyebrow', 'Workflow'),
      title: safeText(t, te, 'preschoolScaffold.formManagement.pages.workflow.title', 'Workflow'),
      description: safeText(
        t,
        te,
        'preschoolScaffold.formManagement.pages.workflow.description',
        'Follow the current form lifecycle from creation through review.',
      ),
    },
    resources: {
      eyebrow: safeText(t, te, 'preschoolScaffold.formManagement.pages.resources.eyebrow', 'Resources'),
      title: safeText(t, te, 'preschoolScaffold.formManagement.pages.resources.title', 'Resources'),
      description: safeText(
        t,
        te,
        'preschoolScaffold.formManagement.pages.resources.description',
        'Open related reporting and audit destinations.',
      ),
    },
  }))

  return {
    hero,
    overviewMetrics,
    quickActions,
    resourceLinks,
    sectionHeaders,
    workflowSteps,
  }
}
