import {
  studentsControllerGetTheses,
} from '@/api/generated/institutAdministrationAPI';
import type {
  StudentsControllerGetThesesParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawThesis, Thesis } from '@/types/theses';
import { toThesis } from '@/utils/theses';

const extractTheses = (payload: unknown): RawThesis[] => {
  if (Array.isArray(payload)) {
    return payload as RawThesis[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.theses, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawThesis[];
      }
    }
  }

  return [];
};

export const thesesService = {
  async getTheses(
    params: StudentsControllerGetThesesParams,
  ): Promise<Thesis[]> {
    const response = await studentsControllerGetTheses(params);
    return extractTheses(response).map(toThesis);
  },

  async getAllTheses(): Promise<Thesis[]> {
    const response = await studentsControllerGetTheses();
    return extractTheses(response).map(toThesis);
  },
};
