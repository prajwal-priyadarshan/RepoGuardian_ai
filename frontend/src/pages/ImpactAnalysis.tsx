import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui';
import { GitBranch } from 'lucide-react';

export const ImpactAnalysis = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Impact Analysis</h1>
        <p className="text-gray-600 mt-1">
          Analyze the impact of code changes across your codebase
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <GitBranch className="w-8 h-8 text-green-600" />
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Impact Analysis feature is under development</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

// Made with Bob
