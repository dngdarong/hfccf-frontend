import http from '@/services/http'
import { buildQueryParams, normalizePerPage, unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizePrimitive(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizePrimitive(item))
  }

  if (!isObject(value)) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key.replace(/[_-](\w)/g, (_, letter) => letter.toUpperCase()), normalizePrimitive(entry)]),
  )
}

function normalizeDefinitionStep(step = {}) {
  return {
    id: step.id ?? '',
    workflowDefinitionId: step.workflowDefinitionId ?? step.workflow_definition_id ?? '',
    key: normalizeText(step.key),
    name: normalizeText(step.name),
    sortOrder: normalizeNumber(step.sortOrder ?? step.sort_order, 0),
    stepType: normalizeText(step.stepType || step.step_type),
    assignedRole: normalizeText(step.assignedRole || step.assigned_role),
    slaHours: step.slaHours ?? step.sla_hours ?? null,
    config: normalizePrimitive(step.config || {}),
    createdAt: step.createdAt || step.created_at || '',
    updatedAt: step.updatedAt || step.updated_at || '',
  }
}

function normalizeDefinition(definition = {}) {
  return {
    id: definition.id ?? '',
    key: normalizeText(definition.key),
    name: normalizeText(definition.name),
    description: normalizeText(definition.description),
    domain: normalizeText(definition.domain),
    isActive: Boolean(definition.isActive ?? definition.is_active),
    config: normalizePrimitive(definition.config || {}),
    steps: Array.isArray(definition.steps) ? definition.steps.map(normalizeDefinitionStep) : [],
    createdAt: definition.createdAt || definition.created_at || '',
    updatedAt: definition.updatedAt || definition.updated_at || '',
  }
}

function normalizeUser(user = {}) {
  if (!isObject(user)) {
    return null
  }

  return {
    id: user.id ?? '',
    firstName: normalizeText(user.firstName || user.first_name),
    lastName: normalizeText(user.lastName || user.last_name),
    username: normalizeText(user.username),
    email: normalizeText(user.email),
    roleCode: normalizeText(user.roleCode || user.role_code),
    status: normalizeText(user.status),
  }
}

function normalizeStep(step = {}) {
  if (!isObject(step)) {
    return null
  }

  return {
    id: step.id ?? '',
    key: normalizeText(step.key),
    name: normalizeText(step.name),
    stepType: normalizeText(step.stepType || step.step_type),
    assignedRole: normalizeText(step.assignedRole || step.assigned_role),
    slaHours: step.slaHours ?? step.sla_hours ?? null,
    sortOrder: normalizeNumber(step.sortOrder ?? step.sort_order, 0),
  }
}

function normalizeInstance(instance = {}) {
  if (!isObject(instance)) {
    return null
  }

  return {
    id: instance.id ?? '',
    workflowDefinitionId: instance.workflowDefinitionId ?? instance.workflow_definition_id ?? '',
    workflowDefinitionKey: normalizeText(instance.workflowDefinitionKey || instance.workflow_definition_key),
    workflowDefinitionName: normalizeText(instance.workflowDefinitionName || instance.workflow_definition_name),
    workflowDefinitionDomain: normalizeText(instance.workflowDefinitionDomain || instance.workflow_definition_domain),
    sourceType: normalizeText(instance.sourceType || instance.source_type),
    sourceId: normalizeText(instance.sourceId || instance.source_id),
    sourceLabel: normalizeText(instance.sourceLabel || instance.source_label),
    sourceRouteName: normalizeText(instance.sourceRouteName || instance.source_route_name),
    sourceRouteParams: normalizePrimitive(instance.sourceRouteParams || instance.source_route_params || {}),
    sourceExists: Boolean(instance.sourceExists ?? instance.source_exists),
    currentStepId: instance.currentStepId ?? instance.current_step_id ?? null,
    currentStep: normalizeStep(instance.currentStep || instance.current_step || null),
    status: normalizeText(instance.status),
    priority: normalizeText(instance.priority || 'normal'),
    assignedToUserId: normalizeText(instance.assignedToUserId || instance.assigned_to_user_id),
    assignedRole: normalizeText(instance.assignedRole || instance.assigned_role),
    dueAt: instance.dueAt || instance.due_at || '',
    startedAt: instance.startedAt || instance.started_at || '',
    completedAt: instance.completedAt || instance.completed_at || '',
    cancelledAt: instance.cancelledAt || instance.cancelled_at || '',
    escalatedAt: instance.escalatedAt || instance.escalated_at || '',
    metadata: normalizePrimitive(instance.metadata || {}),
    assignee: normalizeUser(instance.assignee || null),
    approvalsCount: normalizeNumber(instance.approvalsCount ?? instance.approvals_count, 0),
    eventsCount: normalizeNumber(instance.eventsCount ?? instance.events_count, 0),
    definitions: Array.isArray(instance.definitions) ? instance.definitions.map(normalizeDefinitionStep) : [],
    approvals: Array.isArray(instance.approvals) ? instance.approvals.map(normalizeApproval) : [],
    timeline: Array.isArray(instance.timeline) ? instance.timeline.map(normalizeTimelineEvent) : [],
    createdAt: instance.createdAt || instance.created_at || '',
    updatedAt: instance.updatedAt || instance.updated_at || '',
  }
}

