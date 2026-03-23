import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

interface SyncPayload {
  savedRecipes: unknown[];
  stapleIngredients: string[];
  profileFunnelStats: {
    profileEntryCount: number;
    wantTabClickCount: number;
    wantRecipeOpenCount: number;
    cookedMarkCount: number;
    updatedAt: string;
  };
}

interface SyncUserRecord {
  passcodeHash: string;
  payload: SyncPayload;
  updatedAt: string;
}

interface SyncStore {
  users: Record<string, SyncUserRecord>;
}

const dataDir = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'sync-state.json');

const defaultPayload: SyncPayload = {
  savedRecipes: [],
  stapleIngredients: [],
  profileFunnelStats: {
    profileEntryCount: 0,
    wantTabClickCount: 0,
    wantRecipeOpenCount: 0,
    cookedMarkCount: 0,
    updatedAt: '',
  },
};

const hashPasscode = (passcode: string) =>
  createHash('sha256').update(passcode).digest('hex');

const loadStore = async (): Promise<SyncStore> => {
  try {
    const content = await fs.readFile(dataFilePath, 'utf-8');
    const parsed = JSON.parse(content) as Partial<SyncStore>;
    return {
      users: parsed.users || {},
    };
  } catch {
    return { users: {} };
  }
};

const saveStore = async (store: SyncStore) => {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(store, null, 2), 'utf-8');
};

const normalizePayload = (payload: Partial<SyncPayload> | undefined): SyncPayload => ({
  savedRecipes: Array.isArray(payload?.savedRecipes) ? payload.savedRecipes : [],
  stapleIngredients: Array.isArray(payload?.stapleIngredients)
    ? payload.stapleIngredients.map((item) => String(item).trim()).filter(Boolean)
    : [],
  profileFunnelStats: {
    profileEntryCount: Number(payload?.profileFunnelStats?.profileEntryCount) || 0,
    wantTabClickCount: Number(payload?.profileFunnelStats?.wantTabClickCount) || 0,
    wantRecipeOpenCount: Number(payload?.profileFunnelStats?.wantRecipeOpenCount) || 0,
    cookedMarkCount: Number(payload?.profileFunnelStats?.cookedMarkCount) || 0,
    updatedAt:
      typeof payload?.profileFunnelStats?.updatedAt === 'string'
        ? payload.profileFunnelStats.updatedAt
        : '',
  },
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: 'pull' | 'push';
      accountId?: string;
      passcode?: string;
      payload?: Partial<SyncPayload>;
    };
    const action = body.action;
    const accountId = String(body.accountId || '').trim();
    const passcode = String(body.passcode || '').trim();
    if (!action || (action !== 'pull' && action !== 'push')) {
      return NextResponse.json({ error: '无效操作类型' }, { status: 400 });
    }
    if (!accountId || accountId.length < 3) {
      return NextResponse.json({ error: '同步账号至少 3 位' }, { status: 400 });
    }
    if (!passcode || passcode.length < 6) {
      return NextResponse.json({ error: '同步口令至少 6 位' }, { status: 400 });
    }

    const store = await loadStore();
    const user = store.users[accountId];
    const passcodeHash = hashPasscode(passcode);

    if (action === 'pull') {
      if (!user) {
        return NextResponse.json({ error: '账号不存在，请先推送一次数据' }, { status: 404 });
      }
      if (user.passcodeHash !== passcodeHash) {
        return NextResponse.json({ error: '同步口令错误' }, { status: 401 });
      }
      return NextResponse.json({
        payload: normalizePayload(user.payload),
        updatedAt: user.updatedAt,
      });
    }

    if (user && user.passcodeHash !== passcodeHash) {
      return NextResponse.json({ error: '同步口令错误' }, { status: 401 });
    }

    const normalizedPayload = normalizePayload(body.payload);
    const updatedAt = new Date().toISOString();
    store.users[accountId] = {
      passcodeHash,
      payload: normalizedPayload,
      updatedAt,
    };
    await saveStore(store);

    return NextResponse.json({ success: true, updatedAt });
  } catch {
    return NextResponse.json({ error: '同步服务异常，请稍后重试' }, { status: 500 });
  }
}
