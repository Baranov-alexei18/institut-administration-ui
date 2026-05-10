import type { RawExaminer, Examiner } from '@/types/examiners';
import { parseNumber, parseString } from './students';

export const toExaminer = (item: RawExaminer): Examiner => {
  const id = parseNumber(item.id);
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const group = parseString(item.group_name ?? item.group ?? item.groupName);
  const groupId = parseNumber(item.groupId ?? item.group_id);
  const discipline = parseString(item.discipline_name ?? item.discipline ?? item.disciplineName);
  const disciplineId = parseNumber(item.disciplineId ?? item.discipline_id);
  const semester = parseNumber(item.semester);
  const year = parseNumber(item.year);
  const totalCount = parseNumber(item.total_count ?? item.totalCount) ?? 0;

  return {
    id,
    firstName,
    lastName,
    fullName: fullName || (id !== null ? String(id) : '-'),
    group: group || (groupId !== null ? String(groupId) : '-'),
    groupId,
    discipline: discipline || '-',
    disciplineId,
    semester,
    year,
    totalCount,
  };
};
