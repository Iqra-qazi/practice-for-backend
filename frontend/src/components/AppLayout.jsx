import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiGrid, FiLogOut, FiShield } from "react-icons/fi";
import toast from "react-hot-toast";
import Brand from "./Brand.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiError } from "../api/client.js";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = user?.role === "admin" ? "/admin" : "/user";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getApiError(error, "Unable to sign out. Please try again."));
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col border-r border-line bg-white px-5 py-7 lg:flex">
        <Brand />
        <p className="mb-3 mt-12 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        <NavLink
          to={dashboardPath}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              isActive ? "bg-soft-red text-blood" : "text-slate-500 hover:bg-slate-50 hover:text-ink"
            }`
          }
        >
          <FiGrid size={17} /> {user?.role === "admin" ? "Admin overview" : "My dashboard"}
        </NavLink>
        <div className="mt-auto rounded-2xl border border-line bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-4 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-500 transition hover:bg-white hover:text-blood">
            <FiLogOut size={15} /> Sign out
          </button>
          <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[11px] leading-4 text-slate-400">
            <FiShield className="shrink-0 text-emerald-600" /> Authenticated session
          </p>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-line bg-white/95 px-5 backdrop-blur sm:px-8 lg:px-10">
          <div className="lg:hidden"><Brand compact /></div>
          <div className="hidden text-sm text-slate-500 sm:block">
            {user?.role === "admin" ? "Administration workspace" : "Your personal workspace"}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-ink sm:block">{user?.name}</span>
            <UserAvatar user={user} />
            <button onClick={handleLogout} aria-label="Sign out" className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-blood focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood lg:hidden">
              <FiLogOut size={18} />
            </button>
            <span className="ml-1 hidden h-8 w-px bg-line lg:block" />
            <span className="hidden items-center gap-1 text-xs font-medium text-slate-500 lg:flex">
              {user?.role === "admin" ? "Administrator" : "Member"} <FiArrowUpRight />
            </span>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-72px)] max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
          <Outlet />
        </main>
        <footer className="border-t border-line bg-white px-5 py-4 text-center text-xs text-slate-400 sm:px-8 lg:px-10">
          Rabta · Voluntary blood donation community
        </footer>
      </div>
    </div>
  );
}

export function UserAvatar({ user, size = "h-9 w-9" }) {
  const initials = user?.name?.trim()?.[0]?.toUpperCase() || "U";
  return user?.picture ? (
    <img src={user.picture} alt="" className={`${size} rounded-full border border-line object-cover`} />
  ) : (
    <span className={`${size} grid place-items-center rounded-full border border-red-100 bg-soft-red text-sm font-bold text-blood`}>
      {initials}
    </span>
  );
}
