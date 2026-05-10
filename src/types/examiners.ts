export type RawExaminer = Record<string, unknown>;

export type Examiner = {
  id: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  group: string;
  groupId: number | null;
  discipline: string;
  disciplineId: number | null;
  semester: number | null;
  year: number | null;
  totalCount: number;
};

export type ExaminersFilters = {
  group: string;
  discipline: string;
  semester: string;
  year: string;
};
