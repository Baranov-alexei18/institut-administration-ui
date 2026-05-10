import {
  departmentsControllerGetTeachingDepartments,
} from '@/api/generated/institutAdministrationAPI';
import type {
  DepartmentsControllerGetTeachingDepartmentsParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawTeachingDepartment, TeachingDepartment } from '@/types/teaching-departments';
import { toTeachingDepartment } from '@/utils/teaching-departments';

const extractTeachingDepartments = (payload: unknown): RawTeachingDepartment[] => {
  if (Array.isArray(payload)) {
    return payload as RawTeachingDepartment[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.departments, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawTeachingDepartment[];
      }
    }
  }

  return [];
};

export const departmentsService = {
  async getTeachingDepartments(
    params: DepartmentsControllerGetTeachingDepartmentsParams,
  ): Promise<TeachingDepartment[]> {
    const response = await departmentsControllerGetTeachingDepartments(params);
    return extractTeachingDepartments(response).map(toTeachingDepartment);
  },

  async getAllTeachingDepartments(): Promise<TeachingDepartment[]> {
    const response = await departmentsControllerGetTeachingDepartments();
    return extractTeachingDepartments(response).map(toTeachingDepartment);
  },
};
