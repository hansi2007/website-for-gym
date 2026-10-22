import React, { useState } from 'react';
import { submitPublicEnquiry } from '../../services/gymService';
import { getWhatsAppUrl, GYM_PHONE_DISPLAY } from '../../utils/whatsapp';
import { CheckCircle2, AlertCircle, Calendar, Clock, User, Phone, Mail, Target, MessageSquare, Send } from 'lucide-react';

interface TrialBookingProps {
  onNavigate: (tab: string) => void;
}

export const TrialBooking: React.FC<TrialBookingProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (6:00 AM - 9:00 AM)');
  const [fitnessGoal, setFitnessGoal] = useState('General Fitness & Weight Loss');
  const [message, setMessage] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    const trimmedName = fullName.trim();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      errs.fullName = 'Please enter your full name (minimum 2 characters).';
    } else if (trimmedName.length > 80) {
      errs.fullName = 'Name cannot exceed 80 characters.';
    }

    if (!cleanPhone) {
      errs.phone = 'Phone number is required for booking confirmation.';
    } else if (!/^[0-9+]{8,15}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid phone number (8-15 digits, e.g. 9945457747 or +919945457747).';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format or leave blank.';
    }

    if (!privacyAgreed) {
      errs.privacyAgreed = 'Please accept consent for gym front desk to contact you.';
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

    // Duplicate submission prevention check
    const lastSubmissionKey = `last_smp_trial_${phone.replace(/\s+/g, '')}`;
    const lastSubTime = localStorage.getItem(lastSubmissionKey);
    if (lastSubTime && Date.now() - parseInt(lastSubTime, 10) < 60000) {
      setSubmissionError('You have just submitted an enquiry for this number. Please wait a minute before submitting again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const docId = await submitPublicEnquiry({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        preferredDate: preferredDate || undefined,
        preferredTime,
        fitnessGoal,
        message: message.trim() || undefined,
        source: 'Website Trial Form',
      });

      localStorage.setItem(lastSubmissionKey, Date.now().toString());
      setSubmissionId(docId);
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to submit enquiry. Please try again or WhatsApp us directly.';
      setSubmissionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#0D9488] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider">
            Free Gym Experience
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2">
            Book Your Free Trial Workout
          </h1>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl mt-3">
            Come test our machines, meet our coaches, and feel the high-energy training atmosphere before deciding on a membership.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {isSuccess ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F0FDFA] border-2 border-[#0F766E] text-center space-y-6 shadow-xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0F766E] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-[#0F766E]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">
                Booking Request Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
                Thank You, {fullName}!
              </h2>
              <p className="text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
                Your trial workout request has been securely recorded (Reference: <span className="font-mono font-semibold text-slate-800">{submissionId.slice(0, 8)}</span>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#D9EAE7] max-w-md mx-auto text-xs text-[#1F2937] text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Contact Phone:</span>
                <span className="font-bold">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Preferred Slot:</span>
                <span className="font-bold">{preferredTime}</span>
              </div>
              {preferredDate && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Preferred Date:</span>
                  <span className="font-bold">{preferredDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#64748B]">Focus:</span>
                <span className="font-bold">{fitnessGoal}</span>
              </div>
            </div>

            {/* Crucial requirement: explain appointment is not confirmed until gym responds */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 max-w-xl mx-auto flex items-start gap-2.5 text-left">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Important Notice:</strong>
                A requested trial appointment is <span className="underline">not confirmed</span> until our front desk verifies trainer availability and calls or WhatsApps you directly.
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <a
                href={getWhatsAppUrl(
                  'trial',
                  `Hello Sri Maruthi Gym, I just submitted a trial booking on your website for ${fullName} (${phone}). Please confirm my slot.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-sm inline-flex items-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Fast-Track Confirmation on WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setFullName('');
                  setPhone('');
                  setEmail('');
                  setMessage('');
                }}
                className="px-6 py-3 rounded-xl border border-[#D9EAE7] hover:bg-white text-[#0F766E] font-bold text-sm"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D9EAE7] shadow-sm space-y-5"
              >
                <div className="border-b border-[#D9EAE7] pb-4">
                  <h3 className="text-xl font-extrabold text-[#115E59]">
                    Trial Session Enquiry Form
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Please provide your contact details. Our team will contact you to confirm available slots.
                  </p>
                </div>

                {submissionError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{submissionError}</span>
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

                {/* Phone number */}
                <div>
                  <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                    Phone Number (WhatsApp Preferred) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9845012345 or +91 98450 12345"
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

                {/* Email (optional) */}
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

                {/* Date & Time preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                      Preferred Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={preferredDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                      Preferred Time Slot
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9EAE7] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                      >
                        <option>Morning (6:00 AM - 9:00 AM)</option>
                        <option>Late Morning (9:00 AM - 12:00 PM)</option>
                        <option>Afternoon (12:00 PM - 4:00 PM)</option>
                        <option>Evening (4:00 PM - 7:00 PM)</option>
                        <option>Night (7:00 PM - 10:00 PM)</option>
                        <option>Late Night (24/7 Hours)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Fitness Goal */}
                <div>
                  <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                    Your Primary Fitness Goal
                  </label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9EAE7] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                    >
                      <option>General Fitness & Weight Loss</option>
                      <option>Muscle Building & Hypertrophy</option>
                      <option>Strength & Powerlifting</option>
                      <option>Stamina & Cardiovascular Endurance</option>
                      <option>Rehabilitation & Posture Correction</option>
                      <option>1-on-1 Personal Training</option>
                    </select>
                  </div>
                </div>

                {/* Message (optional) */}
                <div>
                  <label className="block text-xs font-bold text-[#115E59] uppercase tracking-wider mb-1.5">
                    Notes or Questions <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about previous gym experience or any specific machine you want to try..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                  />
                </div>

                {/* Privacy Consent */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#0F766E] rounded border-[#D9EAE7] focus:ring-[#0F766E]"
                    />
                    <span className="text-xs text-[#64748B] leading-relaxed">
                      I authorize Sri Maruthi Power House Gym front desk to contact me via Phone / WhatsApp regarding trial scheduling and gym updates.
                    </span>
                  </label>
                  {errors.privacyAgreed && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.privacyAgreed}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Free Trial Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-4">
                <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">
                  What Happens Next?
                </span>
                <h4 className="text-lg font-bold text-[#115E59]">Simple 3-Step Process</h4>

                <div className="space-y-4 text-xs text-[#1F2937]">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="block text-[#115E59]">Submit Request:</strong>
                      Your information is logged into our secure front-desk database.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="block text-[#115E59]">Quick Confirmation:</strong>
                      Staff calls or WhatsApps you to confirm your slot time and answer questions.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="block text-[#115E59]">Guided Workout:</strong>
                      Arrive in training wear. A coach will show you the equipment and guide your session.
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs text-center space-y-3">
                <MessageSquare className="w-8 h-8 text-[#0D9488] mx-auto" />
                <h4 className="font-bold text-sm text-[#115E59]">Prefer To Talk Directly?</h4>
                <p className="text-xs text-[#64748B]">
                  Skip the form and message our front desk directly for instant response.
                </p>
                <a
                  href={getWhatsAppUrl('trial')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 rounded-xl border border-[#0D9488] text-[#0F766E] hover:bg-[#F0FDFA] font-bold text-xs transition-colors"
                >
                  Chat with Us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
