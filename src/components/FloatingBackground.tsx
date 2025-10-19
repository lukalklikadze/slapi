import React, { useEffect, useState } from 'react';

interface FloatingSymbol {
  id: number;
  symbol: string;
  top: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
  size: number;
}

export const FloatingBackground: React.FC = () => {
  const [symbols, setSymbols] = useState<FloatingSymbol[]>([]);

  useEffect(() => {
    const currencySymbols = ['$', '€', '₿', '¥', '£', '₹', '₽'];
    const baseCount = Math.floor(window.innerWidth / 50);
    const symbolCount = Math.min(Math.max(baseCount, 20), 70);

    const newSymbols: FloatingSymbol[] = [];

    for (let i = 0; i < symbolCount; i++) {
      const fromTop = i < symbolCount / 2;
      newSymbols.push({
        id: i,
        symbol:
          currencySymbols[Math.floor(Math.random() * currencySymbols.length)],
        top: fromTop ? 0 : Math.random() * 100,
        left: fromTop ? (i / (symbolCount / 2)) * 100 : 0,
        duration: 18 + Math.random() * 15,
        delay: Math.random() * 20,
        opacity: 0.1 + Math.random() * 0.3,
        size: 2.5 + Math.random() * 3.5,
      });
    }

    const timeout = setTimeout(() => setSymbols(newSymbols), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <style>{`
        @keyframes diagonal-flow {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: var(--opacity);
          }
          95% {
            opacity: var(--opacity);
          }
          100% {
            transform: translate(120vw, 120vh) rotate(360deg);
            opacity: 0;
          }
        }
        .floating-symbol {
          position: fixed;
          font-weight: bold;
          color: #60a5fa;
          text-shadow: 0 0 15px rgba(96, 165, 250, 0.6);
          opacity: 0;
          animation: diagonal-flow linear infinite;
          will-change: transform, opacity;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }
      `}</style>
      {symbols.map((symbol) => (
        <div
          key={symbol.id}
          className="floating-symbol"
          style={
            {
              top: `${symbol.top}%`,
              left: `${symbol.left}%`,
              fontSize: `${symbol.size}rem`,
              animationDuration: `${symbol.duration}s`,
              animationDelay: `${symbol.delay}s`,
              '--opacity': symbol.opacity,
            } as React.CSSProperties
          }
        >
          {symbol.symbol}
        </div>
      ))}
    </div>
  );
};
