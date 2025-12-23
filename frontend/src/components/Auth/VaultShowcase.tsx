import VaultAnimation from "./VaultAnimation";

type VaultShowcaseProps = {
  offsetY?: number;        // legacy: whole-block offset
  contentOffsetY?: number; // shifts everything except vault
  titleOffset?: number;
  title?: string;
  isActive?: boolean;
  wobble?: boolean;
};

// 🔧 Manual global scale control for *non-vault elements*
const NON_VAULT_SCALE = 0.8; // try 0.8–1.3 range

export default function VaultShowcase({
  offsetY = 0,
  contentOffsetY = 0,
  titleOffset = -12,
  title = "",
  isActive = false,
  wobble = false,
}: VaultShowcaseProps) {
  return (
    <div
      className="hidden md:flex flex-1 flex-col items-center justify-center relative"
      style={{
        transform: `translateY(${offsetY}rem)`,
      }}
    >
      {/* Vault animation (not scaled) */}
      <VaultAnimation isActive={isActive} wobble={wobble} />

      {/* Text + glow layer */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none origin-center"
        style={{
          transform: `translateY(${contentOffsetY}rem) scale(${NON_VAULT_SCALE})`,
        }}
      >
        {/* Title */}
        <h1
          className="absolute text-[2rem] font-extrabold tracking-tight text-gold drop-shadow-[0_0_8px_rgba(255,213,74,0.4)] select-none pointer-events-auto"
          style={{
            top: `${titleOffset}rem`,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mt-[24rem] text-sm text-[var(--text-soft)] max-w-xs text-center leading-relaxed pointer-events-auto">
          Secure entry point to your personal financial vault.
          <br />
          <span className="text-gold/80">
            AES-256 encrypted. Bank-grade protection.
          </span>
        </p>

        {/* Glow ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[26rem] w-[26rem] rounded-full border border-gold/10 shadow-[0_0_90px_-10px_rgba(255,213,74,0.25)] animate-pulse-slow" />
      </div>
    </div>
  );
}
