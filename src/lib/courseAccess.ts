export type MaterialType = 'pdf' | 'video' | 'live';
export type AccessPlan = 'basic' | 'intermediate' | 'advanced';

const courseLevelToAllowedTypes: Record<string, MaterialType[]> = {
  beginner: ['pdf'],
  intermediate: ['pdf', 'video'],
  advanced: ['pdf', 'video', 'live'],
};

const planToAllowedTypes: Record<AccessPlan, MaterialType[]> = {
  basic: ['pdf'],
  intermediate: ['pdf', 'video'],
  advanced: ['pdf', 'video', 'live'],
};

export function getAllowedMaterialTypesForCourseLevel(level?: string | null): MaterialType[] {
  if (!level) return courseLevelToAllowedTypes.beginner;
  return courseLevelToAllowedTypes[level] ?? courseLevelToAllowedTypes.beginner;
}

export function getAllowedMaterialTypesForPlan(plan?: string | null): MaterialType[] {
  if (!plan) return planToAllowedTypes.basic;
  return planToAllowedTypes[plan as AccessPlan] ?? planToAllowedTypes.basic;
}

export function isMaterialAllowedForCourseAndPlan(type: string, courseLevel?: string | null, plan?: string | null): boolean {
  const courseTypes = getAllowedMaterialTypesForCourseLevel(courseLevel);
  const planTypes = getAllowedMaterialTypesForPlan(plan);
  const allowedTypes = courseTypes.filter((materialType) => planTypes.includes(materialType));
  return allowedTypes.includes(type as MaterialType);
}

export function getMaterialAccessPlanFromSubscription(subscriptionPlan?: string | null, subscriptionIsActive?: number | boolean | null): AccessPlan {
  if (!subscriptionPlan || subscriptionIsActive === 0 || subscriptionIsActive === false) {
    return 'basic';
  }

  if (subscriptionPlan === 'premium' || subscriptionPlan === 'advanced') return 'advanced';
  if (subscriptionPlan === 'standard' || subscriptionPlan === 'intermediate') return 'intermediate';
  return 'basic';
}
