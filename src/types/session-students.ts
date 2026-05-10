export type RawSessionStudent = Record<string, unknown>;

export type SessionStudent = {
  id: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  group: string;
  groupId: number | null;
  course: number | null;
  faculty: string;
  facultyId: number | null;
  semester: number | null;
  grade: number | null;
  totalCount: number;
};

export type SessionStudentsFilters = {
  semester: string;
  year: string;
  group: string;
  course: string;
  faculty: string;
  type: string;
};
