import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-server-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url) return next();

            if (req.url.startsWith('/api/divination/interpret') || (req.url.startsWith('/api/divination') && !req.url.startsWith('/api/divination/daily-guidance'))) {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                return res.end(JSON.stringify({ error: 'Method not allowed' }));
              }

              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { type, spreadType, question, cards } = JSON.parse(body);
                  const key = process.env.GEMINI_API_KEY;
                  if (!key) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({ error: 'GEMINI_API_KEY environment variable is required by the server.' }));
                  }

                  const ai = new GoogleGenAI({
                    apiKey: key,
                    httpOptions: {
                      headers: {
                        'User-Agent': 'aistudio-build',
                      }
                    }
                  });

                  const systemInstruction = 
                    "你是一位精通韦特经典塔罗与雷诺曼卡牌体系的资深神秘学大占卜师（Master Divinator）。 " +
                    "你的解牌语带有人生哲理与温度，用温和而神秘的文字解开问卜者的困惑，拒绝干瘪枯燥的教条，" +
                    "擅长结合对方的具体诉求将各卡牌的本色无缝编织成绝妙的、流于纸面的心灵能量流动故事。";

                  let prompt = `【占卜系统】: ${type === 'tarot' ? '塔罗牌 (Tarot)' : '雷诺曼 (Lenormand)'}\n`;
                  prompt += `【牌阵模式】: ${spreadType === 'single' ? '单张日常启示' : '三张时空能量流转阵'}\n`;
                  if (question) {
                    prompt += `【问卜者的问题/愿望】: "${question}"\n`;
                  } else {
                    prompt += `【问卜者的问题/愿望】: 未提供具体问题（寻求普适心灵启迪和指引）\n`;
                  }
                  prompt += `\n【抽取的牌面信息】:\n`;

                  cards.forEach((item: any, idx: number) => {
                    prompt += `${idx + 1}. [${item.positionLabel}] - Card: ${item.name} (${item.nameEn})`;
                    if (type === 'tarot') {
                      prompt += ` - Orientation: ${item.isUpright ? '正位 (Upright)' : '逆位 (Reversed)'}`;
                    }
                    prompt += `\n`;
                  });

                  prompt += `\n请针对以上卡牌组合，进行深刻、生动、且富有心灵启示的分析解读：\n`;
                  prompt += `1. **各个卡牌的个性化剖析**: 用华丽温存的语言深入阐述各卡牌在对应的位置上所代表的具体生活能量与心智意向（结合问卜者的具体困惑深度定制，不要照本宣科）。\n`;
                  prompt += `2. **融会贯通的牌阵总论**: 分析卡牌之间的关联、能量的流动或传承，得出命运画卷的有机故事和未来启示。给出切实笃行的心灵建议，带给问卜者无限信心与能量。\n`;
                  prompt += `\n请用丰富而整洁的 Markdown 格式输出。`;

                  const response = await ai.models.generateContent({
                    model: 'gemini-3.5-flash',
                    contents: prompt,
                    config: {
                      systemInstruction,
                      temperature: 0.9,
                    }
                  });

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    text: response.text || "无法生成解读。",
                    interpretation: response.text || "无法生成解读。" 
                  }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Error executing Gemini prompt' }));
                }
              });
              return;
            }

            if (req.url.startsWith('/api/divination/daily-guidance')) {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                return res.end(JSON.stringify({ error: 'Method not allowed' }));
              }

              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { cardType, cardName, cardNameEn, isUpright, dateStr } = JSON.parse(body);
                  const key = process.env.GEMINI_API_KEY;
                  if (!key) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({ error: 'GEMINI_API_KEY key is missing.' }));
                  }

                  const ai = new GoogleGenAI({
                    apiKey: key,
                    httpOptions: {
                      headers: {
                        'User-Agent': 'aistudio-build',
                      }
                    }
                  });

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

                  const response = await ai.models.generateContent({
                    model: 'gemini-3.5-flash',
                    contents: prompt,
                    config: {
                      systemInstruction,
                      temperature: 1.0,
                    }
                  });

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ guidance: response.text || "愿今天充满阳光。" }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Error processing speech recommendation' }));
                }
              });
              return;
            }

            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
