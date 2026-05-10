import {
  teachersControllerGetByLessons,
} from '@/api/generated/institutAdministrationAPI';
import type {
  TeachersControllerGetByLessonsParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawTeacherByLesson, TeacherByLesson } from '@/types/teachers-by-lesson';
import { toTeacherByLesson } from '@/utils/teachers-by-lesson';

const extractTeachersByLesson = (payload: unknown): RawTeacherByLesson[] => {
  if (Array.isArray(payload)) {
    return payload as RawTeacherByLesson[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.teachers, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawTeacherByLesson[];
      }
    }
  }

  return [];
};

export const teachersByLessonService = {
  async getTeachersByLesson(
    params: TeachersControllerGetByLessonsParams,
  ): Promise<TeacherByLesson[]> {
    const response = await teachersControllerGetByLessons(params);
    return extractTeachersByLesson(response).map(toTeacherByLesson);
  },

  async getAllTeachersByLesson(): Promise<TeacherByLesson[]> {
    const response = await teachersControllerGetByLessons();
    return extractTeachersByLesson(response).map(toTeacherByLesson);
  },
};
