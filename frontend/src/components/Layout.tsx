import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderGit2,
  Brain,
  GitBranch,
  Wrench,
  Search,
  Activity,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { Toast } from './ui/Toast';
import { useHealthCheck } from '../hooks/useAPI';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/repositories', label: 'Repositories', icon: FolderGit2 },
  { path: '/ai-analysis', label: 'AI Analysis', icon: Brain },
  { path: '/impact', label: 'Impact Analysis', icon: GitBranch },
  { path: '/self-heal', label: 'Self-Healing', icon: Wrench },
  { path: '/search', label: 'Code Search', icon: Search },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isError } = useHealthCheck();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Toast />

      {/* Sidebar Navigation */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 shadow-sm overflow-hidden flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 mb-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 min-w-[40px] bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    RepoGuardian <span className="text-blue-600">AI</span>
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 min-w-[20px] ${isActive ? 'text-blue-600' : 'group-hover:text-blue-600'}`} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-semibold whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-6 bg-blue-600 rounded-l-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className={`flex flex-col ${isSidebarOpen ? 'items-stretch' : 'items-center'} space-y-4`}>
            {/* Status Card */}
            {isSidebarOpen && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Status</span>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isError ? 'bg-red-500' : 'bg-green-500'}`} />
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 truncate">
                  <Activity className="w-3 h-3" />
                  <span>{isError ? 'API Offline' : 'API Operational'}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center justify-center w-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main
        className="flex-1 transition-all duration-300 min-h-screen"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        {/* Top Header Bar */}
        <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-4">
             <h2 className="text-xl font-bold text-slate-900">
                {navItems.find(i => i.path === location.pathname)?.label || 'Overview'}
             </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 tracking-tight">SECURE SESSION</span>
            </div>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-none">Developer</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Account</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" alt="User Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="p-8 max-w-7xl mx-auto">
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
