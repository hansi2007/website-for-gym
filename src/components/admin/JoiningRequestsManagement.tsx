import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Edit3,
  Trash2,
  RefreshCw,
  Database,
  Code2,
  Copy,
  Check,
  AlertTriangle,
  X,
  Plus
} from 'lucide-react';
import {
  fetchGymJoiningRequests,
  updateJoiningRequestStatus,
  deleteGymJoiningRequest,
  checkSupabaseHealth,
  SQL_MIGRATION_SCRIPT,
  SQL_ADD_END_DATE_SCRIPT,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  submitGymJoiningRequest
} from '../../lib/supabase';
import { GymJoiningRequest, JoiningRequestStatus } from '../../types';
import { getWhatsAppUrl } from '../../utils/whatsapp';

export const JoiningRequestsManagement: React.FC = () => {
  const [requests, setRequests] = useState<GymJoiningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Health status
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    tableFound: boolean;
    message: string;
  } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Status edit modal
  const [selectedRequest, setSelectedRequest] = useState<GymJoiningRequest | null>(null);
  const [newStatus, setNewStatus] = useState<JoiningRequestStatus>('pending');
  const [isUpdating, setIsUpdating] = useState(false);

  // SQL Migration modal
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedAddEndDate, setCopiedAddEndDate] = useState(false);

  // Manual Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormPhone, setNewFormPhone] = useState('');
  const [newFormEmail, setNewFormEmail] = useState('');
  const [newFormPlan, setNewFormPlan] = useState('1 Month General Membership (₹1,500)');
  const [newFormGoal, setNewFormGoal] = useState('General Fitness & Weight Loss');
  const [newFormStartDate, setNewFormStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newFormEndDate, setNewFormEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newFormNotes, setNewFormNotes] = useState('');
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [health, result] = await Promise.all([
        checkSupabaseHealth(),
        fetchGymJoiningRequests(),
      ]);

      setDbStatus(health);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setRequests(result.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsUpdating(true);

    try {
      await updateJoiningRequestStatus(selectedRequest.id, newStatus);
      setSelectedRequest(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      alert('Error updating status: ' + msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (req: GymJoiningRequest) => {
    const confirmDel = window.confirm(
      `Are you sure you want to delete application from ${req.full_name}?`
    );
    if (!confirmDel) return;

    try {
      await deleteGymJoiningRequest(req.id);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      alert('Error: ' + msg);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!newFormName.trim() || !newFormPhone.trim()) {
      setCreateError('Name and phone number are required.');
      return;
    }

    setIsCreatingManual(true);
    try {
      await submitGymJoiningRequest({
        full_name: newFormName,
        phone: newFormPhone,
        email: newFormEmail || null,
        selected_membership_plan: newFormPlan,
        fitness_goal: newFormGoal || null,
        preferred_start_date: newFormStartDate,
        preferred_end_date: newFormEndDate || null,
        message: newFormNotes || null,
      });

      setShowAddModal(false);
      setNewFormName('');
      setNewFormPhone('');
      setNewFormEmail('');
      setNewFormNotes('');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add joining request';
      setCreateError(msg);
    } finally {
      setIsCreatingManual(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      (r.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.selected_membership_plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.fitness_goal || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
              Supabase Backend
            </span>
            <span className="bg-[#CCFBF1] text-[#0F766E] text-[10px] font-bold px-2 py-0.5 rounded-full">
              PostgreSQL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59] mt-0.5">
            Gym Joining Applications ({requests.length})
          </h1>
          <p className="text-xs text-[#64748B]">
            Real-time applications submitted via the Gym Joining Form to Supabase table <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">gym_joining_requests</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D9EAE7] hover:bg-slate-50 text-xs font-bold text-[#115E59] inline-flex items-center gap-1.5 shadow-xs"
            title="View Supabase SQL Migration Script"
          >
            <Code2 className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>SQL Migration</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Application</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl border border-[#D9EAE7] bg-white text-[#0F766E] hover:bg-[#F0FDFA]"
            title="Reload from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Supabase Connection Status Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full shrink-0 ${
              dbStatus?.connected && dbStatus?.tableFound
                ? 'bg-emerald-500 animate-pulse'
                : dbStatus?.connected
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
          />
          <div className="text-xs">
            <span className="font-bold text-[#115E59] block">
              Supabase Project: <span className="font-mono font-semibold">{SUPABASE_PROJECT_ID}</span>
            </span>
            <span className="text-[#64748B]">
              {dbStatus ? dbStatus.message : 'Checking Supabase health...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(!dbStatus?.tableFound || errorMessage?.includes('PGRST205')) && (
            <button
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Run SQL in Supabase</span>
            </button>
          )}

          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#0F766E] hover:underline inline-flex items-center gap-1"
          >
            <span>Open Table Editor</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Error message banner if table missing */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Supabase Setup Notice:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
          >
            View SQL & Run in Supabase
          </button>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, plan or goal..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9EAE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending', label: 'Pending' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'approved', label: 'Approved' },
            { id: 'enrolled', label: 'Enrolled' },
            { id: 'rejected', label: 'Rejected' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st.id
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-[#F0FDFA] text-[#115E59] hover:bg-teal-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl bg-white border border-[#D9EAE7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0FDFA] border-b border-[#D9EAE7] text-[#115E59] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Membership Plan</th>
                <th className="py-3 px-4">Membership Dates</th>
                <th className="py-3 px-4">Goal / Note</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#64748B]">
                    <div className="w-8 h-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Querying Supabase database...</span>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#64748B]">
                    <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#115E59]">No Joining Requests Found</p>
                    <p className="text-xs text-[#64748B] mt-1">
                      {searchQuery
                        ? 'Try adjusting your search criteria.'
                        : 'Submissions through the public Gym Joining Form will appear here automatically.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Applicant */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1F2937] block text-sm">
                        {req.full_name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mt-0.5">
                        {req.age && <span>{req.age} yrs</span>}
                        {req.gender && <span>• {req.gender}</span>}
                        <span className="font-mono text-[9px] text-slate-400">
                          #{req.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#115E59] block">{req.phone}</span>
                      {req.email && (
                        <span className="text-slate-400 text-[11px] block truncate max-w-[140px]">
                          {req.email}
                        </span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#0F766E] block max-w-[180px] truncate">
                        {req.selected_membership_plan}
                      </span>
                    </td>

                    {/* Preferred Dates */}
                    <td className="py-3 px-4 text-[#1F2937] font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-bold">{req.preferred_start_date}</span>
                        {req.preferred_end_date && (
                          <span className="text-slate-400">→</span>
                        )}
                      </div>
                      {req.preferred_end_date && (
                        <span className="text-[10px] text-[#0F766E] font-semibold block">
                          End: {req.preferred_end_date}
                        </span>
                      )}
                    </td>

                    {/* Goal & Message */}
                    <td className="py-3 px-4 text-[#64748B] max-w-[200px]">
                      {req.fitness_goal && (
                        <span className="font-medium text-[#115E59] block truncate">
                          {req.fitness_goal}
                        </span>
                      )}
                      {req.message && (
                        <span className="text-[11px] text-slate-500 block truncate" title={req.message}>
                          "{req.message}"
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'approved'
                            ? 'bg-purple-100 text-purple-800'
                            : req.status === 'enrolled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Date Created */}
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString()
                        : 'Recent'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Button */}
                        <a
                          href={getWhatsAppUrl(
                            'membership',
                            `Hello ${req.full_name}, this is Sri Maruthi Power House Gym (Jigani) regarding your Gym Joining Application for ${req.selected_membership_plan}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-[#D9EAE7] text-[#0F766E] hover:bg-[#F0FDFA]"
                          title="Open WhatsApp chat with applicant"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        {/* Call Button */}
                        <a
                          href={`tel:${req.phone.replace(/[\s\-]/g, '')}`}
                          className="p-1.5 rounded-lg border border-[#D9EAE7] text-[#0F766E] hover:bg-[#F0FDFA]"
                          title="Call applicant"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {/* Status updater */}
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setNewStatus(req.status as JoiningRequestStatus);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Status</span>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(req)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL Migration Script Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#D9EAE7] p-6 space-y-4 animate-in zoom-in-95 text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <div>
                <h3 className="font-extrabold text-base text-[#115E59]">
                  Supabase SQL Migration Script
                </h3>
                <p className="text-[#64748B]">
                  Run this in the Supabase SQL Editor for project <code className="font-mono text-teal-700">{SUPABASE_PROJECT_ID}</code>
                </p>
              </div>
              <button onClick={() => setShowSqlModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Quick 1-line script box for preferred_end_date */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="block text-xs font-bold text-amber-900">
                    Fixing Error 42710 / Adding "preferred_end_date"
                  </strong>
                  <p className="text-[11px] text-amber-800">
                    If your table already exists, simply run this 1-line command to add the column without re-creating policies:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SQL_ADD_END_DATE_SCRIPT);
                    setCopiedAddEndDate(true);
                    setTimeout(() => setCopiedAddEndDate(false), 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs shrink-0"
                >
                  {copiedAddEndDate ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied 1-Liner!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy 1-Line SQL</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-amber-900/10 p-2 rounded-lg font-mono text-[11px] text-amber-950 select-all">
                ALTER TABLE public.gym_joining_requests ADD COLUMN IF NOT EXISTS preferred_end_date TEXT;
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1">
              <strong className="block font-bold">Full Idempotent Setup Instructions:</strong>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                <li>If creating the full schema, click <strong>Copy Full SQL</strong> below (includes <code className="font-mono text-teal-800">DROP POLICY IF EXISTS</code> so Error 42710 cannot happen).</li>
                <li>
                  Open{' '}
                  <a
                    href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline text-[#0F766E]"
                  >
                    Supabase SQL Editor (opens new tab)
                  </a>
                </li>
                <li>Paste the script and click <strong>Run</strong>.</li>
              </ol>
            </div>

            <div className="relative flex-1 min-h-[220px] bg-slate-900 rounded-xl p-4 overflow-y-auto text-emerald-400 font-mono text-[11px] leading-relaxed">
              <pre>{SQL_MIGRATION_SCRIPT}</pre>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[#64748B]">
                Creates: <code className="font-mono">gym_joining_requests</code> + <code className="font-mono">preferred_end_date</code> + RLS policies
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] text-white font-bold inline-flex items-center gap-1.5 shadow-sm"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied Full Script!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#D9EAE7] p-6 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <div>
                <h3 className="font-extrabold text-base text-[#115E59]">
                  Update Application Status
                </h3>
                <p className="text-[#64748B]">
                  {selectedRequest.full_name} ({selectedRequest.phone})
                </p>
              </div>
              <button onClick={() => setSelectedRequest(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Application Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as JoiningRequestStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white font-semibold text-[#115E59] focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="pending">Pending (Awaiting Review)</option>
                  <option value="contacted">Contacted (WhatsApp/Call made)</option>
                  <option value="approved">Approved (Slot reserved)</option>
                  <option value="enrolled">Enrolled (Membership active)</option>
                  <option value="rejected">Rejected / Cancelled</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-1.5 text-[11px] text-[#1F2937]">
                <div>
                  <span className="text-[#64748B]">Selected Plan: </span>
                  <span className="font-semibold">{selectedRequest.selected_membership_plan}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">Start Date: </span>
                  <span className="font-semibold">{selectedRequest.preferred_start_date}</span>
                </div>
                {selectedRequest.fitness_goal && (
                  <div>
                    <span className="text-[#64748B]">Goal: </span>
                    <span className="font-semibold">{selectedRequest.fitness_goal}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  {isUpdating ? 'Saving to Supabase...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#D9EAE7] p-6 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <div>
                <h3 className="font-extrabold text-base text-[#115E59]">
                  Log In-Person Joining Application
                </h3>
                <p className="text-[#64748B]">Directly inserts a record into Supabase</p>
              </div>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleManualCreate} className="space-y-3">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newFormPhone}
                    onChange={(e) => setNewFormPhone(e.target.value)}
                    placeholder="99454 57747"
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Email</label>
                  <input
                    type="email"
                    value={newFormEmail}
                    onChange={(e) => setNewFormEmail(e.target.value)}
                    placeholder="suresh@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Membership Plan
                </label>
                <select
                  value={newFormPlan}
                  onChange={(e) => setNewFormPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="1 Month General Membership (₹1,500)">
                    1 Month General Membership (₹1,500)
                  </option>
                  <option value="3 Months Transformation Plan (₹3,800)">
                    3 Months Transformation Plan (₹3,800)
                  </option>
                  <option value="6 Months Power Builder (₹6,500)">
                    6 Months Power Builder (₹6,500)
                  </option>
                  <option value="1 Year Elite 24/7 Access (₹11,000)">
                    1 Year Elite 24/7 Access (₹11,000)
                  </option>
                  <option value="Personal Training Split">Personal Training Split</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newFormStartDate}
                    onChange={(e) => {
                      setNewFormStartDate(e.target.value);
                      if (e.target.value) {
                        const d = new Date(e.target.value);
                        d.setMonth(d.getMonth() + 1);
                        setNewFormEndDate(d.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newFormEndDate}
                    onChange={(e) => setNewFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Fitness Goal</label>
                <select
                  value={newFormGoal}
                  onChange={(e) => setNewFormGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white focus:outline-none focus:border-[#0F766E]"
                >
                  <option>General Fitness & Weight Loss</option>
                  <option>Muscle Building & Hypertrophy</option>
                  <option>Strength & Powerlifting</option>
                  <option>Cardio Stamina</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newFormNotes}
                  onChange={(e) => setNewFormNotes(e.target.value)}
                  placeholder="Optional walk-in notes..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingManual}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  {isCreatingManual ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
