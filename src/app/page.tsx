'use client';

import React, { useState, useEffect, useRef } from 'react';
import CommunityTab from '@/components/tabs/CommunityTab';
import GenerateTab from '@/components/tabs/GenerateTab';
import ProfileTab from '@/components/tabs/ProfileTab';
import type { PredefinedRecipe, Recipe } from '@/types/recipe';

const MAX_SAVED_RECIPES = 10;
const PROFILE_FUNNEL_STORAGE_KEY = 'profileFunnelStats';

interface ProfileFunnelStats {
  profileEntryCount: number;
  wantTabClickCount: number;
  wantRecipeOpenCount: number;
  cookedMarkCount: number;
  updatedAt: string;
}

const defaultProfileFunnelStats: ProfileFunnelStats = {
  profileEntryCount: 0,
  wantTabClickCount: 0,
  wantRecipeOpenCount: 0,
  cookedMarkCount: 0,
  updatedAt: '',
};

const normalizeSavedRecipes = (recipes: Recipe[]) => {
  const parseCreatedAt = (value?: string) => {
    if (!value) return 0;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return [...recipes]
    .sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt))
    .slice(0, MAX_SAVED_RECIPES);
};

const INVALID_INGREDIENT_TOKENS = new Set(['null', 'undefined', 'none', 'nil', 'nan', '0']);
const LOCATION_LIKE_INPUTS = new Set([
  '中国', '美国', '英国', '法国', '德国', '意大利', '西班牙', '日本', '韩国',
  '俄罗斯', '印度', '泰国', '越南', '新加坡', '澳大利亚', '加拿大', '巴西', '墨西哥'
]);

const getIngredientValidationError = (value: string) => {
  const input = value.trim();
  if (!input) return '请输入主食材';

  const lowered = input.toLowerCase();
  if (INVALID_INGREDIENT_TOKENS.has(lowered) || /^\d+$/.test(input)) {
    return '请输入具体食材，不能只填 0、null 或纯数字';
  }

  if (LOCATION_LIKE_INPUTS.has(input)) {
    return '请输入食材名称（如：鸡蛋、西红柿）';
  }

  return '';
};

const getLocalDayKey = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getWeeklyCookedDays = (recipes: Recipe[], weekGoal: number) => {
  const now = new Date();
  const weekStart = getStartOfWeek(now).getTime();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const todayEndTime = todayEnd.getTime();
  const dayKeys = new Set<string>();

  recipes.forEach((item) => {
    const source = item.cookedAt || (item.isCooked ? item.createdAt : '');
    if (!source) return;
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return;
    const time = date.getTime();
    if (time < weekStart || time > todayEndTime) return;
    const dayKey = getLocalDayKey(source);
    if (dayKey) dayKeys.add(dayKey);
  });

  return {
    cookedDays: dayKeys.size,
    weekGoal,
  };
};

const getConsecutiveCookedDays = (recipes: Recipe[]) => {
  const dayKeys = new Set<string>();
  recipes.forEach((item) => {
    const source = item.cookedAt || (item.isCooked ? item.createdAt : '');
    if (!source) return;
    const dayKey = getLocalDayKey(source);
    if (dayKey) dayKeys.add(dayKey);
  });

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (!dayKeys.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const getRecentCookTrend = (recipes: Recipe[]) => {
  const dayCounts = new Map<string, number>();
  recipes.forEach((item) => {
    const source = item.cookedAt || (item.isCooked ? item.createdAt : '');
    if (!source) return;
    const dayKey = getLocalDayKey(source);
    if (!dayKey) return;
    dayCounts.set(dayKey, (dayCounts.get(dayKey) || 0) + 1);
  });

  const days: Array<{ label: string; count: number }> = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() - i);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const weekLabel = '日一二三四五六'[date.getDay()];
    days.push({
      label: `周${weekLabel}`,
      count: dayCounts.get(key) || 0,
    });
  }
  return days;
};

