import html2pdf from 'html2pdf.js'

// Lazy load XLSX to reduce bundle size
let XLSX

async function loadXLSX() {
  if (!XLSX) {
    XLSX = await import('xlsx')
  }
  return XLSX
}

// Tailwind color to HEX mapping for PDF-safe colors (oklch-free)
const TAILWIND_COLOR_MAP = {
  // Slates
  'rgb(248, 250, 252)': '#f8fafc', // slate-50
  'rgb(241, 245, 249)': '#f1f5f9', // slate-100
  'rgb(226, 232, 240)': '#e2e8f0', // slate-200
  'rgb(203, 213, 225)': '#cbd5e1', // slate-300
  'rgb(148, 163, 184)': '#94a3b8', // slate-400
  'rgb(100, 116, 139)': '#64748b', // slate-500
  'rgb(71, 85, 99)': '#475563', // slate-600
  'rgb(51, 65, 85)': '#334155', // slate-700
  'rgb(30, 41, 59)': '#1e293b', // slate-800
  'rgb(15, 23, 42)': '#0f172a', // slate-900

  // Greens
  'rgb(240, 253, 244)': '#f0fdf4', // green-50
  'rgb(220, 252, 231)': '#dcfce7', // green-100
  'rgb(187, 247, 208)': '#bbf7d0', // green-200
  'rgb(134, 239, 172)': '#86efac', // green-300
  'rgb(74, 222, 128)': '#4ade80',  // green-400
  'rgb(34, 197, 94)': '#22c55e',   // green-500
  'rgb(22, 163, 74)': '#16a34a',   // green-600
  'rgb(16, 185, 129)': '#10b981',  // green-600-alt
  'rgb(21, 128, 61)': '#15803d',   // green-700
  'rgb(5, 150, 105)': '#059669',   // green-700-alt
  'rgb(6, 78, 59)': '#064e3b',     // green-900

  // Reds
  'rgb(254, 242, 242)': '#fef2f2', // red-50
  'rgb(254, 226, 226)': '#fee2e2', // red-100
  'rgb(254, 202, 202)': '#fecaca', // red-200
  'rgb(252, 165, 165)': '#fca5a5', // red-300
  'rgb(248, 113, 113)': '#f87171', // red-400
  'rgb(239, 68, 68)': '#ef4444',   // red-500
  'rgb(220, 38, 38)': '#dc2626',   // red-600
  'rgb(185, 28, 28)': '#b91c1c',   // red-700
  'rgb(127, 29, 29)': '#7f1d1d',   // red-900

  // Yellows
  'rgb(254, 252, 232)': '#fffce8', // yellow-50
  'rgb(254, 248, 204)': '#fef8cc', // yellow-100
  'rgb(253, 230, 138)': '#fde68a', // yellow-300
  'rgb(250, 204, 21)': '#facc15',  // yellow-400
  'rgb(234, 179, 8)': '#eab308',   // yellow-500
  'rgb(202, 138, 4)': '#ca8a04',   // yellow-600
  'rgb(161, 98, 7)': '#a16207',    // yellow-700
  'rgb(113, 63, 18)': '#713f12',   // yellow-800

  // Blues
  'rgb(239, 246, 255)': '#eff6ff', // blue-50
  'rgb(219, 234, 254)': '#dbeafe', // blue-100
  'rgb(191, 219, 254)': '#bfdbfe', // blue-200
  'rgb(147, 197, 253)': '#93c5fd', // blue-300
  'rgb(96, 165, 250)': '#60a5fa',  // blue-400
  'rgb(59, 130, 246)': '#3b82f6',  // blue-500
  'rgb(37, 99, 235)': '#2563eb',   // blue-600
  'rgb(29, 78, 216)': '#1d4ed8',   // blue-700
  'rgb(30, 58, 138)': '#1e3a8a',   // blue-900

  // Grays
  'rgb(249, 250, 251)': '#f9fafb', // gray-50
  'rgb(243, 244, 246)': '#f3f4f6', // gray-100
  'rgb(229, 231, 235)': '#e5e7eb', // gray-200
  'rgb(209, 213, 219)': '#d1d5db', // gray-300
  'rgb(156, 163, 175)': '#9ca3af', // gray-400
  'rgb(107, 114, 128)': '#6b7280', // gray-500
  'rgb(75, 85, 99)': '#4b5563',    // gray-600
  'rgb(55, 65, 81)': '#374151',    // gray-700
  'rgb(31, 41, 55)': '#1f2937',    // gray-800
  'rgb(17, 24, 39)': '#111827',    // gray-900

  // Whites and blacks
  'rgb(255, 255, 255)': '#ffffff',  // white
  'rgb(0, 0, 0)': '#000000',        // black
}

