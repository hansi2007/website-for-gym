import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Clock,
  Target,
  Edit3,
  CheckCircle2,
  ExternalLink,
  X
} from 'lucide-react';
import { Enquiry, EnquiryStatus } from '../../types';
import { getEnquiries, updateEnquiryStatus, logAuditEvent } from '../../services/gymService';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import { useAuth } from '../../context/AuthContext';

export const EnquiryManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected enquiry for detail / notes modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [newStatus, setNewStatus] = useState<EnquiryStatus>('New');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (e) {
      console.warn('Error loading enquiries:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openStatusModal = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setNewStatus(enq.status);
    setNotes(enq.internalNotes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setIsUpdating(true);

    try {
      await updateEnquiryStatus(selectedEnquiry.id, newStatus, notes);
      await logAuditEvent(
        'UPDATE_ENQUIRY',
        'Enquiry',
        selectedEnquiry.id,
        `Updated enquiry for ${selectedEnquiry.fullName} to status "${newStatus}"`,
        currentUser?.email || 'admin@smpgym.com'
      );
      setSelectedEnquiry(null);
      loadData();
    } catch (err) {
      alert('Error updating enquiry: ' + err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone.includes(searchQuery) ||
      (e.fitnessGoal || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
            Lead Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
            Enquiries & Trial Bookings ({enquiries.length})
          </h1>
          <p className="text-xs text-[#64748B]">
            Follow up on website leads, schedule trial sessions, and maintain notes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, phone, or goal..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9EAE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'New', label: 'New' },
            { id: 'Contacted', label: 'Contacted' },
            { id: 'Trial Booked', label: 'Trial Booked' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Closed', label: 'Closed' },
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

      {/* Table */}
      <div className="rounded-2xl bg-white border border-[#D9EAE7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0FDFA] border-b border-[#D9EAE7] text-[#115E59] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Visitor Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Preferred Slot</th>
                <th className="py-3 px-4">Fitness Goal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#64748B]">
                    Loading enquiries...
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#64748B]">
                    No enquiries match this filter.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1F2937] block text-sm">{enq.fullName}</span>
                      {enq.internalNotes && (
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-mono mt-0.5 inline-block">
                          Note: {enq.internalNotes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#115E59] block">{enq.phone}</span>
                      {enq.email && <span className="text-slate-400 text-[11px]">{enq.email}</span>}
                    </td>
                    <td className="py-3 px-4 text-[#1F2937]">
                      {enq.preferredTime || 'Any Time'}
                      {enq.preferredDate && (
                        <span className="block text-[10px] text-[#64748B]">
                          Date: {enq.preferredDate}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {enq.fitnessGoal || 'General Fitness'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          enq.status === 'New'
                            ? 'bg-amber-100 text-amber-800'
                            : enq.status === 'Contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : enq.status === 'Trial Booked'
                            ? 'bg-emerald-100 text-emerald-800'
                            : enq.status === 'Completed'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getWhatsAppUrl(
                            'trial',
                            `Hello ${enq.fullName}, this is Sri Maruthi Power House Gym regarding your trial session request in Jigani.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-[#D9EAE7] text-[#0F766E] hover:bg-[#F0FDFA]"
                          title="Open WhatsApp chat"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openStatusModal(enq)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Status</span>
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

      {/* Status & Notes Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#D9EAE7] p-6 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <div>
                <h3 className="font-extrabold text-base text-[#115E59]">
                  Update Lead Status
                </h3>
                <p className="text-[#64748B]">
                  {selectedEnquiry.fullName} ({selectedEnquiry.phone})
                </p>
              </div>
              <button onClick={() => setSelectedEnquiry(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Status Workflow</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as EnquiryStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white font-semibold text-[#115E59] focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="New">New Lead (Awaiting Contact)</option>
                  <option value="Contacted">Contacted via Phone/WhatsApp</option>
                  <option value="Trial Booked">Trial Session Scheduled</option>
                  <option value="Completed">Trial Completed / Enrolled</option>
                  <option value="Closed">Closed / Not Interested</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Internal Staff Notes / Conversation Audit
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Called visitor on 22nd. Scheduled trial for Saturday 7 AM with Coach Suresh."
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  {isUpdating ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
