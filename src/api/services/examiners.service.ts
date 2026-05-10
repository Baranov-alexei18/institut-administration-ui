import {
  teachersControllerGetExaminers,
} from '@/api/generated/institutAdministrationAPI';
import type {
  TeachersControllerGetExaminersParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawExaminer, Examiner } from '@/types/examiners';
import { toExaminer } from '@/utils/examiners';

const extractExaminers = (payload: unknown): RawExaminer[] => {
  if (Array.isArray(payload)) {
    return payload as RawExaminer[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.examiners, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawExaminer[];
      }
    }
  }

  return [];
};

export const examinersService = {
  async getExaminers(
    params: TeachersControllerGetExaminersParams,
  ): Promise<Examiner[]> {
    const response = await teachersControllerGetExaminers(params);
    return extractExaminers(response).map(toExaminer);
  },

  async getAllExaminers(): Promise<Examiner[]> {
    const response = await teachersControllerGetExaminers();
    return extractExaminers(response).map(toExaminer);
  },
};
