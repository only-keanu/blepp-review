import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck, UserX } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { formatDateTime } from '../../components/access/AccessStatusCard';
import { ApiRequestError, apiFetch } from '../../lib/api';
import { AdminUser, AdminUserPageResponse, UserAccessStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'PAID', label: 'Paid' },
  { value: 'EXPIRED', label: 'Expired' }
];

const PAGE_SIZE = 50;

export function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [paidUntil, setPaidUntil] = useState(defaultPaidUntil());
  const [paymentReference, setPaymentReference] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  );

  const canGoPrevious = pagination.page > 0;
  const canGoNext = pagination.page + 1 < pagination.totalPages;
  const pageLabel = pagination.totalPages === 0
    ? 'Page 0 of 0'
    : `Page ${pagination.page + 1} of ${pagination.totalPages}`;
  const resultsDescription = pagination.totalElements === 1
    ? '1 user found'
    : `${pagination.totalElements} users found`;

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [selectedUser, users]);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }
    setPaymentReference(selectedUser.access.paymentReference ?? '');
    setAccessNotes(selectedUser.access.accessNotes ?? '');
    setPaidUntil(toDateTimeInput(selectedUser.access.paidUntil) || defaultPaidUntil());
  }, [selectedUser?.id]);

  const loadUsers = async (requestedPage = pagination.page) => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set('query', query.trim());
      }
      if (status) {
        params.set('status', status);
      }
      params.set('page', String(Math.max(requestedPage, 0)));
      params.set('size', String(PAGE_SIZE));
      const data = await apiFetch<AdminUserPageResponse>(`/api/admin/users?${params.toString()}`);
      setUsers(data.users);
      setPagination({
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages
      });
      if (data.users.length === 0) {
        setSelectedUserId('');
      } else if (!data.users.some((user) => user.id === selectedUserId)) {
        setSelectedUserId(data.users[0].id);
      }
    } catch (err) {
      setError(adminErrorMessage(err, 'Failed to load users.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    void loadUsers(0);
  };

  const updateAccess = async (accessStatus: UserAccessStatus) => {
    if (!selectedUser) {
      return;
    }
    if (accessStatus === 'PAID' && !isValidDateTimeInput(paidUntil)) {
      setError('Enter a valid paid-until date before granting access.');
      setSuccess('');
      return;
    }
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await apiFetch<AdminUser>(`/api/admin/users/${selectedUser.id}/access`, {
        method: 'PATCH',
        body: JSON.stringify({
          accessStatus,
          paidUntil: accessStatus === 'PAID' ? new Date(paidUntil).toISOString() : null,
          paymentReference,
          accessNotes
        })
      });
      setUsers((current) => current.map((user) => user.id === updated.id ? updated : user));
      setSuccess(accessStatus === 'PAID' ? 'Paid access saved.' : 'Access revoked.');
    } catch (err) {
      setError(adminErrorMessage(err, 'Failed to update access.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Search users and manually manage verified paid access.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
            <Input
              label="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Email or name"
              icon={<Search className="h-4 w-4" />}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
            <Button type="submit" isLoading={isLoading}>Search</Button>
          </form>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card
            title="Search results"
            description={resultsDescription}
            footer={(
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {pageLabel}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canGoPrevious || isLoading}
                    onClick={() => void loadUsers(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canGoNext || isLoading}
                    onClick={() => void loadUsers(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && users.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading users...</p>
              )}
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full px-0 py-4 text-left transition-colors ${selectedUserId === user.id ? 'bg-teal-50/70 dark:bg-teal-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                >
                  <div className="flex flex-col gap-2 px-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{user.fullName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <Badge variant={badgeVariant(user.access.accessStatus)}>{user.access.accessStatus}</Badge>
                  </div>
                </button>
              ))}
              {!isLoading && users.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No users found.</p>
              )}
            </div>
          </Card>

          <Card title="Access controls">
            {selectedUser ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{selectedUser.fullName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                    <Badge variant={badgeVariant(selectedUser.access.accessStatus)}>
                      {selectedUser.access.accessStatus}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-slate-500 dark:text-slate-400">Trial ends</span>
                    <span className="text-right text-slate-900 dark:text-slate-100">{formatDateTime(selectedUser.access.trialEndsAt)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-slate-500 dark:text-slate-400">Paid until</span>
                    <span className="text-right text-slate-900 dark:text-slate-100">{formatDateTime(selectedUser.access.paidUntil)}</span>
                  </div>
                </div>
                <Input
                  label="Paid until"
                  type="datetime-local"
                  value={paidUntil}
                  onChange={(event) => setPaidUntil(event.target.value)}
                />
                <Input
                  label="Payment reference"
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                  placeholder="GCash or bank reference"
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Notes
                  </label>
                  <textarea
                    value={accessNotes}
                    onChange={(event) => setAccessNotes(event.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Manual verification notes"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => void updateAccess('PAID')}
                    isLoading={isSaving}
                    leftIcon={<ShieldCheck className="h-4 w-4" />}
                  >
                    Grant paid
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void updateAccess('EXPIRED')}
                    isLoading={isSaving}
                    leftIcon={<UserX className="h-4 w-4" />}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Select a user to manage access.</p>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function badgeVariant(status: UserAccessStatus) {
  if (status === 'PAID') {
    return 'success';
  }
  if (status === 'TRIAL') {
    return 'warning';
  }
  return 'danger';
}

function defaultPaidUntil() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return toDateTimeInput(date.toISOString());
}

function toDateTimeInput(value?: string) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function isValidDateTimeInput(value: string) {
  if (!value) {
    return false;
  }
  return !Number.isNaN(new Date(value).getTime());
}

function adminErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError && error.status === 403) {
    return 'Your account is not configured as admin.';
  }
  return error instanceof Error ? error.message : fallback;
}
