import QRCode from 'qrcode'

const BACK_TEXT = {
  en: {
    badge: 'GUARDIAN CARD',
    profile: 'GUARDIAN PROFILE',
    guardianName: 'Guardian Name',
    guardianPhone: 'Guardian Phone',
    studentRef: 'Student Reference',
    studentId: 'Student ID',
    class: 'Class',
    grade: 'Grade',
    contactNote: 'Keep this side for pickup and emergency contact.',
  },
  kh: {
    badge: 'កាតអាណាព្យាបាល',
    profile: 'ព័ត៌មានអាណាព្យាបាល',
    guardianName: 'ឈ្មោះអាណាព្យាបាល',
    guardianPhone: 'លេខទូរស័ព្ទអាណាព្យាបាល',
    studentRef: 'ព័ត៌មានសិស្ស',
    studentId: 'លេខសម្គាល់សិស្ស',
    class: 'ថ្នាក់',
    grade: 'ថ្នាក់ទី',
    contactNote: 'រក្សាផ្នែកនេះសម្រាប់ទំនាក់ទំនងពេលមកទទួលសិស្ស។',
  },
}

const ACCENT = [[34,197,94],[249,115,22],[239,68,68],[59,130,246]]

function buildGuardianQrPayload(student) {
  const studentCode = student?.publicId || student?.studentCode || student?.id || ''
  const guardianPhone = student?.guardianPhone || student?.guardian_phone || ''
  const guardianName = student?.guardianName || student?.guardian_name || ''
  return [
    'HFCCF-PRESCHOOL',
    `student:${studentCode}`,
    `guardian:${guardianName}`,
    `phone:${guardianPhone}`,
  ].join('|')
}

export async function buildBackQrDataUrl(student) {
  return QRCode.toDataURL(buildGuardianQrPayload(student), {
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 6,
    color: { dark: '#1e40af', light: '#ffffff' },
  })
}

function makeCanvasHelpers(ctx, SC, lang = 'en') {
  const fontFamily = lang === 'kh'
    ? '"Khmer OS", Hanuman, Battambang, "Noto Sans Khmer", sans-serif'
    : 'Arial, sans-serif'
  const p   = (v) => v * SC
  const sf  = (r,g,b,a=1)  => { ctx.fillStyle   = `rgba(${r},${g},${b},${a})` }
  const ss  = (r,g,b,a=1)  => { ctx.strokeStyle = `rgba(${r},${g},${b},${a})` }
  const slw = (mm)        => { ctx.lineWidth   = p(mm) }
  const fnt = (pt, w='normal') => { ctx.font = `${w} ${p(pt*0.352778)}px ${fontFamily}` }
  const fr  = (x,y,w,h)   => ctx.fillRect(p(x), p(y), p(w), p(h))
  const txt = (t,x,y,al='left',col=[15,23,42]) => {
    sf(...col); ctx.textAlign = al; ctx.textBaseline = 'alphabetic'; ctx.fillText(String(t), p(x), p(y))
  }
  function rr(x,y,w,h,r,mode='F') {
    ctx.beginPath()
    ctx.moveTo(p(x+r),p(y)); ctx.lineTo(p(x+w-r),p(y))
    ctx.arcTo(p(x+w),p(y),p(x+w),p(y+r),p(r))
    ctx.lineTo(p(x+w),p(y+h-r))
    ctx.arcTo(p(x+w),p(y+h),p(x+w-r),p(y+h),p(r))
    ctx.lineTo(p(x+r),p(y+h))
    ctx.arcTo(p(x),p(y+h),p(x),p(y+h-r),p(r))
    ctx.lineTo(p(x),p(y+r))
    ctx.arcTo(p(x),p(y),p(x+r),p(y),p(r))
    ctx.closePath()
    if (mode === 'F' || mode === 'FD') ctx.fill()
    if (mode === 'S' || mode === 'FD') ctx.stroke()
  }
  function arc(cx,cy,r,mode='F') {
    ctx.beginPath(); ctx.arc(p(cx),p(cy),p(r),0,Math.PI*2); ctx.closePath()
    if (mode === 'F' || mode === 'FD') ctx.fill()
    if (mode === 'S' || mode === 'FD') ctx.stroke()
  }
  const ln = (x1,y1,x2,y2) => { ctx.beginPath(); ctx.moveTo(p(x1),p(y1)); ctx.lineTo(p(x2),p(y2)); ctx.stroke() }
  return { p, sf, ss, slw, fnt, fr, txt, rr, arc, ln }
}

