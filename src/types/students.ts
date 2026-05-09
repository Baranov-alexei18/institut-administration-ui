export type RawStudent = Record<string, unknown>;

export type Student = {
  id: number | null;
  fullName: string;
  genderValue: string;
  genderLabel: string;
  birthDate: string;
  birthYear: number | null;
  age: number | null;
  childrenCount: number;
  scholarshipAmount: number;
  groupId: number | null;
  group: string;
  course: number | null;
  faculty: string;
};

export type StudentsFilters = {
  faculty: string;
  course: string;
  group: string;
  gender: string;
  birthYear: string;
  childrenCount: string;
  minScholarship: string;
};

export type CreateStudentForm = {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  childrenCount: string;
  groupId: string;
  scholarshipAmount: string;
};
