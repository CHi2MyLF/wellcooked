import React from 'react';

import AppCard from '@/components/AppCard';
import type { Recipe } from '@/types/recipe';

interface ProfileTabProps {
  profileSubTab: 'cooked' | 'want';
  onProfileSubTabChange: (tab: 'cooked' | 'want') => void;
  profileRecipes: Recipe[];
  totalCookedCount: number;
  totalWantCount: number;
  cookableWantCount: number;
  topMissingItems: Array<{ recipeId: string; recipeName: string; missingCount: number }>;
  isRecipesHydrated: boolean;
  weeklyCookedDays: number;
  weeklyGoal: number;
  consecutiveCookDays: number;
  recentCookTrend: Array<{ label: string; count: number }>;
  profileFunnelStats: {
    profileEntryCount: number;
    wantTabClickCount: number;
    wantRecipeOpenCount: number;
    cookedMarkCount: number;
    updatedAt: string;
  };
  onViewSavedRecipe: (recipe: Recipe, source?: 'profile_want' | 'profile_cooked' | 'saved' | 'search') => void;
  onOpenSearchHistory: () => void;
  onOpenStapleIngredientsModal: () => void;
  onOpenGenerateTab: () => void;
  onOpenManageRecipes: () => void;
}

export default function ProfileTab({
  profileSubTab,
  onProfileSubTabChange,
  profileRecipes,
  totalCookedCount,
  totalWantCount,
  cookableWantCount,
  topMissingItems,
  isRecipesHydrated,
  weeklyCookedDays,
  weeklyGoal,
  consecutiveCookDays,
  recentCookTrend,
  profileFunnelStats,
  onViewSavedRecipe,
  onOpenSearchHistory,
  onOpenStapleIngredientsModal,
  onOpenGenerateTab,
  onOpenManageRecipes,
}: ProfileTabProps) {
  const isEmpty = profileRecipes.length === 0;
  const toRateText = (value: number, base: number) => (base > 0 ? `${Math.round((value / base) * 100)}%` : '--');
  const maxTrendCount = Math.max(1, ...recentCookTrend.map((item) => item.count));

  return (
    <div className="mb-8 max-w-md mx-auto">
      <AppCard>
        <div className="px-4 pt-4 pb-3">
          <div className="rounded-2xl border border-gray-200 bg-[#f6f8fb] p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#d9e2d3] text-dark flex items-center justify-center font-bold text-lg">厨</div>
              <div>
                <p className="text-base font-semibold text-dark">今天也要吃好一点</p>
                <p className="text-xs text-gray-500 mt-1">已做 {totalCookedCount} 道 | 想做 {totalWantCount} 道</p>
              </div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-white transition-colors">编辑资料</button>
          </div>
        </div>

        <div className="px-4 pt-5 pb-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center text-center text-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 11V8a2 2 0 114 0v3M11 11V7a2 2 0 114 0v4M15 11V9a2 2 0 114 0v6.5a3.5 3.5 0 01-3.5 3.5h-6A4.5 4.5 0 015 14.5V11a2 2 0 114 0z" />
              </svg>
              <span className="text-sm font-semibold">钱包/卡券</span>
              <span className="text-xs text-gray-400 mt-1">¥0.00</span>
            </div>
            <div className="flex flex-col items-center text-center text-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3h10a1 1 0 011 1v16l-3-1.5L12 20l-3-1.5L6 20V4a1 1 0 011-1z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 8h6M9 12h6" />
              </svg>
              <span className="text-sm font-semibold">买菜记录</span>
              <span className="text-[10px] bg-[#d66b4a] text-white rounded-full px-2 mt-1">NEW</span>
            </div>
            <button onClick={onOpenSearchHistory} className="flex flex-col items-center text-center text-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                <circle cx="12" cy="12" r="2.5" strokeWidth="1.8" />
              </svg>
              <span className="text-sm font-semibold">搜索记录</span>
            </button>
            <button onClick={onOpenStapleIngredientsModal} className="flex flex-col items-center text-center text-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 5c-7 0-12 5-12 12 7 0 12-5 12-12z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 16c3-3 6-5 10-7" />
              </svg>
              <span className="text-sm font-semibold">常备食材</span>
            </button>
          </div>
        </div>

        <div className="px-4 pb-3 space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p data-testid="today-plan-title" className="text-sm font-semibold text-dark mb-2">今日做饭计划</p>
            <p className="text-xs text-gray-500 mb-3">先挑 1 道想做的菜，今天完成它。</p>
            {totalWantCount > 0 ? (
              <div className="mb-3 rounded-lg bg-[#f6f8fb] px-2.5 py-2">
                <p className="text-xs text-gray-600">可直接做 {cookableWantCount} / {totalWantCount} 道</p>
                {topMissingItems.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    优先补料：{topMissingItems.map((item) => `${item.recipeName}(缺${item.missingCount})`).join('、')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-3">添加想做菜谱后，会自动提示可做菜和缺料清单。</p>
            )}
            <div className="flex gap-2">
              <button onClick={onOpenGenerateTab} className="flex-1 rounded-lg bg-dark text-white text-sm py-2">去找菜谱</button>
              <button onClick={onOpenStapleIngredientsModal} className="flex-1 rounded-lg border border-gray-300 text-sm py-2">管理食材</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-gray-200 bg-[#f6f8fb] p-3">
              <p className="text-xs text-gray-500">本周目标</p>
              <p className="text-lg font-semibold text-dark mt-1">{weeklyCookedDays} / {weeklyGoal} 天</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-[#f6f8fb] p-3">
              <p className="text-xs text-gray-500">连续打卡</p>
              <p className="text-lg font-semibold text-dark mt-1">{consecutiveCookDays} 天</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-sm font-semibold text-dark">行为漏斗</p>
            <p className="text-xs text-gray-500 mt-1">个人页 -&gt; 我想做的 -&gt; 打开菜谱 -&gt; 标记做过</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[#f6f8fb] px-2 py-2 text-gray-600">个人页 {profileFunnelStats.profileEntryCount}</div>
              <div className="rounded-lg bg-[#f6f8fb] px-2 py-2 text-gray-600">我想做的 {profileFunnelStats.wantTabClickCount}</div>
              <div className="rounded-lg bg-[#f6f8fb] px-2 py-2 text-gray-600">打开菜谱 {profileFunnelStats.wantRecipeOpenCount}</div>
              <div className="rounded-lg bg-[#f6f8fb] px-2 py-2 text-gray-600">标记做过 {profileFunnelStats.cookedMarkCount}</div>
            </div>
            <div className="mt-2 text-xs text-gray-500 leading-5">
              <p>我想做点击率：{toRateText(profileFunnelStats.wantTabClickCount, profileFunnelStats.profileEntryCount)}</p>
              <p>菜谱打开率：{toRateText(profileFunnelStats.wantRecipeOpenCount, profileFunnelStats.wantTabClickCount)}</p>
              <p>做过转化率：{toRateText(profileFunnelStats.cookedMarkCount, profileFunnelStats.wantRecipeOpenCount)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-sm font-semibold text-dark">近 7 天做饭趋势</p>
            <div className="mt-3 grid grid-cols-7 gap-1.5 items-end h-24">
              {recentCookTrend.map((item) => (
                <div key={item.label} className="flex flex-col items-center justify-end gap-1">
                  <div className="text-[10px] text-gray-500 leading-none">{item.count}</div>
                  <div
                    className="w-full rounded-t bg-[#d9e2d3]"
                    style={{ height: `${Math.max(10, (item.count / maxTrendCount) * 56)}px` }}
                  />
                  <div className="text-[10px] text-gray-500 leading-none">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 pt-4">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              data-testid="profile-tab-cooked"
              onClick={() => onProfileSubTabChange('cooked')}
              className={`pb-3 text-2xl font-bold border-b-4 transition-colors ${profileSubTab === 'cooked' ? 'border-dark text-dark' : 'border-transparent text-gray-300'}`}
            >
              我做过的
            </button>
            <button
              data-testid="profile-tab-want"
              onClick={() => onProfileSubTabChange('want')}
              className={`pb-3 text-2xl font-bold border-b-4 transition-colors ${profileSubTab === 'want' ? 'border-dark text-dark' : 'border-transparent text-gray-300'}`}
            >
              我想做的
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <p className="text-[28px] font-bold text-dark leading-none">
              {profileRecipes.length}
              <span className="text-sm text-gray-600 ml-1">道菜</span>
            </p>
            <div className="flex items-center gap-3 text-sm">
              <button onClick={onOpenGenerateTab} className="text-gray-600 hover:text-dark transition-colors">添加想做</button>
              <button onClick={onOpenManageRecipes} className="text-gray-600 hover:text-dark transition-colors">管理</button>
            </div>
          </div>

          {!isRecipesHydrated ? (
            <div className="grid grid-cols-3 gap-3 pb-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-32 rounded-xl border border-gray-200 bg-gray-100" />
                  <div className="h-4 bg-gray-100 rounded mt-2" />
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="pb-4">
              <div className="rounded-xl py-10 text-center text-gray-400 bg-gray-50">
                {profileSubTab === 'cooked' ? '还没有标记为我做过的菜谱' : '还没有标记为我想做的菜谱'}
              </div>
              <button
                onClick={onOpenGenerateTab}
                className="w-full mt-3 rounded-xl bg-dark text-white py-2.5 text-sm hover:opacity-90 transition-opacity"
              >
                去添加第一道想做菜谱
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 pb-4">
              {profileRecipes.map((item, index) => (
                <button
                  key={item.id}
                  data-testid={`profile-recipe-${item.id}`}
                  onClick={() => onViewSavedRecipe(item, profileSubTab === 'want' ? 'profile_want' : 'profile_cooked')}
                  className="text-left"
                >
                  <div className={`relative h-32 rounded-xl border border-gray-200 overflow-hidden ${index % 3 === 0 ? 'bg-[#f2ddd3]' : index % 3 === 1 ? 'bg-[#d9e2d3]' : 'bg-[#d4dceb]'}`}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <p className="text-base text-dark mt-2 truncate">{item.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </AppCard>
    </div>
  );
}
