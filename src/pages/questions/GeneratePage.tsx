import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { PDFUploader } from '../../components/questions/PDFUploader';
import { QuestionGenerator } from '../../components/questions/QuestionGenerator';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Question } from '../../types';
export function GeneratePage() {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const handleUploadComplete = (uploadedFile: File) => {
    setFile(uploadedFile);
  };
  const handleSaveQuestions = (questions: Question[]) => {
    // In real app, save to DB
    alert(`Saved ${questions.length} questions to your bank!`);
    navigate('/dashboard/questions/bank');
  };
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/questions/bank"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">

            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Generate Questions
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Upload your review materials to create custom practice questions.
            </p>
          </div>
        </div>

        {!file ?
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
              1. Upload PDF Reviewer
            </h2>
            <PDFUploader onUploadComplete={handleUploadComplete} />
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
              <p className="font-medium mb-1">Note on Copyright</p>
              <p>
                We analyze your PDF to generate questions but do not store the
                original text. Your materials remain private.
              </p>
            </div>
          </div> :

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                2. AI Generation
              </h2>
              <button
              onClick={() => setFile(null)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline">

                Change File
              </button>
            </div>
            <QuestionGenerator file={file} onSave={handleSaveQuestions} />
          </div>
        }
      </div>
    </AppLayout>);

}
