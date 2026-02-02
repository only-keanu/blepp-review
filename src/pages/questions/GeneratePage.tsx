import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { PDFUploader } from '../../components/questions/PDFUploader';
import { QuestionGenerator } from '../../components/questions/QuestionGenerator';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Select } from '../../components/ui/Select';
import { Question, Topic } from '../../types';
export function GeneratePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    let isMounted = true;
    const loadTopics = async () => {
      try {
        const data = await apiFetch<Topic[]>('/api/topics');
        if (isMounted) {
          setTopics(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load topics.');
        }
      }
    };
    loadTopics();
    return () => {
      isMounted = false;
    };
  }, []);
  const topicOptions = useMemo(
    () => topics.map((topic) => ({ value: topic.id, label: topic.name })),
    [topics]
  );
  const topicName = useMemo(
    () => topics.find((topic) => topic.id === topicId)?.name ?? '',
    [topics, topicId]
  );
  const handleUploadComplete = (uploadedFile: File, uploadedId: string) => {
    setFile(uploadedFile);
    setUploadId(uploadedId);
  };
  const handleSaveQuestions = (questions: Question[]) => {
    // In real app, save to DB
    if (!topicId) {
      alert('Please select a topic before saving.');
      return;
    }
    const payload = questions.map((question) => ({
      topicId,
      text: question.text,
      choices: question.choices,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation,
      difficulty: question.difficulty.toUpperCase(),
      source: 'AI',
      tags: question.tags ?? [],
      category: question.category ?? null
    }));
    apiFetch<Question[]>('/api/questions/bulk', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then(() => {
        alert(`Saved ${questions.length} questions to your bank!`);
        navigate('/dashboard/questions/bank');
      })
      .catch(() => {
        alert('Failed to save questions.');
      });
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
            {error &&
            <p className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</p>
            }
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
              onClick={() => {
                setFile(null);
                setUploadId(null);
              }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline">

                Change File
              </button>
            </div>
            <div className="mb-6">
              <Select
                label="Assign generated questions to a topic"
                options={topicOptions}
                value={topicId}
                onChange={setTopicId}
                placeholder="Select topic..."
                searchable />
            </div>
            <QuestionGenerator
              file={file}
              uploadId={uploadId}
              topicId={topicId}
              topicName={topicName}
              onSave={handleSaveQuestions} />
          </div>
        }
      </div>
    </AppLayout>);

}
