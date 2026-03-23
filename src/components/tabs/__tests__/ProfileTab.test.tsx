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

type RenderOptions = {
  profileSubTab?: 'cooked' | 'want';
  profileRecipes?: Recipe[];
};

const renderProfileTab = ({ profileSubTab = 'cooked', profileRecipes = [recipe] }: RenderOptions = {}) => {
  const onProfileSubTabChange = vi.fn();
  const onViewSavedRecipe = vi.fn();
  const onOpenSearchHistory = vi.fn();
  const onOpenStapleIngredientsModal = vi.fn();
  const onOpenGenerateTab = vi.fn();
  const onOpenManageRecipes = vi.fn();

  render(
    <ProfileTab
      profileSubTab={profileSubTab}
      onProfileSubTabChange={onProfileSubTabChange}
      profileRecipes={profileRecipes}
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
      onOpenSearchHistory={onOpenSearchHistory}
      onOpenStapleIngredientsModal={onOpenStapleIngredientsModal}
      onOpenGenerateTab={onOpenGenerateTab}
      onOpenManageRecipes={onOpenManageRecipes}
    />,
  );

  return {
    onProfileSubTabChange,
    onViewSavedRecipe,
    onOpenSearchHistory,
    onOpenStapleIngredientsModal,
    onOpenGenerateTab,
    onOpenManageRecipes,
  };
};

describe('ProfileTab', () => {
  it('keeps today plan card visible while switching tabs', () => {
    const { onProfileSubTabChange } = renderProfileTab({ profileSubTab: 'cooked' });
    expect(screen.getByTestId('today-plan-title')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('profile-tab-want'));
    expect(onProfileSubTabChange).toHaveBeenCalledWith('want');
    expect(screen.getByTestId('today-plan-title')).toBeInTheDocument();
  });

  it('calls onViewSavedRecipe with source = profile_want under want tab', () => {
    const { onViewSavedRecipe } = renderProfileTab({ profileSubTab: 'want' });
    fireEvent.click(screen.getByTestId('profile-recipe-r1'));
    expect(onViewSavedRecipe).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }), 'profile_want');
  });

  it('calls onViewSavedRecipe with source = profile_cooked under cooked tab', () => {
    const { onViewSavedRecipe } = renderProfileTab({ profileSubTab: 'cooked' });
    fireEvent.click(screen.getByTestId('profile-recipe-r1'));
    expect(onViewSavedRecipe).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }), 'profile_cooked');
  });

  it('renders empty message for want tab when no recipes', () => {
    renderProfileTab({ profileSubTab: 'want', profileRecipes: [] });
    expect(screen.getByText('还没有标记为我想做的菜谱')).toBeInTheDocument();
  });

  it('renders trend and funnel sections', () => {
    renderProfileTab({ profileSubTab: 'cooked' });
    expect(screen.getByText('行为漏斗')).toBeInTheDocument();
    expect(screen.getByText('近 7 天做饭趋势')).toBeInTheDocument();
  });

  it('triggers top action buttons', () => {
    const { onOpenSearchHistory, onOpenStapleIngredientsModal } = renderProfileTab({ profileSubTab: 'cooked' });
    fireEvent.click(screen.getByRole('button', { name: '搜索记录' }));
    fireEvent.click(screen.getByRole('button', { name: '常备食材' }));
    expect(onOpenSearchHistory).toHaveBeenCalledTimes(1);
    expect(onOpenStapleIngredientsModal).toHaveBeenCalled();
  });

  it('triggers plan and list action buttons', () => {
    const { onOpenGenerateTab, onOpenManageRecipes } = renderProfileTab({ profileSubTab: 'cooked' });
    fireEvent.click(screen.getByRole('button', { name: '去找菜谱' }));
    fireEvent.click(screen.getByRole('button', { name: '添加想做' }));
    fireEvent.click(screen.getByRole('button', { name: '管理' }));
    expect(onOpenGenerateTab).toHaveBeenCalled();
    expect(onOpenManageRecipes).toHaveBeenCalledTimes(1);
  });

  it('empty state CTA opens generate tab', () => {
    const { onOpenGenerateTab } = renderProfileTab({ profileSubTab: 'cooked', profileRecipes: [] });
    fireEvent.click(screen.getByRole('button', { name: '去添加第一道想做菜谱' }));
    expect(onOpenGenerateTab).toHaveBeenCalledTimes(1);
  });
});
