import { LayoutDashboard, LogOut, Settings, Trophy, UserCircle2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from './ui';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';

const navItem = 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition hover:bg-white/5';

export function AppShell({ children, onLogout }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen text-white bg-bg">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-line bg-black/20 p-5 lg:flex lg:flex-col">
          <div className="mb-8">
            <div className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-accent">⚡</span> WalkWar
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.3em] text-accent/80 font-semibold">Treadmill Tracker</div>
          </div>
          <nav className="space-y-2">
            <NavLink to="/dashboard" className={({ isActive }) => `${navItem} ${isActive ? 'bg-white/10 text-accent font-semibold shadow-glow' : 'text-white/75'}`}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => `${navItem} ${isActive ? 'bg-white/10 text-accent font-semibold shadow-glow' : 'text-white/75'}`}>
              <Trophy className="h-4 w-4" />
              Leaderboard
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `${navItem} ${isActive ? 'bg-white/10 text-accent font-semibold shadow-glow' : 'text-white/75'}`}>
              <Settings className="h-4 w-4" />
              Profile & Settings
            </NavLink>
          </nav>
          <div className="mt-auto pt-10">
            <NavLink to="/profile" className="block rounded-3xl border border-line bg-panel2 p-3.5 transition hover:border-accent/40 hover:bg-panel2/80">
              <div className="flex items-center gap-3">
                <Avatar avatarId={user?.avatar} size="md" ring />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold">Logged in</div>
                  <div className="truncate font-bold text-sm text-white">{user?.name}</div>
                  <div className="truncate text-[11px] text-white/50">{user?.email}</div>
                </div>
              </div>
            </NavLink>
            <Button variant="ghost" className="mt-3 w-full justify-start text-xs py-2.5" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-1 text-white/60" />
              Logout
            </Button>
          </div>
        </aside>
        <main className="pb-24 lg:pb-8">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 backdrop-blur-xl lg:hidden shadow-2xl safe-bottom">
        <div className="grid grid-cols-4 px-2 py-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-[11px] font-medium transition ${
                isActive ? 'text-accent font-bold' : 'text-white/55 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="h-5 w-5 mb-0.5" />
            Dashboard
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-[11px] font-medium transition ${
                isActive ? 'text-accent font-bold' : 'text-white/55 hover:text-white'
              }`
            }
          >
            <Trophy className="h-5 w-5 mb-0.5" />
            Ranks
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-[11px] font-medium transition ${
                isActive ? 'text-accent font-bold' : 'text-white/55 hover:text-white'
              }`
            }
          >
            <div className="relative mb-0.5">
              <Avatar avatarId={user?.avatar} size="xs" ring={false} />
            </div>
            Settings
          </NavLink>
          <button
            className="flex flex-col items-center justify-center py-2 text-[11px] font-medium text-white/55 hover:text-white transition"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5 mb-0.5 text-white/45" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}
