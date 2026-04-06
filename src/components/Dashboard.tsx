import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Clock, AlertCircle, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface HistoryItem {
  id: string;
  content: string;
  trustScore: number;
  verdict: string;
  createdAt: Date;
}

export function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const items: HistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            content: data.content,
            trustScore: data.trustScore,
            verdict: data.verdict,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        setHistory(items);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'analyses');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300">Please sign in to view your dashboard</h2>
        </div>
      </div>
    );
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'Real': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Fake': return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'Suspicious': return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Analyzer
            </Link>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Your Dashboard</h1>
            <p className="text-slate-100 mt-2 drop-shadow-md font-medium">View your recent content analysis history.</p>
          </div>
        </div>

        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-700/30 flex items-center gap-3 bg-slate-900/40">
            <Clock className="w-5 h-5 text-slate-100" />
            <h2 className="text-lg font-bold text-white">Recent Analyses</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300">No analyses found. Start verifying content to build your history.</p>
              <Link to="/" className="inline-block mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20">
                Analyze Content
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {history.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={item.id} 
                  className="p-6 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                >
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-white text-sm line-clamp-2 mb-2 leading-relaxed prose prose-sm max-w-none font-medium"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                    <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.createdAt.toLocaleDateString()} {item.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 bg-slate-950/70 p-3 rounded-xl border border-slate-600 shadow-lg">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-300 uppercase tracking-wider font-bold mb-1">Score</span>
                      <span className={`text-lg font-black ${item.trustScore > 70 ? 'text-emerald-400' : item.trustScore > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {item.trustScore}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-700"></div>
                    <div className="flex flex-col items-start min-w-[80px]">
                      <span className="text-xs text-slate-300 uppercase tracking-wider font-bold mb-1">Verdict</span>
                      <div className="flex items-center gap-1.5">
                        {getVerdictIcon(item.verdict)}
                        <span className="text-sm font-bold text-white">{item.verdict}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

