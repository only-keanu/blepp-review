import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Bell, Search, LogOut, BookOpen, Layers, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
interface HeaderProps {
  onMenuClick: () => void;
}
type SearchResult = {
  id: string;
  type: 'topic' | 'flashcard' | 'question';
  title: string;
  subtitle?: string;
  href: string;
};
export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topicsCache, setTopicsCache] = useState<any[] | null>(null);
  const [flashcardsCache, setFlashcardsCache] = useState<any[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const runSearch = async () => {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        let topics = topicsCache;
        let flashcards = flashcardsCache;
        if (!topics) {
          topics = await apiFetch<any[]>('/api/topics');
          setTopicsCache(topics);
        }
        if (!flashcards) {
          flashcards = await apiFetch<any[]>('/api/flashcards');
          setFlashcardsCache(flashcards);
        }

        const queryLower = trimmed.toLowerCase();
        const topicMatches = (topics ?? [])
          .filter((topic) => topic.name.toLowerCase().includes(queryLower))
          .slice(0, 5)
          .map((topic) => ({
            id: topic.id,
            type: 'topic' as const,
            title: topic.name,
            subtitle: 'Topic',
            href: `/dashboard/study/topics?topicId=${topic.id}`
          }));

        const flashcardMatches = (flashcards ?? [])
          .filter((card) =>
            `${card.front} ${card.back}`.toLowerCase().includes(queryLower)
          )
          .slice(0, 5)
          .map((card) => ({
            id: card.id,
            type: 'flashcard' as const,
            title: card.front,
            subtitle: card.topicName ? `Flashcard • ${card.topicName}` : 'Flashcard',
            href: `/dashboard/flashcards?query=${encodeURIComponent(trimmed)}`
          }));

        const questionMatches = await apiFetch<any[]>(
          `/api/questions?query=${encodeURIComponent(trimmed)}`
        );
        const questionItems = questionMatches.slice(0, 5).map((question) => ({
          id: question.id,
          type: 'question' as const,
          title: question.text,
          subtitle: question.topicName ? `Question • ${question.topicName}` : 'Question',
          href: `/dashboard/questions/bank?query=${encodeURIComponent(trimmed)}`
        }));

        setResults([...topicMatches, ...flashcardMatches, ...questionItems]);
        setIsOpen(true);
      } catch (err) {
        setResults([]);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(runSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, topicsCache, flashcardsCache]);

  const groupedResults = useMemo(() => {
    return {
      topics: results.filter((r) => r.type === 'topic'),
      flashcards: results.filter((r) => r.type === 'flashcard'),
      questions: results.filter((r) => r.type === 'question')
    };
  }, [results]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md lg:hidden">

            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex items-center relative" ref={containerRef}>
            <Search className="absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search topics, flashcards, or questions..."
              className="pl-9 pr-4 py-1.5 w-72 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && query.trim().length >= 2) {
                  navigate(`/dashboard/questions/bank?query=${encodeURIComponent(query.trim())}`);
                  setIsOpen(false);
                }
              }}
            />

            {isOpen && (
              <div className="absolute top-11 left-0 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-50">
                {isLoading ? (
                  <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    No matches found.
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {groupedResults.topics.length > 0 && (
                      <div className="px-3 pb-2">
                        <p className="px-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                          Topics
                        </p>
                        {groupedResults.topics.map((result) => (
                          <Link
                            key={result.id}
                            to={result.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <BookOpen className="mt-0.5 h-4 w-4 text-teal-600 dark:text-teal-300" />
                            <div>
                              <p className="font-medium line-clamp-1">{result.title}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {result.subtitle}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {groupedResults.flashcards.length > 0 && (
                      <div className="px-3 pb-2">
                        <p className="px-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                          Flashcards
                        </p>
                        {groupedResults.flashcards.map((result) => (
                          <Link
                            key={result.id}
                            to={result.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Layers className="mt-0.5 h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                            <div>
                              <p className="font-medium line-clamp-1">{result.title}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {result.subtitle}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {groupedResults.questions.length > 0 && (
                      <div className="px-3 pb-2">
                        <p className="px-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                          Questions
                        </p>
                        {groupedResults.questions.map((result) => (
                          <Link
                            key={result.id}
                            to={result.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <FileText className="mt-0.5 h-4 w-4 text-amber-500 dark:text-amber-300" />
                            <div>
                              <p className="font-medium line-clamp-1">{result.title}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {result.subtitle}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Psychology Student</p>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-2 focus:outline-none"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}>
                <img
                  src={user?.avatarUrl}
                  alt={user?.fullName}
                  className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />

              </button>

              {/* Dropdown menu */}
              <div className={`absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800 py-1 ${menuOpen ? 'block' : 'hidden'}`}>
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2">

                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>);

}
