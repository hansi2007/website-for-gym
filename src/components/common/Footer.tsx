import React from 'react';
import { Dumbbell, MapPin, Phone, MessageSquare, Clock, Star, ExternalLink, ShieldCheck } from 'lucide-react';
import { GYM_PHONE_TEL, GYM_PHONE_DISPLAY, GOOGLE_MAPS_LINK, getWhatsAppUrl } from '../../utils/whatsapp';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#115E59] text-white border-t border-[#0F766E]">
      {/* Top Banner */}
      <div className="bg-[#0F766E] py-8 px-4 sm:px-6 lg:px-8 border-b border-teal-700/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-teal-200 text-xs font-bold uppercase tracking-wider">
              YOUR STRENGTH. YOUR JOURNEY. YOUR FUTURE.
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Ready to take your fitness to the next level?
            </h3>
            <p className="text-teal-100 text-sm mt-1 max-w-xl">
              Visit our spacious facility in Jigani, Bengaluru. Connect with certified coaches and modern equipment.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                onNavigate('join');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-3 rounded-xl bg-white text-[#0F766E] font-bold text-sm hover:bg-[#CCFBF1] transition-all shadow-md active:scale-95"
            >
              Start Your Journey
            </button>
            <a
              href={getWhatsAppUrl('general')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0b7e74] text-white font-bold text-sm inline-flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Business info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-teal-300">
                <Dumbbell className="w-6 h-6 transform -rotate-45" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white leading-tight block">
                  SRI MARUTHI
                </span>
                <span className="text-xs text-teal-300 font-semibold tracking-wider uppercase">
                  Power House Gym 24/7
                </span>
              </div>
            </div>

            <p className="text-sm text-teal-100/90 leading-relaxed">
              Jigani’s premier strength training and fitness center. Equipped with high-caliber machines, extensive free weights, and dedicated coaching support.
            </p>

            {/* Verified Google Review Snapshot Badge */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-teal-500/30">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-sm text-white">4.9 / 5</span>
              </div>
              <p className="text-xs text-teal-200 mt-1">
                Based on <strong className="text-white">833 Google Reviews</strong>
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-teal-300 border-t border-teal-600/40 pt-1.5">
                <span>Client-supplied snapshot</span>
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-300 hover:underline"
                >
                  View on Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-teal-300 mb-4">
              Explore Gym
            </h4>
            <ul className="space-y-2.5 text-sm text-teal-100">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  About Our Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('facilities');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Machines & Facilities
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('memberships');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Membership Plans
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('trainers');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Coaches & Trainers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('gallery');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Gym Photo Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('join');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-emerald-300 font-semibold hover:underline"
                >
                  Join Gym (Application)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-teal-300 mb-4">
              Contact & Address
            </h4>
            <div className="space-y-3.5 text-sm text-teal-100">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                <address className="not-italic text-xs leading-relaxed text-teal-100/90">
                  2nd Floor, MNT Complex, No. 523, Jigani - Anekal Road, opposite SLV Bar, Vinayaka Nagar, Jigani, Bengaluru, Karnataka 560105, India.
                </address>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-300 shrink-0" />
                <a
                  href={`tel:${GYM_PHONE_TEL}`}
                  className="hover:text-white font-medium"
                >
                  {GYM_PHONE_DISPLAY}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={getWhatsAppUrl('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 hover:text-emerald-200 font-medium"
                >
                  WhatsApp: +91 99454 57747
                </a>
              </div>

              <div className="pt-2">
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-teal-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Timings & Inclusivity */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-teal-300 mb-4">
              Operating Hours
            </h4>
            <div className="p-3.5 rounded-xl bg-white/5 border border-teal-500/30 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>Open 24 Hours / 7 Days</span>
              </div>
              <p className="text-[11px] text-teal-200/90 leading-tight">
                Listed as open 24/7 on business profiles. Please verify trainer assistance hours before your first visit.
              </p>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-teal-800/40 border border-teal-600/30">
              <span className="inline-block text-[11px] font-semibold text-emerald-300">
                🏳️‍🌈 Welcoming & Inclusive
              </span>
              <p className="text-[11px] text-teal-200 mt-0.5">
                Sri Maruthi Power House Gym is an LGBTQ+ friendly fitness space committed to respect and safety for everyone.
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-teal-700/60">
              <button
                onClick={() => {
                  onNavigate('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs text-teal-300 hover:text-white transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin & Staff Portal Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-teal-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-teal-300">
          <p>
            &copy; {new Date().getFullYear()} Sri Maruthi Power House Gym 24/7. All rights reserved. Jigani, Bengaluru.
          </p>
          <p className="text-[11px] text-teal-400">
            Certified Strength & Conditioning Center • Real-time Member Portal
          </p>
        </div>
      </div>
    </footer>
  );
};
