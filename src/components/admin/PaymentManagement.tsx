import React, { useEffect, useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Printer,
  X,
  Dumbbell,
  ShieldCheck
} from 'lucide-react';
import { PaymentRecord, Member, PaymentMethod, PaymentStatus } from '../../types';
import {
  getPaymentRecords,
  recordPayment,
  getMembers,
  logAuditEvent
} from '../../services/gymService';
import { useAuth } from '../../context/AuthContext';

export const PaymentManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Record payment modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [planName, setPlanName] = useState('Monthly Gym Membership');
  const [amount, setAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Verified');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Digital receipt modal
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pay, m] = await Promise.all([getPaymentRecords(), getMembers()]);
      setPayments(pay);
      setMembers(m);
      if (m.length > 0 && !selectedMemberId) {
        setSelectedMemberId(m[0].memberId);
      }
    } catch (e) {
      console.warn('Error loading payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewPaymentModal = () => {
    setErrorMsg(null);
    if (members.length > 0) setSelectedMemberId(members[0].memberId);
    setPlanName('3 Months Quarterly Plan');
    setAmount(3800);
    setPaymentMethod('UPI');
    setPaymentStatus('Verified');
    setTransactionRef(`UPI${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setNotes('Staff verified payment');
    setIsModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      return;
    }

    const memberObj = members.find((m) => m.memberId === selectedMemberId);
    const memberName = memberObj ? memberObj.name : 'Gym Member';

    setIsSaving(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const newPayId = await recordPayment({
        memberId: selectedMemberId,
        memberName,
        planName,
        amount: Number(amount),
        currency: 'INR',
        paymentDate: todayStr,
        paymentMethod,
        paymentStatus,
        transactionReference: transactionRef.trim() || undefined,
        verifiedBy: currentUser?.email || 'Staff Admin',
        notes: notes.trim() || undefined,
      });

      await logAuditEvent(
        'RECORD_PAYMENT',
        'PaymentRecord',
        newPayId,
        `Verified payment of ₹${amount} via ${paymentMethod} for ${memberName} (${selectedMemberId})`,
        currentUser?.email || 'admin@smpgym.com'
      );

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error recording payment');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.transactionReference || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments
    .filter((p) => p.paymentStatus === 'Verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const upiTotal = payments
    .filter((p) => p.paymentStatus === 'Verified' && p.paymentMethod === 'UPI')
    .reduce((sum, p) => sum + p.amount, 0);

  const cashTotal = payments
    .filter((p) => p.paymentStatus === 'Verified' && p.paymentMethod === 'Cash')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
            Financial Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
            Payment Records & Receipts
          </h1>
          <p className="text-xs text-[#64748B]">
            Manually verified member transactions with secure audit history.
          </p>
        </div>

        <button
          onClick={openNewPaymentModal}
          className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record Verified Payment</span>
        </button>
      </div>

      {/* Revenue Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
          <span className="text-xs font-bold text-[#64748B] block">Total Verified Collections</span>
          <span className="text-2xl font-extrabold text-[#115E59] mt-1 block">
            ₹{totalCollected.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-teal-700">Audited in-person & online receipts</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
          <span className="text-xs font-bold text-[#64748B] block">UPI Collections</span>
          <span className="text-2xl font-extrabold text-emerald-800 mt-1 block">
            ₹{upiTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-[#64748B]">Bank transfer / QR payments</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
          <span className="text-xs font-bold text-[#64748B] block">Cash Collections</span>
          <span className="text-2xl font-extrabold text-teal-800 mt-1 block">
            ₹{cashTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-[#64748B]">Front desk physical receipts</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by member, ID, or reference..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9EAE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'UPI', 'Cash', 'Card', 'Bank Transfer'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                methodFilter === m
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-[#F0FDFA] text-[#115E59] hover:bg-teal-100'
              }`}
            >
              {m === 'all' ? 'All Methods' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-white border border-[#D9EAE7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0FDFA] border-b border-[#D9EAE7] text-[#115E59] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Plan / Purpose</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#64748B]">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#64748B]">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#64748B]">
                      {p.paymentDate}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1F2937] block">{p.memberName}</span>
                      <span className="font-mono text-[11px] text-[#0F766E]">{p.memberId}</span>
                    </td>
                    <td className="py-3 px-4 text-[#115E59] font-semibold">
                      {p.planName || 'Membership Subscription'}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-sm text-[#115E59]">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1F2937] block">{p.paymentMethod}</span>
                      {p.transactionReference && (
                        <span className="font-mono text-[10px] text-slate-400">
                          Ref: {p.transactionReference}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.paymentStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.paymentStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveReceipt(p)}
                        className="px-2.5 py-1 rounded-lg border border-[#D9EAE7] hover:bg-[#F0FDFA] text-[#0F766E] font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#D9EAE7] p-6 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <h3 className="font-extrabold text-base text-[#115E59]">
                Record Verified Payment
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Select Member *</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white font-medium focus:outline-none focus:border-[#0F766E]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.memberId}>
                      {m.name} ({m.memberId}) - {m.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Plan / Description *</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] font-extrabold text-sm focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="UPI">UPI / QR</option>
                    <option value="Cash">Cash (Front Desk)</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Transaction Reference / UTR Number
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. 429182910481"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] font-mono focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verified by cash register at evening shift"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] text-white font-bold"
                >
                  {isSaving ? 'Logging...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#D9EAE7] p-8 space-y-6 text-xs text-[#1F2937] animate-in zoom-in-95">
            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-[#0F766E] text-white flex items-center justify-center mx-auto mb-2">
                <Dumbbell className="w-7 h-7 transform -rotate-45" />
              </div>
              <h3 className="font-extrabold text-base text-[#115E59]">
                SRI MARUTHI POWER HOUSE GYM 24/7
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                2nd Floor, MNT Complex, Jigani - Anekal Road, Bengaluru 560105
              </p>
              <p className="text-[11px] text-[#64748B]">Phone: +91 99454 57747</p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Receipt Date:</span>
                <span className="font-bold">{activeReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Member ID:</span>
                <span className="font-mono font-bold text-[#0F766E]">{activeReceipt.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Member Name:</span>
                <span className="font-bold">{activeReceipt.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Subscription Plan:</span>
                <span className="font-bold text-[#115E59]">{activeReceipt.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Payment Mode:</span>
                <span className="font-semibold">{activeReceipt.paymentMethod}</span>
              </div>
              {activeReceipt.transactionReference && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Transaction Ref:</span>
                  <span className="font-mono">{activeReceipt.transactionReference}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider block">
                  Amount Paid
                </span>
                <span className="text-[10px] text-emerald-800">Verified & Authenticated</span>
              </div>
              <div className="text-2xl font-extrabold text-[#115E59]">
                ₹{activeReceipt.amount.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Verified badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Front-Desk Digital Receipt</span>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-[#0F766E] text-[#0F766E] font-bold inline-flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#0F766E] text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
