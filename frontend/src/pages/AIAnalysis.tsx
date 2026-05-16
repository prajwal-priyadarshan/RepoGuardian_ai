import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui';
import { Brain } from 'lucide-react';

export const AIAnalysis = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Analysis</h1>
        <p className="text-gray-600 mt-1">
          Analyze code changes with AI-powered insights
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>AI Analysis feature is under development</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

// Made with Bob
