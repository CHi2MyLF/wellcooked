import { NextRequest, NextResponse } from 'next/server';

const INVALID_INGREDIENT_TOKENS = new Set(['null', 'undefined', 'none', 'nil', 'nan', '0']);
const LOCATION_LIKE_INPUTS = new Set([
  '中国', '美国', '英国', '法国', '德国', '意大利', '西班牙', '日本', '韩国',
  '俄罗斯', '印度', '泰国', '越南', '新加坡', '澳大利亚', '加拿大', '巴西', '墨西哥'
]);

function validateMainIngredient(rawValue: unknown): { ok: true; ingredient: string } | { ok: false; error: string } {
  const ingredient = String(rawValue ?? '').trim();
  if (!ingredient) {
    return { ok: false, error: '请提供主食材' };
  }

  const lowered = ingredient.toLowerCase();
  if (INVALID_INGREDIENT_TOKENS.has(lowered) || /^\d+$/.test(ingredient)) {
    return { ok: false, error: '请输入具体食材，不能只填 0、null 或纯数字' };
  }

  if (LOCATION_LIKE_INPUTS.has(ingredient)) {
    return { ok: false, error: '请输入食材名称（如：鸡蛋、西红柿）' };
  }

  return { ok: true, ingredient };
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
      return NextResponse.json({ error: '服务端缺少 DEEPSEEK_API_KEY' }, { status: 500 });
    }

    let userMessage = `用户今天有：${ingredients}\n`;
    if (stapleIngredients.length > 0) {
      userMessage += `家里常备的食材有：${stapleIngredients.join('、')}\n`;
    }
    userMessage += '请以主食材为主角，结合常备食材，生成一道家常菜菜谱。不要使用常备食材库以外的其他食材。';

    const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一位米其林星级中餐大厨。先判断输入是否可食用食材；若不可食用请仅返回 {"error":"这个东西不能吃"}。若可食用，请仅返回 JSON：{"name":"菜谱名称","difficulty":"难度等级","cookingTime":"烹饪耗时","steps":["步骤1","步骤2"],"tips":["小贴士1","小贴士2"]}。不要返回 markdown 或其他文本。'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const raw = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: `上游模型请求失败(${upstream.status})`, detail: raw }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    return NextResponse.json({ error: '生成菜谱失败，请稍后重试', detail: message }, { status: 500 });
  }
}
