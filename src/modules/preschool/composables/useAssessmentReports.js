import { computed } from 'vue'
import { useAssessmentStore } from '../stores/assessmentStore'

/**
 * useAssessmentReports - Composable for assessment analytics and reporting
 *
 * Reporting is derived from the canonical Preschool assessment store so the
 * analytics views stay in sync with the list and builder workflows.
 *
 * Responsibilities:
 * - Calculate summary statistics
 * - Analyze assessment trends
 * - Identify risk levels
 * - Generate category performance metrics
 * - Calculate student progress
 */
export function useAssessmentReports() {
  const store = useAssessmentStore()

  // ============================================================================
  // SUMMARY STATISTICS
  // ============================================================================

  /**
   * Overall summary statistics
   */
  const summaryStats = computed(() => {
    const finalized = store.assessments.filter(a => a.status === 'finalized')
    const scores = finalized.map(a => parseFloat(a.score) || 0).filter(s => s >= 0)

    return {
      total: store.assessments.length,
      completed: finalized.length,
      pending: store.assessments.filter(a => a.status === 'draft').length,
      average: scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
        : null,
      highest: scores.length > 0 ? Math.max(...scores) : null,
      lowest: scores.length > 0 ? Math.min(...scores) : null,
      median: scores.length > 0 ? calculateMedian(scores) : null,
    }
  })

  /**
   * Count assessments by status
   */
  const statusDistribution = computed(() => store.statusCounts)

  /**
   * Count assessments by rating
   */
  const ratingDistribution = computed(() => {
    const finalized = store.assessments.filter(a => a.status === 'finalized')
    return {
      excellent: finalized.filter(a => a.rating === 'Excellent').length,
      good: finalized.filter(a => a.rating === 'Good').length,
      fair: finalized.filter(a => a.rating === 'Fair').length,
      needsImprovement: finalized.filter(a => a.rating === 'Needs Improvement').length,
    }
  })

  // ============================================================================
  // CATEGORY PERFORMANCE
  // ============================================================================

  /**
   * Performance metrics by category
   */
  const categoryPerformance = computed(() => {
    const performance = {}

    store.categories.forEach(category => {
      const categoryAssessments = store.assessments.filter(
        a => a.categoryId === category.id && a.status === 'finalized'
      )

      if (categoryAssessments.length === 0) {
        performance[category.id] = {
          categoryId: category.id,
          categoryName: category.name,
          count: 0,
          average: null,
          highest: null,
          lowest: null,
          excellentCount: 0,
          goodCount: 0,
          fairCount: 0,
          needsImprovementCount: 0,
        }
        return
      }

      const scores = categoryAssessments.map(a => parseFloat(a.score) || 0)

      performance[category.id] = {
        categoryId: category.id,
        categoryName: category.name,
        count: categoryAssessments.length,
        average: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
        highest: Math.max(...scores),
        lowest: Math.min(...scores),
        excellentCount: categoryAssessments.filter(a => a.rating === 'Excellent').length,
        goodCount: categoryAssessments.filter(a => a.rating === 'Good').length,
        fairCount: categoryAssessments.filter(a => a.rating === 'Fair').length,
        needsImprovementCount: categoryAssessments.filter(a => a.rating === 'Needs Improvement').length,
      }
    })

    return performance
  })

  /**
   * Category performance as array (sorted by average score)
   */
  const categoryPerformanceArray = computed(() => {
    return Object.values(categoryPerformance.value)
      .filter(p => p.count > 0)
      .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
  })

  // ============================================================================
  // STUDENT PERFORMANCE
  // ============================================================================

  /**
   * Average scores per student
   */
  const studentPerformance = computed(() => store.averageByStudent)

  /**
   * Student performance as array (sorted by average score)
   */
  const studentPerformanceArray = computed(() => {
    return Object.values(studentPerformance.value)
      .filter(p => p.average !== null)
      .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
  })

  /**
   * Get top performers
   * @param {number} limit - Number of top performers to return
   */
  const topPerformers = computed(() => (limit = 5) => {
    return studentPerformanceArray.value.slice(0, limit)
  })

  /**
   * Get students needing improvement
   * @param {number} threshold - Score threshold
   * @param {number} limit - Number of students to return
   */
  const studentsNeedingImprovement = computed(() => (threshold = 60, limit = 5) => {
    return studentPerformanceArray.value
      .filter(p => parseFloat(p.average) < threshold)
      .slice(0, limit)
  })

  // ============================================================================
  // RISK ANALYSIS
  // ============================================================================

  /**
   * Define risk levels based on score
   */
  const getRiskLevel = (score) => {
    const s = parseFloat(score) || 0
    if (s >= 80) return { level: 'excellent', color: '#10b981' }
    if (s >= 70) return { level: 'good', color: '#3b82f6' }
    if (s >= 60) return { level: 'fair', color: '#f59e0b' }
    return { level: 'at-risk', color: '#ef4444' }
  }

  /**
   * Assessments by risk level
   */
  const riskAnalysis = computed(() => {
    const finalized = store.assessments.filter(a => a.status === 'finalized')
    return {
      excellent: finalized.filter(a => parseFloat(a.score) >= 80).length,
      good: finalized.filter(a => parseFloat(a.score) >= 70 && parseFloat(a.score) < 80).length,
      fair: finalized.filter(a => parseFloat(a.score) >= 60 && parseFloat(a.score) < 70).length,
      atRisk: finalized.filter(a => parseFloat(a.score) < 60).length,
    }
  })

  /**
   * Get high-risk students (score < 60)
   */
  const highRiskStudents = computed(() => {
    return store.assessments
      .filter(a => a.status === 'finalized' && parseFloat(a.score) < 60)
      .sort((a, b) => parseFloat(a.score) - parseFloat(b.score))
  })

  /**
   * Get moderate-risk students (score 60-70)
   */
  const moderateRiskStudents = computed(() => {
    return store.assessments
      .filter(a => a.status === 'finalized' && parseFloat(a.score) >= 60 && parseFloat(a.score) < 70)
      .sort((a, b) => parseFloat(a.score) - parseFloat(b.score))
  })

  // ============================================================================
  // TRENDS
  // ============================================================================

  /**
   * Assessment timeline data (for chart)
   */
  const assessmentTimeline = computed(() => {
    const grouped = {}

    store.assessments
      .filter(a => a.status === 'finalized')
      .forEach(a => {
        const date = a.assessmentDate || 'Unknown'
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(a)
      })

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, assessments]) => ({
        date,
        count: assessments.length,
        average: (
          assessments.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0) / assessments.length
        ).toFixed(2),
      }))
  })

  /**
   * Period comparison
   */
  const periodComparison = computed(() => {
    const grouped = {}

    store.assessments
      .filter(a => a.status === 'finalized')
      .forEach(a => {
        const period = a.periodLabel || 'Unknown'
        if (!grouped[period]) {
          grouped[period] = []
        }
        grouped[period].push(a)
      })

    return Object.entries(grouped)
      .map(([period, assessments]) => ({
        period,
        count: assessments.length,
        average: (
          assessments.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0) / assessments.length
        ).toFixed(2),
        excellent: assessments.filter(a => a.rating === 'Excellent').length,
        good: assessments.filter(a => a.rating === 'Good').length,
        fair: assessments.filter(a => a.rating === 'Fair').length,
        needsImprovement: assessments.filter(a => a.rating === 'Needs Improvement').length,
      }))
  })

  // ============================================================================
  // HEATMAP DATA (for Student x Category matrix)
  // ============================================================================

  /**
   * Heatmap data for visualization
   * Returns matrix of students × categories with average scores
   */
  const heatmapData = computed(() => {
    const studentMap = {}

    store.assessments
      .filter(a => a.status === 'finalized')
      .forEach(a => {
        if (!studentMap[a.studentId]) {
          studentMap[a.studentId] = {
            studentId: a.studentId,
            studentName: a.student?.fullName || 'Unknown',
            categories: {},
          }
        }

        if (!studentMap[a.studentId].categories[a.categoryId]) {
          studentMap[a.studentId].categories[a.categoryId] = []
        }

        studentMap[a.studentId].categories[a.categoryId].push(parseFloat(a.score) || 0)
      })

    // Calculate averages
    Object.values(studentMap).forEach(student => {
      Object.keys(student.categories).forEach(categoryId => {
        const scores = student.categories[categoryId]
        student.categories[categoryId] = {
          average: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
          risk: getRiskLevel((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)).level,
        }
      })
    })

    return Object.values(studentMap)
  })

  // ============================================================================
  // EXPORT DATA
  // ============================================================================

  /**
   * Prepare data for export (CSV/Excel)
   */
  const exportData = computed(() => {
    return store.assessments
      .filter(a => a.status === 'finalized')
      .map(a => ({
        'Student': a.student?.fullName || '-',
        'Class': a.class?.name || '-',
        'Category': a.category?.name || '-',
        'Period': a.periodLabel || '-',
        'Date': a.assessmentDate || '-',
        'Score': a.score || '-',
        'Rating': a.rating || '-',
        'Observation': a.observation || '-',
        'Teacher Comment': a.teacherComment || '-',
      }))
  })

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Calculate median of array
   */
  function calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
  }

  /**
   * Get percentage of students in risk level
   */
  function getRiskPercentage(riskLevel) {
    const finalized = store.assessments.filter(a => a.status === 'finalized')
    if (finalized.length === 0) return 0

    const count = riskAnalysis.value[riskLevel === 'at-risk' ? 'atRisk' : riskLevel]
    return ((count / finalized.length) * 100).toFixed(1)
  }

  /**
   * Get improvement trend (comparing periods)
   */
  function getImprovementTrend() {
    const periods = periodComparison.value
    if (periods.length < 2) return null

    const firstAverage = parseFloat(periods[0].average)
    const lastAverage = parseFloat(periods[periods.length - 1].average)
    const change = lastAverage - firstAverage

    return {
      improved: change > 0,
      change: Math.abs(change).toFixed(2),
      percentage: ((change / firstAverage) * 100).toFixed(1),
    }
  }

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    // Summary statistics
    summaryStats,
    statusDistribution,
    ratingDistribution,

    // Category performance
    categoryPerformance,
    categoryPerformanceArray,

    // Student performance
    studentPerformance,
    studentPerformanceArray,
    topPerformers,
    studentsNeedingImprovement,

    // Risk analysis
    riskAnalysis,
    highRiskStudents,
    moderateRiskStudents,
    getRiskLevel,
    getRiskPercentage,

    // Trends
    assessmentTimeline,
    periodComparison,
    getImprovementTrend,

    // Heatmap
    heatmapData,

    // Export
    exportData,

    // Store references
    assessments: computed(() => store.assessments),
    categories: computed(() => store.categories),
  }
}
