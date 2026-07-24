<script setup>
import Avatar from 'primevue/avatar'

defineProps({
  student: {
    type: Object,
    required: true,
  },
})

const formatDate = (dateString) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '—'
  }
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Student Information</h2>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Photo & Name -->
      <div class="flex gap-4 md:col-span-2">
        <Avatar
          :image="student.avatarUrl"
          :label="student.firstName?.charAt(0) || ''"
          size="xlarge"
          shape="circle"
          class="flex-shrink-0"
        />
        <div>
          <h3 class="text-xl font-bold text-slate-900">{{ student.fullName }}</h3>
          <p v-if="student.latinName" class="text-sm text-slate-500">{{ student.latinName }}</p>
          <p class="mt-1 text-sm text-slate-600">
            <strong>Code:</strong> {{ student.studentCode || student.publicId }}
          </p>
        </div>
      </div>

      <!-- Gender & DOB -->
      <div>
        <p class="text-xs font-semibold uppercase text-slate-500">Gender</p>
        <p class="mt-1 text-sm text-slate-900">{{ student.gender || '—' }}</p>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase text-slate-500">Date of Birth</p>
        <p class="mt-1 text-sm text-slate-900">{{ student.dateOfBirth || '—' }}</p>
      </div>

      <!-- Nationality -->
      <div>
        <p class="text-xs font-semibold uppercase text-slate-500">Nationality</p>
        <p class="mt-1 text-sm text-slate-900">{{ student.nationality || '—' }}</p>
      </div>

      <!-- Class & Status -->
      <div>
        <p class="text-xs font-semibold uppercase text-slate-500">Class</p>
        <p class="mt-1 text-sm text-slate-900">
          {{ student.classes?.[0]?.name || '—' }}
        </p>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase text-slate-500">Academic Year</p>
        <p class="mt-1 text-sm text-slate-900">
          {{ student.classes?.[0]?.academicYear || '—' }}
        </p>
      </div>

      <!-- Enrollment Date -->
      <div>
        <p class="text-xs font-semibold uppercase text-slate-500">Enrollment Date</p>
        <p class="mt-1 text-sm text-slate-900">
          {{ formatDate(student.classes?.[0]?.enrolledAt) }}
        </p>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase text-slate-500">Status</p>
        <div class="mt-1">
          <span
            :class="[
              'inline-block rounded-full px-3 py-1 text-xs font-semibold',
              student.status === 'active'
                ? 'bg-green-100 text-green-800'
                : student.status === 'inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800',
            ]"
          >
            {{ student.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
