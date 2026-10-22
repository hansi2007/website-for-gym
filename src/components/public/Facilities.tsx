import React, { useState } from 'react';
import {
  Dumbbell,
  Activity,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Layers,
  ArrowRight,
  Eye,
  X,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/whatsapp';

interface FacilitiesProps {
  onNavigate: (tab: string) => void;
}

export const Facilities: React.FC<FacilitiesProps> = ({ onNavigate }) => {
  const [activeImageModal, setActiveImageModal] = useState<{ url: string; title: string; desc: string } | null>(null);

  const facilityCategories = [
    {
      id: 'strength',
      title: 'Modern Plate-Loaded Strength Machinery',
      icon: Dumbbell,
      tag: 'Biomechanic Excellence',
      description: 'Heavy-duty steel construction with ergonomic handles and smooth movement paths for muscle isolation without joint strain.',
      items: [
        '45-Degree Plate-Loaded Linear Leg Press & Hack Squat Machine',
        'Dual Adjustable Cable Crossover System with multi-height pulleys',
        'Heavy-Duty Lat Pulldown & Seated Cable Row with mag-grip attachments',
        'Plate-loaded Chest Press, Incline Press & Pec-Fly / Rear Delt Station',
        'Seated Hamstring Leg Curl & Quad Extension combo machines',
      ],
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'free-weights',
      title: 'Heavy-Duty Free Weights & Calibrated Dumbbells',
      icon: Layers,
      tag: 'Power & Hypertrophy',
      description: 'Comprehensive dumbbell and barbell inventory arranged on multi-tiered racks with shock-absorbing commercial rubber flooring.',
      items: [
        'Rubber-coated hex dumbbells in 2.5kg to 40kg+ matched pairs',
        'Olympic steel barbells, 7ft power bars, EZ curl bars, and trap bars',
        'Adjustable flat, 30° incline, and 85° military press utility benches',
        'High-density cast-iron & rubber bumper plates (2.5kg - 25kg)',
        'Dedicated chalk bowl & barbell clip stations for secure lifting',
      ],
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'power-racks',
      title: 'Power Cages & Deadlift Lifting Platforms',
      icon: ShieldCheck,
      tag: 'Heavy Compound Lifts',
      description: 'Designed specifically for heavy squats, overhead presses, and deadlifts with heavy-gauge steel j-hooks and safety spotter pins.',
      items: [
        'Commercial walk-in power cages with multi-grip pull-up bars',
        'Shock-absorbing hardwood & rubber deadlift platform',
        'Spotter safety straps and adjustable safety pins',
        'Deadlift jack and barbell loader for smooth transitions',
      ],
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'cardio',
      title: 'Commercial Cardiovascular Suite',
      icon: Activity,
      tag: 'Endurance & Fat Loss',
      description: 'High-end cardiovascular equipment engineered for endurance building, effective warm-ups, and interval calorie burning.',
      items: [
        'Commercial multi-speed motorized treadmills with powered incline',
        'Low-impact elliptical cross-trainers for joint-friendly cardio',
        'High-intensity spin cycles and magnetic stationary bikes',
        'Real-time heart rate monitoring and distance stamina trackers',
      ],
      image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'coaching',
      title: 'Supportive Floor Coaching & Technique Guidance',
      icon: UserCheck,
      tag: 'Injury-Free Progression',
      description: 'Knowledgeable and certified trainers continuously available on the gym floor to help you with safe biomechanics and customized routines.',
      items: [
        'Beginner machine induction & safe weight selection guidance',
        'Form checks and spotting on squats, bench press, and deadlifts',
        'Customized workout split and progressive overload tracking',
        'Dedicated 1-on-1 Personal Training options available',
      ],
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'hygiene',
      title: 'Cleanliness, Hygiene & Restroom Facilities',
      icon: Sparkles,
      tag: 'Sanitized & Maintained',
      description: 'Prioritizing member hygiene and comfort with regular cleaning shifts, hygienic restrooms, and fresh ventilation in Jigani.',
      items: [
        'Daily floor sanitization and antibacterial equipment wipe-downs',
        'Clean, private restrooms and designated changing areas',
        'Secure locker storage compartments for gym bags and valuables',
        'Fresh air circulation and high-velocity ventilation systems',
      ],
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'atmosphere',
      title: 'Motivating Energy & 24/7 Access Flexibility',
      icon: ShieldCheck,
      tag: 'Jigani Community',
      description: 'An inclusive, energetic training environment with motivating music where every lifter feels welcomed, respected, and driven.',
      items: [
        'Open 24 hours, seven days a week (per verified business listing)',
        'LGBTQ+ friendly, respectful, and zero-intimidation atmosphere',
        'Convenient 2nd Floor location at MNT Complex on Jigani - Anekal Road',
        'High-tempo motivating training soundtrack to keep energy high',
      ],
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#0D9488] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider">
            Verified Facility Inventory
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2">
            Spacious, Well-Maintained Training Floor
          </h1>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl mt-3">
            Real photographic tour of our strength machinery, calibrated free weights, cardio gear, power racks, and coaching floor in Jigani, Bengaluru.
          </p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-20">
          {facilityCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const isReversed = idx % 2 === 1;
            return (
              <div
                key={cat.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Description column */}
                <div className={`lg:col-span-6 space-y-4 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0FDFA] border border-[#D9EAE7] text-[#0F766E] font-bold text-xs">
                      <Icon className="w-4 h-4" />
                      <span>{cat.tag}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#64748B]">
                      Facility #{idx + 1}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
                    {cat.title}
                  </h2>

                  <p className="text-sm text-[#64748B] leading-relaxed">
                    {cat.description}
                  </p>

                  <ul className="space-y-2.5 pt-2">
                    {cat.items.map((it, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1F2937]">
                        <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 flex items-center gap-4">
                    <button
                      onClick={() => onNavigate('trial')}
                      className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-sm transition active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <span>Try During Free Trial</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveImageModal({ url: cat.image, title: cat.title, desc: cat.description })}
                      className="px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] hover:bg-[#F0FDFA] text-[#0F766E] font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Full Image</span>
                    </button>
                  </div>
                </div>

                {/* Real image column */}
                <div className={`lg:col-span-6 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div
                    onClick={() => setActiveImageModal({ url: cat.image, title: cat.title, desc: cat.description })}
                    className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-[#D9EAE7] group cursor-pointer bg-slate-900"
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-white bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl">
                        <Eye className="w-4 h-4 text-emerald-300" />
                        <span>Click to view full photo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking prompt */}
      <section className="bg-[#F0FDFA] border-t border-[#D9EAE7] py-14 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="text-2xl font-extrabold text-[#115E59]">
            Want to see our machines in person?
          </h3>
          <p className="text-sm text-[#64748B]">
            Drop by our gym on the 2nd Floor of MNT Complex, Jigani - Anekal Road, opposite SLV Bar. Our team will gladly give you a guided walk-through.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('trial')}
              className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              Book Free Trial Session
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 rounded-xl border border-[#D9EAE7] bg-white hover:bg-slate-50 text-[#0F766E] font-bold text-sm"
            >
              View Verified Location & Directions
            </button>
          </div>
        </div>
      </section>

      {/* Full-screen Facility Image Lightbox */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
          onClick={() => setActiveImageModal(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={activeImageModal.url}
                alt={activeImageModal.title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-slate-900 text-white">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                Sri Maruthi Power House Gym 24/7 Facility
              </span>
              <h3 className="text-xl font-bold mt-1">{activeImageModal.title}</h3>
              <p className="text-sm text-slate-300 mt-1">{activeImageModal.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
