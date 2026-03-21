import React from 'react';

import AppCard from '@/components/AppCard';
import type { PredefinedRecipe } from '@/types/recipe';

interface GenerateTabProps {
  mainIngredient: string;
  onMainIngredientChange: (value: string) => void;
  isVoiceMode: boolean;
  showWaveAnimation: boolean;
  isLoading: boolean;
  loadingText: string;
  isAnimationClicked: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  voiceButtonRef: React.RefObject<HTMLButtonElement>;
  onVoiceButtonClick: () => void;
  onVoiceStart: (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void;
  onVoiceMouseMove: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onVoiceEnd: (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void;
  onVoiceLeave: () => void;
  onGenerateRecipe: () => void;
  todayRecommendation: PredefinedRecipe;
  onChangeTodayRecommendation: () => void;
  onShowPredefinedRecipe: (recipe: PredefinedRecipe) => void;
  selectedCategory: string;
  onCategoryClick: (category: string) => void;
  filteredRecipes: PredefinedRecipe[];
  onToggleAnimation: () => void;
}

export default function GenerateTab({
  mainIngredient,
  onMainIngredientChange,
  isVoiceMode,
  showWaveAnimation,
  isLoading,
  loadingText,
  isAnimationClicked,
  inputRef,
  voiceButtonRef,
  onVoiceButtonClick,
  onVoiceStart,
  onVoiceMouseMove,
  onVoiceEnd,
  onVoiceLeave,
  onGenerateRecipe,
  todayRecommendation,
  onChangeTodayRecommendation,
  onShowPredefinedRecipe,
  selectedCategory,
  onCategoryClick,
  filteredRecipes,
  onToggleAnimation,
}: GenerateTabProps) {
  return (
    <div className="mb-8 max-w-md mx-auto space-y-4">
      <AppCard className="p-4">
        <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-gray-200">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={mainIngredient}
              onChange={(e) => onMainIngredientChange(e.target.value)}
              placeholder={isVoiceMode ? '按住说话' : '输入主食材，例如：西红柿'}
              className="w-full py-4 px-5 pr-12 bg-white focus:outline-none"
            />
            {showWaveAnimation && (
              <div className="wave-animation absolute right-10 top-1/2 transform -translate-y-1/2 flex items-center justify-center gap-1">
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
              </div>
            )}
            <button
              ref={voiceButtonRef}
              onClick={onVoiceButtonClick}
              onMouseDown={onVoiceStart}
              onMouseMove={onVoiceMouseMove}
              onMouseUp={onVoiceEnd}
              onMouseLeave={onVoiceLeave}
              onTouchStart={onVoiceStart}
              onTouchEnd={onVoiceEnd}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full ${isVoiceMode ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'} transition-all duration-300`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
          <button
            onClick={onGenerateRecipe}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-4 bg-dark text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} whitespace-nowrap font-medium transition-all duration-300 hover:opacity-90`}
          >
            {isLoading ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              '搜索'
            )}
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 mt-4">
            <div className="cooking-animation cursor-pointer" onClick={onToggleAnimation}>
              <div className={`pan ${isAnimationClicked ? 'scale-125' : ''}`}>
                <div className={`pan-handle ${isAnimationClicked ? 'scale-110 rotate-12' : ''}`}></div>
                <div className={`food ${isAnimationClicked ? 'scale-120 rotate-180' : ''}`}></div>
                <div className={`steam ${isAnimationClicked ? 'opacity-100 scale-125' : ''}`}>
                  <div className="steam-line"></div>
                  <div className="steam-line"></div>
                  <div className="steam-line"></div>
                  <div className="steam-line"></div>
                  <div className="steam-line"></div>
                  <div className="steam-line"></div>
                  <div className="steam-line"></div>
                </div>
              </div>
            </div>
            <p className="text-sm font-medium">{loadingText}</p>
          </div>
        )}
      </AppCard>

      <AppCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-dark font-serif">今日推荐</h3>
          <button className="text-sm text-primary hover:underline" onClick={onChangeTodayRecommendation}>
            查看更多
          </button>
        </div>
        <button className="w-full rounded-2xl border border-gray-200 p-3 bg-white text-left" onClick={() => onShowPredefinedRecipe(todayRecommendation)}>
          <div className="flex flex-col md:flex-row gap-4">
            <img src={todayRecommendation.image} alt={todayRecommendation.name} className="w-full md:w-1/3 h-40 object-cover rounded-xl border border-gray-200" />
            <div className="flex-1">
              <h4 className="font-serif font-bold text-lg mb-2">{todayRecommendation.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{todayRecommendation.name}是一道美味的中式菜肴，营养丰富，制作简单，是家庭餐桌上的常见选择。</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-primary text-white text-xs rounded">热门</span>
                <span className="px-2 py-1 border border-gray-300 text-xs rounded">{todayRecommendation.difficulty}</span>
                <span className="px-2 py-1 border border-gray-300 text-xs rounded">{todayRecommendation.cookingTime}</span>
              </div>
            </div>
          </div>
        </button>
      </AppCard>

      <AppCard className="p-4">
        <h3 className="text-xl font-bold text-dark mb-4 font-serif">每日精选食材</h3>
        <div className="mb-6 flex flex-wrap gap-3">
          {[
            ['all', '全部'],
            ['popular', '热门菜谱'],
            ['quick', '快手菜'],
            ['home', '家常菜'],
            ['vegetarian', '素食'],
            ['meat', '肉类'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => onCategoryClick(key)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${selectedCategory === key ? 'bg-primary text-white border-primary' : 'border border-gray-300 text-gray-600 hover:bg-primary hover:text-white hover:border-primary'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredRecipes.map((item) => (
            <button
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-left transition-all duration-300 hover:shadow-sm"
              style={{ height: '300px' }}
              onClick={() => onShowPredefinedRecipe(item)}
            >
              <img src={item.image} alt={item.name} className="w-full h-48 object-cover border-b border-gray-200" />
              <div className="p-4 flex flex-col justify-between h-[calc(100%-120px)]">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary text-white text-xs rounded">{item.difficulty}</span>
                    <span className="px-2 py-1 border border-gray-300 text-xs rounded">{item.cookingTime}</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg mb-2">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{item.ingredients}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < 4 ? 'text-primary' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                  </div>
                  <span className="text-xs text-gray-500">查看详情</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </AppCard>
    </div>
  );
}
