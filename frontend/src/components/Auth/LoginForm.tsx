import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, LoginSchema, type LoginForm } from "../../services/auth_service";

type Props = {
  onPasswordFocus?: (focused: boolean) => void; // 🔸 trigger vault spin
  onSubmitStart?: () => void; // 🔸 trigger wobble animation
  onSubmitEnd?: () => void;   // 🔸 stop wobble animation
};

export default function LoginForm({
  onPasswordFocus,
  onSubmitStart,
  onSubmitEnd,
}: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // 🔸 Notify vault to wobble
    onSubmitStart?.();

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      onSubmitEnd?.();
      return;
    }

    try {
      LoginSchema.parse(form);
      setLoading(true);

      const user = await login(form);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/app/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
      onSubmitEnd?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className="text-sm text-soft block mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="you@domain.com"
          className="w-full px-4 py-3 rounded-lg bg-dim border border-line focus:border-gold outline-none transition"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm text-soft block mb-1">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-dim hover:text-gold transition"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-lg bg-dim border border-line focus:border-gold outline-none transition"
          value={form.password}
          onFocus={() => onPasswordFocus?.(true)}   // 🔸 vault spins
          onBlur={() => onPasswordFocus?.(false)}    // 🔸 vault stops
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-5 py-3 rounded-lg bg-gold text-ink font-semibold hover:brightness-95 transition-all disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-danger/50 bg-danger/10 text-danger px-4 py-3 text-sm">
          {error}
        </div>
      )}
    </form>
  );
}
