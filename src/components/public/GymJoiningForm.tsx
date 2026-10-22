import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Mail,
  Target,
  Dumbbell,
  Clock,
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { submitGymJoiningRequest, SUPABASE_PROJECT_ID } from '../../lib/supabase';
import { getPublishedPlans } from '../../services/gymService';
import { MembershipPlan, GymJoiningRequest } from '../../types';
import { getWhatsAppUrl, GYM_PHONE_DISPLAY } from '../../utils/whatsapp';

interface GymJoiningFormProps {
  onNavigate: (tab: string) => void;
  preselectedPlan?: string;
}

export const GymJoiningForm: React.FC<GymJoiningFormProps> = ({
  onNavigate,
  preselectedPlan,
}) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [selectedPlan, setSelectedPlan] = useState<string>(preselectedPlan || '1 Month General Membership (₹1,500)');
  const [fitnessGoal, setFitnessGoal] = useState<string>('Muscle Building & Hypertrophy');
  const [preferredStartDate, setPreferredStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [preferredEndDate, setPreferredEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [message, setMessage] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Auto-calculate end date from plan duration
  const calculateEndDate = (startDateStr: string, planStr: string): string => {
    try {
      const d = new Date(startDateStr);
      if (isNaN(d.getTime())) return '';
      let months = 1;
      const lower = planStr.toLowerCase();
      if (lower.includes('1 year') || lower.includes('12 month') || lower.includes('annual')) {
        months = 12;
      } else if (lower.includes('6 month') || lower.includes('half-year')) {
        months = 6;
      } else if (lower.includes('3 month') || lower.includes('quarter')) {
        months = 3;
      }
      d.setMonth(d.getMonth() + months);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const handleStartDateChange = (dateVal: string) => {
    setPreferredStartDate(dateVal);
    if (dateVal) {
      setPreferredEndDate(calculateEndDate(dateVal, selectedPlan));
    }
  };

  const handlePlanChange = (planVal: string) => {
    setSelectedPlan(planVal);
    if (preferredStartDate) {
      setPreferredEndDate(calculateEndDate(preferredStartDate, planVal));
    }
  };

  // States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedRecord, setConfirmedRecord] = useState<GymJoiningRequest | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Load published plans to populate dropdown dynamically
  useEffect(() => {
    async function loadPlans() {
      try {
        setLoadingPlans(true);
        const fetched = await getPublishedPlans();
        if (fetched && fetched.length > 0) {
          setPlans(fetched);
          if (!preselectedPlan) {
            setSelectedPlan(`${fetched[0].name} (₹${fetched[0].price.toLocaleString('en-IN')})`);
          }
        }
      } catch (err) {
        console.warn('Could not load plans from database, using standard list:', err);
      } finally {
        setLoadingPlans(false);
      }
    }
    loadPlans();
  }, [preselectedPlan]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const trimmedName = fullName.trim();
    const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      errs.fullName = 'Please enter your full legal or preferred name (at least 2 characters).';
    } else if (trimmedName.length > 80) {
      errs.fullName = 'Full name must be under 80 characters.';
    }

    if (!cleanPhone) {
      errs.phone = 'Mobile phone number is required for your membership profile.';
    } else if (!/^[0-9+]{8,15}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid 10-digit mobile number (e.g. 99454 57747 or +919945457747).';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address or leave blank.';
    }

    if (age) {
      const numAge = parseInt(age, 10);
      if (isNaN(numAge) || numAge < 12 || numAge > 95) {
        errs.age = 'Please enter a valid age between 12 and 95.';
      }
    }

    if (!selectedPlan) {
      errs.selectedPlan = 'Please select a membership package.';
    }

    if (!preferredStartDate) {
      errs.preferredStartDate = 'Please select your desired workout start date.';
    }

    if (!termsAgreed) {
      errs.termsAgreed = 'Please confirm your consent to apply and be contacted by gym staff.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const savedRecord = await submitGymJoiningRequest({
        full_name: fullName,
        phone,
        email: email || null,
        age: age ? parseInt(age, 10) : null,
        gender: gender || null,
        selected_membership_plan: selectedPlan,
        fitness_goal: fitnessGoal || null,
        preferred_start_date: preferredStartDate,
        preferred_end_date: preferredEndDate || null,
        message: message || null,
      });

      setConfirmedRecord(savedRecord);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database submission failed.';
      setSubmissionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefId = () => {
    if (confirmedRecord?.id) {
      navigator.clipboard.writeText(confirmedRecord.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#0D9488] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-100 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online Membership Registration • Supabase Powered</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-1">
            Gym Joining Application
          </h1>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl mt-3">
            Take the first step towards your fitness goals. Complete this official application form to join Sri Maruthi Power House Gym 24/7 in Jigani.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {confirmedRecord ? (
          /* Real Supabase Confirmation View */
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F0FDFA] border-2 border-[#0F766E] space-y-6 shadow-xl animate-in zoom-in-95">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0F766E] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-[#0F766E]" />
              </div>

              <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">
                Confirmed In Supabase Database
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
                Welcome Aboard, {confirmedRecord.full_name}!
              </h2>
              <p className="text-sm text-[#64748B] max-w-xl mx-auto">
                Your gym membership application has been saved directly to our verified Supabase table (<code className="bg-teal-100/70 text-[#0F766E] px-1.5 py-0.5 rounded font-mono text-xs">gym_joining_requests</code>).
              </p>
            </div>

            {/* Application Receipt Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#D9EAE7] max-w-lg mx-auto shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
                <span className="text-[#64748B] font-medium">Application ID:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-[#115E59]">
                  <span>{confirmedRecord.id}</span>
                  <button
                    onClick={copyRefId}
                    className="p-1 rounded hover:bg-slate-100 text-[#0F766E]"
                    title="Copy Application ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#64748B] block">Applicant Name</span>
                  <strong className="text-sm text-[#1F2937]">{confirmedRecord.full_name}</strong>
                </div>
                <div>
                  <span className="text-[#64748B] block">Phone Number</span>
                  <strong className="text-sm text-[#1F2937]">{confirmedRecord.phone}</strong>
                </div>
                <div>
                  <span className="text-[#64748B] block">Selected Package</span>
                  <strong className="text-xs text-[#0F766E] font-bold block truncate">
                    {confirmedRecord.selected_membership_plan}
                  </strong>
                </div>
                <div>
                  <span className="text-[#64748B] block">Target Start Date</span>
                  <strong className="text-xs text-[#1F2937] font-bold">
                    {confirmedRecord.preferred_start_date}
                  </strong>
                </div>
                <div>
                  <span className="text-[#64748B] block">Target End Date</span>
                  <strong className="text-xs text-[#0F766E] font-bold">
                    {confirmedRecord.preferred_end_date || 'Ongoing'}
                  </strong>
                </div>
                {confirmedRecord.fitness_goal && (
                  <div className="col-span-2">
                    <span className="text-[#64748B] block">Primary Goal</span>
                    <span className="text-xs text-[#1F2937] font-medium">
                      {confirmedRecord.fitness_goal}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[#64748B] block">Status</span>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                    {confirmedRecord.status || 'pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Database Timestamp</span>
                  <span className="text-[11px] text-[#64748B]">
                    {new Date(confirmedRecord.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 max-w-lg mx-auto space-y-2">
              <strong className="block font-bold text-[#115E59]">What Happens Next:</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>Our gym manager reviews your membership request in the admin dashboard.</li>
                <li>Staff contacts you via WhatsApp or Call at <strong>{confirmedRecord.phone}</strong> to confirm your slot & batch timings.</li>
                <li>Visit the gym on <strong>{confirmedRecord.preferred_start_date}</strong> at MNT Complex, 2nd Floor, Jigani to complete your onboarding & receive your workout card.</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <a
                href={getWhatsAppUrl(
                  'membership',
                  `Hello Sri Maruthi Power House Gym, I just submitted my Gym Joining Application (ID: ${confirmedRecord.id.slice(0, 8)}) for ${confirmedRecord.full_name} (${confirmedRecord.selected_membership_plan}). Looking forward to starting on ${confirmedRecord.preferred_start_date}!`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-sm inline-flex items-center gap-2 shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Fast-Track with Gym on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setConfirmedRecord(null);
                  setFullName('');
                  setPhone('');
                  setEmail('');
                  setAge('');
                  setMessage('');
                  setTermsAgreed(false);
                }}
                className="px-6 py-3.5 rounded-xl border border-[#D9EAE7] hover:bg-white text-[#0F766E] font-bold text-sm"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          /* Gym Joining Form Inputs */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D9EAE7] shadow-sm space-y-5"
              >
                <div className="border-b border-[#D9EAE7] pb-4">
                  <div className="flex items-center gap-2 text-[#0F766E] text-xs font-bold uppercase tracking-wider">
                    <Dumbbell className="w-4 h-4" />
                    <span>Official Membership Application</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#115E59] mt-1">
                    Join Sri Maruthi Power House Gym 24/7
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Fill out this application. All submissions are saved to our secure Supabase database and assigned to front desk coaches.
                  </p>
                </div>

                {submissionError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="font-semibold">{submissionError}</div>
                    </div>
                    {submissionError.includes('gym_joining_requests') && (
                      <div className="pt-2 border-t border-red-200/60 text-[11px] text-red-700">
                        <strong>Admin Notice:</strong> The table <code>gym_joining_requests</code> needs to be created in your Supabase project (<code>{SUPABASE_PROJECT_ID}</code>). Log in to the Admin Dashboard (top right) to copy and run the one-click SQL migration.
                      </div>
                    )}
                  </div>
                )}

                {/* Full name */}
                <div>
                  <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.fullName
                          ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                          : 'border-[#D9EAE7] focus:ring-[#CCFBF1] focus:border-[#0F766E]'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                      Phone Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 99454 57747"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                          errors.phone
                            ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                            : 'border-[#D9EAE7] focus:ring-[#CCFBF1] focus:border-[#0F766E]'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ramesh@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                          errors.email
                            ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                            : 'border-[#D9EAE7] focus:ring-[#CCFBF1] focus:border-[#0F766E]'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                      Age <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      value={age}
                      min={12}
                      max={95}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 26"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        errors.age
                          ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                          : 'border-[#D9EAE7] focus:ring-[#CCFBF1] focus:border-[#0F766E]'
                      }`}
                    />
                    {errors.age && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.age}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                      Gender <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D9EAE7] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary / Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Selected Membership Plan */}
                <div>
                  <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                    Selected Membership Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white font-medium focus:outline-none focus:ring-2 ${
                      errors.selectedPlan
                        ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                        : 'border-[#D9EAE7] focus:ring-[#CCFBF1] focus:border-[#0F766E]'
                    }`}
                  >
                    {plans.length > 0 ? (
                      plans.map((p) => (
                        <option
                          key={p.id}
                          value={`${p.name} (₹${p.price.toLocaleString('en-IN')})`}
                        >
                          {p.name} — ₹{p.price.toLocaleString('en-IN')} ({p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1 Month General Membership (₹1,500)">
                          1 Month General Membership — ₹1,500
                        </option>
                        <option value="3 Months Transformation Plan (₹3,800)">
                          3 Months Transformation Plan — ₹3,800
                        </option>
                        <option value="6 Months Power Builder (₹6,500)">
                          6 Months Power Builder — ₹6,500
                        </option>
                        <option value="1 Year Elite 24/7 Access (₹11,000)">
                          1 Year Elite 24/7 Access — ₹11,000
                        </option>
                        <option value="Personal Training Split (Monthly)">
                          Personal Training Split (Dedicated Coach)
                        </option>
                      </>
                    )}
                  </select>
                  {errors.selectedPlan && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.selectedPlan}</p>
                  )}
                </div>

                {/* Dates: Start Date & End Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                      Preferred Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={preferredStartDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                          errors.preferredStartDate
                            ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                            : 'border-[#D9EAE7] focus:ring-[#CCFBF1] focus:border-[#0F766E]'
                        }`}
                      />
                    </div>
                    {errors.preferredStartDate && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        {errors.preferredStartDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Preferred End Date</span>
                      <span className="text-[10px] text-emerald-700 font-normal bg-emerald-50 px-1.5 py-0.2 rounded">Auto-calculated</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={preferredEndDate}
                        min={preferredStartDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setPreferredEndDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9EAE7] focus:ring-[#CCFBF1] focus:border-[#0F766E] text-sm focus:outline-none focus:ring-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Fitness Goal */}
                <div>
                  <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                    Primary Fitness Goal <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9EAE7] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                    >
                      <option>Muscle Building & Hypertrophy</option>
                      <option>Weight Loss & Body Fat Reduction</option>
                        <option>Strength & Powerlifting (Squat/Bench/Deadlift)</option>
                        <option>Cardiovascular Stamina & Endurance</option>
                        <option>General Fitness & Overall Well-being</option>
                        <option>Rehab / Posture Correction</option>
                        <option>1-on-1 Personal Training Coaching</option>
                      </select>
                    </div>
                  </div>

                {/* Message / Additional Information */}
                <div>
                  <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                    Additional Notes / Previous Training Experience <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about previous gym experience, medical conditions, or timing preference..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                  />
                </div>

                {/* Terms & Consent */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#0F766E] rounded border-[#D9EAE7] focus:ring-[#0F766E]"
                    />
                    <span className="text-xs text-[#64748B] leading-relaxed">
                      I confirm my application to join Sri Maruthi Power House Gym 24/7 (Jigani) and authorize the management to contact me to finalize membership enrollment.
                    </span>
                  </label>
                  {errors.termsAgreed && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.termsAgreed}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Validating & Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Membership Application</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Information */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-4">
                <div className="flex items-center gap-2 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                  <span>Why Join Maruthi 24/7?</span>
                </div>
                <h4 className="text-lg font-bold text-[#115E59]">Top Benefits</h4>

                <div className="space-y-3 text-xs text-[#1F2937]">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                    <span><strong>24/7 Unrestricted Access:</strong> Train whenever it suits your work shifts or daily routine.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                    <span><strong>Modern Equipment:</strong> Heavy power racks, plate-loaded machines, dumbbell racks, and cardio machines.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                    <span><strong>Knowledgeable Coaches:</strong> Form correction and progression plans included in every membership.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                    <span><strong>Clean & Inclusive:</strong> Spacious floor, hygienic washrooms, and LGBTQ+ friendly atmosphere.</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs text-center space-y-3">
                <MessageSquare className="w-8 h-8 text-[#0D9488] mx-auto" />
                <h4 className="font-bold text-sm text-[#115E59]">Have Quick Questions?</h4>
                <p className="text-xs text-[#64748B]">
                  Chat directly with our head coach or front desk manager right now on WhatsApp.
                </p>
                <a
                  href={getWhatsAppUrl('membership')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 rounded-xl border border-[#0D9488] text-[#0F766E] hover:bg-[#F0FDFA] font-bold text-xs transition-colors"
                >
                  Chat with Front Desk (+91 99454 57747)
                </a>
              </div>

              {/* Location Card */}
              <div className="p-6 rounded-3xl bg-[#F0FDFA] border border-[#D9EAE7] text-xs text-[#1F2937] space-y-2">
                <strong className="block text-[#115E59] font-bold text-sm">Gym Location</strong>
                <p className="text-[#64748B]">
                  2nd Floor, MNT Complex, No. 523, Jigani - Anekal Road, opposite SLV Bar, Vinayaka Nagar, Jigani, Bengaluru 560105.
                </p>
                <p className="text-[#0D9488] font-semibold">
                  Open 24 Hours • 7 Days a Week
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
