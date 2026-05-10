import {
  teachersControllerGetThesisSupervisors,
} from '@/api/generated/institutAdministrationAPI';
import type {
  TeachersControllerGetThesisSupervisorsParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawThesisSupervisor, ThesisSupervisor } from '@/types/thesis-supervisors';
import { toThesisSupervisor } from '@/utils/thesis-supervisors';

const extractThesisSupervisors = (payload: unknown): RawThesisSupervisor[] => {
  if (Array.isArray(payload)) {
    return payload as RawThesisSupervisor[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.thesisSupervisors, record.supervisors, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawThesisSupervisor[];
      }
    }
  }

  return [];
};

export const thesisSupervisorsService = {
  async getThesisSupervisors(
    params: TeachersControllerGetThesisSupervisorsParams,
  ): Promise<ThesisSupervisor[]> {
    const response = await teachersControllerGetThesisSupervisors(params);
    return extractThesisSupervisors(response).map(toThesisSupervisor);
  },

  async getAllThesisSupervisors(): Promise<ThesisSupervisor[]> {
    const response = await teachersControllerGetThesisSupervisors();
    return extractThesisSupervisors(response).map(toThesisSupervisor);
  },
};
