'use client';

import React, { useState } from 'react';

interface Recipe {
  name: string;
  difficulty: string;
  time: string;
  steps: string[];
  tips: string[];
}

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loadingText, setLoadingText] = useState('生成中...');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredRecipes, setFilteredRecipes] = useState(predefinedRecipes);
  
  // 加载文案数组
  const loadingTexts = [
    '厨师正在切菜...',
    '正在构思火候...',
    '正在挑选香料...',
    '正在调配酱汁...',
    '正在准备锅具...',
    '正在计算食材用量...',
    '正在考虑营养搭配...',
    '正在创意摆盘...'
  ];
  
  // 加载定时器
  let loadingTimer = null;

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.onstart = () => {
        setIsListening(true);
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIngredients(transcript);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } else {
      alert('您的浏览器不支持语音识别功能');
    }
  };

  const generateRecipe = async () => {
    if (!ingredients.trim()) {
      alert('请输入食材');
      return;
    }

    setIsLoading(true);
    setRecipe(null);
    
    // 开始随机滚动加载文案
    let currentTextIndex = 0;
    setLoadingText(loadingTexts[0]);
    loadingTimer = setInterval(() => {
      currentTextIndex = (currentTextIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentTextIndex]);
    }, 1500);

    try {
      const controller = new AbortController();
      const signal = controller.signal;
      
      // 为返回按钮添加取消功能
      const backButton = document.getElementById('backButton');
      if (backButton) {
        backButton.onclick = () => {
          controller.abort();
          clearInterval(loadingTimer);
          setIsLoading(false);
          setRecipe(null);
        };
      }
      
      const response = await fetch('http://localhost:3001/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: ingredients
        }),
        signal: signal
      });

      const data = await response.json();

      // 检查是否有错误
      if (data.error) {
        alert(data.error);
        return;
      }

      // 解析AI返回的菜谱
      const recipeData = data.choices[0].message.content;
      let parsedRecipe;

      try {
        parsedRecipe = JSON.parse(recipeData);
      } catch (parseError) {
        console.error('解析菜谱失败:', parseError);
        alert('生成菜谱失败，请稍后重试');
        return;
      }

      // 检查解析后的菜谱是否有错误
      if (parsedRecipe.error) {
        alert(parsedRecipe.error);
        return;
      }

      setRecipe({
        name: parsedRecipe.name,
        difficulty: parsedRecipe.difficulty,
        time: parsedRecipe.cookingTime,
        steps: parsedRecipe.steps,
        tips: parsedRecipe.tips || []
      });
    } catch (error) {
      console.error('生成菜谱失败:', error);
      alert('生成菜谱失败，请稍后重试');
    } finally {
      // 清除加载定时器
      clearInterval(loadingTimer);
      setIsLoading(false);
    }
  };

  // 预设菜谱数据
  const predefinedRecipes = [
    {
      id: 1,
      name: "西红柿炒蛋",
      ingredients: "西红柿、鸡蛋",
      difficulty: "简单",
      cookingTime: "15分钟",
      steps: ["准备食材：西红柿切块，鸡蛋打散", "热锅倒油，倒入蛋液炒熟盛出", "锅中留底油，放入西红柿炒软出汁", "加入炒好的鸡蛋，加盐调味", "翻炒均匀即可出锅"],
      tips: ["西红柿选择熟软的更易出汁", "蛋液中加少许盐和料酒更香"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tomato%20and%20egg%20stir%20fry%2C%20Chinese%20food%2C%20minimalist%20style%2C%20retro%20aesthetic&image_size=landscape_4_3"
    },
    {
      id: 2,
      name: "麻婆豆腐",
      ingredients: "豆腐、猪肉末",
      difficulty: "中等",
      cookingTime: "20分钟",
      steps: ["豆腐切块，用盐水焯水备用", "热锅倒油，放入猪肉末炒至变色", "加入豆瓣酱、姜蒜末炒香", "加入适量水，放入豆腐块", "煮3-5分钟，勾芡出锅，撒上葱花"],
      tips: ["豆腐焯水可以去除豆腥味", "勾薄芡让汤汁更浓稠"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mapo%20tofu%2C%20Sichuan%20food%2C%20minimalist%20style%2C%20retro%20aesthetic&image_size=landscape_4_3"
    },
    {
      id: 3,
      name: "宫保鸡丁",
      ingredients: "鸡肉、花生、辣椒",
      difficulty: "中等",
      cookingTime: "25分钟",
      steps: ["鸡肉切丁，用料酒、淀粉腌制", "花生炒熟备用", "热锅倒油，放入鸡丁炒至变色", "加入辣椒、葱姜蒜炒香", "加入调味汁和花生翻炒均匀"],
      tips: ["鸡肉用淀粉腌制更嫩滑", "花生最后加入保持酥脆"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kung%20pao%20chicken%2C%20Chinese%20food%2C%20minimalist%20style%2C%20retro%20aesthetic&image_size=landscape_4_3"
    },
    {
      id: 4,
      name: "糖醋排骨",
      ingredients: "排骨、醋、糖",
      difficulty: "中等",
      cookingTime: "30分钟",
      steps: ["排骨洗净切段，焯水去除血水", "热锅倒油，放入排骨煎至金黄", "加入料酒、生抽、老抽调味", "加入适量水，大火烧开后转小火炖煮", "最后加入糖醋汁收浓即可"],
      tips: ["排骨焯水可以去除杂质", "糖醋比例根据个人口味调整"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sweet%20and%20sour%20ribs%2C%20Chinese%20food%2C%20minimalist%20style%2C%20retro%20aesthetic&image_size=landscape_4_3"
    }
  ];

  // 显示预设菜谱
  const showPredefinedRecipe = (recipeData: any) => {
    setRecipe({
      name: recipeData.name,
      difficulty: recipeData.difficulty,
      time: recipeData.cookingTime,
      steps: recipeData.steps,
      tips: recipeData.tips || []
    });
  };

  // 处理分类点击
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    
    // 过滤菜谱
    if (category === 'all') {
      setFilteredRecipes(predefinedRecipes);
    } else {
      const filtered = predefinedRecipes.filter(recipe => {
        if (category === 'popular') return recipe.id === 1; // 假设西红柿炒蛋是热门
        if (category === 'quick') return recipe.cookingTime.includes('15分钟'); // 快手菜
        if (category === 'home') return recipe.name === '西红柿炒蛋' || recipe.name === '麻婆豆腐'; // 家常菜
        if (category === 'vegetarian') return false; // 没有素食
        if (category === 'meat') return recipe.name === '宫保鸡丁' || recipe.name === '糖醋排骨'; // 肉类
        return true;
      });
      setFilteredRecipes(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8 relative">
      <div className="max-w-3xl mx-auto relative">
        {recipe && (
          <div className="absolute top-0 left-0 z-10">
            <button 
              onClick={() => setRecipe(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-md retro-card transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>返回</span>
            </button>
          </div>
        )}
        
        {/* 标题 */}
        <header className="text-center my-8">
          <h1 className="text-4xl font-bold text-dark font-serif mb-2">智能后厨</h1>
          <p className="text-gray-600">根据食材生成美味菜谱</p>
        </header>

        {/* 食材输入区域（置顶） */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="输入食材，例如：西红柿、鸡蛋"
              className="flex-1 retro-input rounded-md px-4 py-3"
            />
            <button
              onClick={handleVoiceInput}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md retro-button`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {isListening ? '正在聆听...' : '语音输入'}
            </button>
          </div>
          
          {/* 分类标签 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              <span onClick={() => handleCategoryClick('all')} className={`px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors ${selectedCategory === 'all' ? 'bg-primary text-white border-primary' : 'border border-dark'}`}>全部</span>
              <span onClick={() => handleCategoryClick('popular')} className={`px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors ${selectedCategory === 'popular' ? 'bg-primary text-white border-primary' : 'border border-dark'}`}>热门菜谱</span>
              <span onClick={() => handleCategoryClick('quick')} className={`px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors ${selectedCategory === 'quick' ? 'bg-primary text-white border-primary' : 'border border-dark'}`}>快手菜</span>
              <span onClick={() => handleCategoryClick('home')} className={`px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors ${selectedCategory === 'home' ? 'bg-primary text-white border-primary' : 'border border-dark'}`}>家常菜</span>
              <span onClick={() => handleCategoryClick('vegetarian')} className={`px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors ${selectedCategory === 'vegetarian' ? 'bg-primary text-white border-primary' : 'border border-dark'}`}>素食</span>
              <span onClick={() => handleCategoryClick('meat')} className={`px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors ${selectedCategory === 'meat' ? 'bg-primary text-white border-primary' : 'border border-dark'}`}>肉类</span>
            </div>
          </div>
          
          <button
            onClick={generateRecipe}
            disabled={isLoading}
            className="w-full retro-button py-3 rounded-md font-medium transition-all duration-300"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="cooking-animation">
                  <div className="pan">
                    <div className="pan-handle"></div>
                    <div className="food"></div>
                    <div className="steam">
                      <div className="steam-line"></div>
                      <div className="steam-line"></div>
                      <div className="steam-line"></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium">{loadingText}</p>
              </div>
            ) : (
              '生成菜谱'
            )}
          </button>
        </div>
        
        {/* 今日推荐 */}
        {!recipe && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-dark font-serif">今日推荐</h3>
              <span className="text-sm text-primary cursor-pointer hover:underline" onClick={() => alert('查看更多推荐菜谱')}>查看更多</span>
            </div>
            <div className="retro-card rounded-lg p-4 mb-4 cursor-pointer" onClick={() => {
              const braisedPorkRecipe = {
                id: 5,
                name: "红烧肉",
                ingredients: "五花肉、生姜、大蒜、料酒、生抽、老抽、冰糖",
                difficulty: "中等",
                cookingTime: "45分钟",
                steps: ["五花肉洗净切块，焯水去除血水", "热锅倒油，放入冰糖炒至融化呈焦糖色", "放入五花肉翻炒均匀，使其上色", "加入生姜、大蒜、料酒、生抽、老抽调味", "加入适量水，大火烧开后转小火炖煮30分钟", "最后大火收汁即可出锅"],
                tips: ["选择肥瘦相间的五花肉口感更佳", "炖煮时间要足够，这样肉质才会软烂", "收汁时要不停翻动，避免糊锅"],
                image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20cuisine%20special%20dish%2C%20minimalist%20style%2C%20retro%20aesthetic&image_size=landscape_4_3"
              };
              showPredefinedRecipe(braisedPorkRecipe);
            }}>
              <div className="flex flex-col md:flex-row gap-4">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20cuisine%20special%20dish%2C%20minimalist%20style%2C%20retro%20aesthetic&image_size=landscape_4_3" alt="今日推荐" className="w-full md:w-1/3 h-40 object-cover rounded-md border border-dark" />
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-lg mb-2">红烧肉</h4>
                  <p className="text-sm text-gray-600 mb-3">红烧肉是一道经典的中式菜肴，肥而不腻，入口即化，是很多人喜爱的家常菜。</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-primary text-white text-xs rounded">热门</span>
                    <span className="px-2 py-1 border border-dark text-xs rounded">中等难度</span>
                    <span className="px-2 py-1 border border-dark text-xs rounded">45分钟</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {recipe && (
          <div className="retro-card rounded-lg p-6 mb-8 transition-all duration-500">
            <h2 className="text-2xl font-bold text-primary mb-4 font-serif">{recipe.name}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-dark rounded-md p-3">
                <p className="text-sm text-gray-600">难度等级</p>
                <p className="font-medium">{recipe.difficulty}</p>
              </div>
              <div className="border border-dark rounded-md p-3">
                <p className="text-sm text-gray-600">烹饪耗时</p>
                <p className="font-medium">{recipe.time}</p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 font-serif">详细步骤</h3>
              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="step-card p-4 rounded-md">
                    <div className="flex items-start gap-3">
                      <div className="step-number rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {recipe.tips.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 font-serif">小贴士</h3>
                <ul className="list-disc list-inside space-y-2">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="text-gray-700">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 每日精选食材推荐区（置底） */}
        {!recipe && (
          <div className="mt-auto mb-8">
            <h3 className="text-xl font-bold text-dark mb-4 font-serif">每日精选食材</h3>
            <div className="grid grid-cols-2 gap-4">
              {filteredRecipes.map((recipe, index) => {
                // 固定卡片高度，确保一致性
                const cardHeight = 300;
                return (
                  <div 
                    key={recipe.id} 
                    className="retro-card rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
                    style={{ height: `${cardHeight}px` }}
                    onClick={() => showPredefinedRecipe(recipe)}
                  >
                    <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover border-b border-dark" />
                    <div className="p-4 flex flex-col justify-between h-[calc(100%-120px)]">
                      <div>
                        <div className="flex gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary text-white text-xs rounded">{recipe.difficulty}</span>
                          <span className="px-2 py-1 border border-dark text-xs rounded">{recipe.cookingTime}</span>
                        </div>
                        <h4 className="font-serif font-bold text-lg mb-2">{recipe.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{recipe.ingredients}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {Array(5).fill(0).map((_, i) => (
                            <i key={i} className={`fa fa-star ${i < 4 ? 'text-primary' : 'text-gray-300'}`}></i>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">查看详情</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <footer className="mt-auto py-6 text-center text-gray-500 text-sm">
          <p>2026 @CHi2MyLF</p>
        </footer>
      </div>
    </div>
  );
}
