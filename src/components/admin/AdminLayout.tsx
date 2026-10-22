import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCheck,
  MessageSquare,
  Receipt,
  Settings,
  FileSpreadsheet,
  LogOut,
  Dumbbell,
  ExternalLink,
  Menu,
  X,
  Bell,
  UserPlus
} from 'lucide-react';
import { ADMIN_BOOTSTRAP_EMAIL } from '../../lib/firebase';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onNavigateToPublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onNavigateToPublic,
  children,
}) => {
  const { currentUser, isSimulatedAdmin, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'joining-requests', label: 'Joining Requests (Supabase)', icon: UserPlus },
    { id: 'members', label: 'Member Directory', icon: Users },
    { id: 'memberships', label: 'Memberships & Plans', icon: CreditCard },
    { id: 'attendance', label: 'Daily Attendance', icon: UserCheck },
    { id: 'enquiries', label: 'Enquiries & Trials', icon: MessageSquare },
    { id: 'payments', label: 'Payment Records', icon: Receipt },
    { id: 'content', label: 'Website & Settings', icon: Settings },
    { id: 'reports', label: 'Reports & CSV Export', icon: FileSpreadsheet },
  ];

  const handleMenuClick = (id: string) => {
    onTabChange(id);
    setMobileSidebarOpen(false);
  };

  const userEmail = currentUser?.email || (isSimulatedAdmin ? ADMIN_BOOTSTRAP_EMAIL : 'staff@smpgym.com');

  return (
    <div className="min-h-screen bg-[#F0FDFA] flex flex-col lg:flex-row text-[#1F2937]">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#115E59] text-white shrink-0 border-r border-[#0F766E] min-h-screen sticky top-0 h-screen">
        {/* Brand header */}
        <div className="p-6 border-b border-teal-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
              <Dumbbell className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block tracking-tight">
                SRI MARUTHI 24/7
              </span>
              <span className="text-[10px] text-teal-300 uppercase tracking-widest font-bold">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0D9488] text-white shadow-sm'
                    : 'text-teal-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom user profile & actions */}
        <div className="p-4 border-t border-teal-700/60 space-y-2">
          <button
            onClick={onNavigateToPublic}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-teal-800/60 hover:bg-teal-800 text-teal-200 text-xs font-semibold transition"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="p-2.5 rounded-xl bg-black/20 flex items-center justify-between">
            <div className="overflow-hidden mr-2">
              <span className="text-[11px] font-bold text-white block truncate">
                {userEmail}
              </span>
              <span className="text-[10px] text-emerald-300 font-medium">
                {isSimulatedAdmin ? 'Staff Session' : 'Verified Admin'}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-white/10 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden bg-[#115E59] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-white/10"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-sm text-white">SMP GYM ADMIN</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToPublic}
            className="px-2 py-1 rounded bg-teal-800 text-[11px] font-semibold text-teal-100"
          >
            Website
          </button>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded bg-teal-800 text-teal-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex">
          <div className="w-64 bg-[#115E59] text-white h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-teal-700/60 mb-4">
                <span className="font-bold text-sm text-teal-100">Navigation Menu</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-teal-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                        isActive ? 'bg-[#0D9488] text-white' : 'text-teal-100 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-teal-300" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-teal-700/60">
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-900/40 text-red-200 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
