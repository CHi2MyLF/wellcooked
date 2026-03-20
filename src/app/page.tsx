'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Recipe {
  id: string;
  name: string;
  difficulty: string;
  time: string;
  steps: string[];
  tips: string[];
  mainIngredient: string;
  createdAt: string;
  isWantToCook?: boolean;
  isCooked?: boolean;
  rating?: number;
  comment?: string;
}

interface PredefinedRecipe {
  id: number;
  name: string;
  ingredients: string;
  difficulty: string;
  cookingTime: string;
  steps: string[];
  tips: string[];
  image: string;
}

const MAX_SAVED_RECIPES = 10;

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
  const [showStapleIngredientsModal, setShowStapleIngredientsModal] = useState(false);
  const [editingStapleIngredients, setEditingStapleIngredients] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [todayRecommendation, setTodayRecommendation] = useState<PredefinedRecipe>(
    predefinedRecipes.find(recipe => recipe.id === 5) || predefinedRecipes[0]
  );
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [isAnimationClicked, setIsAnimationClicked] = useState(false);
  const [ratingModal, setRatingModal] = useState<{ recipeId: string; tempRating: number; tempComment: string } | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  
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
            acc.push(current);
          }
          return acc;
        }, []);
        setSavedRecipes(normalizeSavedRecipes(uniqueRecipes));
      } catch {
        setSavedRecipes([]);
      }
    }
  }, []);

  // 保存菜谱到本地存储
  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(normalizeSavedRecipes(savedRecipes)));
  }, [savedRecipes]);

  // 语音输入功能
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
      alert('您的浏览器不支持语音识别功能');
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
      alert(validationError);
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

      // 创建新菜谱对象
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        name: parsedRecipe.name,
        difficulty: parsedRecipe.difficulty,
        time: parsedRecipe.cookingTime,
        steps: parsedRecipe.steps,
        tips: parsedRecipe.tips || [],
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
      alert('生成菜谱失败，请稍后重试');
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

  // 标记做过
  const toggleCooked = (recipeId: string) => {
    const rec = savedRecipes.find(r => r.id === recipeId) || (recipe?.id === recipeId ? recipe : undefined);
    if (rec && !rec.isCooked) {
      setRatingModal({ recipeId, tempRating: rec.rating || 0, tempComment: rec.comment || '' });
      return;
    }
    setSavedRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, isCooked: false } : r));
    if (recipe && recipe.id === recipeId) {
      setRecipe({ ...recipe, isCooked: false });
    }
  };

  // 查看保存的菜谱详情
  const viewSavedRecipe = (savedRecipe: Recipe) => {
    setRecipe(savedRecipe);
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

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8 relative">
      <div className="max-w-3xl mx-auto relative">

        {/* 菜谱详情页面 - 优先显示 */}
        {recipe && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
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
            <div className="retro-card rounded-lg p-6 transition-all duration-500">
              <h2 className="text-2xl font-bold text-primary mb-6 font-serif">{recipe.name}</h2>
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
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-3 font-serif">小贴士</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {recipe.tips.map((tip, index) => (
                      <li key={index} className="text-gray-700">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* 想做和做过按钮 */}
              <div className="flex gap-4">
                <button
                  onClick={() => toggleWantToCook(recipe.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md ${recipe.isWantToCook ? 'bg-primary text-white' : 'border border-dark'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recipe.isWantToCook ? '已想做' : '想做'}
                </button>
                <button
                  onClick={() => toggleCooked(recipe.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md ${recipe.isCooked ? 'bg-primary text-white' : 'border border-dark'}`}
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
            {/* 标题 */}
            <header className="text-center my-8">
              <h1 className="text-4xl font-bold text-dark font-serif mb-2">智能后厨</h1>
              <p className="text-gray-600">根据食材生成美味菜谱</p>
            </header>

            {/* 生成菜谱页面 */}
            {activeTab === 'generate' && (
              <div className="mb-8">
                {/* 食材输入区域 */}
                <div className="mb-6">
                  <div className="flex items-center gap-0 rounded-lg overflow-hidden border border-gray-200">
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={mainIngredient}
                        onChange={(e) => setMainIngredient(e.target.value)}
                        placeholder={isVoiceMode ? '按住说话' : '输入主食材，例如：西红柿'}
                        className={`w-full py-4 px-5 pr-12 bg-white focus:outline-none`}
                      />
                      {/* 音波动画 */}
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
                        onClick={handleVoiceButtonClick}
                        onMouseDown={handleVoiceStart}
                        onMouseMove={handleVoiceMouseMove}
                        onMouseUp={handleVoiceEnd}
                        onMouseLeave={handleVoiceLeave}
                        onTouchStart={handleVoiceStart}
                        onTouchEnd={handleVoiceEnd}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full ${isVoiceMode ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'} transition-all duration-300`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={generateRecipe}
                      disabled={isLoading}
                      className={`flex items-center justify-center gap-2 px-6 py-4 retro-button ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} whitespace-nowrap font-medium transition-all duration-300 hover:bg-opacity-90`}
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
                  
                  {/* 动画区域 */}
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center gap-3 mt-4">
                      <div 
                        className="cooking-animation cursor-pointer"
                        onClick={() => setIsAnimationClicked(!isAnimationClicked)}
                      >
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
                  
                  
                </div>
                
                {/* 今日推荐 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-dark font-serif">今日推荐</h3>
                    <span className="text-sm text-primary cursor-pointer hover:underline" onClick={changeTodayRecommendation}>查看更多</span>
                  </div>
                  <div className="retro-card rounded-lg p-4 mb-4 cursor-pointer" onClick={() => showPredefinedRecipe(todayRecommendation)}>
                    <div className="flex flex-col md:flex-row gap-4">
                      <img src={todayRecommendation.image} alt={todayRecommendation.name} className="w-full md:w-1/3 h-40 object-cover rounded-md border border-dark" />
                      <div className="flex-1">
                        <h4 className="font-serif font-bold text-lg mb-2">{todayRecommendation.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{todayRecommendation.name}是一道美味的中式菜肴，营养丰富，制作简单，是家庭餐桌上的常见选择。</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-primary text-white text-xs rounded">热门</span>
                          <span className="px-2 py-1 border border-dark text-xs rounded">{todayRecommendation.difficulty}</span>
                          <span className="px-2 py-1 border border-dark text-xs rounded">{todayRecommendation.cookingTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 每日精选食材推荐区 */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-dark mb-4 font-serif">每日精选食材</h3>
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
                  <div className="grid grid-cols-2 gap-4">
                    {filteredRecipes.map((recipe, index) => {
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
                                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < 4 ? 'text-primary' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
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
              </div>
            )}

            {/* 菜谱记录页面 */}
            {activeTab === 'saved' && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
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
                        className="px-3 py-1 border border-dark rounded-full text-sm"
                      >
                        {isSelectMode ? '取消' : '删除'}
                      </button>
                    </div>
                  )}
                </div>
                {savedRecipes.length === 0 ? (
                  <div className="retro-card rounded-lg p-8 text-center">
                    <p className="text-gray-600">还没有保存的菜谱，生成一个菜谱试试吧！</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedRecipes.map((savedRecipe) => (
                      <div key={savedRecipe.id} className={`retro-card rounded-lg p-4 transition-all duration-300 hover:shadow-md ${isSelectMode && selectedRecipes.has(savedRecipe.id) ? 'ring-2 ring-red-400' : ''}`}
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
                        <div className="flex gap-4 mb-3">
                          <span className="px-2 py-1 border border-dark text-xs rounded">{savedRecipe.difficulty}</span>
                          <span className="px-2 py-1 border border-dark text-xs rounded">{savedRecipe.time}</span>
                          <span className="px-2 py-1 border border-dark text-xs rounded">主食材：{savedRecipe.mainIngredient}</span>
                        </div>
                        {!isSelectMode && <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{new Date(savedRecipe.createdAt).toLocaleString()}</span>
                          <button
                            onClick={() => viewSavedRecipe(savedRecipe)}
                            className="text-sm text-primary hover:underline"
                          >
                            查看详情
                          </button>
                        </div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 我的页面 */}
            {activeTab === 'profile' && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-dark mb-4 font-serif">我的</h3>

                {/* 常备食材库 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium">常备食材库</h4>
                    <button
                      onClick={openStapleIngredientsModal}
                      className="text-sm text-primary hover:underline"
                    >
                      编辑
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stapleIngredients.map((ingredient, index) => (
                      <span key={index} className="px-3 py-1 bg-light border border-dark rounded-full text-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* 菜谱记录 */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-medium">菜谱记录</h4>
                    {savedRecipes.length > 0 && (
                      <div className="flex gap-2">
                        {isSelectMode && (
                          <button onClick={deleteSelected} className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                            删除选中({selectedRecipes.size})
                          </button>
                        )}
                        <button
                          onClick={() => { setIsSelectMode(v => !v); setSelectedRecipes(new Set()); }}
                          className="px-3 py-1 border border-dark rounded-full text-sm"
                        >
                          {isSelectMode ? '取消' : '删除'}
                        </button>
                      </div>
                    )}
                  </div>
                  {savedRecipes.length === 0 ? (
                    <div className="retro-card rounded-lg p-6 text-center">
                      <p className="text-gray-600">还没有保存的菜谱，生成一个菜谱试试吧！</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedRecipes.map((savedRecipe) => (
                      <div key={savedRecipe.id} className={`retro-card rounded-lg p-4 transition-all duration-300 hover:shadow-md ${isSelectMode && selectedRecipes.has(savedRecipe.id) ? 'ring-2 ring-red-400' : ''}`}
                        onClick={isSelectMode ? () => toggleSelectRecipe(savedRecipe.id) : undefined}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {isSelectMode && (
                              <input type="checkbox" readOnly checked={selectedRecipes.has(savedRecipe.id)} className="w-4 h-4" />
                            )}
                            <h5 className="font-serif font-bold">{savedRecipe.name}</h5>
                          </div>
                          {!isSelectMode && savedRecipe.isCooked && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">已做过</span>
                          )}
                        </div>
                        <div className="flex gap-4 mb-3">
                          <span className="px-2 py-1 border border-dark text-xs rounded">{savedRecipe.difficulty}</span>
                          <span className="px-2 py-1 border border-dark text-xs rounded">{savedRecipe.time}</span>
                          <span className="px-2 py-1 border border-dark text-xs rounded">主食材：{savedRecipe.mainIngredient}</span>
                        </div>
                        {!isSelectMode && <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{new Date(savedRecipe.createdAt).toLocaleString()}</span>
                          <button
                            onClick={() => viewSavedRecipe(savedRecipe)}
                            className="text-sm text-primary hover:underline"
                          >
                            查看详情
                          </button>
                        </div>}
                      </div>
                    ))}
                    </div>
                  )}
                </div>

                {/* 想做的菜谱 */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium mb-3">想做的菜谱</h4>
                  {savedRecipes.filter(recipe => recipe.isWantToCook).length === 0 ? (
                    <div className="retro-card rounded-lg p-6 text-center">
                      <p className="text-gray-600">还没有标记为想做的菜谱</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedRecipes.filter(recipe => recipe.isWantToCook).map((recipe) => (
                        <div key={recipe.id} className="retro-card rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <div className="flex justify-between items-center">
                            <h5 className="font-serif font-bold">{recipe.name}</h5>
                            <button
                              onClick={() => viewSavedRecipe(recipe)}
                              className="text-sm text-primary hover:underline"
                            >
                              查看
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 做过的菜谱 */}
                <div>
                  <h4 className="text-lg font-medium mb-3">做过的菜谱</h4>
                  {savedRecipes.filter(recipe => recipe.isCooked).length === 0 ? (
                    <div className="retro-card rounded-lg p-6 text-center">
                      <p className="text-gray-600">还没有标记为做过的菜谱</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedRecipes.filter(recipe => recipe.isCooked).map((recipe) => (
                      <div key={recipe.id} className="retro-card rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start">
                          <h5 className="font-serif font-bold">{recipe.name}</h5>
                          <div className="flex items-center">
                            <div className="flex mr-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 ${star <= (recipe.rating || 0) ? 'text-primary' : 'text-gray-300'}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            </div>
                            <button
                              onClick={() => viewSavedRecipe(recipe)}
                              className="text-sm text-primary hover:underline"
                            >
                              查看
                            </button>
                          </div>
                        </div>
                        {recipe.comment && (
                          <p className="text-sm text-gray-600 mt-2">{recipe.comment}</p>
                        )}
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              </div>
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
                  onClick={() => {
                    setSavedRecipes(prev => prev.map(r =>
                      r.id === ratingModal.recipeId ? { ...r, isCooked: true, rating: ratingModal.tempRating, comment: ratingModal.tempComment } : r
                    ));
                    if (recipe && recipe.id === ratingModal.recipeId) {
                      setRecipe({ ...recipe, isCooked: true, rating: ratingModal.tempRating, comment: ratingModal.tempComment });
                    }
                    setRatingModal(null);
                  }}
                  className="flex-1 py-2 retro-button rounded-md"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setSavedRecipes(prev => prev.map(r =>
                      r.id === ratingModal.recipeId ? { ...r, isCooked: true } : r
                    ));
                    if (recipe && recipe.id === ratingModal.recipeId) {
                      setRecipe({ ...recipe, isCooked: true });
                    }
                    setRatingModal(null);
                  }}
                  className="flex-1 py-2 border border-dark rounded-md hover:bg-gray-100"
                >
                  跳过
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 社区模态框 */}
        {showCommunityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-light p-6 rounded-lg max-w-md w-full text-center">
              <h3 className="text-xl font-bold text-dark mb-4 font-serif">社区</h3>
              <p className="text-gray-600 mb-6">暂未开放</p>
              <button
                onClick={() => {
                  document.body.style.paddingRight = '';
                  document.body.style.overflow = '';
                  setShowCommunityModal(false);
                }}
                className="px-6 py-2 retro-button rounded-md"
              >
                确定
              </button>
            </div>
          </div>
        )}

        {/* 常备食材编辑模态框 */}
        {showStapleIngredientsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-light p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-dark mb-4 font-serif">编辑常备食材库</h3>
              <div className="space-y-3 mb-6">
                {editingStapleIngredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateStapleIngredient(index, e.target.value)}
                      className="flex-1 retro-input rounded-md px-3 py-2"
                      placeholder="输入食材"
                    />
                    <button
                      onClick={() => removeStapleIngredient(index)}
                      className="px-3 py-2 bg-gray-200 border border-dark rounded-md hover:bg-gray-300"
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
                  className="flex-1 py-2 border border-dark rounded-md hover:bg-gray-100"
                >
                  添加食材
                </button>
                <button
                  onClick={saveStapleIngredients}
                  className="flex-1 py-2 retro-button rounded-md"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 底部导航栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-light border-t border-gray-200 z-50">
          <div className="max-w-3xl mx-auto flex justify-around">
            <button
              onClick={() => {
                setActiveTab('generate');
                setRecipe(null);
                document.body.style.paddingRight = '';
                document.body.style.overflow = '';
                setShowCommunityModal(false);
              }}
              className={`flex flex-col items-center py-3 px-6 transition-colors ${activeTab === 'generate' ? 'text-primary' : 'text-gray-600'}`}
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
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                document.body.style.paddingRight = `${scrollbarWidth}px`;
                document.body.style.overflow = 'hidden';
                setShowCommunityModal(true);
              }}
              className={`flex flex-col items-center py-3 px-6 transition-colors ${activeTab === 'community' ? 'text-primary' : 'text-gray-600'}`}
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
                document.body.style.paddingRight = '';
                document.body.style.overflow = '';
                setShowCommunityModal(false);
              }}
              className={`flex flex-col items-center py-3 px-6 transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs">我的</span>
            </button>
          </div>
        </div>

        <footer className="mt-auto py-16 text-center text-gray-500 text-sm">
          <p>2026 @CHi2MyLF</p>
        </footer>
      </div>
    </div>
  );
}
