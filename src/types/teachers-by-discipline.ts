export type RawTeacherByDiscipline = Record<string, unknown>;

export type TeacherByDiscipline = {
  id: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  department: string;
  faculty: string;
  discipline: string;
  disciplineId: number | null;
  groupId: number | null;
  group: string;
  course: number | null;
  facultyId: number | null;
};

export type TeachersByDisciplineFilters = {
  discipline: string;
  group: string;
  course: string;
  faculty: string;
};
