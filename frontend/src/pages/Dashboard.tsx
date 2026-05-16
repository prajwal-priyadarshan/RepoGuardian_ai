import { motion } from 'framer-motion';
import {
  Activity,
  GitBranch,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Search,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent, Button } from '../components/ui';
import { useAppStore } from '../store/useAppStore';

export const Dashboard = () => {
  const { repositories, aiAnalysis, impactAnalysis } = useAppStore();

  const stats = [
    {
      label: 'Total Repos',
      value: repositories.length,
      icon: GitBranch,
      color: 'text-red-500',
      bg: 'bg-red-950/20',
      trend: '+2 this week'
    },
    {
      label: 'AI Insights',
      value: aiAnalysis ? 1 : 0,
      icon: Shield,
      color: 'text-red-500',
      bg: 'bg-red-950/20',
      trend: 'Real-time active'
    },
    {
      label: 'Risk Score',
      value: impactAnalysis?.risk_score || '0.0',
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-950/20',
      trend: 'Calculated by Neo4j'
    },
    {
      label: 'Vulnerabilities',
      value: '0',
      icon: ShieldCheck,
      color: 'text-red-500',
      bg: 'bg-red-950/20',
      trend: 'System secure'
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-8 rounded-md bg-black border-2 border-red-900/40 text-white shadow-2xl shadow-red-900/30"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900/5 blur-[80px]" />

        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              System Pulse: <span className="text-red-500">All Systems Operational</span>
            </h1>
            <p className="text-white/60 text-lg mb-8 max-w-md">
              RepoGuardian AI is currently monitoring your repositories for architectural risks and autonomous healing opportunities.
            </p>
            <div className="flex space-x-4">
              <Button className="bg-red-600 text-white hover:bg-red-700 rounded-md px-6 h-12">
                Generate Report
              </Button>
              <Button variant="outline" className="border-red-900/40 text-white hover:bg-red-950/20 rounded-md px-6 h-12">
                Live Activity
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="w-48 h-48 rounded-full border border-red-900/20 flex items-center justify-center relative">
              <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-ping" />
              <img src="/favicon.png" className="w-20 h-20 object-cover rounded-md shadow-2xl" alt="Core Identity" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-2 border-red-900/20 hover:border-red-600 shadow-premium hover:shadow-[0_0_30px_rgba(255,0,0,0.1)] transition-all duration-500 bg-black">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-md ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center text-xs font-bold text-red-500 bg-red-950/30 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend.includes('+') ? stat.trend : 'Stable'}
                  </div>
                </div>
                <h3 className="text-white/40 font-bold text-sm uppercase tracking-wider mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Recent Pulse</h2>
            <Button variant="ghost" className="text-red-500 font-bold hover:bg-red-950/20">View History</Button>
          </div>

          <div className="space-y-4">
            {repositories.length > 0 ? (
              repositories.slice(0, 4).map((repo, i) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group glass-card p-5 flex items-center justify-between hover:border-red-900/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-md bg-red-950/10 flex items-center justify-center group-hover:bg-red-900/20 transition-colors">
                      <GitBranch className="w-6 h-6 text-white/40 group-hover:text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-red-500 transition-colors">{repo.name}</h4>
                      <p className="text-xs text-white/40 font-medium flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Added {new Date(repo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-900/20 text-red-500">INDEXED</span>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-red-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 glass-card">
                <Zap className="w-12 h-12 mx-auto text-white/20 mb-4" />
                <p className="text-white/40 font-medium">No activity recorded yet. Connect a repo to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Actions</h2>
          <div className="grid gap-4">
            <Button className="w-full h-14 bg-black border-2 border-red-900/30 text-white hover:bg-red-900/10 hover:border-red-600 shadow-sm rounded-md flex justify-between px-6 transition-all">
              <span className="flex items-center font-bold">
                <Search className="w-5 h-5 mr-3 text-red-500" />
                Semantic Search
              </span>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </Button>
            <Button className="w-full h-14 bg-black border-2 border-red-900/30 text-white hover:bg-red-900/10 hover:border-red-600 shadow-sm rounded-md flex justify-between px-6 transition-all">
              <span className="flex items-center font-bold">
                <ShieldCheck className="w-5 h-5 mr-3 text-red-500" />
                Verify Security
              </span>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </Button>
            <Button className="w-full h-14 bg-black border-2 border-red-900/30 text-white hover:bg-red-900/10 hover:border-red-600 shadow-sm rounded-md flex justify-between px-6 transition-all">
              <span className="flex items-center font-bold">
                <Activity className="w-5 h-5 mr-3 text-red-500" />
                Infrastructure Graph
              </span>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </Button>
          </div>

          {/* AI Tip */}
          <div className="p-6 rounded-md bg-red-950/10 border-2 border-red-900/30 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-900/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-bold mb-2 flex items-center">
              <img src="/favicon.png" className="w-4 h-4 mr-2 object-cover rounded-sm" alt="AI" />
              AI Recommendation
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
              RepoGuardian noticed a circular dependency in your core module. Run an <strong>Impact Analysis</strong> to identify potential breakages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

