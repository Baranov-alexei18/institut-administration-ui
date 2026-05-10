import {
  studentsControllerGetByAssessment,
} from '@/api/generated/institutAdministrationAPI';
import type {
  StudentsControllerGetByAssessmentParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawStudentByAssessment, StudentByAssessment } from '@/types/students-by-assessment';
import { toStudentByAssessment } from '@/utils/students-by-assessment';

const extractStudentsByAssessment = (payload: unknown): RawStudentByAssessment[] => {
  if (Array.isArray(payload)) {
    return payload as RawStudentByAssessment[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.students, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawStudentByAssessment[];
      }
    }
  }

  return [];
};

export const studentsByAssessmentService = {
  async getStudentsByAssessment(
    params: StudentsControllerGetByAssessmentParams,
  ): Promise<StudentByAssessment[]> {
    const response = await studentsControllerGetByAssessment(params);
    return extractStudentsByAssessment(response).map(toStudentByAssessment);
  },

  async getAllStudentsByAssessment(): Promise<StudentByAssessment[]> {
    const response = await studentsControllerGetByAssessment();
    return extractStudentsByAssessment(response).map(toStudentByAssessment);
  },
};
