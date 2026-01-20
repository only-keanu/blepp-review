import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { QuestionList } from '../../components/questions/QuestionList';
import { TopicFilter } from '../../components/questions/TopicFilter';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Question } from '../../types';
const MOCK_QUESTIONS: Question[] = [{
  id: '1',
  topicId: 'General Psychology',
  text: 'Which theory emphasizes the role of unconscious processes in behavior?',
  choices: ['Behaviorism', 'Psychoanalysis', 'Humanism', 'Cognitivism'],
  correctAnswerIndex: 1,
  explanation: 'Psychoanalysis...',
  difficulty: 'medium',
  source: 'ai',
  tags: ['theories']
}, {
  id: '2',
  topicId: 'Abnormal Psychology',
  text: 'A persistent, irrational fear of a specific object or situation...',
  choices: ['Panic Disorder', 'GAD', 'Specific Phobia', 'OCD'],
  correctAnswerIndex: 2,
  explanation: 'Specific Phobia...',
  difficulty: 'easy',
  source: 'manual',
  tags: ['disorders']
}, {
  id: '3',
  topicId: 'Ethics (RA 10029)',
  text: 'According to RA 10029, a Psychometrician is authorized to...',
  choices: ['Diagnose', 'Administer Level C tests', 'Administer Level B tests', 'Prescribe'],
  correctAnswerIndex: 2,
  explanation: 'Psychometricians can administer Level B tests under supervision...',
  difficulty: 'hard',
  source: 'pdf',
  tags: ['law']
}];
export function BankPage() {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const filteredQuestions = MOCK_QUESTIONS.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topic === 'all' || q.topicId.toLowerCase().includes(topic);
    return matchesSearch && matchesTopic;
  });
  return <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
            <p className="text-slate-500 mt-1">
              Manage and review your practice questions.
            </p>
          </div>
          <Link to="/dashboard/questions/generate">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Generate New
            </Button>
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search questions..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <TopicFilter selectedTopic={topic} onChange={setTopic} />
          <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
            More Filters
          </Button>
        </div>

        <QuestionList questions={filteredQuestions} />
      </div>
    </AppLayout>;
}