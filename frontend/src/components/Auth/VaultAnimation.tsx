import React, { useRef, useEffect } from "react";

type VaultAnimationProps = {
  isActive?: boolean;
  wobble?: boolean;
};

// 🔧 Manual control variable (change once, applies everywhere)
const VAULT_SIZE = 45; // in rem units — try 18–28 for range

export default function VaultAnimation({
  isActive = false,
  wobble = false,
}: VaultAnimationProps) {
  const handleRef = useRef<SVGGElement | null>(null);
  const midRingRef = useRef<SVGGElement | null>(null);
  const rotationRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        rotationRef.current = (rotationRef.current + 2) % 360;

        // outer handle rotates clockwise
        handleRef.current?.setAttribute(
          "transform",
          `rotate(${rotationRef.current} 200 200)`
        );

        // middle ring rotates counter-clockwise
        midRingRef.current?.setAttribute(
          "transform",
          `rotate(${-rotationRef.current} 200 200)`
        );
      }, 30);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 400 400"
        // 💡 Use variable for both width & height
        style={{
          height: `${VAULT_SIZE}rem`,
          width: `${VAULT_SIZE}rem`,
        }}
        className={`text-gold/80 transition-transform duration-500 ${
          wobble ? "animate-wobble" : ""
        }`}
      >
        <defs>
          <linearGradient id="metal" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-line)" />
            <stop offset="50%" stopColor="var(--color-surface-1)" />
            <stop offset="100%" stopColor="var(--color-line)" />
          </linearGradient>
        </defs>

        {/* Outer rim */}
        <circle cx="200" cy="200" r="180" fill="url(#metal)" opacity="0.15" />
        <circle
          cx="200"
          cy="200"
          r="178"
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="2"
        />

        {/* Tick marks */}
        <g>
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i / 60) * Math.PI * 2;
            const inner = 160 + (i % 5 === 0 ? 0 : 6);
            const x1 = 200 + inner * Math.cos(angle);
            const y1 = 200 + inner * Math.sin(angle);
            const x2 = 200 + 170 * Math.cos(angle);
            const y2 = 200 + 170 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 5 === 0 ? "var(--color-gold)" : "var(--color-line)"}
                strokeWidth={i % 5 === 0 ? 2 : 1}
                opacity={i % 5 === 0 ? 1 : 0.5}
              />
            );
          })}
        </g>

        {/* Middle rotating ring */}
        <g ref={midRingRef} transform="rotate(0 200 200)">
          <circle
            cx="200"
            cy="200"
            r="130"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="1.5"
            opacity="0.4"
          />
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = (i / 30) * Math.PI * 2;
            const inner = 118;
            const outer = 130;
            const x1 = 200 + inner * Math.cos(angle);
            const y1 = 200 + inner * Math.sin(angle);
            const x2 = 200 + outer * Math.cos(angle);
            const y2 = 200 + outer * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 5 === 0 ? "var(--color-gold)" : "var(--color-line)"}
                strokeWidth={i % 5 === 0 ? 2 : 1}
                opacity={i % 5 === 0 ? 1 : 0.6}
              />
            );
          })}
        </g>

        {/* Center hub */}
        <circle
          cx="200"
          cy="200"
          r="18"
          fill="var(--color-panel)"
          stroke="var(--color-line)"
        />

        {/* Handle (rotating clockwise) */}
        <g ref={handleRef} transform="rotate(0 200 200)">
          <circle
            cx="200"
            cy="200"
            r="90"
            fill="var(--color-surface-1)"
            stroke="var(--color-line)"
          />
          <rect x="196" y="120" width="8" height="40" rx="4" fill="var(--color-gold)" />
          <rect x="196" y="240" width="8" height="40" rx="4" fill="var(--color-gold)" />
          <rect x="120" y="196" width="40" height="8" rx="4" fill="var(--color-gold)" />
          <rect x="240" y="196" width="40" height="8" rx="4" fill="var(--color-gold)" />
          <circle cx="200" cy="200" r="10" fill="var(--color-panel)" stroke="var(--color-line)" />
        </g>
      </svg>
    </div>
  );
}
