import {
  teachersControllerCreate,
  teachersControllerGetTeachers,
  teachersControllerUpdate,
  teachersControllerRemove,
} from '@/api/generated/institutAdministrationAPI';
import type {
  CreateTeacherDto,
  TeachersControllerGetTeachersParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawTeacher, Teacher } from '@/types/teachers';
import { toTeacher } from '@/utils/teachers';

const extractTeachers = (payload: unknown): RawTeacher[] => {
  if (Array.isArray(payload)) {
    return payload as RawTeacher[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.teachers, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawTeacher[];
      }
    }
  }

  return [];
};

export const teachersService = {
  async getTeachers(params: TeachersControllerGetTeachersParams): Promise<Teacher[]> {
    const response = await teachersControllerGetTeachers(params);
    return extractTeachers(response).map(toTeacher);
  },

  async getAllTeachers(): Promise<Teacher[]> {
    const response = await teachersControllerGetTeachers();
    return extractTeachers(response).map(toTeacher);
  },

  async createTeacher(payload: CreateTeacherDto): Promise<void> {
    await teachersControllerCreate(payload);
  },

  async updateTeacher(id: number, payload: CreateTeacherDto): Promise<void> {
    await teachersControllerUpdate(id, payload);
  },

  async deleteTeacher(id: number): Promise<void> {
    await teachersControllerRemove(id);
  },
};
