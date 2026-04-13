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
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-white/15 text-white"
            : "text-white/60 hover:text-white hover:bg-white/10"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="nav-blur border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center mr-2">
          <span className="text-white text-xs font-bold">CR</span>
        </div>
        {navLink("/generate-bill", t("nav.generateBill"))}
        {navLink("/manage", t("nav.manage"))}
      </div>

      <button
        onClick={signOut}
        className="text-white/50 hover:text-white text-sm transition-colors cursor-pointer px-3 py-1.5 rounded-full hover:bg-white/10"
      >
        {t("nav.logout")}
      </button>
    </nav>
  );
}
