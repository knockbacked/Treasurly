import React, { useEffect, useMemo, useRef, useState } from "react";

type Strength = "soft" | "medium" | "strong";
interface Props {
  count?: number;
  seed?: number;
  strength?: Strength;
  blendMode?: "screen" | "lighten" | "normal";
  reshuffleOnReenter?: boolean;
  className?: string;
}

function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strengthAlpha(s: Strength) {
  switch (s) {
    case "soft":   return { core: 0.28, halo: 0.16, conic: 0.12 };
    case "strong": return { core: 0.55, halo: 0.28, conic: 0.20 };
    default:       return { core: 0.40, halo: 0.22, conic: 0.16 };
  }
}

const Background: React.FC<Props> = ({
  count = 4,
  seed = 1,
  strength = "medium",
  blendMode = "screen",
  reshuffleOnReenter = false,
  className = "",
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [liveSeed, setLiveSeed] = useState(seed);
  const a = strengthAlpha(strength);

  useEffect(() => {
    if (!reshuffleOnReenter) return;
    const el = hostRef.current;
    if (!el) return;
    let wasVisible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.intersectionRatio > 0.35;
        if (visible && !wasVisible) setLiveSeed(Math.floor(Math.random() * 1e9));
        wasVisible = visible;
      },
      { threshold: [0, 0.35, 0.75, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reshuffleOnReenter]);

  const blobs = useMemo(() => {
    const rng = mulberry32(liveSeed || seed);
    return Array.from({ length: count }).map(() => {
      const vw = 14 + rng() * 20; // 14vw..34vw
      return {
        left: 8 + rng() * 84,
        top: 10 + rng() * 80,
        size: `clamp(220px, ${vw}vw, 680px)`,
        rot: Math.floor(rng() * 360),
        type: rng() > 0.75 ? "conic" : "radial",
      } as const;
    });
  }, [count, liveSeed, seed]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ mixBlendMode: blendMode }}
    >
      <div className="absolute inset-0 [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]">
        {blobs.map((b, i) => {
          const base: React.CSSProperties = {
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            top: `${b.top}%`,
            transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
          };
          const style: React.CSSProperties =
            b.type === "radial"
              ? {
                  ...base,
                  background: `radial-gradient(50% 50% at 50% 50%, rgba(255,228,51,${a.core}) 0%, rgba(255,228,51,${a.halo}) 22%, rgba(255,228,51,0) 65%)`,
                  filter: "blur(24px) saturate(1.02)",
                }
              : {
                  ...base,
                  background: `conic-gradient(from 210deg at 50% 50%, rgba(255,228,51,${a.conic}) 0deg, transparent 120deg, rgba(255,228,51,${a.conic * 0.8}) 240deg, transparent 360deg)`,
                  filter: "blur(40px)",
                };

          return <div key={i} className="absolute rounded-full" style={style} />;
        })}

        {/* subtle grid & vignette */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(transparent 0, transparent 31px, rgba(255,255,255,0.06) 31px),linear-gradient(90deg, transparent 0, transparent 31px, rgba(255,255,255,0.06) 31px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)",
          }}
        />
      </div>
    </div>
  );
};

export default Background;