import {
  teachersControllerGetByDiscipline,
} from '@/api/generated/institutAdministrationAPI';
import type {
  TeachersControllerGetByDisciplineParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawTeacherByDiscipline, TeacherByDiscipline } from '@/types/teachers-by-discipline';
import { toTeacherByDiscipline } from '@/utils/teachers-by-discipline';

const extractTeachersByDiscipline = (payload: unknown): RawTeacherByDiscipline[] => {
  if (Array.isArray(payload)) {
    return payload as RawTeacherByDiscipline[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.teachers, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawTeacherByDiscipline[];
      }
    }
  }

  return [];
};

export const teachersByDisciplineService = {
  async getTeachersByDiscipline(
    params: TeachersControllerGetByDisciplineParams,
  ): Promise<TeacherByDiscipline[]> {
    const response = await teachersControllerGetByDiscipline(params);
    return extractTeachersByDiscipline(response).map(toTeacherByDiscipline);
  },

  async getAllTeachersByDiscipline(): Promise<TeacherByDiscipline[]> {
    const response = await teachersControllerGetByDiscipline();
    return extractTeachersByDiscipline(response).map(toTeacherByDiscipline);
  },
};