function getBackText(lang = 'en') {
  return BACK_TEXT[lang] || BACK_TEXT.en
}

function getGuardianName(student) {
  return student?.guardianName || student?.guardian_name || '—'
}

function getGuardianPhone(student) {
  return student?.guardianPhone || student?.guardian_phone || '—'
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || '?'
}

function getGuardianInitials(student) {
  const name = getGuardianName(student)
  return getInitials(name === '—' ? '' : name)
}

function drawQrPdf(doc, x, y, size, label, qrDataUrl) {
  doc.setFillColor(255,255,255)
  doc.setDrawColor(191,219,254)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, size, size, 1.5, 1.5, 'FD')
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', x + 1.3, y + 1.3, size - 2.6, size - 2.6)
  }
  doc.setTextColor(30,64,175)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.2)
  doc.text(label, x + size / 2, y + size + 2.6, { align: 'center' })
}

function drawShellPdf(doc, x, y, W, H, logoData, badgeText, headerText, subText, SW, SH, FS, RS) {
  const HEADER_H = 14.5 * SH
  const BAR_H = 1.8 * SH
  doc.setFillColor(255,255,255); doc.setDrawColor(203,213,225); doc.setLineWidth(0.25)
  doc.roundedRect(x, y, W, H, 2.5 * RS, 2.5 * RS, 'FD')
  doc.setFillColor(10,36,80)
  doc.roundedRect(x, y, W, HEADER_H, 2.5 * RS, 2.5 * RS, 'F')
  doc.rect(x, y + HEADER_H - 3 * SH, W, 3 * SH, 'F')
  // Header watermark circles
  doc.setFillColor(16,44,90); doc.circle(x + W - 6 * SW, y - 3 * SH, 15 * RS, 'F')
  doc.setFillColor(13,38,78); doc.circle(x + W + 2 * SW, y + 4 * SH, 10 * RS, 'F')
  if (logoData) doc.addImage(logoData, 'JPEG', x + 2.5 * SW, y + 2 * SH, 10.5 * SW, 10.5 * SH)
  doc.setTextColor(255,255,255); doc.setFontSize(7.5 * FS); doc.setFont('helvetica', 'bold')
  doc.text(headerText, x + 15 * SW, y + 6.5 * SH)
  doc.setFontSize(5.5 * FS); doc.setFont('helvetica', 'normal'); doc.setTextColor(147,197,253)
  doc.text(subText, x + 15 * SW, y + 10.5 * SH)
  doc.setDrawColor(255,255,255); doc.setLineWidth(0.3)
  doc.roundedRect(x + W - 26 * SW, y + 3.5 * SH, 24 * SW, 7 * SH, 1.2 * RS, 1.2 * RS, 'S')
  doc.setTextColor(255,255,255); doc.setFontSize(4.8 * FS); doc.setFont('helvetica', 'bold')
  doc.text(badgeText, x + W - 14 * SW, y + 8 * SH, { align: 'center' })
  ACCENT.forEach(([r,g,b], i) => {
    doc.setFillColor(r, g, b)
    doc.rect(x + i * (W / 4), y + HEADER_H, W / 4, BAR_H, 'F')
  })
  return { HEADER_H, BAR_H }
}

