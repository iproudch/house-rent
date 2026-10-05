import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export default function Navbar() {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
          active
            ? "bg-white text-ink shadow-[0_1px_2px_oklch(0.2_0_0/0.08)]"
            : "text-muted hover:text-ink"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-line">
      <div className="max-w-[920px] mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-9 h-9 rounded-[10px] bg-primary text-white flex items-center justify-center text-sm font-semibold tracking-wide">
            CR
          </div>
          <div className="flex items-center gap-1 bg-[oklch(0.955_0.005_90)] rounded-[10px] p-[3px]">
            {navLink("/generate-bill", t("nav.generateBill"))}
            {navLink("/manage", t("nav.manage"))}
          </div>
        </div>

        <button
          onClick={signOut}
          className="text-muted hover:text-ink hover:bg-[oklch(0.96_0.005_90)] text-[13.5px] font-medium transition-colors cursor-pointer px-3 py-2 rounded-lg"
        >
          {t("nav.logout")}
        </button>
      </div>
    </nav>
  );
}
