import React, { useEffect, useMemo, useState } from 'react';
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
import { Flashcard, Topic } from '../../types';
import { apiFetch } from '../../lib/api';

type FlashcardPayload = {
  front: string;
  back: string;
  topicId: string;
  category?: string;
};

export function ManageFlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await apiFetch<Topic[]>('/api/topics');
        setTopics(data);
      } catch (err) {
        setError('Failed to load topics.');
      }
    };
    loadTopics();
  }, []);

  useEffect(() => {
    const loadFlashcards = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiFetch<any[]>('/api/flashcards');
        const mapped = data.map((card) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          topic: card.topicName,
          topicId: card.topicId,
          category: card.category,
          confidence: card.confidence ? card.confidence.toLowerCase() : undefined,
          createdAt: card.createdAt
        })) as Flashcard[];
        setFlashcards(mapped);
      } catch (err) {
        setError('Failed to load flashcards.');
      } finally {
        setIsLoading(false);
      }
    };
    loadFlashcards();
  }, []);

  const filteredFlashcards = useMemo(() => {
    return flashcards.filter((fc) => {
      const matchesSearch =
        fc.front.toLowerCase().includes(search.toLowerCase()) ||
        fc.back.toLowerCase().includes(search.toLowerCase());
      const matchesTopic =
        topicFilter === 'all' || fc.topic === topics.find((t) => t.id === topicFilter)?.name;
      return matchesSearch && matchesTopic;
    });
  }, [flashcards, search, topicFilter, topics]);

  const handleAddFlashcard = async (payload: FlashcardPayload) => {
    setIsLoading(true);
    setError('');
    try {
      const created = await apiFetch<any>('/api/flashcards', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const mapped: Flashcard = {
        id: created.id,
        front: created.front,
        back: created.back,
        topic: created.topicName,
        topicId: created.topicId,
        category: created.category,
        confidence: created.confidence ? created.confidence.toLowerCase() : undefined,
        createdAt: created.createdAt
      };
      setFlashcards((prev) => [mapped, ...prev]);
    } catch (err) {
      setError('Failed to save flashcard.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await apiFetch<void>(`/api/flashcards/${id}`, { method: 'DELETE' });
      setFlashcards((prev) => prev.filter((fc) => fc.id !== id));
    } catch (err) {
      setError('Failed to delete flashcard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFlashcard = async (payload: FlashcardPayload) => {
    if (!editingFlashcard) return;
    setIsLoading(true);
    setError('');
    try {
      const updated = await apiFetch<any>(`/api/flashcards/${editingFlashcard.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          front: payload.front,
          back: payload.back,
          category: payload.category
        })
      });
      const mapped: Flashcard = {
        id: updated.id,
        front: updated.front,
        back: updated.back,
        topic: updated.topicName,
        topicId: updated.topicId,
        category: updated.category,
        confidence: updated.confidence ? updated.confidence.toLowerCase() : undefined,
        createdAt: updated.createdAt
      };
      setFlashcards((prev) => prev.map((fc) => (fc.id === mapped.id ? mapped : fc)));
      setEditingFlashcard(null);
      setIsAddModalOpen(false);
    } catch (err) {
      setError('Failed to update flashcard.');
      throw err;
    } finally {
      setIsLoading(false);
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

  const topicOptions = [
    { value: 'all', label: 'All Topics' },
    ...topics.map((t) => ({ value: t.id, label: t.name }))
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
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

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

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

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search flashcards..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              options={topicOptions}
              value={topicFilter}
              onChange={setTopicFilter}
              placeholder="Filter by topic"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : filteredFlashcards.length === 0 ? (
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFlashcards.map((flashcard) => (
              <Card
                key={flashcard.id}
                className="group hover:border-teal-200 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {flashcard.topic}
                    </Badge>
                    {flashcard.category && (
                      <Badge variant="outline" size="sm">
                        {flashcard.category}
                      </Badge>
                    )}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setEditingFlashcard(flashcard);
                      setIsAddModalOpen(true);
                    }}>
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
            ))}
          </div>
        )}
      </div>

      <AddFlashcardModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingFlashcard(null);
        }}
        onSave={editingFlashcard ? handleUpdateFlashcard : handleAddFlashcard}
        topics={topics}
        initial={editingFlashcard ? {
          id: editingFlashcard.id,
          front: editingFlashcard.front,
          back: editingFlashcard.back,
          topicId: editingFlashcard.topicId,
          category: editingFlashcard.category
        } : undefined}
      />
    </AppLayout>
  );
}
