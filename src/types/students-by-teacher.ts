export type RawStudentByTeacher = Record<string, unknown>;

export type StudentByTeacher = {
  id: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  group: string;
  groupId: number | null;
  totalCount: number;
};

export type StudentsByTeacherFilters = {
  group: string;
  teacher: string;
  discipline: string;
  semester: string;
  fromYear: string;
  toYear: string;
  grade: string;
};