function normalizeApprovalStep(step = {}) {
  if (!isObject(step)) {
    return null
  }

  return {
    id: step.id ?? '',
    key: normalizeText(step.key),
    name: normalizeText(step.name),
    stepType: normalizeText(step.stepType || step.step_type),
  }
}

function normalizeApproval(approval = {}) {
  if (!isObject(approval)) {
    return null
  }

  return {
    id: approval.id ?? '',
    workflowInstanceId: approval.workflowInstanceId ?? approval.workflow_instance_id ?? '',
    workflowStepId: approval.workflowStepId ?? approval.workflow_step_id ?? null,
    requestedByUserId: normalizeText(approval.requestedByUserId || approval.requested_by_user_id),
    requestedToUserId: normalizeText(approval.requestedToUserId || approval.requested_to_user_id),
    requestedToRole: normalizeText(approval.requestedToRole || approval.requested_to_role),
    status: normalizeText(approval.status),
    decisionNotes: normalizeText(approval.decisionNotes || approval.decision_notes),
    decidedByUserId: normalizeText(approval.decidedByUserId || approval.decided_by_user_id),
    decidedAt: approval.decidedAt || approval.decided_at || '',
    dueAt: approval.dueAt || approval.due_at || '',
    metadata: normalizePrimitive(approval.metadata || {}),
    instance: normalizeInstance(approval.instance || null),
    step: normalizeApprovalStep(approval.step || null),
    requestedBy: normalizeUser(approval.requestedBy || approval.requested_by || null),
    requestedTo: normalizeUser(approval.requestedTo || approval.requested_to || null),
    decidedBy: normalizeUser(approval.decidedBy || approval.decided_by || null),
    createdAt: approval.createdAt || approval.created_at || '',
    updatedAt: approval.updatedAt || approval.updated_at || '',
  }
}

function normalizeTimelineActor(actor = {}) {
  if (!isObject(actor)) {
    return null
  }

  return {
    id: actor.id ?? '',
    firstName: normalizeText(actor.firstName || actor.first_name),
    lastName: normalizeText(actor.lastName || actor.last_name),
    username: normalizeText(actor.username),
    email: normalizeText(actor.email),
    roleCode: normalizeText(actor.roleCode || actor.role_code),
  }
}

function normalizeTimelineStep(step = {}) {
  if (!isObject(step)) {
    return null
  }

  return {
    id: step.id ?? '',
    key: normalizeText(step.key),
    name: normalizeText(step.name),
  }
}

function normalizeTimelineEvent(event = {}) {
  if (!isObject(event)) {
    return null
  }

  return {
    id: event.id ?? '',
    eventType: normalizeText(event.eventType || event.event_type),
    title: normalizeText(event.title),
    description: normalizeText(event.description),
    actor: normalizeTimelineActor(event.actor || null),
    fromStatus: normalizeText(event.fromStatus || event.from_status),
    toStatus: normalizeText(event.toStatus || event.to_status),
    fromStep: normalizeTimelineStep(event.fromStep || event.from_step || null),
    toStep: normalizeTimelineStep(event.toStep || event.to_step || null),
    metadata: normalizePrimitive(event.metadata || {}),
    createdAt: event.createdAt || event.created_at || '',
  }
}

function normalizeSummary(summary = {}) {
  return {
    total: normalizeNumber(summary.total, 0),
    pendingWorkflows: normalizeNumber(summary.pendingWorkflows ?? summary.pending_workflows, 0),
    open: normalizeNumber(summary.open, 0),
    inProgress: normalizeNumber(summary.inProgress ?? summary.in_progress, 0),
    pendingApproval: normalizeNumber(summary.pendingApproval ?? summary.pending_approval, 0),
    pendingApprovals: normalizeNumber(summary.pendingApprovals ?? summary.pending_approvals ?? summary.pendingApproval ?? summary.pending_approval, 0),
    approved: normalizeNumber(summary.approved, 0),
    rejected: normalizeNumber(summary.rejected, 0),
    returned: normalizeNumber(summary.returned, 0),
    completed: normalizeNumber(summary.completed, 0),
    cancelled: normalizeNumber(summary.cancelled, 0),
    escalated: normalizeNumber(summary.escalated, 0),
    overdue: normalizeNumber(summary.overdue, 0),
    myAssignments: normalizeNumber(summary.myAssignments ?? summary.my_assignments, 0),
    assignedToMe: normalizeNumber(summary.assignedToMe ?? summary.assigned_to_me ?? summary.myAssignments ?? summary.my_assignments, 0),
    myApprovals: normalizeNumber(summary.myApprovals ?? summary.my_approvals, 0),
    byDefinition: Array.isArray(summary.byDefinition) ? summary.byDefinition.map((item = {}) => ({
      workflowDefinitionId: item.workflowDefinitionId ?? item.workflow_definition_id ?? null,
      workflowDefinitionKey: normalizeText(item.workflowDefinitionKey || item.workflow_definition_key),
      workflowDefinitionName: normalizeText(item.workflowDefinitionName || item.workflow_definition_name),
      total: normalizeNumber(item.total, 0),
    })) : [],
    byStatus: Array.isArray(summary.byStatus) ? summary.byStatus.map((item = {}) => ({
      status: normalizeText(item.status),
      total: normalizeNumber(item.total, 0),
    })) : [],
    byPriority: Array.isArray(summary.byPriority) ? summary.byPriority.map((item = {}) => ({
      priority: normalizeText(item.priority),
      total: normalizeNumber(item.total, 0),
    })) : [],
    recentlyUpdatedWorkflows: normalizeNumber(summary.recentlyUpdatedWorkflows ?? summary.recently_updated_workflows, 0),
  }
}

