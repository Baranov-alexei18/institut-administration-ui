export type RawTeachingDepartment = Record<string, unknown>;

export type TeachingDepartment = {
  id: number | null;
  name: string;
  faculty: string;
  facultyId: number | null;
  groups: string[];
  courses: number[];
  semesters: number[];
};

export type TeachingDepartmentsFilters = {
  faculty: string;
  group: string;
  course: string;
  semester: string;
  fromYear: string;
  toYear: string;
};
