import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./hooks/useAuth";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setMessage(t("login.confirmEmail"));
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t("common.appName")}</h1>
          <p className="text-white/50 text-sm mt-1">
            {mode === "signin" ? t("login.signInTitle") : t("login.signUpTitle")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 card-shadow">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all"
                placeholder={t("login.emailPlaceholder")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all"
                placeholder={t("login.passwordPlaceholder")}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-indigo-500/25 cursor-pointer mt-1"
            >
              {loading
                ? t("login.loading")
                : mode === "signin"
                  ? t("login.signIn")
                  : t("login.signUp")}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            {mode === "signin" ? t("login.noAccount") : t("login.hasAccount")}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-indigo-500 font-medium hover:text-indigo-600 cursor-pointer"
            >
              {mode === "signin" ? t("login.signUp") : t("login.signIn")}
            </button>
          </p>
        </div>

        <p className="text-center mt-6 text-white/25 text-xs tracking-widest font-mono">
          COPYRIGHT © 2026 - PROUD CH
        </p>
      </div>
    </div>
  );
}
