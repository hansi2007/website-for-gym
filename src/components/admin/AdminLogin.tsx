import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell, ShieldCheck, Lock, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ADMIN_BOOTSTRAP_EMAIL } from '../../lib/firebase';

interface AdminLoginProps {
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToHome }) => {
  const { loginWithGoogle, simulateStaffLogin, authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffPreviewLogin = () => {
    simulateStaffLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#115E59] via-[#0F766E] to-[#0D9488] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-[#D9EAE7] p-8 space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>

          <div className="w-16 h-16 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-9 h-9 text-emerald-300" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#115E59]">
            Staff & Admin Portal
          </h2>
          <p className="text-xs text-[#64748B]">
            Sri Maruthi Power House Gym 24/7 Management System
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#D9EAE7] text-xs text-[#1F2937] space-y-1">
          <div className="flex items-center gap-2 font-bold text-[#0F766E]">
            <Lock className="w-3.5 h-3.5" />
            <span>Authorized Access Only</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-tight">
            Designated administrator accounts can manage member records, attendance logs, subscriptions, and financial data.
          </p>
          <p className="text-[11px] text-teal-800 font-mono mt-1">
            Bootstrapped Owner: <span className="font-semibold">{ADMIN_BOOTSTRAP_EMAIL}</span>
          </p>
        </div>

        {(errorMsg || authError) && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMsg || authError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#1F2937] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-3 active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Staff Quick Access
            </span>
          </div>

          {/* Quick Staff Sign-In button */}
          <button
            onClick={handleStaffPreviewLogin}
            className="w-full py-3.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-extrabold text-xs shadow-md shadow-teal-900/10 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Launch Staff Admin Session</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[10px] text-[#64748B]">
          Protected by Cloud Firestore Security Rules • Role-based Access Control
        </div>
      </div>
    </div>
  );
};
