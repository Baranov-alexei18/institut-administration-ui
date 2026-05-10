import type { RawDissertation, Dissertation } from '@/types/dissertations';
import { parseNumber, parseString } from './students';

export const parseTeacherFields = (
  item: RawDissertation,
): { teacherId: number | null; teacherName: string } => {
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();

  const teacherId = parseNumber(item.teacherId ?? item.teacher_id);
  const teacherName = fullName || parseString(item.teacher_name ?? item.teacherName);

  if (teacherId !== null || teacherName) {
    return { teacherId, teacherName };
  }

  if (item.teacher && typeof item.teacher === 'object') {
    const teacher = item.teacher as Record<string, unknown>;
    return {
      teacherId: parseNumber(teacher.id ?? teacher.teacherId ?? teacher.teacher_id),
      teacherName: parseString(
        teacher.name ?? teacher.fullName ?? teacher.full_name ?? teacher.teacherName,
      ),
    };
  }

  return { teacherId: null, teacherName: '' };
};

export const parseDepartmentFields = (
  item: RawDissertation,
): { departmentId: number | null; departmentName: string } => {
  const departmentId = parseNumber(item.departmentId ?? item.department_id);
  const departmentName = parseString(item.department_name ?? item.departmentName);

  if (departmentId !== null || departmentName) {
    return { departmentId, departmentName };
  }

  if (item.department && typeof item.department === 'object') {
    const department = item.department as Record<string, unknown>;
    return {
      departmentId: parseNumber(
        department.id ?? department.departmentId ?? department.department_id,
      ),
      departmentName: parseString(department.name ?? department.title ?? department.departmentName),
    };
  }

  return { departmentId: null, departmentName: '' };
};

export const normalizeDissertationType = (value: unknown): string => {
  const type = parseString(value).toLowerCase();
  if (type === 'phd' || type === 'candidate' || type === 'кандидатская') {
    return 'Кандидатская';
  }
  if (type === 'doctor' || type === 'doctorate' || type === 'докторская') {
    return 'Докторская';
  }
  return parseString(value) || '-';
};

export const toDissertation = (item: RawDissertation): Dissertation => {
  const type = parseString(item.type);
  const topic = parseString(item.topic ?? item.dissertation_topic ?? item.dissertationTopic);
  const defenseDate = parseString(item.defense_date ?? item.defenseDate);
  const defenseYear = defenseDate ? new Date(defenseDate).getFullYear() : null;
  const { teacherId, teacherName } = parseTeacherFields(item);
  const { departmentId, departmentName } = parseDepartmentFields(item);
  const faculty = parseString(item.faculty_name ?? item.faculty);

  return {
    id: parseNumber(item.id),
    type,
    typeLabel: normalizeDissertationType(type),
    topic: topic || '-',
    defenseDate: defenseDate || '-',
    defenseYear: defenseYear && Number.isFinite(defenseYear) ? defenseYear : null,
    teacherId,
    teacherName: teacherName || (teacherId !== null ? String(teacherId) : '-'),
    departmentId,
    department: departmentName || (departmentId !== null ? String(departmentId) : '-'),
    faculty: faculty || '-',
  };
};
