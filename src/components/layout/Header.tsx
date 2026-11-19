import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  User as UserIcon,
  Award,
  BarChart3,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { getAvatarInitials } from '@/core/utils/userUtils';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const NAV_LINKS = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { to: '/knowledge', label: 'База знань', icon: BookOpen },
  { to: '/analytics', label: 'Аналітика', icon: BarChart3 },
  { to: '/community', label: 'Спільнота', icon: Trophy },
  { to: '/profile', label: 'Профіль', icon: Award },
];

export default function Header() {
  const { theme, toggleTheme, user, logout } = useAppStore();

  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        // ignore in local demo mode
      }
    }
    logout();
    toast.info('Ви вийшли з облікового запису');
    navigate('/auth');
  };

  const initials = getAvatarInitials(user.displayName, 'УП');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3"
      >
        {/* Left: Logo + Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition">
              ПДР
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight block leading-none">
                ПДР України <span className="text-blue-600 dark:text-blue-400">AI</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
                Адаптивна система навчання
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => {
              const isActive = exact
                ? location.pathname === to
                : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Theme Toggle & User Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={
              theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'
            }
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Avatar & Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen((v) => !v)}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-lg object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </div>
              )}
              <span className="text-xs font-medium hidden sm:block max-w-[110px] truncate">
                {user.displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold truncate">
                    {user.displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Мій профіль
                </Link>
                <Link
                  to="/knowledge"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  База знань ПДР
                </Link>
                <Link
                  to="/community"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Таблиця лідерів і Спільнота
                </Link>

                <Link
                  to="/profile?tab=settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Налаштування
                </Link>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Вийти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
