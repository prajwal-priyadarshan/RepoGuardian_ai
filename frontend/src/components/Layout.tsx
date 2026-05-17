import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderGit2,
  Brain,
  GitBranch,
  Database,
  Wrench,
  Search,
  X,
  MoreVertical,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Toast } from './ui/Toast';
import { useAppStore } from '../store/useAppStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/repositories', label: 'Repositories', icon: FolderGit2 },
  { path: '/operations', label: 'Operations', icon: Database },
  { path: '/ai-analysis', label: 'AI Analysis', icon: Brain },
  { path: '/impact', label: 'Impact Analysis', icon: GitBranch },
  { path: '/self-heal', label: 'Self-Healing', icon: Wrench },
  { path: '/search', label: 'Code Search', icon: Search },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAppStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Toast />

      {/* Top Navigation Bar */}
      <header className="h-20 bg-black/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-8 flex items-center justify-between border-b border-red-900/40">
        <div className="flex items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/favicon.png" className="w-9 h-9 sm:w-10 sm:h-10 rounded-md shadow-lg shadow-red-950/50 object-cover" alt="RepoGuardian Logo" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                RepoGuardian <span className="text-red-500">AI</span>
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md transition-all duration-200 group relative ${isActive
                    ? 'text-red-500 bg-red-950/10'
                    : 'text-white/60 hover:text-white hover:bg-red-900/10'
                    }`}
                >
                  <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="w-px h-6 bg-red-900/30 hidden lg:block" />

          {/* User Avatar & Mobile Toggle */}
          <div ref={userMenuRef} className="flex items-center space-x-3 relative">
            <div 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-900/20 border-2 border-red-900/40 shadow-sm flex items-center justify-center overflow-hidden cursor-pointer hover:border-red-500 transition-colors"
            >
              <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
            </div>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 mt-2 w-56 rounded-xl bg-black border border-red-900/40 shadow-2xl p-2 z-20"
                >
                  <div className="px-4 py-3 border-b border-red-900/20">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Logged in as</p>
                    <p className="text-sm font-bold text-white truncate mt-1">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-950/20 rounded-lg mt-1 transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white/60 hover:text-red-500 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MoreVertical className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black border-b border-red-900/40 overflow-hidden sticky top-20 z-40"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${isActive
                      ? 'bg-red-950/30 text-red-500'
                      : 'text-white/60 hover:bg-red-900/20 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-bold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