const splitIngredientText = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value !== 'string') return [];
  return value
    .split(/[，,、;；/\s|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeIngredientToken = (value: string) => value.trim().toLowerCase();

const getRecipeMissingIngredients = (recipe: Recipe, stapleSet: Set<string>) => {
  const rawIngredients = recipe.ingredients?.length ? recipe.ingredients : [recipe.mainIngredient];
  const normalized = Array.from(new Set(rawIngredients.map(normalizeIngredientToken).filter(Boolean)));
  return normalized.filter((item) => !stapleSet.has(item));
};

export default function Home() {
  // 预设菜谱数据
  const predefinedRecipes: PredefinedRecipe[] = [
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
    },
    {
      id: 5,
      name: "红烧肉",
      ingredients: "五花肉、生姜、大蒜、料酒、生抽、老抽、冰糖",
      difficulty: "中等",
      cookingTime: "45分钟",
      steps: ["五花肉洗净切块，焯水去除血水", "热锅倒油，放入冰糖炒至融化呈焦糖色", "放入五花肉翻炒均匀，使其上色", "加入生姜、大蒜、料酒、生抽、老抽调味", "加入适量水，大火烧开后转小火炖煮30分钟", "最后大火收汁即可出锅"],
      tips: ["选择肥瘦相间的五花肉口感更佳", "炖煮时间要足够，这样肉质才会软烂"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=braised%20pork%20belly%2C%20Chinese%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    },
    {
      id: 6,
      name: "酸辣土豆丝",
      ingredients: "土豆、辣椒、醋",
      difficulty: "简单",
      cookingTime: "15分钟",
      steps: ["土豆切丝，泡水去除淀粉", "热锅倒油，放入辣椒爆香", "放入土豆丝翻炒", "加入醋、盐调味", "翻炒均匀即可出锅"],
      tips: ["土豆丝泡水可以防止氧化变色", "大火快炒口感更脆"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sour%20and%20spicy%20potato%20shreds%2C%20Chinese%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    },
    {
      id: 7,
      name: "鱼香肉丝",
      ingredients: "猪肉、木耳、胡萝卜、青椒",
      difficulty: "中等",
      cookingTime: "20分钟",
      steps: ["猪肉切丝，用料酒、淀粉腌制", "木耳、胡萝卜、青椒切丝", "热锅倒油，放入肉丝炒至变色", "加入配菜翻炒", "加入鱼香调料调味", "翻炒均匀即可出锅"],
      tips: ["肉丝腌制时加入少许小苏打更嫩滑", "鱼香调料可以用酱油、醋、糖调制"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fish%20fragrant%20shredded%20pork%2C%20Chinese%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    },
    {
      id: 8,
      name: "蒜蓉西兰花",
      ingredients: "西兰花、大蒜",
      difficulty: "简单",
      cookingTime: "12分钟",
      steps: ["西兰花洗净切小朵", "沸水焯水1-2分钟捞出", "热锅倒油，放入蒜末爆香", "放入西兰花翻炒", "加入盐、鸡精调味", "翻炒均匀即可出锅"],
      tips: ["焯水时间不宜过长，保持翠绿", "蒜末爆香时小火防止糊锅"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=garlic%20broccoli%2C%20Chinese%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    },
    {
      id: 9,
      name: "可乐鸡翅",
      ingredients: "鸡翅、可乐、姜、蒜",
      difficulty: "中等",
      cookingTime: "30分钟",
      steps: ["鸡翅洗净划刀", "沸水焯水去除血水", "热锅倒油，放入鸡翅煎至金黄", "加入姜蒜爆香", "加入可乐、生抽、老抽调味", "大火烧开后转小火炖煮20分钟", "最后大火收汁即可"],
      tips: ["鸡翅划刀更容易入味", "收汁时不停翻动防止糊锅"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cola%20chicken%20wings%2C%20Chinese%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    },
    {
      id: 10,
      name: "清蒸鱼",
      ingredients: "鱼、姜、葱、料酒",
      difficulty: "中等",
      cookingTime: "25分钟",
      steps: ["鱼洗净，在鱼身上划刀", "鱼身上放姜片、葱段", "淋上料酒", "蒸锅水开后放入鱼", "大火蒸10-15分钟", "取出后淋上热油和生抽"],
      tips: ["蒸制时间根据鱼的大小调整", "最后淋热油可以提升香味"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=steamed%20fish%2C%20Chinese%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    },
    {
      id: 11,
      name: "青椒炒肉",
      ingredients: "青椒、猪肉",
      difficulty: "简单",
      cookingTime: "15分钟",
      steps: ["猪肉切片，用料酒、淀粉腌制", "青椒切块", "热锅倒油，放入肉片炒至变色", "加入青椒翻炒", "加入盐、生抽调味", "翻炒均匀即可出锅"],
      tips: ["青椒选择稍辣的品种更香", "肉片要炒至完全变色再放青椒"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20pepper%20stir%20fry%20pork%2C%20Chinese%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    },
    {
      id: 12,
      name: "蛋炒饭",
      ingredients: "米饭、鸡蛋、葱",
      difficulty: "简单",
      cookingTime: "10分钟",
      steps: ["鸡蛋打散炒熟盛出", "热锅倒油，放入米饭翻炒", "加入炒好的鸡蛋", "加入盐、鸡精调味", "撒上葱花翻炒均匀即可"],
      tips: ["使用隔夜饭炒出来更粒粒分明", "大火快炒防止米饭黏锅"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=egg%20fried%20rice%2C%20Chinese%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    },
    {
      id: 13,
      name: "蒜蓉粉丝蒸扇贝",
      ingredients: "扇贝、粉丝、大蒜",
      difficulty: "中等",
      cookingTime: "20分钟",
      steps: ["扇贝洗净，粉丝泡软", "粉丝铺在扇贝上", "蒜末加入盐、生抽、蚝油调制", "将蒜蓉酱铺在粉丝上", "蒸锅水开后蒸8-10分钟", "取出后淋上热油"],
      tips: ["扇贝要选择新鲜的", "蒸制时间不宜过长，否则肉质会老"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=steamed%20scallops%20with%20garlic%20and%20vermicelli%2C%20Chinese%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    },
    {
      id: 14,
      name: "回锅肉",
      ingredients: "五花肉、青椒、蒜苗",
      difficulty: "中等",
      cookingTime: "25分钟",
      steps: ["五花肉煮熟切片", "青椒、蒜苗切段", "热锅倒油，放入肉片炒至出油", "加入豆瓣酱炒香", "加入青椒、蒜苗翻炒", "加入盐、生抽调味", "翻炒均匀即可出锅"],
      tips: ["五花肉要煮至八成熟", "炒肉片时要炒出油脂才香"],
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=twice%20cooked%20pork%2C%20Sichuan%20food%2C%20minimalist%20style&image_size=landscape_4_3"
    }
  ];

  // 状态管理
  const [mainIngredient, setMainIngredient] = useState('');
  const [stapleIngredients, setStapleIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loadingText, setLoadingText] = useState('生成中...');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredRecipes, setFilteredRecipes] = useState(predefinedRecipes);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isSavedRecipesHydrated, setIsSavedRecipesHydrated] = useState(false);
  const [showStapleIngredientsModal, setShowStapleIngredientsModal] = useState(false);
  const [showSearchHistoryModal, setShowSearchHistoryModal] = useState(false);
  const [editingStapleIngredients, setEditingStapleIngredients] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [profileSubTab, setProfileSubTab] = useState<'cooked' | 'want'>('cooked');
  const [todayRecommendation, setTodayRecommendation] = useState<PredefinedRecipe>(
    predefinedRecipes.find(recipe => recipe.id === 5) || predefinedRecipes[0]
  );
  const [isAnimationClicked, setIsAnimationClicked] = useState(false);
  const [ratingModal, setRatingModal] = useState<{ recipeId: string; tempRating: number; tempComment: string } | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [appError, setAppError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [weeklyGoal] = useState(7);
  const [profileFunnelStats, setProfileFunnelStats] = useState<ProfileFunnelStats>(defaultProfileFunnelStats);
  
  // 语音识别相关
  const [isRecording, setIsRecording] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [voiceButtonText, setVoiceButtonText] = useState('按住说话');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showWaveAnimation, setShowWaveAnimation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const recognitionRef = useRef<any>(null);
  const voiceButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  let loadingTimer: NodeJS.Timeout | null = null;

  // 初始化常备食材库
  useEffect(() => {
    const savedStaples = localStorage.getItem('stapleIngredients');
    if (savedStaples) {
      setStapleIngredients(JSON.parse(savedStaples));
    } else {
      // 默认常备食材
      const defaultStaples = ['鸡蛋', '葱', '姜', '蒜', '油', '盐', '酱', '醋'];
      setStapleIngredients(defaultStaples);
      localStorage.setItem('stapleIngredients', JSON.stringify(defaultStaples));
    }
  }, []);

  // 初始化保存的菜谱
  useEffect(() => {
    const saved = localStorage.getItem('savedRecipes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 去重：基于菜谱名称去重
        const uniqueRecipes = parsed.reduce((acc: Recipe[], current: Recipe) => {
          const exists = acc.find(rec => rec.name === current.name);
          if (!exists) {
            acc.push({
              ...current,
              ingredients: current.ingredients?.length ? current.ingredients : [current.mainIngredient].filter(Boolean),
              cookedAt: current.cookedAt || (current.isCooked ? current.createdAt : undefined),
            });
          }
          return acc;
        }, []);
        setSavedRecipes(normalizeSavedRecipes(uniqueRecipes));
      } catch {
        setSavedRecipes([]);
      }
    }
    setIsSavedRecipesHydrated(true);
  }, []);

  // 保存菜谱到本地存储
  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(normalizeSavedRecipes(savedRecipes)));
  }, [savedRecipes]);

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_FUNNEL_STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<ProfileFunnelStats>;
      setProfileFunnelStats({
        profileEntryCount: Number(parsed.profileEntryCount) || 0,
        wantTabClickCount: Number(parsed.wantTabClickCount) || 0,
        wantRecipeOpenCount: Number(parsed.wantRecipeOpenCount) || 0,
        cookedMarkCount: Number(parsed.cookedMarkCount) || 0,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      });
    } catch {
      setProfileFunnelStats(defaultProfileFunnelStats);
    }
  }, []);

  const trackFunnelStep = (
    step: 'profileEntryCount' | 'wantTabClickCount' | 'wantRecipeOpenCount' | 'cookedMarkCount',
  ) => {
    setProfileFunnelStats((prev) => {
      const next = {
        ...prev,
        [step]: prev[step] + 1,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(PROFILE_FUNNEL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // 语音输入功能
  const showAppError = (message: string, retryable = false) => {
    setAppError({ message, retryable });
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceButtonText('松开结束');
        setShowWaveAnimation(true);
        if (voiceButtonRef.current) {
          voiceButtonRef.current.style.backgroundColor = '#1a5c35';
          voiceButtonRef.current.style.color = 'white';
        }
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMainIngredient(transcript);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        setVoiceButtonText('按住说话');
        setIsMouseOver(false);
        setShowWaveAnimation(false);
        setIsVoiceMode(false);
        setIsDragging(false);
        if (voiceButtonRef.current) {
          voiceButtonRef.current.style.backgroundColor = '';
          voiceButtonRef.current.style.color = '';
        }
        if (inputRef.current) {
          inputRef.current.placeholder = '输入主食材，例如：西红柿';
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        showAppError('语音识别失败，请重试');
        setIsRecording(false);
        setVoiceButtonText('按住说话');
        setIsMouseOver(false);
        setShowWaveAnimation(false);
        setIsVoiceMode(false);
        setIsDragging(false);
        if (voiceButtonRef.current) {
          voiceButtonRef.current.style.backgroundColor = '';
          voiceButtonRef.current.style.color = '';
        }
        if (inputRef.current) {
          inputRef.current.placeholder = '输入主食材，例如：西红柿';
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    } else {
      showAppError('您的浏览器不支持语音识别功能');
    }
  };

  // 点击麦克风按钮
  const handleVoiceButtonClick = () => {
    setIsVoiceMode(true);
    if (inputRef.current) {
      inputRef.current.placeholder = '按住说话';
    }
  };

  type VoicePointerEvent = React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>;

  const getPointerClientX = (e: VoicePointerEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0] ?? e.changedTouches[0];
      return touch?.clientX ?? 0;
    }
    return e.clientX;
  };

  // 按住说话开始
  const handleVoiceStart = (e: VoicePointerEvent) => {
    setIsMouseOver(true);
    setIsDragging(true);
    setStartX(getPointerClientX(e));
    handleVoiceInput();
  };

  // 鼠标移动
  const handleVoiceMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isRecording) {
      const currentX = e.clientX;
      const diffX = currentX - startX;
      
      // 向左拖动超过20px，显示取消状态
      if (diffX < -20) {
        setVoiceButtonText('松开取消');
        if (voiceButtonRef.current) {
          voiceButtonRef.current.style.backgroundColor = '#ff4d4f';
          voiceButtonRef.current.style.color = 'white';
        }
      } else {
        setVoiceButtonText('松开结束');
        if (voiceButtonRef.current) {
          voiceButtonRef.current.style.backgroundColor = '#27AE60';
          voiceButtonRef.current.style.color = 'white';
        }
      }
    }
  };

  // 松开结束
  const handleVoiceEnd = (e: VoicePointerEvent) => {
    if (isDragging && isRecording) {
      const currentX = getPointerClientX(e);
      const diffX = currentX - startX;
      
      // 向左拖动超过20px，取消录音
      if (diffX < -20) {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } else {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }
    }
    
    setIsDragging(false);
  };

  // 移出取消
  const handleVoiceLeave = () => {
    if (isRecording && isMouseOver) {
      setVoiceButtonText('松开取消');
      if (voiceButtonRef.current) {
        voiceButtonRef.current.style.backgroundColor = '#ff4d4f';
        voiceButtonRef.current.style.color = 'white';
      }
    }
  };

  // 生成菜谱
  const generateRecipe = async () => {
    const ingredientInput = mainIngredient.trim();
    const validationError = getIngredientValidationError(ingredientInput);
    if (validationError) {
      showAppError(validationError);
      return;
    }

    setAppError(null);
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
      
      const response = await fetch('http://localhost:3101/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: ingredientInput,
          stapleIngredients: stapleIngredients
        }),
        signal: signal
      });

      const data = await response.json();

      // 检查是否有错误
      if (data.error) {
        showAppError(data.error, true);
        return;
      }

      // 解析AI返回的菜谱
      const recipeData = data.choices[0].message.content;
      let parsedRecipe;

      try {
        parsedRecipe = JSON.parse(recipeData);
      } catch (parseError) {
        console.error('解析菜谱失败:', parseError);
        showAppError('生成菜谱失败，请稍后重试', true);
        return;
      }

      // 检查解析后的菜谱是否有错误
      if (parsedRecipe.error) {
        showAppError(parsedRecipe.error, true);
        return;
      }

      // 创建新菜谱对象
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        name: parsedRecipe.name,
        difficulty: parsedRecipe.difficulty,
        time: parsedRecipe.cookingTime,
        steps: parsedRecipe.steps,
        tips: parsedRecipe.tips || [],
        ingredients: splitIngredientText(parsedRecipe.ingredients),
        image: typeof parsedRecipe.image === 'string' ? parsedRecipe.image : undefined,
        mainIngredient: ingredientInput,
        createdAt: new Date().toISOString()
      };

      setRecipe(newRecipe);
      
      // 保存到菜谱记录，避免重复
      setSavedRecipes(prev => {
        // 检查是否已经存在同名菜谱
        const existingRecipe = prev.find(rec => rec.name === newRecipe.name);
        if (existingRecipe) {
          // 如果已存在，不重复保存，但更新当前显示的菜谱为已保存的版本
          setRecipe(existingRecipe);
          return normalizeSavedRecipes(prev);
        }
        // 如果不存在，添加新菜谱
        return normalizeSavedRecipes([newRecipe, ...prev]);
      });
    } catch (error) {
      console.error('生成菜谱失败:', error);
      showAppError('生成菜谱失败，请稍后重试', true);
    } finally {
      // 清除加载定时器
      if (loadingTimer) {
        clearInterval(loadingTimer);
      }
      setIsLoading(false);
    }
  };

  // 显示预设菜谱
  const showPredefinedRecipe = (recipeData: PredefinedRecipe) => {
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: recipeData.name,
      difficulty: recipeData.difficulty,
      time: recipeData.cookingTime,
      steps: recipeData.steps,
      tips: recipeData.tips || [],
      mainIngredient: recipeData.ingredients.split('、')[0],
      createdAt: new Date().toISOString()
    };
    
    // 检查是否已经存在同名菜谱
    setSavedRecipes(prev => {
      const existingRecipe = prev.find(rec => rec.name === newRecipe.name);
      if (existingRecipe) {
        // 如果已存在，直接显示已保存的版本
        setRecipe(existingRecipe);
        return normalizeSavedRecipes(prev);
      }
      // 如果不存在，添加新菜谱并显示
      setRecipe(newRecipe);
      return normalizeSavedRecipes([newRecipe, ...prev]);
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
        if (category === 'popular') return [1, 5, 9].includes(recipe.id);
        if (category === 'quick') return recipe.cookingTime.includes('15分钟') || recipe.cookingTime.includes('12分钟') || recipe.cookingTime.includes('10分钟');
        if (category === 'home') return [1, 2, 6, 11, 12].includes(recipe.id);
        if (category === 'vegetarian') return [6, 8].includes(recipe.id);
        if (category === 'meat') return [3, 4, 5, 7, 9, 10, 11, 13, 14].includes(recipe.id);
        return true;
      });
      setFilteredRecipes(filtered);
    }
  };

  // 打开常备食材编辑模态框
  const openStapleIngredientsModal = () => {
    setEditingStapleIngredients([...stapleIngredients]);
    setShowStapleIngredientsModal(true);
  };

  const openGenerateFromProfile = () => {
    setRecipe(null);
    setActiveTab('generate');
  };

  const openSavedForManage = () => {
    setRecipe(null);
    setActiveTab('saved');
  };

  useEffect(() => {
    if (activeTab === 'profile') {
      setProfileFunnelStats((prev) => {
        const next = {
          ...prev,
          profileEntryCount: prev.profileEntryCount + 1,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(PROFILE_FUNNEL_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [activeTab]);

  const handleProfileSubTabChange = (tab: 'cooked' | 'want') => {
    setProfileSubTab(tab);
    if (tab === 'want') {
      trackFunnelStep('wantTabClickCount');
    }
  };

  // 保存常备食材
  const saveStapleIngredients = () => {
    setStapleIngredients(editingStapleIngredients);
    localStorage.setItem('stapleIngredients', JSON.stringify(editingStapleIngredients));
    setShowStapleIngredientsModal(false);
  };

  // 添加常备食材
  const addStapleIngredient = () => {
    setEditingStapleIngredients([...editingStapleIngredients, '']);
  };

  // 更新常备食材
  const updateStapleIngredient = (index: number, value: string) => {
    const updated = [...editingStapleIngredients];
    updated[index] = value;
    setEditingStapleIngredients(updated);
  };

  // 删除常备食材
  const removeStapleIngredient = (index: number) => {
    const updated = editingStapleIngredients.filter((_, i) => i !== index);
    setEditingStapleIngredients(updated);
  };

  // 标记想做
  const toggleSelectRecipe = (recipeId: string) => {
    setSelectedRecipes(prev => {
      const next = new Set(prev);
      next.has(recipeId) ? next.delete(recipeId) : next.add(recipeId);
      return next;
    });
  };

  const deleteSelected = () => {
    setSavedRecipes(prev => prev.filter(rec => !selectedRecipes.has(rec.id)));
    setSelectedRecipes(new Set());
    setIsSelectMode(false);
  };

  const toggleWantToCook = (recipeId: string) => {
    setSavedRecipes(prev => prev.map(rec => {
      if (rec.id === recipeId) {
        return { ...rec, isWantToCook: !rec.isWantToCook };
      }
      return rec;
    }));
    if (recipe && recipe.id === recipeId) {
      setRecipe({ ...recipe, isWantToCook: !recipe.isWantToCook });
    }
  };

  const addRecipeToWantToCook = (recipeId: string) => {
    setSavedRecipes((prev) =>
      prev.map((rec) => (rec.id === recipeId ? { ...rec, isWantToCook: true } : rec)),
    );
    if (recipe && recipe.id === recipeId) {
      setRecipe({ ...recipe, isWantToCook: true });
    }
  };

  // 标记做过
  const toggleCooked = (recipeId: string) => {
    const rec = savedRecipes.find(r => r.id === recipeId) || (recipe?.id === recipeId ? recipe : undefined);
    if (rec && !rec.isCooked) {
      setRatingModal({ recipeId, tempRating: rec.rating || 0, tempComment: rec.comment || '' });
      return;
    }
    setSavedRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, isCooked: false, cookedAt: undefined } : r));
    if (recipe && recipe.id === recipeId) {
      setRecipe({ ...recipe, isCooked: false, cookedAt: undefined });
    }
  };

  // 查看保存的菜谱详情
  const viewSavedRecipe = (savedRecipe: Recipe, source?: 'profile_want' | 'profile_cooked' | 'saved' | 'search') => {
    if (source === 'profile_want') {
      trackFunnelStep('wantRecipeOpenCount');
    }
    setRecipe(savedRecipe);
  };

  const markRecipeCooked = (recipeId: string, rating?: number, comment?: string) => {
    const cookedAt = new Date().toISOString();
    setSavedRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId
          ? {
              ...r,
              isCooked: true,
              cookedAt,
              ...(rating !== undefined ? { rating } : {}),
              ...(comment !== undefined ? { comment } : {}),
            }
          : r,
      ),
    );
    if (recipe && recipe.id === recipeId) {
      setRecipe({
        ...recipe,
        isCooked: true,
        cookedAt,
        ...(rating !== undefined ? { rating } : {}),
        ...(comment !== undefined ? { comment } : {}),
      });
    }
    trackFunnelStep('cookedMarkCount');
    setRatingModal(null);
  };

  const exportRecipeMissingIngredients = (targetRecipe: Recipe) => {
    const missingIngredients = getRecipeMissingIngredients(targetRecipe, stapleSet);
    if (missingIngredients.length === 0) {
      showAppError('当前菜谱没有缺料，暂不需要导出清单');
      return;
    }
    const lines = [
      `菜谱：${targetRecipe.name}`,
      '缺料清单：',
      ...missingIngredients.map((item, index) => `${index + 1}. ${item}`),
      '',
      `导出时间：${new Date().toLocaleString()}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${targetRecipe.name}-缺料清单.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 更换今日推荐菜谱
  const changeTodayRecommendation = () => {
    // 随机选择一个菜谱，排除当前的
    const availableRecipes = predefinedRecipes.filter(recipe => recipe.id !== todayRecommendation.id);
    if (availableRecipes.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableRecipes.length);
      setTodayRecommendation(availableRecipes[randomIndex]);
    }
  };

  const cookedRecipes = savedRecipes.filter(recipe => recipe.isCooked);
  const wantToCookRecipes = savedRecipes.filter(recipe => recipe.isWantToCook);
  const totalCookedCount = cookedRecipes.length;
  const totalWantCount = wantToCookRecipes.length;
  const stapleSet = new Set(stapleIngredients.map(normalizeIngredientToken).filter(Boolean));
  const currentRecipeMissingIngredients = recipe ? getRecipeMissingIngredients(recipe, stapleSet) : [];
  const wantCookMatchList = wantToCookRecipes.map((item) => {
    const missingIngredients = getRecipeMissingIngredients(item, stapleSet);
    return {
      recipeId: item.id,
      recipeName: item.name,
      missingCount: missingIngredients.length,
    };
  });
  const cookableWantCount = wantCookMatchList.filter((item) => item.missingCount === 0).length;
  const topMissingItems = wantCookMatchList
    .filter((item) => item.missingCount > 0)
    .sort((a, b) => a.missingCount - b.missingCount)
    .slice(0, 2);
  const weeklyCookStats = getWeeklyCookedDays(cookedRecipes, weeklyGoal);
  const consecutiveCookDays = getConsecutiveCookedDays(cookedRecipes);
  const recentCookTrend = getRecentCookTrend(cookedRecipes);
  const profileRecipes = profileSubTab === 'cooked' ? cookedRecipes : wantToCookRecipes;
  const recentRecipes = savedRecipes.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-300 p-4 flex items-center justify-center">
      <div className="w-full max-w-md h-[calc(100vh-2rem)] max-h-[900px] bg-secondary border border-gray-300 rounded-[28px] shadow-xl relative overflow-hidden">
        <div className="h-full overflow-y-auto px-4 pt-4 pb-24">
        {appError && (
          <div className="mb-4 max-w-md mx-auto">
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 flex items-center justify-between gap-3">
              <p className="text-sm text-red-700">{appError.message}</p>
              <div className="flex items-center gap-2 shrink-0">
                {appError.retryable && (
                  <button
                    onClick={() => {
                      setAppError(null);
                      void generateRecipe();
                    }}
                    className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    重试
                  </button>
                )}
                <button
                  onClick={() => setAppError(null)}
                  className="text-xs px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 菜谱详情页面 - 优先显示 */}
        {recipe && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <button 
                onClick={() => setRecipe(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>返回</span>
              </button>
            </div>
            <div className="bg-white rounded-[22px] border border-gray-200 shadow-sm p-6 transition-all duration-500">
              <h2 className="text-2xl font-bold text-primary mb-6 font-serif">{recipe.name}</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600">难度等级</p>
                  <p className="font-medium">{recipe.difficulty}</p>
                </div>
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600">烹饪耗时</p>
                  <p className="font-medium">{recipe.time}</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 font-serif">详细步骤</h3>
                <div className="space-y-4">
                  {recipe.steps.map((step, index) => (
                    <div key={index} className="p-4 rounded-xl border border-gray-200 bg-white">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-medium bg-primary text-white">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {recipe.tips.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-3 font-serif">小贴士</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {recipe.tips.map((tip, index) => (
                      <li key={index} className="text-gray-700">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-medium text-dark">缺料清单</p>
                {currentRecipeMissingIngredients.length === 0 ? (
                  <p className="text-xs text-gray-500 mt-1">常备食材已覆盖，当前无需补料。</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    缺少：{currentRecipeMissingIngredients.join('、')}
                  </p>
                )}
                <button
                  onClick={() => exportRecipeMissingIngredients(recipe)}
                  className="mt-2 w-full py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-white transition-colors"
                >
                  导出缺料清单
                </button>
              </div>
              {/* 想做和做过按钮 */}
              <div className="flex gap-4">
                <button
                  onClick={() => toggleWantToCook(recipe.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${recipe.isWantToCook ? 'bg-primary text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recipe.isWantToCook ? '已想做' : '想做'}
                </button>
                <button
                  onClick={() => toggleCooked(recipe.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${recipe.isCooked ? 'bg-primary text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recipe.isCooked ? '已做过' : '做过'}
                </button>
              </div>
              {(recipe.isWantToCook || recipe.isCooked) && (
                <div className="mt-3 text-sm text-primary">
                  {recipe.isWantToCook && <span className="mr-4">已标记想做</span>}
                  {recipe.isCooked && <span>已标记做过</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 只有在没有菜谱时才显示内容 */}
        {!recipe && (
          <>
            {/* 生成菜谱页面 */}
            {activeTab === 'generate' && (
              <GenerateTab
                mainIngredient={mainIngredient}
                onMainIngredientChange={setMainIngredient}
                isVoiceMode={isVoiceMode}
                showWaveAnimation={showWaveAnimation}
                isLoading={isLoading}
                loadingText={loadingText}
                isAnimationClicked={isAnimationClicked}
                inputRef={inputRef}
                voiceButtonRef={voiceButtonRef}
                onVoiceButtonClick={handleVoiceButtonClick}
                onVoiceStart={handleVoiceStart}
                onVoiceMouseMove={handleVoiceMouseMove}
                onVoiceEnd={handleVoiceEnd}
                onVoiceLeave={handleVoiceLeave}
                onGenerateRecipe={generateRecipe}
                todayRecommendation={todayRecommendation}
                onChangeTodayRecommendation={changeTodayRecommendation}
                onShowPredefinedRecipe={showPredefinedRecipe}
                selectedCategory={selectedCategory}
                onCategoryClick={handleCategoryClick}
                filteredRecipes={filteredRecipes}
                onToggleAnimation={() => setIsAnimationClicked(!isAnimationClicked)}
              />
            )}

            {/* 社区页面 */}
            {activeTab === 'community' && (
              <CommunityTab
                predefinedRecipes={predefinedRecipes}
                onShowPredefinedRecipe={showPredefinedRecipe}
              />
            )}

            {/* 菜谱记录页面 */}
            {activeTab === 'saved' && (
              <div className="mb-8 max-w-md mx-auto">
                <div className="bg-white rounded-[22px] border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 pt-4 pb-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-dark font-serif">我的菜谱记录</h3>
                    {savedRecipes.length > 0 && (
                      <div className="flex gap-2">
                        {isSelectMode && (
                          <button onClick={deleteSelected} className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                            删除选中({selectedRecipes.size})
                          </button>
                        )}
                        <button
                          onClick={() => { setIsSelectMode(v => !v); setSelectedRecipes(new Set()); }}
                          className="px-3 py-1 border border-gray-300 rounded-full text-sm"
                        >
                          {isSelectMode ? '取消' : '删除'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {!isSavedRecipesHydrated ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
                            <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
                            <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                            <div className="h-4 w-5/6 bg-gray-100 rounded" />
                          </div>
                        ))}
                      </div>
                    ) : savedRecipes.length === 0 ? (
                      <div className="rounded-xl py-10 text-center text-gray-500 bg-gray-50">
                        还没有保存的菜谱，生成一个菜谱试试吧！
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedRecipes.map((savedRecipe) => (
                          <div
                            key={savedRecipe.id}
                            className={`rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-sm ${isSelectMode && selectedRecipes.has(savedRecipe.id) ? 'ring-2 ring-red-400' : ''}`}
                            onClick={isSelectMode ? () => toggleSelectRecipe(savedRecipe.id) : undefined}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                {isSelectMode && (
                                  <input type="checkbox" readOnly checked={selectedRecipes.has(savedRecipe.id)} className="w-4 h-4" />
                                )}
                                <h4 className="font-serif font-bold text-lg">{savedRecipe.name}</h4>
                              </div>
                              {!isSelectMode && savedRecipe.isCooked && (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">已做过</span>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap mb-3">
                              <span className="px-2 py-1 border border-gray-300 text-xs rounded">{savedRecipe.difficulty}</span>
                              <span className="px-2 py-1 border border-gray-300 text-xs rounded">{savedRecipe.time}</span>
                              <span className="px-2 py-1 border border-gray-300 text-xs rounded">主食材：{savedRecipe.mainIngredient}</span>
                            </div>
                            {!isSelectMode && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">{new Date(savedRecipe.createdAt).toLocaleString()}</span>
                                <button
                                  onClick={() => viewSavedRecipe(savedRecipe)}
                                  className="text-sm text-primary hover:underline"
                                >
                                  查看详情
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileTab
                profileSubTab={profileSubTab}
                onProfileSubTabChange={handleProfileSubTabChange}
                profileRecipes={profileRecipes}
                totalCookedCount={totalCookedCount}
                totalWantCount={totalWantCount}
                cookableWantCount={cookableWantCount}
                topMissingItems={topMissingItems}
                isRecipesHydrated={isSavedRecipesHydrated}
                weeklyCookedDays={weeklyCookStats.cookedDays}
                weeklyGoal={weeklyCookStats.weekGoal}
                consecutiveCookDays={consecutiveCookDays}
                recentCookTrend={recentCookTrend}
                profileFunnelStats={profileFunnelStats}
                onViewSavedRecipe={viewSavedRecipe}
                onOpenSearchHistory={() => setShowSearchHistoryModal(true)}
                onOpenStapleIngredientsModal={openStapleIngredientsModal}
                onOpenGenerateTab={openGenerateFromProfile}
                onOpenManageRecipes={openSavedForManage}
              />
            )}
          </>
        )}

        {/* 评分弹窗 */}
        {ratingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-light p-6 rounded-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-dark mb-4 font-serif">
                {savedRecipes.find(r => r.id === ratingModal.recipeId)?.name}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">评分：</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      onClick={() => setRatingModal({ ...ratingModal, tempRating: star })}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-7 w-7 cursor-pointer transition-colors ${star <= ratingModal.tempRating ? 'text-primary' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <textarea
                value={ratingModal.tempComment}
                onChange={(e) => setRatingModal({ ...ratingModal, tempComment: e.target.value })}
                placeholder="写下你的评语（可选）..."
                className="w-full retro-input rounded-md px-3 py-2 text-sm mb-4 resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => markRecipeCooked(ratingModal.recipeId, ratingModal.tempRating, ratingModal.tempComment)}
                  className="flex-1 py-2 retro-button rounded-md"
                >
                  保存
                </button>
                <button
                  onClick={() => markRecipeCooked(ratingModal.recipeId)}
                  className="flex-1 py-2 border border-dark rounded-md hover:bg-gray-100"
                >
                  跳过
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 搜索记录模态框 */}
        {showSearchHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-light p-6 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark font-serif">搜索记录</h3>
                <button
                  onClick={() => setShowSearchHistoryModal(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  关闭
                </button>
              </div>
              {recentRecipes.length === 0 ? (
                <div className="rounded-xl py-8 text-center text-gray-500 bg-gray-50">
                  还没有最近的菜谱记录
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRecipes.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-dark">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            主食材：{item.mainIngredient}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setShowSearchHistoryModal(false);
                            viewSavedRecipe(item);
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          查看详情
                        </button>
                        {!item.isWantToCook && (
                          <button
                            onClick={() => addRecipeToWantToCook(item.id)}
                            className="text-sm text-dark hover:underline"
                          >
                            加入想做
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 常备食材编辑模态框 */}
        {showStapleIngredientsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-[22px] max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-dark mb-4 font-serif">编辑常备食材库</h3>
              <div className="space-y-3 mb-6">
                {editingStapleIngredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateStapleIngredient(index, e.target.value)}
                      className="flex-1 rounded-xl px-3 py-2 border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="输入食材"
                    />
                    <button
                      onClick={() => removeStapleIngredient(index)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addStapleIngredient}
                  className="flex-1 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  添加食材
                </button>
                <button
                  onClick={saveStapleIngredients}
                  className="flex-1 py-2 bg-dark text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        </div>

        {/* 底部导航栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-light border-t border-gray-200 z-50">
          <div className="w-full grid grid-cols-3">
            <button
              onClick={() => {
                setActiveTab('generate');
                setRecipe(null);
              }}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${activeTab === 'generate' ? 'text-primary' : 'text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">首页</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('community');
                setRecipe(null);
              }}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${activeTab === 'community' ? 'text-primary' : 'text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs">社区</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setRecipe(null);
              }}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs">我的</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

