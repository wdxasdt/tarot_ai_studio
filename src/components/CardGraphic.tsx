import React from 'react';

interface CardGraphicProps {
  type: 'tarot' | 'lenormand';
  cardNumber: number; // For tarot major/minor, or lenormand 1-36
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  isTarotMajor?: boolean;
}

export default function CardGraphic({ type, cardNumber, suit, isTarotMajor = false }: CardGraphicProps) {
  // Common styles
  const gStroke = "#c5a059"; // Gold accent stroke
  const gFill = "#c5a059";
  const dimStroke = "rgba(197, 160, 89, 0.25)";

  if (type === 'tarot') {
    if (isTarotMajor) {
      // 22 Major Arcana custom vector icons
      switch (cardNumber) {
        case 0: // The Fool
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              <circle cx="50" cy="70" r="30" stroke={gStroke} strokeWidth="1" fill="none" />
              <line x1="20" y1="70" x2="80" y2="70" stroke={dimStroke} strokeWidth="0.5" />
              <line x1="50" y1="40" x2="50" y2="100" stroke={dimStroke} strokeWidth="0.5" />
              <path d="M50 25 L80 110 M50 25 L20 110" stroke={gStroke} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
              <circle cx="50" cy="25" r="4" fill={gFill} />
              <polygon points="50,60 55,75 45,75" fill={gFill} />
              <path d="M35,95 Q50,110 65,95" stroke={gStroke} strokeWidth="1" fill="none" />
            </svg>
          );
        case 1: // The Magician
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              {/* Infinity Symbol above */}
              <path d="M35 35 Q42.5 25 50 35 Q57.5 45 65 35 Q72.5 25 65 15 Q57.5 25 50 35 Q42.5 45 35 35 Q27.5 25 35 15 Z" stroke={gStroke} strokeWidth="1.2" fill="none" />
              <polygon points="50,55 75,100 25,100" stroke={gStroke} strokeWidth="1" fill="none" />
              <polygon points="50,110 75,65 25,65" stroke={dimStroke} strokeWidth="0.7" fill="none" />
              <circle cx="50" cy="82.5" r="8" fill={gFill} fillOpacity="0.15" stroke={gStroke} strokeWidth="1" />
              <line x1="50" y1="45" x2="50" y2="120" stroke={gStroke} strokeWidth="1" />
              <circle cx="50" cy="45" r="3" fill="#fff" />
              <circle cx="50" cy="120" r="3" fill={gFill} />
            </svg>
          );
        case 2: // The High Priestess
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              {/* Pillars */}
              <line x1="25" y1="30" x2="25" y2="120" stroke={gStroke} strokeWidth="2" strokeDasharray="6 2" />
              <line x1="75" y1="30" x2="75" y2="120" stroke={gStroke} strokeWidth="2" />
              <text x="22" y="75" fill="#fff" fontSize="8" fontFamily="serif">B</text>
              <text x="72" y="75" fill={gFill} fontSize="8" fontFamily="serif">J</text>
              {/* Central Moon */}
              <circle cx="50" cy="75" r="16" stroke={gStroke} strokeWidth="1" fill="none" />
              <path d="M50 55 A20 20 0 0 0 50 95 A14 14 0 0 1 50 55" fill={gFill} />
            </svg>
          );
        case 3: // The Empress
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              <circle cx="50" cy="70" r="28" stroke={gStroke} strokeWidth="1.2" fill="none" />
              <circle cx="50" cy="70" r="22" stroke={dimStroke} strokeWidth="0.8" strokeDasharray="2 1" fill="none" />
              {/* Venus Sign integration */}
              <line x1="50" y1="98" x2="50" y2="125" stroke={gStroke} strokeWidth="2" />
              <line x1="40" y1="112" x2="60" y2="112" stroke={gStroke} strokeWidth="1.5" />
              {/* Star crowns */}
              <polygon points="50,22 53,29 60,29 55,34 57,41 50,37 43,41 45,34 40,29 47,29" fill={gFill} />
              <circle cx="50" cy="70" r="14" fill={gFill} fillOpacity="0.1" />
              <path d="M32 70 C38 80, 62 80, 68 70" stroke={gStroke} strokeWidth="1" fill="none" />
            </svg>
          );
        case 4: // The Emperor
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              <rect x="25" y="45" width="50" height="50" stroke={gStroke} strokeWidth="1.5" fill="none" />
              <polygon points="50,45 75,95 25,95" stroke={dimStroke} strokeWidth="1" fill="none" />
              {/* Cross & Orb */}
              <circle cx="50" cy="30" r="8" stroke={gStroke} strokeWidth="1" fill="none" />
              <line x1="50" y1="18" x2="50" y2="38" stroke={gStroke} strokeWidth="1" />
              <line x1="43" y1="22" x2="57" y2="22" stroke={gStroke} strokeWidth="1" />
              {/* Rams head abstraction */}
              <path d="M35 55 Q50 65 65 55" stroke={gStroke} strokeWidth="1.2" fill="none" />
              <path d="M30 45 Q20 40 25 50" stroke={gStroke} strokeWidth="1" fill="none" />
              <path d="M70 45 Q80 40 75 50" stroke={gStroke} strokeWidth="1" fill="none" />
            </svg>
          );
        case 5: // The Hierophant
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              {/* Triple Cross */}
              <line x1="50" y1="25" x2="50" y2="115" stroke={gStroke} strokeWidth="2.5" />
              <line x1="30" y1="45" x2="70" y2="45" stroke={gStroke} strokeWidth="2" />
              <line x1="34" y1="60" x2="66" y2="60" stroke={gStroke} strokeWidth="2" />
              <line x1="38" y1="75" x2="62" y2="75" stroke={gStroke} strokeWidth="2" />
              {/* Keys at bottom */}
              <path d="M40 120 L48 112 M60 120 L52 112" stroke={gStroke} strokeWidth="1.5" />
              <circle cx="36" cy="122" r="4" stroke={gStroke} strokeWidth="1" fill="none" />
              <circle cx="64" cy="122" r="4" stroke={gStroke} strokeWidth="1" fill="none" />
              <path d="M22 45 Q50 15 78 45" stroke={dimStroke} strokeWidth="0.8" fill="none" />
            </svg>
          );
        case 6: // The Lovers
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              {/* Overlapping Circles */}
              <circle cx="40" cy="75" r="22" stroke={gStroke} strokeWidth="1" fill="none" />
              <circle cx="60" cy="75" r="22" stroke={gStroke} strokeWidth="1" fill="none" />
              {/* Intersecting heart pattern */}
              <path d="M50 55 C48 45, 30 45, 40 65 L50 80 L60 65 C70 45, 52 45, 50 55 Z" fill={gFill} fillOpacity="0.2" stroke={gStroke} strokeWidth="1" />
              {/* Angel wing lines */}
              <path d="M15 50 Q30 55 45 40 M85 50 Q70 55 55 40" stroke={dimStroke} strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <circle cx="50" cy="30" r="3" fill="#fff" />
            </svg>
          );
        case 7: // The Chariot
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              <rect x="25" y="45" width="50" height="50" stroke={gStroke} strokeWidth="1" fill="none" rx="2" />
              {/* Canopy */}
              <path d="M20 30 L80 30 L70 45 L30 45 Z" stroke={gStroke} strokeWidth="1.2" fill="none" />
              <line x1="25" y1="30" x2="25" y2="45" stroke={gStroke} strokeWidth="1" />
              <line x1="75" y1="30" x2="75" y2="45" stroke={gStroke} strokeWidth="1" />
              {/* Shield emblem */}
              <polygon points="50,55 62,65 50,85 38,65" fill={gFill} fillOpacity="0.15" stroke={gStroke} strokeWidth="1" />
              {/* Wheels */}
              <circle cx="18" cy="95" r="10" stroke={gStroke} strokeWidth="1" fill="none" />
              <circle cx="82" cy="95" r="10" stroke={gStroke} strokeWidth="1" fill="none" />
              <circle cx="18" cy="95" r="2" fill={gFill} />
              <circle cx="82" cy="95" r="2" fill={gFill} />
            </svg>
          );
        case 8: // Strength
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              {/* Infinity on top */}
              <path d="M35 40 Q42.5 30 50 40 Q57.5 50 65 40 Q72.5 30 65 20 Q57.5 30 50 40 Q42.5 50 35 40 Q27.5 30 35 20 Z" stroke={gStroke} strokeWidth="1.5" fill="none" />
              {/* Lion Face Geometry */}
              <polygon points="50,60 65,75 50,110 35,75" stroke={gStroke} strokeWidth="1" fill="none" />
              <circle cx="50" cy="70" r="20" stroke={dimStroke} strokeWidth="0.8" strokeDasharray="3 3" />
              <path d="M35 75 Q50 90 65 75" fill="none" stroke={gStroke} strokeWidth="1" />
              <path d="M45 55 Q50 62 55 55" fill="none" stroke={gStroke} strokeWidth="1.2" />
            </svg>
          );
        case 9: // The Hermit
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              {/* Hermit's Lantern Star */}
              <g transform="translate(50, 60)">
                <polygon points="0,-25 7,-7 24,-7 10,4 15,22 0,11 -15,22 -10,4 -24,-7 -7,-7" fill={gFill} fillOpacity="0.1" stroke={gStroke} strokeWidth="1" />
                <circle cx="0" cy="0" r="5" fill="#fff" />
              </g>
              <path d="M20 120 L80 120" stroke={gStroke} strokeWidth="1" strokeLinecap="round" />
              {/* Staff */}
              <line x1="30" y1="30" x2="35" y2="120" stroke={gStroke} strokeWidth="1.5" />
              {/* Shroud outline */}
              <path d="M40 30 C30 50 35 110 35 115" stroke={dimStroke} strokeWidth="0.8" fill="none" />
            </svg>
          );
        case 10: // Wheel of Fortune
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              <circle cx="50" cy="75" r="26" stroke={gStroke} strokeWidth="1.8" fill="none" />
              <circle cx="50" cy="75" r="18" stroke={dimStroke} strokeWidth="1" fill="none" />
              <circle cx="50" cy="75" r="4" fill={gFill} />
              {/* Spokes */}
              <line x1="50" y1="49" x2="50" y2="101" stroke={gStroke} strokeWidth="1" />
              <line x1="24" y1="75" x2="76" y2="75" stroke={gStroke} strokeWidth="1" />
              <line x1="32" y1="57" x2="68" y2="93" stroke={gStroke} strokeWidth="1" strokeDasharray="4 2" />
              <line x1="32" y1="93" x2="68" y2="57" stroke={gStroke} strokeWidth="1" strokeDasharray="4 2" />
              {/* Runes or markers */}
              <circle cx="50" cy="40" r="2" fill="#fff" />
              <circle cx="50" cy="110" r="2" fill="#fff" />
              <circle cx="15" cy="75" r="2" fill="#fff" />
              <circle cx="85" cy="75" r="2" fill="#fff" />
            </svg>
          );
        case 11: // Justice
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              {/* Scale Beam */}
              <line x1="20" y1="55" x2="80" y2="55" stroke={gStroke} strokeWidth="1.5" />
              <circle cx="50" cy="55" r="3" fill="#fff" />
              {/* Hanging pans */}
              <line x1="25" y1="55" x2="25" y2="75" stroke={gStroke} strokeWidth="0.7" />
              <line x1="75" y1="55" x2="75" y2="75" stroke={gStroke} strokeWidth="0.7" />
              <path d="M17 75 L33 75 Q25 82 17 75" fill={gFill} fillOpacity="0.2" stroke={gStroke} strokeWidth="1" />
              <path d="M67 75 L83 75 Q75 82 67 75" fill={gFill} fillOpacity="0.2" stroke={gStroke} strokeWidth="1" />
              {/* Sword in middle */}
              <line x1="50" y1="30" x2="50" y2="110" stroke={gStroke} strokeWidth="2" />
              <line x1="42" y1="96" x2="58" y2="96" stroke={gStroke} strokeWidth="1.5" />
              <circle cx="50" cy="113" r="2" fill={gFill} />
            </svg>
          );
        default: // Fallback general geometry for rest of levels
          return (
            <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
              <circle cx="50" cy="75" r="28" stroke={gStroke} strokeWidth="0.8" strokeDasharray="4 2" fill="none" />
              <polygon points="50,35 80,95 20,95" stroke={gStroke} strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="65" r="6" fill={gFill} />
              <text x="50" y="115" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="2">ARCANUM</text>
              <text x="50" y="125" textAnchor="middle" fill="#fff" fontSize="6">{cardNumber}</text>
            </svg>
          );
      }
    } else {
      // Minor Arcana graphics representing suits
      let suitPath = null;
      let title = "";

      if (suit === 'wands') {
        title = "WANDS";
        suitPath = (
          <g>
            <path d="M47 30 L53 30 L51 110 L49 110 Z" fill={gFill} />
            <circle cx="50" cy="25" r="3" fill="#fff" />
            <path d="M35 50 L65 50 M40 70 L60 70 M42 90 L58 90" stroke={dimStroke} strokeWidth="1" />
            <path d="M43 35 Q50 15 57 35" stroke={gStroke} strokeWidth="1" fill="none" />
          </g>
        );
      } else if (suit === 'cups') {
        title = "CUPS";
        suitPath = (
          <g>
            <path d="M35 45 L65 45 L60 80 Q50 95 40 80 Z" fill={gFill} fillOpacity="0.15" stroke={gStroke} strokeWidth="1.5" />
            <line x1="50" y1="88" x2="50" y2="110" stroke={gStroke} strokeWidth="2" />
            <path d="M38 110 L62 110" stroke={gStroke} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M35 45 Q50 50 65 45" stroke={gStroke} strokeWidth="1" fill="none" />
            <circle cx="50" cy="65" r="4" fill="#fff" />
          </g>
        );
      } else if (suit === 'swords') {
        title = "SWORDS";
        suitPath = (
          <g>
            <path d="M50 25 L53 45 L52 105 L48 105 L47 45 Z" fill={gFill} fillOpacity="0.2" stroke={gStroke} strokeWidth="1" />
            <line x1="40" y1="105" x2="60" y2="105" stroke={gStroke} strokeWidth="2.5" />
            <circle cx="50" cy="114" r="3" fill={gFill} />
            <line x1="50" y1="35" x2="50" y2="105" stroke="#fff" strokeWidth="0.8" />
            <path d="M30 45 L70 120" stroke={dimStroke} strokeWidth="0.5" />
            <path d="M70 45 L30 120" stroke={dimStroke} strokeWidth="0.5" />
          </g>
        );
      } else { // pentacles
        title = "PENTACLES";
        suitPath = (
          <g>
            <circle cx="50" cy="70" r="28" stroke={gStroke} strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="70" r="24" stroke={dimStroke} strokeWidth="1" fill="none" strokeDasharray="2 2" />
            {/* Draw beautiful star star pentacle inside */}
            <polygon points="50,44 57,61 74,61 60,71 66,88 50,78 34,88 40,71 26,61 43,61" fill={gFill} fillOpacity="0.25" stroke={gStroke} strokeWidth="1" />
            <circle cx="50" cy="70" r="3" fill="#fff" />
          </g>
        );
      }

      return (
        <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
          <rect x="5" y="5" width="90" height="140" stroke={dimStroke} strokeWidth="0.5" fill="none" rx="2" />
          {suitPath}
          <text x="50" y="132" textAnchor="middle" fill={gFill} fontSize="7" letterSpacing="1">{title}</text>
          <text x="50" y="141" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">{cardNumber}</text>
        </svg>
      );
    }
  } else {
    // Lenormand Card Vector Icons (1 to 36)
    switch (cardNumber) {
      case 1: // Rider
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <path d="M30 85 L70 45 M30 105 L80 55" stroke={gStroke} strokeWidth="1.5" strokeLinecap="round" />
            <polygon points="80,45 85,60 65,55" fill={gFill} />
            <circle cx="45" cy="75" r="10" stroke={dimStroke} strokeWidth="1" fill="none" />
            <path d="M15,115 Q50,90 85,115" stroke={gStroke} strokeWidth="0.8" fill="none" strokeDasharray="3 3" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">RIDER</text>
          </svg>
        );
      case 2: // Clover
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            {/* Four clover leaves using circles */}
            <g transform="translate(50, 65)">
              <circle cx="-10" cy="-10" r="10" stroke={gStroke} strokeWidth="1" fill={gFill} fillOpacity="0.1" />
              <circle cx="10" cy="-10" r="10" stroke={gStroke} strokeWidth="1" fill={gFill} fillOpacity="0.1" />
              <circle cx="-10" cy="10" r="10" stroke={gStroke} strokeWidth="1" fill={gFill} fillOpacity="0.1" />
              <circle cx="10" cy="10" r="10" stroke={gStroke} strokeWidth="1" fill={gFill} fillOpacity="0.1" />
              <path d="M0 0 Q15 40 5 45" stroke={gStroke} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="0" cy="0" r="3" fill="#fff" />
            </g>
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">CLOVER</text>
          </svg>
        );
      case 3: // Ship
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            {/* Ship Hull */}
            <path d="M20 80 L80 80 L70 100 L30 100 Z" fill={gFill} fillOpacity="0.15" stroke={gStroke} strokeWidth="1.2" />
            {/* Sails */}
            <polygon points="35,35 48,75 35,75" fill="none" stroke={gStroke} strokeWidth="1" />
            <polygon points="50,25 68,75 50,75" fill={gFill} />
            <line x1="50" y1="20" x2="50" y2="80" stroke={gStroke} strokeWidth="1.5" />
            {/* Waves */}
            <path d="M15 108 Q32.5 100 50 108 Q67.5 100 85 108" stroke={gStroke} strokeWidth="1" fill="none" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">SHIP</text>
          </svg>
        );
      case 4: // House
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <rect x="25" y="65" width="50" height="40" stroke={gStroke} strokeWidth="1.5" fill="none" />
            {/* Roof */}
            <polygon points="50,35 80,65 20,65" fill={gFill} fillOpacity="0.2" stroke={gStroke} strokeWidth="1.5" />
            {/* Door & Window */}
            <rect x="44" y="85" width="12" height="20" fill="none" stroke={gStroke} strokeWidth="1" />
            <circle cx="44" cy="52" r="4" fill="none" stroke={gStroke} strokeWidth="1" />
            <line x1="20" y1="110" x2="80" y2="110" stroke={dimStroke} strokeWidth="1" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">HOUSE</text>
          </svg>
        );
      case 5: // Tree
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            {/* Triangles stacking tree */}
            <polygon points="50,30 70,60 30,60" fill={gFill} fillOpacity="0.15" stroke={gStroke} strokeWidth="1" />
            <polygon points="50,50 76,85 24,85" fill={gFill} fillOpacity="0.25" stroke={gStroke} strokeWidth="1.2" />
            <rect x="46" y="85" width="8" height="25" fill={gFill} />
            {/* Roots */}
            <path d="M46 110 Q35 120 25 115 M54 110 Q65 120 75 115" stroke={gStroke} strokeWidth="1" fill="none" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">TREE</text>
          </svg>
        );
      case 6: // Clouds
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <g transform="translate(10, 10)">
              <circle cx="35" cy="55" r="14" fill={gFill} fillOpacity="0.08" stroke={dimStroke} strokeWidth="1" />
              <circle cx="50" cy="45" r="16" fill={gFill} fillOpacity="0.15" stroke={gStroke} strokeWidth="1" />
              <circle cx="65" cy="58" r="12" fill={gFill} fillOpacity="0.08" stroke={dimStroke} strokeWidth="1" />
              <rect x="35" y="55" width="30" height="15" fill={gFill} fillOpacity="0.1" />
              <line x1="30" y1="70" x2="70" y2="70" stroke={gStroke} strokeWidth="1" />
            </g>
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">CLOUDS</text>
          </svg>
        );
      case 7: // Snake
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <path d="M50 35 C30 45 30 65 50 70 C70 75 70 95 50 105 C35 110 30 115 35 120" fill="none" stroke={gStroke} strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="35" r="4" fill={gFill} />
            {/* Forked tongue */}
            <path d="M50 31 L48 24 M50 31 L53 24" stroke="#ff4141" strokeWidth="1" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">SNAKE</text>
          </svg>
        );
      case 8: // Coffin
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <polygon points="50,35 65,45 60,110 40,110 35,45" fill={gFill} fillOpacity="0.1" stroke={gStroke} strokeWidth="1.5" />
            {/* Cross in center */}
            <line x1="50" y1="55" x2="50" y2="85" stroke={gStroke} strokeWidth="1" />
            <line x1="42" y1="65" x2="58" y2="65" stroke={gStroke} strokeWidth="1" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">COFFIN</text>
          </svg>
        );
      case 9: // Bouquet
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <g transform="translate(50, 60)">
              {/* Ribbon */}
              <path d="M-5 25 Q0 15 5 25 M-8 35 Q0 23 8 35" stroke={gStroke} strokeWidth="1" fill="none" />
              <line x1="0" y1="-10" x2="0" y2="40" stroke={gStroke} strokeWidth="2" />
              <line x1="-15" y1="-5" x2="15" y2="35" stroke={gStroke} strokeWidth="1.2" />
              <line x1="15" y1="-5" x2="-15" y2="35" stroke={gStroke} strokeWidth="1.2" />
              {/* Flowers */}
              <circle cx="0" cy="-15" r="8" fill="#fff" stroke={gStroke} strokeWidth="1" />
              <circle cx="-16" cy="-8" r="8" fill={gFill} fillOpacity="0.2" stroke={gStroke} strokeWidth="1" />
              <circle cx="16" cy="-8" r="8" fill={gFill} fillOpacity="0.2" stroke={gStroke} strokeWidth="1" />
              <circle cx="0" cy="-15" r="2" fill={gFill} />
              <circle cx="-16" cy="-8" r="2" fill="#fff" />
              <circle cx="16" cy="-8" r="2" fill="#fff" />
            </g>
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">BOUQUET</text>
          </svg>
        );
      case 10: // Scythe
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            {/* Scythe handle */}
            <line x1="30" y1="110" x2="70" y2="40" stroke={gStroke} strokeWidth="2.5" strokeLinecap="round" />
            {/* Scythe Blade curved */}
            <path d="M70 40 C65 20, 25 35, 15 48 C30 46, 62 44, 70 40 Z" fill={gFill} fillOpacity="0.3" stroke={gStroke} strokeWidth="1.5" />
            <line x1="10" y1="110" x2="90" y2="110" stroke={dimStroke} strokeWidth="0.5" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">SCYTHE</text>
          </svg>
        );
      case 24: // Heart
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <path d="M50 45 C45 30, 20 30, 20 55 C20 85, 50 105, 50 110 C50 105, 80 85, 80 55 C80 30, 55 30, 50 45 Z" fill="#ff4d4d" fillOpacity="0.2" stroke="#ff4d4d" strokeWidth="1.8" />
            <circle cx="50" cy="55" r="8" stroke={gStroke} strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">HEART</text>
          </svg>
        );
      case 31: // Sun
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <circle cx="50" cy="70" r="18" fill={gFill} fillOpacity="0.15" stroke={gStroke} strokeWidth="1.5" />
            <circle cx="50" cy="70" r="4" fill="#fff" />
            {/* Radiating Rays */}
            <g transform="translate(50, 70)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, k) => (
                <line key={k} x1="0" y1="23" x2="0" y2="31" stroke={gStroke} strokeWidth="1" transform={`rotate(${angle})`} />
              ))}
            </g>
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">SUN</text>
          </svg>
        );
      case 32: // Moon
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <path d="M55 40 A24 24 0 1 0 55 100 A18 18 0 1 1 55 40" fill={gFill} fillOpacity="0.25" stroke={gStroke} strokeWidth="1.5" />
            {/* Stars next to it */}
            <polygon points="30,45 32,49 36,49 33,52 34,56 30,53 26,56 27,52 24,49 28,49" fill="#fff" />
            <polygon points="25,80 26,82 29,82 27,84 28,87 25,85 22,87 23,84 21,82 24,82" fill="#fff" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">MOON</text>
          </svg>
        );
      case 33: // Key
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            {/* Loop */}
            <circle cx="50" cy="45" r="12" stroke={gStroke} strokeWidth="1.8" fill="none" />
            <circle cx="50" cy="45" r="4" stroke={dimStroke} strokeWidth="1" fill="none" />
            {/* Shaft */}
            <line x1="50" y1="57" x2="50" y2="105" stroke={gStroke} strokeWidth="2.5" />
            {/* Teeth */}
            <path d="M50 90 L60 90 L60 96 L50 96 M50 99 L58 99 L58 105 L50 105" fill="none" stroke={gStroke} strokeWidth="1.5" />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">KEY</text>
          </svg>
        );
      case 35: // Anchor
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <line x1="50" y1="40" x2="50" y2="100" stroke={gStroke} strokeWidth="2.5" />
            <circle cx="50" cy="35" r="6" stroke={gStroke} strokeWidth="1.8" fill="none" />
            <line x1="38" y1="52" x2="62" y2="52" stroke={gStroke} strokeWidth="2" />
            {/* Curved bottom */}
            <path d="M22 80 C22 108 78 108 78 80" stroke={gStroke} strokeWidth="2.5" fill="none" />
            <polygon points="22,78 17,88 27,88" fill={gFill} />
            <polygon points="78,78 73,88 83,88" fill={gFill} />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">ANCHOR</text>
          </svg>
        );
      default: // General elegant fallback for remaining Lenormand numbered cards
        return (
          <svg viewBox="0 0 100 150" className="w-full h-full text-[#c5a059]">
            <circle cx="50" cy="65" r="22" stroke={dimStroke} strokeWidth="0.8" fill="none" strokeDasharray="3 3" />
            <polygon points="50,45 65,80 35,80" fill={gFill} fillOpacity="0.15" stroke={gStroke} strokeWidth="1" />
            <circle cx="50" cy="68" r="3" fill="#fff" />
            {/* Diamond shape corners */}
            <polygon points="50,22 53,27 50,32 47,27" fill={gFill} />
            <polygon points="50,102 53,107 50,112 47,107" fill={gFill} />
            <text x="50" y="135" textAnchor="middle" fill={gFill} fontSize="8" letterSpacing="1">LENORMAND</text>
          </svg>
        );
    }
  }
}