function drawBackPatternPdf(doc, x, y, W, H, HEADER_H, BAR_H, FOOTER_H, SW, SH) {
  const bodyTop = y + HEADER_H + BAR_H
  const bodyBottom = y + H - FOOTER_H
  doc.setDrawColor(226,232,240)
  doc.setLineWidth(0.12)
  for (let i = 0; i < 4; i++) {
    const px = x + W - (12 + i * 7) * SW
    const py = bodyTop + (6 + i * 5) * SH
    doc.circle(px, py, 0.6 * SW, 'F')
    doc.circle(px - 5 * SW, py + 4 * SH, 0.5 * SW, 'F')
    doc.line(px - 9 * SW, py - 2 * SH, px - 1 * SW, py + 6 * SH)
  }
  doc.setFillColor(248,250,252)
  doc.roundedRect(x + W - 24 * SW, bodyBottom - 22 * SH, 18 * SW, 18 * SH, 1.4 * SW, 1.4 * SW, 'F')
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const fill = ((r * 5 + c) % 2 === 0) || ((r + c) % 3 === 0)
      if (fill) {
        doc.setFillColor(30,64,175)
        doc.rect(x + W - 23 * SW + c * 3 * SW, bodyBottom - 21 * SH + r * 3 * SH, 2.2 * SW, 2.2 * SH, 'F')
      }
    }
  }
  doc.setTextColor(30,64,175)
  doc.setFontSize(4.2 * Math.sqrt(SW * SH))
  doc.setFont('helvetica', 'bold')
  doc.text('SCAN / CODE', x + W - 15 * SW, bodyBottom - 2 * SH, { align: 'center' })
}

function drawBackPatternCanvas(ctx, helpers, xMm, yMm, W, H, HEADER_H, BAR_H, FOOTER_H, SC, SW, SH) {
  const { sf, ss, slw, fr, rr, ln, arc } = helpers
  const bodyTop = yMm + HEADER_H + BAR_H
  const bodyBottom = yMm + H - FOOTER_H
  ss(226,232,240,0.9); slw(0.12)
  for (let i = 0; i < 4; i++) {
    const px = xMm + W - (12 + i * 7) * SW
    const py = bodyTop + (6 + i * 5) * SH
    sf(226,232,240,0.7); arc(px, py, 0.6 * SW, 'F')
    sf(226,232,240,0.55); arc(px - 5 * SW, py + 4 * SH, 0.5 * SW, 'F')
    ln(px - 9 * SW, py - 2 * SH, px - 1 * SW, py + 6 * SH)
  }
  sf(248,250,252,1); rr(xMm + W - 24 * SW, bodyBottom - 22 * SH, 18 * SW, 18 * SH, 1.4 * SW, 'F')
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const fill = ((r * 5 + c) % 2 === 0) || ((r + c) % 3 === 0)
      if (fill) {
        sf(30,64,175,1)
        fr(xMm + W - 23 * SW + c * 3 * SW, bodyBottom - 21 * SH + r * 3 * SH, 2.2 * SW, 2.2 * SH)
      }
    }
  }
  sf(30,64,175,1); ss(30,64,175,1)
  helpers.fnt(4.2 * Math.sqrt(SW * SH), 'bold')
  helpers.txt('SCAN / CODE', xMm + W - 15 * SW, bodyBottom - 2 * SH, 'center', [30,64,175])
}

function drawShellCanvas(ctx, xMm, yMm, W, H, logoImg, badgeText, headerText, subText, SC, SW, SH, FS, RS, helpers) {
  const { p, sf, ss, slw, fnt, fr, txt, rr, arc } = helpers
  const HEADER_H = 14.5 * SH
  const BAR_H = 1.8 * SH
  sf(255,255,255); ss(203,213,225); slw(0.25); rr(xMm, yMm, W, H, 2.5 * RS, 'FD')
  sf(10,36,80); rr(xMm, yMm, W, HEADER_H, 2.5 * RS, 'F'); fr(xMm, yMm + HEADER_H - 3 * SH, W, 3 * SH)
  // Header watermark circles
  ctx.save(); ctx.globalAlpha = 0.35; sf(16,44,90); arc(xMm + W - 6 * SW, yMm - 3 * SH, 15 * RS, 'F')
  sf(13,38,78); arc(xMm + W + 2 * SW, yMm + 4 * SH, 10 * RS, 'F'); ctx.globalAlpha = 1; ctx.restore()
  if (logoImg) ctx.drawImage(logoImg, p(xMm + 2.5 * SW), p(yMm + 2 * SH), p(10.5 * SW), p(10.5 * SH))
  fnt(7.5 * FS, 'bold'); txt(headerText, xMm + 15 * SW, yMm + 6.5 * SH, 'left', [255,255,255])
  fnt(5.5 * FS, 'normal'); txt(subText, xMm + 15 * SW, yMm + 10.5 * SH, 'left', [147,197,253])
  ss(255,255,255,0.6); slw(0.3); ctx.strokeRect(p(xMm + W - 26 * SW), p(yMm + 3.5 * SH), p(24 * SW), p(7 * SH))
  fnt(4.8 * FS, 'bold'); txt(badgeText, xMm + W - 14 * SW, yMm + 8 * SH, 'center', [255,255,255])
  ACCENT.forEach(([r,g,b], i) => { sf(r,g,b); fr(xMm + i * (W / 4), yMm + HEADER_H, W / 4, BAR_H) })
  return { HEADER_H, BAR_H }
}

