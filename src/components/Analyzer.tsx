import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, ShieldAlert, FileText, Loader2, Info, Image as ImageIcon, Video, X, Upload, Download, Sparkles, Wand2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ReactQuill from 'react-quill-new';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AnalysisResult {
  trustScore: number;
  verdict: 'Real' | 'Fake' | 'Suspicious' | 'Unverified';
  analysisDetails: string;
  keyIndicators: string[];
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  base64: string;
}

export function Analyzer() {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{ base64: string, preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError("File size exceeds 20MB limit.");
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError("Please upload an image or video file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setMedia({
        file,
        preview: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video',
        base64
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    if (media?.preview) URL.revokeObjectURL(media.preview);
    setMedia(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateImage = async () => {
    if (!genPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{
          parts: [
            {
              text: genPrompt,
            },
          ],
        }],
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      let base64 = '';
      let textFeedback = '';
      
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            base64 = part.inlineData.data;
          } else if (part.text) {
            textFeedback += part.text + ' ';
          }
        }
      }

      if (base64) {
        setGeneratedImage({
          base64,
          preview: `data:image/png;base64,${base64}`
        });
      } else {
        const reason = candidate?.finishReason || 'Unknown reason';
        const feedback = textFeedback.trim();
        throw new Error(`Failed to generate image. ${feedback ? `AI Feedback: ${feedback}` : `Reason: ${reason}`}`);
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError(err.message || "An unexpected error occurred during image generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const useGeneratedImage = () => {
    if (!generatedImage) return;

    const byteCharacters = atob(generatedImage.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], 'generated-image.png', { type: 'image/png' });

    setMedia({
      file,
      preview: generatedImage.preview,
      type: 'image',
      base64: generatedImage.base64
    });
    setGeneratedImage(null);
    setGenPrompt('');
    setError(null);
  };

  const handleAnalyze = async () => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (!plainText && !media) {
      setError("Please enter some text or upload a file to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const parts: any[] = [];
      
      if (plainText) {
        parts.push({ text: `Context/Text to analyze (formatted as HTML): "${content}"` });
      }

      if (media) {
        parts.push({
          inlineData: {
            data: media.base64,
            mimeType: media.file.type
          }
        });
        parts.push({ text: `Analyze this ${media.type} for signs of manipulation, deepfakes, or misleading content.` });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts },
        config: {
          systemInstruction: "You are an expert fact-checker and multimodal misinformation detection engine. Analyze the provided text and/or media (image/video). Determine if it is likely Real, Fake, Suspicious, or Unverified. Look for signs of AI generation, digital manipulation, out-of-context usage, or factual inaccuracies. Provide a trust score from 0 to 100 (100 being completely trustworthy). Provide a detailed analysis explaining your reasoning, and a list of key indicators (e.g., 'AI artifacts', 'Manipulated metadata', 'Known misinformation pattern').",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trustScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
              verdict: { type: Type.STRING, enum: ["Real", "Fake", "Suspicious", "Unverified"] },
              analysisDetails: { type: Type.STRING, description: "Detailed explanation of the analysis" },
              keyIndicators: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of key indicators found"
              }
            },
            required: ["trustScore", "verdict", "analysisDetails", "keyIndicators"]
          }
        }
      });

      const jsonStr = response.text?.trim() || "{}";
      const parsedResult = JSON.parse(jsonStr) as AnalysisResult;
      setResult(parsedResult);

      if (user) {
        try {
          await addDoc(collection(db, 'analyses'), {
            userId: user.uid,
            content: content.substring(0, 10000) || `Analyzed ${media?.type || 'media'}`,
            trustScore: parsedResult.trustScore,
            verdict: parsedResult.verdict,
            analysisDetails: parsedResult.analysisDetails,
            createdAt: serverTimestamp()
          });
        } catch (dbError) {
          console.error("Failed to save analysis to history", dbError);
        }
      }

    } catch (err) {
      console.error(err);
      setError("An error occurred during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadResult = (format: 'txt' | 'json') => {
    if (!result) return;

    let contentStr = '';
    let fileName = `veritas-analysis-${new Date().toISOString().split('T')[0]}`;
    let mimeType = '';

    if (format === 'json') {
      contentStr = JSON.stringify(result, null, 2);
      fileName += '.json';
      mimeType = 'application/json';
    } else {
      contentStr = `Veritas Content Analysis Result\n` +
                `==============================\n\n` +
                `Verdict: ${result.verdict}\n` +
                `Trust Score: ${result.trustScore}/100\n\n` +
                `Detailed Analysis:\n` +
                `${result.analysisDetails}\n\n` +
                `Key Indicators:\n` +
                `${result.keyIndicators.map(i => `- ${i}`).join('\n')}\n\n` +
                `Generated on: ${new Date().toLocaleString()}`;
      fileName += '.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([contentStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Real': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Fake': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'Suspicious': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'Real': return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case 'Fake': return <AlertCircle className="w-6 h-6 text-rose-400" />;
      case 'Suspicious': return <ShieldAlert className="w-6 h-6 text-amber-400" />;
      default: return <Info className="w-6 h-6 text-slate-400" />;
    }
  };

  const modules = {
    toolbar: [
      ['bold', 'italic'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="analyzer">
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-700/30 bg-slate-900/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2 mb-2 tracking-wide drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              <FileText className="w-6 h-6 text-red-500" />
              Multimodal Analyzer
            </h2>
            <p className="text-slate-300 text-sm font-medium tracking-wider">Analyze text, images, or videos for authenticity.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-slate-800"
              title="Upload Image/Video"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
          </div>
        </div>
        
        <div className="p-6 sm:p-8 border-b border-slate-700/30 bg-slate-900/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Sparkles className="w-5 h-5 text-amber-400" />
              AI Image Generator
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder="Describe an image to generate and analyze..."
                className="flex-1 bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
              />
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !genPrompt.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-amber-500/20"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Generate
              </button>
            </div>

            <AnimatePresence>
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-2"
                >
                  <div className="relative group rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950/50 aspect-square max-w-xs mx-auto shadow-2xl shadow-amber-500/10">
                    <img src={generatedImage.preview} alt="Generated" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setGeneratedImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-slate-400 hover:text-red-400 rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={useGeneratedImage}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Use for Analysis
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="space-y-4">
            <div className="bg-slate-950/50 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500/50 focus-within:border-red-500 transition-all">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Paste text or context here..."
                readOnly={isAnalyzing}
              />
            </div>

            <AnimatePresence>
              {media && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950/50 aspect-video max-h-64 mx-auto"
                >
                  {media.type === 'image' ? (
                    <img src={media.preview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <video src={media.preview} className="w-full h-full object-contain" controls />
                  )}
                  <button
                    onClick={removeMedia}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-slate-400 hover:text-red-400 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 text-xs text-slate-300 rounded backdrop-blur-sm flex items-center gap-1.5">
                    {media.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    {media.file.name}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <div className="mt-6 flex items-center justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!content.replace(/<[^>]*>/g, '').trim() && !media)}
              className="flex items-center gap-2 px-6 py-3 bg-red-700 hover:bg-red-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] border border-red-500/50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Now'
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border-t border-slate-700/50 bg-slate-950/40 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display font-bold text-white tracking-wide drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">Analysis Result</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadResult('txt')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all border border-slate-700/50"
                    title="Download as TXT"
                  >
                    <Download className="w-3.5 h-3.5" />
                    TXT
                  </button>
                  <button
                    onClick={() => downloadResult('json')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all border border-slate-700/50"
                    title="Download as JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    JSON
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`col-span-1 md:col-span-2 p-6 rounded-xl border-2 flex items-center gap-4 ${getVerdictColor(result.verdict)}`}>
                  <div className="p-3 bg-slate-950/50 rounded-full">
                    {getVerdictIcon(result.verdict)}
                  </div>
                  <div>
                    <div className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Verdict</div>
                    <div className="text-3xl font-bold">{result.verdict}</div>
                  </div>
                </div>
                
                <div className="col-span-1 p-6 rounded-xl border border-slate-600 bg-slate-900/60 flex flex-col justify-center items-center">
                  <div className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Trust Score</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${result.trustScore > 70 ? 'text-emerald-400' : result.trustScore > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {result.trustScore}
                    </span>
                    <span className="text-slate-500 font-medium">/100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Detailed Analysis</h3>
                  <p className="text-slate-100 leading-relaxed text-sm sm:text-base font-medium">
                    {result.analysisDetails}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Key Indicators</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.keyIndicators.map((indicator, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-100 bg-slate-900/70 p-3 rounded-lg border border-slate-600 font-medium">
                        <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
