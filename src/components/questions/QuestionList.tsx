import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Question } from '../../types';
interface QuestionListProps {
  questions: Question[];
}
export function QuestionList({
  questions
}: QuestionListProps) {
  return <div className="space-y-4">
      {questions.map(question => <Card key={question.id} className="group hover:border-teal-200 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">
                  {question.topicId}
                </Badge>
                <Badge variant={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'primary' : question.difficulty === 'hard' ? 'warning' : 'danger'} size="sm">
                  {question.difficulty}
                </Badge>
                {question.source === 'ai' && <span className="text-xs text-slate-400 flex items-center gap-1">
                    AI Generated
                  </span>}
              </div>
              <h3 className="font-medium text-slate-900 mb-2 line-clamp-2">
                {question.text}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-1">
                Answer: {question.choices[question.correctAnswerIndex]}
              </p>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4 text-slate-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit2 className="h-4 w-4 text-slate-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>)}
    </div>;
}