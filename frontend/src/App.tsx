import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Repositories } from './pages/Repositories';
import { AIAnalysis } from './pages/AIAnalysis';
import { ImpactAnalysis } from './pages/ImpactAnalysis';
import { SelfHealing } from './pages/SelfHealing';
import { CodeSearch } from './pages/CodeSearch';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/impact" element={<ImpactAnalysis />} />
        <Route path="/self-heal" element={<SelfHealing />} />
        <Route path="/search" element={<CodeSearch />} />
      </Routes>
    </Layout>
  );
}

export default App;

// Made with Bob
