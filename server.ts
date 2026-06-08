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
 * Helper to wrap any promise with a maximum timeout threshold.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeoutMs)
    )
  ]);
}

/**
 * Executes a Gemini request with automatic retry, strict timeout, and model fallback capability
 * to mitigate transient 503 high-demand errors.
 */
async function generateWithRetry(contents: any, config: any = {}) {
  // Try gemini-3.5-flash then fallback to gemini-3.1-flash-lite. Use short timeouts to prevent gateway timeout errors.
  const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    const timeoutThreshold = model === 'gemini-3.5-flash' ? 12000 : 10000;
    try {
      console.log(`[Server] Generating content using model: ${model} (Timeout: ${timeoutThreshold}ms)`);
      if (!ai) throw new Error('GEMINI_API_KEY_MISSING');
      
      const payload: any = {
        model,
        contents,
      };
      if (config && Object.keys(config).length > 0) {
        payload.config = config;
      }
      
      // Execute with a strict timeout wrapper
      const response = await withTimeout(
        ai.models.generateContent(payload),
        timeoutThreshold
      );
      console.log(`[Server] Content generated successfully with model: ${model}`);
      return response;
    } catch (err: any) {
      console.error(`[Server] Error on model ${model}:`, err);
      lastError = err;
      
      const errStr = String(err.message || err);
      const isTransient = errStr.includes('503') || 
                          errStr.includes('UNAVAILABLE') || 
                          errStr.includes('demand') || 
                          errStr.includes('timeout') || 
                          errStr.includes('limit') ||
                          errStr.includes('REQUEST_TIMEOUT') ||
                          err?.status === 503;
                          
      if (!isTransient) {
        throw err;
      }
      
      console.log(`[Server] Transient error or timeout on ${model}. Switching immediately to fallback model...`);
    }
  }
  
  throw lastError;
}

/**
 * Generates an extremely atmospheric, detailed, poetic, and professional offline interpretation
 * based on the card layout, question, and meanings.
 */
