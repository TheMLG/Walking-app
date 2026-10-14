import { LayoutDashboard, LogOut, Trophy, UserCircle2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from './ui';
import { useAuth } from '../context/AuthContext';

const navItem = 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition hover:bg-white/5';

export function AppShell({ children, onLogout }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-line bg-black/20 p-5 lg:flex lg:flex-col">
          <div className="mb-8">
            <div className="text-2xl font-black tracking-tight">WalkWar</div>
            <div className="mt-2 text-xs uppercase tracking-[0.3em] text-accent/80">Personal walking tracker</div>
          </div>
          <nav className="space-y-2">
            <NavLink to="/dashboard" className={({ isActive }) => `${navItem} ${isActive ? 'bg-white/7 text-accent' : 'text-white/75'}`}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => `${navItem} ${isActive ? 'bg-white/7 text-accent' : 'text-white/75'}`}>
              <Trophy className="h-4 w-4" />
              Leaderboard
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `${navItem} ${isActive ? 'bg-white/7 text-accent' : 'text-white/75'}`}>
              <UserCircle2 className="h-4 w-4" />
              Profile
            </NavLink>
          </nav>
          <div className="mt-auto pt-10">
            <div className="rounded-3xl border border-line bg-panel2 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/45">Signed in as</div>
              <div className="mt-1 font-semibold">{user?.name}</div>
              <div className="mt-1 text-xs text-white/50">{user?.email}</div>
            </div>
            <Button variant="ghost" className="mt-4 w-full justify-start" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>
        <main className="pb-20 lg:pb-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-3">
          <NavLink to="/dashboard" className={({ isActive }) => `py-3 text-center text-xs ${isActive ? 'text-accent' : 'text-white/55'}`}>
            <LayoutDashboard className="mx-auto mb-1 h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `py-3 text-center text-xs ${isActive ? 'text-accent' : 'text-white/55'}`}>
            <Trophy className="mx-auto mb-1 h-5 w-5" />
            Leaderboard
          </NavLink>
          <button className="py-3 text-xs text-white/55" onClick={onLogout}>
            <LogOut className="mx-auto mb-1 h-5 w-5" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}
