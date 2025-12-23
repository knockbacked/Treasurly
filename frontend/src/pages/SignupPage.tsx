import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, SignupSchema, type SignupForm } from "../services/auth_service";
import { ZodError } from "zod";
import Navbar from "../components/NavBar";


export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupForm>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Smooth scroll (for Navbar — harmless on this page)
  const handleNavClick = (targetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getPasswordHints = (pwd: string) => ({
    length: pwd.length >= 8,
    number: /\d/.test(pwd),
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    symbol: /[^A-Za-z0-9]/.test(pwd),
  });

  const hints = getPasswordHints(form.password);
  const passwordValid = Object.values(hints).every(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    try {
      SignupSchema.parse(form);
      setLoading(true);

      const user = await signup(form);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/app/dashboard");
    } catch (err: any) {
      console.log("logging1", err.data?.error);
      const serverError = err.data?.error;

      if (serverError) {
        if (serverError.includes("Email")) {
          setGeneralError("An account with this email already exists.");
        } else if (serverError.includes("Password")) {
          setGeneralError(
            "Password must be at least 8 characters long and contain at least one number."
          );
        } else {
          setGeneralError(err.response.data.error);
        }
        setLoading(false);
        return;
      }

      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
        setGeneralError("Please correct the highlighted fields.");
        setLoading(false);
        return;
      }

      setGeneralError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const fields: { id: keyof SignupForm; label: string; type: string }[] = [
    { id: "firstname", label: "First Name", type: "text" },
    { id: "lastname", label: "Last Name", type: "text" },
    { id: "email", label: "Email", type: "email" },
    { id: "password", label: "Password", type: "password" },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-ink)] text-[var(--text-soft)]">
      {/* ✅ Navbar */}
      <Navbar variant="auth" onNavClick={handleNavClick} />

      {/* Signup form container */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="relative w-full max-w-md p-8 md:p-10 bg-[var(--color-panel)]/80 border border-[var(--color-line)] rounded-2xl shadow-[var(--shadow-card)] backdrop-blur-md">
          <div className="absolute inset-0 rounded-2xl bg-[var(--color-gold)]/5 blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-3 mb-6">

            <h2 className="text-xl font-semibold text-[var(--text-strong)] tracking-tight">
              Create your Treasurly account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="relative mt-4 space-y-5">
            {fields.map((field) => (
              <div key={field.id} className="relative">
                <label
                  htmlFor={field.id}
                  className="block mb-1 text-sm text-[var(--text-dim)]"
                >
                  {field.label}
                </label>

                <input
                  id={field.id}
                  type={
                    field.id === "password" && showPassword
                      ? "text"
                      : field.type
                  }
                  placeholder={
                    field.id === "email" ? "you@domain.com" : field.label
                  }
                  className={`w-full px-4 py-3 rounded-lg bg-[var(--color-surface-2)] border 
                    ${
                      errors[field.id]
                        ? "border-[var(--color-error)]"
                        : "border-[var(--color-line)]"
                    }
                    text-[var(--text-soft)] placeholder-[var(--text-dim)]
                    focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/40
                    outline-none transition`}
                  value={form[field.id]}
                  onChange={(e) =>
                    setForm({ ...form, [field.id]: e.target.value })
                  }
                  required
                />

                {errors[field.id] && (
                  <p className="mt-1 text-xs text-[var(--color-error)]">
                    {errors[field.id]}
                  </p>
                )}

                {field.id === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-[2.9rem] right-3 text-xs text-[var(--text-dim)] hover:text-[var(--color-gold)] transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                )}
              </div>
            ))}

            {form.password.length > 0 && (
              <div className="mt-2 text-xs text-[var(--text-dim)] space-y-1">
                {Object.entries(hints).map(([k, v]) => (
                  <div
                    key={k}
                    className={`flex items-center gap-2 ${
                      v ? "text-green-400" : "text-[var(--text-dim)]"
                    }`}
                  >
                    <span>{v ? "✓" : "•"}</span>
                    <span>
                      {k === "length" && "At least 8 characters"}
                      {k === "number" && "At least one number"}
                      {k === "uppercase" && "At least one uppercase letter"}
                      {k === "lowercase" && "At least one lowercase letter"}
                      {k === "symbol" && "At least one symbol"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {generalError && (
              <div className="rounded-lg border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 text-[var(--color-error)] px-4 py-3 text-sm">
                {generalError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordValid}
              className={`w-full py-3 rounded-lg font-semibold transition-all
                ${
                  loading || !passwordValid
                    ? "opacity-60 cursor-not-allowed bg-[var(--color-gold)]"
                    : "bg-[var(--color-gold)] hover:brightness-95 text-[var(--color-ink)]"
                }`}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--text-dim)]">
            Already have an account?{" "}
            <Link to="/signin" className="text-[var(--color-gold)] hover:brightness-110">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