function normalizePagination(pagination = {}) {
  return {
    currentPage: normalizeNumber(pagination.currentPage ?? pagination.current_page, 1),
    lastPage: normalizeNumber(pagination.lastPage ?? pagination.last_page, 1),
    perPage: normalizeNumber(pagination.perPage ?? pagination.per_page, 10),
    total: normalizeNumber(pagination.total, 0),
  }
}

function normalizeListPayload(payload = {}) {
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.workflows)
      ? payload.workflows
      : Array.isArray(payload.approvals)
        ? payload.approvals
        : []

  return {
    summary: normalizeSummary(payload.summary || {}),
    items: items.map(normalizeInstance).filter(Boolean),
    approvals: Array.isArray(payload.approvals) ? payload.approvals.map(normalizeApproval).filter(Boolean) : [],
    timeline: Array.isArray(payload.timeline) ? payload.timeline.map(normalizeTimelineEvent).filter(Boolean) : [],
    definitions: Array.isArray(payload.definitions) ? payload.definitions.map(normalizeDefinition).filter(Boolean) : [],
    pagination: payload.pagination ? normalizePagination(payload.pagination) : null,
  }
}

function pickFilter(filters = {}, snakeKey, camelKey) {
  return filters[snakeKey] ?? filters[camelKey] ?? filters[camelKey.charAt(0).toLowerCase() + camelKey.slice(1)] ?? undefined
}

function buildWorkflowQuery(filters = {}) {
  return buildQueryParams({
    page: filters.page ?? 1,
    per_page: normalizePerPage(filters.perPage ?? filters.per_page, 10, 100),
    status: pickFilter(filters, 'status', 'status'),
    priority: pickFilter(filters, 'priority', 'priority'),
    search: pickFilter(filters, 'search', 'search'),
    source_type: pickFilter(filters, 'source_type', 'sourceType'),
    workflow_definition_key: pickFilter(filters, 'workflow_definition_key', 'workflowDefinitionKey'),
    assigned_to_user_id: pickFilter(filters, 'assigned_to_user_id', 'assignedToUserId'),
    assigned_role: pickFilter(filters, 'assigned_role', 'assignedRole'),
  })
}

function buildApprovalQuery(filters = {}) {
  return buildQueryParams({
    page: filters.page ?? 1,
    per_page: normalizePerPage(filters.perPage ?? filters.per_page, 10, 100),
    status: pickFilter(filters, 'status', 'status'),
    search: pickFilter(filters, 'search', 'search'),
  })
}

function buildWorkflowSyncQuery(filters = {}) {
  return buildQueryParams({
    definition_key: pickFilter(filters, 'definition_key', 'definitionKey'),
    source_type: pickFilter(filters, 'source_type', 'sourceType'),
    status: pickFilter(filters, 'status', 'status'),
    date_from: pickFilter(filters, 'date_from', 'dateFrom'),
    date_to: pickFilter(filters, 'date_to', 'dateTo'),
    limit: normalizePerPage(pickFilter(filters, 'limit', 'limit'), 50, 500),
    batch_size: Math.min(Math.max(normalizeNumber(pickFilter(filters, 'batch_size', 'batchSize'), 25), 1), 100),
    dry_run: Boolean(pickFilter(filters, 'dry_run', 'dryRun')),
  })
}

function buildWorkflowObservabilityQuery(filters = {}) {
  return buildQueryParams({
    definition_key: pickFilter(filters, 'definition_key', 'definitionKey'),
    source_type: pickFilter(filters, 'source_type', 'sourceType'),
    status: pickFilter(filters, 'status', 'status'),
    started_by_user_id: pickFilter(filters, 'started_by_user_id', 'startedByUserId'),
    date_from: pickFilter(filters, 'date_from', 'dateFrom'),
    date_to: pickFilter(filters, 'date_to', 'dateTo'),
    mode: pickFilter(filters, 'mode', 'mode'),
  })
}

async function unwrapListResponse(request, options = {}) {
  const response = await request(options)
  return normalizeListPayload(unwrapApiData(response) || {})
}

