import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Repositories } from './pages/Repositories';
import { AIAnalysis } from './pages/AIAnalysis';
import { ImpactAnalysis } from './pages/ImpactAnalysis';
import { SelfHealing } from './pages/SelfHealing';
import { CodeSearch } from './pages/CodeSearch';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/repositories" element={<Repositories />} />
              <Route path="/ai-analysis" element={<AIAnalysis />} />
              <Route path="/impact" element={<ImpactAnalysis />} />
              <Route path="/self-heal" element={<SelfHealing />} />
              <Route path="/search" element={<CodeSearch />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;

// Made with Bob
