/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// General types
export type DivinationType = 'tarot' | 'lenormand';

export type TarotSpreadType = 'single' | 'three'; // single: 1 card, three: 3 cards (Past-Present-Future)
export type LenormandSpreadType = 'single' | 'three'; // single: 1 card, three: 3 cards (Subject-Action-Result)

// Tarot card definition
export interface TarotCard {
  id: string; // e.g., 'major-0', 'cups-1'
  name: string; // 中文名
  nameEn: string; // 英文名
  type: 'major' | 'minor';
  number: number; // 0-21 for major, 1-14 for minor
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  element?: string; // 元素：火、水、风、土
  keywordsUpright: string[]; // 正位关键词
  keywordsReversed: string[]; // 逆位关键词
  interpretationUpright: {
    general: string;
    love: string;
    career: string;
    wealth: string;
    health: string;
  };
  interpretationReversed: {
    general: string;
    love: string;
    career: string;
    wealth: string;
    health: string;
  };
}

// Lenormand card definition
export interface LenormandCard {
  id: string; // name key
  number: number; // 1-36
  name: string; // 中文名
  nameEn: string; // 英文名
  keywords: string[]; // 核心关键词
  interpretation: {
    general: string;
    love: string;
    career: string;
    wealth: string;
    health: string;
    combinationTips: string; // 组合解读提示
  };
}

// Draw states
export interface TarotDrawResult {
  card: TarotCard;
  isUpright: boolean;
  positionLabel?: string; // e.g. "过去" | "现在" | "未来" 或 "问题" | "建议" | "结果"
}

export interface LenormandDrawResult {
  card: LenormandCard;
  positionLabel?: string; // e.g. "主题" | "动作" | "结果" 或 "主牌" | "修饰" | "结果"
}

// History record
export interface DivinationHistoryRecord {
  id: string;
  timestamp: number;
  type: DivinationType;
  spreadType: 'single' | 'three';
  question?: string; // 用户输入的问题/愿望
  tarotResult?: TarotDrawResult[];
  lenormandResult?: LenormandDrawResult[];
  overallInterpretation?: string; // 牌阵综合解读
}
