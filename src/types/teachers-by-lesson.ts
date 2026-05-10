export type RawTeacherByLesson = Record<string, unknown>;

export type TeacherByLesson = {
  id: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  lessonType: string;
  lessonTypeLabel: string;
  group: string;
  groupId: number | null;
  faculty: string;
  facultyId: number | null;
  totalCount: number;
  course: number | null;
  semester: number | null;
};

export type TeachersByLessonFilters = {
  lessonType: string;
  group: string;
  course: string;
  faculty: string;
  semester: string;
  fromYear: string;
  toYear: string;
};
