import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Search, Activity, GitBranch, Cpu, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';

export const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" />
                <span>The Future of Code Security</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
                Your Code's <span className="text-blue-600">Autonomous</span> Guardian.
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                RepoGuardian AI uses Neo4j dependency graphs and Gemini-powered RAG to analyze, explain, and automatically heal your codebase.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="h-14 px-8 text-lg shadow-lg shadow-blue-200 hover:scale-105 transition-transform">
                    Enter Workspace
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-slate-200 hover:bg-slate-50 transition-colors">
                  <GitBranch className="mr-2 w-5 h-5" />
                  GitHub Integration
                </Button>
              </div>
              
              <div className="mt-12 flex items-center space-x-8">
                <div>
                  <p className="text-3xl font-bold text-slate-900">100%</p>
                  <p className="text-sm text-slate-500 font-medium">Auto-Indexing</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-3xl font-bold text-slate-900">Groq</p>
                  <p className="text-sm text-slate-500 font-medium">Llama 3.3 Speed</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-3xl font-bold text-slate-900">RAG</p>
                  <p className="text-sm text-slate-500 font-medium">Context Aware</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 glass-card p-4 overflow-hidden">
                <img 
                  src="/hero_ai_guardian.png" 
                  alt="AI Guardian Visualization" 
                  className="rounded-xl w-full h-auto shadow-2xl"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-100 rounded-full blur-2xl -z-10 animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-100 rounded-full blur-3xl -z-10 animate-pulse" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Built for Modern Engineering Teams</h2>
            <p className="text-lg text-slate-600">
              Go beyond simple static analysis. RepoGuardian understands the deep architectural impact of every commit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Activity className="w-6 h-6 text-blue-600" />,
                title: "Deep Impact Analysis",
                description: "Analyze how changes in one function ripple through your entire Neo4j dependency graph."
              },
              {
                icon: <Zap className="w-6 h-6 text-yellow-500" />,
                title: "Autonomous Self-Healing",
                description: "Detect bugs and let AI generate, validate, and propose safe code fixes automatically."
              },
              {
                icon: <Search className="w-6 h-6 text-indigo-600" />,
                title: "Semantic Code Search",
                description: "Query your codebase in natural language using high-dimension Gemini embeddings."
              },
              {
                icon: <GitBranch className="w-6 h-6 text-emerald-600" />,
                title: "Knowledge Base Sync",
                description: "Automatically refresh RAG and Graph data every time you push new code to GitHub."
              },
              {
                icon: <Cpu className="w-6 h-6 text-purple-600" />,
                title: "Multi-Model Reasoning",
                description: "Powered by Gemini for indexing and Groq (Llama 3.3) for lightning-fast analysis."
              },
              {
                icon: <Shield className="w-6 h-6 text-red-500" />,
                title: "Risk Calculation",
                description: "Instant risk scores for every commit based on structural complexity and dependencies."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow border-none shadow-premium group">
                  <CardContent className="pt-8">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -z-0" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to secure your codebase?</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                Join engineering teams using RepoGuardian to automate architectural analysis and prevent critical breakages.
              </p>
              <Link to="/dashboard">
                <Button variant="primary" size="lg" className="h-16 px-10 text-xl bg-white text-slate-900 hover:bg-slate-100 rounded-2xl">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500">
          <p>© 2026 RepoGuardian AI. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-600 transition-colors">Twitter</a>
            <a href="https://github.com/prajwal-priyadarshan/RepoGuardian_ai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
