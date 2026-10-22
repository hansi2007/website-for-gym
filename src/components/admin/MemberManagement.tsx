import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  X,
  CreditCard,
  UserCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Member, MembershipPlan, Membership, Attendance, PaymentRecord, MembershipStatus } from '../../types';
import {
  getMembers,
  saveMember,
  deleteMember,
  getAllPlans,
  saveMembership,
  getMemberships,
  getAttendanceLogs,
  getPaymentRecords,
  recordPayment,
  logAuditEvent
} from '../../services/gymService';
import { useAuth } from '../../context/AuthContext';

export const MemberManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form fields
  const [formMemberId, setFormMemberId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formBloodGroup, setFormBloodGroup] = useState('');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<MembershipStatus>('active');

  // Membership assignment on create
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordInitialPayment, setRecordInitialPayment] = useState(true);
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');

  // View Member Detail Modal state
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [memberMemberships, setMemberMemberships] = useState<Membership[]>([]);
  const [memberAttendance, setMemberAttendance] = useState<Attendance[]>([]);
  const [memberPayments, setMemberPayments] = useState<PaymentRecord[]>([]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([getMembers(), getAllPlans()]);
      setMembers(m);
      setPlans(p);
      if (p.length > 0 && !selectedPlanId) {
        setSelectedPlanId(p[0].id);
      }
    } catch (e) {
      console.warn('Error loading members:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    // Auto generate member ID
    const nextId = `SMP-${100 + members.length + 1}`;
    setFormMemberId(nextId);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormBloodGroup('B+');
    setFormEmergencyContact('');
    setFormNotes('');
    setFormStatus('active');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    if (plans.length > 0) setSelectedPlanId(plans[0].id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Member) => {
    setEditingMember(m);
    setFormMemberId(m.memberId);
    setFormName(m.name);
    setFormPhone(m.phone);
    setFormEmail(m.email || '');
    setFormBloodGroup(m.bloodGroup || '');
    setFormEmergencyContact(m.emergencyContact || '');
    setFormNotes(m.notes || '');
    setFormStatus(m.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = formName.trim();
    const cleanPhone = formPhone.trim().replace(/\s+/g, '');

    if (!cleanName || cleanName.length < 2) {
      setFormError('Please enter a valid member name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      setFormError('Please enter a valid phone number.');
      return;
    }

    setIsSaving(true);
    try {
      let expiryDateStr = '';
      let planNameStr = '';
      let planPrice = 0;

      if (!editingMember && selectedPlanId) {
        const foundPlan = plans.find((p) => p.id === selectedPlanId);
        if (foundPlan) {
          planNameStr = foundPlan.name;
          planPrice = foundPlan.price;
          const start = new Date(formStartDate);
          start.setMonth(start.getMonth() + foundPlan.durationMonths);
          expiryDateStr = start.toISOString().split('T')[0];
        }
      }

      const memberPayload: Partial<Member> = {
        memberId: formMemberId,
        name: cleanName,
        phone: cleanPhone,
        email: formEmail.trim() || undefined,
        bloodGroup: formBloodGroup || undefined,
        emergencyContact: formEmergencyContact.trim() || undefined,
        notes: formNotes.trim() || undefined,
        status: formStatus,
      };

      if (!editingMember) {
        memberPayload.joinDate = formStartDate;
        memberPayload.currentPlanId = selectedPlanId || undefined;
        memberPayload.currentPlanName = planNameStr || undefined;
        memberPayload.currentStartDate = formStartDate;
        memberPayload.currentExpiryDate = expiryDateStr || undefined;
      }

      if (editingMember) {
        memberPayload.id = editingMember.id;
      }

      const savedId = await saveMember(memberPayload);

      // If new member with membership plan chosen, create subscription & payment records
      if (!editingMember && selectedPlanId) {
        const membershipDocId = await saveMembership({
          memberId: formMemberId,
          memberName: cleanName,
          planId: selectedPlanId,
          planName: planNameStr,
          price: planPrice,
          startDate: formStartDate,
          expiryDate: expiryDateStr,
          status: 'active',
          isPaid: recordInitialPayment,
          notes: 'Initial enrollment subscription',
        });

        if (recordInitialPayment && planPrice > 0) {
          await recordPayment({
            memberId: formMemberId,
            memberName: cleanName,
            membershipId: membershipDocId,
            planName: planNameStr,
            amount: planPrice,
            currency: 'INR',
            paymentDate: formStartDate,
            paymentMethod: initialPaymentMethod,
            paymentStatus: 'Verified',
            transactionReference: `${initialPaymentMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`,
            verifiedBy: currentUser?.email || 'Staff Admin',
            notes: 'Enrollment payment',
          });
        }
      }

      await logAuditEvent(
        editingMember ? 'UPDATE_MEMBER' : 'ENROLL_MEMBER',
        'Member',
        formMemberId,
        `${editingMember ? 'Updated' : 'Enrolled'} member ${cleanName} (${formMemberId})`,
        currentUser?.email || 'admin@smpgym.com'
      );

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save member.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (m: Member) => {
    const newStatus: MembershipStatus = m.status === 'inactive' ? 'active' : 'inactive';
    const confirmMsg = `Are you sure you want to mark ${m.name} (${m.memberId}) as ${newStatus}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await saveMember({ id: m.id, status: newStatus });
      await logAuditEvent(
        'CHANGE_STATUS',
        'Member',
        m.memberId,
        `Changed status of ${m.name} to ${newStatus}`,
        currentUser?.email || 'admin@smpgym.com'
      );
      loadData();
    } catch (e) {
      alert('Error updating status: ' + e);
    }
  };

  const openViewModal = async (m: Member) => {
    setViewingMember(m);
    try {
      const [allMs, allAtt, allPay] = await Promise.all([
        getMemberships(),
        getAttendanceLogs(),
        getPaymentRecords(),
      ]);
      setMemberMemberships(allMs.filter((ms) => ms.memberId === m.memberId));
      setMemberAttendance(allAtt.filter((att) => att.memberId === m.memberId));
      setMemberPayments(allPay.filter((pay) => pay.memberId === m.memberId));
    } catch (e) {
      console.warn('Error loading member history:', e);
    }
  };

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
            Management Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
            Member Directory ({members.length})
          </h1>
          <p className="text-xs text-[#64748B]">
            Register new members, view attendance history, and manage subscription statuses.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9EAE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#64748B] hidden sm:inline" />
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'expiring', label: 'Expiring Soon' },
            { id: 'expired', label: 'Expired' },
            { id: 'inactive', label: 'Inactive' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st.id
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-[#F0FDFA] text-[#115E59] hover:bg-teal-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl bg-white border border-[#D9EAE7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0FDFA] border-b border-[#D9EAE7] text-[#115E59] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Name & Contact</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#64748B]">
                    <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#64748B]">
                    No members match your criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">
                      {m.memberId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1F2937] block text-sm">{m.name}</span>
                      <span className="text-[#64748B] flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-teal-600" />
                        {m.phone}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#115E59]">
                        {m.currentPlanName || 'Standard Access'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {m.currentExpiryDate ? (
                        <div>
                          <span>Exp: {m.currentExpiryDate}</span>
                          <span className="block text-[10px] text-slate-400">
                            Joined: {m.joinDate}
                          </span>
                        </div>
                      ) : (
                        <span>Joined: {m.joinDate}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          m.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status === 'expiring'
                            ? 'bg-amber-100 text-amber-800'
                            : m.status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openViewModal(m)}
                          className="p-1.5 rounded-lg border border-[#D9EAE7] text-[#0F766E] hover:bg-[#F0FDFA]"
                          title="View Profile & Logs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 rounded-lg border border-[#D9EAE7] text-[#115E59] hover:bg-slate-50"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(m)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold ${
                            m.status === 'inactive'
                              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              : 'border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600'
                          }`}
                          title={m.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
                        >
                          {m.status === 'inactive' ? 'Activate' : 'Deactivate'}
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

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D9EAE7] p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <h3 className="font-extrabold text-lg text-[#115E59]">
                {editingMember ? 'Edit Member Information' : 'Enroll New Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">
                    Member ID *
                  </label>
                  <input
                    type="text"
                    value={formMemberId}
                    onChange={(e) => setFormMemberId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] font-mono focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">
                    Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as MembershipStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="active">Active</option>
                    <option value="expiring">Expiring</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 99454 57747"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="optional"
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formBloodGroup}
                    onChange={(e) => setFormBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={formEmergencyContact}
                    onChange={(e) => setFormEmergencyContact(e.target.value)}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              {/* Initial plan selection (only for new members) */}
              {!editingMember && (
                <div className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-3">
                  <div className="font-bold text-xs text-[#0F766E] uppercase tracking-wider">
                    Membership Assignment
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#115E59] block mb-1">
                        Select Membership Tier
                      </label>
                      <select
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white focus:outline-none focus:border-[#0F766E]"
                      >
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.price})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-[#115E59] block mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white focus:outline-none focus:border-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-teal-200/50">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#115E59]">
                      <input
                        type="checkbox"
                        checked={recordInitialPayment}
                        onChange={(e) => setRecordInitialPayment(e.target.checked)}
                        className="rounded text-[#0F766E]"
                      />
                      <span>Mark subscription as paid</span>
                    </label>

                    {recordInitialPayment && (
                      <select
                        value={initialPaymentMethod}
                        onChange={(e) => setInitialPaymentMethod(e.target.value as any)}
                        className="px-2 py-1 rounded-lg border border-[#D9EAE7] bg-white text-xs font-bold text-[#0F766E]"
                      >
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                      </select>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Locker number assigned or fitness injuries..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-[#64748B] font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold shadow-sm"
                >
                  {isSaving ? 'Saving...' : editingMember ? 'Update Member' : 'Enroll Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Member Profile Modal with Subscription, Attendance & Payment history */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D9EAE7] p-6 space-y-6 animate-in zoom-in-95 text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#D9EAE7]">
              <div>
                <span className="font-mono font-bold text-[#0F766E] text-xs">
                  {viewingMember.memberId}
                </span>
                <h3 className="text-xl font-extrabold text-[#115E59] mt-0.5">
                  {viewingMember.name}
                </h3>
                <p className="text-[#64748B]">
                  Joined on {viewingMember.joinDate} • Status: <strong className="text-emerald-700 uppercase">{viewingMember.status}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="p-1 rounded-lg text-[#64748B] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7]">
              <div>
                <span className="text-[#64748B] block text-[11px]">Phone</span>
                <span className="font-bold text-[#115E59]">{viewingMember.phone}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Blood Group</span>
                <span className="font-bold text-[#115E59]">{viewingMember.bloodGroup || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Emergency Contact</span>
                <span className="font-bold text-[#115E59]">{viewingMember.emergencyContact || 'None'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Plan Expiry</span>
                <span className="font-bold text-amber-800">{viewingMember.currentExpiryDate || 'N/A'}</span>
              </div>
            </div>

            {/* Membership Subscriptions History */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-[#115E59] mb-2">
                <CreditCard className="w-4 h-4 text-[#0F766E]" />
                <span>Subscription History</span>
              </div>
              {memberMemberships.length === 0 ? (
                <p className="text-slate-400 py-2">No subscription records found.</p>
              ) : (
                <div className="border border-[#D9EAE7] rounded-xl overflow-hidden divide-y divide-slate-100">
                  {memberMemberships.map((ms) => (
                    <div key={ms.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#115E59] block">{ms.planName}</span>
                        <span className="text-[#64748B] text-[11px]">
                          {ms.startDate} to {ms.expiryDate}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#0F766E] block">₹{ms.price}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {ms.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Attendance */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-[#115E59] mb-2">
                <UserCheck className="w-4 h-4 text-[#0F766E]" />
                <span>Attendance Logs ({memberAttendance.length} visits)</span>
              </div>
              {memberAttendance.length === 0 ? (
                <p className="text-slate-400 py-2">No attendance logs on record.</p>
              ) : (
                <div className="border border-[#D9EAE7] rounded-xl overflow-hidden divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {memberAttendance.slice(0, 10).map((att) => (
                    <div key={att.id} className="p-2.5 flex items-center justify-between">
                      <span className="font-semibold text-[#1F2937]">{att.dateKey}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                        In: {att.checkInTime} {att.checkOutTime ? `• Out: ${att.checkOutTime}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment history */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-[#115E59] mb-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Payment Receipts</span>
              </div>
              {memberPayments.length === 0 ? (
                <p className="text-slate-400 py-2">No verified receipts recorded.</p>
              ) : (
                <div className="border border-[#D9EAE7] rounded-xl overflow-hidden divide-y divide-slate-100">
                  {memberPayments.map((p) => (
                    <div key={p.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#115E59]">{p.planName || 'Membership'}</span>
                        <span className="text-[11px] text-slate-400 block">
                          {p.paymentDate} • {p.paymentMethod} • Ref: {p.transactionReference || 'N/A'}
                        </span>
                      </div>
                      <span className="font-extrabold text-emerald-800 text-sm">
                        ₹{p.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingMember(null)}
                className="px-5 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
