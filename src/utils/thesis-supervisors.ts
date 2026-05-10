import type { RawThesisSupervisor, ThesisSupervisor } from '@/types/thesis-supervisors';
import { parseNumber, parseString } from './students';

export const toThesisSupervisor = (item: RawThesisSupervisor): ThesisSupervisor => {
  const id = parseNumber(item.id);
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();
  const category = parseString(item.category);
  const thesesCount = parseNumber(item.theses_count ?? item.thesesCount) ?? 0;
  const totalCount = parseNumber(item.total_count ?? item.totalCount) ?? 0;

  return {
    id,
    firstName,
    lastName,
    fullName: fullName || (id !== null ? String(id) : '-'),
    category: category || '-',
    thesesCount,
    totalCount,
  };
};
