import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Search, Activity, GitBranch, Cpu, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';
import { ScrollProgress } from '../components/ScrollProgress';

import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

export const Home = () => {
  const { user } = useAppStore();

  const handleGithubConnect = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } catch (error) {
      console.error('Failed to trigger GitHub OAuth', error);
    }
  };

  return (
    <div className="min-h-screen bg-black transition-colors duration-300">
      <ScrollProgress />
      {/* Hero Section */}
      <section className="relative pt-22 pb-22 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-950/10 rounded-full blur-3xl opacity-50" />
        </div>
 
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-red-950/30 text-red-500 text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" />
                <span>The Ultimate Guardian of Projects</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
                Your Project's <span className="text-red-600 italic">Autonomous</span> Guardian.
              </h1>
              <p className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
                RepoGuardian AI stands watch over your GitHub repositories analyzing structures, explaining logic, and <span className="text-red-600 font-semibold">healing architectural risks</span> automatically.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="h-14 px-8 text-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40 transition-transform rounded-xl">
                      Enter Intelligence Core
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={handleGithubConnect}
                    size="lg" 
                    className="h-14 px-8 text-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40 transition-transform rounded-xl"
                  >
                    Enter Intelligence Core
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                )}
                
                {!user && (
                  <Button 
                    onClick={handleGithubConnect}
                    variant="outline" 
                    size="lg" 
                    className="h-14 px-8 text-lg border-red-900/30 hover:bg-red-950/20 transition-colors text-white rounded-xl"
                  >
                    <GitBranch className="mr-2 w-5 h-5" />
                    Connect GitHub
                  </Button>
                )}
              </div>

              <div className="mt-12 flex items-center space-x-8">
                <div>
                  <p className="text-3xl font-bold text-white">100%</p>
                  <p className="text-sm text-red-500 font-medium uppercase tracking-widest text-[10px]">Auto-Indexing</p>
                </div>
                <div className="w-px h-8 bg-red-900/30" />
                <div>
                  <p className="text-3xl font-bold text-white">Llama 3.3</p>
                  <p className="text-sm text-red-500 font-medium uppercase tracking-widest text-[10px]">Logic Speed</p>
                </div>
                <div className="w-px h-8 bg-red-900/30" />
                <div>
                  <p className="text-3xl font-bold text-white">RAG</p>
                  <p className="text-sm text-red-500 font-medium uppercase tracking-widest text-[10px]">Context Aware</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 glass-card p-4 overflow-hidden rounded-md">
                <img
                  src="/hero_ai_guardian.png"
                  alt="AI Guardian Visualization"
                  className="rounded-md w-full h-auto shadow-2xl opacity-90 transition-all duration-700"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-22 bg-black border-y border-red-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-white mb-6">Designed to Protect Your Work</h2>
            <p className="text-lg text-white/70">
              Go beyond simple static analysis. RepoGuardian understands the deep architectural impact of every commit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Activity className="w-6 h-6 text-red-500" />,
                title: "Impact Analysis",
                description: "Analyze how changes in one function ripple through your entire Neo4j dependency graph."
              },
              {
                icon: <Zap className="w-6 h-6 text-red-500" />,
                title: "Self-Healing",
                description: "Detect bugs and let AI generate, validate, and propose safe code fixes automatically."
              },
              {
                icon: <Search className="w-6 h-6 text-red-500" />,
                title: "Semantic Code Search",
                description: "Explore your project in natural language using high-dimension Gemini embeddings."
              },
              {
                icon: <GitBranch className="w-6 h-6 text-red-500" />,
                title: "Knowledge Sync",
                description: "Automatically refresh RAG and Graph data every time you push new code to GitHub."
              },
              {
                icon: <Cpu className="w-6 h-6 text-red-500" />,
                title: "Inference Speed",
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
                <Card className="h-full border-2 border-red-900/40 hover:border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.05)] hover:shadow-[0_0_30px_rgba(255,0,0,0.15)] transition-all duration-500 group bg-black rounded-md overflow-hidden">
                  <CardContent className="pt-8 p-8">
                    <div className="w-12 h-12 rounded-xl bg-red-950/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed text-sm font-medium">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-black">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-black border border-red-900/40 rounded-md p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-red-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] -z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400/5 blur-[100px] -z-0" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to activate your Guardian ?</h2>
              <p className="text-red-500/80 text-lg mb-10 max-w-2xl mx-auto font-medium">
                Join engineering teams using RepoGuardian to automate architectural analysis and prevent critical breakages.
              </p>
              <Link to="/dashboard">
                <Button variant="primary" size="lg" className="h-16 px-10 text-xl bg-red-600 text-white hover:bg-red-700 rounded-md transition-all shadow-xl shadow-red-900/40">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-red-900/20 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <img src="/favicon.png" className="w-10 h-10 rounded-md shadow-lg shadow-red-900/20" alt="Logo" />
                <span className="text-xl font-bold text-white tracking-tighter">RepoGuardian AI</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-6 font-medium">
                The autonomous structural guardian for modern codebases. Powered by deep architectural reasoning and Graph-RAG intelligence.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/prajwal-priyadarshan/RepoGuardian_ai" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-md bg-red-950/20 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all">
                  <GitBranch className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-[11px]">Intelligence Core</h4>
              <ul className="space-y-4">
                <li><Link to="/dashboard" className="text-white/40 hover:text-red-500 transition-colors text-sm font-medium">Dashboard Overview</Link></li>
                <li><Link to="/ai-analysis" className="text-white/40 hover:text-red-500 transition-colors text-sm font-medium">AI Structural Analysis</Link></li>
                <li><Link to="/impact" className="text-white/40 hover:text-red-500 transition-colors text-sm font-medium">Impact Ripple Mapping</Link></li>
                <li><Link to="/self-heal" className="text-white/40 hover:text-red-500 transition-colors text-sm font-medium">Autonomous Healing</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-[11px]">Resources</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-white/40 hover:text-red-500 transition-colors text-sm font-medium">Documentation</a></li>
                <li><a href="#" className="text-white/40 hover:text-red-500 transition-colors text-sm font-medium">API Reference</a></li>
                <li><a href="#" className="text-white/40 hover:text-red-500 transition-colors text-sm font-medium">Architecture Deep-dive</a></li>
                <li><a href="#" className="text-white/40 hover:text-red-500 transition-colors text-sm font-medium">Release Notes</a></li>
              </ul>
            </div>

            {/* Tech Stack Column */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-[11px]">Integrations</h4>
              <div className="flex flex-wrap gap-3">
                {['Neo4j', 'Pinecone', 'Llama 3.3', 'FastAPI', 'Groq', 'React'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-red-950/20 border border-red-900/30 text-red-500 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-8 p-4 bg-red-900/5 border border-red-900/20 rounded-md">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Current Status</p>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] text-white/80 font-medium">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-red-900/20 flex flex-col md:flex-row justify-between items-center text-white/20 text-[11px] font-bold uppercase tracking-[0.2em]">
            <p>© 2026 RepoGuardian AI. Standing watch over your code.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-red-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-red-500 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

