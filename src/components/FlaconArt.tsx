import React from 'react';
import type { PerfumeGender, ProductCategory } from '../types/store';

interface FlaconArtProps {
  category: ProductCategory;
  gender?: PerfumeGender;
  accentHex: string;
  name: string;
  volume?: string;
  className?: string;
}

export const FlaconArt: React.FC<FlaconArtProps> = ({
  category,
  gender,
  accentHex,
  name,
  volume,
  className = '',
}) => {
  const safeAccent = /^#[0-9A-Fa-f]{6}$/.test(accentHex) ? accentHex : '#8C5E2A';
  const uid = name.replace(/\W+/g, '').toLowerCase();

  if (category === 'attar') {
    return (
      <div
        className={`relative flex items-center justify-center bg-[#EFECE6] overflow-hidden select-none ${className}`}
        aria-label={`${name} attar crystal flacon`}
      >
        <svg
          viewBox="0 0 220 240"
          className="w-[82%] h-[82%] transition-transform duration-300 group-hover:scale-[1.04]"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`attar-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={safeAccent} stopOpacity="0.88" />
              <stop offset="100%" stopColor="#3B2410" stopOpacity="0.92" />
            </linearGradient>
            <linearGradient id={`attar-gold-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A68546" />
              <stop offset="50%" stopColor="#DFC68B" />
              <stop offset="100%" stopColor="#8F6E32" />
            </linearGradient>
          </defs>

          {/* Soft Studio Ground Shadow */}
          <ellipse cx="110" cy="212" rx="46" ry="6" fill="#141414" fillOpacity="0.1" />

          {/* Architectural Cap & Gold Collar */}
          <rect x="94" y="34" width="32" height="24" rx="2" fill="#141414" />
          <rect x="99" y="58" width="22" height="8" fill={`url(#attar-gold-${uid})`} />

          {/* Heavy Glass Cut-Crystal Flacon */}
          <polygon
            points="72,74 148,74 162,92 162,194 148,208 72,208 58,194 58,92"
            fill="#FAF8F4"
            fillOpacity="0.72"
            stroke="#C7C0B4"
            strokeWidth="1.2"
          />

          {/* Glass Base Thickness */}
          <polygon
            points="66,184 154,184 146,202 74,202"
            fill="#E3DDD2"
            fillOpacity="0.65"
          />

          {/* Pure Attar Liquid */}
          <polygon
            points="66,100 154,100 154,184 66,184"
            fill={`url(#attar-${uid})`}
          />

          {/* Glass Specular Highlight */}
          <line x1="72" y1="84" x2="72" y2="196" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="3" />
          <line x1="146" y1="84" x2="146" y2="196" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />

          {/* Cream Editorial Label */}
          <rect x="81" y="114" width="58" height="48" fill="#F9F7F4" stroke="#D5CEC2" strokeWidth="0.8" />
          <text
            x="110"
            y="132"
            textAnchor="middle"
            fill="#141414"
            fontSize="7.5"
            fontFamily="Playfair Display, serif"
            letterSpacing="1.6"
          >
            KHUSHBOO
          </text>
          <line x1="94" y1="138" x2="126" y2="138" stroke="#C5A059" strokeWidth="0.7" />
          <text
            x="110"
            y="149"
            textAnchor="middle"
            fill="#5C564E"
            fontSize="5.2"
            fontFamily="Plus Jakarta Sans, sans-serif"
            letterSpacing="1.1"
          >
            {volume ? `ATTAR · ${volume.toUpperCase()}` : 'PURE ATTAR'}
          </text>
        </svg>
      </div>
    );
  }

  if (gender === 'male') {
    return (
      <div
        className={`relative flex items-center justify-center bg-[#EFECE6] overflow-hidden select-none ${className}`}
        aria-label={`${name} men's eau de parfum flacon`}
      >
        <svg
          viewBox="0 0 220 240"
          className="w-[82%] h-[82%] transition-transform duration-300 group-hover:scale-[1.04]"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`male-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={safeAccent} stopOpacity="0.85" />
              <stop offset="100%" stopColor="#141414" stopOpacity="0.96" />
            </linearGradient>
          </defs>

          <ellipse cx="110" cy="212" rx="50" ry="6" fill="#141414" fillOpacity="0.12" />

          {/* Matte Black Cap + Gold Neck */}
          <rect x="88" y="32" width="44" height="30" rx="1" fill="#141414" />
          <rect x="97" y="62" width="26" height="8" fill="#B8944F" />

          {/* Architectural Square Glass Bottle */}
          <rect
            x="56"
            y="70"
            width="108"
            height="138"
            rx="3"
            fill="#FAF8F4"
            fillOpacity="0.65"
            stroke="#C7C0B4"
            strokeWidth="1.2"
          />
          <rect x="64" y="84" width="92" height="110" fill={`url(#male-${uid})`} />

          {/* Specular Reflection */}
          <rect x="68" y="76" width="5" height="122" fill="#FFFFFF" fillOpacity="0.22" />

          {/* Editorial Label */}
          <rect x="78" y="106" width="64" height="58" fill="#F9F7F4" stroke="#C5A059" strokeWidth="0.7" />
          <text
            x="110"
            y="128"
            textAnchor="middle"
            fill="#141414"
            fontSize="7.8"
            fontFamily="Playfair Display, serif"
            letterSpacing="1.6"
          >
            KHUSHBOO
          </text>
          <line x1="94" y1="135" x2="126" y2="135" stroke="#B8944F" strokeWidth="0.7" />
          <text
            x="110"
            y="148"
            textAnchor="middle"
            fill="#5C564E"
            fontSize="5.2"
            fontFamily="Plus Jakarta Sans, sans-serif"
            letterSpacing="1"
          >
            {volume ? `PARFUM · ${volume.toUpperCase()}` : 'EAU DE PARFUM'}
          </text>
        </svg>
      </div>
    );
  }

  // Feminine crystal flacon
  return (
    <div
      className={`relative flex items-center justify-center bg-[#EFECE6] overflow-hidden select-none ${className}`}
      aria-label={`${name} women's eau de parfum flacon`}
    >
      <svg
        viewBox="0 0 220 240"
        className="w-[82%] h-[82%] transition-transform duration-300 group-hover:scale-[1.04]"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`fem-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={safeAccent} stopOpacity="0.48" />
            <stop offset="100%" stopColor={safeAccent} stopOpacity="0.82" />
          </linearGradient>
        </defs>

        <ellipse cx="110" cy="212" rx="48" ry="6" fill="#141414" fillOpacity="0.1" />

        {/* Matte Black Cap + Gold Collar */}
        <rect x="90" y="34" width="40" height="28" rx="2" fill="#141414" />
        <rect x="98" y="62" width="24" height="8" fill="#C9A86A" />

        {/* Clear Crystal Bottle */}
        <rect
          x="60"
          y="70"
          width="100"
          height="138"
          rx="4"
          fill="#FAF8F4"
          fillOpacity="0.78"
          stroke="#C7C0B4"
          strokeWidth="1.2"
        />
        <rect x="68" y="84" width="84" height="110" rx="2" fill={`url(#fem-${uid})`} />

        {/* Specular Reflections */}
        <rect x="72" y="78" width="4" height="118" fill="#FFFFFF" fillOpacity="0.45" />
        <rect x="142" y="78" width="2" height="118" fill="#FFFFFF" fillOpacity="0.3" />

        {/* Cream Label */}
        <rect x="79" y="106" width="62" height="58" fill="#F9F7F4" stroke="#D5CEC2" strokeWidth="0.8" />
        <text
          x="110"
          y="128"
          textAnchor="middle"
          fill="#141414"
          fontSize="7.6"
          fontFamily="Playfair Display, serif"
          letterSpacing="1.6"
        >
          KHUSHBOO
        </text>
        <line x1="94" y1="135" x2="126" y2="135" stroke="#C5A059" strokeWidth="0.7" />
        <text
          x="110"
          y="148"
          textAnchor="middle"
          fill="#5C564E"
          fontSize="5.2"
          fontFamily="Plus Jakarta Sans, sans-serif"
          letterSpacing="1"
        >
          {volume ? `PARFUM · ${volume.toUpperCase()}` : 'EAU DE PARFUM'}
        </text>
      </svg>
    </div>
  );
};
