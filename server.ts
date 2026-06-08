/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const gotMeta = typeof import.meta !== 'undefined' && typeof import.meta.url !== 'undefined';
const currentFile = gotMeta ? fileURLToPath(import.meta.url) : (__filename || '');
const currentDir = gotMeta ? path.dirname(currentFile) : (__dirname || '');

const app = express();
app.use(express.json());

const api_key = process.env.GEMINI_API_KEY;
const ai = api_key ? new GoogleGenAI({
  apiKey: api_key,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Print initialization details safely
console.log(`[Server] Gemini API Key is ${api_key ? 'CONFIUGRED' : 'NOT CONFIGURED (Fallback to offline rules)'}`);

/**
 * Executes a Gemini request with automatic retry and model fallback capability
 * to mitigate transient 503 high-demand errors.
 */
async function generateWithRetry(contents: any, config: any = {}) {
  const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Server] Generating content using model: ${model} (Attempt ${attempt}/2)`);
        if (!ai) throw new Error('GEMINI_API_KEY_MISSING');
        
        const payload: any = {
          model,
          contents,
        };
        if (config && Object.keys(config).length > 0) {
          payload.config = config;
        }
        
        const response = await ai.models.generateContent(payload);
        console.log(`[Server] Content generated successfully with model: ${model} (Attempt ${attempt}/2)`);
        return response;
      } catch (err: any) {
        console.error(`[Server] Error on model ${model} (Attempt ${attempt}/2):`, err);
        lastError = err;
        
        const errStr = String(err.message || err);
        const isTransient = errStr.includes('503') || 
                            errStr.includes('UNAVAILABLE') || 
                            errStr.includes('demand') || 
                            errStr.includes('timeout') || 
                            errStr.includes('limit') ||
                            err?.status === 503;
                            
        if (!isTransient) {
          throw err;
        }
        
        if (attempt === 1) {
          console.log(`[Server] Waiting 1000ms before retrying ${model}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    console.warn(`[Server] Both attempts on ${model} failed. Falling back to alternative model...`);
  }
  
  throw lastError;
}

// API Route for AI Card Deck Interpretation
app.post('/api/divination', async (req, res) => {
  try {
    if (!ai) {
      return res.status(403).json({ 
        error: 'GEMINI_API_KEY_MISSING',
        message: '当前尚未配置 GEMINI_API_KEY 密钥。请在 AI Studio 设置 -> Secrets 面板配置密钥。之后即可开启深层 AI 高级解牌。' 
      });
    }

    const { type, spreadType, question, cards } = req.body;
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'CARDS_REQUIRED', message: '占卜需要有效的卡牌列表。' });
    }

    // Prepare information for the prompt
    const cardListStr = cards.map((c: any, index: number) => {
      const positionInfo = c.positionLabel ? ` (牌位: ${c.positionLabel})` : '';
      const orientationInfo = type === 'tarot' ? ` [${c.isUpright ? '正位' : '逆位'}]` : '';
      const keywordsStr = c.keywords ? ` - 核心关键词: ${c.keywords.join(', ')}` : '';
      return `${index + 1}. 【${c.name} (${c.nameEn})】${positionInfo}${orientationInfo}${keywordsStr}`;
    }).join('\n');

    const promptText = `你是一位精通西方神秘学、经典伟特塔罗牌与法国传统雷诺曼卡牌占卜的世纪占卜学导师。
现有一位寻求指引的用户进行了在线占卜抽牌，请求你结合所抽中卡牌的神秘力量、能量流向与彼此之间的相位关系，提供客观、深刻、治愈且充满行动建议的占卜释疑。

【占卜语境】：
- 占卜类别：${type === 'tarot' ? '经典韦特塔罗牌 (Tarot)' : '传统雷诺曼卡牌 (Lenormand)'}
- 卡牌布局：${spreadType === 'single' ? '单张牌核心觉察指引' : '三张牌流动力学阵列（过去、现在、未来 / 主题、动作、结果）'}
- 用户求问问题/心愿："${question || '当前运势与能量场整体觉照'}"

【抽取卡牌详情列表】：
${cardListStr}

请写一份极具神谕仪式感、结构分明、语言优美治愈的卡牌全息解读：

1. **🍀 牌阵磁场与能量总览**：
   分析这些卡牌并置时所迸发的整体能量基调，它们之间的干涉与调和，为用户当前的处境做一个大气的宏观定调。
   
2. **✨ 卡牌逐一度解读**：
${cards.map((c: any, idx: number) => `   - **卡牌 ${idx + 1}：${c.name} (${c.nameEn})** ${c.isUpright !== undefined ? `[${c.isUpright ? '正位 Upright' : '逆位 Reversed'}]` : ''}：
     结合它的牌位标签「${c.positionLabel || '当前核心指引'}」，解读该卡牌的神意内涵、潜意识指示以及在当前时空点它向用户表达的隐秘忠告。`).join('\n')}

3. **🔮 综合神谕启示与行动方案**：
   将所有卡牌的能量与用户的当下疑难牢牢契合。给予用户 2-3 条极具智慧、理性、可立刻付诸行动的操作建议。鼓励用户以饱满的本自具足之心去开启未来之门。

请使用华丽、悠远而饱含宽容、理性的神谕风辞藻。全部用中文撰写，使用优雅的 Markdown 格式输出。`;

    const response = await generateWithRetry(promptText);

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errStr = String(error.message || error);
    
    let userMsg = 'AI 占卜在解算您本轮神谕意境时遇到了神秘干扰，请稍后刷新重试。';
    if (errStr.includes('503') || errStr.includes('demand') || errStr.includes('UNAVAILABLE')) {
      userMsg = '【星轨拥堵】宇宙中继器目前面临全球极大请求量（503 过载）。我们已竭力切换多条备用连结通道，依然受到了电磁干扰。请您在此屏气凝神沉淀 3-5 秒，然后再次点击开启 AI 专属神谕解读进行连通。';
    } else if (errStr.includes('GEMINI_API_KEY_MISSING') || errStr.includes('API_KEY_MISSING')) {
      return res.status(403).json({ 
        error: 'GEMINI_API_KEY_MISSING',
        message: '当前尚未配置 GEMINI_API_KEY 密钥。请在 AI Studio 设置 -> Secrets 面板配置密钥。' 
      });
    }

    res.status(500).json({ 
      error: 'SERVER_ERROR', 
      message: userMsg,
      details: errStr
    });
  }
});