class ExportError extends Error {
  constructor(message, reportType, context = {}) {
    super(message)
    this.name = 'ExportError'
    this.reportType = reportType
    this.context = context
  }
}

class AuthorizationError extends Error {
  constructor(message, reportType, context = {}) {
    super(message)
    this.name = 'AuthorizationError'
    this.reportType = reportType
    this.context = context
  }
}

/**
 * Sanitize oklch() and other unsupported CSS colors in cloned DOM
 * Converts computed styles to safe HEX/RGB values that html2canvas can handle
 */
function sanitizeColorsInClonedElement(clonedElement) {
  if (!clonedElement) return

  const walk = (element) => {
    if (!element || element.nodeType !== 1) return

    try {
      const computedStyle = window.getComputedStyle(element)

      // Sanitize color property
      if (computedStyle.color) {
        const safeColor = convertColorToSafe(computedStyle.color)
        if (safeColor !== computedStyle.color) {
          element.style.color = safeColor
        }
      }

      // Sanitize background-color property
      if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const safeColor = convertColorToSafe(computedStyle.backgroundColor)
        if (safeColor !== computedStyle.backgroundColor) {
          element.style.backgroundColor = safeColor
        }
      }

      // Sanitize border-color property
      if (computedStyle.borderColor) {
        const safeColor = convertColorToSafe(computedStyle.borderColor)
        if (safeColor !== computedStyle.borderColor) {
          element.style.borderColor = safeColor
        }
      }
    } catch (error) {
      // Silently ignore errors on individual elements
      console.debug(`Color sanitization error for element: ${error.message}`)
    }

    // Recurse to children
    for (let child of element.childNodes) {
      if (child.nodeType === 1) {
        walk(child)
      }
    }
  }

  walk(clonedElement)
}

/**
 * Convert a computed color to a safe HEX/RGB value
 * Handles oklch(), rgb(), rgba(), hex, named colors
 */
function convertColorToSafe(colorValue) {
  if (!colorValue) return colorValue

  // Trim whitespace
  colorValue = colorValue.trim()

  // Check if it's already a safe format (HEX or RGB)
  if (colorValue.startsWith('#') || colorValue.startsWith('rgb')) {
    return colorValue
  }

  // Check against Tailwind color map (for rgb() values)
  if (TAILWIND_COLOR_MAP[colorValue]) {
    return TAILWIND_COLOR_MAP[colorValue]
  }

  // Handle oklch() colors - these are unsupported by html2canvas
  if (colorValue.includes('oklch')) {
    console.debug(`Detected unsupported oklch() color: ${colorValue}`)
    // Fallback to a neutral color based on context
    if (colorValue.includes('0.')) {
      return '#f8fafc' // Light neutral
    } else {
      return '#4b5563' // Dark neutral
    }
  }

  // Handle color-mix() - also unsupported
  if (colorValue.includes('color-mix')) {
    console.debug(`Detected unsupported color-mix() color: ${colorValue}`)
    return '#e5e7eb' // Medium gray fallback
  }

  // Default: return original if we can't convert
  return colorValue
}

