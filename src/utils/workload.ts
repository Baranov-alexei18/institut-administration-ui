import type { RawWorkload, Workload } from '@/types/workload';
import { parseNumber, parseString } from './students';

export const toWorkload = (item: RawWorkload): Workload => {
  const id = parseNumber(item.id);
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const disciplineName = parseString(item.discipline_name ?? item.disciplineName);
  const lessonType = parseString(item.lesson_type ?? item.lessonType);
  const hours = parseNumber(item.hours) ?? 0;
  const totalHours = parseNumber(item.total_hours ?? item.totalHours) ?? 0;

  return {
    id,
    firstName,
    lastName,
    fullName: fullName || (id !== null ? String(id) : '-'),
    disciplineName: disciplineName || '-',
    lessonType: lessonType || '-',
    hours,
    totalHours,
  };
};