function normalizeSyncItem(item = {}) {
  if (!isObject(item)) {
    return null
  }

  return {
    definitionKey: normalizeText(item.definitionKey || item.definition_key),
    sourceType: normalizeText(item.sourceType || item.source_type),
    sourceId: normalizeText(item.sourceId || item.source_id),
    sourceLabel: normalizeText(item.sourceLabel || item.source_label),
    sourceStatus: normalizeText(item.sourceStatus || item.source_status),
    sourceRouteName: normalizeText(item.sourceRouteName || item.source_route_name),
    sourceRouteParams: normalizePrimitive(item.sourceRouteParams || item.source_route_params || {}),
    sourceExists: item.sourceExists ?? item.source_exists ?? null,
    status: normalizeText(item.status),
    reason: normalizeText(item.reason),
    workflowInstanceId: item.workflowInstanceId ?? item.workflow_instance_id ?? null,
    workflowRouteName: normalizeText(item.workflowRouteName || item.workflow_route_name),
    workflowRouteParams: normalizePrimitive(item.workflowRouteParams || item.workflow_route_params || {}),
    errorMessage: normalizeText(item.errorMessage || item.error_message),
    processedAt: item.processedAt || item.processed_at || '',
  }
}

function normalizeSyncRunStartedBy(user = {}) {
  if (!isObject(user)) {
    return null
  }

  return {
    id: user.id ?? '',
    name: normalizeText(user.name),
    roleCode: normalizeText(user.roleCode || user.role_code),
  }
}

function normalizeSyncRun(run = {}) {
  if (!isObject(run)) {
    return null
  }

  return {
    id: run.id ?? '',
    mode: normalizeText(run.mode),
    status: normalizeText(run.status),
    definitionKey: normalizeText(run.definitionKey || run.definition_key),
    sourceType: normalizeText(run.sourceType || run.source_type),
    filters: normalizePrimitive(run.filters || {}),
    requestedLimit: normalizeNumber(run.requestedLimit ?? run.requested_limit, 0),
    batchSize: normalizeNumber(run.batchSize ?? run.batch_size, 0),
    eligibleCount: normalizeNumber(run.eligibleCount ?? run.eligible_count, 0),
    processedCount: normalizeNumber(run.processedCount ?? run.processed_count, 0),
    createdCount: normalizeNumber(run.createdCount ?? run.created_count, 0),
    existingCount: normalizeNumber(run.existingCount ?? run.existing_count, 0),
    skippedCount: normalizeNumber(run.skippedCount ?? run.skipped_count, 0),
    failedCount: normalizeNumber(run.failedCount ?? run.failed_count, 0),
    startedByUserId: normalizeText(run.startedByUserId || run.started_by_user_id),
    startedAt: run.startedAt || run.started_at || '',
    completedAt: run.completedAt || run.completed_at || '',
    failureMessage: normalizeText(run.failureMessage || run.failure_message),
    startedBy: normalizeSyncRunStartedBy(run.startedBy || run.started_by || null),
  }
}

function normalizeSyncRunItem(item = {}) {
  if (!isObject(item)) {
    return null
  }

  return {
    id: item.id ?? '',
    syncRunId: item.syncRunId ?? item.sync_run_id ?? '',
    definitionKey: normalizeText(item.definitionKey || item.definition_key),
    sourceType: normalizeText(item.sourceType || item.source_type),
    sourceId: normalizeText(item.sourceId || item.source_id),
    sourceLabel: normalizeText(item.sourceLabel || item.source_label),
    sourceRouteName: normalizeText(item.sourceRouteName || item.source_route_name),
    sourceRouteParams: normalizePrimitive(item.sourceRouteParams || item.source_route_params || {}),
    sourceExists: item.sourceExists ?? item.source_exists ?? null,
    resultStatus: normalizeText(item.resultStatus || item.result_status),
    reason: normalizeText(item.reason),
    workflowInstanceId: item.workflowInstanceId ?? item.workflow_instance_id ?? null,
    workflowRouteName: normalizeText(item.workflowRouteName || item.workflow_route_name),
    workflowRouteParams: normalizePrimitive(item.workflowRouteParams || item.workflow_route_params || {}),
    errorMessage: normalizeText(item.errorMessage || item.error_message),
    processedAt: item.processedAt || item.processed_at || '',
  }
}

function normalizeSyncResult(payload = {}) {
  const summary = payload.summary || {}
  const items = Array.isArray(payload.items) ? payload.items : []

  return {
    dryRun: Boolean(payload.dryRun ?? payload.dry_run),
    limit: normalizeNumber(payload.limit, 0),
    batchSize: normalizeNumber(payload.batchSize ?? payload.batch_size, 0),
    generatedAt: normalizeText(payload.generatedAt || payload.generated_at),
    run: normalizeSyncRun(payload.run || payload.syncRun || null),
    summary: {
      eligible: normalizeNumber(summary.eligible, 0),
      created: normalizeNumber(summary.created, 0),
      existing: normalizeNumber(summary.existing, 0),
      skipped: normalizeNumber(summary.skipped, 0),
      failed: normalizeNumber(summary.failed, 0),
    },
    items: items.map(normalizeSyncItem).filter(Boolean),
  }
}

function normalizeSyncRunHistoryPayload(payload = {}) {
  const items = Array.isArray(payload.items) ? payload.items : []

  return {
    items: items.map(normalizeSyncRun).filter(Boolean),
    pagination: payload.pagination ? normalizePagination(payload.pagination) : null,
  }
}

function normalizeObservabilityActor(actor = {}) {
  if (!isObject(actor)) {
    return null
  }

  return {
    id: actor.id ?? '',
    name: normalizeText(actor.name),
    roleCode: normalizeText(actor.roleCode || actor.role_code),
  }
}

