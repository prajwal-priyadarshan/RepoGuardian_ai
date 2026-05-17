import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';
import { Button } from '../components/ui';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Cinematic Glowing Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-red-900/10 rounded-full blur-3xl opacity-60 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-red-950/5 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Cyberpunk Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />

      <div className="text-center max-w-xl space-y-8 relative z-10">
        {/* Animated Error Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-24 h-24 bg-red-950/20 border-2 border-red-900/40 rounded-2xl flex items-center justify-center shadow-lg shadow-red-950/40 animate-pulse">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-8xl sm:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-red-900 tracking-tighter leading-none select-none">
            404
          </h1>
        </motion.div>

        {/* Informative Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <Terminal className="w-6 h-6 text-red-500" />
            <span>Perimeter Breach Detected</span>
          </h2>
          <p className="text-white/60 font-medium leading-relaxed max-w-md mx-auto">
            The target file or core module you are searching for does not exist within the RepoGuardian database. It might have been encrypted, relocated, or purged.
          </p>
        </motion.div>

        {/* Premium Control Center Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
        >
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold border-red-900/30 text-white hover:bg-red-950/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home Core
            </Button>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition-transform active:scale-95">
              Enter Intelligence Core
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Futuristic Watermark */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] pointer-events-none select-none">
        System Guard Active
      </div>
    </div>
  );
};
