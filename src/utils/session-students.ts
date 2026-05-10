import type { RawSessionStudent, SessionStudent } from '@/types/session-students';
import { parseNumber, parseString } from './students';

export const toSessionStudent = (item: RawSessionStudent): SessionStudent => {
  const id = parseNumber(item.id);
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const group = parseString(item.group_name ?? item.group ?? item.groupName);
  const groupId = parseNumber(item.groupId ?? item.group_id);
  const course = parseNumber(item.course);
  const faculty = parseString(item.faculty ?? item.faculty_name ?? item.facultyName);
  const facultyId = parseNumber(item.facultyId ?? item.faculty_id);
  const semester = parseNumber(item.semester);
  const grade = parseNumber(item.grade);
  const totalCount = parseNumber(item.total_count ?? item.totalCount) ?? 0;

  return {
    id,
    firstName,
    lastName,
    fullName: fullName || (id !== null ? String(id) : '-'),
    group: group || (groupId !== null ? String(groupId) : '-'),
    groupId,
    course,
    faculty: faculty || '-',
    facultyId,
    semester,
    grade,
    totalCount,
  };
};