function drawQrCanvas(ctx, helpers, xMm, yMm, sizeMm, label, qrImg) {
  const { p, sf, ss, slw, rr, txt } = helpers
  sf(255,255,255); ss(191,219,254); slw(0.3); rr(xMm, yMm, sizeMm, sizeMm, 1.5, 'FD')
  if (qrImg) {
    ctx.drawImage(qrImg, p(xMm + 1.3), p(yMm + 1.3), p(sizeMm - 2.6), p(sizeMm - 2.6))
  }
  txt(label, xMm + sizeMm / 2, yMm + sizeMm + 2.6, 'center', [30,64,175])
}

function drawFrontInfoPdf(doc, x, y, student, className, classLevel, W, H, SW, SH, FS, lang = 'en') {
  const T = getBackText(lang)
  const RX = x + 34 * SW
  let IY = y + 14.5 * SH
  doc.setTextColor(148,163,184); doc.setFontSize(4.8 * FS); doc.setFont('helvetica', 'normal')
  doc.text(T.guardianName, RX, IY)
  IY += 3.4 * SH
  doc.setTextColor(15,23,42); doc.setFontSize(8.2 * FS); doc.setFont('helvetica', 'bold')
  doc.text(doc.splitTextToSize(getGuardianName(student), W - 38 * SW)[0], RX, IY)
  IY += 6 * SH
  doc.setDrawColor(226,232,240); doc.setLineWidth(0.25); doc.line(RX, IY, x + W - 3 * SW, IY)
  IY += 3.5 * SH
  doc.setTextColor(148,163,184); doc.setFontSize(4.8 * FS); doc.setFont('helvetica', 'normal')
  doc.text(T.guardianPhone, RX, IY)
  IY += 3.4 * SH
  doc.setTextColor(30,64,175); doc.setFontSize(7.2 * FS); doc.setFont('helvetica', 'bold')
  doc.text(getGuardianPhone(student), RX, IY)
  IY += 6 * SH
  doc.setTextColor(148,163,184); doc.setFontSize(4.8 * FS); doc.setFont('helvetica', 'normal')
  doc.text(T.studentRef, RX, IY)
  IY += 3.4 * SH
  doc.setTextColor(15,23,42); doc.setFontSize(7 * FS); doc.setFont('helvetica', 'bold')
  doc.text(doc.splitTextToSize(student.fullName || student.name || '—', W - 38 * SW)[0], RX, IY)
  IY += 4.6 * SH
  doc.setTextColor(148,163,184); doc.setFontSize(4.5 * FS); doc.setFont('helvetica', 'normal')
  doc.text(T.studentId, RX, IY)
  IY += 3.2 * SH
  doc.setTextColor(30,64,175); doc.setFontSize(6.6 * FS); doc.setFont('helvetica', 'bold')
  doc.text(String(student.publicId || student.studentCode || student.id || '—'), RX, IY)
  IY += 5.2 * SH
  doc.setTextColor(148,163,184); doc.setFontSize(4.5 * FS); doc.setFont('helvetica', 'normal')
  doc.text(T.class, RX, IY)
  if (classLevel) doc.text(T.grade, x + 58 * SW, IY)
  IY += 3.2 * SH
  doc.setTextColor(30,64,175); doc.setFontSize(6.6 * FS); doc.setFont('helvetica', 'bold')
  doc.text(className || '—', RX, IY)
  if (classLevel) doc.text(classLevel, x + 58 * SW, IY)
}


