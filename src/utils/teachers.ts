import type { RawTeacher, Teacher } from '@/types/teachers';
import { StudentsControllerGetStudentsGender as StudentsGender } from '@/api/generated/institutAdministrationAPI.schemas';
import { parseNumber, parseString, calculateAge } from './students';

export const parseDepartmentFields = (
  item: RawTeacher,
): { departmentId: number | null; departmentName: string } => {
  const directDepartmentId = parseNumber(item.departmentId ?? item.department_id);
  const directDepartmentName = parseString(item.department_name ?? item.departmentName);

  if (directDepartmentId !== null || directDepartmentName) {
    return { departmentId: directDepartmentId, departmentName: directDepartmentName };
  }

  if (item.department && typeof item.department === 'object') {
    const department = item.department as Record<string, unknown>;
    return {
      departmentId: parseNumber(
        department.id ?? department.departmentId ?? department.department_id,
      ),
      departmentName: parseString(department.name ?? department.title ?? department.departmentName),
    };
  }

  return { departmentId: null, departmentName: '' };
};

export const parseCategoryFields = (
  item: RawTeacher,
): { categoryId: number | null; categoryName: string } => {
  const directCategoryId = parseNumber(item.categoryId ?? item.category_id);
  const directCategoryName = parseString(item.category_name ?? item.categoryName);

  if (directCategoryId !== null || directCategoryName) {
    return { categoryId: directCategoryId, categoryName: directCategoryName };
  }

  if (item.category && typeof item.category === 'object') {
    const category = item.category as Record<string, unknown>;
    return {
      categoryId: parseNumber(category.id ?? category.categoryId ?? category.category_id),
      categoryName: parseString(category.name ?? category.title ?? category.categoryName),
    };
  }

  return { categoryId: null, categoryName: '' };
};

export const normalizeGender = (value: unknown): string => {
  const gender = parseString(value).toLowerCase();
  if (gender === StudentsGender.male) {
    return 'Мужской';
  }

  if (gender === StudentsGender.female) {
    return 'Женский';
  }

  return '-';
};

export const parseGenderValue = (value: unknown): string => {
  const gender = parseString(value).toLowerCase();
  if (gender === StudentsGender.male || gender === StudentsGender.female) {
    return gender;
  }

  return '';
};

export const parseDissertationFields = (
  item: RawTeacher,
): { hasPhD: boolean; hasDoctorate: boolean; defenseDate: string | null } => {
  const dissertations = item.dissertations;
  let hasPhD = false;
  let hasDoctorate = false;
  let defenseDate: string | null = null;

  if (Array.isArray(dissertations)) {
    for (const diss of dissertations) {
      if (typeof diss === 'object' && diss !== null) {
        const dissObj = diss as Record<string, unknown>;
        const type = parseString(dissObj.type).toLowerCase();
        const date = parseString(dissObj.defenseDate ?? dissObj.defense_date);

        if (type === 'phd' || type === 'candidate') {
          hasPhD = true;
        } else if (type === 'doctor' || type === 'doctorate') {
          hasDoctorate = true;
        }

        if (date && !defenseDate) {
          defenseDate = date;
        }
      }
    }
  }

  return { hasPhD, hasDoctorate, defenseDate };
};

export const toTeacher = (item: RawTeacher): Teacher => {
  const firstName = parseString(item.first_name ?? item.firstName);
  const lastName = parseString(item.last_name ?? item.lastName);
  const fullName = [lastName, firstName].filter(Boolean).join(' ').trim();

  const birthDate = parseString(item.birth_date ?? item.birthDate);
  const birthYear = birthDate ? new Date(birthDate).getFullYear() : null;
  const childrenCount = parseNumber(item.children_count ?? item.childrenCount) ?? 0;
  const salary = parseNumber(item.salary) ?? 0;
  const { departmentId, departmentName } = parseDepartmentFields(item);
  const { categoryId, categoryName } = parseCategoryFields(item);
  const faculty = parseString(item.faculty ?? item.faculty_name);
  const genderValue = parseGenderValue(item.gender);
  const isPostgraduateStudent = Boolean(item.isPostgraduateStudent ?? item.is_postgraduate_student);
  const { hasPhD, hasDoctorate, defenseDate } = parseDissertationFields(item);

  let degree = '-';
  if (hasDoctorate) {
    degree = 'Докторская';
  } else if (hasPhD) {
    degree = 'Кандидатская';
  }

  return {
    id: parseNumber(item.id),
    fullName: fullName || 'Без имени',
    genderValue,
    genderLabel: normalizeGender(item.gender),
    birthDate: birthDate || '-',
    birthYear: birthYear && Number.isFinite(birthYear) ? birthYear : null,
    age: calculateAge(birthDate),
    childrenCount,
    salary,
    departmentId,
    department: departmentName || (departmentId !== null ? String(departmentId) : '-'),
    categoryId,
    category: categoryName || (categoryId !== null ? String(categoryId) : '-'),
    faculty: faculty || '-',
    isPostgraduateStudent,
    hasPhD,
    hasDoctorate,
    dissertationDefenseDate: defenseDate,
    degree,
  };
};
