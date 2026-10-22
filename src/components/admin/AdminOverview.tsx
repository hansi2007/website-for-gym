import React, { useEffect, useState } from 'react';
import {
  Users,
  CreditCard,
  UserCheck,
  MessageSquare,
  Receipt,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Phone,
  RefreshCw,
  UserPlus,
  Database
} from 'lucide-react';
import { Member, Membership, Attendance, Enquiry, PaymentRecord } from '../../types';
import {
  getMembers,
  getMemberships,
  getAttendanceLogs,
  getEnquiries,
  getPaymentRecords,
  checkInMember
} from '../../services/gymService';
import { getWhatsAppUrl } from '../../utils/whatsapp';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick check-in input
  const [checkInQuery, setCheckInQuery] = useState('');
  const [checkInMsg, setCheckInMsg] = useState<{ text: string; success: boolean } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const todayKey = new Date().toISOString().split('T')[0];
      const [m, ms, att, enq, pay] = await Promise.all([
        getMembers(),
        getMemberships(),
        getAttendanceLogs(todayKey),
        getEnquiries(),
        getPaymentRecords(),
      ]);

      setMembers(m);
      setMemberships(ms);
      setTodayAttendance(att);
      setEnquiries(enq);
      setPayments(pay);
    } catch (e) {
      console.warn('Error loading admin overview metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live metrics
  const totalRegisteredMembers = members.length;
  const activeMemberships = memberships.filter((m) => m.status === 'active').length;
  const expiringMemberships = memberships.filter((m) => m.status === 'expiring').length;
  const expiredMemberships = memberships.filter((m) => m.status === 'expired').length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;
  const trialBookingsCount = enquiries.filter((e) => e.status === 'Trial Booked').length;

  const totalVerifiedRevenue = payments
    .filter((p) => p.paymentStatus === 'Verified')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Quick check-in handler
  const handleQuickCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInQuery.trim()) return;

    const term = checkInQuery.trim().toLowerCase();
    const found = members.find(
      (m) =>
        m.memberId.toLowerCase() === term ||
        m.name.toLowerCase().includes(term) ||
        m.phone.includes(term)
    );

    if (!found) {
      setCheckInMsg({ text: `No member matched "${checkInQuery}". Please check member directory.`, success: false });
      return;
    }

    try {
      const res = await checkInMember(found.memberId, found.name);
      setCheckInMsg({ text: res.message, success: res.success });
      if (res.success && res.record) {
        setTodayAttendance([res.record, ...todayAttendance]);
        setCheckInQuery('');
      }
    } catch (err: unknown) {
      setCheckInMsg({ text: err instanceof Error ? err.message : 'Check in error', success: false });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
            Live Gym Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time status of members, check-ins, trials, and verified payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D9EAE7] hover:bg-[#F0FDFA] text-xs font-semibold text-[#0F766E] shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigateTab('members')}
            className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-sm transition"
          >
            + Enroll Member
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Members */}
        <div
          onClick={() => onNavigateTab('members')}
          className="p-5 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B]">Total Registered</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#115E59] mt-2">
            {totalRegisteredMembers}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-[#64748B]">
            <span className="text-emerald-700 font-semibold">{activeMemberships} active</span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">{expiringMemberships} expiring</span>
          </div>
        </div>

        {/* Card 2: Today's Attendance */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-5 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B]">Today's Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#115E59] mt-2">
            {todayAttendance.length}
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Logged today at gym</span>
          </div>
        </div>

        {/* Card 3: Enquiries & Trials */}
        <div
          onClick={() => onNavigateTab('enquiries')}
          className="p-5 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B]">Trial Bookings & Leads</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#115E59] mt-2">
            {enquiries.length}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px]">
            <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
              {newEnquiriesCount} New
            </span>
            <span className="text-[#64748B]">{trialBookingsCount} booked</span>
          </div>
        </div>

        {/* Card 4: Verified Payments */}
        <div
          onClick={() => onNavigateTab('payments')}
          className="p-5 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B]">Verified Collections</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-2">
            ₹{totalVerifiedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#64748B] mt-2">
            {payments.filter((p) => p.paymentStatus === 'Verified').length} recorded receipts
          </div>
        </div>
      </div>

      {/* Supabase Joining Applications Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#0D9488] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200 shrink-0">
            <Database className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white">
                Supabase Online Applications (`gym_joining_requests`)
              </span>
              <span className="bg-emerald-400 text-teal-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>
            <p className="text-xs text-teal-100 mt-0.5">
              Review and manage incoming membership applications from the public Gym Joining Form.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('joining-requests')}
          className="px-4 py-2.5 rounded-xl bg-white text-[#0F766E] hover:bg-[#CCFBF1] font-bold text-xs shrink-0 shadow-sm transition-all flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Manage Joining Requests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Check-in Box */}
      <div className="p-6 rounded-3xl bg-[#0F766E] text-white shadow-md">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-300" />
            <h3 className="font-extrabold text-lg">Fast Front Desk Check-In</h3>
          </div>
          <p className="text-xs text-teal-100 mt-1">
            Type member ID (e.g. SMP-101), member name, or phone number to log today's attendance with duplicate prevention.
          </p>

          <form onSubmit={handleQuickCheckIn} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={checkInQuery}
              onChange={(e) => setCheckInQuery(e.target.value)}
              placeholder="e.g. SMP-101 or Ravi Kumar"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFBF1]"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-teal-950 font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Check-In Now
            </button>
          </form>

          {checkInMsg && (
            <div
              className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                checkInMsg.success ? 'bg-emerald-800/80 text-emerald-100' : 'bg-red-900/80 text-red-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{checkInMsg.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Status Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Membership Health & Expiry Alerts */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#115E59]">
                Membership Status Breakdown
              </h3>
              <button
                onClick={() => onNavigateTab('memberships')}
                className="text-xs font-bold text-[#0F766E] hover:underline"
              >
                Manage Plans →
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#1F2937]">Active Memberships</span>
                  <span className="text-emerald-700">{activeMemberships}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F766E]"
                    style={{
                      width: `${
                        totalRegisteredMembers > 0
                          ? (activeMemberships / totalRegisteredMembers) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-800">Expiring Within 7 Days</span>
                  <span className="text-amber-700">{expiringMemberships}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${
                        totalRegisteredMembers > 0
                          ? (expiringMemberships / totalRegisteredMembers) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-red-800">Expired Memberships</span>
                  <span className="text-red-700">{expiredMemberships}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${
                        totalRegisteredMembers > 0
                          ? (expiredMemberships / totalRegisteredMembers) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {expiringMemberships > 0 && (
              <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{expiringMemberships} members are due for renewal soon</span>
                </div>
                <button
                  onClick={() => onNavigateTab('memberships')}
                  className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px]"
                >
                  View Expiries
                </button>
              </div>
            )}
          </div>

          {/* Today's check-ins mini table */}
          <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#115E59]">
                Today's Check-Ins ({todayAttendance.length})
              </h3>
              <button
                onClick={() => onNavigateTab('attendance')}
                className="text-xs font-bold text-[#0F766E] hover:underline"
              >
                Full Log →
              </button>
            </div>

            {todayAttendance.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4 text-center">
                No check-ins logged yet today. Use the Quick Check-In box above to record member entry.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {todayAttendance.slice(0, 5).map((att) => (
                  <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#115E59] block">{att.memberName}</span>
                      <span className="text-[11px] text-[#64748B] font-mono">{att.memberId}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {att.checkInTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Enquiries & Trial Leads */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#115E59]">
                Recent Inquiries & Trials
              </h3>
              <button
                onClick={() => onNavigateTab('enquiries')}
                className="text-xs font-bold text-[#0F766E] hover:underline"
              >
                All Enquiries →
              </button>
            </div>

            {enquiries.length === 0 ? (
              <p className="text-xs text-[#64748B] py-6 text-center">
                No public trial submissions or contact inquiries recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {enquiries.slice(0, 5).map((enq) => (
                  <div key={enq.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#115E59]">{enq.fullName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            enq.status === 'New'
                              ? 'bg-amber-100 text-amber-800'
                              : enq.status === 'Trial Booked'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        {enq.phone} • {enq.fitnessGoal || 'General Fitness'}
                      </p>
                      {enq.preferredTime && (
                        <p className="text-[11px] text-teal-700">
                          Prefers: {enq.preferredTime}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={getWhatsAppUrl(
                          'trial',
                          `Hello ${enq.fullName}, reaching out from Sri Maruthi Power House Gym regarding your trial workout request.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-[#D9EAE7] text-[#0F766E] hover:bg-[#F0FDFA]"
                        title="Follow up on WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links & help */}
          <div className="p-6 rounded-3xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-3">
            <h4 className="font-bold text-sm text-[#115E59]">Daily Front Desk Checklist</h4>
            <ul className="text-xs text-[#64748B] space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Verify new trial session requests and reply via WhatsApp.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Log member check-ins as members enter the 2nd floor facility.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Issue digital payment receipts for renewals and new enrollments.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
