import React from 'react';

import AppCard from '@/components/AppCard';
import type { PredefinedRecipe } from '@/types/recipe';

interface CommunityTabProps {
  predefinedRecipes: PredefinedRecipe[];
  onShowPredefinedRecipe: (recipe: PredefinedRecipe) => void;
}

export default function CommunityTab({ predefinedRecipes, onShowPredefinedRecipe }: CommunityTabProps) {
  return (
    <div className="mb-8 max-w-md mx-auto space-y-4">
      <AppCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-dark font-serif">热门分享</h3>
          <span className="text-sm text-gray-500">今日更新</span>
        </div>
        <div className="space-y-3">
          {predefinedRecipes.slice(0, 3).map((item) => (
            <button
              key={item.id}
              onClick={() => onShowPredefinedRecipe(item)}
              className="w-full text-left rounded-2xl border border-gray-200 p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{item.ingredients}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded border border-gray-300">{item.difficulty}</span>
                    <span className="px-2 py-1 text-xs rounded border border-gray-300">{item.cookingTime}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </AppCard>

      <AppCard className="p-4">
        <h3 className="text-lg font-bold text-dark font-serif mb-3">社区功能</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-gray-50 py-4 text-sm text-gray-600">发笔记</div>
          <div className="rounded-xl bg-gray-50 py-4 text-sm text-gray-600">看关注</div>
          <div className="rounded-xl bg-gray-50 py-4 text-sm text-gray-600">排行榜</div>
        </div>
        <p className="text-xs text-gray-400 mt-4">更多社区能力正在完善中</p>
      </AppCard>
    </div>
  );
}
