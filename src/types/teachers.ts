export type RawTeacher = Record<string, unknown>;

export type Teacher = {
  id: number | null;
  fullName: string;
  genderValue: string;
  genderLabel: string;
  birthDate: string;
  birthYear: number | null;
  age: number | null;
  childrenCount: number;
  salary: number;
  departmentId: number | null;
  department: string;
  categoryId: number | null;
  category: string;
  faculty: string;
  isPostgraduateStudent: boolean;
  hasPhD: boolean;
  hasDoctorate: boolean;
  dissertationDefenseDate: string | null;
  degree: string;
};

export type TeachersFilters = {
  faculty: string;
  department: string;
  category: string;
  gender: string;
  birthYear: string;
  childrenCount: string;
  minSalary: string;
  isPhd: string;
  isDoctor: string;
  defenseFrom: string;
  defenseTo: string;
};

export type CreateTeacherForm = {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  childrenCount: string;
  departmentId: string;
  categoryId: string;
  salary: string;
  isPostgraduateStudent: boolean;
  dissertationType: string;
  dissertationTopic: string;
  dissertationDefenseDate: string;
};
