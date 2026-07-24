<template>
  <div class="submission-detail-editor">
    <!-- Header -->
    <div class="editor-header">
      <div class="header-info">
        <h2>
          {{ isNewSubmission ? 'Create New Assessment' : 'Edit Assessment' }}
        </h2>
        <p class="submission-meta" v-if="!isNewSubmission">
          <span class="badge" :class="`badge-${submission.status}`">
            {{ formatStatus(submission.status) }}
          </span>
          <span class="meta-divider">•</span>
          <span class="meta-text">{{ formatMonth(submission.submission_month) }}</span>
        </p>
      </div>
      <button @click="$emit('close')" class="btn-close">
        <i class="icon-close"></i>
      </button>
    </div>

    <!-- Content -->
    <div class="editor-content">
      <!-- Submission Info Section -->
      <div class="section">
        <h3>Assessment Details</h3>
        <div class="form-group">
          <label>Class</label>
          <div v-if="submission.class" class="form-value">
            {{ submission.class.name }}
          </div>
          <select v-else v-model="formData.class_id" class="form-control" @change="onClassChange">
            <option value="">Select a class...</option>
            <option v-for="cls in availableClasses" :key="cls.id" :value="cls.id">
              {{ cls.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Assessment Category</label>
          <div v-if="submission.category" class="form-value">
            {{ submission.category.name }}
          </div>
          <select v-else v-model="formData.assessment_category_id" class="form-control">
            <option value="">Select a category...</option>
            <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Assessment Month</label>
          <div class="form-value">
            {{ formatMonth(submission.submission_month || new Date()) }}
          </div>
        </div>
      </div>

      <!-- Student Scores Section -->
      <div class="section">
        <div class="section-header">
          <h3>Student Assessments</h3>
          <span class="progress-badge">
            {{ completedCount }}/{{ totalCount }} completed
          </span>
        </div>

        <div v-if="students.length > 0" class="student-scores">
          <div
            v-for="student in students"
            :key="student.id"
            class="score-entry"
          >
            <div class="student-info">
              <div class="student-name">{{ student.first_name }} {{ student.last_name }}</div>
              <div class="student-id">{{ student.student_code }}</div>
            </div>

            <div class="score-inputs">
              <div class="input-group">
                <label>Score</label>
                <input
                  type="number"
                  min="0"
                  max="999.99"
                  step="0.01"
                  :value="getStudentScore(student.id)?.score"
                  @input="updateScore(student.id, 'score', $event)"
                  class="form-control score-input"
                  placeholder="0.00"
                  :disabled="!isEditable"
                />
              </div>

              <div class="input-group">
                <label>Rating</label>
                <select
                  :value="getStudentScore(student.id)?.rating"
                  @change="updateScore(student.id, 'rating', $event)"
                  class="form-control"
                  :disabled="!isEditable"
                >
                  <option value="">None</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="satisfactory">Satisfactory</option>
                  <option value="needs-improvement">Needs Improvement</option>
                </select>
              </div>

              <div class="input-group">
                <label>Observation</label>
                <input
                  type="text"
                  :value="getStudentScore(student.id)?.observation"
                  @input="updateScore(student.id, 'observation', $event)"
                  class="form-control"
                  placeholder="Brief observation..."
                  :disabled="!isEditable"
                />
              </div>

              <div class="input-group">
                <label>Comment</label>
                <textarea
                  :value="getStudentScore(student.id)?.teacher_comment"
                  @input="updateScore(student.id, 'teacher_comment', $event)"
                  class="form-control"
                  placeholder="Teacher comment..."
                  rows="2"
                  :disabled="!isEditable"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-students">
          <p>No students enrolled in this class.</p>
        </div>
      </div>

      <!-- Return Feedback (if returned) -->
      <div v-if="submission.status === 'returned'" class="section feedback-section">
        <h3>Admin Feedback</h3>
        <div class="feedback-box">
          <div class="feedback-item">
            <label>Return Reason:</label>
            <p>{{ submission.return_reason }}</p>
          </div>
          <div v-if="submission.review_comment" class="feedback-item">
            <label>Comment:</label>
            <p>{{ submission.review_comment }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="editor-footer">
      <div class="footer-actions">
        <button
          @click="$emit('close')"
          class="btn btn-secondary"
        >
          Cancel
        </button>

        <div class="primary-actions">
          <button
            v-if="isEditable"
            @click="saveDraft"
            class="btn btn-default"
            :disabled="loading"
          >
            <i class="icon-save"></i> Save Draft
          </button>

          <button
            v-if="submission.status === 'draft' || submission.status === 'returned'"
            @click="submitAssessment"
            class="btn btn-primary"
            :disabled="!canSubmit || loading"
          >
            <i class="icon-check"></i>
            {{ submission.status === 'returned' ? 'Resubmit' : 'Submit for Review' }}
          </button>

          <span v-if="!canSubmit" class="validation-message">
            Please complete at least one student assessment before submitting.
          </span>
        </div>
      </div>

      <div v-if="saveStatus" :class="['save-status', `status-${saveStatus.type}`]">
        {{ saveStatus.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  createMonthlySubmission,
  updateMonthlySubmissionScore,
} from '@/modules/preschool/services/preschoolApi'
import http from '@/services/http'

const props = defineProps({
  submission: {
    type: Object,
    required: true
  },
  loading: Boolean
})

const emit = defineEmits(['update', 'submit', 'close'])

// State
const formData = ref({
  class_id: props.submission?.class_id || '',
  assessment_category_id: props.submission?.assessment_category_id || ''
})
const students = ref([])
const studentScores = ref({})
const availableClasses = ref([])
const availableCategories = ref([])
const saveStatus = ref(null)

// Computed
const isNewSubmission = computed(() => !props.submission.id)
const isEditable = computed(() => {
  return props.submission.status === 'draft' || props.submission.status === 'returned'
})

const totalCount = computed(() => students.value.length)
const completedCount = computed(() => {
  return students.value.filter(s => studentScores.value[s.id]?.score !== null && studentScores.value[s.id]?.score !== undefined).length
})

const canSubmit = computed(() => completedCount.value > 0)

// Methods
const loadClasses = async () => {
  try {
    const response = await http.get('/api/preschool/classes')
    availableClasses.value = response.data?.data || []
  } catch (error) {
    console.error('Failed to load classes:', error)
  }
}

const loadCategories = async () => {
  try {
    const response = await http.get('/api/preschool/assessment-categories?active=true')
    availableCategories.value = response.data?.data || []
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const loadStudents = async () => {
  const classId = formData.value.class_id || props.submission?.class_id
  if (!classId) return

  try {
    const response = await http.get(`/api/preschool/classes/${classId}/students?active=true`)
    students.value = response.data?.data || []

    // Initialize scores from submission
    if (props.submission.student_assessments) {
      props.submission.student_assessments.forEach(assessment => {
        studentScores.value[assessment.student_id] = {
          score: assessment.score,
          rating: assessment.rating,
          observation: assessment.observation,
          teacher_comment: assessment.teacher_comment
        }
      })
    }
  } catch (error) {
    console.error('Failed to load students:', error)
  }
}

const onClassChange = () => {
  loadStudents()
}

const getStudentScore = (studentId) => {
  return studentScores.value[studentId] || {}
}

const updateScore = (studentId, field, event) => {
  if (!studentScores.value[studentId]) {
    studentScores.value[studentId] = {}
  }
  studentScores.value[studentId][field] = event.target.value
}

const saveDraft = async () => {
  try {
    const payload = {
      academic_year_id: props.submission.academic_year_id,
      class_id: formData.value.class_id || props.submission.class_id,
      assessment_category_id: formData.value.assessment_category_id || props.submission.assessment_category_id
    }

    let submissionId
    if (isNewSubmission.value) {
      const response = await createMonthlySubmission(payload)
      submissionId = response.id
    } else {
      submissionId = props.submission.id
    }

    // Save student scores
    for (const studentId in studentScores.value) {
      const score = studentScores.value[studentId]
      if (score.score !== null && score.score !== undefined) {
        await updateMonthlySubmissionScore(submissionId, studentId, score)
      }
    }

    saveStatus.value = { type: 'success', message: 'Draft saved successfully' }
    setTimeout(() => { saveStatus.value = null }, 3000)
  } catch (error) {
    saveStatus.value = {
      type: 'error',
      message: error?.message || 'Failed to save draft'
    }
  }
}

const submitAssessment = async () => {
  if (!canSubmit.value) {
    saveStatus.value = {
      type: 'error',
      message: 'Please complete at least one student assessment'
    }
    return
  }

  try {
    // First save all scores
    await saveDraft()

    // Then submit
    emit('submit', props.submission)
  } catch (error) {
    saveStatus.value = {
      type: 'error',
      message: error.response?.data?.message || 'Failed to submit assessment'
    }
  }
}

const formatStatus = (status) => {
  const statuses = {
    draft: 'Draft',
    submitted: 'Submitted',
    returned: 'Returned',
    finalized: 'Finalized',
    archived: 'Archived'
  }
  return statuses[status] || status
}

const formatMonth = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadClasses()
  loadCategories()
  loadStudents()
})
</script>

<style scoped>
.submission-detail-editor {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  max-height: 900px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-info h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.submission-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.meta-divider {
  color: #d1d5db;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
}

.btn-close:hover {
  color: #374151;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.section:last-of-type {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.progress-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-value {
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.student-scores {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.score-entry {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  background: #fafbfc;
}

.student-info {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.student-name {
  font-weight: 600;
  font-size: 1rem;
  color: #374151;
}

.student-id {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.score-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
}

.score-input {
  max-width: 150px;
}

.no-students {
  text-align: center;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  color: #6b7280;
}

.feedback-section {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 0.375rem;
  padding: 1rem;
}

.feedback-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feedback-item label {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.25rem;
}

.feedback-item p {
  margin: 0;
  padding: 0.75rem;
  background: white;
  border-radius: 0.25rem;
  color: #374151;
}

.editor-footer {
  border-top: 1px solid #e5e7eb;
  padding: 1.5rem;
  background: #f9fafb;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #d1d5db;
}

.btn-default {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-default:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.validation-message {
  font-size: 0.85rem;
  color: #dc2626;
}

.save-status {
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.save-status.status-success {
  background: #dcfce7;
  color: #166534;
}

.save-status.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-draft {
  background: #dbeafe;
  color: #1e40af;
}

.badge-submitted {
  background: #fef3c7;
  color: #92400e;
}

.badge-returned {
  background: #fee2e2;
  color: #991b1b;
}

@media (max-width: 768px) {
  .submission-detail-editor {
    height: auto;
    max-height: none;
  }

  .score-inputs {
    grid-template-columns: 1fr;
  }

  .footer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
