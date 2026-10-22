import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_MESSAGES, WhatsAppTopic } from '../../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const topics: { id: WhatsAppTopic; label: string; desc: string }[] = [
    { id: 'trial', label: 'Book Free Trial Session', desc: 'Request your first guided workout' },
    { id: 'pricing', label: 'Membership Pricing', desc: 'Inquire about monthly & annual plans' },
    { id: 'hours', label: 'Check 24/7 Hours', desc: 'Ask about current gym & trainer timings' },
    { id: 'general', label: 'General Enquiry', desc: 'Chat directly with gym front desk' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-[#D9EAE7] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#0F766E] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Sri Maruthi Gym 24/7</h4>
                <p className="text-[11px] text-teal-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Quick WhatsApp Support
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-teal-200 hover:text-white p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#F0FDFA] space-y-2">
            <p className="text-xs text-[#64748B] mb-2 font-medium">
              Select what you would like to ask us on WhatsApp:
            </p>

            {topics.map((t) => (
              <a
                key={t.id}
                href={getWhatsAppUrl(t.id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="block p-3 rounded-xl bg-white border border-[#D9EAE7] hover:border-[#0D9488] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#115E59] group-hover:text-[#0F766E]">
                    {t.label}
                  </span>
                  <Send className="w-3.5 h-3.5 text-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">{t.desc}</p>
              </a>
            ))}
          </div>

          {/* Footer notice */}
          <div className="px-4 py-2.5 bg-white border-t border-[#D9EAE7] text-[10px] text-[#64748B] text-center">
            Official number: <strong>+91 99454 57747</strong> (Jigani, Bengaluru)
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white flex items-center justify-center shadow-xl shadow-teal-900/20 hover:scale-105 active:scale-95 transition-all group"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
        )}
      </button>
    </div>
  );
};
