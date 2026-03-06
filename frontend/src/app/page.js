'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import ApplicationTable from './components/ApplicationTable';
import ApplicationForm from './components/ApplicationForm';

const STATUSES = ['all', 'applied', 'interview', 'offer', 'rejected'];

export default function Dashboard() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(session?.backendToken && { Authorization: `Bearer ${session.backendToken}` }),
  };

  const fetchApplications = useCallback(async () => {
    if (!session?.backendToken) return;
    try {
      setLoading(true);
      const url = statusFilter === 'all'
        ? '/api/applications'
        : `/api/applications?status=${statusFilter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.backendToken}` } });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError('Could not load applications. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, session?.backendToken]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleCreate(form) {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      fetchApplications();
    }
  }

  async function handleUpdate(form) {
    const res = await fetch(`/api/applications/${editingApp.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditingApp(null);
      fetchApplications();
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this application?')) return;
    const res = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.backendToken}` },
    });
    if (res.ok) fetchApplications();
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Application Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.image && (
            <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
          )}
          <span className="text-sm text-gray-700">{session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Application
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <ApplicationTable
          applications={applications}
          onEdit={app => setEditingApp(app)}
          onDelete={handleDelete}
        />
      )}

      {(showForm || editingApp) && (
        <ApplicationForm
          initial={editingApp}
          onSubmit={editingApp ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditingApp(null); }}
        />
      )}
    </main>
  );
}
