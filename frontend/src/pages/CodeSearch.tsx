import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui';
import { Search } from 'lucide-react';

export const CodeSearch = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Code Search</h1>
        <p className="text-gray-600 mt-1">
          Search your codebase using natural language
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Search className="w-8 h-8 text-blue-600" />
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Semantic Code Search feature is under development</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

// Made with Bob
