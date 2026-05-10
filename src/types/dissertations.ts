export type RawDissertation = Record<string, unknown>;

export type Dissertation = {
  id: number | null;
  type: string;
  typeLabel: string;
  topic: string;
  defenseDate: string;
  defenseYear: number | null;
  teacherId: number | null;
  teacherName: string;
  departmentId: number | null;
  department: string;
  faculty: string;
};

export type DissertationsFilters = {
  faculty: string;
  department: string;
  type: string;
  from: string;
  to: string;
};
