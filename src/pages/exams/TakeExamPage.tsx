import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExamTimer } from '../../components/exams/ExamTimer';
import { ExamProgress } from '../../components/exams/ExamProgress';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import { apiFetch } from '../../lib/api';

type ExamSessionResponse = {
  id: string;
  examId: string;
  totalQuestions: number;
  durationMinutes: number;
};

type SessionQuestion = {
  questionId: string;
  text: string;
  choices: string[];
};

export function TakeExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);

  useEffect(() => {
    const startSession = async () => {
      if (!id) return;
      setIsLoading(true);
      setError('');
      try {
        let session: ExamSessionResponse | null = null;
        if (id.includes('-')) {
          const questions = await apiFetch<SessionQuestion[]>(
            `/api/exams/session/${id}/questions`
          );
          setSessionId(id);
          setQuestions(questions);
          return;
        }
        session = await apiFetch<ExamSessionResponse>(`/api/exams/${id}/session`, {
          method: 'POST'
        });
        setSessionId(session.id);
        setDurationMinutes(session.durationMinutes);
        const qs = await apiFetch<SessionQuestion[]>(
          `/api/exams/session/${session.id}/questions`
        );
        setQuestions(qs);
      } catch (err) {
        setError('Failed to start exam session.');
      } finally {
        setIsLoading(false);
      }
    };
    startSession();
  }, [id]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswer = async (choiceIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: choiceIndex
    }));
    if (!sessionId || !currentQuestion) return;
    try {
      await apiFetch<void>(`/api/exams/session/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          questionId: currentQuestion.questionId,
          selectedAnswerIndex: choiceIndex,
          flagged: flagged.includes(currentQuestionIndex)
        })
      });
    } catch (err) {
      setError('Failed to save answer.');
    }
  };

  const toggleFlag = async () => {
    if (!currentQuestion || !sessionId) return;
    const isFlagged = flagged.includes(currentQuestionIndex);
    const next = isFlagged
      ? flagged.filter((i) => i !== currentQuestionIndex)
      : [...flagged, currentQuestionIndex];
    setFlagged(next);
    try {
      await apiFetch<void>(`/api/exams/session/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          questionId: currentQuestion.questionId,
          selectedAnswerIndex: answers[currentQuestionIndex],
          flagged: !isFlagged
        })
      });
    } catch (err) {
      setError('Failed to update flag.');
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    try {
      await apiFetch(`/api/exams/session/${sessionId}/submit`, { method: 'POST' });
      navigate(`/dashboard/exams/results/${sessionId}`);
    } catch (err) {
      setError('Failed to submit exam.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-slate-900 dark:text-slate-100">BLEPP Simulation</h1>
          <div className="flex items-center gap-4">
            <ExamTimer durationMinutes={durationMinutes} onTimeUp={handleSubmit} />
            <Button size="sm" onClick={() => setIsSubmitModalOpen(true)}>
              Submit Exam
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading...</div>
          ) : !currentQuestion ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              No questions available.
            </div>
          ) : (
            <Card className="min-h-[400px] flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    flagged.includes(currentQuestionIndex)
                      ? 'text-amber-600'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}>
                  <Flag
                    className={`h-4 w-4 ${
                      flagged.includes(currentQuestionIndex) ? 'fill-current' : ''
                    }`}
                  />
                  {flagged.includes(currentQuestionIndex) ? 'Flagged' : 'Flag for Review'}
                </button>
              </div>

              <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-8">
                {currentQuestion.text}
              </h2>

              <div className="space-y-3 flex-1">
                {currentQuestion.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all flex items-center
                      ${
                        answers[currentQuestionIndex] === idx
                          ? 'border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-100'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }
                    `}>
                    <div
                      className={`
                        h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0
                        ${
                          answers[currentQuestionIndex] === idx
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                        }
                      `}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {choice}
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Previous
                </Button>
                <Button
                  variant="primary"
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Next
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card title="Question Navigator" className="sticky top-24">
            <ExamProgress
              totalQuestions={totalQuestions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              flagged={flagged}
              onJumpToQuestion={setCurrentQuestionIndex}
            />

            <div className="mt-6 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-100 border border-teal-200 dark:bg-teal-950/40 dark:border-teal-900 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded"></div>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded relative">
                  <div className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-amber-400 rounded-full"></div>
                </div>
                <span>Flagged</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Exam?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Yes, Submit Exam
            </Button>
          </>
        }>
        <p className="text-slate-600 dark:text-slate-300">
          You have answered{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {Object.keys(answers).length}
          </span>{' '}
          out of{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">{totalQuestions}</span>{' '}
          questions.
        </p>
        {Object.keys(answers).length < totalQuestions && (
          <p className="mt-2 text-amber-600 text-sm">
            Warning: You have unanswered questions. Unanswered questions will be marked
            as incorrect.
          </p>
        )}
      </Modal>
    </div>
  );
}
