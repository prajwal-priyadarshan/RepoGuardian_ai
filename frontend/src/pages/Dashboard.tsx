import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { FolderGit2, Brain, GitBranch, Wrench, Search, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  const { repositories } = useAppStore();

  const stats = [
    {
      label: 'Repositories',
      value: repositories.length,
      icon: FolderGit2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'AI Analyses',
      value: '0',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Impact Checks',
      value: '0',
      icon: GitBranch,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Auto-Fixes',
      value: '0',
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to RepoGuardian AI - Your intelligent code analysis platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="elevated">
              <CardContent className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with RepoGuardian AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/repositories"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <FolderGit2 className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                Add Repository
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Clone or upload a repository to start analyzing
              </p>
            </a>

            <a
              href="/ai-analysis"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <Brain className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                AI Analysis
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Analyze code changes with AI-powered insights
              </p>
            </a>

            <a
              href="/search"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <Search className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                Search Code
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Find code using natural language queries
              </p>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity yet</p>
            <p className="text-sm mt-1">Start by adding a repository</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Made with Bob
