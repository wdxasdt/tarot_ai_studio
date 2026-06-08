import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  History, 
  Shuffle, 
  Info, 
  Lock, 
  RefreshCw, 
  Heart, 
  Briefcase, 
  Coins, 
  Activity, 
  Eye, 
  Trash2, 
  CheckCircle, 
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';

import { 
  DivinationType, 
  TarotSpreadType, 
  LenormandSpreadType, 
  TarotCard, 
  LenormandCard, 
  TarotDrawResult, 
  LenormandDrawResult, 
  DivinationHistoryRecord 
} from './types';
import { getTarotDeck } from './data/tarotData';
import { lenormandDeck } from './data/lenormandData';
import CardGraphic from './components/CardGraphic';
import { getDailyTarotCard, getDailyLenormandCard } from './utils/divination';

export default function App() {
  // Navigation / Page mode states
  const [activeTab, setActiveTab] = useState<'draw' | 'library' | 'history'>('draw');
  
  // Customization selection states
  const [divinationType, setDivinationType] = useState<DivinationType>('tarot');
  const [tarotSpread, setTarotSpread] = useState<TarotSpreadType>('three');
  const [lenormandSpread, setLenormandSpread] = useState<LenormandSpreadType>('three');
  const [userInputQuestion, setUserInputQuestion] = useState<string>('');
  
  // Dynamic shuffle and card selection states
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  
  // Active draw results
  const [tarotResult, setTarotResult] = useState<TarotDrawResult[]>([]);
  const [lenormandResult, setLenormandResult] = useState<LenormandDrawResult[]>([]);
  const [localSynthesisAdvice, setLocalSynthesisAdvice] = useState<string>('');

  // AI Interpretation states
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<{ code: string; message: string } | null>(null);

  // History state
  const [historyRecords, setHistoryRecords] = useState<DivinationHistoryRecord[]>([]);

  // Card library browsing states
  const [libSearchQuery, setLibSearchQuery] = useState<string>('');
  const [libSelectedCardId, setLibSelectedCardId] = useState<string | null>(null);
  const [libCardTypeFilter, setLibCardTypeFilter] = useState<'all' | 'major' | 'minor'>('all');

  // Card of the Day states
  const [dailyCardLoading, setDailyCardLoading] = useState<boolean>(false);
  const [dailyGuidanceText, setDailyGuidanceText] = useState<string>('');
  const [dailyGuidanceError, setDailyGuidanceError] = useState<string | null>(null);

  const todayStr = React.useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  }, []);

  const todayDailyTarot = React.useMemo(() => {
    try {
      return getDailyTarotCard(todayStr);
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [todayStr]);

  const todayDailyLenormand = React.useMemo(() => {
    try {
      return getDailyLenormandCard(todayStr);
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [todayStr]);

  // Load Card of the Day Guidance from backend
  useEffect(() => {
    let active = true;
    const fetchDailyGuidance = async () => {
      setDailyCardLoading(true);
      setDailyGuidanceError(null);
      setDailyGuidanceText('');

      const card = divinationType === 'tarot' ? todayDailyTarot : todayDailyLenormand;
      if (!card) {
        setDailyCardLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/divination/daily-guidance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardType: divinationType,
            cardName: card.card.name,
            cardNameEn: card.card.nameEn,
            isUpright: (card as TarotDrawResult).isUpright ?? true,
            dateStr: todayStr
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || data.error || '无法获取今日神谕');
        }

        if (active) {
          setDailyGuidanceText(data.guidance);
        }
      } catch (err: any) {
        console.error('Fetch daily guidance error:', err);
        if (active) {
          setDailyGuidanceError(err.message === 'GEMINI_API_KEY_MISSING' ? 'KEY_MISSING' : 'ERR');
          // Fallback guidance based on card
          if (divinationType === 'tarot' && todayDailyTarot) {
            const tr = todayDailyTarot;
            setDailyGuidanceText(`今日宇宙寄语：天将拂晓，您抽到了【${tr.card.name} (${tr.isUpright ? '正位' : '逆位'})】。核心象征「${tr.isUpright ? tr.card.keywordsUpright.slice(0, 3).join('/') : tr.card.keywordsReversed.slice(0, 3).join('/')}」。今天宜平顺内心、以和善和沉潜姿态前行，静待机缘成熟。`);
          } else if (divinationType === 'lenormand' && todayDailyLenormand) {
            const lr = todayDailyLenormand;
            setDailyGuidanceText(`今日法国沙龙神谕：晨熙照身，您抽到了【${lr.card.name}】。核心象征「${lr.card.keywords.slice(0, 3).join('/')}」。今天请注意身边的小细微变化，真诚的情谊和明确的行动力将指引您跨越一切隔阂。`);
          }
        }
      } finally {
        if (active) {
          setDailyCardLoading(false);
        }
      }
    };

    fetchDailyGuidance();
    return () => {
      active = false;
    };
  }, [divinationType, todayStr, todayDailyTarot, todayDailyLenormand]);

  // Load decks
  const tarotDeck = React.useMemo(() => getTarotDeck(), []);
  const lenormandCardsDeck = React.useMemo(() => lenormandDeck, []);

  // Initialize history from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('divination_system_history');
      if (stored) {
        setHistoryRecords(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to LocalStorage helper
  const saveRecordToHistory = (record: DivinationHistoryRecord) => {
    const updated = [record, ...historyRecords].slice(0, 100); // Limit to 100 records
    setHistoryRecords(updated);
    try {
      localStorage.setItem('divination_system_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  };

  // Secure Fisher-Yates Shuffle using crypto.getRandomValues
  const performSecureShuffle = <T,>(array: T[]): T[] => {
    const list = [...array];
    const size = list.length;
    // Create random uint32 buffer
    const randomBuffer = new Uint32Array(size);
    window.crypto.getRandomValues(randomBuffer);

    for (let i = size - 1; i > 0; i--) {
      // safe modulo boundary to index i + 1
      const randIdx = randomBuffer[i] % (i + 1);
      const temp = list[i];
      list[i] = list[randIdx];
      list[randIdx] = temp;
    }
    return list;
  };

  // Upright / Reversed probability determiner (50/50)
  const determineUpright = (): boolean => {
    const byteBuffer = new Uint8Array(1);
    window.crypto.getRandomValues(byteBuffer);
    return (byteBuffer[0] % 2) === 0;
  };

  // Start Shuffle & Draw sequence
  const startDivinationSetup = () => {
    setIsShuffling(true);
    setHasDrawn(false);
    setRevealedIndices([]);
    setAiResponse(null);
    setAiError(null);

    setTimeout(() => {
      if (divinationType === 'tarot') {
        const shuffledTarot = performSecureShuffle<TarotCard>(tarotDeck);
        const count = tarotSpread === 'single' ? 1 : 3;
        const results: TarotDrawResult[] = [];
        
        for (let i = 0; i < count; i++) {
          const isUpright = determineUpright();
          let posLabel = "指引";
          if (tarotSpread === 'three') {
            if (i === 0) posLabel = "过去 (Past)";
            if (i === 1) posLabel = "现在 (Present)";
            if (i === 2) posLabel = "未来 (Future)";
          }
          results.push({
            card: shuffledTarot[i],
            isUpright: isUpright,
            positionLabel: posLabel
          });
        }
        setTarotResult(results);
        setLenormandResult([]);
        
        // Generate a detailed local offline synthesis advice based on drawn cards
        const advice = generateLocalTarotSynthesis(results, userInputQuestion);
        setLocalSynthesisAdvice(advice);

        // Auto log to local history
        const recordId = 'draw_' + Date.now();
        const record: DivinationHistoryRecord = {
          id: recordId,
          timestamp: Date.now(),
          type: 'tarot',
          spreadType: tarotSpread,
          question: userInputQuestion || undefined,
          tarotResult: results,
          overallInterpretation: advice
        };
        saveRecordToHistory(record);

      } else {
        const shuffledLen = performSecureShuffle<LenormandCard>(lenormandCardsDeck);
        const count = lenormandSpread === 'single' ? 1 : 3;
        const results: LenormandDrawResult[] = [];

        for (let i = 0; i < count; i++) {
          let posLabel = "指引";
          if (lenormandSpread === 'three') {
            if (i === 0) posLabel = "主题 (Subject)";
            if (i === 1) posLabel = "动作 (Action)";
            if (i === 2) posLabel = "结果 (Result)";
          }
          results.push({
            card: shuffledLen[i],
            positionLabel: posLabel
          });
        }
        setLenormandResult(results);
        setTarotResult([]);

        // Generate detailed local offline synthesis advice for Lenormand combined keywords
        const advice = generateLocalLenormandSynthesis(results, userInputQuestion);
        setLocalSynthesisAdvice(advice);

        // Auto log to local history
        const recordId = 'draw_' + Date.now();
        const record: DivinationHistoryRecord = {
          id: recordId,
          timestamp: Date.now(),
          type: 'lenormand',
          spreadType: lenormandSpread,
          question: userInputQuestion || undefined,
          lenormandResult: results,
          overallInterpretation: advice
        };
        saveRecordToHistory(record);
      }

      setIsShuffling(false);
      setHasDrawn(true);
      // Auto reveal first card to start the ceremony
      setRevealedIndices([0]);
    }, 1200); // 1.2s mystical shuffle phase
  };

  // Flip index triggers
  const revealCardIdx = (index: number) => {
    if (!revealedIndices.includes(index)) {
      setRevealedIndices([...revealedIndices, index]);
    }
  };

  const revealAllCards = () => {
    const indices = divinationType === 'tarot' 
      ? (tarotSpread === 'single' ? [0] : [0, 1, 2])
      : (lenormandSpread === 'single' ? [0] : [0, 1, 2]);
    setRevealedIndices(indices);
  };

  // AI Divination call to Server-side Express API
  const requestAIServerReading = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    const activeCards = divinationType === 'tarot'
      ? tarotResult.map(r => ({
          name: r.card.name,
          nameEn: r.card.nameEn,
          isUpright: r.isUpright,
          positionLabel: r.positionLabel,
          keywords: r.isUpright ? r.card.keywordsUpright : r.card.keywordsReversed
        }))
      : lenormandResult.map(r => ({
          name: r.card.name,
          nameEn: r.card.nameEn,
          positionLabel: r.positionLabel,
          keywords: r.card.keywords
        }));

    try {
      const resp = await fetch('/api/divination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: divinationType,
          spreadType: divinationType === 'tarot' ? tarotSpread : lenormandSpread,
          question: userInputQuestion,
          cards: activeCards
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || data.error || '联机占卜失败');
      }

      setAiResponse(data.text);
      
      // Update historical record with the customized AI insights
      if (historyRecords.length > 0) {
        const latest = { ...historyRecords[0] };
        latest.overallInterpretation = (latest.overallInterpretation || '') + "\n\n=== 🏮 高能 AI 专属圣谕解读 ===\n\n" + data.text;
        const updated = [latest, ...historyRecords.slice(1)];
        setHistoryRecords(updated);
        localStorage.setItem('divination_system_history', JSON.stringify(updated));
      }

    } catch (err: any) {
      console.error('Request AI error:', err);
      setAiError({
        code: err.message === 'GEMINI_API_KEY_MISSING' ? 'KEY_MISSING' : 'SERVER_ERROR',
        message: err.message || '由于连接中断，AI 神谕无法顺利显现。请查看配置。'
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Clean current state to shuffle again
  const resetDrawCanvas = () => {
    setHasDrawn(false);
    setRevealedIndices([]);
    setTarotResult([]);
    setLenormandResult([]);
    setLocalSynthesisAdvice('');
    setAiResponse(null);
    setAiError(null);
    setUserInputQuestion('');
  };

  // Delete a history record
  const deleteHistoryId = (id: string) => {
    const updated = historyRecords.filter(r => r.id !== id);
    setHistoryRecords(updated);
    try {
      localStorage.setItem('divination_system_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update history', e);
    }
  };

  // Load a historical record back into the viewport for study
  const loadHistoryRecord = (record: DivinationHistoryRecord) => {
    setDivinationType(record.type);
    if (record.type === 'tarot' && record.tarotResult) {
      setTarotSpread(record.spreadType as TarotSpreadType);
      setTarotResult(record.tarotResult);
      setLenormandResult([]);
      setRevealedIndices(record.tarotResult.map((_, i) => i));
    } else if (record.type === 'lenormand' && record.lenormandResult) {
      setLenormandSpread(record.spreadType as LenormandSpreadType);
      setLenormandResult(record.lenormandResult);
      setTarotResult([]);
      setRevealedIndices(record.lenormandResult.map((_, i) => i));
    }
    setLocalSynthesisAdvice(record.overallInterpretation || '');
    setUserInputQuestion(record.question || '');
    setHasDrawn(true);
    setAiResponse(null);
    setAiError(null);
    setActiveTab('draw');
  };

  // Dynamic local synthesized analyzer for Tarot spreads
  const generateLocalTarotSynthesis = (results: TarotDrawResult[], question: string): string => {
    if (results.length === 1) {
      const r = results[0];
      const stateStr = r.isUpright ? "正位" : "逆位";
      const kw = r.isUpright ? r.card.keywordsUpright.join('/') : r.card.keywordsReversed.join('/');
      return `【单牌圣启】您抽取了大阿尔卡纳的 【${r.card.name}（${stateStr}）】。
核心能量体现为「${kw}」。这表明当前在您所询向的这一时空的课题里，最根本的力量源头正在提示您要学会倾听它的内在声音。
健康建议：保持作息自律；情感提倡互利沟通，切忌用情绪过度试探底线。`;
    }

    // Three card spread analyzer
    const c1 = results[0];
    const c2 = results[1];
    const c3 = results[2];

    const up1 = c1.isUpright ? "正位" : "逆位";
    const up2 = c2.isUpright ? "正位" : "逆位";
    const up3 = c3.isUpright ? "正位" : "逆位";

    return `【三牌流向分析】
- 过去因缘：您在过往阶段经历或受到了 【${c1.card.name}（${up1}）】 的能量塑造，奠定了当前的课题基础。
- 现状考验：当下主要受到 【${c2.card.name}（${up2}）】 的正面洗礼或逆阻考验，这要求您在此时此地集中精力克制盲目的冲动。
- 未来走势：若能合理消化当下的教训，未来将由 【${c3.card.name}（${up3}）】 的宇宙秩序接管并引导未来的前途。

【牌阵汇聚忠告】：
这是一套能量流动非常鲜明的牌阵组合。从过往的 ${c1.card.name} 的塑造，到目前的 ${c2.card.name} 的转化，您正在经历内在深层价值观的重构。${c3.card.name} 昭示了只要您能平衡自律与信念，就能获得水到渠成的良性回归。理智面对眼下的阻隔，时间正在协助您。`;
  };

  // Dynamic local synthesized analyzer for Lenormand spreads
  const generateLocalLenormandSynthesis = (results: LenormandDrawResult[], question: string): string => {
    if (results.length === 1) {
      const r = results[0];
      return `【雷诺曼神谕】您抽中了具有核心象征意义的第 ${r.card.number} 号占卜牌 【${r.card.name}（${r.card.nameEn}）】。
核心关键词为：${r.card.keywords.join('、')}。
此牌提示：当前处境需要直接并诚恳地面对。${r.card.interpretation.general} ${r.card.interpretation.combinationTips || ''}`;
    }

    const c1 = results[0];
    const c2 = results[1];
    const c3 = results[2];

    // Simple combinations checker for extremely smart responses
    let combAdvice = "在雷诺曼的释牌哲学中，“相邻牌”能碰撞出极强的修饰和动宾逻辑：";
    
    // Check specific nice pairings
    const numbersInPlay = results.map(r => r.card.number);
    if (numbersInPlay.includes(24) && numbersInPlay.includes(31)) {
      combAdvice += "【红桃心 + 太阳】：天作之合的大吉兆！代表爱意灿烂、生命力井喷与广受亲友见证的光明成就。";
    } else if (numbersInPlay.includes(8) || numbersInPlay.includes(21)) {
      combAdvice += "【冷山与棺木的试炼】：阵列中包含阻碍沉重卡死的卡牌。目前代表事态发展遭遇了显著耽延，这在提醒您不宜贸进，静养底层根须。";
    } else {
      combAdvice += `【${c1.card.name}】代表当下的主体人事物，被第二张行动牌【${c2.card.name}】所承接并转化，最终归结于【${c3.card.name}】指示的必然结果。`;
    }

    return `【雷诺曼三牌叙事解读】
- 主题核心：【${c1.card.name} (${c1.card.nameEn})】 - 核心词：${c1.card.keywords.slice(0,2).join('/')}
- 精修动作：【${c2.card.name} (${c2.card.nameEn})】 - 核心词：${c2.card.keywords.slice(0,2).join('/')}
- 最终收束：【${c3.card.name} (${c3.card.nameEn})】 - 核心词：${c3.card.keywords.slice(0,2).join('/')}

【牌阵相邻关系】：
${combAdvice}
整体来看，本次占卜预示着一连串具有明确连贯因果的发展线索。注重细节与人际往来信用的互惠，能最大程度化解潜在的风阻阴影。`;
  };

  // General Filter for card library
  const libFilteredCards = React.useMemo(() => {
    const normalized = libSearchQuery.trim().toLowerCase();
    if (divinationType === 'tarot') {
      let base = tarotDeck;
      if (libCardTypeFilter === 'major') {
        base = base.filter(c => c.type === 'major');
      } else if (libCardTypeFilter === 'minor') {
        base = base.filter(c => c.type === 'minor');
      }
      if (!normalized) return base;
      return base.filter(c => 
        c.name.includes(normalized) || 
        c.nameEn.toLowerCase().includes(normalized) ||
        (c.suit && c.suit.includes(normalized)) ||
        c.keywordsUpright.some(k => k.includes(normalized))
      );
    } else {
      // Lenormand search
      if (!normalized) return lenormandCardsDeck;
      return lenormandCardsDeck.filter(c => 
        c.name.includes(normalized) || 
        c.nameEn.toLowerCase().includes(normalized) ||
        c.keywords.some(k => k.includes(normalized))
      );
    }
  }, [divinationType, libSearchQuery, libCardTypeFilter, tarotDeck, lenormandCardsDeck]);

  // Selected library card details
  const currentLibCard = React.useMemo(() => {
    if (!libSelectedCardId) return null;
    if (divinationType === 'tarot') {
      return tarotDeck.find(c => c.id === libSelectedCardId) || null;
    } else {
      return lenormandCardsDeck.find(c => c.id === libSelectedCardId) || null;
    }
  }, [libSelectedCardId, divinationType, tarotDeck, lenormandCardsDeck]);

  // Auto-set the first card in library when list changes
  useEffect(() => {
    if (libFilteredCards.length > 0) {
      setLibSelectedCardId(libFilteredCards[0].id);
    } else {
      setLibSelectedCardId(null);
    }
  }, [libFilteredCards]);

  return (
    <div id="container-root" className="w-full min-h-screen bg-[#0c0c0c] text-stone-200 font-serif flex flex-col md:flex-row overflow-auto md:overflow-hidden border-4 md:border-8 border-[#1a1a1a]">
      
      {/* 1. Sidebar Panel (Aesthetic controls matching Geometric Balance theme) */}
      <aside id="sidebar-panel" className="w-full md:w-80 border-b md:border-b-0 md:border-r border-stone-800 flex flex-col p-6 bg-black/40 shrink-0">
        
        {/* Brand Banner with rotational geometry */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#c5a059] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(197,160,89,0.2)] animate-spin-slow">
            <div className="w-4 h-4 bg-[#c5a059] rotate-45"></div>
          </div>
          <div>
            <h1 className="text-lg tracking-widest uppercase font-light text-[#c5a059]">塔罗与雷诺曼</h1>
            <p className="text-[9px] tracking-[0.25em] text-stone-500 uppercase font-sans">Aether of Equilibrium</p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="mb-6 grid grid-cols-3 gap-1 bg-stone-900/50 p-1 rounded border border-stone-800">
          <button 
            id="tab-draw-btn"
            onClick={() => setActiveTab('draw')} 
            className={`py-1.5 px-1 text-xs text-center rounded transition-all duration-300 ${activeTab === 'draw' ? 'bg-[#c5a059] text-[#0c0c0c] font-semibold' : 'text-stone-400 hover:text-stone-100'}`}
          >
            占卜仪式
          </button>
          <button 
            id="tab-library-btn"
            onClick={() => setActiveTab('library')} 
            className={`py-1.5 px-1 text-xs text-center rounded transition-all duration-300 ${activeTab === 'library' ? 'bg-[#c5a059] text-[#0c0c0c] font-semibold' : 'text-stone-400 hover:text-stone-100'}`}
          >
            本派典籍
          </button>
          <button 
            id="tab-history-btn"
            onClick={() => setActiveTab('history')} 
            className={`py-1.5 px-1 text-xs text-center rounded transition-all duration-300 ${activeTab === 'history' ? 'bg-[#c5a059] text-[#0c0c0c] font-semibold' : 'text-stone-400 hover:text-stone-100'}`}
          >
            历史记录
          </button>
        </div>

        {/* Configuration Segment (only visible or active primarily for setting up a draw) */}
        <div className="space-y-6 flex-grow">
          
          {/* Card system selection */}
          <div className="space-y-2">
            <label className="text-[10px] text-stone-500 uppercase tracking-widest border-b border-stone-800 pb-1 flex justify-between">
              <span>占卜体系 / System</span>
              {activeTab !== 'draw' && <span className="text-[8px] text-[#c5a059]">(仅浏览)</span>}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="system-tarot-toggle"
                onClick={() => {
                  setDivinationType('tarot');
                  if (activeTab === 'draw') resetDrawCanvas();
                }}
                className={`py-2 px-3 text-xs rounded text-left border ${divinationType === 'tarot' ? 'border-[#c5a059] bg-stone-900 text-stone-100' : 'border-stone-800 text-stone-500 hover:text-stone-300'}`}
              >
                <div className="font-semibold text-stone-200">韦特塔罗牌</div>
                <div className="text-[9px] text-[#c5a059] mt-0.5">78张 元素正逆</div>
              </button>
              <button
                id="system-lenormand-toggle"
                onClick={() => {
                  setDivinationType('lenormand');
                  if (activeTab === 'draw') resetDrawCanvas();
                }}
                className={`py-2 px-3 text-xs rounded text-left border ${divinationType === 'lenormand' ? 'border-[#c5a059] bg-stone-900 text-stone-100' : 'border-stone-800 text-stone-500 hover:text-stone-300'}`}
              >
                <div className="font-semibold text-stone-200">雷诺曼神谕</div>
                <div className="text-[9px] text-[#c5a059] mt-0.5">36张 组合关联</div>
              </button>
            </div>
          </div>

          {activeTab === 'draw' && (
            <>
              {/* Spread choice segment */}
              <div className="space-y-2">
                <label className="text-[10px] text-stone-500 uppercase tracking-widest border-b border-stone-800 pb-1 block">
                  牌阵模型 / Spread
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="spread-single-toggle"
                    onClick={() => {
                      if (divinationType === 'tarot') setTarotSpread('single');
                      else setLenormandSpread('single');
                      resetDrawCanvas();
                    }}
                    className={`py-1.5 px-3 text-xs rounded text-center border ${
                      (divinationType === 'tarot' && tarotSpread === 'single') || (divinationType === 'lenormand' && lenormandSpread === 'single')
                        ? 'border-[#c5a059]/80 bg-stone-900/80 text-[#c5a059]'
                        : 'border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    单张核心指引
                  </button>
                  <button
                    id="spread-three-toggle"
                    onClick={() => {
                      if (divinationType === 'tarot') setTarotSpread('three');
                      else setLenormandSpread('three');
                      resetDrawCanvas();
                    }}
                    className={`py-1.5 px-3 text-xs rounded text-center border ${
                      (divinationType === 'tarot' && tarotSpread === 'three') || (divinationType === 'lenormand' && lenormandSpread === 'three')
                        ? 'border-[#c5a059]/80 bg-stone-900/80 text-[#c5a059]'
                        : 'border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    经典三张流向
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 italic">
                  {divinationType === 'tarot' 
                    ? (tarotSpread === 'single' ? "适合快速解析今日运势或当前单一症结课题" : "解读「过去因缘 - 当前状态 - 未来启迪」时间流")
                    : (lenormandSpread === 'single' ? "适合获取极简利落、切中要害的直接答案" : "构建「核心主题 - 动因修饰 - 能量结果」关联法")}
                </p>
              </div>

              {/* Questionnaire textbox */}
              <div className="space-y-2">
                <label className="text-[10px] text-stone-500 uppercase tracking-widest border-b border-stone-800 pb-1 flex justify-between">
                  <span>倾诉愿景与提问 (选填)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-stone-500 hover:text-stone-300 cursor-pointer" title="输入具体提问能使AI解读更加贴合您的真实需求" />
                </label>
                <textarea
                  id="question-input-box"
                  value={userInputQuestion}
                  onChange={(e) => setUserInputQuestion(e.target.value)}
                  placeholder="如：今年下半年我的事业投资运势如何？或者：我与伴侣近期的沟通阻碍如何化解？"
                  maxLength={150}
                  className="w-full h-20 bg-stone-900/60 border border-stone-800 rounded p-2 text-xs text-stone-200 focus:outline-none focus:border-[#c5a059] transition-all resize-none placeholder-stone-600 font-sans"
                />
                <div className="text-[9px] text-stone-500 text-right font-sans">
                  已输入 {userInputQuestion.length}/150 字
                </div>
              </div>
            </>
          )}

          {activeTab === 'library' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-stone-500 uppercase tracking-widest border-b border-stone-800 pb-1 block">
                  文献检索 / Search
                </label>
                <input
                  type="text"
                  value={libSearchQuery}
                  onChange={(e) => setLibSearchQuery(e.target.value)}
                  placeholder="搜索牌名、英文、关键词..."
                  className="w-full bg-stone-900/85 border border-stone-850 rounded py-1.5 px-3 text-xs text-stone-200 focus:outline-none focus:border-[#c5a059] placeholder-stone-600"
                />
              </div>

              {divinationType === 'tarot' && (
                <div className="space-y-2">
                  <label className="text-[10px] text-stone-500 uppercase tracking-widest block">
                    阿尔卡纳分类
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['all', 'major', 'minor'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setLibCardTypeFilter(filter)}
                        className={`py-1 text-[10px] rounded border ${
                          libCardTypeFilter === filter 
                            ? 'border-[#c5a059]/60 bg-stone-900 text-[#c5a059]' 
                            : 'border-stone-800 text-stone-500'
                        }`}
                      >
                        {filter === 'all' ? '全部' : filter === 'major' ? '大阿' : '小阿'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <p className="text-[10px] text-stone-500 leading-relaxed italic border-b border-stone-800 pb-2">
                本地存储您最近抽牌占卜的历史卷轴（上限100条），可随时点击重新加载并仔细研读。
              </p>
              {historyRecords.length === 0 ? (
                <div className="text-center py-6 text-xs text-stone-600">
                  尚无历史因缘记录
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {historyRecords.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="p-2 border border-stone-850 hover:border-stone-700 bg-stone-900/35 rounded flex flex-col gap-1 transition-all"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#c5a059] font-sans">
                          {rec.type === 'tarot' ? '韦特塔罗 · ' : '雷诺曼 · '}
                          {rec.spreadType === 'single' ? '单牌' : '三张'}
                        </span>
                        <span className="text-stone-500 font-sans">
                          {new Date(rec.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {rec.question && (
                        <p className="text-[10px] text-stone-300 truncate italic">
                          “{rec.question}”
                        </p>
                      )}

                      <div className="flex gap-1 overflow-x-auto py-1">
                        {rec.type === 'tarot' && rec.tarotResult?.map((tr, idx) => (
                          <span key={idx} className="text-[9px] bg-stone-800 px-1 py-0.5 rounded text-stone-400 shrink-0">
                            {tr.card.name} ({tr.isUpright ? '正' : '逆'})
                          </span>
                        ))}
                        {rec.type === 'lenormand' && rec.lenormandResult?.map((lr, idx) => (
                          <span key={idx} className="text-[9px] bg-stone-800 px-1 py-0.5 rounded text-stone-400 shrink-0">
                            {lr.card.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 mt-1 border-t border-stone-900 pt-1">
                        <button 
                          onClick={() => deleteHistoryId(rec.id)}
                          className="text-stone-500 hover:text-red-400 text-[10px]"
                        >
                          <Trash2 className="w-3 h-3 inline mr-0.5" />
                          删除
                        </button>
                        <button 
                          onClick={() => loadHistoryRecord(rec)}
                          className="text-[#c5a059] hover:text-[#e0b561] text-[10px] font-semibold"
                        >
                          <Eye className="w-3 h-3 inline mr-0.5" />
                          载入
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Global Action Button inside Sidebar Footer */}
        {activeTab === 'draw' && (
          <div className="mt-8 border border-stone-800 p-4 rounded bg-black/60 shrink-0 text-center">
            <p className="text-[9px] tracking-widest text-stone-500 uppercase mb-2">Aether alignment</p>
            {isShuffling ? (
              <button 
                disabled 
                className="w-full py-2.5 bg-stone-800 text-stone-500 text-xs font-bold uppercase tracking-widest rounded-sm cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
                天机洗理中...
              </button>
            ) : (
              <button
                id="draw-init-btn"
                onClick={startDivinationSetup}
                className="w-full py-2.5 bg-[#c5a059] text-[#0c0c0c] text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#d8b56f] transition-all duration-300 shadow-[0_4px_15px_rgba(197,160,89,0.25)] hover:scale-[1.02]"
              >
                洗牌并抽牌 (Shuffle & Draw)
              </button>
            )}
            {hasDrawn && (
              <button 
                id="reset-draw-btn"
                onClick={resetDrawCanvas} 
                className="mt-2 text-[10px] text-[#c5a059]/70 hover:text-[#c5a059] underline block mx-auto transition-colors"
              >
                重置圣盘
              </button>
            )}
          </div>
        )}

      </aside>

      {/* 2. Main Canvas area with fluid layout to support Geometric Balance theme */}
      <main id="main-canvas" className="flex-grow flex flex-col relative bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#0c0c0c_100%)] overflow-y-auto">
        
        {/* Dynamic Header indicating spreading parameters */}
        <header id="main-header-bar" className="h-16 border-b border-stone-800 flex items-center justify-between px-6 md:px-10 bg-black/30 shrink-0">
          <div className="flex items-center gap-3">
            <Compass className="w-4 h-4 text-[#c5a059] animate-spin-slow" />
            <span className="text-[10px] md:text-xs tracking-[0.25em] text-stone-400 font-sans uppercase font-light">
              {activeTab === 'draw' && (
                hasDrawn ? `牌阵模型: ${divinationType === 'tarot' ? '塔罗' : '雷诺曼'} - ${divinationType === 'tarot' ? (tarotSpread === 'single' ? '单牌指引' : '过去/现在/未来') : (lenormandSpread === 'single' ? '单牌核心' : '主题/动作/结果')}` : "准备开启东方与西方的神秘启迪之旅"
              )}
              {activeTab === 'library' && `释牌文献典籍编纂 · ${divinationType === 'tarot' ? '标准伟特塔罗牌 (78张)' : '传统法国雷诺曼牌 (36张)'}`}
              {activeTab === 'history' && "占卜因缘时空留声卷轴"}
            </span>
          </div>

          <div className="flex gap-4 md:gap-6 text-[10px] tracking-widest text-stone-500">
            <span className="font-sans hidden sm:inline">共 {divinationType === 'tarot' ? '78' : '36'} 张牌库</span>
            <div className="flex items-center gap-1.5 text-[#c5a059]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-sans">加密洗牌已准入</span>
            </div>
          </div>
        </header>

        {/* Outer dynamic window matching chosen activeTab */}
        
        {/* ACTIVE TAB: DRAW SANCTUM */}
        {activeTab === 'draw' && (
          <div className="flex-grow flex flex-col p-6 md:p-8 space-y-8">
            
            {/* If no spread drawn yet, show majestic entrance welcoming state */}
            {!hasDrawn && !isShuffling && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full max-w-5xl mx-auto py-4">
                
                {/* Card of the Day panel */}
                <div className="lg:col-span-12 xl:col-span-5 bg-stone-900/40 border border-stone-850 p-6 rounded-lg flex flex-col justify-between space-y-4 shadow-xl">
                  <div className="text-center font-sans">
                    <div className="text-[10px] text-[#c5a059] uppercase tracking-widest font-semibold mb-1">本日宇宙灵镜 · Daily Oracle</div>
                    <h3 className="text-sm font-serif tracking-widest uppercase font-light text-stone-200">今日卡牌 · Card of the Day</h3>
                    <div className="h-[1px] w-12 bg-[#c5a059]/40 mx-auto mt-2"></div>
                  </div>

                  {/* Graphic display of daily card */}
                  {divinationType === 'tarot' && todayDailyTarot ? (
                    <div className="flex flex-col items-center my-2">
                      <div className="aspect-[5/8] w-36 bg-[#121212] border-2 border-[#c5a059]/60 p-2.5 rounded shadow-2xl relative flex flex-col justify-between overflow-hidden transition-transform hover:scale-105 duration-350">
                        <div className="absolute inset-0 border-4 border-stone-950 rounded-sm"></div>
                        
                        <div className="w-full flex justify-between text-[7px] text-[#c5a059]/80 font-sans px-1 z-10 font-bold">
                          <span>#{todayDailyTarot.card.number}</span>
                          <span className="uppercase">TAROT</span>
                        </div>

                        <div className="flex-grow flex items-center justify-center my-1 max-h-[100px] z-10">
                          <CardGraphic
                            type="tarot"
                            cardNumber={todayDailyTarot.card.number}
                            suit={todayDailyTarot.card.suit}
                            isTarotMajor={todayDailyTarot.card.type === 'major'}
                          />
                        </div>

                        <div className="text-center z-10">
                          <h4 className="text-[11px] text-stone-100 font-semibold leading-tight">{todayDailyTarot.card.name}</h4>
                          <p className="text-[7px] text-[#c5a059] uppercase font-sans tracking-widest">{todayDailyTarot.card.nameEn}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-[10px] px-3 py-1 rounded-full uppercase tracking-wider bg-amber-950/40 text-[#c5a059] font-sans border border-amber-900/30">
                          {todayDailyTarot.isUpright ? '正位 Upright' : '逆位 Reversed'}
                        </span>
                      </div>
                    </div>
                  ) : divinationType === 'lenormand' && todayDailyLenormand ? (
                    <div className="flex flex-col items-center my-2">
                      <div className="aspect-[5/8] w-36 bg-[#121212] border-2 border-[#c5a059]/60 p-2.5 rounded shadow-2xl relative flex flex-col justify-between overflow-hidden transition-transform hover:scale-105 duration-350">
                        <div className="absolute inset-0 border-4 border-stone-950 rounded-sm"></div>
                        
                        <div className="w-full flex justify-between text-[7px] text-[#c5a059]/80 font-sans px-1 z-10 font-bold">
                          <span>#{todayDailyLenormand.card.number}</span>
                          <span className="uppercase">LENORMAND</span>
                        </div>

                        <div className="flex-grow flex items-center justify-center my-1 max-h-[100px] z-10">
                          <CardGraphic
                            type="lenormand"
                            cardNumber={todayDailyLenormand.card.number}
                          />
                        </div>

                        <div className="text-center z-10">
                          <h4 className="text-[11px] text-stone-100 font-semibold leading-tight">{todayDailyLenormand.card.name}</h4>
                          <p className="text-[7px] text-[#c5a059] uppercase font-sans tracking-widest">{todayDailyLenormand.card.nameEn}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-[10px] px-3 py-1 rounded bg-amber-950/20 text-[#c5a059] tracking-wider uppercase font-sans border border-amber-900/10">
                          # {todayDailyLenormand.card.number} {todayDailyLenormand.card.nameEn}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {/* AI Guidance Text */}
                  <div className="bg-stone-950/80 border border-stone-850/80 p-4 rounded text-left flex-grow flex flex-col justify-center min-h-[120px]">
                    {dailyCardLoading ? (
                      <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#c5a059]" />
                        <span className="text-[10px] text-stone-500 font-sans">正在检索今日日流能量神谕...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-stone-300 leading-relaxed font-serif whitespace-pre-line">
                          {dailyGuidanceText}
                        </p>
                        {dailyGuidanceError === 'KEY_MISSING' && (
                          <div className="text-[9px] text-[#c5a059]/70 pt-1.5 border-t border-stone-900/60 font-sans flex items-center gap-1.5">
                            <Lock className="w-2.5 h-2.5 shrink-0" />
                            <span>本地神秘学回音，今天宜专注于内心本真。</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Standard instructions & customized draw segment */}
                <div className="lg:col-span-12 xl:col-span-7 bg-stone-900/20 border border-stone-850/40 p-6 rounded-lg flex flex-col justify-center text-center shadow-md">
                  <div className="w-12 h-12 border border-[#c5a059]/30 rounded-full flex items-center justify-center mb-4 relative mx-auto">
                    <div className="w-6 h-6 rounded-full border border-[#c5a059]/10 absolute animate-ping"></div>
                    <Sparkles className="w-5 h-5 text-[#c5a059]" />
                  </div>
                  <h2 className="text-sm tracking-[0.2em] text-[#c5a059] uppercase font-light mb-3">开启自主命运洗牌仪式</h2>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans mb-5 max-w-md mx-auto">
                    “除抽取今日宿命一卡之外，您更可以针对自己当前所面临的困惑、选择或运势进行全 deck 彻底洗牌。输入您诚心求问的问题（选填），点击‘洗牌并抽牌’，连通星辰之灵开启全新启谛之流。”
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left bg-stone-950/40 p-4 border border-stone-850 rounded max-w-md mx-auto w-full">
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#c5a059] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#c5a059] rotate-45 shrink-0"></span>
                        标准韦特经典塔罗
                      </div>
                      <p className="text-[9px] text-[#8a8a8a] leading-relaxed font-sans">
                        含有 22张大阿卡纳 与 56张小阿卡纳。深层关照内心原型，折射灵性进化与心理成长阶段。
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#c5a059] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#c5a059] rotate-45 shrink-0"></span>
                        传统法式沙龙雷诺曼
                      </div>
                      <p className="text-[9px] text-[#8a8a8a] leading-relaxed font-sans">
                        共有36张符号卡。其指示具体直观，不讲空话；卡牌相邻关系相互修饰，直接给出世俗预兆与直接启示。
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* If Shuffling, show gorgeous dynamic vector grid particles */}
            {isShuffling && (
              <div className="flex-grow flex flex-col items-center justify-center py-12">
                <div className="relative w-44 h-44 mb-6">
                  {/* Rotating visual dials mimicking mechanical astrolabe */}
                  <div className="absolute inset-0 border border-dashed border-[#c5a059]/30 rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-4 border border-double border-[#c5a059]/20 rounded-full animate-spin-reverse"></div>
                  <div className="absolute inset-8 border border-stone-850 rounded-full flex items-center justify-center">
                    <Shuffle className="w-8 h-8 text-[#c5a059] animate-pulse" />
                  </div>
                </div>
                <h3 className="text-sm tracking-widest text-[#c5a059] uppercase mb-2">Fisher-Yates 算法重塑卡牌秩序</h3>
                <p className="text-[10px] text-stone-500 font-sans text-center max-w-xs leading-normal">
                  调用浏览器级强加密随机哈希，对整个 {divinationType === 'tarot' ? '78' : '36'} 张牌库进行彻底洗盘，正在为您择取最具磁场共振的灵感卡牌...
                </p>
              </div>
            )}

            {/* DRAWN DECKS LAYOUT AREA (Card Stage) */}
            {hasDrawn && !isShuffling && (
              <div className="space-y-8 flex-grow flex flex-col justify-between">
                
                {/* Visual stage showing cards floating in balance */}
                <div className="flex flex-col items-center py-4">
                  <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                    
                    {/* Render Tarot drawn cards */}
                    {divinationType === 'tarot' && tarotResult.map((res, idx) => {
                      const isRevealed = revealedIndices.includes(idx);
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="mb-2 text-[10px] tracking-widest text-stone-500 uppercase font-sans">
                            {res.positionLabel}
                          </div>
                          
                          {/* Mystic card holder with flip transition */}
                          <div 
                            onClick={() => revealCardIdx(idx)}
                            className="w-40 h-64 md:w-44 md:h-72 cursor-pointer relative group transition-transform duration-500 hover:scale-[1.03] perspective"
                          >
                            <div className={`w-full h-full duration-700 ease-in-out transform-style relative ${isRevealed ? 'rotate-y-185' : ''}`}>
                              
                              {/* 1. CARD BACK DESIGN */}
                              <div className="absolute inset-0 backface-hidden rounded border border-[#c5a059]/40 bg-[#121212] p-2 hover:border-[#c5a059] transition-colors overflow-hidden">
                                <div className="absolute inset-0 border-[6px] border-stone-900 rounded-sm"></div>
                                <div className="w-full h-full border border-stone-850 flex flex-col items-center justify-between p-2">
                                  <div className="text-[8px] text-stone-600 tracking-widest">TAROT</div>
                                  
                                  {/* Golden Geometric Engraving Pattern */}
                                  <div className="w-20 h-36 flex items-center justify-center text-[#c5a059]/40">
                                    <svg viewBox="0 0 100 150" className="w-full h-full">
                                      <circle cx="50" cy="75" r="28" stroke="#c5a059" strokeWidth="0.8" fill="none" />
                                      <circle cx="50" cy="75" r="22" stroke="rgba(197,160,89,0.2)" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />
                                      <polygon points="50,44 68,75 50,106 32,75" stroke="#c5a059" strokeWidth="0.8" fill="none" />
                                      <polygon points="50,44 68,75 50,106 32,75" stroke="#c5a059" strokeWidth="0.8" fill="none" transform="rotate(45 50 75)" />
                                      <circle cx="50" cy="75" r="4" fill="#c5a059" />
                                    </svg>
                                  </div>
                                  
                                  <div className="text-[9px] text-[#c5a059] tracking-wider animate-pulse font-sans">点击翻牌</div>
                                </div>
                              </div>

                              {/* 2. CARD FACE DESIGN */}
                              <div className="absolute inset-0 backface-hidden rotate-y-185 rounded border border-[#c5a059] bg-[#121212] p-2 overflow-hidden shadow-[0_0_35px_rgba(197,160,89,0.15)] flex flex-col">
                                <div className="absolute inset-0 border-[6px] border-stone-900 rounded-sm"></div>
                                <div className={`w-full h-full border border-stone-850 flex flex-col items-center justify-between p-1.5 transition-transform duration-500 ${!res.isUpright ? 'rotate-180' : ''}`}>
                                  
                                  {/* Header metadata */}
                                  <div className="w-full flex justify-between items-center px-1 text-[8px] text-[#c5a059] font-sans">
                                    <span>#{res.card.number}</span>
                                    <span className="tracking-widest uppercase">{res.card.type === 'major' ? '阿卡纳' : '元素小牌'}</span>
                                  </div>

                                  {/* Complex geometric SVG representation */}
                                  <div className="w-24 h-36 flex items-center justify-center my-1.5 border border-stone-900 bg-black/60 rounded">
                                    <CardGraphic 
                                      type="tarot" 
                                      cardNumber={res.card.number} 
                                      suit={res.card.suit} 
                                      isTarotMajor={res.card.type === 'major'} 
                                    />
                                  </div>

                                  {/* Human text readouts inside card bottom */}
                                  <div className="flex flex-col items-center text-center">
                                    <h4 className="text-xs text-stone-100 font-semibold mb-0.5">{res.card.name}</h4>
                                    <p className="text-[8px] text-stone-500 uppercase font-sans tracking-tighter truncate max-w-[120px]">{res.card.nameEn}</p>
                                  </div>

                                  {/* Status indicator on orientation */}
                                  <div className="w-full text-center">
                                    <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase tracking-tighter ${res.isUpright ? 'bg-amber-950/60 text-[#c5a059]' : 'bg-stone-800 text-stone-400'}`}>
                                      {res.isUpright ? 'Upright 正位' : 'Reversed 逆位'}
                                    </span>
                                  </div>

                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Render Lenormand drawn cards */}
                    {divinationType === 'lenormand' && lenormandResult.map((res, idx) => {
                      const isRevealed = revealedIndices.includes(idx);
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="mb-2 text-[10px] tracking-widest text-stone-500 uppercase font-sans">
                            {res.positionLabel}
                          </div>
                          
                          {/* Mystic card holder with flip transition */}
                          <div 
                            onClick={() => revealCardIdx(idx)}
                            className="w-40 h-64 md:w-44 md:h-72 cursor-pointer relative group transition-transform duration-500 hover:scale-[1.03] perspective"
                          >
                            <div className={`w-full h-full duration-700 ease-in-out transform-style relative ${isRevealed ? 'rotate-y-185' : ''}`}>
                              
                              {/* 1. CARD BACK DESIGN */}
                              <div className="absolute inset-0 backface-hidden rounded border border-[#c5a059]/40 bg-[#121212] p-2 hover:border-[#c5a059] transition-colors overflow-hidden">
                                <div className="absolute inset-0 border-[6px] border-stone-900 rounded-sm"></div>
                                <div className="w-full h-full border border-stone-850 flex flex-col items-center justify-between p-2">
                                  <div className="text-[8px] text-stone-600 tracking-widest font-sans">LENORMAND</div>
                                  
                                  {/* Golden Geometric Engraving Pattern */}
                                  <div className="w-20 h-36 flex items-center justify-center text-[#c5a059]/40">
                                    <svg viewBox="0 0 100 150" className="w-full h-full">
                                      <circle cx="50" cy="75" r="28" stroke="#c5a059" strokeWidth="0.8" fill="none" />
                                      <circle cx="50" cy="75" r="22" stroke="rgba(197,160,89,0.2)" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />
                                      <polygon points="50,44 68,75 50,106 32,75" stroke="#c5a059" strokeWidth="0.8" fill="none" />
                                      <polygon points="50,44 68,75 50,106 32,75" stroke="#c5a059" strokeWidth="0.8" fill="none" transform="rotate(45 50 75)" />
                                      <circle cx="50" cy="75" r="4" fill="#c5a059" />
                                    </svg>
                                  </div>
                                  
                                  <div className="text-[9px] text-[#c5a059] tracking-wider animate-pulse font-sans">点击翻牌</div>
                                </div>
                              </div>

                              {/* 2. CARD FACE DESIGN */}
                              <div className="absolute inset-0 backface-hidden rotate-y-185 rounded border border-[#c5a059] bg-[#121212] p-2 overflow-hidden shadow-[0_0_35px_rgba(197,160,89,0.15)] flex flex-col">
                                <div className="absolute inset-0 border-[6px] border-stone-900 rounded-sm"></div>
                                <div className="w-full h-full border border-stone-850 flex flex-col items-center justify-between p-1.5">
                                  
                                  {/* Header metadata */}
                                  <div className="w-full flex justify-between items-center px-1 text-[8px] text-[#c5a059] font-sans">
                                    <span>#{res.card.number}</span>
                                    <span className="tracking-widest uppercase">传统雷诺曼</span>
                                  </div>

                                  {/* Complex geometric SVG representation */}
                                  <div className="w-24 h-36 flex items-center justify-center my-1.5 border border-stone-900 bg-black/60 rounded">
                                    <CardGraphic 
                                      type="lenormand" 
                                      cardNumber={res.card.number} 
                                    />
                                  </div>

                                  {/* Human text readouts inside card bottom */}
                                  <div className="flex flex-col items-center text-center">
                                    <h4 className="text-xs text-stone-100 font-semibold mb-0.5">{res.card.name}</h4>
                                    <p className="text-[8px] text-stone-500 uppercase font-sans tracking-tighter truncate max-w-[120px]">{res.card.nameEn}</p>
                                  </div>

                                  {/* Status indicator on orientation */}
                                  <div className="w-full text-center">
                                    <span className="text-[8px] px-2 py-0.5 rounded bg-amber-950/30 text-[#c5a059]/90 lowercase font-sans truncate max-w-full block">
                                      {res.card.keywords.slice(0, 2).join(' / ')}
                                    </span>
                                  </div>

                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      );
                    })}

                  </div>

                  {/* Manual / Batch flip utility actions */}
                  {revealedIndices.length < (divinationType === 'tarot' ? (tarotSpread === 'single' ? 1 : 3) : (lenormandSpread === 'single' ? 1 : 3)) && (
                    <button 
                      onClick={revealAllCards}
                      className="mt-6 text-xs bg-stone-900 border border-stone-800 hover:border-[#c5a059] text-stone-300 py-1 px-4 rounded transition-all font-sans"
                    >
                      🔮 魔法全部翻开 (Reveal All)
                    </button>
                  )}
                </div>

                {/* INTERPRETATION OUTPUT PANEL */}
                <div id="interpretation-drawer" className="border-t border-stone-800 bg-black/40 rounded p-6 shadow-xl space-y-6">
                  
                  {/* Title listing questions aligned */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-850 pb-4">
                    <div>
                      <h3 className="text-sm tracking-widest text-[#c5a059] uppercase font-light">全息卡牌解算报告 · Offline Analysis</h3>
                      {userInputQuestion && (
                        <p className="text-xs text-stone-400 font-sans mt-1">
                          所询问题：<span className="text-stone-200 italic font-serif">“{userInputQuestion}”</span>
                        </p>
                      )}
                    </div>
                    
                    {/* Advanced Server-side Gemini AI caller triggers */}
                    <div className="shrink-0">
                      {aiResponse ? (
                        <span className="text-xs bg-green-950/80 border border-green-800 text-green-300 py-1.5 px-3 rounded flex items-center gap-1.5 font-sans">
                          <CheckCircle className="w-3.5 h-3.5" /> AI 专属深度解读已显现
                        </span>
                      ) : aiLoading ? (
                        <button 
                          disabled 
                          className="text-xs bg-stone-800 border border-stone-700 text-stone-500 py-1.5 px-4 rounded cursor-not-allowed flex items-center gap-2 font-sans"
                        >
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
                          高级 AI 深度剖析卦意中...
                        </button>
                      ) : (
                        <button
                          onClick={requestAIServerReading}
                          className="text-xs bg-indigo-950/80 border border-[#c5a059]/60 hover:border-[#c5a059] text-stone-100 font-semibold py-1.5 px-4 rounded shadow-[0_0_15px_rgba(197,160,89,0.15)] hover:shadow-[0_0_25px_rgba(197,160,89,0.3)] transition-all flex items-center gap-1.5 font-sans"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                          🔑 开启 AI 专属神谕解读 (Gemini Deep Reader)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Offline card descriptors columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                    {divinationType === 'tarot' && tarotResult.map((res, idx) => {
                      const isRev = revealedIndices.includes(idx);
                      if (!isRev) {
                        return (
                          <div key={idx} className="bg-stone-900/20 p-4 border border-dashed border-stone-850 rounded text-center text-xs text-stone-600 italic">
                            （请先翻开对应位置的卡牌：{res.positionLabel}）
                          </div>
                        );
                      }
                      const keywords = res.isUpright ? res.card.keywordsUpright : res.card.keywordsReversed;
                      const interp = res.isUpright ? res.card.interpretationUpright : res.card.interpretationReversed;
                      
                      return (
                        <div key={idx} className="bg-stone-900/35 border border-stone-850 p-4 rounded text-stone-300 hover:border-stone-800 transition-colors">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-900 mb-3">
                            <h4 className="text-xs font-serif text-[#c5a059] font-semibold">
                              {res.positionLabel} · {res.card.name} ({res.isUpright ? '正位' : '逆位'})
                            </h4>
                            <span className="text-[10px] text-stone-500">{res.card.element}</span>
                          </div>
                          
                          <div className="mb-2">
                            <span className="text-[9px] bg-stone-800 text-[#c5a059] px-2 py-0.5 rounded font-semibold font-sans">
                              {keywords.join(' · ')}
                            </span>
                          </div>

                          <p className="text-xs text-stone-300 leading-relaxed font-serif mb-4">
                            {interp.general}
                          </p>

                          {/* Detail dimensions toggled internally for desktop space */}
                          <div className="space-y-2 border-t border-stone-900 pt-3 text-[11px] text-stone-400">
                            <div className="flex items-start gap-1">
                              <Heart className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                              <p><strong className="text-stone-300">情感：</strong>{interp.love}</p>
                            </div>
                            <div className="flex items-start gap-1">
                              <Briefcase className="w-3 h-3 text-[#c5a059] shrink-0 mt-0.5" />
                              <p><strong className="text-stone-300">事业：</strong>{interp.career}</p>
                            </div>
                            <div className="flex items-start gap-1">
                              <Coins className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                              <p><strong className="text-stone-300">财富：</strong>{interp.wealth}</p>
                            </div>
                            <div className="flex items-start gap-1">
                              <Activity className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                              <p><strong className="text-stone-300">身心：</strong>{interp.health}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {divinationType === 'lenormand' && lenormandResult.map((res, idx) => {
                      const isRev = revealedIndices.includes(idx);
                      if (!isRev) {
                        return (
                          <div key={idx} className="bg-stone-900/20 p-4 border border-dashed border-stone-850 rounded text-center text-xs text-stone-600 italic">
                            （请先翻开对应位置的卡牌：{res.positionLabel}）
                          </div>
                        );
                      }
                      
                      return (
                        <div key={idx} className="bg-stone-900/35 border border-stone-850 p-4 rounded text-stone-300 hover:border-stone-800 transition-colors">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-900 mb-3">
                            <h4 className="text-xs font-serif text-[#c5a059] font-semibold">
                              {res.positionLabel} · {res.card.name} ({res.card.nameEn})
                            </h4>
                            <span className="text-[10px] text-stone-500">#{res.card.number}</span>
                          </div>
                          
                          <div className="mb-2">
                            <span className="text-[9px] bg-stone-800 text-[#c5a059] px-2 py-0.5 rounded font-semibold font-sans">
                              {res.card.keywords.join(' · ')}
                            </span>
                          </div>

                          <p className="text-xs text-stone-300 leading-relaxed font-serif mb-4">
                            {res.card.interpretation.general}
                          </p>

                          <div className="space-y-2 border-t border-stone-900 pt-3 text-[11px] text-stone-400">
                            <div className="flex items-start gap-1">
                              <Heart className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                              <p><strong className="text-stone-300">情感：</strong>{res.card.interpretation.love}</p>
                            </div>
                            <div className="flex items-start gap-1">
                              <Briefcase className="w-3 h-3 text-[#c5a059] shrink-0 mt-0.5" />
                              <p><strong className="text-stone-300">学事：</strong>{res.card.interpretation.career}</p>
                            </div>
                            <div className="flex items-start gap-1">
                              <Coins className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                              <p><strong className="text-stone-300">财富：</strong>{res.card.interpretation.wealth}</p>
                            </div>
                            <div className="flex items-start gap-1">
                              <Activity className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                              <p><strong className="text-stone-300">健康：</strong>{res.card.interpretation.health}</p>
                            </div>
                            <div className="flex items-start gap-1 bg-stone-900/50 p-1.5 rounded border border-stone-850 mt-2 text-[10px] italic text-[#c5a059]/80">
                              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <p>{res.card.interpretation.combinationTips}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Combined local synthesis advices column details */}
                  {revealedIndices.length > 0 && (
                    <div className="bg-stone-900/55 border border-stone-800 p-5 rounded font-sans">
                      <h4 className="text-xs text-[#c5a059] tracking-widest uppercase mb-3 font-semibold border-b border-stone-900 pb-2">
                        🌌 本地星盘融合读数 (Aether Relationship Synthesis)
                      </h4>
                      <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-line font-serif">
                        {localSynthesisAdvice}
                      </p>
                    </div>
                  )}

                  {/* High powered Server API AI results container with complete custom formatting */}
                  {aiResponse && (
                    <div className="bg-indigo-950/20 border-2 border-[#c5a059]/40 p-6 rounded relative shadow-2xl">
                      <div className="absolute top-4 right-4 text-[9px] text-[#c5a059] font-sans font-bold flex items-center gap-1 bg-stone-900 px-2 py-0.5 rounded">
                        <Sparkles className="w-3 h-3 animate-spin-slow" /> GEMINI AI 神谕大师
                      </div>
                      
                      <h4 className="text-xs text-[#c5a059] tracking-widest uppercase mb-4 font-bold font-sans border-b border-stone-800 pb-2 flex items-center gap-2">
                        <span>🏮 AI 高级全息深度解读结果 (Advanced Mystical Oracle Analysis)</span>
                      </h4>

                      <div className="text-xs text-stone-200 leading-relaxed font-serif whitespace-pre-line space-y-4 font-sans markdown-content">
                        {aiResponse}
                      </div>
                    </div>
                  )}

                  {/* AI failures and graceful warnings block */}
                  {aiError && (
                    <div className="p-4 bg-red-950/40 border border-red-900 rounded flex gap-3 text-stone-200">
                      {aiError.code === 'KEY_MISSING' ? (
                        <>
                          <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          <div className="text-xs font-sans space-y-2">
                            <strong className="text-red-400 block text-sm">暂未配置高级 AI 解牌引擎密钥</strong>
                            <p>本占卜系统由 **本地经典卡牌库** 精华和 **Google 专属 Gemini 3.5-flash 精细大模型** 组合深度支撑。</p>
                            <p>您刚刚抽取的牌已在上方完成本地完全离线解读。若想开启深度 AI 全息智能对话，请在 AI Studio UI 侧边栏的 **Settings &gt; Secrets** 中添加您的 **GEMINI_API_KEY** 变量即可解琐。</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          <div className="text-xs font-sans space-y-1">
                            <strong className="text-red-400 block">连接中断</strong>
                            <p>{aiError.message}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

        {/* ACTIVE TAB: CARD LIBRARY DIRECTORY */}
        {activeTab === 'library' && (
          <div className="flex-grow flex flex-col md:flex-row h-full">
            
            {/* Left side card listing column */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-stone-900 max-h-[calc(100vh-4rem)] md:max-h-none">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm tracking-widest text-[#c5a059] uppercase font-light">牌库文献索引目录</h3>
                <span className="text-[10px] text-stone-500 font-sans">
                  已过滤出 {libFilteredCards.length} 项
                </span>
              </div>

              {libFilteredCards.length === 0 ? (
                <div className="text-center py-12 text-stone-600 text-xs font-sans">
                  无匹配的释牌文献
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {libFilteredCards.map((card) => {
                    const isSelected = card.id === libSelectedCardId;
                    return (
                      <div
                        key={card.id}
                        onClick={() => setLibSelectedCardId(card.id)}
                        className={`p-3 rounded border text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-stone-900/60 border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.1)]' 
                            : 'bg-[#121212]/40 border-stone-850 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex justify-between items-start text-[9px] text-[#c5a059] font-sans mb-1">
                          <span>#{card.number}</span>
                          <span className="uppercase text-stone-500">
                            {divinationType === 'tarot' ? ((card as TarotCard).type === 'major' ? '大阿卡纳' : '元素小牌') : '雷诺曼'}
                          </span>
                        </div>

                        {/* Minimal Card Image aspect */}
                        <div className="w-full h-24 bg-black/50 border border-stone-900 rounded flex items-center justify-center my-1.5 opacity-80 hover:opacity-100">
                          <CardGraphic
                            type={divinationType}
                            cardNumber={card.number}
                            suit={divinationType === 'tarot' ? (card as TarotCard).suit : undefined}
                            isTarotMajor={divinationType === 'tarot' ? (card as TarotCard).type === 'major' : undefined}
                          />
                        </div>

                        <div className="text-xs font-semibold text-stone-200 truncate mt-1">
                          {card.name}
                        </div>
                        <div className="text-[8px] text-stone-500 font-sans uppercase truncate">
                          {card.nameEn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right side card complete spec display sheet */}
            <div id="library-details-sheet" className="w-full md:w-96 p-6 md:p-8 bg-stone-950/20 max-h-[calc(100vh-4rem)] md:max-h-none overflow-y-auto">
              {currentLibCard ? (
                <div className="space-y-6 font-sans text-stone-300">
                  
                  {/* Detailed vector presentation */}
                  <div className="aspect-[5/8] w-48 mx-auto bg-[#121212] border-2 border-[#c5a059] p-3 rounded shadow-2xl relative flex flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 border-4 border-stone-900 rounded-sm"></div>
                    
                    <div className="w-full flex justify-between text-[8px] text-[#c5a059] font-sans px-1">
                      <span>#{currentLibCard.number}</span>
                      <span className="uppercase">{divinationType === 'tarot' ? 'TAROT' : 'LENORMAND'}</span>
                    </div>

                    <div className="flex-grow flex items-center justify-center my-2 max-h-[140px]">
                      <CardGraphic
                        type={divinationType}
                        cardNumber={currentLibCard.number}
                        suit={divinationType === 'tarot' ? (currentLibCard as TarotCard).suit : undefined}
                        isTarotMajor={divinationType === 'tarot' ? (currentLibCard as TarotCard).type === 'major' : undefined}
                      />
                    </div>

                    <div className="text-center">
                      <h4 className="text-sm text-stone-100 font-semibold mb-0.5">{currentLibCard.name}</h4>
                      <p className="text-[9px] text-[#c5a059] uppercase font-sans tracking-widest">{currentLibCard.nameEn}</p>
                    </div>
                  </div>

                  {/* Complete details listings */}
                  <div className="space-y-4 font-serif">
                    
                    <div>
                      <h3 className="text-xs text-[#c5a059] uppercase tracking-widest font-sans font-light border-b border-stone-900 pb-1 mb-1.5">
                        基础属性 / Spec
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                        <div>
                          <span className="text-stone-500">编号:</span> #{currentLibCard.number}
                        </div>
                        <div>
                          <span className="text-stone-500">系统:</span> {divinationType === 'tarot' ? '塔罗牌' : '雷诺曼'}
                        </div>
                        {divinationType === 'tarot' && (
                          <>
                            <div>
                              <span className="text-stone-500">类型:</span> {(currentLibCard as TarotCard).type === 'major' ? '大阿卡纳' : '小阿卡纳'}
                            </div>
                            { (currentLibCard as TarotCard).element && (
                              <div>
                                <span className="text-stone-500">元素:</span> {(currentLibCard as TarotCard).element}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Upright vs Reversed Details */}
                    {divinationType === 'tarot' ? (
                      <>
                        <div className="bg-stone-900/40 p-3 rounded border border-stone-850">
                          <h4 className="text-xs text-[#c5a059] font-semibold mb-1 font-sans">
                            ☉ 牌义：正位 (Upright)
                          </h4>
                          <p className="text-[10px] text-stone-400 font-sans mb-2">
                            关键词：{(currentLibCard as TarotCard).keywordsUpright.join(' · ')}
                          </p>
                          <p className="text-xs leading-relaxed text-stone-300">
                            {(currentLibCard as TarotCard).interpretationUpright.general}
                          </p>
                          <div className="space-y-1.5 mt-2 pt-2 border-t border-stone-900 text-[10px] text-stone-400">
                            <p><strong className="text-stone-300 font-sans">情感：</strong>{(currentLibCard as TarotCard).interpretationUpright.love}</p>
                            <p><strong className="text-stone-300 font-sans">工作：</strong>{(currentLibCard as TarotCard).interpretationUpright.career}</p>
                            <p><strong className="text-stone-300 font-sans">财富：</strong>{(currentLibCard as TarotCard).interpretationUpright.wealth}</p>
                          </div>
                        </div>

                        <div className="bg-stone-900/40 p-3 rounded border border-stone-850">
                          <h4 className="text-xs text-stone-400 font-semibold mb-1 font-sans">
                            ☽ 牌义：逆位 (Reversed)
                          </h4>
                          <p className="text-[10px] text-stone-500 font-sans mb-2">
                            关键词：{(currentLibCard as TarotCard).keywordsReversed.join(' · ')}
                          </p>
                          <p className="text-xs leading-relaxed text-stone-400">
                            {(currentLibCard as TarotCard).interpretationReversed.general}
                          </p>
                          <div className="space-y-1.5 mt-2 pt-2 border-t border-stone-900 text-[10px] text-stone-500">
                            <p><strong className="text-stone-400 font-sans">情感：</strong>{(currentLibCard as TarotCard).interpretationReversed.love}</p>
                            <p><strong className="text-stone-400 font-sans">工作：</strong>{(currentLibCard as TarotCard).interpretationReversed.career}</p>
                            <p><strong className="text-stone-400 font-sans">财富：</strong>{(currentLibCard as TarotCard).interpretationReversed.wealth}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Lenormand detailed specs
                      <g>
                        <div className="bg-stone-900/40 p-3 rounded border border-stone-850 space-y-3">
                          <div>
                            <span className="text-[10px] text-stone-500 font-sans block mb-1">核心关键词 / Keywords</span>
                            <div className="flex flex-wrap gap-1">
                              {(currentLibCard as LenormandCard).keywords.map((kw, i) => (
                                <span key={i} className="text-[10px] bg-stone-800 text-[#c5a059] px-2 py-0.5 rounded">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-stone-500 font-sans block mb-0.5">全息释义 / General Overview</span>
                            <p className="text-xs leading-relaxed text-stone-300">
                              {(currentLibCard as LenormandCard).interpretation.general}
                            </p>
                          </div>

                          <div className="space-y-1.5 border-t border-stone-900 pt-3 text-[11px] text-stone-400">
                            <p><strong className="text-stone-300 font-sans">情感：</strong>{(currentLibCard as LenormandCard).interpretation.love}</p>
                            <p><strong className="text-stone-300 font-sans">求事：</strong>{(currentLibCard as LenormandCard).interpretation.career}</p>
                            <p><strong className="text-stone-300 font-sans">财富：</strong>{(currentLibCard as LenormandCard).interpretation.wealth}</p>
                            <p><strong className="text-stone-300 font-sans">身心：</strong>{(currentLibCard as LenormandCard).interpretation.health}</p>
                          </div>

                          { (currentLibCard as LenormandCard).interpretation.combinationTips && (
                            <div className="bg-stone-900 p-2 rounded border border-stone-850 text-[10px] text-[#c5a059]/80 italic">
                              <strong>组合提示：</strong>{(currentLibCard as LenormandCard).interpretation.combinationTips}
                            </div>
                          )}
                        </div>
                      </g>
                    )}

                  </div>

                </div>
              ) : (
                <div className="text-stone-600 text-xs text-center py-20 font-sans">
                  请选择左侧文献卡牌查看深度解读
                </div>
              )}
            </div>

          </div>
        )}

        {/* ACTIVE TAB: HISTORY LIST AREA (if not drawn) */}
        {activeTab === 'history' && (
          <div className="flex-grow p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <History className="w-5 h-5 text-[#c5a059]" />
              <h2 className="text-base tracking-widest text-[#c5a059] uppercase font-light">
                因缘时空留声卷轴 (Local Records)
              </h2>
            </div>

            {historyRecords.length === 0 ? (
              <div className="bg-stone-900/10 border border-stone-850 rounded p-12 text-center max-w-md mx-auto">
                <FileText className="w-8 h-8 text-stone-700 mx-auto mb-4" />
                <p className="text-xs text-stone-500 font-sans">
                  当前尚无任何本地占卜历史留声。回到「占卜仪式」页开展您的第一场抽牌仪式吧。
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {historyRecords.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-5 border border-stone-850 hover:border-[#c5a059]/50 bg-stone-900/35 rounded relative group transition-all duration-300 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-stone-900">
                        <span className="text-[#c5a059] font-semibold">
                          {item.type === 'tarot' ? '圣德韦特塔罗牌 · ' : '法国传统雷诺曼 · '}
                          {item.spreadType === 'single' ? '单牌核心指引' : '三牌流向牌阵'}
                        </span>
                        <span className="text-stone-500 text-[10px] font-sans">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {item.question && (
                        <div className="mt-3 text-xs bg-stone-950/40 p-2 border border-stone-900 rounded select-all font-sans text-stone-300">
                          <strong className="text-stone-500 font-semibold block text-[10px] uppercase">所求问题 / Question</strong>
                          “{item.question}”
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.type === 'tarot' && item.tarotResult?.map((tr, i) => (
                          <div key={i} className="text-xs bg-stone-800/80 border border-stone-850 px-2 py-1 rounded flex items-center gap-1">
                            <span className="font-serif text-[#c5a059]">{tr.positionLabel}:</span>
                            <span className="text-stone-200">{tr.card.name} ({tr.isUpright ? '正位' : '逆位'})</span>
                          </div>
                        ))}
                        {item.type === 'lenormand' && item.lenormandResult?.map((lr, i) => (
                          <div key={i} className="text-xs bg-stone-800/80 border border-stone-850 px-2 py-1 rounded flex items-center gap-1">
                            <span className="font-serif text-[#c5a059]">{lr.positionLabel}:</span>
                            <span className="text-stone-200">{lr.card.name}</span>
                          </div>
                        ))}
                      </div>

                      <g className="block mt-4 text-[11px] text-stone-400 font-sans max-h-32 overflow-y-auto bg-black/20 p-3 rounded leading-relaxed border border-stone-900 font-serif">
                        <strong className="text-stone-500 font-semibold block text-[10px] mb-1 font-sans">释牌读数融合摘要 / Synthesis</strong>
                        {item.overallInterpretation}
                      </g>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-stone-900 pt-3">
                      <button 
                        onClick={() => deleteHistoryId(item.id)}
                        className="text-stone-500 hover:text-red-400 text-xs py-1 px-3 rounded hover:bg-stone-900/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        彻底抹去记录
                      </button>
                      <button 
                        onClick={() => loadHistoryRecord(item)}
                        className="text-xs bg-stone-900 border border-stone-850 hover:border-[#c5a059] text-[#c5a059] font-bold py-1 px-4 rounded transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 inline" />
                        装载到圣坛
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 3. Right Utility Column (Aesthetic spacer alignment for premium visual symmetry) */}
      <div id="right-utility-bar" className="w-full md:w-12 border-t md:border-t-0 md:border-l border-stone-800 flex md:flex-col items-center justify-between py-6 px-4 md:px-0 bg-black/60 shrink-0 gap-4 md:gap-10">
        <div className="w-1.5 h-1.5 bg-stone-700 rounded-full"></div>
        <div 
          className="writing-vertical text-[9px] md:text-[10px] tracking-[0.4em] text-stone-500 uppercase font-light transform rotate-0 md:rotate-180 select-none hidden md:block" 
          style={{ writingMode: 'vertical-rl' }}
        >
          Equilibrium Divination · 塔罗与雷诺曼
        </div>
        <div className="w-1.5 h-1.5 bg-stone-700 rounded-full"></div>
      </div>

    </div>
  );
}
