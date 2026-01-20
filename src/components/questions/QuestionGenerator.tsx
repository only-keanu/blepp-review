import React, { useEffect, useState, memo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { Question } from '../../types';
interface QuestionGeneratorProps {
  file: File;
  onSave: (questions: Question[]) => void;
}
export function QuestionGenerator({
  file,
  onSave
}: QuestionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      const mockQuestions: Question[] = [{
        id: 'gen_1',
        topicId: 'General Psychology',
        text: 'Based on the uploaded text, which concept best describes the phenomenon where a person cannot remember events prior to a trauma?',
        choices: ['Anterograde Amnesia', 'Retrograde Amnesia', 'Dissociative Fugue', 'Repression'],
        correctAnswerIndex: 1,
        explanation: 'Retrograde amnesia is the loss of memory-access to events that occurred, or information that was learned, before an injury or the onset of a disease.',
        difficulty: 'medium',
        source: 'ai',
        tags: ['memory', 'disorders']
      }, {
        id: 'gen_2',
        topicId: 'General Psychology',
        text: "The text discusses Piaget's stages. Which stage is characterized by abstract thinking?",
        choices: ['Sensorimotor', 'Preoperational', 'Concrete Operational', 'Formal Operational'],
        correctAnswerIndex: 3,
        explanation: 'The Formal Operational stage (age 12+) is characterized by the ability to think abstractly, reason logically, and draw conclusions from the information available.',
        difficulty: 'easy',
        source: 'ai',
        tags: ['development', 'piaget']
      }];
      setGeneratedQuestions(mockQuestions);
      setIsGenerating(false);
    }, 2500);
  };
  if (generatedQuestions.length > 0) {
    return <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Generated Questions ({generatedQuestions.length})
          </h3>
          <Button onClick={() => onSave(generatedQuestions)} leftIcon={<Check className="h-4 w-4" />}>
            Save to Bank
          </Button>
        </div>
        <div className="space-y-4">
          {generatedQuestions.map((q, i) => <Card key={q.id} className="border-l-4 border-l-teal-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                  {q.topicId}
                </span>
                <span className="text-xs text-slate-400">AI Generated</span>
              </div>
              <p className="font-medium text-slate-900 mb-3">{q.text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                {q.choices.map((c, idx) => <div key={idx} className={`p-2 rounded ${idx === q.correctAnswerIndex ? 'bg-green-50 text-green-700 font-medium' : 'bg-slate-50'}`}>
                    {String.fromCharCode(65 + idx)}. {c}
                  </div>)}
              </div>
            </Card>)}
        </div>
      </div>;
  }
  return <div className="text-center py-12">
      {isGenerating ? <div className="space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-teal-500 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            Analyzing PDF Content...
          </h3>
          <p className="text-slate-500">
            Our AI is extracting key concepts and generating board-style
            questions.
          </p>
        </div> : <div className="space-y-4">
          <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            Ready to Generate
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            We'll generate questions based on the content of{' '}
            <span className="font-medium text-slate-900">{file.name}</span>.
          </p>
          <Button onClick={handleGenerate} size="lg" className="mt-4">
            Generate Questions
          </Button>
        </div>}
    </div>;
}