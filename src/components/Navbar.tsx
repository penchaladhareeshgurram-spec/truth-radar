import React from 'react';
import { ShieldCheck, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/20 bg-slate-950/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="bg-red-500/20 p-2 rounded-lg text-red-400 group-hover:text-red-300 transition-colors"
              >
                <ShieldCheck className="w-6 h-6" />
              </motion.div>
              <span className="font-display font-black text-2xl tracking-widest text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] uppercase">VERITAS<span className="text-red-600">.</span></span>
            </Link>

            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-red-400 flex items-center gap-2 ${location.pathname === '/dashboard' ? 'text-red-400' : 'text-slate-300'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-200">{user?.displayName}</span>
                  <span className="text-xs text-slate-400">{user?.email}</span>
                </div>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-600" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-2"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
  );
}
