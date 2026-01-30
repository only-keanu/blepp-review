import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExamTimer } from '../../components/exams/ExamTimer';
import { ExamProgress } from '../../components/exams/ExamProgress';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';
// Mock exam data
const MOCK_EXAM_QUESTIONS = Array.from(
  {
    length: 20
  },
  (_, i) => ({
    id: String(i),
    text: `Question ${i + 1}: This is a simulated board exam question to test your knowledge.`,
    choices: ['Option A', 'Option B', 'Option C', 'Option D']
  })
);
export function TakeExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const currentQuestion = MOCK_EXAM_QUESTIONS[currentQuestionIndex];
  const totalQuestions = MOCK_EXAM_QUESTIONS.length;
  const handleAnswer = (choiceIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: choiceIndex
    }));
  };
  const toggleFlag = () => {
    setFlagged((prev) =>
    prev.includes(currentQuestionIndex) ?
    prev.filter((i) => i !== currentQuestionIndex) :
    [...prev, currentQuestionIndex]
    );
  };
  const handleSubmit = () => {
    navigate(`/dashboard/exams/results/${id}`);
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-slate-900">BLEPP Simulation</h1>
          <div className="flex items-center gap-4">
            <ExamTimer durationMinutes={45} onTimeUp={handleSubmit} />
            <Button size="sm" onClick={() => setIsSubmitModalOpen(true)}>
              Submit Exam
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="min-h-[400px] flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <span className="text-sm font-medium text-slate-500">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-2 text-sm font-medium ${flagged.includes(currentQuestionIndex) ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}>

                <Flag
                  className={`h-4 w-4 ${flagged.includes(currentQuestionIndex) ? 'fill-current' : ''}`} />

                {flagged.includes(currentQuestionIndex) ?
                'Flagged' :
                'Flag for Review'}
              </button>
            </div>

            <h2 className="text-xl font-medium text-slate-900 mb-8">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3 flex-1">
              {currentQuestion.choices.map((choice, idx) =>
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`
                    w-full text-left p-4 rounded-lg border-2 transition-all flex items-center
                    ${answers[currentQuestionIndex] === idx ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 hover:border-teal-200 hover:bg-slate-50 text-slate-700'}
                  `}>

                  <div
                  className={`
                    h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0
                    ${answers[currentQuestionIndex] === idx ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 text-slate-500'}
                  `}>

                    {String.fromCharCode(65 + idx)}
                  </div>
                  {choice}
                </button>
              )}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
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
        </div>

        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card title="Question Navigator" className="sticky top-24">
            <ExamProgress
              totalQuestions={totalQuestions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              flagged={flagged}
              onJumpToQuestion={setCurrentQuestionIndex} />

            <div className="mt-6 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-100 border border-teal-200 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded"></div>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded relative">
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

        <p className="text-slate-600">
          You have answered{' '}
          <span className="font-bold text-slate-900">
            {Object.keys(answers).length}
          </span>{' '}
          out of{' '}
          <span className="font-bold text-slate-900">{totalQuestions}</span>{' '}
          questions.
        </p>
        {Object.keys(answers).length < totalQuestions &&
        <p className="mt-2 text-amber-600 text-sm">
            Warning: You have unanswered questions. Unanswered questions will be
            marked as incorrect.
          </p>
        }
      </Modal>
    </div>);

}