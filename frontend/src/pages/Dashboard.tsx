import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  GitBranch, 
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
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      trend: '+2 this week'
    },
    { 
      label: 'AI Insights', 
      value: aiAnalysis ? 1 : 0, 
      icon: Brain, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      trend: 'Real-time active'
    },
    { 
      label: 'Risk Score', 
      value: impactAnalysis?.risk_score || '0.0', 
      icon: AlertTriangle, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      trend: 'Calculated by Neo4j'
    },
    { 
      label: 'Vulnerabilities', 
      value: '0', 
      icon: ShieldCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      trend: 'System secure'
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-8 rounded-[2rem] bg-slate-900 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[80px]" />
        
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              System Pulse: <span className="text-blue-400">All Systems Operational</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-md">
              RepoGuardian AI is currently monitoring your repositories for architectural risks and autonomous healing opportunities.
            </p>
            <div className="flex space-x-4">
               <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-6 h-12">
                 Generate Report
               </Button>
               <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800 rounded-xl px-6 h-12">
                 Live Activity
               </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="w-48 h-48 rounded-full border border-slate-700 flex items-center justify-center relative">
               <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ping" />
               <Brain className="w-20 h-20 text-blue-500" />
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
            <Card className="border-none shadow-premium hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend.includes('+') ? stat.trend : 'Stable'}
                  </div>
                </div>
                <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Recent Pulse</h2>
            <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50">View History</Button>
          </div>
          
          <div className="space-y-4">
            {repositories.length > 0 ? (
              repositories.slice(0, 4).map((repo, i) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group glass-card p-5 flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <GitBranch className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{repo.name}</h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Added {new Date(repo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">INDEXED</span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 glass-card">
                 <Zap className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                 <p className="text-slate-500 font-medium">No activity recorded yet. Connect a repo to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Actions</h2>
          <div className="grid gap-4">
            <Button className="w-full h-14 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm rounded-2xl flex justify-between px-6">
              <span className="flex items-center font-bold">
                <Search className="w-5 h-5 mr-3 text-blue-600" />
                Semantic Search
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>
            <Button className="w-full h-14 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm rounded-2xl flex justify-between px-6">
              <span className="flex items-center font-bold">
                <ShieldCheck className="w-5 h-5 mr-3 text-emerald-600" />
                Verify Security
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>
            <Button className="w-full h-14 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm rounded-2xl flex justify-between px-6">
              <span className="flex items-center font-bold">
                <Activity className="w-5 h-5 mr-3 text-amber-600" />
                Infrastructure Graph
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
          
          {/* AI Tip */}
          <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 relative overflow-hidden group">
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-200/50 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
             <h4 className="text-indigo-900 font-bold mb-2 flex items-center">
               <Brain className="w-4 h-4 mr-2" />
               AI Recommendation
             </h4>
             <p className="text-indigo-700 text-sm leading-relaxed">
               RepoGuardian noticed a circular dependency in your core module. Run an <strong>Impact Analysis</strong> to identify potential breakages.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
