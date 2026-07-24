import { describe, expect, it } from 'vitest'
import { DEFAULT_FORM } from '@/modules/preschool/admin/pages/students/constants/studentFormConstants'
import {
  buildGuardianTypeOptions,
  loadStudentIntoForm,
  normalizeStudentPayload,
} from '@/modules/preschool/admin/pages/students/utils/studentFormHelpers'

const t = (key) => key

describe('studentFormHelpers', () => {
  it('loads structured identity and location fields safely in edit mode', () => {
    const form = { ...DEFAULT_FORM }

    loadStudentIntoForm(
      {
        studentCode: 'ST-1',
        latinName: 'Alice Student',
        nationality: 'Cambodia',
        ethnicity: 'Khmer',
        guardianName: 'Sokha',
        guardianPhone: '012345678',
        relationshipType: 'mother',
        birthProvinceId: 1,
        birthDistrictId: 11,
        birthCommuneId: 111,
        birthVillageId: 1111,
        residenceProvinceId: 2,
        residenceDistrictId: 22,
        residenceCommuneId: 222,
        residenceVillageId: 2222,
        classes: [{ id: 'class-1' }],
      },
      form,
    )

    expect(form.guardian_name).toBe('Sokha')
    expect(form.guardian_phone).toBe('012345678')
    expect(form.guardian_type).toBe('mother')
    expect(form.latin_name).toBe('Alice Student')
    expect(form.nationality).toBe('Cambodia')
    expect(form.ethnicity).toBe('Khmer')
    expect(form.birth_province_id).toBe('1')
    expect(form.birth_district_id).toBe('11')
    expect(form.birth_commune_id).toBe('111')
    expect(form.birth_village_id).toBe('1111')
    expect(form.residence_province_id).toBe('2')
    expect(form.residence_district_id).toBe('22')
    expect(form.residence_commune_id).toBe('222')
    expect(form.residence_village_id).toBe('2222')
    expect(form.class_ids).toEqual(['class-1'])
  })

  it('normalizes the submitted identity and location payload', () => {
    const payload = normalizeStudentPayload(
      {
        student_code: 'ST-1',
        student_type: 'paying',
        first_name: 'Alice',
        last_name: 'Student',
        latin_name: 'Alice Student',
        nationality: 'Cambodia',
        ethnicity: 'Khmer',
        gender: 'female',
        date_of_birth: '2020-01-01',
        guardian_name: 'Sokha',
        guardian_phone: '012345678',
        guardian_type: 'mother',
        birth_province_id: '1',
        birth_district_id: '11',
        birth_commune_id: '111',
        birth_village_id: '1111',
        residence_province_id: '2',
        residence_district_id: '22',
        residence_commune_id: '222',
        residence_village_id: '2222',
        status: 'active',
        class_ids: ['class-1'],
        avatar: null,
        remove_avatar: false,
      },
      true,
    )

    expect(payload.guardian_type).toBe('mother')
    expect(payload.latin_name).toBe('Alice Student')
    expect(payload.nationality).toBe('Cambodia')
    expect(payload.ethnicity).toBe('Khmer')
    expect(payload.birth_province_id).toBe(1)
    expect(payload.birth_district_id).toBe(11)
    expect(payload.birth_commune_id).toBe(111)
    expect(payload.birth_village_id).toBe(1111)
    expect(payload.residence_province_id).toBe(2)
    expect(payload.residence_district_id).toBe(22)
    expect(payload.residence_commune_id).toBe(222)
    expect(payload.residence_village_id).toBe(2222)
  })

  it('keeps guardian type options aligned with the locale keys', () => {
    const options = buildGuardianTypeOptions(t)

    expect(options.map((option) => option.value)).toEqual([
      'father',
      'mother',
      'grandfather',
      'grandmother',
      'other',
    ])
  })
})
