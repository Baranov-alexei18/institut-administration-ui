import type { RawTeacherByLesson, TeacherByLesson } from '@/types/teachers-by-lesson';
import { parseNumber, parseString } from './students';

export const normalizeLessonType = (value: unknown): string => {
  const type = parseString(value).toLowerCase();
  const typeMap: Record<string, string> = {
    lecture: 'Лекция',
    seminar: 'Семинар',
    lab: 'Лабораторная',
    coursework: 'Курсовая работа',
    consultation: 'Консультация',
    exam: 'Экзамен',
    test: 'Зачет',
    practice: 'Практика',
  };
  return typeMap[type] || parseString(value) || '-';
};

export const toTeacherByLesson = (item: RawTeacherByLesson): TeacherByLesson => {
  const id = parseNumber(item.id);
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const lessonType = parseString(item.lesson_type ?? item.lessonType);
  const lessonTypeLabel = normalizeLessonType(lessonType);
  const group = parseString(item.group_name ?? item.group ?? item.groupName);
  const groupId = parseNumber(item.groupId ?? item.group_id);
  const faculty = parseString(item.faculty_name ?? item.faculty ?? item.facultyName);
  const facultyId = parseNumber(item.facultyId ?? item.faculty_id);
  const totalCount = parseNumber(item.total_count ?? item.totalCount) ?? 0;
  const course = parseNumber(item.course);
  const semester = parseNumber(item.semester);

  return {
    id,
    firstName,
    lastName,
    fullName: fullName || (id !== null ? String(id) : '-'),
    lessonType,
    lessonTypeLabel,
    group: group || (groupId !== null ? String(groupId) : '-'),
    groupId,
    faculty: faculty || '-',
    facultyId,
    totalCount,
    course,
    semester,
  };
};
