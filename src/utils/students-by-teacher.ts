import type { RawStudentByTeacher, StudentByTeacher } from '@/types/students-by-teacher';
import { parseNumber, parseString } from './students';

export const toStudentByTeacher = (item: RawStudentByTeacher): StudentByTeacher => {
  const id = parseNumber(item.id);
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const group = parseString(item.group_name ?? item.group ?? item.groupName);
  const groupId = parseNumber(item.groupId ?? item.group_id);
  const totalCount = parseNumber(item.total_count ?? item.totalCount) ?? 0;

  return {
    id,
    firstName,
    lastName,
    fullName: fullName || (id !== null ? String(id) : '-'),
    group: group || (groupId !== null ? String(groupId) : '-'),
    groupId,
    totalCount,
  };
};
