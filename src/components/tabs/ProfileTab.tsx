import React from 'react';

import AppCard from '@/components/AppCard';
import type { Recipe } from '@/types/recipe';

interface ProfileTabProps {
  profileSubTab: 'cooked' | 'want';
  onProfileSubTabChange: (tab: 'cooked' | 'want') => void;
  profileRecipes: Recipe[];
  onViewSavedRecipe: (recipe: Recipe) => void;
  onOpenSearchHistory: () => void;
  onOpenStapleIngredientsModal: () => void;
}

export default function ProfileTab({
  profileSubTab,
  onProfileSubTabChange,
  profileRecipes,
  onViewSavedRecipe,
  onOpenSearchHistory,
  onOpenStapleIngredientsModal,
}: ProfileTabProps) {
  const cookedCount = profileRecipes.filter((item) => item.isCooked).length;
  const wantCount = profileRecipes.filter((item) => item.isWantToCook).length;
  const isEmpty = profileRecipes.length === 0;

  return (
    <div className="mb-8 max-w-md mx-auto">
      <AppCard>
        <div className="px-4 pt-4 pb-3">
          <div className="rounded-2xl border border-gray-200 bg-[#f6f8fb] p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#d9e2d3] text-dark flex items-center justify-center font-bold text-lg">厨</div>
              <div>
                <p className="text-base font-semibold text-dark">今天也要吃好一点</p>
                <p className="text-xs text-gray-500 mt-1">已做 {cookedCount} 道 | 想做 {wantCount} 道</p>
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

        {isEmpty && (
          <div className="px-4 pb-3 space-y-3">
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-sm font-semibold text-dark mb-2">今日做饭计划</p>
              <p className="text-xs text-gray-500 mb-3">先挑 1 道想做的菜，今天完成它。</p>
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg bg-dark text-white text-sm py-2">去找菜谱</button>
                <button className="flex-1 rounded-lg border border-gray-300 text-sm py-2">管理食材</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-gray-200 bg-[#f6f8fb] p-3">
                <p className="text-xs text-gray-500">本周目标</p>
                <p className="text-lg font-semibold text-dark mt-1">3 / 7 天</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-[#f6f8fb] p-3">
                <p className="text-xs text-gray-500">连续打卡</p>
                <p className="text-lg font-semibold text-dark mt-1">2 天</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 px-4 pt-4">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => onProfileSubTabChange('cooked')}
              className={`pb-3 text-2xl font-bold border-b-4 transition-colors ${profileSubTab === 'cooked' ? 'border-dark text-dark' : 'border-transparent text-gray-300'}`}
            >
              我做过的
            </button>
            <button
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
            <div className="text-sm text-gray-500">添加想做 | 管理</div>
          </div>

          {isEmpty ? (
            <div className="pb-4">
              <div className="rounded-xl py-10 text-center text-gray-400 bg-gray-50">
                {profileSubTab === 'cooked' ? '还没有标记为我做过的菜谱' : '还没有标记为我想做的菜谱'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 pb-4">
              {profileRecipes.map((item, index) => (
                <button key={item.id} onClick={() => onViewSavedRecipe(item)} className="text-left">
                  <div className={`h-32 rounded-xl border border-gray-200 ${index % 3 === 0 ? 'bg-[#f2ddd3]' : index % 3 === 1 ? 'bg-[#d9e2d3]' : 'bg-[#d4dceb]'}`} />
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
