import React, { useState } from 'react';
import { RotateCw, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';
interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
}
interface FlashcardViewProps {
  card: Flashcard;
  onRate: (confidence: 'low' | 'medium' | 'high') => void;
}
export function FlashcardView({ card, onRate }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => setIsFlipped(!isFlipped);
  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <div
        className="relative h-96 w-full cursor-pointer transition-all duration-500 transform-style-3d"
        onClick={handleFlip}
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>

        {/* Front */}
        <div className="absolute inset-0 h-full w-full backface-hidden bg-white rounded-2xl shadow-lg border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
          <span className="absolute top-6 left-6 inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
            {card.topic}
          </span>
          <h3 className="text-2xl font-medium text-slate-900 leading-relaxed">
            {card.front}
          </h3>
          <p className="absolute bottom-6 text-sm text-slate-400 flex items-center gap-2">
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

        <p className="text-center text-sm text-slate-500 mb-4">
          How well did you know this?
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-red-200 hover:bg-red-50 text-red-700 hover:border-red-300"
            onClick={(e) => {
              e.stopPropagation();
              onRate('low');
              setIsFlipped(false);
            }}
            leftIcon={<ThumbsDown className="h-4 w-4" />}>

            Forgot
          </Button>
          <Button
            variant="outline"
            className="border-amber-200 hover:bg-amber-50 text-amber-700 hover:border-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              onRate('medium');
              setIsFlipped(false);
            }}
            leftIcon={<HelpCircle className="h-4 w-4" />}>

            Unsure
          </Button>
          <Button
            variant="outline"
            className="border-green-200 hover:bg-green-50 text-green-700 hover:border-green-300"
            onClick={(e) => {
              e.stopPropagation();
              onRate('high');
              setIsFlipped(false);
            }}
            leftIcon={<ThumbsUp className="h-4 w-4" />}>

            Knew it
          </Button>
        </div>
      </div>
    </div>);

}