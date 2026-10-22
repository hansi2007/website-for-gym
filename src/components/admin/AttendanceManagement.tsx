import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Users
} from 'lucide-react';
import { Attendance, Member } from '../../types';
import {
  getAttendanceLogs,
  checkInMember,
  checkOutMember,
  getMembers,
  logAuditEvent
} from '../../services/gymService';
import { useAuth } from '../../context/AuthContext';

export const AttendanceManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<Attendance[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);

  // Search member to check in
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; success: boolean } | null>(null);

  const loadData = async (dateKey?: string) => {
    setLoading(true);
    try {
      const [att, m] = await Promise.all([
        getAttendanceLogs(dateKey || selectedDate),
        getMembers(),
      ]);
      setLogs(att);
      setMembers(m);
    } catch (e) {
      console.warn('Error loading attendance logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
  };

  const handleManualCheckIn = async (member: Member) => {
    setFeedbackMsg(null);
    try {
      const res = await checkInMember(member.memberId, member.name);
      setFeedbackMsg({ text: res.message, success: res.success });
      if (res.success && res.record) {
        setLogs([res.record, ...logs]);
        setSearchQuery('');
        await logAuditEvent(
          'CHECK_IN',
          'Attendance',
          member.memberId,
          `Checked in member ${member.name} (${member.memberId})`,
          currentUser?.email || 'admin@smpgym.com'
        );
      }
    } catch (err: unknown) {
      setFeedbackMsg({
        text: err instanceof Error ? err.message : 'Error recording check-in',
        success: false,
      });
    }
  };

  const handleCheckOut = async (attendanceId: string, memberName: string) => {
    try {
      await checkOutMember(attendanceId);
      loadData(selectedDate);
      await logAuditEvent(
        'CHECK_OUT',
        'Attendance',
        attendanceId,
        `Recorded check-out for ${memberName}`,
        currentUser?.email || 'admin@smpgym.com'
      );
    } catch (e) {
      alert('Error updating check out: ' + e);
    }
  };

  // Member search suggestions
  const searchResults = searchQuery.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.phone.includes(searchQuery)
      )
    : [];

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
            Daily Gym Attendance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
            Attendance Records
          </h1>
          <p className="text-xs text-[#64748B]">
            Real-time entry verification with duplicate check-in protection.
          </p>
        </div>

        {/* Date Selector & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#D9EAE7]">
            <Calendar className="w-4 h-4 text-[#0F766E]" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="text-xs font-bold text-[#115E59] bg-transparent focus:outline-none"
            />
          </div>

          <button
            onClick={() => loadData(selectedDate)}
            className="p-2 rounded-xl bg-white border border-[#D9EAE7] text-[#0F766E] hover:bg-[#F0FDFA]"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Check-In Action Section (Only if today) */}
      {isToday && (
        <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-extrabold text-sm text-[#115E59]">
              Front-Desk Member Check-In
            </h3>
          </div>

          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member by name, ID (e.g. SMP-101), or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9EAE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
            />
          </div>

          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedbackMsg.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {feedbackMsg.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Search suggestions */}
          {searchResults.length > 0 && (
            <div className="border border-[#D9EAE7] rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {searchResults.slice(0, 5).map((m) => {
                const alreadyCheckedIn = logs.some((l) => l.memberId === m.memberId);
                return (
                  <div
                    key={m.id}
                    className="p-3 flex items-center justify-between text-xs hover:bg-[#F0FDFA]"
                  >
                    <div>
                      <span className="font-bold text-[#115E59] block">{m.name}</span>
                      <span className="text-[11px] text-[#64748B]">
                        {m.memberId} • {m.phone} • Status: <strong className="uppercase">{m.status}</strong>
                      </span>
                    </div>

                    <div>
                      {alreadyCheckedIn ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                          ✓ Checked In Today
                        </span>
                      ) : (
                        <button
                          onClick={() => handleManualCheckIn(m)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Logs Table */}
      <div className="rounded-2xl bg-white border border-[#D9EAE7] overflow-hidden shadow-xs">
        <div className="p-4 bg-[#F0FDFA] border-b border-[#D9EAE7] flex items-center justify-between">
          <span className="font-extrabold text-xs text-[#115E59] uppercase tracking-wider">
            Attendance Log for {selectedDate} ({logs.length} Check-Ins)
          </span>
          <span className="text-xs text-[#64748B]">
            {isToday ? 'Real-Time Active Floor' : 'Archived Log'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-100 text-[#64748B] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Check-Out Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#64748B]">
                    Loading attendance...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#64748B]">
                    No attendance records for {selectedDate}.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1F2937]">
                      {log.memberName}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#0F766E] font-semibold">
                      {log.memberId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {log.checkInTime}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {log.checkOutTime ? (
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {log.checkOutTime}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 italic">On Floor</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!log.checkOutTime && (
                        <button
                          onClick={() => handleCheckOut(log.id, log.memberName)}
                          className="px-2.5 py-1 rounded-md border border-[#D9EAE7] hover:bg-[#F0FDFA] text-[#0F766E] text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Check Out</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
