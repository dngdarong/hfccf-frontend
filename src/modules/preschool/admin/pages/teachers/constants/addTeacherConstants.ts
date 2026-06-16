export const TEACHER_DIRECTORY_PATH = '/module/preschool-admin/users'
export const EDIT_MODE_PATH = '/module/preschool-admin/users/add'

export const STATUS_OPTIONS = ['active', 'pending', 'inactive', 'suspended']

export const DEFAULT_FORM = {
  name: '',
  email: '',
  phone: '',
  status: STATUS_OPTIONS[0],
  password: '',
  confirmPassword: '',
  profileImage: null,
  removeAvatar: false,
}

export const IMAGE_MAX_SIZE = 2 * 1024 * 1024
export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const IMAGE_OPTIMIZE_OPTIONS = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.84,
}

export const PASSWORD_MIN_LENGTH = 8
