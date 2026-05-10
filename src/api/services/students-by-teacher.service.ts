import {
  studentsControllerGetStudentsByTeacher,
} from '@/api/generated/institutAdministrationAPI';
import type {
  StudentsControllerGetStudentsByTeacherParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawStudentByTeacher, StudentByTeacher } from '@/types/students-by-teacher';
import { toStudentByTeacher } from '@/utils/students-by-teacher';

const extractStudentsByTeacher = (payload: unknown): RawStudentByTeacher[] => {
  if (Array.isArray(payload)) {
    return payload as RawStudentByTeacher[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.students, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawStudentByTeacher[];
      }
    }
  }

  return [];
};

export const studentsByTeacherService = {
  async getStudentsByTeacher(
    params: StudentsControllerGetStudentsByTeacherParams,
  ): Promise<StudentByTeacher[]> {
    const response = await studentsControllerGetStudentsByTeacher(params);
    return extractStudentsByTeacher(response).map(toStudentByTeacher);
  },

  async getAllStudentsByTeacher(): Promise<StudentByTeacher[]> {
    const response = await studentsControllerGetStudentsByTeacher();
    return extractStudentsByTeacher(response).map(toStudentByTeacher);
  },
};
