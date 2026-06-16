<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import { dsamSubmissionApi } from '../services/dsamSubmissionApi'
import ScoreSummary from '../components/shared/ScoreSummary.vue'

defineOptions({ name: 'DsamSubmissionDetailPage' })

const route   = useRoute()
const router  = useRouter()
const toast   = useToast()

const submission = ref(null)
const loading    = ref(false)
const rejReason  = ref('')
const showReject = ref(false)

const statusSeverity = {
  draft: 'secondary', in_progress: 'warn', submitted: 'info',
  under_review: 'warn', approved: 'success', rejected: 'danger', archived: 'secondary',
}

function answerFor(questionId) {
  const a = (submission.value?.answers ?? []).find(a => a.question_id === questionId)
  return a?.display_value ?? '—'
}

async function load() {
  loading.value = true
  try {
    const res = await dsamSubmissionApi.get(route.params.id)
    submission.value = res.data.data
  } finally {
    loading.value = false
  }
}

async function approve() {
  try {
    await dsamSubmissionApi.approve(submission.value.id, {})
    toast.add({ severity: 'success', summary: 'Approved', life: 3000 })
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 4000 })
  }
}

async function reject() {
  if (!rejReason.value.trim()) return
  try {
    await dsamSubmissionApi.reject(submission.value.id, { reason: rejReason.value })
    toast.add({ severity: 'info', summary: 'Rejected', life: 3000 })
    showReject.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 4000 })
  }
}

const canApprove = computed(() =>
  submission.value && ['submitted', 'under_review'].includes(submission.value.status)
)

onMounted(load)
</script>

<template>
  <MainLayout>
    <div v-if="loading" class="flex justify-center py-20 text-slate-400">
      <i class="pi pi-spin pi-spinner text-3xl" />
    </div>

    <template v-else-if="submission">
      <div class="flex flex-col gap-6">
        <HeaderSection :title="`Assessment — ${submission.student?.full_name ?? ''}`">
          <template #actions>
            <div class="flex gap-2">
              <Button
                v-if="submission.can_edit"
                label="Continue Editing"
                icon="pi pi-pencil"
                severity="secondary"
                @click="router.push({ name: 'dsam-wizard', query: { submission: submission.uuid } })"
              />
              <Button
                v-if="canApprove"
                label="Approve"
                icon="pi pi-check"
                severity="success"
                @click="approve"
              />
              <Button
                v-if="canApprove"
                label="Reject"
                icon="pi pi-times"
                severity="danger"
                @click="showReject = !showReject"
              />
            </div>
          </template>
        </HeaderSection>

        <!-- Reject input -->
        <div v-if="showReject" class="rounded-xl border border-red-200 bg-red-50 p-4">
          <p class="mb-2 text-sm font-medium text-red-700">Rejection reason (required)</p>
          <Textarea v-model="rejReason" rows="3" class="w-full text-sm" placeholder="Explain why this submission is being rejected…" />
          <div class="mt-2 flex gap-2">
            <Button label="Confirm Reject" severity="danger" size="sm" :disabled="!rejReason.trim()" @click="reject" />
            <Button label="Cancel" severity="secondary" size="sm" @click="showReject = false" />
          </div>
        </div>

        <!-- Status + meta -->
        <div class="grid gap-4 lg:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</h3>
            <Tag :severity="statusSeverity[submission.status]" :value="submission.status?.replace('_', ' ')" />
            <div class="text-xs text-slate-500 space-y-1">
              <p>Submitted: {{ submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : '—' }}</p>
              <p>Approved: {{ submission.approved_at ? new Date(submission.approved_at).toLocaleString() : '—' }}</p>
              <p v-if="submission.rejection_reason" class="text-red-500">Rejected: {{ submission.rejection_reason }}</p>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Student</h3>
            <p class="font-medium text-slate-800">{{ submission.student?.full_name }}</p>
            <p class="text-xs text-slate-500">{{ submission.student?.student_code }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Score</h3>
            <ScoreSummary :submission="submission" />
          </div>
        </div>

        <!-- Answers by section -->
        <div
          v-for="section in submission.form_template?.sections ?? []"
          :key="section.id"
          class="rounded-xl border border-slate-200 bg-white p-5"
        >
          <h3 class="mb-4 text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
            {{ section.title }}
          </h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div
              v-for="q in section.questions ?? []"
              :key="q.id"
              class="space-y-0.5"
            >
              <p class="text-xs text-slate-400">{{ q.label }}</p>
              <p class="text-sm font-medium text-slate-800">{{ answerFor(q.id) }}</p>
            </div>
          </div>
        </div>

        <!-- Approval timeline -->
        <div v-if="submission.approvals?.length" class="rounded-xl border border-slate-200 bg-white p-5">
          <h3 class="mb-4 text-sm font-semibold text-slate-800">Approval History</h3>
          <ol class="space-y-3">
            <li
              v-for="ev in submission.approvals"
              :key="ev.id"
              class="flex items-start gap-3"
            >
              <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <i class="pi pi-check text-xs" />
              </span>
              <div>
                <p class="text-sm text-slate-800">
                  <span class="font-medium">{{ ev.action_label }}</span>
                  <span class="text-slate-400 ml-1">by {{ ev.actor?.name ?? '—' }}</span>
                </p>
                <p class="text-xs text-slate-400">{{ new Date(ev.created_at).toLocaleString() }}</p>
                <p v-if="ev.notes" class="text-xs text-slate-500 mt-0.5">{{ ev.notes }}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </template>
  </MainLayout>
</template>
