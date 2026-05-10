export type RawThesisSupervisor = Record<string, unknown>;

export type ThesisSupervisor = {
  id: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  category: string;
  thesesCount: number;
  totalCount: number;
};

export type ThesisSupervisorsFilters = {
  department: string;
  faculty: string;
  category: string;
};
