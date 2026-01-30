import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { QuestionCard } from '../../components/study/QuestionCard';
import { AnswerFeedback } from '../../components/study/AnswerFeedback';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { ArrowLeft, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Question } from '../../types';
// Mock Data
const MOCK_QUESTIONS: Question[] = [
{
  id: '1',
  topicId: 'General Psychology',
  text: 'Which theory emphasizes the role of unconscious processes in behavior?',
  choices: ['Behaviorism', 'Psychoanalysis', 'Humanism', 'Cognitivism'],
  correctAnswerIndex: 1,
  explanation:
  'Psychoanalysis, developed by Sigmund Freud, emphasizes unconscious processes and early childhood experiences as the primary drivers of behavior.',
  difficulty: 'medium',
  source: 'ai',
  tags: ['theories']
},
{
  id: '2',
  topicId: 'Abnormal Psychology',
  text: 'A persistent, irrational fear of a specific object or situation that leads to avoidance behavior is known as:',
  choices: [
  'Panic Disorder',
  'Generalized Anxiety Disorder',
  'Specific Phobia',
  'Obsessive-Compulsive Disorder'],

  correctAnswerIndex: 2,
  explanation:
  'Specific Phobia is characterized by marked fear or anxiety about a specific object or situation (e.g., flying, heights, animals, injections, blood).',
  difficulty: 'easy',
  source: 'ai',
  tags: ['disorders']
}];

export function PracticePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const totalQuestions = MOCK_QUESTIONS.length;
  const handleSelectAnswer = (index: number) => {
    if (!isSubmitted) {
      setSelectedAnswer(index);
    }
  };
  const handleSubmit = () => {
    setIsSubmitted(true);
  };
  const handleNext = (difficulty: string) => {
    // In a real app, we'd save the result and difficulty rating here
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setSessionProgress((currentQuestionIndex + 1) / totalQuestions * 100);
    } else {
      // Session complete
      alert('Session Complete!');
    }
  };
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard/study/topics"
            className="text-slate-500 hover:text-slate-900 flex items-center gap-2">

            <ArrowLeft className="h-4 w-4" />
            Back to Topics
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Flag className="h-4 w-4" />}>

              Report
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={sessionProgress} size="sm" className="mb-8" />

        {/* Main Content */}
        {!isSubmitted ?
        <QuestionCard
          question={currentQuestion}
          selectedAnswerIndex={selectedAnswer}
          onSelectAnswer={handleSelectAnswer}
          onSubmit={handleSubmit}
          isSubmitting={false} /> :


        <AnswerFeedback
          question={currentQuestion}
          selectedAnswerIndex={selectedAnswer!}
          onNext={handleNext} />

        }
      </div>
    </AppLayout>);

}