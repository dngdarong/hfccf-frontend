<script setup>
import Avatar from 'primevue/avatar'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'StudentProfilePDFDocument',
})

const { t } = useLanguage()

const props = defineProps({
  student: {
    type: Object,
    required: true,
  },
  attendance: {
    type: Object,
    default: null,
  },
})

const formatDate = (dateString) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

const attendanceSummary = computed(() => {
  if (!props.attendance || !props.attendance.items) {
    return {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      percentage: 0,
    }
  }

  const items = props.attendance.items || []
  const present = items.filter(a => a.status === 'present').length
  const absent = items.filter(a => a.status === 'absent').length
  const late = items.filter(a => a.status === 'late').length
  const excused = items.filter(a => a.status === 'excused').length
  const total = items.length

  return {
    present,
    absent,
    late,
    excused,
    total,
    percentage: total > 0 ? Math.round((present / total) * 100) : 0,
  }
})
</script>

<template>
  <div class="pdf-document">
    <!-- Organization Header -->
    <div class="header-section">
      <p class="org-name-kh">ព្រះរាជាណាចព្ដរកម្ពុជា</p>
      <p class="org-motto">ជាតិ សាសនា ព្រះម្ហារ</p>
      <hr class="divider" />
      <p class="org-label">អង្គការម្ូលនិធិរតីសង្ឃម្ឹរមាុ ររម្ពុជា</p>
      <p class="org-subtitle">HFCCF - មជ្ឈមណ្ឌលសម្រាប់ក្មេងរៀង</p>
    </div>

    <!-- Title -->
    <div class="title-section">
      <h1 class="document-title">ឯកសារលម្អិតលិខិត</h1>
      <p class="document-subtitle">ព័ត៌មានលម្អិតលិខិត</p>
    </div>

    <!-- Main Content -->
    <div class="content-section">
      <!-- Photo Column -->
      <div class="photo-column">
        <div class="photo-container">
          <Avatar
            v-if="student.avatarUrl"
            :image="student.avatarUrl"
            size="xlarge"
            shape="circle"
            class="student-photo"
          />
          <div v-else class="photo-placeholder">
            <i class="pi pi-user" />
          </div>
        </div>
      </div>

      <!-- Info Column -->
      <div class="info-column">
        <!-- Student Information Section -->
        <div class="info-section">
          <h2 class="section-title">ព័ត៌មាននលម្អិតលិខិត</h2>

          <div class="info-row">
            <span class="info-label">គោតនាម-នាម៖</span>
            <span class="info-value">{{ student.fullName || '—' }}</span>
            <span class="info-label">គេទ៖</span>
            <span class="info-value">{{ student.gender || '—' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">គ្មោះជាឡាតាំង៖</span>
            <span class="info-value">{{ student.latinName || '—' }}</span>
            <span class="info-label">លេខលេងសម្គាល់៖</span>
            <span class="info-value">{{ student.studentCode || student.publicId || '—' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">ថ្ងៃខែឆ្នាំកំណើត៖</span>
            <span class="info-value">{{ formatDate(student.dateOfBirth) }}</span>
            <span class="info-label">សញ្ជាតិ៖</span>
            <span class="info-value">{{ student.nationality || '—' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">ជនជាតិ៖</span>
            <span class="info-value">{{ student.ethnicity || '—' }}</span>
            <span class="info-label">ស្ថានភាព៖</span>
            <span class="info-value">{{ student.status || '—' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">ថ្នាក់៖</span>
            <span class="info-value">{{ student.classes?.[0]?.name || '—' }}</span>
            <span class="info-label">ឆ្នាំសិក្សា៖</span>
            <span class="info-value">{{ student.classes?.[0]?.academicYear || '—' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">ថ្ងៃចូលរៀន៖</span>
            <span class="info-value">{{ formatDate(student.classes?.[0]?.enrolledAt) }}</span>
          </div>
        </div>

        <!-- Guardian Information Section -->
        <div class="info-section">
          <h2 class="section-title">ព័ត៌មានលម្អិតលិខិត</h2>

          <div class="info-row">
            <span class="info-label">គោតនាម-នាម៖</span>
            <span class="info-value">{{ student.guardianName || '—' }}</span>
            <span class="info-label">ទំនាស់ស័ក្ដិ៖</span>
            <span class="info-value">{{ student.guardianType || '—' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">ថ្ងៃខែឆ្នាំកំណើត៖</span>
            <span class="info-value">—</span>
            <span class="info-label">លេខទូរស័ព្ទ៖</span>
            <span class="info-value">{{ student.guardianPhone || '—' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">ទីកន្លែងកំណើត៖</span>
            <span class="info-value">{{ student.placeOfBirth || '—' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">អាសយដ្ឋាន៖</span>
            <span class="info-value">{{ student.address || student.currentResidenceDisplay || '—' }}</span>
          </div>
        </div>

        <!-- Attendance Section -->
        <div v-if="props.attendance" class="info-section">
          <h2 class="section-title">សង្ខេបការចូលរៀន</h2>

          <div class="info-row">
            <span class="info-label">ភាគរយការចូលរៀន៖</span>
            <span class="info-value">{{ attendanceSummary.percentage }}%</span>
            <span class="info-label">ចំនួនថ្ងៃសរុប៖</span>
            <span class="info-value">{{ attendanceSummary.total }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">វត្តមាន៖</span>
            <span class="info-value">{{ attendanceSummary.present }}</span>
            <span class="info-label">អវត្តមាន៖</span>
            <span class="info-value">{{ attendanceSummary.absent }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">មកយឺត៖</span>
            <span class="info-value">{{ attendanceSummary.late }}</span>
            <span class="info-label">បានលិច៖</span>
            <span class="info-value">{{ attendanceSummary.excused }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-section">
      <p>បង្កើតដោយ HFCCF Preschool Management System</p>
      <p>ថ្ងៃបង្កើត៖ {{ formatDate(new Date().toISOString()) }}</p>
    </div>
  </div>
</template>

<style scoped>
.pdf-document {
  background: white;
  color: #000;
  font-family: 'Khmer OS', 'Arial Unicode MS', sans-serif;
  max-width: 210mm;
  margin: 0 auto;
  padding: 20mm;
  line-height: 1.6;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #000;
  padding-bottom: 15px;
}

.org-name-kh {
  font-size: 14pt;
  font-weight: bold;
  margin: 0 0 3px 0;
  letter-spacing: 1px;
}

.org-motto {
  font-size: 11pt;
  font-weight: bold;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.divider {
  border: none;
  border-top: 1px solid #000;
  margin: 5px 0;
}

.org-label {
  font-size: 10pt;
  font-weight: bold;
  margin: 5px 0 3px 0;
}

.org-subtitle {
  font-size: 9pt;
  margin: 0;
  color: #333;
}

/* Title Section */
.title-section {
  text-align: center;
  margin-bottom: 15px;
}

.document-title {
  font-size: 16pt;
  font-weight: bold;
  margin: 0 0 5px 0;
  letter-spacing: 1px;
}

.document-subtitle {
  font-size: 12pt;
  font-weight: bold;
  margin: 0;
  color: #333;
}

/* Content Section */
.content-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.photo-column {
  flex: 0 0 auto;
  text-align: center;
}

.photo-container {
  width: 120px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
}

.student-photo {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

.photo-placeholder {
  width: 120px;
  height: 150px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 48px;
}

.info-column {
  flex: 1;
  min-width: 0;
}

/* Info Sections */
.info-section {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
}

.info-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 11pt;
  font-weight: bold;
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #000;
}

/* Info Rows */
.info-row {
  display: grid;
  grid-template-columns: 120px 1fr 120px 1fr;
  gap: 10px;
  margin-bottom: 4px;
  font-size: 10pt;
  align-items: baseline;
}

.info-label {
  font-weight: bold;
  color: #000;
  padding-right: 5px;
}

.info-value {
  color: #000;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Footer */
.footer-section {
  text-align: center;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #000;
  font-size: 9pt;
  color: #666;
}

.footer-section p {
  margin: 3px 0;
}

/* Print Media */
@media print {
  .pdf-document {
    max-width: 100%;
    margin: 0;
    padding: 0;
  }

  .content-section {
    page-break-inside: avoid;
  }

  .info-section {
    page-break-inside: avoid;
  }
}
</style>
