'use client';

import { useDropzone } from 'react-dropzone';
import { Upload, Video, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface UploadDropzoneProps {
  onUploadComplete: (videoId: string) => void;
}

export function UploadDropzone({ onUploadComplete }: UploadDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        }
      });

      if (response.data.success) {
        await axios.post(`${API_URL}/api/process/${response.data.video_id}`);
        onUploadComplete(response.data.video_id);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxSize: 10 * 1024 * 1024 * 1024,
    multiple: false
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragActive 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-gray-600 hover:border-purple-400'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-purple-500/20">
            <Video className="w-12 h-12 text-purple-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isDragActive ? 'Drop your video here' : 'Upload HD Video'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Drag & drop or click to browse (up to 10GB)
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ✅ Supports 4K, 1080p • MP4, MOV, AVI, MKV
            </p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Uploading & Processing...</span>
            <span className="text-purple-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 animate-pulse" />
            AI is finding viral moments...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
          <X className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
