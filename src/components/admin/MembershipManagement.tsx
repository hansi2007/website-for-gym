import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RotateCw,
  Eye,
  EyeOff,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import { Membership, MembershipPlan, Member, PlanCategory } from '../../types';
import {
  getMemberships,
  getAllPlans,
  savePlan,
  deletePlan,
  getMembers,
  saveMembership,
  saveMember,
  recordPayment,
  logAuditEvent
} from '../../services/gymService';
import { useAuth } from '../../context/AuthContext';

export const MembershipManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans'>('subscriptions');

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Renewal modal state
  const [renewingMembership, setRenewingMembership] = useState<Membership | null>(null);
  const [renewPlanId, setRenewPlanId] = useState('');
  const [renewStartDate, setRenewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [renewIsPaid, setRenewIsPaid] = useState(true);
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');
  const [isRenewing, setIsRenewing] = useState(false);

  // Plan creation / editing modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState<number>(1500);
  const [planDuration, setPlanDuration] = useState<number>(1);
  const [planCategory, setPlanCategory] = useState<PlanCategory>('monthly');
  const [planBenefits, setPlanBenefits] = useState('');
  const [planTerms, setPlanTerms] = useState('');
  const [planIsPublished, setPlanIsPublished] = useState(true);
  const [planIsPopular, setPlanIsPopular] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ms, p, m] = await Promise.all([
        getMemberships(),
        getAllPlans(),
        getMembers(),
      ]);
      setMemberships(ms);
      setPlans(p);
      setMembers(m);
    } catch (e) {
      console.warn('Error loading memberships/plans:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Plan Modal
  const openNewPlanModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanPrice(1500);
    setPlanDuration(1);
    setPlanCategory('monthly');
    setPlanBenefits('Full gym access\nLocker facility\nGeneral trainer support');
    setPlanTerms('Valid from activation date. Non-transferable.');
    setPlanIsPublished(true);
    setPlanIsPopular(false);
    setErrorMsg(null);
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanPrice(plan.price);
    setPlanDuration(plan.durationMonths);
    setPlanCategory(plan.category);
    setPlanBenefits(plan.benefits.join('\n'));
    setPlanTerms(plan.terms || '');
    setPlanIsPublished(plan.isPublished);
    setPlanIsPopular(!!plan.isPopular);
    setErrorMsg(null);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) {
      setErrorMsg('Please enter a plan name.');
      return;
    }
    if (planPrice < 0) {
      setErrorMsg('Price cannot be negative.');
      return;
    }

    try {
      const benefitsArray = planBenefits
        .split('\n')
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      await savePlan({
        ...(editingPlan ? { id: editingPlan.id } : {}),
        name: planName.trim(),
        price: Number(planPrice),
        durationMonths: Number(planDuration),
        category: planCategory,
        benefits: benefitsArray,
        terms: planTerms.trim(),
        isPublished: planIsPublished,
        isPopular: planIsPopular,
      });

      await logAuditEvent(
        editingPlan ? 'UPDATE_PLAN' : 'CREATE_PLAN',
        'MembershipPlan',
        planName,
        `Configured membership plan: ${planName} (₹${planPrice})`,
        currentUser?.email || 'admin@smpgym.com'
      );

      setIsPlanModalOpen(false);
      loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error saving plan');
    }
  };

  const handleDeletePlan = async (p: MembershipPlan) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${p.name}"?`)) return;
    try {
      await deletePlan(p.id);
      loadData();
    } catch (err) {
      alert('Failed to delete plan: ' + err);
    }
  };

  // Renewal Handler
  const openRenewModal = (ms: Membership) => {
    setRenewingMembership(ms);
    setRenewPlanId(ms.planId || (plans[0]?.id || ''));
    // Start date defaults to either current expiry or today, whichever is later
    const now = new Date();
    const expiry = new Date(ms.expiryDate);
    const startStr = (expiry > now ? expiry : now).toISOString().split('T')[0];
    setRenewStartDate(startStr);
    setRenewIsPaid(true);
    setRenewPaymentMethod('UPI');
  };

  const handleProcessRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingMembership) return;
    setIsRenewing(true);

    try {
      const chosenPlan = plans.find((p) => p.id === renewPlanId) || {
        id: 'custom',
        name: renewingMembership.planName,
        price: renewingMembership.price,
        durationMonths: 1,
      };

      const start = new Date(renewStartDate);
      start.setMonth(start.getMonth() + chosenPlan.durationMonths);
      const newExpiryStr = start.toISOString().split('T')[0];

      // Mark old membership as renewed
      await saveMembership({
        id: renewingMembership.id,
        status: 'renewed',
      });

      // Create new active membership subscription
      const newSubId = await saveMembership({
        memberId: renewingMembership.memberId,
        memberName: renewingMembership.memberName,
        planId: chosenPlan.id,
        planName: chosenPlan.name,
        price: chosenPlan.price,
        startDate: renewStartDate,
        expiryDate: newExpiryStr,
        status: 'active',
        isPaid: renewIsPaid,
        notes: `Renewed subscription following ${renewingMembership.id}`,
      });

      // Update Member doc's currentPlan details
      const foundMember = members.find((m) => m.memberId === renewingMembership.memberId);
      if (foundMember) {
        await saveMember({
          id: foundMember.id,
          status: 'active',
          currentPlanId: chosenPlan.id,
          currentPlanName: chosenPlan.name,
          currentStartDate: renewStartDate,
          currentExpiryDate: newExpiryStr,
        });
      }

      // Record verified payment record if paid
      if (renewIsPaid && chosenPlan.price > 0) {
        await recordPayment({
          memberId: renewingMembership.memberId,
          memberName: renewingMembership.memberName,
          membershipId: newSubId,
          planName: chosenPlan.name,
          amount: chosenPlan.price,
          currency: 'INR',
          paymentDate: renewStartDate,
          paymentMethod: renewPaymentMethod,
          paymentStatus: 'Verified',
          transactionReference: `${renewPaymentMethod.toUpperCase()}-RNW-${Date.now().toString().slice(-6)}`,
          verifiedBy: currentUser?.email || 'Staff Admin',
          notes: 'Membership renewal payment',
        });
      }

      await logAuditEvent(
        'RENEW_MEMBERSHIP',
        'Membership',
        renewingMembership.memberId,
        `Renewed membership for ${renewingMembership.memberName} (${chosenPlan.name} - ₹${chosenPlan.price})`,
        currentUser?.email || 'admin@smpgym.com'
      );

      setRenewingMembership(null);
      loadData();
    } catch (err: unknown) {
      alert('Renewal error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRenewing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
            Subscriptions & Tiers
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
            Membership Management
          </h1>
          <p className="text-xs text-[#64748B]">
            Configure pricing plans, track active member validity, and process verified renewals.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white border border-[#D9EAE7]">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'subscriptions'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#115E59]'
            }`}
          >
            Active Subscriptions ({memberships.length})
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'plans'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#115E59]'
            }`}
          >
            Pricing Tiers ({plans.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: Subscriptions list */}
      {activeTab === 'subscriptions' && (
        <div className="rounded-2xl bg-white border border-[#D9EAE7] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0FDFA] border-b border-[#D9EAE7] text-[#115E59] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-[#64748B]">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : memberships.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-[#64748B]">
                      No active subscription records found. Enroll a member to assign a membership.
                    </td>
                  </tr>
                ) : (
                  memberships.map((ms) => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isDueSoon = ms.status === 'expiring' || (ms.expiryDate >= todayStr && ms.expiryDate <= new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

                    return (
                      <tr key={ms.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#1F2937] block">{ms.memberName}</span>
                          <span className="font-mono text-[11px] text-[#0F766E]">{ms.memberId}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#115E59]">
                          {ms.planName}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-[#1F2937]">
                          ₹{ms.price}
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">{ms.startDate}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{ms.expiryDate}</span>
                          {isDueSoon && (
                            <span className="block text-[10px] text-amber-600 font-bold">
                              Renewal Soon
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ms.isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {ms.isPaid ? 'Verified Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ms.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ms.status === 'expiring'
                                ? 'bg-amber-100 text-amber-800'
                                : ms.status === 'expired'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ms.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openRenewModal(ms)}
                            className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Renew</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Pricing tiers configuration */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#64748B]">
              Membership tiers created here appear on the public Memberships page when published.
            </p>
            <button
              onClick={openNewPlanModal}
              className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Plan Tier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`p-6 rounded-3xl bg-white border ${
                  p.isPublished ? 'border-[#D9EAE7]' : 'border-dashed border-slate-300 opacity-75'
                } shadow-xs flex flex-col justify-between space-y-4`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F0FDFA] text-[#0F766E]">
                      {p.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {p.isPublished ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                      {p.isPopular && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          ★ Popular
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#115E59]">{p.name}</h3>
                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-3xl font-extrabold text-[#1F2937]">₹{p.price}</span>
                    <span className="text-xs text-[#64748B]">/ {p.durationMonths} months</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[#1F2937] my-3">
                    {p.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {p.terms && (
                    <p className="text-[11px] text-[#64748B] italic bg-[#F0FDFA] p-2 rounded-lg">
                      {p.terms}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => openEditPlanModal(p)}
                    className="px-3 py-1.5 rounded-lg border border-[#D9EAE7] hover:bg-[#F0FDFA] text-xs font-semibold text-[#0F766E] flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeletePlan(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Add / Edit Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D9EAE7] p-6 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <h3 className="font-extrabold text-lg text-[#115E59]">
                {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
              </h3>
              <button onClick={() => setIsPlanModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-3.5">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Plan Name *</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. 3 Months Strength Transformation"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    value={planDuration}
                    onChange={(e) => setPlanDuration(Number(e.target.value))}
                    min={1}
                    max={36}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Category</label>
                  <select
                    value={planCategory}
                    onChange={(e) => setPlanCategory(e.target.value as PlanCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half-yearly">Half-Yearly</option>
                    <option value="annual">Annual</option>
                    <option value="personal-training">Personal Training</option>
                    <option value="couple">Couple / Special</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Included Benefits (One per line)
                </label>
                <textarea
                  rows={4}
                  value={planBenefits}
                  onChange={(e) => setPlanBenefits(e.target.value)}
                  placeholder="Full gym access&#10;Locker room access&#10;Trainer guidance"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Terms & Conditions</label>
                <input
                  type="text"
                  value={planTerms}
                  onChange={(e) => setPlanTerms(e.target.value)}
                  placeholder="e.g. Valid 90 days. Non-refundable."
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#115E59]">
                  <input
                    type="checkbox"
                    checked={planIsPublished}
                    onChange={(e) => setPlanIsPublished(e.target.checked)}
                    className="rounded text-[#0F766E]"
                  />
                  <span>Publish to Public Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#115E59]">
                  <input
                    type="checkbox"
                    checked={planIsPopular}
                    onChange={(e) => setPlanIsPopular(e.target.checked)}
                    className="rounded text-[#0F766E]"
                  />
                  <span>Mark as Most Popular</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renewal Modal */}
      {renewingMembership && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#D9EAE7] p-6 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <div>
                <h3 className="font-extrabold text-base text-[#115E59]">
                  Renew Member Subscription
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  {renewingMembership.memberName} ({renewingMembership.memberId})
                </p>
              </div>
              <button onClick={() => setRenewingMembership(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleProcessRenewal} className="space-y-4">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Select Renewal Plan Tier
                </label>
                <select
                  value={renewPlanId}
                  onChange={(e) => setRenewPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white font-medium focus:outline-none focus:border-[#0F766E]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ₹{p.price} ({p.durationMonths} months)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Renewal Activation Date
                </label>
                <input
                  type="date"
                  value={renewStartDate}
                  onChange={(e) => setRenewStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#115E59]">
                  <input
                    type="checkbox"
                    checked={renewIsPaid}
                    onChange={(e) => setRenewIsPaid(e.target.checked)}
                    className="rounded text-[#0F766E]"
                  />
                  <span>Record Verified Payment Instantly</span>
                </label>

                {renewIsPaid && (
                  <div>
                    <label className="block text-[11px] text-[#64748B] mb-1">Payment Method:</label>
                    <div className="flex gap-2">
                      {(['UPI', 'Cash', 'Card'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setRenewPaymentMethod(m)}
                          className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                            renewPaymentMethod === m
                              ? 'bg-[#0F766E] text-white border-[#0F766E]'
                              : 'bg-white border-[#D9EAE7] text-[#115E59]'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenewingMembership(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenewing}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] text-white font-bold shadow-sm"
                >
                  {isRenewing ? 'Processing...' : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
