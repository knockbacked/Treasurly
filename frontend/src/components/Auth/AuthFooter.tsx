import { Link } from "react-router-dom";

export default function AuthFooter() {
  return (
    <>
      <p className="mt-6 text-sm text-dim">
        New to Treasurly?{" "}
        <Link to="/signup" className="text-gold hover:brightness-110">
          Create an account
        </Link>
      </p>

      <div className="mt-8 text-[12px] text-dim inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-3 py-1 backdrop-blur">
        <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-80">
          <path
            fill="currentColor"
            d="M12 2L2 7v10l10 5l10-5V7zM6 9l6-3l6 3l-6 3zM6 12.5l6 3l6-3V15l-6 3l-6-3z"
          />
        </svg>
        End-to-end encrypted • Read-only bank connections
      </div>
    </>
  );
}
