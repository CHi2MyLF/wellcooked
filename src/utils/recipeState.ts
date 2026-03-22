import type { Recipe } from '@/types/recipe';

export const toggleWantToCookState = (recipe: Recipe): Recipe => ({
  ...recipe,
  isWantToCook: !recipe.isWantToCook,
});

export const setWantToCookState = (recipe: Recipe, isWantToCook: boolean): Recipe => ({
  ...recipe,
  isWantToCook,
});

export const clearCookedState = (recipe: Recipe): Recipe => ({
  ...recipe,
  isCooked: false,
  cookedAt: undefined,
});

export const markCookedState = (
  recipe: Recipe,
  cookedAt: string,
  rating?: number,
  comment?: string,
): Recipe => ({
  ...recipe,
  isCooked: true,
  cookedAt,
  ...(rating !== undefined ? { rating } : {}),
  ...(comment !== undefined ? { comment } : {}),
});
