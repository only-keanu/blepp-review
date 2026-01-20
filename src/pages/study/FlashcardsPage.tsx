import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { FlashcardView } from '../../components/study/FlashcardView';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
const MOCK_FLASHCARDS = [{
  id: '1',
  front: 'What is the "Strange Situation" procedure used to assess?',
  back: 'Attachment styles in infants (Secure, Insecure-Avoidant, Insecure-Resistant)',
  topic: 'Developmental Psych'
}, {
  id: '2',
  front: 'Who is considered the father of Modern Psychology?',
  back: 'Wilhelm Wundt (established the first psychology lab in 1879)',
  topic: 'History of Psych'
}, {
  id: '3',
  front: 'Define "Operant Conditioning"',
  back: 'A method of learning that occurs through rewards and punishments for behavior (B.F. Skinner)',
  topic: 'Learning'
}];
export function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const currentCard = MOCK_FLASHCARDS[currentIndex];
  const totalCards = MOCK_FLASHCARDS.length;
  const progress = completed / totalCards * 100;
  const handleRate = (confidence: 'low' | 'medium' | 'high') => {
    setCompleted(prev => prev + 1);
    if (currentIndex < totalCards - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      alert('Review Complete!');
    }
  };
  return <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard/study/topics" className="text-slate-500 hover:text-slate-900 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              Card {currentIndex + 1} / {totalCards}
            </span>
            <Button variant="ghost" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
              Options
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-12">
          <Progress value={progress} size="sm" />
        </div>

        {/* Card Area */}
        <div className="flex-1 flex items-center justify-center">
          <FlashcardView key={currentCard.id} // Force re-render on card change
        card={currentCard} onRate={handleRate} />
        </div>
      </div>
    </AppLayout>;
}