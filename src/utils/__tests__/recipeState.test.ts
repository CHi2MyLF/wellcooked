import { describe, expect, it } from 'vitest';

import type { Recipe } from '@/types/recipe';
import { clearCookedState, markCookedState, setWantToCookState, toggleWantToCookState } from '@/utils/recipeState';

const baseRecipe: Recipe = {
  id: '1',
  name: '测试菜谱',
  difficulty: '简单',
  time: '10分钟',
  steps: ['step1'],
  tips: [],
  mainIngredient: '鸡蛋',
  createdAt: '2026-03-22T00:00:00.000Z',
  isWantToCook: false,
  isCooked: false,
};

describe('recipeState helpers', () => {
  it('toggles want-to-cook flag', () => {
    const next = toggleWantToCookState(baseRecipe);
    expect(next.isWantToCook).toBe(true);
  });

  it('sets want-to-cook flag explicitly', () => {
    const next = setWantToCookState(baseRecipe, true);
    expect(next.isWantToCook).toBe(true);
  });

  it('clears cooked state and cookedAt', () => {
    const cookedRecipe = { ...baseRecipe, isCooked: true, cookedAt: '2026-03-22T08:00:00.000Z' };
    const next = clearCookedState(cookedRecipe);
    expect(next.isCooked).toBe(false);
    expect(next.cookedAt).toBeUndefined();
  });

  it('marks recipe cooked with optional rating and comment', () => {
    const next = markCookedState(baseRecipe, '2026-03-22T08:00:00.000Z', 5, '很好吃');
    expect(next.isCooked).toBe(true);
    expect(next.cookedAt).toBe('2026-03-22T08:00:00.000Z');
    expect(next.rating).toBe(5);
    expect(next.comment).toBe('很好吃');
  });
});
