import type { RawTeacherByDiscipline, TeacherByDiscipline } from '@/types/teachers-by-discipline';
import { parseNumber, parseString } from './students';

export const toTeacherByDiscipline = (item: RawTeacherByDiscipline): TeacherByDiscipline => {
  const id = parseNumber(item.id);
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const department = parseString(item.department ?? item.department_name ?? item.departmentName);
  const faculty = parseString(item.faculty ?? item.faculty_name ?? item.facultyName);
  const discipline = parseString(item.discipline ?? item.discipline_name ?? item.disciplineName);
  const disciplineId = parseNumber(item.disciplineId ?? item.discipline_id);
  const groupId = parseNumber(item.groupId ?? item.group_id);
  const group = parseString(item.group ?? item.group_name ?? item.groupName);
  const course = parseNumber(item.course);
  const facultyId = parseNumber(item.facultyId ?? item.faculty_id);

  return {
    id,
    firstName,
    lastName,
    fullName: fullName || (id !== null ? String(id) : '-'),
    department: department || '-',
    faculty: faculty || '-',
    discipline: discipline || (disciplineId !== null ? String(disciplineId) : '-'),
    disciplineId,
    groupId,
    group: group || (groupId !== null ? String(groupId) : '-'),
    course,
    facultyId,
  };
};
