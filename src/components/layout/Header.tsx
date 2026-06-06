import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bell, BookOpen, Clock, FileText, Layers, LogOut, Menu, PlayCircle, RotateCw, Search, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { fetchRecentExamSessions, type RecentExamSession } from '../../lib/examSessionsApi';
import type { UserAccess } from '../../types';
interface HeaderProps {
  onMenuClick: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}
type SearchResult = {
  id: string;
  type: 'topic' | 'flashcard' | 'question';
  title: string;
  subtitle?: string;
  href: string;
};
type FlashcardQueueSummaryResponse = {
  due?: number | null;
};
type NotificationDismissalListResponse = {
  notificationIds?: string[] | null;
};
type HeaderNotificationTone = 'teal' | 'amber' | 'red';
type HeaderNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: HeaderNotificationTone;
  createdLabel: string;
  dismissible: boolean;
  Icon: React.ComponentType<{ className?: string }>;
};
export function Header({ onMenuClick, searchInputRef }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [seenNotificationIds, setSeenNotificationIds] = useState<Set<string>>(() => new Set());
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topicsCache, setTopicsCache] = useState<any[] | null>(null);
  const [flashcardsCache, setFlashcardsCache] = useState<any[] | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const avatarUrl = user?.avatarUrl?.trim();
  const avatarLabel = user?.fullName?.trim() || user?.email?.trim() || 'User';
  const avatarInitials = useMemo(() => {
    const nameParts = user?.fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    if (nameParts.length === 1) {
      return nameParts[0].slice(0, 2).toUpperCase();
    }
    return (user?.email?.trim()[0] ?? 'U').toUpperCase();
  }, [user?.fullName, user?.email]);
  const showAvatarImage = Boolean(avatarUrl) && !avatarLoadError;
  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setNotificationsError('');
      setIsNotificationsLoading(false);
      return;
    }

    setIsNotificationsLoading(true);
    setNotificationsError('');
    const accessNotifications = buildAccessNotifications(user.access);

    const flashcardsSummaryRequest = user.hasStudyAccess
      ? apiFetch<FlashcardQueueSummaryResponse>('/api/flashcards/summary')
      : Promise.resolve<FlashcardQueueSummaryResponse | null>(null);

    const [dismissalsResult, summaryResult, sessionsResult] = await Promise.allSettled([
      apiFetch<NotificationDismissalListResponse>('/api/notification-dismissals'),
      flashcardsSummaryRequest,
      fetchRecentExamSessions(5)
    ]);

    const nextNotifications = [...accessNotifications];
    let hasRefreshError = false;

    if (dismissalsResult.status === 'fulfilled') {
      setDismissedNotificationIds((previous) => new Set([
        ...previous,
        ...(dismissalsResult.value.notificationIds ?? [])
      ]));
    } else {
      hasRefreshError = true;
    }

    if (summaryResult.status === 'fulfilled') {
      const dueCount = summaryResult.value?.due ?? 0;
      if (dueCount > 0) {
        nextNotifications.push(buildFlashcardNotification(dueCount));
      }
    } else if (user.hasStudyAccess) {
      hasRefreshError = true;
    }

    if (sessionsResult.status === 'fulfilled') {
      nextNotifications.push(...buildExamNotifications(sessionsResult.value));
    } else {
      hasRefreshError = true;
    }

    setNotifications(nextNotifications);
    setNotificationsError(hasRefreshError ? 'Could not refresh notifications.' : '');
    setIsNotificationsLoading(false);
  }, [user]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [avatarUrl]);

  useEffect(() => {
    setSeenNotificationIds(new Set());
    setDismissedNotificationIds(new Set());
  }, [user?.id]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const refreshNotificationsOnActiveTab = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      void loadNotifications();
    };

    window.addEventListener('focus', refreshNotificationsOnActiveTab);
    document.addEventListener('visibilitychange', refreshNotificationsOnActiveTab);
    return () => {
      window.removeEventListener('focus', refreshNotificationsOnActiveTab);
      document.removeEventListener('visibilitychange', refreshNotificationsOnActiveTab);
    };
  }, [loadNotifications, user]);

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
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
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

  const visibleNotifications = useMemo(() => {
    return notifications.filter((notification) => !dismissedNotificationIds.has(notification.id));
  }, [dismissedNotificationIds, notifications]);
  const unreadCount = visibleNotifications.filter((notification) => !seenNotificationIds.has(notification.id)).length;
  const notificationBellLabel = unreadCount > 0
    ? `Open notifications, ${unreadCount} unread`
    : 'Open notifications';
  const dismissNotification = async (notificationId: string) => {
    setNotificationsError('');
    setDismissedNotificationIds((previous) => {
      const next = new Set(previous);
      next.add(notificationId);
      return next;
    });

    try {
      await apiFetch<void>('/api/notification-dismissals', {
        method: 'POST',
        body: JSON.stringify({ notificationId })
      });
    } catch {
      setDismissedNotificationIds((previous) => {
        const next = new Set(previous);
        next.delete(notificationId);
        return next;
      });
      setNotificationsError('Could not dismiss notification. Please try again.');
    }
  };
  const toggleNotifications = () => {
    setNotificationsOpen((current) => {
      const nextOpen = !current;
      if (nextOpen) {
        setMenuOpen(false);
        setIsOpen(false);
        setSeenNotificationIds((previous) => {
          const next = new Set(previous);
          visibleNotifications.forEach((notification) => next.add(notification.id));
          return next;
        });
      }
      return nextOpen;
    });
  };

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
              ref={searchInputRef}
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
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              className="p-2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              aria-haspopup="dialog"
              aria-expanded={notificationsOpen}
              aria-label={notificationBellLabel}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-semibold leading-none text-white dark:border-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                role="dialog"
                aria-label="Notifications"
                className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:w-96">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Notifications
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Study reminders and account alerts
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadNotifications()}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    disabled={isNotificationsLoading}
                    aria-label="Refresh notifications"
                    title="Refresh notifications">
                    <RotateCw className={`h-4 w-4 ${isNotificationsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto py-2">
                  {notificationsError && (
                    <div className="mx-3 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                      {notificationsError}
                    </div>
                  )}

                  {isNotificationsLoading && visibleNotifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      Loading notifications...
                    </div>
                  ) : visibleNotifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      No notifications right now.
                    </div>
                  ) : (
                    <div className="space-y-1 px-2">
                      {visibleNotifications.map((notification) => {
                        const Icon = notification.Icon;
                        return (
                          <div
                            key={notification.id}
                            className="group flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Link
                              to={notification.href}
                              onClick={() => setNotificationsOpen(false)}
                              className="flex min-w-0 flex-1 items-start gap-3">
                              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notificationToneClasses[notification.tone]}`}>
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {notification.title}
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                                  {notification.description}
                                </span>
                                <span className="mt-1 block text-xs font-medium text-teal-600 dark:text-teal-300">
                                  {notification.createdLabel}
                                </span>
                              </span>
                            </Link>
                            {notification.dismissible && (
                              <button
                                type="button"
                                onClick={() => {
                                  void dismissNotification(notification.id);
                                }}
                                className="mt-1 rounded-full p-1 text-slate-300 opacity-100 hover:bg-slate-100 hover:text-slate-500 dark:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300 sm:opacity-0 sm:group-hover:opacity-100"
                                aria-label={`Dismiss ${notification.title}`}
                                title="Dismiss">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
                aria-expanded={menuOpen}
                aria-label="Open user menu">
                {showAvatarImage ? (
                  <img
                    src={avatarUrl}
                    alt={avatarLabel}
                    onError={() => setAvatarLoadError(true)}
                    className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 object-cover" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-teal-50 text-xs font-semibold text-teal-700 dark:border-slate-700 dark:bg-teal-950/40 dark:text-teal-200">
                    {avatarInitials}
                  </span>
                )}

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

const notificationToneClasses: Record<HeaderNotificationTone, string> = {
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-200',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200',
  red: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200'
};

function buildAccessNotifications(access?: UserAccess | null): HeaderNotification[] {
  if (!access || access.admin || access.accessStatus === 'PAID') {
    return [];
  }

  if (access.accessStatus === 'EXPIRED') {
    const accessVersion =
      access.accessUpdatedAt ?? access.paidUntil ?? access.trialEndsAt ?? 'unknown';
    return [
      {
        id: `access-expired-${accessVersion}`,
        title: 'Payment needed',
        description: 'Your study access has ended. Unlock another BLEPP Review Pass to continue.',
        href: '/dashboard/settings/access',
        tone: 'red',
        createdLabel: 'Account access',
        dismissible: true,
        Icon: AlertTriangle
      }
    ];
  }

  if (access.accessStatus === 'TRIAL') {
    const accessVersion = access.accessUpdatedAt ?? access.trialEndsAt ?? 'unknown';
    return [
      {
        id: `access-trial-${accessVersion}`,
        title: 'Trial access active',
        description: `Study tools are available until ${formatNotificationDate(access.trialEndsAt)}.`,
        href: '/dashboard/settings/access',
        tone: 'amber',
        createdLabel: 'Trial period',
        dismissible: true,
        Icon: Clock
      }
    ];
  }

  return [];
}

function buildFlashcardNotification(dueCount: number): HeaderNotification {
  return {
    id: `flashcards-due-${dueCount}`,
    title: `${dueCount} ${pluralize('flashcard', dueCount)} due`,
    description: 'Review due cards before starting new study work.',
    href: '/dashboard/study/flashcards',
    tone: 'teal',
    createdLabel: 'Due now',
    dismissible: true,
    Icon: BookOpen
  };
}

function buildExamNotifications(sessions: RecentExamSession[]): HeaderNotification[] {
  return sessions
    .filter((session) => session.status === 'IN_PROGRESS')
    .slice(0, 3)
    .map((session) => {
      const answeredLabel =
        session.totalQuestions && session.totalQuestions > 0
          ? `${session.answeredCount}/${session.totalQuestions} answered`
          : `${session.answeredCount} answered`;
      return {
        id: `exam-session-${session.id}`,
        title: `Resume ${session.title}`,
        description: answeredLabel,
        href: `/dashboard/exams/take/${session.id}`,
        tone: 'amber',
        createdLabel: `Started ${formatNotificationDate(session.startedAt)}`,
        dismissible: true,
        Icon: PlayCircle
      };
    });
}

function formatNotificationDate(value?: string | null) {
  if (!value) {
    return 'date unavailable';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'date unavailable';
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`;
}
