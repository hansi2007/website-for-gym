import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  CreditCard,
  UserCheck,
  MessageSquare,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Member, Membership, Attendance, PaymentRecord, Enquiry } from '../../types';
import {
  getMembers,
  getMemberships,
  getAttendanceLogs,
  getPaymentRecords,
  getEnquiries
} from '../../services/gymService';

export const ReportsManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, ms, att, pay, enq] = await Promise.all([
        getMembers(),
        getMemberships(),
        getAttendanceLogs(),
        getPaymentRecords(),
        getEnquiries(),
      ]);
      setMembers(m);
      setMemberships(ms);
      setAttendance(att);
      setPayments(pay);
      setEnquiries(enq);
    } catch (e) {
      console.warn('Error loading reports data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CSV Generator Helper
  const downloadCSV = (filename: string, rows: string[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${(val || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMembersCSV = () => {
    const headers = ['Member ID', 'Name', 'Phone', 'Email', 'Join Date', 'Status', 'Current Plan', 'Expiry Date', 'Blood Group'];
    const rows = members.map((m) => [
      m.memberId,
      m.name,
      m.phone,
      m.email || '',
      m.joinDate,
      m.status,
      m.currentPlanName || '',
      m.currentExpiryDate || '',
      m.bloodGroup || '',
    ]);
    downloadCSV('sri_maruthi_members_register', [headers, ...rows]);
  };

  const exportPaymentsCSV = () => {
    const headers = ['Payment Date', 'Member ID', 'Member Name', 'Plan', 'Amount (INR)', 'Method', 'Status', 'Transaction Reference', 'Verified By'];
    const rows = payments.map((p) => [
      p.paymentDate,
      p.memberId,
      p.memberName,
      p.planName || '',
      p.amount.toString(),
      p.paymentMethod,
      p.paymentStatus,
      p.transactionReference || '',
      p.verifiedBy,
    ]);
    downloadCSV('sri_maruthi_payment_ledger', [headers, ...rows]);
  };

  const exportAttendanceCSV = () => {
    const headers = ['Date', 'Member ID', 'Member Name', 'Check-In Time', 'Check-Out Time'];
    const rows = attendance.map((a) => [
      a.dateKey,
      a.memberId,
      a.memberName,
      a.checkInTime,
      a.checkOutTime || '',
    ]);
    downloadCSV('sri_maruthi_attendance_log', [headers, ...rows]);
  };

  const exportEnquiriesCSV = () => {
    const headers = ['Submission Date', 'Full Name', 'Phone', 'Email', 'Preferred Slot', 'Goal', 'Status', 'Source', 'Notes'];
    const rows = enquiries.map((e) => [
      e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : '',
      e.fullName,
      e.phone,
      e.email || '',
      e.preferredTime || '',
      e.fitnessGoal || '',
      e.status,
      e.source || '',
      e.internalNotes || '',
    ]);
    downloadCSV('sri_maruthi_leads_and_trials', [headers, ...rows]);
  };

  const totalVerifiedSum = payments
    .filter((p) => p.paymentStatus === 'Verified')
    .reduce((s, p) => s + p.amount, 0);

  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const expiredMembersCount = members.filter((m) => m.status === 'expired').length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
            Data Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
            Reports & CSV Exports
          </h1>
          <p className="text-xs text-[#64748B]">
            Generate official gym registries, audit logs, and spreadsheet exports for administration.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#D9EAE7] text-xs font-semibold text-[#0F766E] shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
          <span className="text-[11px] font-bold text-[#64748B] block">Registered Members</span>
          <span className="text-2xl font-extrabold text-[#115E59] mt-1 block">
            {members.length}
          </span>
          <span className="text-[10px] text-emerald-700">{activeMembersCount} currently active</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
          <span className="text-[11px] font-bold text-[#64748B] block">Total Collections</span>
          <span className="text-2xl font-extrabold text-emerald-800 mt-1 block">
            ₹{totalVerifiedSum.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#64748B]">{payments.length} verified transactions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
          <span className="text-[11px] font-bold text-[#64748B] block">Attendance Logs</span>
          <span className="text-2xl font-extrabold text-[#115E59] mt-1 block">
            {attendance.length}
          </span>
          <span className="text-[10px] text-[#64748B]">Recorded check-in events</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
          <span className="text-[11px] font-bold text-[#64748B] block">Website Leads</span>
          <span className="text-2xl font-extrabold text-[#115E59] mt-1 block">
            {enquiries.length}
          </span>
          <span className="text-[10px] text-amber-700">Trial bookings & inquiries</span>
        </div>
      </div>

      {/* CSV Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Members */}
        <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#115E59]">
              Member Directory & Status Registry
            </h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Export complete list of enrolled members with contact numbers, blood groups, start dates, and current validity.
            </p>
          </div>
          <button
            onClick={exportMembersCSV}
            className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Members CSV</span>
          </button>
        </div>

        {/* Card 2: Payments */}
        <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#115E59]">
              Verified Payment Ledger
            </h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Export transaction dates, payment methods (UPI/Cash/Card), member references, and staff verification records.
            </p>
          </div>
          <button
            onClick={exportPaymentsCSV}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Payments CSV</span>
          </button>
        </div>

        {/* Card 3: Attendance */}
        <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#115E59]">
              Daily Attendance History Log
            </h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Export daily member presence, check-in timestamps, and check-out records for audit and compliance.
            </p>
          </div>
          <button
            onClick={exportAttendanceCSV}
            className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Attendance CSV</span>
          </button>
        </div>

        {/* Card 4: Enquiries & Trials */}
        <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#115E59]">
              Visitor Enquiries & Trial Leads
            </h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Export prospect names, phone numbers, target fitness goals, preferred workout slots, and follow-up notes.
            </p>
          </div>
          <button
            onClick={exportEnquiriesCSV}
            className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Leads & Trials CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
