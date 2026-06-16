import QRCode from 'qrcode'

const BACK_TEXT = {
  en: {
    badge: 'COACH CARD',
    profile: 'COACH PROFILE',
    coachName: 'Coach Name',
    coachPhone: 'Coach Phone',
    playerRef: 'Player Reference',
    playerId: 'Player ID',
    team: 'Team',
    division: 'Division',
    contactNote: 'Keep this side for communication and emergency contact.',
  },
  kh: {
    badge: 'កាតបាទ',
    profile: 'ព័ត៌មានបាទ',
    coachName: 'ឈ្មោះបាទ',
    coachPhone: 'លេខទូរស័ព្ទបាទ',
    playerRef: 'ព័ត៌មានកីឡាករ',
    playerId: 'លេខសម្គាល់កីឡាករ',
    team: 'ក្រុម',
    division: 'ច្បាប់ការប្រកួតប្រជែង',
    contactNote: 'រក្សាផ្នែកនេះសម្រាប់ទំនាក់ទំនងពេលដែលត្រូវការ។',
  },
}

const ACCENT = [[34, 197, 94], [249, 115, 22], [239, 68, 68], [59, 130, 246]]

function buildCoachQrPayload(player) {
  const playerCode = player?.publicId || player?.playerCode || player?.id || ''
  const coachPhone = player?.coachPhone || player?.coach_phone || ''
  const coachName = player?.coachName || player?.coach_name || ''
  return [
    'HFCCF-SPORT',
    `player:${playerCode}`,
    `coach:${coachName}`,
    `phone:${coachPhone}`,
  ].join('|')
}

export async function buildBackQrDataUrl(player) {
  return QRCode.toDataURL(buildCoachQrPayload(player), {
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 6,
    color: { dark: '#1e40af', light: '#ffffff' },
  })
}

function getBackText(lang = 'en') {
  return BACK_TEXT[lang] || BACK_TEXT.en
}

function getCoachName(player) {
  return player?.coachName || player?.coach_name || '—'
}

function getCoachPhone(player) {
  return player?.coachPhone || player?.coach_phone || '—'
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

function getCoachInitials(player) {
  const name = getCoachName(player)
  return getInitials(name === '—' ? '' : name)
}

export { getBackText, getCoachName, getCoachPhone, getInitials, getCoachInitials, ACCENT }