function normalizeObservabilityStaleRun(stale = {}) {
  if (!isObject(stale)) {
    return null
  }

  return {
    isStale: Boolean(stale.isStale ?? stale.is_stale),
    staleReason: normalizeText(stale.staleReason || stale.stale_reason),
    ageMs: stale.ageMs ?? stale.age_ms ?? null,
    thresholdMs: stale.thresholdMs ?? stale.threshold_ms ?? null,
    run: normalizeObservabilityRun(stale.run || null),
  }
}

function normalizeObservabilityRun(run = {}) {
  if (!isObject(run)) {
    return null
  }

  return {
    id: run.id ?? '',
    mode: normalizeText(run.mode),
    status: normalizeText(run.status),
    definitionKey: normalizeText(run.definitionKey || run.definition_key),
    definitionName: normalizeText(run.definitionName || run.definition_name),
    sourceType: normalizeText(run.sourceType || run.source_type),
    startedByUserId: normalizeText(run.startedByUserId || run.started_by_user_id),
    startedBy: normalizeObservabilityActor(run.startedBy || null),
    requestedLimit: run.requestedLimit ?? run.requested_limit ?? null,
    batchSize: run.batchSize ?? run.batch_size ?? null,
    eligibleCount: run.eligibleCount ?? run.eligible_count ?? null,
    processedCount: run.processedCount ?? run.processed_count ?? 0,
    createdCount: run.createdCount ?? run.created_count ?? 0,
    existingCount: run.existingCount ?? run.existing_count ?? 0,
    skippedCount: run.skippedCount ?? run.skipped_count ?? 0,
    failedCount: run.failedCount ?? run.failed_count ?? 0,
    startedAt: run.startedAt || run.started_at || '',
    completedAt: run.completedAt || run.completed_at || '',
    createdAt: run.createdAt || run.created_at || '',
    updatedAt: run.updatedAt || run.updated_at || '',
    durationMs: run.durationMs ?? run.duration_ms ?? null,
    throughputItemsPerSecond: run.throughputItemsPerSecond ?? run.throughput_items_per_second ?? null,
    failureMessage: normalizeText(run.failureMessage || run.failure_message),
    stale: normalizeObservabilityStaleRun(run.stale || null),
  }
}

function normalizeObservabilityFailureEvent(event = {}) {
  if (!isObject(event)) {
    return null
  }

  return {
    kind: normalizeText(event.kind),
    id: normalizeText(event.id),
    runId: event.runId ?? event.run_id ?? null,
    definitionKey: normalizeText(event.definitionKey || event.definition_key),
    sourceType: normalizeText(event.sourceType || event.source_type),
    sourceId: normalizeText(event.sourceId || event.source_id),
    sourceLabel: normalizeText(event.sourceLabel || event.source_label),
    status: normalizeText(event.status),
    failureCategory: normalizeText(event.failureCategory || event.failure_category),
    reason: normalizeText(event.reason),
    errorMessage: normalizeText(event.errorMessage || event.error_message),
    occurredAt: event.occurredAt || event.occurred_at || '',
    run: normalizeObservabilityRun(event.run || null),
  }
}

