import {
  teachersControllerGetWorkload,
} from '@/api/generated/institutAdministrationAPI';
import type {
  TeachersControllerGetWorkloadParams,
} from '@/api/generated/institutAdministrationAPI.schemas';
import type { RawWorkload, Workload } from '@/types/workload';
import { toWorkload } from '@/utils/workload';

const extractWorkload = (payload: unknown): RawWorkload[] => {
  if (Array.isArray(payload)) {
    return payload as RawWorkload[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const arrays = [record.data, record.workload, record.items];

    for (const candidate of arrays) {
      if (Array.isArray(candidate)) {
        return candidate as RawWorkload[];
      }
    }
  }

  return [];
};

export const workloadService = {
  async getWorkload(
    params: TeachersControllerGetWorkloadParams,
  ): Promise<Workload[]> {
    const response = await teachersControllerGetWorkload(params);
    return extractWorkload(response).map(toWorkload);
  },

  async getAllWorkload(): Promise<Workload[]> {
    const response = await teachersControllerGetWorkload({ semester: 1 });
    return extractWorkload(response).map(toWorkload);
  },
};
