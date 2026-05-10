export type RawThesis = Record<string, unknown>;

export type Thesis = {
  id: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  thesisTitle: string;
  totalCount: number;
};

export type ThesesFilters = {
  department: string;
  teacher: string;
};