function normalizeObservabilityDashboard(payload = {}) {
  const summary = payload.summary || {}
  const performance = payload.performance || {}
  const health = payload.health || {}
  const breakdowns = payload.breakdowns || {}
  const trends = payload.trends || {}
  const recentActivity = payload.recentActivity || {}
  const governance = payload.governance || {}

  return {
    summary: {
      totalRuns: normalizeNumber(summary.totalRuns, 0),
      successfulRuns: normalizeNumber(summary.successfulRuns, 0),
      runsWithErrors: normalizeNumber(summary.runsWithErrors, 0),
      failedRuns: normalizeNumber(summary.failedRuns, 0),
      runningRuns: normalizeNumber(summary.runningRuns, 0),
      staleRuns: normalizeNumber(summary.staleRuns, 0),
      totalProcessed: normalizeNumber(summary.totalProcessed, 0),
      totalCreated: normalizeNumber(summary.totalCreated, 0),
      totalExisting: normalizeNumber(summary.totalExisting, 0),
      totalSkipped: normalizeNumber(summary.totalSkipped, 0),
      totalFailedItems: normalizeNumber(summary.totalFailedItems, 0),
      successRate: normalizeNumber(summary.successRate, 0),
      failureRate: normalizeNumber(summary.failureRate, 0),
      averageDurationMs: performance.averageDurationMs ?? summary.averageDurationMs ?? null,
      longestDurationMs: performance.longestDurationMs ?? summary.longestDurationMs ?? null,
      averageItemsPerRun: normalizeNumber(summary.averageItemsPerRun, 0),
    },
    performance: {
      averageDurationMs: performance.averageDurationMs ?? null,
      longestDurationMs: performance.longestDurationMs ?? null,
      slowestRuns: Array.isArray(performance.slowestRuns) ? performance.slowestRuns.map(normalizeObservabilityRun).filter(Boolean) : [],
      durationTrend: Array.isArray(performance.durationTrend) ? performance.durationTrend.map(normalizePrimitive) : [],
      processedItemsTrend: Array.isArray(performance.processedItemsTrend) ? performance.processedItemsTrend.map(normalizePrimitive) : [],
      throughputTrend: Array.isArray(performance.throughputTrend) ? performance.throughputTrend.map(normalizePrimitive) : [],
    },
    health: {
      status: normalizeText(health.status),
      staleRuns: Array.isArray(health.staleRuns) ? health.staleRuns.map(normalizeObservabilityStaleRun).filter(Boolean) : [],
      recentFailedRuns: Array.isArray(health.recentFailedRuns) ? health.recentFailedRuns.map(normalizeObservabilityRun).filter(Boolean) : [],
      recentRunsWithErrors: Array.isArray(health.recentRunsWithErrors) ? health.recentRunsWithErrors.map(normalizeObservabilityRun).filter(Boolean) : [],
      highFailureRateRuns: Array.isArray(health.highFailureRateRuns) ? health.highFailureRateRuns.map(normalizeObservabilityRun).filter(Boolean) : [],
    },
    breakdowns: {
      byDefinition: Array.isArray(breakdowns.byDefinition) ? breakdowns.byDefinition.map((item = {}) => ({
        definitionKey: normalizeText(item.definitionKey || item.definition_key),
        definitionName: normalizeText(item.definitionName || item.definition_name),
        totalRuns: normalizeNumber(item.totalRuns ?? item.total_runs, 0),
        successfulRuns: normalizeNumber(item.successfulRuns ?? item.successful_runs, 0),
        runsWithErrors: normalizeNumber(item.runsWithErrors ?? item.runs_with_errors, 0),
        failedRuns: normalizeNumber(item.failedRuns ?? item.failed_runs, 0),
        staleRuns: normalizeNumber(item.staleRuns ?? item.stale_runs, 0),
        totalProcessed: normalizeNumber(item.totalProcessed ?? item.total_processed, 0),
        averageDurationMs: item.averageDurationMs ?? item.average_duration_ms ?? null,
      })) : [],
      bySourceType: Array.isArray(breakdowns.bySourceType) ? breakdowns.bySourceType.map((item = {}) => ({
        sourceType: normalizeText(item.sourceType || item.source_type),
        sourceLabel: normalizeText(item.sourceLabel || item.source_label),
        totalRuns: normalizeNumber(item.totalRuns ?? item.total_runs, 0),
        successfulRuns: normalizeNumber(item.successfulRuns ?? item.successful_runs, 0),
        runsWithErrors: normalizeNumber(item.runsWithErrors ?? item.runs_with_errors, 0),
        failedRuns: normalizeNumber(item.failedRuns ?? item.failed_runs, 0),
        staleRuns: normalizeNumber(item.staleRuns ?? item.stale_runs, 0),
      })) : [],
      byRunStatus: Array.isArray(breakdowns.byRunStatus) ? breakdowns.byRunStatus.map((item = {}) => ({
        status: normalizeText(item.status),
        totalRuns: normalizeNumber(item.totalRuns ?? item.total_runs, 0),
      })) : [],
      byItemStatus: Array.isArray(breakdowns.byItemStatus) ? breakdowns.byItemStatus.map((item = {}) => ({
        resultStatus: normalizeText(item.resultStatus || item.result_status),
        totalItems: normalizeNumber(item.totalItems ?? item.total_items, 0),
      })) : [],
      byActor: Array.isArray(breakdowns.byActor) ? breakdowns.byActor.map((item = {}) => ({
        startedByUserId: normalizeText(item.startedByUserId || item.started_by_user_id),
        startedBy: normalizeObservabilityActor(item.startedBy || item.started_by || null),
        totalRuns: normalizeNumber(item.totalRuns ?? item.total_runs, 0),
        successfulRuns: normalizeNumber(item.successfulRuns ?? item.successful_runs, 0),
        runsWithErrors: normalizeNumber(item.runsWithErrors ?? item.runs_with_errors, 0),
        failedRuns: normalizeNumber(item.failedRuns ?? item.failed_runs, 0),
        totalProcessed: normalizeNumber(item.totalProcessed ?? item.total_processed, 0),
      })) : [],
      byFailureCategory: Array.isArray(breakdowns.byFailureCategory) ? breakdowns.byFailureCategory.map((item = {}) => ({
        failureCategory: normalizeText(item.failureCategory || item.failure_category),
        totalFailures: normalizeNumber(item.totalFailures ?? item.total_failures, 0),
        runFailures: normalizeNumber(item.runFailures ?? item.run_failures, 0),
        itemFailures: normalizeNumber(item.itemFailures ?? item.item_failures, 0),
      })) : [],
    },
    trends: {
      runsOverTime: Array.isArray(trends.runsOverTime) ? trends.runsOverTime.map(normalizePrimitive) : [],
      processedItemsOverTime: Array.isArray(trends.processedItemsOverTime) ? trends.processedItemsOverTime.map(normalizePrimitive) : [],
      failureRateOverTime: Array.isArray(trends.failureRateOverTime) ? trends.failureRateOverTime.map(normalizePrimitive) : [],
      durationOverTime: Array.isArray(trends.durationOverTime) ? trends.durationOverTime.map(normalizePrimitive) : [],
    },
    recentActivity: {
      recentRuns: Array.isArray(recentActivity.recentRuns) ? recentActivity.recentRuns.map(normalizeObservabilityRun).filter(Boolean) : [],
      recentFailures: Array.isArray(recentActivity.recentFailures) ? recentActivity.recentFailures.map(normalizeObservabilityFailureEvent).filter(Boolean) : [],
      recentlyCompletedRuns: Array.isArray(recentActivity.recentlyCompletedRuns) ? recentActivity.recentlyCompletedRuns.map(normalizeObservabilityRun).filter(Boolean) : [],
    },
    governance: {
      oldestRunAt: governance.oldestRunAt || governance.oldest_run_at || '',
      totalRunRecords: normalizeNumber(governance.totalRunRecords ?? governance.total_run_records, 0),
      totalItemRecords: normalizeNumber(governance.totalItemRecords ?? governance.total_item_records, 0),
      retentionMode: normalizeText(governance.retentionMode || governance.retention_mode),
      automaticPruningEnabled: Boolean(governance.automaticPruningEnabled ?? governance.automatic_pruning_enabled),
    },
    filters: normalizePrimitive(payload.filters || {}),
    generatedAt: normalizeText(payload.generatedAt || payload.generated_at),
  }
}

