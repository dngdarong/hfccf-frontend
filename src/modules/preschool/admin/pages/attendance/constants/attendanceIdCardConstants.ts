export const LANG_OPTIONS = [
  { value: 'en', label: 'EN', desc: 'English' },
  { value: 'kh', label: 'ខ្មែរ', desc: 'Khmer' },
]

export const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF', icon: 'pi-file-pdf', desc: 'Print-ready A4 sheet' },
  { value: 'png', label: 'PNG', icon: 'pi-image', desc: 'Transparent background' },
  { value: 'jpg', label: 'JPG', icon: 'pi-image', desc: 'Smaller file size' },
]

export const ORIENT_OPTIONS = [
  { value: 'landscape', label: 'Landscape', icon: 'pi-stop', desc: 'Wider than tall' },
  { value: 'portrait', label: 'Portrait', icon: 'pi-tablet-phone', desc: 'Taller than wide' },
]

export const CARD_SIZES = [
  {
    value: 'small',
    label: 'Small',
    icon: 'pi-minus-circle',
    landscape: { W: 70, H: 44 },
    portrait: { W: 44, H: 70 },
  },
  {
    value: 'standard',
    label: 'Standard',
    icon: 'pi-id-card',
    landscape: { W: 85.6, H: 54 },
    portrait: { W: 54, H: 85.6 },
  },
  {
    value: 'large',
    label: 'Large',
    icon: 'pi-plus-circle',
    landscape: { W: 100, H: 63 },
    portrait: { W: 63, H: 100 },
  },
]

export const DEFAULT_CARD_FONT_SIZE = 'standard'
export const DEFAULT_LANG = 'en'
export const DEFAULT_FORMAT = 'pdf'
export const DEFAULT_ORIENTATION = 'landscape'
export const DEFAULT_GAP_MM = 4
export const IMG_QUALITY = 0.85
export const EXPORT_DPI = 300
export const MM_TO_PX_RATIO = EXPORT_DPI / 25.4
