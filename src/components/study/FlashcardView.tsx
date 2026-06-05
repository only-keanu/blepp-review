import React, { useCallback, useEffect, useState } from 'react';
import { RotateCw, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';
type Confidence = 'low' | 'medium' | 'high';
interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
}
interface FlashcardViewProps {
  card: Flashcard;
  onRate: (confidence: Confidence) => void | Promise<void>;
}
export function FlashcardView({ card, onRate }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const handleFlip = useCallback(() => {
    if (!isRating) {
      setIsFlipped((prev) => !prev);
    }
  }, [isRating]);
  const handleRate = useCallback(async (confidence: Confidence) => {
    if (!isFlipped || isRating) return;
    setIsRating(true);
    await onRate(confidence);
    setIsFlipped(false);
    setIsRating(false);
  }, [isFlipped, isRating, onRate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isEditableTarget =
        target?.isContentEditable ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        tagName === 'BUTTON';

      if (isEditableTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        handleFlip();
        return;
      }

      if (!isFlipped) return;

      if (event.key === '1') {
        event.preventDefault();
        void handleRate('low');
      } else if (event.key === '2') {
        event.preventDefault();
        void handleRate('medium');
      } else if (event.key === '3') {
        event.preventDefault();
        void handleRate('high');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, isFlipped]);

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <div
        className="relative h-96 w-full cursor-pointer transition-all duration-500 transform-style-3d"
        onClick={handleFlip}
        aria-keyshortcuts="Enter"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>

        {/* Front */}
        <div className="absolute inset-0 h-full w-full backface-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
          <span className="absolute top-6 left-6 inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-200">
            {card.topic}
          </span>
          <h3 className="text-2xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
            {card.front}
          </h3>
          <p className="absolute bottom-6 text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <RotateCw className="h-4 w-4" /> Click to flip
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 h-full w-full backface-hidden bg-slate-900 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-center transform rotate-y-180"
          style={{
            transform: 'rotateY(180deg)'
          }}>

          <div className="prose prose-invert">
            <p className="text-xl text-slate-100 leading-relaxed">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* Controls - Only show when flipped */}
      <div
        className={`mt-8 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
          How well did you know this?
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-red-200 hover:bg-red-50 text-red-700 hover:border-red-300"
            disabled={isRating}
            aria-keyshortcuts="1"
            onClick={(e) => {
              e.stopPropagation();
              void handleRate('low');
            }}
            leftIcon={<ThumbsDown className="h-4 w-4" />}>

            Forgot
          </Button>
          <Button
            variant="outline"
            className="border-amber-200 hover:bg-amber-50 text-amber-700 hover:border-amber-300"
            disabled={isRating}
            aria-keyshortcuts="2"
            onClick={(e) => {
              e.stopPropagation();
              void handleRate('medium');
            }}
            leftIcon={<HelpCircle className="h-4 w-4" />}>

            Unsure
          </Button>
          <Button
            variant="outline"
            className="border-green-200 hover:bg-green-50 text-green-700 hover:border-green-300"
            disabled={isRating}
            aria-keyshortcuts="3"
            onClick={(e) => {
              e.stopPropagation();
              void handleRate('high');
            }}
            leftIcon={<ThumbsUp className="h-4 w-4" />}>

            Knew it
          </Button>
        </div>
      </div>
    </div>);

}