export async function fetchPreschoolWorkflowDefinitions(options = {}) {
  const response = await http.get('/preschool/workflows/definitions', { signal: options.signal })
  const payload = unwrapApiData(response) || {}
  const definitions = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.definitions)
      ? payload.definitions
      : Array.isArray(payload.data)
        ? payload.data
        : []

  return {
    definitions: definitions.map(normalizeDefinition).filter(Boolean),
  }
}

export async function fetchPreschoolWorkflows(filters = {}, options = {}) {
  return unwrapListResponse(
    (requestOptions) => http.get('/preschool/workflows', {
      params: buildWorkflowQuery(filters),
      signal: requestOptions.signal,
    }),
    options,
  )
}

export async function fetchPreschoolWorkflowSummary(filters = {}, options = {}) {
  const response = await http.get('/preschool/workflows/summary', {
    params: buildWorkflowQuery(filters),
    signal: options.signal,
  })

  return normalizeSummary(unwrapApiData(response) || {})
}

export async function fetchPreschoolWorkflow(id, options = {}) {
  const response = await http.get(`/preschool/workflows/${id}`, { signal: options.signal })
  const payload = unwrapApiData(response) || {}
  return { workflow: normalizeInstance(payload.workflow || payload) }
}

export async function createPreschoolWorkflow(payload = {}) {
  const response = await http.post('/preschool/workflows', payload)
  const data = unwrapApiData(response) || {}
  return { workflow: normalizeInstance(data.workflow || data) }
}

export async function assignPreschoolWorkflow(id, payload = {}) {
  const response = await http.patch(`/preschool/workflows/${id}/assign`, payload)
  const data = unwrapApiData(response) || {}
  return { workflow: normalizeInstance(data.workflow || data) }
}

export async function transitionPreschoolWorkflow(id, payload = {}) {
  const response = await http.patch(`/preschool/workflows/${id}/transition`, payload)
  const data = unwrapApiData(response) || {}
  return { workflow: normalizeInstance(data.workflow || data) }
}

export async function completePreschoolWorkflow(id, payload = {}) {
  const response = await http.patch(`/preschool/workflows/${id}/complete`, payload)
  const data = unwrapApiData(response) || {}
  return { workflow: normalizeInstance(data.workflow || data) }
}

export async function cancelPreschoolWorkflow(id, payload = {}) {
  const response = await http.patch(`/preschool/workflows/${id}/cancel`, payload)
  const data = unwrapApiData(response) || {}
  return { workflow: normalizeInstance(data.workflow || data) }
}

export async function escalatePreschoolWorkflow(id, payload = {}) {
  const response = await http.patch(`/preschool/workflows/${id}/escalate`, payload)
  const data = unwrapApiData(response) || {}
  return { workflow: normalizeInstance(data.workflow || data) }
}

export async function fetchPreschoolWorkflowApprovals(filters = {}, options = {}) {
  const response = await http.get('/preschool/workflows/approvals', {
    params: buildApprovalQuery(filters),
    signal: options.signal,
  })
  const payload = unwrapApiData(response) || {}

  return {
    summary: normalizeSummary(payload.summary || {}),
    items: Array.isArray(payload.items) ? payload.items.map(normalizeApproval).filter(Boolean) : [],
    approvals: Array.isArray(payload.approvals) ? payload.approvals.map(normalizeApproval).filter(Boolean) : [],
    timeline: Array.isArray(payload.timeline) ? payload.timeline.map(normalizeTimelineEvent).filter(Boolean) : [],
    definitions: Array.isArray(payload.definitions) ? payload.definitions.map(normalizeDefinition).filter(Boolean) : [],
    pagination: payload.pagination ? normalizePagination(payload.pagination) : null,
  }
}

