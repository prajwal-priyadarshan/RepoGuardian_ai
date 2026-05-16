import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  FolderGit2,
  Brain,
  GitBranch,
  Wrench,
  Search,
  Activity,
} from 'lucide-react';
import { Toast } from './ui/Toast';
import { useHealthCheck } from '../hooks/useAPI';
import { getBaseURL } from '../lib/api.client';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/repositories', label: 'Repositories', icon: FolderGit2 },
  { path: '/ai-analysis', label: 'AI Analysis', icon: Brain },
  { path: '/impact', label: 'Impact Analysis', icon: GitBranch },
  { path: '/self-heal', label: 'Self-Healing', icon: Wrench },
  { path: '/search', label: 'Code Search', icon: Search },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isError } = useHealthCheck();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toast />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  RepoGuardian AI
                </h1>
                <p className="text-xs text-gray-500">Intelligent Code Analysis</p>
              </div>
            </Link>

            {/* Backend Status */}
            <div className="flex items-center space-x-2">
              <Activity
                className={`w-4 h-4 ${
                  isError ? 'text-red-500' : 'text-green-500'
                }`}
              />
              <span className="text-sm text-gray-600">
                {isError ? 'Backend Offline' : 'Backend Online'}
              </span>
              <span className="text-xs text-gray-400">
                ({getBaseURL()})
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative"
                >
                  <div
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            RepoGuardian AI - Powered by Neo4j, Pinecone, and Groq Llama 3.3
          </p>
        </div>
      </footer>
    </div>
  );
};

// Made with Bob
