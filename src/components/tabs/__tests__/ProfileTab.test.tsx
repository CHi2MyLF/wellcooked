import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Recipe } from '@/types/recipe';
import ProfileTab from '@/components/tabs/ProfileTab';

const recipe: Recipe = {
  id: 'r1',
  name: 'Test Recipe',
  difficulty: 'easy',
  time: '10m',
  steps: ['step1'],
  tips: [],
  mainIngredient: 'egg',
  createdAt: '2026-03-22T00:00:00.000Z',
};

const renderProfileTab = (profileSubTab: 'cooked' | 'want' = 'cooked') => {
  const onProfileSubTabChange = vi.fn();
  const onViewSavedRecipe = vi.fn();
  render(
    <ProfileTab
      profileSubTab={profileSubTab}
      onProfileSubTabChange={onProfileSubTabChange}
      profileRecipes={[recipe]}
      totalCookedCount={1}
      totalWantCount={1}
      cookableWantCount={1}
      topMissingItems={[]}
      isRecipesHydrated
      weeklyCookedDays={1}
      weeklyGoal={7}
      consecutiveCookDays={1}
      recentCookTrend={[
        { label: 'Mon', count: 0 },
        { label: 'Tue', count: 1 },
        { label: 'Wed', count: 0 },
        { label: 'Thu', count: 1 },
        { label: 'Fri', count: 0 },
        { label: 'Sat', count: 0 },
        { label: 'Sun', count: 1 },
      ]}
      profileFunnelStats={{
        profileEntryCount: 1,
        wantTabClickCount: 1,
        wantRecipeOpenCount: 1,
        cookedMarkCount: 1,
        updatedAt: '',
      }}
      onViewSavedRecipe={onViewSavedRecipe}
      onOpenSearchHistory={vi.fn()}
      onOpenStapleIngredientsModal={vi.fn()}
      onOpenGenerateTab={vi.fn()}
      onOpenManageRecipes={vi.fn()}
    />,
  );
  return { onProfileSubTabChange, onViewSavedRecipe };
};

describe('ProfileTab', () => {
  it('keeps today plan card visible while switching tabs', () => {
    const { onProfileSubTabChange } = renderProfileTab('cooked');
    expect(screen.getByTestId('today-plan-title')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('profile-tab-want'));
    expect(onProfileSubTabChange).toHaveBeenCalledWith('want');
    expect(screen.getByTestId('today-plan-title')).toBeInTheDocument();
  });

  it('calls onViewSavedRecipe with source = profile_want under want tab', () => {
    const { onViewSavedRecipe } = renderProfileTab('want');
    fireEvent.click(screen.getByTestId('profile-recipe-r1'));
    expect(onViewSavedRecipe).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }), 'profile_want');
  });

  it('calls onViewSavedRecipe with source = profile_cooked under cooked tab', () => {
    const { onViewSavedRecipe } = renderProfileTab('cooked');
    fireEvent.click(screen.getByTestId('profile-recipe-r1'));
    expect(onViewSavedRecipe).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }), 'profile_cooked');
  });
});