export function drawCardPdfBack(doc, x, y, student, className, classLevel, academicYear, logoData, orientation, W, H, lang = 'en', qrDataUrl = '') {
  const T = getBackText(lang)
  const headerSub = lang === 'kh' ? 'ព័ត៌មានអាណាព្យាបាល' : 'Guardian details on reverse'
  const SW = W / (orientation === 'portrait' ? 54 : 85.6)
  const SH = H / (orientation === 'portrait' ? 85.6 : 54)
  const FS = Math.sqrt(SW * SH)
  const RS = Math.min(SW, SH)
  const { HEADER_H, BAR_H } = drawShellPdf(doc, x, y, W, H, logoData, T.badge, 'HFCCF PRESCHOOL', headerSub, SW, SH, FS, RS)
  drawBackPatternPdf(doc, x, y, W, H, HEADER_H, BAR_H, 8.5 * SH, SW, SH)

  if (orientation === 'portrait') {
    const CX = x + W / 2
    const profileY = y + HEADER_H + BAR_H + 12 * SH
    doc.setFillColor(239,246,255); doc.setDrawColor(59,130,246); doc.setLineWidth(0.6)
    doc.circle(CX, profileY, 10 * RS, 'F')
    doc.setTextColor(30,64,175); doc.setFontSize(8.5 * FS); doc.setFont('helvetica', 'bold')
    doc.text(getGuardianInitials(student), CX, profileY + 2.4 * RS, { align: 'center' })
    doc.setDrawColor(59,130,246); doc.circle(CX, profileY, 10 * RS, 'S')
    doc.setFontSize(5 * FS); doc.setFont('helvetica', 'bold')
    doc.text(T.profile, CX, profileY + 13.5 * RS, { align: 'center' })
    // Portrait uses a 2-column grid — drawFrontInfoPdf places grade at x+58mm which overflows a 54mm card
    const C1 = x + 5 * SW, C2 = x + W / 2 + 1.5 * SW
    const IY0 = y + HEADER_H + BAR_H + 27 * SH
    doc.setFontSize(4.5 * FS); doc.setFont('helvetica', 'normal'); doc.setTextColor(148,163,184)
    doc.text(T.guardianName, C1, IY0); doc.text(T.guardianPhone, C2, IY0)
    doc.setFontSize(6.8 * FS); doc.setFont('helvetica', 'bold')
    doc.setTextColor(15,23,42); doc.text(getGuardianName(student), C1, IY0 + 4 * SH)
    doc.setTextColor(30,64,175); doc.text(getGuardianPhone(student), C2, IY0 + 4 * SH)
    const R2Y = IY0 + 9 * SH
    doc.setFontSize(4.5 * FS); doc.setFont('helvetica', 'normal'); doc.setTextColor(148,163,184)
    doc.text(T.studentRef, C1, R2Y); doc.text(T.studentId, C2, R2Y)
    doc.setFontSize(6.5 * FS); doc.setFont('helvetica', 'bold'); doc.setTextColor(30,64,175)
    doc.text(doc.splitTextToSize(student.fullName || student.name || '—', (W / 2 - 6.5) * SW)[0], C1, R2Y + 4 * SH)
    doc.text(String(student.publicId || student.studentCode || student.id || '—'), C2, R2Y + 4 * SH)
    const R3Y = R2Y + 9 * SH
    doc.setFontSize(4.5 * FS); doc.setFont('helvetica', 'normal'); doc.setTextColor(148,163,184)
    doc.text(T.class, C1, R3Y); if (classLevel) doc.text(T.grade, C2, R3Y)
    doc.setFontSize(6.5 * FS); doc.setFont('helvetica', 'bold'); doc.setTextColor(30,64,175)
    doc.text(className || '—', C1, R3Y + 4 * SH)
    if (classLevel) doc.text(classLevel, C2, R3Y + 4 * SH)
    doc.setFillColor(239,246,255); doc.rect(x, y + H - 8.5 * SH, W, 8.5 * SH, 'F')
    doc.setDrawColor(191,219,254); doc.setLineWidth(0.25); doc.line(x, y + H - 8.5 * SH, x + W, y + H - 8.5 * SH)
    doc.setTextColor(30,64,175); doc.setFontSize(5.2 * FS); doc.setFont('helvetica', 'bold')
    doc.text(T.contactNote, CX, y + H - 4 * SH, { align: 'center' })
    return
  }

  const CX = x + 15.5 * SW
  const CY = y + 11 * SH
  doc.setFillColor(239,246,255); doc.setDrawColor(59,130,246); doc.setLineWidth(0.6)
  doc.circle(CX, CY, 11 * RS, 'F')
  doc.setTextColor(30,64,175); doc.setFontSize(8.5 * FS); doc.setFont('helvetica', 'bold')
  doc.text(getGuardianInitials(student), CX, CY + 2.8 * RS, { align: 'center' })
  doc.setDrawColor(59,130,246); doc.circle(CX, CY, 11 * RS, 'S')
  doc.setFontSize(5.2 * FS)
  doc.text(T.profile, CX, CY + 14.5 * RS, { align: 'center' })
  drawFrontInfoPdf(doc, x, y + HEADER_H, student, className, classLevel, W, H, SW, SH, FS, lang)
  doc.setFillColor(239,246,255); doc.rect(x, y + H - 8.5 * SH, W, 8.5 * SH, 'F')
  doc.setDrawColor(191,219,254); doc.setLineWidth(0.25); doc.line(x, y + H - 8.5 * SH, x + W, y + H - 8.5 * SH)
  doc.setTextColor(30,64,175); doc.setFontSize(5.7 * FS); doc.setFont('helvetica', 'bold')
  doc.text(T.contactNote, x + W / 2, y + H - 4.4 * SH, { align: 'center' })
  drawQrPdf(doc, x + W - 24 * SW, y + HEADER_H + BAR_H + 18.5 * SH, 18 * SW, 'QR / CONTACT', qrDataUrl)
}

