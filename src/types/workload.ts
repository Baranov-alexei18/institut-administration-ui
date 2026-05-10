export type RawWorkload = Record<string, unknown>;

export type Workload = {
  id: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  disciplineName: string;
  lessonType: string;
  hours: number;
  totalHours: number;
};

export type WorkloadFilters = {
  semester: string;
  teacher: string;
  department: string;
};
