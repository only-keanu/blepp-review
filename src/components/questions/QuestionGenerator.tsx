import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sparkles, Check } from 'lucide-react';
import { Question } from '../../types';
import { apiFetch } from '../../lib/api';
interface QuestionGeneratorProps {
  file: File;
  uploadId: string | null;
  topicId: string;
  topicName: string;
  onSave: (questions: Question[]) => void;
}
interface GenerationRunResponse {
  jobId: string;
  status: string;
  questionCount: number;
  questions: {
    text: string;
    choices: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty: string;
    tags: string[];
  }[];
}
export function QuestionGenerator({ file, uploadId, topicId, topicName, onSave }: QuestionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const handleGenerate = async () => {
    if (!uploadId) {
      setError('Upload is missing. Please re-upload your PDF.');
      return;
    }
    if (!topicId) {
      setError('Please select a topic before generating.');
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const response = await apiFetch<GenerationRunResponse>('/api/generation/run', {
        method: 'POST',
        body: JSON.stringify({
          uploadId,
          questionCount: 10,
          model: null
        })
      });
      const mapped = (response.questions ?? []).map((question, index) => ({
        id: `gen_${response.jobId}_${index}`,
        topicId,
        topicName,
        text: question.text,
        choices: question.choices,
        correctAnswerIndex: question.correctAnswerIndex,
        explanation: question.explanation,
        difficulty: question.difficulty?.toLowerCase?.() ?? 'medium',
        source: 'ai',
        tags: question.tags ?? []
      })) as Question[];
      setGeneratedQuestions(mapped);
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  if (generatedQuestions.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Generated Questions ({generatedQuestions.length})
          </h3>
          <Button
            onClick={() => onSave(generatedQuestions)}
            leftIcon={<Check className="h-4 w-4" />}>

            Save to Bank
          </Button>
        </div>
        <div className="space-y-4">
          {generatedQuestions.map((q, i) =>
          <Card key={q.id} className="border-l-4 border-l-teal-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-teal-600 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/40 px-2 py-1 rounded-full">
                  {q.topicName || q.topicId}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">AI Generated</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100 mb-3">{q.text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                {q.choices.map((c, idx) =>
              <div
                key={idx}
                className={`p-2 rounded ${idx === q.correctAnswerIndex ? 'bg-green-50 text-green-700 font-medium dark:bg-green-950/40 dark:text-green-300' : 'bg-slate-50 dark:bg-slate-800'}`}>

                    {String.fromCharCode(65 + idx)}. {c}
                  </div>
              )}
              </div>
            </Card>
          )}
        </div>
      </div>);

  }
  return (
    <div className="text-center py-12">
      {isGenerating ?
      <div className="space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-teal-500 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Analyzing PDF Content...
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Our AI is extracting key concepts and generating board-style
            questions.
          </p>
        </div> :

      <div className="space-y-4">
          <div className="bg-teal-50 dark:bg-teal-950/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Ready to Generate
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            We'll generate questions based on the content of{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">{file.name}</span>.
          </p>
          <Button onClick={handleGenerate} size="lg" className="mt-4">
            Generate Questions
          </Button>
          {error &&
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          }
        </div>
      }
    </div>);

}