export async function requestPreschoolWorkflowApproval(id, payload = {}) {
  const response = await http.post(`/preschool/workflows/${id}/approvals`, payload)
  const data = unwrapApiData(response) || {}
  return { approval: normalizeApproval(data.approval || data) }
}

export async function approvePreschoolWorkflowApproval(id, payload = {}) {
  const response = await http.patch(`/preschool/workflows/approvals/${id}/approve`, payload)
  const data = unwrapApiData(response) || {}
  return { approval: normalizeApproval(data.approval || data) }
}

export async function rejectPreschoolWorkflowApproval(id, payload = {}) {
  const response = await http.patch(`/preschool/workflows/approvals/${id}/reject`, payload)
  const data = unwrapApiData(response) || {}
  return { approval: normalizeApproval(data.approval || data) }
}

export async function returnPreschoolWorkflowApproval(id, payload = {}) {
  const response = await http.patch(`/preschool/workflows/approvals/${id}/return`, payload)
  const data = unwrapApiData(response) || {}
  return { approval: normalizeApproval(data.approval || data) }
}

export async function cancelPreschoolWorkflowApproval(id, payload = {}) {
  const response = await http.patch(`/preschool/workflows/approvals/${id}/cancel`, payload)
  const data = unwrapApiData(response) || {}
  return { approval: normalizeApproval(data.approval || data) }
}

export async function fetchPreschoolWorkflowTimeline(id, options = {}) {
  const response = await http.get(`/preschool/workflows/${id}/timeline`, { signal: options.signal })
  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.timeline)
      ? payload.timeline
      : Array.isArray(payload.data)
        ? payload.data
        : []

  return {
    timeline: items.map(normalizeTimelineEvent).filter(Boolean),
  }
}

export async function fetchPreschoolWorkflowSyncPreview(filters = {}, options = {}) {
  const response = await http.get('/preschool/workflows/sync/preview', {
    params: buildWorkflowSyncQuery(filters),
    signal: options.signal,
  })

  return normalizeSyncResult(unwrapApiData(response) || {})
}

export async function runPreschoolWorkflowSync(filters = {}, options = {}) {
  const response = await http.post('/preschool/workflows/sync/run', buildWorkflowSyncQuery(filters), {
    signal: options.signal,
  })

  return normalizeSyncResult(unwrapApiData(response) || {})
}

export async function fetchPreschoolWorkflowSyncRuns(filters = {}, options = {}) {
  const response = await http.get('/preschool/workflows/sync/runs', {
    params: buildQueryParams({
      mode: pickFilter(filters, 'mode', 'mode'),
      status: pickFilter(filters, 'status', 'status'),
      definition_key: pickFilter(filters, 'definition_key', 'definitionKey'),
      source_type: pickFilter(filters, 'source_type', 'sourceType'),
      started_by_user_id: pickFilter(filters, 'started_by_user_id', 'startedByUserId'),
      date_from: pickFilter(filters, 'date_from', 'dateFrom'),
      date_to: pickFilter(filters, 'date_to', 'dateTo'),
      page: filters.page ?? 1,
      per_page: normalizePerPage(filters.perPage ?? filters.per_page, 20, 100),
    }),
    signal: options.signal,
  })

  return normalizeSyncRunHistoryPayload(unwrapApiData(response) || {})
}

export async function fetchPreschoolWorkflowSyncRun(id, options = {}) {
  const response = await http.get(`/preschool/workflows/sync/runs/${id}`, { signal: options.signal })
  const payload = unwrapApiData(response) || {}
  return { run: normalizeSyncRun(payload.run || payload) }
}

export async function fetchPreschoolWorkflowSyncRunItems(id, filters = {}, options = {}) {
  const response = await http.get(`/preschool/workflows/sync/runs/${id}/items`, {
    params: buildQueryParams({
      result_status: pickFilter(filters, 'result_status', 'resultStatus'),
      page: filters.page ?? 1,
      per_page: normalizePerPage(filters.perPage ?? filters.per_page, 20, 100),
    }),
    signal: options.signal,
  })
  const payload = unwrapApiData(response) || {}

  return {
    items: Array.isArray(payload.items) ? payload.items.map(normalizeSyncRunItem).filter(Boolean) : [],
    pagination: payload.pagination ? normalizePagination(payload.pagination) : null,
  }
}

export async function fetchPreschoolWorkflowObservabilityDashboard(filters = {}, options = {}) {
  const response = await http.get('/preschool/workflows/observability/dashboard', {
    params: buildWorkflowObservabilityQuery(filters),
    signal: options.signal,
  })

  return normalizeObservabilityDashboard(unwrapApiData(response) || {})
}

export {
  buildWorkflowQuery,
  buildWorkflowSyncQuery,
  buildWorkflowObservabilityQuery,
  normalizeApproval,
  normalizeDefinition,
  normalizeInstance,
  normalizeListPayload,
  normalizeSummary,
  normalizeTimelineEvent,
  normalizeSyncItem,
  normalizeSyncResult,
  normalizeSyncRun,
  normalizeSyncRunItem,
  normalizeSyncRunHistoryPayload,
  normalizeObservabilityDashboard,
  normalizeObservabilityFailureEvent,
  normalizeObservabilityRun,
  normalizeObservabilityStaleRun,
}
