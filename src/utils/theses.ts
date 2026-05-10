import type { RawThesis, Thesis } from '@/types/theses';
import { parseNumber, parseString } from './students';

export const toThesis = (item: RawThesis): Thesis => {
  const id = parseNumber(item.id);
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const thesisTitle = parseString(item.thesis_title ?? item.thesisTitle ?? item.thesis_topic ?? item.thesisTopic);
  const totalCount = parseNumber(item.total_count ?? item.totalCount) ?? 0;

  return {
    id,
    firstName,
    lastName,
    fullName: fullName || (id !== null ? String(id) : '-'),
    thesisTitle: thesisTitle || '-',
    totalCount,
  };
};
