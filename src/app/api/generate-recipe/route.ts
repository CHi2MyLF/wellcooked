import { NextRequest, NextResponse } from 'next/server';

type RecipePayload = {
  name: string;
  difficulty: string;
  cookingTime: string;
  steps: string[];
  tips?: string[];
  ingredients?: string[] | string;
  image?: string;
  error?: string;
};

const INVALID_INGREDIENT_TOKENS = new Set(['null', 'undefined', 'none', 'nil', 'nan', '0']);
const LOCATION_LIKE_INPUTS = new Set([
  '\u4e2d\u56fd', '\u7f8e\u56fd', '\u82f1\u56fd', '\u6cd5\u56fd', '\u5fb7\u56fd', '\u610f\u5927\u5229', '\u897f\u73ed\u7259', '\u65e5\u672c', '\u97e9\u56fd',
  '\u4fc4\u7f57\u65af', '\u5370\u5ea6', '\u6cf0\u56fd', '\u8d8a\u5357', '\u65b0\u52a0\u5761', '\u6fb3\u5927\u5229\u4e9a', '\u52a0\u62ff\u5927', '\u5df4\u897f', '\u58a8\u897f\u54e5'
]);

function validateMainIngredient(rawValue: unknown): { ok: true; ingredient: string } | { ok: false; error: string } {
  const ingredient = String(rawValue ?? '').trim();
  if (!ingredient) {
    return { ok: false, error: '\u8bf7\u63d0\u4f9b\u4e3b\u98df\u6750' };
  }

  const lowered = ingredient.toLowerCase();
  if (INVALID_INGREDIENT_TOKENS.has(lowered) || /^\d+$/.test(ingredient)) {
    return { ok: false, error: '\u8bf7\u8f93\u5165\u5177\u4f53\u98df\u6750\uff0c\u4e0d\u80fd\u53ea\u586b 0\u3001null \u6216\u7eaf\u6570\u5b57' };
  }

  if (LOCATION_LIKE_INPUTS.has(ingredient)) {
    return { ok: false, error: '\u8bf7\u8f93\u5165\u98df\u6750\u540d\u79f0\uff0c\u4f8b\u5982\u9e21\u86cb\u3001\u897f\u7ea2\u67ff' };
  }

  return { ok: true, ingredient };
}

function tryParseRecipeContent(content: string): RecipePayload | null {
  const cleaned = content
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  const candidates = [cleaned];
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(cleaned.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as RecipePayload;
      return parsed;
    } catch {
      // Continue trying other candidates.
    }
  }

  return null;
}

function normalizeRecipePayload(payload: RecipePayload) {
  return {
    name: payload.name,
    difficulty: payload.difficulty,
    cookingTime: payload.cookingTime,
    steps: Array.isArray(payload.steps) ? payload.steps : [],
    tips: Array.isArray(payload.tips) ? payload.tips : [],
    ingredients: Array.isArray(payload.ingredients)
      ? payload.ingredients
      : typeof payload.ingredients === 'string'
        ? payload.ingredients
            .split(/[\n\u3001,\uff0c]/)
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    image: typeof payload.image === 'string' ? payload.image : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateMainIngredient(body?.ingredients);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const ingredients = validation.ingredient;
    const stapleIngredients = Array.isArray(body?.stapleIngredients) ? body.stapleIngredients : [];

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '\u670d\u52a1\u7aef\u7f3a\u5c11 DEEPSEEK_API_KEY' }, { status: 500 });
    }

    let userMessage = `\u7528\u6237\u4eca\u5929\u6709\uff1a${ingredients}\n`;
    if (stapleIngredients.length > 0) {
      userMessage += `\u5bb6\u91cc\u5e38\u5907\u7684\u98df\u6750\u6709\uff1a${stapleIngredients.join('\u3001')}\n`;
    }
    userMessage += '\u8bf7\u4ee5\u4e3b\u98df\u6750\u4e3a\u4e3b\u89d2\uff0c\u7ed3\u5408\u5e38\u5907\u98df\u6750\uff0c\u751f\u6210\u4e00\u9053\u5bb6\u5e38\u83dc\u83dc\u8c31\u3002\u4e0d\u8981\u4f7f\u7528\u5e38\u5907\u98df\u6750\u5e93\u4ee5\u5916\u7684\u5176\u4ed6\u98df\u6750\u3002';

    const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              '\u4f60\u662f\u4e00\u4f4d\u7c73\u5176\u6797\u661f\u7ea7\u4e2d\u9910\u5927\u53a8\u3002\u5148\u5224\u65ad\u8f93\u5165\u662f\u5426\u53ef\u98df\u7528\u98df\u6750\uff1b\u82e5\u4e0d\u53ef\u98df\u7528\u8bf7\u4ec5\u8fd4\u56de {"error":"\u8fd9\u4e2a\u4e1c\u897f\u4e0d\u80fd\u5403"}\u3002\u82e5\u53ef\u98df\u7528\uff0c\u8bf7\u4ec5\u8fd4\u56de JSON \u5bf9\u8c61\uff1a{"name":"\u83dc\u8c31\u540d\u79f0","difficulty":"\u96be\u5ea6\u7b49\u7ea7","cookingTime":"\u70f9\u996a\u8017\u65f6","steps":["\u6b65\u9aa41","\u6b65\u9aa42"],"tips":["\u5c0f\u8d34\u58eb1","\u5c0f\u8d34\u58eb2"],"ingredients":["\u98df\u67501","\u98df\u67502"]}\u3002\u4e0d\u8981\u8fd4\u56de markdown\u3001\u89e3\u91ca\u6587\u5b57\u6216 JSON \u4e4b\u5916\u7684\u5185\u5bb9\u3002'
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const raw = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: `\u4e0a\u6e38\u6a21\u578b\u8bf7\u6c42\u5931\u8d25(${upstream.status})`, detail: raw }, { status: 502 });
    }

    const upstreamJson = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = upstreamJson.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: '\u6a21\u578b\u672a\u8fd4\u56de\u6709\u6548\u83dc\u8c31' }, { status: 502 });
    }

    const parsedRecipe = tryParseRecipeContent(content);
    if (!parsedRecipe) {
      return NextResponse.json({ error: '\u6a21\u578b\u8fd4\u56de\u7684\u83dc\u8c31\u683c\u5f0f\u4e0d\u6b63\u786e', detail: content }, { status: 502 });
    }

    if (parsedRecipe.error) {
      return NextResponse.json({ error: parsedRecipe.error }, { status: 400 });
    }

    return NextResponse.json(normalizeRecipePayload(parsedRecipe));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    return NextResponse.json({ error: '\u751f\u6210\u83dc\u8c31\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5', detail: message }, { status: 500 });
  }
}
