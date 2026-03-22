export interface Recipe {
  id: string;
  name: string;
  difficulty: string;
  time: string;
  steps: string[];
  tips: string[];
  ingredients?: string[];
  image?: string;
  mainIngredient: string;
  createdAt: string;
  cookedAt?: string;
  isWantToCook?: boolean;
  isCooked?: boolean;
  rating?: number;
  comment?: string;
}

export interface PredefinedRecipe {
  id: number;
  name: string;
  ingredients: string;
  difficulty: string;
  cookingTime: string;
  steps: string[];
  tips: string[];
  image: string;
}
