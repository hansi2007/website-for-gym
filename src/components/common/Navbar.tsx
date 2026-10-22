import React, { useState } from 'react';
import { Dumbbell, Phone, Menu, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { GYM_PHONE_TEL, GYM_PHONE_DISPLAY, getWhatsAppUrl } from '../../utils/whatsapp';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, isAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'memberships', label: 'Memberships' },
    { id: 'trainers', label: 'Trainers' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'join', label: 'Join Gym' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D9EAE7] transition-all">
      {/* Top micro-bar with quick contact info */}
      <div className="bg-[#115E59] text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 font-medium bg-[#0D9488]/50 px-2 py-0.5 rounded text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              24/7 Access (Jigani)
            </span>
            <span className="hidden md:inline text-teal-100">
              2nd Floor, MNT Complex, Jigani - Anekal Road
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${GYM_PHONE_TEL}`}
              className="flex items-center gap-1.5 hover:text-teal-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-teal-300" />
              <span>{GYM_PHONE_DISPLAY}</span>
            </a>
            <a
              href={getWhatsAppUrl('general')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-300 text-teal-100 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp Chat</span>
            </a>
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                isAdmin
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-900/60 hover:bg-teal-900 text-teal-200'
              }`}
              title="Gym Staff & Admin Portal"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{isAdmin ? 'Staff Portal' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-md shadow-teal-900/10 group-hover:bg-[#115E59] transition-colors">
              <Dumbbell className="w-7 h-7 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-[#115E59] tracking-tight leading-none">
                  SRI MARUTHI
                </span>
                <span className="bg-[#CCFBF1] text-[#0F766E] font-bold text-[10px] uppercase px-1.5 py-0.5 rounded tracking-wider">
                  24/7
                </span>
              </div>
              <p className="text-xs font-semibold text-[#0D9488] tracking-widest uppercase mt-0.5">
                Power House Gym
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-[#0F766E] bg-[#F0FDFA] font-bold shadow-xs'
                      : 'text-[#1F2937] hover:text-[#0F766E] hover:bg-[#F0FDFA]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={getWhatsAppUrl('membership')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D9EAE7] text-xs font-semibold text-[#0F766E] hover:bg-[#F0FDFA] transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#0D9488]" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => handleNavClick('join')}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              Start Your Journey
            </button>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('join')}
              className="px-3 py-1.5 rounded-md text-xs font-bold text-white bg-[#0F766E]"
            >
              Join Now
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1F2937] hover:bg-[#F0FDFA] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#D9EAE7] px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                currentTab === item.id
                  ? 'bg-[#F0FDFA] text-[#0F766E] font-bold border-l-4 border-[#0F766E]'
                  : 'text-[#1F2937] hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[#D9EAE7] flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('join')}
              className="w-full text-center py-2.5 rounded-lg font-bold text-sm bg-[#0F766E] text-white shadow-sm"
            >
              Apply to Join Gym (24/7 Access)
            </button>
            <a
              href={getWhatsAppUrl('general')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm border border-[#0D9488] text-[#0F766E]"
            >
              <MessageSquare className="w-4 h-4 text-[#0D9488]" />
              <span>Chat on WhatsApp (+91 99454 57747)</span>
            </a>
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-center py-2 rounded-lg font-medium text-xs text-[#64748B] hover:text-[#0F766E] bg-slate-50"
            >
              Owner & Staff Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
