import React from 'react';
import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
interface HeaderProps {
  onMenuClick: () => void;
}
export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };
  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md lg:hidden">

            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search topics or questions..."
              className="pl-9 pr-4 py-1.5 w-64 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />

          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Psychology Student</p>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-2 focus:outline-none">
                <img
                  src={user?.avatarUrl}
                  alt={user?.fullName}
                  className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />

              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800 py-1 hidden group-hover:block hover:block">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2">

                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>);

}
