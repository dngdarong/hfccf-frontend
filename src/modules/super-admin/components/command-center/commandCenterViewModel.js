export function translateKey(t, te, key, fallback = '') {
  if (!key) return fallback

  // Check existence first so missing locale entries do not emit runtime warnings.
  if (typeof te === 'function' && !te(key)) return fallback

  const resolved = t(key)
  return resolved !== key ? resolved : fallback
}

function mapSummaryCards(t, te, cards = []) {
  return cards.map((card) => ({
    ...card,
    title: translateKey(t, te, card.titleKey, card.titleFallback),
    label: translateKey(t, te, card.labelKey, card.labelFallback),
    trend: translateKey(t, te, card.trendKey, card.trendFallback),
    actionLabel: translateKey(t, te, card.actionLabelKey, card.actionLabelFallback),
    statusLabel: translateKey(t, te, `commandCenter.statusLevels.${card.status}`, card.status),
  }))
}

function mapPriorityActions(t, te, actions = []) {
  return actions.map((action) => ({
    ...action,
    title: translateKey(t, te, action.titleKey, action.titleFallback),
    priorityLabel: translateKey(t, te, action.priorityLabelKey, action.priorityLabelFallback),
    dueLabel: translateKey(t, te, action.dueLabelKey, action.dueLabelFallback),
    actionLabel: translateKey(t, te, action.actionLabelKey, action.actionLabelFallback),
  }))
}

function mapDepartmentHealth(t, te, departments = []) {
  return departments.map((department) => ({
    ...department,
    name: translateKey(t, te, department.nameKey, department.nameFallback),
    statusLabel: translateKey(t, te, department.statusLabelKey, department.statusLabelFallback),
    reportingLabel: translateKey(t, te, department.reportingLabelKey, department.reportingLabelFallback),
    actionLabel: translateKey(t, te, department.actionLabelKey, department.actionLabelFallback),
    issueLabel:
      department.issueCount === 1
        ? translateKey(
            t,
            te,
            department.issueLabelSingularKey,
            department.issueLabelSingularFallback,
          )
        : translateKey(t, te, department.issueLabelPluralKey, department.issueLabelPluralFallback),
  }))
}

function mapGovernanceMetrics(t, te, metrics = []) {
  return metrics.map((metric) => ({
    ...metric,
    title: translateKey(t, te, metric.titleKey, metric.titleFallback),
    label: translateKey(t, te, metric.labelKey, metric.labelFallback),
  }))
}

function mapEvents(t, te, events = []) {
  return events.map((event) => ({
    ...event,
    title: translateKey(t, te, event.titleKey, event.titleFallback),
    moduleLabel: translateKey(t, te, event.moduleKey, event.moduleFallback),
    severityLabel: translateKey(t, te, event.severityLabelKey, event.severityLabelFallback),
    timestampLabel: translateKey(t, te, event.timestampKey, event.timestampFallback),
  }))
}

function mapNextSteps(t, te, steps = []) {
  return steps.map((step) => ({
    ...step,
    text: translateKey(t, te, step.textKey, step.textFallback),
  }))
}

export function buildCommandCenterViewModel(t, te, data) {
  return {
    pageTitle: translateKey(t, te, data.page.titleKey, data.page.titleFallback),
    pageSubtitle: translateKey(t, te, data.page.subtitleKey, data.page.subtitleFallback),
    sections: {
      summary: {
        title: translateKey(t, te, data.sections.summary.titleKey, data.sections.summary.titleFallback),
        subtitle: translateKey(
          t,
          te,
          data.sections.summary.subtitleKey,
          data.sections.summary.subtitleFallback,
        ),
      },
      status: {
        title: translateKey(t, te, data.sections.status.titleKey, data.sections.status.titleFallback),
      },
      priorityActions: {
        title: translateKey(
          t,
          te,
          data.sections.priorityActions.titleKey,
          data.sections.priorityActions.titleFallback,
        ),
      },
      departmentHealth: {
        title: translateKey(
          t,
          te,
          data.sections.departmentHealth.titleKey,
          data.sections.departmentHealth.titleFallback,
        ),
      },
      governance: {
        title: translateKey(
          t,
          te,
          data.sections.governance.titleKey,
          data.sections.governance.titleFallback,
        ),
      },
      events: {
        title: translateKey(t, te, data.sections.events.titleKey, data.sections.events.titleFallback),
      },
      nextSteps: {
        title: translateKey(
          t,
          te,
          data.sections.nextSteps.titleKey,
          data.sections.nextSteps.titleFallback,
        ),
      },
    },
    summaryCards: mapSummaryCards(t, te, data.summaryCards),
    executiveStatus: {
      ...data.executiveStatus,
      topIssue: translateKey(t, te, data.executiveStatus.topIssueKey, data.executiveStatus.topIssueFallback),
      department: translateKey(
        t,
        te,
        data.executiveStatus.departmentKey,
        data.executiveStatus.departmentFallback,
      ),
      recommendedAction: translateKey(
        t,
        te,
        data.executiveStatus.recommendedActionKey,
        data.executiveStatus.recommendedActionFallback,
      ),
      levelLabel: translateKey(
        t,
        te,
        data.executiveStatus.levelLabelKey,
        data.executiveStatus.levelLabelFallback,
      ),
      topIssueLabel: translateKey(
        t,
        te,
        data.executiveStatus.topIssueLabelKey,
        data.executiveStatus.topIssueLabelFallback,
      ),
      departmentLabel: translateKey(
        t,
        te,
        data.executiveStatus.departmentLabelKey,
        data.executiveStatus.departmentLabelFallback,
      ),
      recommendedActionLabel: translateKey(
        t,
        te,
        data.executiveStatus.recommendedActionLabelKey,
        data.executiveStatus.recommendedActionLabelFallback,
      ),
      note: translateKey(t, te, data.executiveStatus.noteKey, data.executiveStatus.noteFallback),
    },
    priorityActions: mapPriorityActions(t, te, data.priorityActions),
    departmentHealth: mapDepartmentHealth(t, te, data.departmentHealth),
    governanceMetrics: mapGovernanceMetrics(t, te, data.governanceMetrics),
    recentEvents: mapEvents(t, te, data.recentEvents),
    nextSteps: mapNextSteps(t, te, data.nextSteps),
  }
}
