import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderGit2,
  Brain,
  GitBranch,
  Wrench,
  Search,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { Toast } from './ui/Toast';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-black">
      <Toast />

      {/* Sidebar Navigation */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed inset-y-0 left-0 z-40 bg-black border-r border-red-900/40 shadow-sm overflow-hidden flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 mb-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 min-w-[40px] bg-red-600 rounded-md flex items-center justify-center shadow-lg shadow-red-950/50">
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
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    RepoGuardian <span className="text-red-500">AI</span>
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
                className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-all duration-200 group relative ${isActive
                    ? 'bg-red-950/20 text-red-500'
                    : 'text-white/60 hover:bg-red-900/10 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 min-w-[20px] ${isActive ? 'text-red-500' : 'group-hover:text-red-500'}`} />
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
                    className="absolute right-0 w-1 h-6 bg-red-600 rounded-l-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-red-900/40">
          <div className={`flex flex-col ${isSidebarOpen ? 'items-stretch' : 'items-center'} space-y-4`}>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center justify-center w-full p-2 text-white/40 hover:text-white/80 hover:bg-red-900/20 rounded-md transition-colors"
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
        <header className="h-20 bg-black/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between border-b border-red-800/40">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">
              {navItems.find(i => i.path === location.pathname)?.label || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-950/10 border border-red-900/20 rounded-lg">
              <Shield className="w-4 h-4 text-white/40" />
              <span className="text-xs font-bold text-white/80 tracking-tight">SECURE SESSION</span>
            </div>
            <div className="w-px h-6 bg-red-900/30 mx-2" />
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-bold text-white group-hover:text-red-500 transition-colors leading-none">Developer</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Admin Account</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-900/20 border-2 border-red-900/40 shadow-sm flex items-center justify-center overflow-hidden">
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

        {/* Footer */}
        <footer className="mt-auto py-8 px-8 border-t border-red-900/40 flex flex-col md:flex-row justify-between items-center text-white/40 text-sm font-medium">
          <p>© 2026 RepoGuardian AI. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://github.com/prajwal-priyadarshan/RepoGuardian_ai" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">GitHub Repository</a>
            <span className="text-red-900/30">|</span>
            <p className="text-xs">Powered by Neo4j & Pinecone</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

