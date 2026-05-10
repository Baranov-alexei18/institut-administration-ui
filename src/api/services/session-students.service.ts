import {
  studentsControllerGetSessionStudents,
} from '@/api/generated/institutAdministrationAPI';
import type {
  StudentsControllerGetSessionStudentsParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawSessionStudent, SessionStudent } from '@/types/session-students';
import { toSessionStudent } from '@/utils/session-students';

const extractSessionStudents = (payload: unknown): RawSessionStudent[] => {
  if (Array.isArray(payload)) {
    return payload as RawSessionStudent[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.students, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawSessionStudent[];
      }
    }
  }

  return [];
};

export const sessionStudentsService = {
  async getSessionStudents(
    params: StudentsControllerGetSessionStudentsParams,
  ): Promise<SessionStudent[]> {
    const response = await studentsControllerGetSessionStudents(params);
    return extractSessionStudents(response).map(toSessionStudent);
  },

  async getAllSessionStudents(): Promise<SessionStudent[]> {
    const response = await studentsControllerGetSessionStudents({
      type: 'excellent',
    });
    return extractSessionStudents(response).map(toSessionStudent);
  },
};
