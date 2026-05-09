import {
  studentsControllerCreate,
  studentsControllerGetStudents,
} from '@/api/generated/institutAdministrationAPI';
import type {
  CreateStudentDto,
  StudentsControllerGetStudentsParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawStudent, Student } from '@/types/students';
import { toStudent } from '@/utils/students';

const extractStudents = (payload: unknown): RawStudent[] => {
  if (Array.isArray(payload)) {
    return payload as RawStudent[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.students, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawStudent[];
      }
    }
  }

  return [];
};

export const studentsService = {
  async getStudents(params: StudentsControllerGetStudentsParams): Promise<Student[]> {
    const response = await studentsControllerGetStudents(params);
    return extractStudents(response).map(toStudent);
  },

  async getAllStudents(): Promise<Student[]> {
    const response = await studentsControllerGetStudents();
    return extractStudents(response).map(toStudent);
  },

  async createStudent(payload: CreateStudentDto): Promise<void> {
    await studentsControllerCreate(payload);
  },
};
