import type { RawTeachingDepartment, TeachingDepartment } from '@/types/teaching-departments';
import { parseNumber, parseString } from './students';

export const toTeachingDepartment = (item: RawTeachingDepartment): TeachingDepartment => {
  const id = parseNumber(item.id);
  const name = parseString(item.name ?? item.title ?? item.department_name ?? item.departmentName);
  const faculty = parseString(item.faculty ?? item.faculty_name ?? item.facultyName);
  const facultyId = parseNumber(item.facultyId ?? item.faculty_id);

  const groupsRaw = item.groups ?? item.group_ids ?? item.groupIds;
  const groups: string[] = Array.isArray(groupsRaw) ? groupsRaw.map(String) : [];

  const coursesRaw = item.courses ?? item.course_numbers ?? item.courseNumbers;
  const courses: number[] = Array.isArray(coursesRaw)
    ? coursesRaw.map((c) => parseNumber(c) ?? 0).filter((c) => c > 0)
    : [];

  const semestersRaw = item.semesters ?? item.semester_numbers ?? item.semesterNumbers;
  const semesters: number[] = Array.isArray(semestersRaw)
    ? semestersRaw.map((s) => parseNumber(s) ?? 0).filter((s) => s > 0)
    : [];

  return {
    id,
    name: name || (id !== null ? String(id) : '-'),
    faculty: faculty || '-',
    facultyId,
    groups,
    courses,
    semesters,
  };
};
