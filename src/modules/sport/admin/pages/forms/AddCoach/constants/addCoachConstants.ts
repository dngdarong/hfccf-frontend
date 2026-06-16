import { ROLES } from '@/constants/roles'

export const COACHES_DIRECTORY_PATH = '/module/sport-admin/users'

export const ROLE_OPTIONS = [ROLES.COACH]
export const STATUS_OPTIONS = ['active', 'pending', 'inactive', 'suspended']

export const ALLOWED_PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

export const IMAGE_OPTIMIZATION_OPTIONS = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.84,
}

export const DEFAULT_PERMISSIONS = ['dashboard:read', 'matches:read', 'events:write']
