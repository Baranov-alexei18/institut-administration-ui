import type { RawStudent, Student } from '@/types/students';
import {
  StudentsControllerGetStudentsGender as StudentsGender,
} from '@/api/generated/institutAdministrationAPI.schemas';

export const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

export const parseString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

export const parseGroupFields = (item: RawStudent): { groupId: number | null; groupName: string } => {
  const directGroupId = parseNumber(item.groupId ?? item.group_id);
  const directGroupName = parseString(item.group_name ?? item.groupName);

  if (directGroupId !== null || directGroupName) {
    return { groupId: directGroupId, groupName: directGroupName };
  }

  if (item.group && typeof item.group === 'object') {
    const group = item.group as Record<string, unknown>;
    return {
      groupId: parseNumber(group.id ?? group.groupId ?? group.group_id),
      groupName: parseString(group.name ?? group.title ?? group.groupName),
    };
  }

  return { groupId: null, groupName: '' };
};

export const normalizeGender = (value: unknown): string => {
  const gender = parseString(value).toLowerCase();
  if (gender === StudentsGender.male) {
    return 'Мужской';
  }

  if (gender === StudentsGender.female) {
    return 'Женский';
  }

  return '-';
};

export const parseGenderValue = (value: unknown): string => {
  const gender = parseString(value).toLowerCase();
  if (gender === StudentsGender.male || gender === StudentsGender.female) {
    return gender;
  }

  return '';
};

export const calculateAge = (birthDate: string): number | null => {
  if (!birthDate) {
    return null;
  }

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

export const formatBirthDate = (birthDate: string): string => {
  if (!birthDate || birthDate === '-') {
    return '-';
  }

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return `${day}.${month}.${year}`;
};

export const toStudent = (item: RawStudent): Student => {
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();

  const birthDate = parseString(item.birth_date ?? item.birthDate);
  const birthYear = birthDate ? new Date(birthDate).getFullYear() : null;
  const childrenCount = parseNumber(item.children_count ?? item.childrenCount) ?? 0;
  const scholarshipAmount = parseNumber(item.scholarship_amount ?? item.scholarshipAmount) ?? 0;
  const { groupId, groupName } = parseGroupFields(item);
  const course = parseNumber(item.course);
  const faculty = parseString(item.faculty ?? item.faculty_name);
  const genderValue = parseGenderValue(item.gender);

  return {
    id: parseNumber(item.id),
    fullName: fullName || 'Без имени',
    genderValue,
    genderLabel: normalizeGender(item.gender),
    birthDate: birthDate || '-',
    birthYear: birthYear && Number.isFinite(birthYear) ? birthYear : null,
    age: calculateAge(birthDate),
    childrenCount,
    scholarshipAmount,
    groupId,
    group: groupName || (groupId !== null ? String(groupId) : '-'),
    course,
    faculty: faculty || '-',
  };
};
