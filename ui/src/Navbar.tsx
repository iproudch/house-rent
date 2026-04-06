import { Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export default function Navbar() {
  const { signOut } = useAuth();

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-white font-semibold text-sm">House Rent</span>
        <Link
          to="/generate-bill"
          className="text-zinc-400 hover:text-white text-sm transition-colors"
        >
          Generate Bill
        </Link>
      </div>

      <button
        onClick={signOut}
        className="text-zinc-400 hover:text-white text-sm transition-colors cursor-pointer"
      >
        Logout
      </button>
    </nav>
  );
}
