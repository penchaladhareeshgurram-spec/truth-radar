import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Analyzer } from './components/Analyzer';
import { Dashboard } from './components/Dashboard';
import { Education } from './components/Education';
import { SignInPage } from './components/SignInPage';
import { useAuth } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldCheck } from 'lucide-react';

function Background() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950">
      {/* 
        To use your specific Batman image:
        1. Upload the image to the 'public' folder in the file explorer on the left.
        2. Rename it to 'batman-bg.jpg'
        3. The image will automatically appear here.
      */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('/batman-bg.jpg'), url('https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=3270&auto=format&fit=crop')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90 backdrop-blur-[2px]"></div>
    </div>
  );
}

function HomePage() {
  const scrollToAnalyzer = () => {
    document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans text-slate-200 selection:bg-red-500/30">
      <Background />
      <Navbar />
      <main>
        <Hero onAnalyzeClick={scrollToAnalyzer} />
        <Analyzer />
        <Education />
      </main>
      <footer className="border-t border-slate-900/50 py-8 text-center text-slate-500 text-sm bg-slate-950/50 backdrop-blur-md">
        <p>&copy; {new Date().getFullYear()} Veritas Fake Content Detection Engine. All rights reserved.</p>
      </footer>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="min-h-screen font-sans text-slate-200 selection:bg-red-500/30">
      <Background />
      <Navbar />
      <Dashboard />
    </div>
  );
}

function AppContent() {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
        <Background />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-500/20 p-4 rounded-2xl text-red-400 mb-2"
        >
          <ShieldCheck className="w-12 h-12" />
        </motion.div>
        <div className="flex items-center gap-3 text-slate-400 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          Initializing Veritas...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent">
        <Background />
        <SignInPage />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
