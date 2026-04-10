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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 flex flex-col gap-6 w-full max-w-sm shadow-xl">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">{t("common.appName")}</h1>
          <p className="text-zinc-400 text-sm">
            {mode === "signin" ? t("login.signInTitle") : t("login.signUpTitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-zinc-400">{t("login.email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500"
              placeholder={t("login.emailPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-zinc-400">{t("login.password")}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500"
              placeholder={t("login.passwordPlaceholder")}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? t("login.loading") : mode === "signin" ? t("login.signIn") : t("login.signUp")}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          {mode === "signin" ? t("login.noAccount") : t("login.hasAccount")}{" "}
          <button onClick={toggleMode} className="text-zinc-300 hover:text-white cursor-pointer">
            {mode === "signin" ? t("login.signUp") : t("login.signIn")}
          </button>
        </p>
      </div>
    </div>
  );
}
