import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export default function AppShell(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-white/40 bg-white/60 px-5 py-4 shadow-panel backdrop-blur">
        <Link to="/dashboard" className="font-display text-xl font-bold tracking-tight text-ink">
          PulseBoard
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-ocean text-white" : "bg-white/70 text-slate-700 hover:bg-white"
              }`
            }
          >
            Dashboard
          </NavLink>
          {user?.roles.includes("admin") && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-signal text-white" : "bg-white/70 text-slate-700 hover:bg-white"
                }`
              }
            >
              Admin
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => {
              clearSession();
              navigate("/login");
            }}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Log out
          </button>
        </nav>
      </header>

      <main className="mx-auto mt-6 w-full max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
