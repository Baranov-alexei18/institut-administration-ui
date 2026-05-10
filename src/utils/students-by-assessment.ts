import type { RawStudentByAssessment, StudentByAssessment } from '@/types/students-by-assessment';
import { parseNumber, parseString } from './students';

export const normalizeAssessmentType = (value: unknown): string => {
  const type = parseString(value).toLowerCase();
  const typeMap: Record<string, string> = {
    exam: 'Экзамен',
    credit: 'Зачет',
    coursework: 'Курсовая работа',
    practice: 'Практика',
  };
  return typeMap[type] || parseString(value) || '-';
};

export const toStudentByAssessment = (item: RawStudentByAssessment): StudentByAssessment => {
  const id = parseNumber(item.id);
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const group = parseString(item.group_name ?? item.group ?? item.groupName);
  const groupId = parseNumber(item.groupId ?? item.group_id);
  const discipline = parseString(item.discipline_name ?? item.discipline ?? item.disciplineName);
  const disciplineId = parseNumber(item.disciplineId ?? item.discipline_id);
  const assessmentType = parseString(item.assessment_type ?? item.assessmentType);
  const assessmentTypeLabel = normalizeAssessmentType(assessmentType);
  const grade = parseNumber(item.grade);
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
    assessmentType,
    assessmentTypeLabel,
    grade,
    totalCount,
  };
};
