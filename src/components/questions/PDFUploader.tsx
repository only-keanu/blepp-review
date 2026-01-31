import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
interface PDFUploaderProps {
  onUploadComplete: (file: File) => void;
}
export function PDFUploader({ onUploadComplete }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };
  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError('File size must be less than 10MB.');
      return;
    }
    setFile(file);
    simulateUpload(file);
  };
  const simulateUpload = (file: File) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onUploadComplete(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  const clearFile = () => {
    setFile(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  return (
    <div className="w-full">
      {!file ?
      <div
        className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}>

          <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleFileSelect} />

          <div className="bg-slate-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-6 w-6 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Click to upload or drag and drop
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            PDF files only (max 10MB)
          </p>
          {error &&
        <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
        }
        </div> :

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-950/40 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">{file.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
            onClick={clearFile}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">

              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                {uploadProgress < 100 ? 'Uploading...' : 'Upload Complete'}
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} size="sm" variant="success" />
          </div>

          {uploadProgress === 100 &&
        <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              Ready for question generation
            </div>
        }
        </div>
      }
    </div>);

}