// API Route for Daily Guidance (Card of the Day)
app.post('/api/divination/daily-guidance', async (req, res) => {
  try {
    if (!ai) {
      return res.status(403).json({ 
        error: 'GEMINI_API_KEY_MISSING',
        message: '当前尚未配置 GEMINI_API_KEY 密钥。' 
      });
    }

    const { cardType, cardName, cardNameEn, isUpright, dateStr } = req.body;
    
    const systemInstruction = 
      "你是当天的宇宙能量回音。你用深刻、鼓舞人心、富有意境且简短优雅的语气（约150字）" +
      "为人们定制当天的精神点拨、元气提醒，让人心旷神怡，开启元气满满的一天。";

    let prompt = `【当前日期】: ${dateStr || '今天'}\n`;
    prompt += `【抽得每日卡牌】: ${cardType === 'tarot' ? '塔罗牌' : '雷诺曼'}\n`;
    prompt += `【牌名】: ${cardName} (${cardNameEn})\n`;
    if (cardType === 'tarot') {
      prompt += `【正逆位】: ${isUpright ? '正位' : '逆位'}\n`;
    }
    prompt += `\n请根据这张卡，为今天写一段极具美感、富于能量、温暖深刻的“每日宇宙寄语”（3-4句话，充满元气，不要输出枯燥的项目编号或冷冰冰的教训词）。`;

    const response = await generateWithRetry(prompt, {
      systemInstruction,
      temperature: 1.0,
    });

    res.json({ guidance: response.text || "愿今天充满阳光。" });
  } catch (error: any) {
    console.error('Daily Guidance Error:', error);
    const errStr = String(error.message || error);
    
    let userMsg = '生成每日星示时被神秘磁场阻断，请稍后刷新重试。';
    if (errStr.includes('503') || errStr.includes('demand') || errStr.includes('UNAVAILABLE')) {
      userMsg = '【星海尘埃】每日宇宙频段当前信号极其拥塞（503 载荷），我们正在采用低时延神谕通道。请多刷新或稍后重试。';
    }

    res.status(500).json({ 
      error: 'SERVER_ERROR', 
      message: userMsg,
      details: errStr
    });
  }
});

// Configure Vite integration for serve dev / dist in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  console.log(`[Server] Detected Environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        port: 3000,
        host: '0.0.0.0',
        hmr: false // Disable HMR as requested by general guidelines
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production files from dist
    app.use(express.static(path.join(currentDir, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(currentDir, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Live and running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
