'use client';

import { useState, useEffect } from 'react';
import { UploadDropzone } from '@/components/UploadDropzone';
import { Sparkles, Download, Clock, TrendingUp, Film, Eye } from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (videoId) {
      checkClips();
    }
  }, [videoId]);

  const checkClips = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clips/${videoId}`);
      if (response.data.clips && response.data.clips.length > 0) {
        setClips(response.data.clips);
        setLoading(false);
      } else {
        setTimeout(checkClips, 3000);
      }
    } catch (error) {
      setTimeout(checkClips, 3000);
    }
  };

  const handleUploadComplete = (id: string) => {
    setVideoId(id);
    setLoading(true);
  };

  const downloadClip = (filename: string) => {
    window.open(`${API_URL}/api/download/${videoId}/${filename}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">法哈德</span>
            <Sparkles className="text-purple-400 w-5 h-5 animate-pulse" />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
              ● FREE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Turn Long Videos Into Viral Shorts 🔥
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Upload your video and let AI find the best moments with 
            <span className="text-purple-400"> Ken Burns Zoom</span>, 
            <span className="text-pink-400"> Effects</span>, 
            <span className="text-blue-400"> Color Grading</span> & more!
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">🎥 4K Support</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">🚀 10GB Uploads</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">⚡ 60fps</span>
          </div>
        </div>

        {/* Upload Section */}
        {!videoId && (
          <UploadDropzone onUploadComplete={handleUploadComplete} />
        )}

        {/* Loading Status */}
        {loading && !clips.length && (
          <div className="mt-8 p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="animate-spin">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI is analyzing your video...</h3>
                <p className="text-sm text-gray-400">Finding viral moments & applying effects</p>
              </div>
            </div>
            <div className="mt-4 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Results */}
        {clips.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Your Viral Clips Are Ready! 🎉</h3>
                <p className="text-sm text-gray-400">{clips.length} AI-generated shorts</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clips.map((clip, index) => (
                <div key={index} className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-purple-400/30 transition-all">
                  <div className="aspect-[9/16] bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center mb-3 relative">
                    <Film className="w-12 h-12 text-gray-400" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
                      <span className="text-xs font-bold text-yellow-400">🔥 85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Clip {index + 1}</p>
                      <p className="text-xs text-gray-400">30s • Viral Score: 85%</p>
                    </div>
                    <button
                      onClick={() => downloadClip(clip.filename)}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-xs font-semibold hover:opacity-80 transition flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => clips.forEach(c => downloadClip(c.filename))}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-80 transition flex items-center gap-2 mx-auto"
              >
                <Download className="w-4 h-4" />
                Download All Clips
              </button>
            </div>
          </div>
        )}

        {/* Upload Another */}
        {clips.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setVideoId(null);
                setClips([]);
              }}
              className="text-purple-400 hover:text-purple-300 transition"
            >
              + Upload Another Video
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500 py-8 border-t border-white/5">
        <p>法哈德 AI Video Clipper • Free Beta</p>
      </footer>
    </div>
  );
}
