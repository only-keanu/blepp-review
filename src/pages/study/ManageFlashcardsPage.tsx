import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { AddFlashcardModal } from '../../components/study/AddFlashcardModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Play,
  RotateCw,
  Filter } from
'lucide-react';
import { Link } from 'react-router-dom';
import { Flashcard } from '../../types';
const INITIAL_FLASHCARDS: Flashcard[] = [
{
  id: '1',
  front: 'What is the "Strange Situation" procedure used to assess?',
  back: 'Attachment styles in infants (Secure, Insecure-Avoidant, Insecure-Resistant)',
  topic: 'Developmental Psych',
  category: 'research',
  confidence: 'high'
},
{
  id: '2',
  front: 'Who is considered the father of Modern Psychology?',
  back: 'Wilhelm Wundt (established the first psychology lab in 1879)',
  topic: 'History of Psych',
  category: 'people',
  confidence: 'medium'
},
{
  id: '3',
  front: 'Define "Operant Conditioning"',
  back: 'A method of learning that occurs through rewards and punishments for behavior (B.F. Skinner)',
  topic: 'Learning',
  category: 'definitions',
  confidence: 'low'
},
{
  id: '4',
  front: 'What are the 4 lobes of the cerebral cortex?',
  back: 'Frontal, Parietal, Temporal, and Occipital lobes',
  topic: 'General Psychology',
  category: 'definitions'
},
{
  id: '5',
  front: 'What is the difference between Type I and Type II errors?',
  back: 'Type I (False Positive): Rejecting a true null hypothesis. Type II (False Negative): Failing to reject a false null hypothesis.',
  topic: 'General Psychology',
  category: 'research',
  confidence: 'medium'
}];

const TOPIC_OPTIONS = [
{
  value: 'all',
  label: 'All Topics'
},
{
  value: 'General Psychology',
  label: 'General Psychology'
},
{
  value: 'Abnormal Psychology',
  label: 'Abnormal Psychology'
},
{
  value: 'Developmental Psych',
  label: 'Developmental Psychology'
},
{
  value: 'History of Psych',
  label: 'History of Psychology'
},
{
  value: 'Learning',
  label: 'Learning & Conditioning'
}];

export function ManageFlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const filteredFlashcards = flashcards.filter((fc) => {
    const matchesSearch =
    fc.front.toLowerCase().includes(search.toLowerCase()) ||
    fc.back.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topicFilter === 'all' || fc.topic === topicFilter;
    return matchesSearch && matchesTopic;
  });
  const handleAddFlashcard = (newFlashcard: Flashcard) => {
    setFlashcards((prev) => [newFlashcard, ...prev]);
  };
  const handleDeleteFlashcard = (id: string) => {
    if (confirm('Are you sure you want to delete this flashcard?')) {
      setFlashcards((prev) => prev.filter((fc) => fc.id !== id));
    }
  };
  const getConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case 'high':
        return (
          <Badge variant="success" size="sm">
            Mastered
          </Badge>);

      case 'medium':
        return (
          <Badge variant="warning" size="sm">
            Learning
          </Badge>);

      case 'low':
        return (
          <Badge variant="danger" size="sm">
            Needs Review
          </Badge>);

      default:
        return (
          <Badge variant="outline" size="sm">
            New
          </Badge>);

    }
  };
  const stats = {
    total: flashcards.length,
    mastered: flashcards.filter((f) => f.confidence === 'high').length,
    learning: flashcards.filter((f) => f.confidence === 'medium').length,
    needsReview: flashcards.filter((f) => f.confidence === 'low').length,
    new: flashcards.filter((f) => !f.confidence).length
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Flashcards</h1>
            <p className="text-slate-500 mt-1">
              Create and manage your personal flashcard deck.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard/study/flashcards">
              <Button variant="outline" leftIcon={<Play className="h-4 w-4" />}>
                Study Mode
              </Button>
            </Link>
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsAddModalOpen(true)}>

              Add Flashcard
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-sm text-slate-500">Total Cards</p>
          </Card>
          <Card className="text-center py-4 border-l-4 border-l-green-500">
            <p className="text-3xl font-bold text-green-600">
              {stats.mastered}
            </p>
            <p className="text-sm text-slate-500">Mastered</p>
          </Card>
          <Card className="text-center py-4 border-l-4 border-l-amber-500">
            <p className="text-3xl font-bold text-amber-600">
              {stats.learning}
            </p>
            <p className="text-sm text-slate-500">Learning</p>
          </Card>
          <Card className="text-center py-4 border-l-4 border-l-red-500">
            <p className="text-3xl font-bold text-red-600">
              {stats.needsReview}
            </p>
            <p className="text-sm text-slate-500">Needs Review</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search flashcards..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)} />

          </div>
          <div className="w-full sm:w-64">
            <Select
              options={TOPIC_OPTIONS}
              value={topicFilter}
              onChange={setTopicFilter}
              placeholder="Filter by topic" />

          </div>
        </div>

        {/* Flashcard List */}
        {filteredFlashcards.length === 0 ?
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCw className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No flashcards found
            </h3>
            <p className="text-slate-500 mb-6">
              Create your first flashcard to start studying!
            </p>
            <Button
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}>

              Create Flashcard
            </Button>
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFlashcards.map((flashcard) =>
          <Card
            key={flashcard.id}
            className="group hover:border-teal-200 transition-colors">

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {flashcard.topic}
                    </Badge>
                    {flashcard.category &&
                <Badge variant="outline" size="sm">
                        {flashcard.category}
                      </Badge>
                }
                  </div>
                  {getConfidenceBadge(flashcard.confidence)}
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Front
                    </p>
                    <p className="text-slate-900 font-medium line-clamp-2">
                      {flashcard.front}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Back
                    </p>
                    <p className="text-slate-600 text-sm line-clamp-2">
                      {flashcard.back}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:text-red-600"
                onClick={() => handleDeleteFlashcard(flashcard.id)}>

                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
          )}
          </div>
        }
      </div>

      <AddFlashcardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddFlashcard} />

    </AppLayout>);

}