export function drawCardCanvasBack(ctx, xMm, yMm, student, className, classLevel, academicYear, logoImg, SC, orientation, W, H, lang = 'en', qrDataUrl = '') {
  const T = getBackText(lang)
  const headerSub = lang === 'kh' ? 'ព័ត៌មានអាណាព្យាបាល' : 'Guardian details on reverse'
  const SW = W / (orientation === 'portrait' ? 54 : 85.6)
  const SH = H / (orientation === 'portrait' ? 85.6 : 54)
  const FS = Math.sqrt(SW * SH)
  const RS = Math.min(SW, SH)
  const helpers = makeCanvasHelpers(ctx, SC, lang)
  const { sf, ss, slw, fnt, fr, txt, arc, ln } = helpers
  const { HEADER_H, BAR_H } = drawShellCanvas(ctx, xMm, yMm, W, H, logoImg, T.badge, 'HFCCF PRESCHOOL', headerSub, SC, SW, SH, FS, RS, helpers)
  drawBackPatternCanvas(ctx, helpers, xMm, yMm, W, H, HEADER_H, BAR_H, 8.5 * SH, SC, SW, SH)

  if (orientation === 'portrait') {
    const profileY = yMm + HEADER_H + BAR_H + 12 * SH
    sf(239,246,255); ss(59,130,246); slw(0.6); arc(xMm + W / 2, profileY, 10 * RS, 'F')
    fnt(8.5 * FS, 'bold'); txt(getGuardianInitials(student), xMm + W / 2, profileY + 2.4 * RS, 'center', [30,64,175])
    ss(59,130,246); slw(0.6); arc(xMm + W / 2, profileY, 10 * RS, 'S')
    fnt(5 * FS, 'bold'); txt(T.profile, xMm + W / 2, profileY + 13.5 * RS, 'center', [30,64,175])
  } else {
    const profileY = yMm + HEADER_H + BAR_H + 11 * SH
    sf(239,246,255); ss(59,130,246); slw(0.6); arc(xMm + 15.5 * SW, profileY, 11 * RS, 'F')
    fnt(8.5 * FS, 'bold'); txt(getGuardianInitials(student), xMm + 15.5 * SW, profileY + 2.8 * RS, 'center', [30,64,175])
    ss(59,130,246); slw(0.6); arc(xMm + 15.5 * SW, profileY, 11 * RS, 'S')
    fnt(5.2 * FS, 'bold'); txt(T.profile, xMm + 15.5 * SW, profileY + 14.5 * RS, 'center', [30,64,175])
  }

  const RX = xMm + 34 * SW
  let IY = yMm + HEADER_H + 5 * SH
  if (orientation === 'portrait') {
    const left = xMm + 5 * SW
    const right = xMm + W / 2 + 1.5 * SW
    const row1Y = yMm + HEADER_H + BAR_H + 18 * SH
    fnt(4.5 * FS, 'normal'); txt(T.guardianName, left, row1Y, 'left', [148,163,184]); txt(T.guardianPhone, right, row1Y, 'left', [148,163,184])
    fnt(6.8 * FS, 'bold'); txt(getGuardianName(student), left, row1Y + 4 * SH, 'left', [15,23,42]); txt(getGuardianPhone(student), right, row1Y + 4 * SH, 'left', [15,23,42])
    const row2Y = row1Y + 9 * SH
    fnt(4.5 * FS, 'normal'); txt(T.studentRef, left, row2Y, 'left', [148,163,184]); txt(T.studentId, right, row2Y, 'left', [148,163,184])
    fnt(6.5 * FS, 'bold'); txt(student.fullName || student.name || '—', left, row2Y + 4 * SH, 'left', [30,64,175]); txt(String(student.publicId || student.studentCode || student.id || '—'), right, row2Y + 4 * SH, 'left', [30,64,175])
    const row3Y = row2Y + 9 * SH
    fnt(4.5 * FS, 'normal'); txt(T.class, left, row3Y, 'left', [148,163,184]); if (classLevel) txt(T.grade, right, row3Y, 'left', [148,163,184])
    fnt(6.4 * FS, 'bold'); txt(className || '—', left, row3Y + 4 * SH, 'left', [30,64,175]); if (classLevel) txt(classLevel, right, row3Y + 4 * SH, 'left', [30,64,175])
    sf(239,246,255); fr(xMm, yMm + H - 8.5 * SH, W, 8.5 * SH)
    ss(191,219,254); slw(0.25); ln(xMm, yMm + H - 8.5 * SH, xMm + W, yMm + H - 8.5 * SH)
    fnt(5.2 * FS, 'bold'); txt(T.contactNote, xMm + W / 2, yMm + H - 4.4 * SH, 'center', [30,64,175])
    return
  }

  fnt(4.8 * FS, 'normal'); txt(T.guardianName, RX, IY, 'left', [148,163,184]); IY += 3.4 * SH
  fnt(8.2 * FS, 'bold'); txt(getGuardianName(student), RX, IY, 'left', [15,23,42]); IY += 6 * SH
  ss(226,232,240); slw(0.25); ln(RX, IY, xMm + W - 3 * SW, IY); IY += 3.5 * SH
  fnt(4.8 * FS, 'normal'); txt(T.guardianPhone, RX, IY, 'left', [148,163,184]); IY += 3.4 * SH
  fnt(7.2 * FS, 'bold'); txt(getGuardianPhone(student), RX, IY, 'left', [30,64,175]); IY += 6 * SH
  fnt(4.8 * FS, 'normal'); txt(T.studentRef, RX, IY, 'left', [148,163,184]); IY += 3.4 * SH
  fnt(7 * FS, 'bold'); txt(student.fullName || student.name || '—', RX, IY, 'left', [15,23,42]); IY += 4.6 * SH
  fnt(4.5 * FS, 'normal'); txt(T.studentId, RX, IY, 'left', [148,163,184]); IY += 3.2 * SH
  fnt(6.6 * FS, 'bold'); txt(String(student.publicId || student.studentCode || student.id || '—'), RX, IY, 'left', [30,64,175]); IY += 5.2 * SH
  fnt(4.5 * FS, 'normal'); txt(T.class, RX, IY, 'left', [148,163,184]); if (classLevel) txt(T.grade, xMm + 58 * SW, IY, 'left', [148,163,184]); IY += 3.2 * SH
  fnt(6.6 * FS, 'bold'); txt(className || '—', RX, IY, 'left', [30,64,175]); if (classLevel) txt(classLevel, xMm + 58 * SW, IY, 'left', [30,64,175])

  sf(239,246,255); fr(xMm, yMm + H - 8.5 * SH, W, 8.5 * SH)
  ss(191,219,254); slw(0.25); ln(xMm, yMm + H - 8.5 * SH, xMm + W, yMm + H - 8.5 * SH)
  fnt(5.7 * FS, 'bold'); txt(T.contactNote, xMm + W / 2, yMm + H - 4.4 * SH, 'center', [30,64,175])
  drawQrCanvas(ctx, helpers, xMm + W - 24 * SW, yMm + HEADER_H + BAR_H + 18.5 * SH, 18 * SW, 'QR / CONTACT', qrDataUrl)
}
