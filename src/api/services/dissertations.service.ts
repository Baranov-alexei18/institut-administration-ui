import { dissertationsControllerGetAll } from '@/api/generated/institutAdministrationAPI';
import type { DissertationsControllerGetAllParams } from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawDissertation, Dissertation } from '@/types/dissertations';
import { toDissertation } from '@/utils/dissertations';

const extractDissertations = (payload: unknown): RawDissertation[] => {
  if (Array.isArray(payload)) {
    return payload as RawDissertation[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.dissertations, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawDissertation[];
      }
    }
  }

  return [];
};

export const dissertationsService = {
  async getDissertations(params: DissertationsControllerGetAllParams): Promise<Dissertation[]> {
    const response = await dissertationsControllerGetAll(params);
    return extractDissertations(response).map(toDissertation);
  },

  async getAllDissertations(): Promise<Dissertation[]> {
    const response = await dissertationsControllerGetAll();
    return extractDissertations(response).map(toDissertation);
  },
};
