import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  Search,
  ChevronRight,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) {
      // Simple validation feedback
      const input = document.getElementById('sidebar-search');
      if (input) {
        input.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => input.classList.remove('ring-2', 'ring-red-500'), 1000);
      }
      return;
    }
    console.log('Searching for:', searchQuery);
    // In a real app, navigate to search results
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-900 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[300px] bg-white border-r border-slate-200 h-full shrink-0 transition-colors duration-300 shadow-xl shadow-slate-200/50 z-30">
        <div className="p-10">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={28} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl text-slate-900 tracking-tight leading-none">AuthSystem</span>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-2">Enterprise v2.0</span>
            </div>
          </Link>
        </div>

        <div className="px-6 mb-8">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              id="sidebar-search"
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden group-focus-within:flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-black text-slate-400">
              <Command size={12} />
              <span>K</span>
            </div>
          </form>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Main Menu</div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive(item.path)
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <item.icon size={22} className={cn(isActive(item.path) ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </div>
              <ChevronRight size={16} className={cn("transition-all duration-300", isActive(item.path) ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0")} />
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserCircle className="text-slate-400" size={28} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate tracking-tight">{profile?.displayName}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {isAdmin ? 'Super Admin' : 'Member'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-2xl transition-all duration-300 text-xs font-black uppercase tracking-widest shadow-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <ShieldCheck size={20} />
            </div>
            <span className="font-black text-lg text-slate-900 tracking-tight">AuthSystem</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[300px] bg-white z-[70] lg:hidden flex flex-col shadow-2xl transition-colors duration-300"
            >
              <div className="p-8 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <ShieldCheck size={24} />
                    </div>
                    <span className="font-black text-xl text-slate-900 tracking-tight">AuthSystem</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <nav className="flex-1 p-6 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold transition-all",
                      isActive(item.path)
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <item.icon size={22} />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-slate-100">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-slate-200">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserCircle className="text-slate-400" size={28} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{profile?.displayName}</p>
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">{profile?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 text-red-600 bg-red-50 rounded-2xl font-bold transition-colors"
                >
                  <LogOut size={22} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}} />
    </div>
  );
}