function generateLocalFallbackReading(type: string, spreadType: string, question: string, cards: any[]): string {
  const isTarot = type === 'tarot';
  const typeText = isTarot ? '经典韦特塔罗牌 (Tarot)' : '传统雷诺曼卡牌 (Lenormand)';
  const spreadText = spreadType === 'single' ? '单张牌核心觉察指引' : (isTarot ? '三位一体流变牌阵 (过去、现在、未来)' : '雷诺曼金之连线牌阵 (主题、动作、结果)');
  
  let md = `## 🏮 启明星轨 · 经典原萃全息解译 (Mystical Heritage Oracle Response)

由于当前星空中继网关 (Gemini API) 处于高请求拥塞状态（或受到偶发网络因素波及），为提供完美不中断的极佳体验，系统已自启动 **【经典原萃心流精解】** 算法为您进行能量对接。此解读融汇各大占卜经典流派之要旨，由系统本地神意库精细汇编而成，具有极高的点拨参考价值。

---

### 🍀 1. 🔍 牌阵星流磁场宏观总览
- **您所探查的求问主题**：\`${question || '未明示具体求问，探知当前整体宇宙声能场'}\`
- **所选法器与布局形态**：${typeText} — 【${spreadText}】

在您诚心叩问并切牌切入的这刻，时空的纠缠已在量子场下将您当下的神意凝结。整体牌面在无形中迸发出**【动静和融、伏虎藏龙】**的局势：
`;

  if (isTarot) {
    const hasReversed = cards.some(c => !c.isUpright);
    if (hasReversed) {
      md += `* **逆位波动预示**：牌面上出现了逆位磁场，这是命运极其温柔的低语。逆位绝非凶兆，而是代表着**部分流向遇到了内收性延宕、或暗示外界阻碍正在唤醒您的精神觉察**。此时“向内沉淀”远胜于“强力外求”。\n`;
    } else {
      md += `* **全正位气局显现**：全牌阵皆现正位充沛动力。这表明外部环境、天时走向与您内心的真实直觉呈现出难得的「和谐整步」状态。**当下是绝佳的前行和布局节点**，唯需记住戒骄戒傲。\n`;
    }
  } else {
    md += `* **现实机理映射**：雷诺曼卡牌象征着尘世现实具象关系、物质、人缘、或文书的动迁。此次牌阵的结合展现出**「局势正由隐秘萌芽转为显化流动」**的势能，您日常所关注的人或机遇正处于高速汇流之中。\n`;
  }

  md += `\n---

### ✨ 2. 🎴 占卜卡牌逐一透析\n\n`;

  cards.forEach((c: any, index: number) => {
    const keywordsStr = Array.isArray(c.keywords) ? c.keywords.join('、') : (c.keywords || '灵性指点');
    const posLabelText = c.positionLabel || `位置 ${index + 1}`;
    const orientationText = isTarot ? (c.isUpright ? '【正位 Upright】' : '【逆位 Reversed】') : '';
    
    md += `#### 🪔 卦位 [${posLabelText}] —— 【${c.name} (${c.nameEn})】 ${orientationText}
- **神意象征关键词**：\`${keywordsStr}\`
- **神秘学古义**：
  * ${c.name} 根植于西方神秘智慧体系，象征着宇宙特定元素（风、火、水、地）或本源力量在您周遭现实、情感或认知状态里的微妙共振。
- **给您的专属觉察提示**：
  * 该牌在此神圣位置映射出，您在寻求问题的 \`${posLabelText}\` 关卡上，有着不容忽视的能量重点。`;

    if (isTarot) {
      if (c.isUpright) {
        md += ` 处于顺畅流动中的正位能量极其蓬勃健康。它强烈鼓励您去积极释放 \`${keywordsStr}\` 相关的内在特质，大步流星、自信表达，天道酬勤。\n\n`;
      } else {
        md += ` 处于逆位说明此处的能量出现了一定的自我压抑、或由于急切而导致用力过猛。这说明此时该特质需要去进行「深呼吸式的修整」。不必气馁，请多反思，不失为一种智慧的防御和蓄力。\n\n`;
      }
    } else {
      md += ` 承载着极其高黏度的现实映射。此物候或境遇预示着您近日需在世俗事务中，敏锐捕捉与 \`${keywordsStr}\` 有关的关键讯息、人脉流动或者是合约机缘。\n\n`;
    }
  });

  md += `---

### 🔮 3. 🎯 终极神谕建议与日常修行手册
基于全盘能量的平衡与博弈，占卜导师为您悉心凝练出如下三条立竿见影的“星海行舟指南”：

1. **【正念锚定，静待潮起】**：
   在事情尚未显山露水前，盲目施力只会徒增内耗。牌面上重点的 \`${cards[0]?.keywords?.[0] || '直觉'}\` 力量告诉您：保持极佳的底限耐心，以退为进，是守卫本心正气的最大筹码。
2. **【抓住切片，以点破面】**：
   卡牌建议在解决当前主题问题时，优先推进与 \`${cards[0]?.keywords?.[1] || '沉稳'}\` 的第一要务。一旦这一局部能量理顺，整体气流将呈现多米诺式的好转。
3. **【顺应本心，本自具足】**：
   所有的卡牌神谕仅是投射在命运之湖上的一抹月影，真正的引航人永远只有此时此刻站在分岔路口上的您。相信您内在的觉知具有强大的澄澈性。

*愿此轮纯粹解译如幽兰之香，指引您平稳度过重重考验，抵达丰盛之岸。*`;

  return md;
}

/**
 * Generates beautiful, poetry-style offline cosmic daily guidance fallback.
 */
