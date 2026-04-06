import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, AlertTriangle, Eye, Share2 } from 'lucide-react';

export function Education() {
  return (
    <div className="py-24 border-t border-slate-800/50 bg-slate-950/40 backdrop-blur-sm" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">Why Fake News Spreads</h2>
          <p className="text-slate-100 text-lg drop-shadow-md font-medium">
            Understanding the mechanics of misinformation is the first step to combating it. 
            Here's why false content often goes viral faster than the truth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: AlertTriangle,
              title: "Emotional Triggering",
              desc: "Fake news is designed to evoke strong emotions like anger or fear, which bypasses critical thinking and prompts immediate sharing.",
              color: "text-rose-400",
              bg: "bg-rose-400/10"
            },
            {
              icon: Eye,
              title: "Confirmation Bias",
              desc: "People are more likely to believe and share information that aligns with their pre-existing beliefs, regardless of its factual accuracy.",
              color: "text-amber-400",
              bg: "bg-amber-400/10"
            },
            {
              icon: Share2,
              title: "Algorithmic Amplification",
              desc: "Social media algorithms prioritize engagement. Outrageous (often false) claims generate more clicks, leading to wider distribution.",
              color: "text-blue-400",
              bg: "bg-blue-400/10"
            },
            {
              icon: BookOpen,
              title: "Information Overload",
              desc: "With so much content available, users rarely have the time to fact-check every claim, making it easy for subtle misinformation to slip through.",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-600 rounded-2xl p-6 hover:bg-slate-800/50 transition-colors shadow-2xl"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg ${item.bg} ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-100 text-sm leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 bg-gradient-to-br from-red-900/40 to-blue-900/40 border border-red-500/20 rounded-3xl p-8 md:p-12 text-center backdrop-blur-md shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-md">How to Spot Fake Content</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 text-left max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center text-red-300 font-bold shrink-0 shadow-lg">1</div>
              <div>
                <h4 className="font-bold text-white">Check the Source</h4>
                <p className="text-sm text-slate-100 mt-1 font-medium">Is it a reputable news organization or an unknown blog?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center text-red-300 font-bold shrink-0 shadow-lg">2</div>
              <div>
                <h4 className="font-bold text-white">Read Beyond the Headline</h4>
                <p className="text-sm text-slate-100 mt-1 font-medium">Headlines are often sensationalized to get clicks.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center text-red-300 font-bold shrink-0 shadow-lg">3</div>
              <div>
                <h4 className="font-bold text-white">Check the Date</h4>
                <p className="text-sm text-slate-100 mt-1 font-medium">Old news is often recycled out of context to spark outrage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

