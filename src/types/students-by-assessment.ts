export type RawStudentByAssessment = Record<string, unknown>;

export type StudentByAssessment = {
  id: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  group: string;
  groupId: number | null;
  discipline: string;
  disciplineId: number | null;
  assessmentType: string;
  assessmentTypeLabel: string;
  grade: number | null;
  totalCount: number;
};

export type StudentsByAssessmentFilters = {
  group: string;
  discipline: string;
  assessmentType: string;
  grade: string;
};