function generateLocalFallbackGuidance(cardType: string, cardName: string, cardNameEn: string, isUpright: boolean, dateStr: string): string {
  const isTarot = cardType === 'tarot';
  let guidance = `✨ 【宇宙之窗 · 每日星回音】 ✨\n\n`;
  guidance += `【当前日期】：${dateStr || '今天'}\n`;
  guidance += `【抽得今日神圣卡牌】：【${cardName} (${cardNameEn})】${isTarot ? (isUpright ? ' (正位)' : ' (逆位)') : ''}\n\n`;
  
  guidance += `当微光拨开星云，这股温暖沉实的能量正落入您的心田。今天，宇宙特向您传来轻声叮咛：\n`;
  if (isTarot) {
    if (isUpright) {
      guidance += `一粒神圣的种子正在您身边的当下处境里发芽。请顺从这股自然健康的向阳上升之力，不要怀疑自己，像今天抽里的卡牌一样去精进、探索和发散您的蓬勃才具。元气满满地开启您的清晨。`;
    } else {
      guidance += `今天是一个温和的内收修整期。将向外寻找答案的急切放低，多给自己一盏茶或闭目静心的契机。慢下来是为了更安全更持久地释放，多听听内心的回音，宇宙正为您悄然守卫着宁静。`;
    }
  } else {
    guidance += `关注现实世界中发生的新连接。新讯息、新动态或一个温暖的碰面，都在不经意间在为您铺陈崭新的转折气局。坚定而从容地迈出今天的第一步吧！`;
  }
  
  return guidance;
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
现有一位寻求指引的用户进行了在线占卜抽牌，请求你结合所抽中卡牌的神秘力量、能量流向与彼此之间的相位关系，提供客观、深刻、治愈且充满行动建议 of 占卜释疑。

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
    console.error('Gemini API Error details:', error);
    const errStr = String(error.message || error);
    
    if (errStr.includes('GEMINI_API_KEY_MISSING') || errStr.includes('API_KEY_MISSING') || errStr.includes('INVALID_ARGUMENT')) {
      return res.status(403).json({ 
        error: 'GEMINI_API_KEY_MISSING',
        message: '当前尚未配置 GEMINI_API_KEY 密钥。请在 AI Studio 设置 -> Secrets 面板配置密钥。' 
      });
    }

    // Attempting fully elegant local synthesis fallback transparently
    console.log('[Server] API congestion or exception detected. Rolling back safely with beautiful local fallback reading.');
    try {
      const { type, spreadType, question, cards } = req.body;
      const fallbackText = generateLocalFallbackReading(type, spreadType, question, cards);
      
      // Send fallback reading successfully under 200 OK
      return res.json({ 
        text: fallbackText,
        isOfflineFallback: true
      });
    } catch (fallbackError: any) {
      console.error('Failed to generate local synthesis fallback:', fallbackError);
      return res.status(500).json({ 
        error: 'SERVER_ERROR', 
        message: '由于后台服务重载且本地算法激活干扰，请稍后刷新重试。',
        details: errStr
      });
    }
  }
});

// API Route for Daily Guidance (Card of the Day)
app.post('/api/divination/daily-guidance', async (req, res) => {
  const { cardType, cardName, cardNameEn, isUpright, dateStr } = req.body;
  try {
    if (!ai) {
      return res.status(403).json({ 
        error: 'GEMINI_API_KEY_MISSING',
        message: '当前尚未配置 GEMINI_API_KEY 密钥。' 
      });
    }
    
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
    console.error('Daily Guidance Error details:', error);
    const errStr = String(error.message || error);
    
    if (errStr.includes('GEMINI_API_KEY_MISSING') || errStr.includes('API_KEY_MISSING')) {
      return res.status(403).json({ 
        error: 'GEMINI_API_KEY_MISSING',
        message: '当前尚未配置 GEMINI_API_KEY 密钥。' 
      });
    }

    // Daily guidance local fallback
    console.log('[Server] API error detected on daily guidance. Generating local fallback guidance.');
    try {
      const guidanceFallback = generateLocalFallbackGuidance(cardType, cardName, cardNameEn, isUpright, dateStr);
      return res.json({ 
        guidance: guidanceFallback,
        isOfflineFallback: true
      });
    } catch (fallbackError) {
      console.error('Failed to generate local guidance fallback:', fallbackError);
      return res.status(500).json({ 
        error: 'SERVER_ERROR', 
        message: '生成每日星示时被神秘磁场阻断，请稍后刷新重试。',
        details: errStr
      });
    }
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
