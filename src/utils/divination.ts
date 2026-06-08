/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TarotCard, LenormandCard, TarotDrawResult, LenormandDrawResult } from '../types';
import { ALL_TAROT_CARDS } from '../data/tarot';
import { LENORMAND_CARDS } from '../data/lenormand';

/**
 * Fisher-Yates shuffle algorithm using a cryptographically secure random number generator.
 * This conforms to section 2.1.3 from the user specifications.
 */
export function secureShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  const size = shuffled.length;
  
  if (size <= 1) return shuffled;

  // We need 32-bit unsigned integers to generate random indices
  const randomBytes = new Uint32Array(size);
  window.crypto.getRandomValues(randomBytes);

  for (let i = size - 1; i > 0; i--) {
    // Generate an index between 0 and i inclusive using crypto entropy
    const randomIndex = randomBytes[i] % (i + 1);
    
    // Swap elements
    const temp = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }

  return shuffled;
}

/**
 * Generate a simple hash from a string (useful for seeding based on dates YYYY-MM-DD).
 */
export function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get deterministic Card of the Day for any date (YYYY-MM-DD).
 */
export function getDailyTarotCard(dateStr: string): TarotDrawResult {
  const hash = stringHash(`tarot-daily-v2-${dateStr}`);
  
  // Pick a card from ALL_TAROT_CARDS
  const cardIndex = hash % ALL_TAROT_CARDS.length;
  const card = ALL_TAROT_CARDS[cardIndex];
  
  // Determine upright/reversed: upright if even hash, reversed if odd
  const isUpright = hash % 2 === 0;

  return {
    card,
    isUpright,
    positionLabel: '本日运势'
  };
}

/**
 * Get deterministic Lenormand Card of the Day for any date (YYYY-MM-DD).
 */
export function getDailyLenormandCard(dateStr: string): LenormandDrawResult {
  const hash = stringHash(`lenormand-daily-v2-${dateStr}`);
  
  // Pick a card from LENORMAND_CARDS
  const cardIndex = hash % LENORMAND_CARDS.length;
  const card = LENORMAND_CARDS[cardIndex];

  return {
    card,
    positionLabel: '今日指引'
  };
}

/**
 * Conduct a standard Tarot spread drawing.
 * Conforms to no-replacement principle.
 */
export function drawTarot(spreadType: 'single' | 'three'): TarotDrawResult[] {
  const shuffled = secureShuffle(ALL_TAROT_CARDS);
  const count = spreadType === 'single' ? 1 : 3;
  
  // Get random values for orientation of drawn cards independently (50% probability each)
  const orientationBytes = new Uint8Array(count);
  window.crypto.getRandomValues(orientationBytes);

  const results: TarotDrawResult[] = [];
  const positions = spreadType === 'single' ? ['每日启示'] : ['过去 (Past)', '现在 (Present)', '未来 (Future)'];

  for (let i = 0; i < count; i++) {
    const isUpright = orientationBytes[i] % 2 === 0; // 50% chance upright or reversed
    results.push({
      card: shuffled[i],
      isUpright,
      positionLabel: positions[i]
    });
  }

  return results;
}

/**
 * Conduct a standard Lenormand spread drawing.
 * Conforms to no-replacement principle.
 * Lenormand cards do not have reversed states.
 */
export function drawLenormand(spreadType: 'single' | 'three'): LenormandDrawResult[] {
  const shuffled = secureShuffle(LENORMAND_CARDS);
  const count = spreadType === 'single' ? 1 : 3;

  const results: LenormandDrawResult[] = [];
  const positions = spreadType === 'single' ? ['今日重心'] : ['主题 (Subject)', '修饰 (Action)', '结果 (Result)'];

  for (let i = 0; i < count; i++) {
    results.push({
      card: shuffled[i],
      positionLabel: positions[i]
    });
  }

  return results;
}
