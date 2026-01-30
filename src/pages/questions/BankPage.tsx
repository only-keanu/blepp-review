import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { QuestionList } from '../../components/questions/QuestionList';
import { TopicFilter } from '../../components/questions/TopicFilter';
import { AddQuestionModal } from '../../components/questions/AddQuestionModal';
import { Button } from '../../components/ui/Button';
import { Plus, Search, Filter, Sparkles, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Question } from '../../types';
const INITIAL_QUESTIONS: Question[] = [
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
  tags: ['theories', 'freud'],
  category: 'theories'
},
{
  id: '2',
  topicId: 'Abnormal Psychology',
  text: 'A persistent, irrational fear of a specific object or situation that leads to avoidance behavior is known as:',
  choices: ['Panic Disorder', 'GAD', 'Specific Phobia', 'OCD'],
  correctAnswerIndex: 2,
  explanation:
  'Specific Phobia is characterized by marked fear or anxiety about a specific object or situation.',
  difficulty: 'easy',
  source: 'manual',
  tags: ['disorders', 'anxiety'],
  category: 'disorders'
},
{
  id: '3',
  topicId: 'Ethics (RA 10029)',
  text: 'According to RA 10029, a Psychometrician is authorized to:',
  choices: [
  'Diagnose mental disorders',
  'Administer Level C tests',
  'Administer Level B tests under supervision',
  'Prescribe medication'],

  correctAnswerIndex: 2,
  explanation:
  'Psychometricians can administer Level B tests under the supervision of a licensed psychologist.',
  difficulty: 'hard',
  source: 'pdf',
  tags: ['law', 'psychometrician'],
  category: 'ethics'
}];

export function BankPage() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesTopic =
    topic === 'all' || q.topicId.toLowerCase().includes(topic);
    return matchesSearch && matchesTopic;
  });
  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions((prev) => [newQuestion, ...prev]);
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
            <p className="text-slate-500 mt-1">
              {questions.length} questions • Manage and review your practice
              questions.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              leftIcon={<PenLine className="h-4 w-4" />}
              onClick={() => setIsAddModalOpen(true)}>

              Add Manually
            </Button>
            <Link to="/dashboard/questions/generate">
              <Button leftIcon={<Sparkles className="h-4 w-4" />}>
                Generate with AI
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)} />

          </div>
          <TopicFilter selectedTopic={topic} onChange={setTopic} />
          <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
            More Filters
          </Button>
        </div>

        {filteredQuestions.length === 0 ?
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No questions found
            </h3>
            <p className="text-slate-500 mb-6">
              Try adjusting your search or filters, or add a new question.
            </p>
            <Button
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}>

              Add Your First Question
            </Button>
          </div> :

        <QuestionList questions={filteredQuestions} />
        }
      </div>

      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddQuestion} />

    </AppLayout>);

}