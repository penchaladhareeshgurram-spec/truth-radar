import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Search, BrainCircuit, ArrowRight } from 'lucide-react';

export function Hero({ onAnalyzeClick }: { onAnalyzeClick: () => void }) {
  return (
    <div className="relative overflow-hidden pt-24 pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-500/50 text-red-300 text-sm font-medium mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(220,38,38,0.3)]"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Friends Don't Lie</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-black text-white tracking-widest mb-8 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] uppercase"
        >
          Don't let the <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800">
            Upside Down
          </span>
          <br /> shape your reality.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-slate-100 mb-10 drop-shadow-lg font-medium"
        >
          Verify articles, social media posts, and news snippets instantly. 
          Our advanced AI engine analyzes linguistic patterns, sources, and context to separate fact from fiction.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={onAnalyzeClick}
            className="flex items-center gap-2 px-8 py-4 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:-translate-y-0.5 w-full sm:w-auto justify-center border border-red-500/50"
          >
            <Search className="w-5 h-5" />
            Analyze Content
          </button>
          <a 
            href="#how-it-works"
            className="flex items-center gap-2 px-8 py-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-slate-200 rounded-xl font-bold text-lg transition-all w-full sm:w-auto justify-center border border-red-900/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            How it works
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left"
        >
          {[
            { icon: BrainCircuit, title: "Deep Analysis", desc: "Evaluates emotional language, logical fallacies, and sensationalism." },
            { icon: ShieldAlert, title: "Source Verification", desc: "Cross-references claims with known reliable databases and patterns." },
            { icon: Search, title: "Instant Results", desc: "Get a comprehensive trust score and breakdown in seconds." }
          ].map((feature, i) => (
            <div key={i} className="bg-black/60 border border-red-900/40 rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(220,38,38,0.1)]">
              <div className="bg-red-900/40 w-12 h-12 rounded-xl flex items-center justify-center text-red-500 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.3)] border border-red-500/20">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display tracking-wide">{feature.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

