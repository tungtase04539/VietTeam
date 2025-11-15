import React, { useState, useRef } from 'react';
import { uploadVideoToDrive, initGoogleDrive, initGoogleIdentity } from '../services/googleDrive';

interface VideoUploadProps {
  employeeName: string;
  date: string; // YYYY-MM-DD
  taskName: string;
  onUploadComplete: (videoData: { url: string; fileId: string; fileName: string }) => void;
  existingVideo?: { url: string; fileName: string };
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  employeeName,
  date,
  taskName,
  onUploadComplete,
  existingVideo,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = parseInt(import.meta.env.VITE_MAX_VIDEO_SIZE || '524288000'); // 500MB
  const ALLOWED_TYPES = (import.meta.env.VITE_ALLOWED_VIDEO_TYPES || 'video/mp4,video/quicktime,video/webm').split(',');

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Chỉ chấp nhận file: ${ALLOWED_TYPES.join(', ')}`;
    }
    if (file.size > MAX_SIZE) {
      return `File quá lớn. Tối đa ${(MAX_SIZE / 1024 / 1024).toFixed(0)}MB`;
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Initialize Google APIs
      await initGoogleDrive();
      await initGoogleIdentity();

      // Upload to Drive
      const result = await uploadVideoToDrive(
        file,
        employeeName,
        date,
        taskName,
        (prog) => setProgress(prog)
      );

      onUploadComplete({
        url: result.webViewLink,
        fileId: result.fileId,
        fileName: file.name,
      });

      setUploading(false);
      setProgress(100);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Lỗi khi upload video');
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Video Display */}
      {existingVideo && !uploading && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-green-900">Video đã upload</p>
                <p className="text-sm text-green-700">{existingVideo.fileName}</p>
              </div>
            </div>
            <a
              href={existingVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Xem video
            </a>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!existingVideo && !uploading && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
        >
          <svg
            className="w-16 h-16 mx-auto mb-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Upload video công việc
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Kéo thả file vào đây hoặc click để chọn
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            📁 Chọn video
          </button>
          <p className="text-xs text-slate-500 mt-3">
            Hỗ trợ: MP4, MOV, WebM • Tối đa {(MAX_SIZE / 1024 / 1024).toFixed(0)}MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="animate-spin">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900">Đang upload lên Google Drive...</p>
              <p className="text-sm text-blue-700">Vui lòng không đóng trang</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 flex items-center justify-center"
              style={{ width: `${progress}%` }}
            >
              <span className="text-xs text-white font-bold">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <p className="text-xs text-blue-600 mt-2 text-center">
            Đang tạo folder: {employeeName} → {date} → {taskName}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-red-900">Lỗi upload</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;