export const reportExportService = {
  /**
   * Export report to PDF using html2pdf.js + jsPDF
   * Captures DOM element and converts to PDF via html2canvas
   * Note: This uses html2canvas which converts to images. For Khmer text support,
   * ensure Noto Sans Khmer font is loaded from Google Fonts and available.
   * Automatically sanitizes unsupported CSS colors (oklch, color-mix, etc.)
   */
  async exportToPDF(reportType, reportData, options = {}) {
    try {
      this.validateExportData(reportType, reportData)

      const element = document.querySelector('.report-export-content')
      if (!element) {
        throw new ExportError(
          'Report content element not found. Please regenerate the report.',
          reportType,
          { elementClass: '.report-export-content' },
        )
      }

      if (!element.offsetHeight) {
        throw new ExportError(
          'Report content is not visible. Please ensure the report is fully loaded.',
          reportType,
          { elementHeight: element.offsetHeight },
        )
      }

      const filename = options.filename || this.generateFilename(reportType, reportData)
      const orientation = options.orientation || 'portrait'
      const margin = options.margin || [25.4, 25.4, 25.4, 25.4]

      // Clone element to avoid modifying DOM
      const clonedElement = element.cloneNode(true)

      // Remove UI elements from cloned element (filters, buttons, export controls)
      const elementsToRemove = clonedElement.querySelectorAll('.no-print, [data-no-print]')
      elementsToRemove.forEach(el => el.remove())

      // Strip unsupported CSS colors for html2pdf compatibility
      this._stripUnsupportedCSSFromElement(clonedElement)

      const pdfOptions = {
        margin,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          letterRendering: true,
          ignoreElements: (element) => {
            return element.classList && (element.classList.contains('no-print') || element.hasAttribute('data-no-print'))
          }
        },
        jsPDF: { orientation, unit: 'mm', format: 'a4' },
      }

      return new Promise((resolve, reject) => {
        html2pdf()
          .set(pdfOptions)
          .from(clonedElement)
          .save()
          .then(() => {
            resolve()
          })
          .catch((error) => {
            // If we get an oklch error, try sanitizing and retry once
            if (error.message && error.message.includes('oklch')) {
              console.warn('Detected oklch() color error, attempting to sanitize...')
              try {
                sanitizeColorsInClonedElement(clonedElement)
                html2pdf()
                  .set(pdfOptions)
                  .from(clonedElement)
                  .save()
                  .then(() => resolve())
                  .catch((retryError) => {
                    reject(new ExportError(`Failed to generate PDF after color sanitization: ${retryError.message}`, reportType, { originalError: retryError }))
                  })
              } catch (sanitizeError) {
                reject(new ExportError(`Color sanitization failed: ${sanitizeError.message}`, reportType, { originalError: error }))
              }
            } else {
              reject(new ExportError(`Failed to generate PDF: ${error.message}`, reportType, { originalError: error }))
            }
          })
      })
    } catch (error) {
      if (error instanceof ExportError) {
        throw error
      }
      throw new ExportError(`Failed to export PDF: ${error.message}`, reportType, { originalError: error })
    }
  },

  /**
   * Strip unsupported CSS color functions (like oklch) from element for html2pdf compatibility
   */
  _stripUnsupportedCSSFromElement(element) {
    // Add a style tag with CSS that overrides oklch colors
    const styleTag = document.createElement('style')
    styleTag.textContent = `
      * {
        color: black !important;
        background-color: transparent !important;
        border-color: #ccc !important;
      }
      [style*="oklch"] {
        color: black !important;
      }
    `
    element.insertBefore(styleTag, element.firstChild)

    const walk = (el) => {
      if (el.style) {
        // Remove oklch colors from inline styles
        if (el.style.color && el.style.color.includes('oklch')) {
          el.style.color = '#000'
        }
        if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
          el.style.backgroundColor = 'transparent'
        }
        if (el.style.borderColor && el.style.borderColor.includes('oklch')) {
          el.style.borderColor = '#ccc'
        }
      }

      // Walk through children
      for (let child of el.childNodes) {
        if (child.nodeType === 1) { // Element node
          walk(child)
        }
      }
    }

    walk(element)
  },

  /**
   * Export report to Excel using XLSX library
   * Creates multi-sheet workbook based on report type
   */
  async exportToExcel(reportType, reportData, options = {}) {
    try {
      this.validateExportData(reportType, reportData)

      const lib = await loadXLSX()
      const filename = options.filename || this.generateFilename(reportType, reportData)
      const workbook = lib.utils.book_new()

      // Generate sheets based on report type
      if (reportType === 'summary') {
        this._buildSummarySheets(workbook, reportData, lib)
      } else if (reportType === 'attendance') {
        this._buildAttendanceSheets(workbook, reportData, lib)
      } else if (reportType === 'assessment') {
        this._buildAssessmentSheets(workbook, reportData, lib)
      }

      lib.writeFile(workbook, `${filename}.xlsx`)
    } catch (error) {
      if (error instanceof ExportError) {
        throw error
      }
      throw new ExportError(`Failed to export Excel: ${error.message}`, reportType, { originalError: error })
    }
  },

  /**
   * Export report to print using browser print dialog
   * Report content is shown, UI elements hidden via @media print CSS
   * Print-only CSS must hide filters, buttons, export controls, and other UI
   */
  exportToPrint(reportType, reportData) {
    try {
      this.validateExportData(reportType, reportData)

      const element = document.querySelector('.report-export-content')
      if (!element) {
        throw new ExportError(
          'Report content element not found. Please regenerate the report.',
          reportType,
          { elementClass: '.report-export-content' },
        )
      }

      window.print()
    } catch (error) {
      if (error instanceof ExportError) {
        throw error
      }
      throw new ExportError(`Failed to open print dialog: ${error.message}`, reportType)
    }
  },

  /**
   * Generate filename based on report type and data
   * Format: [ReportType]-[Scope]-[StudentName]-[YYYY-MM-DD]
   */
  generateFilename(reportType, reportData) {
    try {
      let scope = 'Unknown'
      let studentName = 'Report'

      if (reportType === 'summary') {
        scope = reportData.scope === 'class' ? 'Class' : 'Individual'
        if (reportData.scope === 'individual' && reportData.student?.fullName) {
          studentName = reportData.student.fullName
        } else if (reportData.scope === 'class' && reportData.class?.name) {
          studentName = reportData.class.name
        }
      } else if (reportType === 'attendance') {
        scope = reportData.mode === 'monthly' ? 'Monthly' : 'Yearly'
        studentName = reportData.class?.name || 'Attendance'
      } else if (reportType === 'assessment') {
        scope = reportData.scope === 'class' ? 'Class' : 'Individual'
        if (reportData.scope === 'individual' && reportData.student?.fullName) {
          studentName = reportData.student.fullName
        } else if (reportData.scope === 'class' && reportData.class?.name) {
          studentName = reportData.class.name
        }
      }

      const reportTypeLabel = {
        summary: 'StudentSummaryReport',
        attendance: 'AttendanceReport',
        assessment: 'AssessmentReport',
      }[reportType] || 'Report'

      const date = new Date().toISOString().split('T')[0]
      const sanitized = this.sanitizeFilename(studentName)

      return `${reportTypeLabel}-${scope}-${sanitized}-${date}`
    } catch (error) {
      console.error('Error generating filename:', error)
      return `Report-${new Date().toISOString().split('T')[0]}`
    }
  },

  /**
   * Sanitize filename - remove illegal characters
   */
  sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      return 'Report'
    }

    return filename
      .replace(/[<>:"/\\|?*',.]/g, '-') // Remove illegal characters including quotes and punctuation
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .slice(0, 100) // Max 100 chars for name part
  },

  /**
   * Validate export data structure based on report type
   */
  validateExportData(reportType, reportData) {
    if (!reportData || typeof reportData !== 'object') {
      throw new ExportError('Report data is required and must be an object', reportType)
    }

    if (reportType === 'summary') {
      this._validateSummaryData(reportData)
    } else if (reportType === 'attendance') {
      this._validateAttendanceData(reportData)
    } else if (reportType === 'assessment') {
      this._validateAssessmentData(reportData)
    } else {
      throw new ExportError(`Unknown report type: ${reportType}`, reportType)
    }
  },

  /**
   * Validate user has permission to export the requested report
   * Checks scope and data access restrictions
   */
  validateExportAuthorization(reportType, reportData, userPermissions = {}) {
    if (!reportData || typeof reportData !== 'object') {
      throw new AuthorizationError('Report data is required', reportType)
    }

    // For individual-scope reports, verify student data is present
    if (reportData.scope === 'individual') {
      if (!reportData.student || !reportData.student.id) {
        throw new AuthorizationError(
          'Student information is required for individual scope reports',
          reportType,
          { scope: 'individual' },
        )
      }
    }

    // For class-scope reports, verify class data is present
    if (reportData.scope === 'class') {
      if (!reportData.class || !reportData.class.id) {
        throw new AuthorizationError(
          'Class information is required for class scope reports',
          reportType,
          { scope: 'class' },
        )
      }
    }

    // Verify user has appropriate permissions based on report type
    const requiredPermissions = {
      summary: ['preschool.reports.student-summary.view'],
      attendance: ['preschool.reports.attendance.view'],
      assessment: ['preschool.reports.assessment.view'],
    }

    const required = requiredPermissions[reportType] || []
    const hasRequiredPermission = required.length === 0 || required.some((perm) => userPermissions[perm])

    if (!hasRequiredPermission) {
      throw new AuthorizationError(
        `User does not have permission to export ${reportType} reports`,
        reportType,
        { requiredPermissions: required },
      )
    }

    return true
  },

  /**
   * Build summary report sheets
   */
  _buildSummarySheets(workbook, reportData, XLSX) {
    // Sheet 1: Report Info (Metadata)
    const metaData = [['Student Summary Report'], ['Generated On', new Date().toLocaleString()]]

    if (reportData.scope === 'individual') {
      metaData.push(['Type', 'Individual'])
      if (reportData.student?.fullName) {
        metaData.push(['Student', reportData.student.fullName])
      }
    } else {
      metaData.push(['Type', 'Class'])
      if (reportData.class?.name) {
        metaData.push(['Class', reportData.class.name])
      }
    }

    const metaSheet = XLSX.utils.aoa_to_sheet(metaData)
    XLSX.utils.book_append_sheet(workbook, metaSheet, 'Report Info')

    // Sheet 2: Student Info (if individual)
    if (reportData.scope === 'individual' && reportData.student) {
      const studentInfo = [
        ['Field', 'Value'],
        ['First Name', reportData.student.firstName || ''],
        ['Last Name', reportData.student.lastName || ''],
        ['Full Name', reportData.student.fullName || ''],
        ['Enrollment Number', reportData.student.enrollmentNumber || ''],
        ['Date of Birth', reportData.student.dateOfBirth || ''],
        ['Student Code', reportData.student.studentCode || ''],
      ]
      const studentSheet = XLSX.utils.aoa_to_sheet(studentInfo)
      XLSX.utils.book_append_sheet(workbook, studentSheet, 'Student Info')
    }
    // Note: XLSX used in remaining sheets throughout this method

    // Sheet 3: Attendance Summary
    if (reportData.attendance) {
      const attendanceData = [
        ['Metric', 'Value'],
        ['Total Days', reportData.attendance.totalDays || 0],
        ['Present Days', reportData.attendance.presentDays || 0],
        ['Absent Days', reportData.attendance.absentDays || 0],
        ['Attendance Rate', `${reportData.attendance.attendanceRate || 0}%`],
      ]
      const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceData)
      XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance')
    }

    // Sheet 4: Class Students (if class report)
    if (reportData.scope === 'class' && reportData.classStudents?.length > 0) {
      const studentList = [['Student Name', 'Attendance Rate', 'Assessment Score']]
      reportData.classStudents.forEach((student) => {
        studentList.push([
          student.fullName || student.name || '',
          `${student.attendancePercentage || 0}%`,
          student.assessmentScore || '',
        ])
      })
      const classSheet = XLSX.utils.aoa_to_sheet(studentList)
      XLSX.utils.book_append_sheet(workbook, classSheet, 'Class Students')
    }
  },

  /**
   * Build attendance report sheets
   */
  _buildAttendanceSheets(workbook, reportData, XLSX) {
    // Sheet 1: Summary
    const summaryData = [
      ['Attendance Summary'],
      ['Period', reportData.mode === 'monthly' ? `${reportData.period.month}/${reportData.period.year}` : reportData.period.year],
      [''],
      ['Metric', 'Count'],
      ['Present', reportData.summary?.present || 0],
      ['Absent', reportData.summary?.absent || 0],
      ['Late', reportData.summary?.late || 0],
      ['Excused', reportData.summary?.excused || 0],
      ['Attendance Percentage', `${reportData.summary?.percentage || 0}%`],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Sheet 2: Monthly Breakdown (if yearly mode and data available)
    if (reportData.monthlyBreakdown?.length > 0) {
      const monthlyData = [['Month', 'Present', 'Absent', 'Late', 'Excused']]
      reportData.monthlyBreakdown.forEach((month) => {
        monthlyData.push([
          `Month ${month.month}`,
          month.present || 0,
          month.absent || 0,
          month.late || 0,
          month.excused || 0,
        ])
      })
      const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData)
      XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly')
    }

    // Sheet 3: Attendance Records
    if (reportData.items?.length > 0) {
      const recordsData = [['Date', 'Student', 'Status', 'Notes']]
      reportData.items.forEach((item) => {
        recordsData.push([item.date || '', item.studentName || '', item.status || '', item.notes || ''])
      })
      const recordsSheet = XLSX.utils.aoa_to_sheet(recordsData)
      XLSX.utils.book_append_sheet(workbook, recordsSheet, 'Records')
    }
  },

  /**
   * Build assessment report sheets
   */
  _buildAssessmentSheets(workbook, reportData, XLSX) {
    if (reportData.scope === 'individual') {
      // Sheet 1: Student Info
      if (reportData.student) {
        const studentInfo = [
          ['Field', 'Value'],
          ['Full Name', reportData.student.fullName || ''],
          ['Enrollment Number', reportData.student.enrollmentNumber || ''],
          ['Date of Birth', reportData.student.dateOfBirth || ''],
        ]
        const studentSheet = XLSX.utils.aoa_to_sheet(studentInfo)
        XLSX.utils.book_append_sheet(workbook, studentSheet, 'Student Info')
      }

      // Sheet 2: Summary Metrics
      const summaryData = [
        ['Assessment Summary'],
        [''],
        ['Metric', 'Value'],
        ['Average Score', reportData.summary?.averageScore || 0],
        ['Latest Rating', reportData.summary?.latestRating || ''],
        ['Trend', reportData.summary?.trend || ''],
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      // Sheet 3: Assessment History
      if (reportData.assessments?.length > 0) {
        const historyData = [['Date', 'Category', 'Score', 'Rating', 'Comments']]
        reportData.assessments.forEach((assessment) => {
          historyData.push([
            assessment.date || '',
            assessment.category || '',
            assessment.score || '',
            assessment.rating || '',
            assessment.comments || '',
          ])
        })
        const historySheet = XLSX.utils.aoa_to_sheet(historyData)
        XLSX.utils.book_append_sheet(workbook, historySheet, 'History')
      }
    } else if (reportData.scope === 'class') {
      // Sheet 1: Class Summary
      const classData = [
        ['Class Assessment Summary'],
        ['Class', reportData.class?.name || ''],
        [''],
        ['Metric', 'Value'],
        ['Class Average Score', reportData.summary?.averageScore || 0],
        ['Class Average Rating', reportData.summary?.latestRating || ''],
      ]
      const classSheet = XLSX.utils.aoa_to_sheet(classData)
      XLSX.utils.book_append_sheet(workbook, classSheet, 'Class Summary')

      // Sheet 2: Student Assessment Results
      if (reportData.classAssessments?.length > 0) {
        const resultsData = [['Student Name', 'Average Score', 'Latest Rating', 'Assessment Count']]
        reportData.classAssessments.forEach((student) => {
          resultsData.push([
            student.fullName || student.name || '',
            student.averageScore || 0,
            student.latestRating || '',
            student.assessmentCount || 0,
          ])
        })
        const resultsSheet = XLSX.utils.aoa_to_sheet(resultsData)
        XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Student Results')
      }
    }
  },

  /**
   * Validate summary report data
   */
  _validateSummaryData(reportData) {
    if (!reportData.scope) {
      throw new ExportError('Summary report must have scope (individual or class)', 'summary')
    }

    if (reportData.scope === 'individual') {
      if (!reportData.student) {
        throw new ExportError('Individual summary report requires student data', 'summary')
      }
      if (!reportData.student.id) {
        throw new ExportError('Student data must include id field', 'summary')
      }
    } else if (reportData.scope === 'class') {
      if (!reportData.classStudents || !Array.isArray(reportData.classStudents) || reportData.classStudents.length === 0) {
        throw new ExportError('Class summary report requires classStudents array', 'summary')
      }
    }
  },

  /**
   * Validate attendance report data
   */
  _validateAttendanceData(reportData) {
    if (!reportData.mode) {
      throw new ExportError('Attendance report must have mode (monthly or yearly)', 'attendance')
    }

    if (!reportData.period) {
      throw new ExportError('Attendance report must have period data', 'attendance')
    }

    if (!reportData.summary) {
      throw new ExportError('Attendance report must have summary data', 'attendance')
    }
  },

  /**
   * Validate assessment report data
   */
  _validateAssessmentData(reportData) {
    if (!reportData.scope) {
      throw new ExportError('Assessment report must have scope (individual or class)', 'assessment')
    }

    if (reportData.scope === 'individual') {
      if (!reportData.student) {
        throw new ExportError('Individual assessment report requires student data', 'assessment')
      }
      if (!reportData.student.id) {
        throw new ExportError('Student data must include id field', 'assessment')
      }
    } else if (reportData.scope === 'class') {
      if (!reportData.classAssessments || !Array.isArray(reportData.classAssessments)) {
        throw new ExportError('Class assessment report requires classAssessments array', 'assessment')
      }
    }

    if (!reportData.assessments || !Array.isArray(reportData.assessments)) {
      throw new ExportError('Assessment report must have assessments array', 'assessment')
    }

    if (!reportData.summary) {
      throw new ExportError('Assessment report must have summary data', 'assessment')
    }
  },
}

export { AuthorizationError, ExportError }
