import { defineStore } from 'pinia';
import { ref } from 'vue';

import {
  dictionaryControllerGetDepartments,
  dictionaryControllerGetDisciplines,
  dictionaryControllerGetFaculties,
  dictionaryControllerGetGroups,
  dictionaryControllerGetLessonTypes,
  dictionaryControllerGetTeacherCategories,
  dissertationsControllerGetAll,
} from '../api/generated/institutAdministrationAPI';

type RawRecord = Record<string, unknown>;

export type ReferenceGroup = {
  id: number | null;
  name: string;
  course: number | null;
  faculty: string;
  facultyId: number | null;
};

export type ReferenceItem = {
  id: number | null;
  name: string;
};

const toArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as RawRecord;
    const candidates = [record.data, record.items, record.results, record.groups, record.faculties];
    const arrayCandidate = candidates.find((item) => Array.isArray(item));
    return Array.isArray(arrayCandidate) ? arrayCandidate : [];
  }

  return [];
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const parseString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const toReferenceItems = (payload: unknown): ReferenceItem[] => {
  return toArray(payload)
    .map((item) => {
      const record = item as RawRecord;
      const id = parseNumber(record.id ?? record.valueId);
      const name = parseString(record.name ?? record.title ?? record.value ?? record.label);
      if (!name) {
        return null;
      }
      return { id, name };
    })
    .filter((item): item is ReferenceItem => item !== null);
};

const toReferenceGroups = (payload: unknown): ReferenceGroup[] => {
  return toArray(payload)
    .map((item) => {
      const record = item as RawRecord;
      const id = parseNumber(record.id ?? record.groupId ?? record.group_id);
      const name = parseString(
        record.name ?? record.title ?? record.groupName ?? record.group_name,
      );
      if (!name) {
        return null;
      }
      return {
        id,
        name,
        course: parseNumber(record.course ?? record.courseNumber),
        faculty: parseString(record.faculty ?? record.facultyName ?? record.faculty_name),
        facultyId: parseNumber(record.facultyId ?? record.faculty_id),
      };
    })
    .filter((item): item is ReferenceGroup => item !== null);
};

export const useReferenceDataStore = defineStore('reference-data', () => {
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const error = ref<string | null>(null);

  const groups = ref<ReferenceGroup[]>([]);
  const faculties = ref<ReferenceItem[]>([]);
  const departments = ref<ReferenceItem[]>([]);
  const disciplines = ref<ReferenceItem[]>([]);
  const lessonTypes = ref<ReferenceItem[]>([]);
  const teacherCategories = ref<ReferenceItem[]>([]);
  const dissertations = ref<ReferenceItem[]>([]);

  const loadReferenceData = async (): Promise<void> => {
    if (isLoading.value || isLoaded.value) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const [
        groupsResponse,
        facultiesResponse,
        departmentsResponse,
        disciplinesResponse,
        lessonTypesResponse,
        categoriesResponse,
        dissertationsResponse,
      ] = await Promise.all([
        dictionaryControllerGetGroups(),
        dictionaryControllerGetFaculties(),
        dictionaryControllerGetDepartments(),
        dictionaryControllerGetDisciplines(),
        dictionaryControllerGetLessonTypes(),
        dictionaryControllerGetTeacherCategories(),
        dissertationsControllerGetAll(),
      ]);
      groups.value = toReferenceGroups(groupsResponse);
      faculties.value = toReferenceItems(facultiesResponse);
      departments.value = toReferenceItems(departmentsResponse);
      disciplines.value = toReferenceItems(disciplinesResponse);
      lessonTypes.value = toReferenceItems(lessonTypesResponse);
      teacherCategories.value = toReferenceItems(categoriesResponse);
      dissertations.value = toReferenceItems(dissertationsResponse);

      isLoaded.value = true;
    } catch {
      error.value = 'Не удалось загрузить справочники.';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    isLoaded,
    error,
    groups,
    faculties,
    departments,
    disciplines,
    lessonTypes,
    teacherCategories,
    dissertations,
    loadReferenceData,
  };
});
