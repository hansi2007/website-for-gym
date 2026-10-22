import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Clock, Send, CheckCircle2, AlertCircle, ExternalLink, Navigation } from 'lucide-react';
import { GYM_PHONE_DISPLAY, GYM_PHONE_TEL, GOOGLE_MAPS_LINK, getWhatsAppUrl } from '../../utils/whatsapp';
import { submitPublicEnquiry } from '../../services/gymService';

interface ContactProps {
  onNavigate: (tab: string) => void;
}

export const Contact: React.FC<ContactProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    if (cleanName.length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[0-9+]{8,15}$/.test(cleanPhone)) {
      setError('Please enter a valid phone number (8-15 digits).');
      return;
    }
    if (message.trim().length < 5) {
      setError('Please write a brief message or question.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPublicEnquiry({
        fullName: cleanName,
        phone: cleanPhone,
        message: message.trim(),
        fitnessGoal: 'General Contact Inquiry',
        source: 'Contact Page Form',
      });
      setIsSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please reach out via WhatsApp.');
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
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2">
            Contact & Location Details
          </h1>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl mt-3">
            We are here to answer all your training questions, arrange gym visits, and get you started.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details & Quick Links */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">
                Direct Contact
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#115E59] mt-1">
                Sri Maruthi Power House Gym 24/7
              </h2>
              <p className="text-sm text-[#64748B] mt-2">
                Premier strength, bodybuilding, and fitness hub in Jigani, Bengaluru.
              </p>
            </div>

            {/* Verified Address Card */}
            <div className="p-5 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-2">
              <div className="flex items-center gap-2 text-[#0F766E] font-bold text-sm">
                <MapPin className="w-5 h-5 shrink-0" />
                <span>Verified Address</span>
              </div>
              <p className="text-xs text-[#1F2937] leading-relaxed pl-7">
                2nd Floor, MNT Complex, No. 523, Jigani - Anekal Road, opposite SLV Bar, Vinayaka Nagar, Jigani, Bengaluru, Karnataka 560105, India.
              </p>
              <div className="pl-7 pt-2">
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Direct Phone & WhatsApp Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${GYM_PHONE_TEL}`}
                className="p-4 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-xs flex items-center gap-3 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#64748B] block">Direct Phone</span>
                  <span className="text-xs font-bold text-[#115E59]">{GYM_PHONE_DISPLAY}</span>
                </div>
              </a>

              <a
                href={getWhatsAppUrl('general')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-white border border-[#D9EAE7] hover:border-emerald-600 shadow-xs flex items-center gap-3 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#64748B] block">WhatsApp Chat</span>
                  <span className="text-xs font-bold text-emerald-700">Quick Response</span>
                </div>
              </a>
            </div>

            {/* Operating Hours Card with Confirmation Note */}
            <div className="p-5 rounded-2xl bg-white border border-[#D9EAE7] space-y-2">
              <div className="flex items-center gap-2 text-[#115E59] font-bold text-sm">
                <Clock className="w-5 h-5 text-[#0F766E]" />
                <span>Operating Hours</span>
              </div>
              <p className="text-xs text-[#1F2937] font-semibold pl-7">
                Open 24 hours, seven days a week (per verified business listing)
              </p>
              <p className="text-[11px] text-[#64748B] pl-7">
                <em>Note: Please confirm specific personal trainer availability hours with the front desk.</em>
              </p>
            </div>
          </div>

          {/* Contact Form & Map */}
          <div className="lg:col-span-7 space-y-8">
            {/* Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D9EAE7] shadow-sm">
              <h3 className="text-xl font-extrabold text-[#115E59] mb-1">
                Send a Message
              </h3>
              <p className="text-xs text-[#64748B] mb-5">
                Have a specific question about facilities, timings, or personal training? Fill out the form below.
              </p>

              {isSent ? (
                <div className="p-6 rounded-2xl bg-[#F0FDFA] border border-[#0F766E] text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-[#0F766E] mx-auto" />
                  <h4 className="font-bold text-base text-[#115E59]">Message Received!</h4>
                  <p className="text-xs text-[#64748B]">
                    Thank you, {name}. Our front desk team has logged your inquiry and will reach out shortly.
                  </p>
                  <button
                    onClick={() => {
                      setIsSent(false);
                      setName('');
                      setPhone('');
                      setMessage('');
                    }}
                    className="mt-2 text-xs font-bold text-[#0F766E] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#115E59] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ramesh"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#115E59] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="99454 57747"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#115E59] mb-1">
                      Message / Question *
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about annual packages, coach schedules, or trial workout..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] focus:border-[#0F766E]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Embedded Map / Verified Fallback */}
            <div className="rounded-3xl overflow-hidden border-2 border-[#D9EAE7] bg-[#F0FDFA] p-2 shadow-sm">
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-200">
                <iframe
                  title="Sri Maruthi Power House Gym Location Map"
                  className="w-full h-full border-0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.3168288599426!2d77.6384218!3d12.7885065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6f477611e97d%3A0x7d6f5f90eb778b02!2sSri%20Maruthi%20Power%20House%20Gym!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-3 text-center">
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Driving Directions to MNT Complex on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
