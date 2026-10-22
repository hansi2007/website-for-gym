import React, { useEffect, useState } from 'react';
import {
  Dumbbell,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { MembershipPlan, GymSettings } from '../../types';
import { getPublishedPlans, getGymSettings } from '../../services/gymService';
import { GOOGLE_MAPS_LINK, GYM_PHONE_DISPLAY, getWhatsAppUrl } from '../../utils/whatsapp';

interface HomeProps {
  onNavigate: (tab: string, planName?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [settings, setSettings] = useState<GymSettings | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, s] = await Promise.all([getPublishedPlans(), getGymSettings()]);
        setPlans(p);
        setSettings(s);
      } catch (err) {
        console.warn('Error loading home data:', err);
      } finally {
        setLoadingPlans(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - Premium Deep Teal with bold typography */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#115E59] via-[#0F766E] to-[#0D9488] text-white">
        {/* Subtle decorative grid/glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#CCFBF1_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Best Gym in Jigani • 24/7 Open Gym</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.08]">
                YOUR STRENGTH. <br />
                <span className="text-[#CCFBF1]">YOUR JOURNEY.</span> <br />
                YOUR FUTURE.
              </h1>

              <p className="text-lg sm:text-xl text-teal-50 font-medium leading-relaxed max-w-2xl">
                TRAIN STRONG. LIVE STRONGER. Whether you're lifting for the first time or breaking personal records, Sri Maruthi Power House Gym provides the equipment, atmosphere, and guidance you need.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => onNavigate('join')}
                  className="px-7 py-4 rounded-xl bg-white text-[#0F766E] font-extrabold text-base hover:bg-[#CCFBF1] shadow-lg shadow-teal-950/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center gap-2 group"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('memberships')}
                  className="px-7 py-4 rounded-xl bg-teal-800/60 hover:bg-teal-800 border border-teal-300/40 text-white font-bold text-base transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Explore Memberships</span>
                </button>
              </div>

              {/* Mini highlights */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-teal-600/40 text-xs">
                <div>
                  <span className="font-extrabold text-lg text-white block">24 / 7</span>
                  <span className="text-teal-200">Flexible Access</span>
                </div>
                <div>
                  <span className="font-extrabold text-lg text-white block">4.9 ★</span>
                  <span className="text-teal-200">833 Reviews</span>
                </div>
                <div>
                  <span className="font-extrabold text-lg text-white block">100%</span>
                  <span className="text-teal-200">Supportive Vibe</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-teal-900 group">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80"
                    alt="Sri Maruthi Power House Gym strength training floor"
                    className="w-full h-96 sm:h-[480px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-teal-200">Location</p>
                        <p className="text-sm font-bold">MNT Complex, Jigani - Anekal Road</p>
                      </div>
                      <a
                        href={GOOGLE_MAPS_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold text-white flex items-center gap-1"
                      >
                        Map <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Floating pill */}
                <div className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 bg-white text-[#115E59] p-3 sm:p-4 rounded-2xl shadow-xl border border-[#D9EAE7] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] flex items-center justify-center text-[#0F766E]">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#64748B] block">Motivation High</span>
                    <span className="text-sm font-extrabold text-[#115E59]">Beginner Friendly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SNAPSHOT BANNER */}
      <section className="bg-[#F0FDFA] border-b border-[#D9EAE7] py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div>
              <span className="font-extrabold text-base text-[#115E59]">
                4.9 out of 5 Stars
              </span>
              <span className="text-sm text-[#64748B] ml-2">
                (833 Google Reviews snapshot)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#64748B]">
            <span className="hidden sm:inline bg-white px-2.5 py-1 rounded-md border border-[#D9EAE7]">
              Client-Supplied Snapshot
            </span>
            <a
              href={GOOGLE_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#0F766E] hover:underline"
            >
              Verify on Google Maps <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* KEY BUSINESS HIGHLIGHTS */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-3 py-1 rounded-full">
            Why Train With Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#115E59] mt-3">
            Your Next Level Starts Here.
          </h2>
          <p className="text-[#64748B] mt-3 text-base">
            Verified by hundreds of gym members across Jigani. Here is what makes Sri Maruthi Power House Gym 24/7 the preferred choice for real strength results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-7 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors mb-5">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#115E59]">Modern Machinery & Free Weights</h3>
            <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
              Equipped with heavy-duty dumbbells, Olympic barbells, plate-loaded machines, cable stations, and comprehensive cardio equipment.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#115E59]">Supportive & Knowledgeable Coaches</h3>
            <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
              Certified trainers who teach correct lifting form, prevent injury, and encourage members through every step of their fitness journey.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#115E59]">Spacious, Clean & Well Maintained</h3>
            <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
              Hygienic workout spaces, clean locker rooms, fresh ventilation, and organized weight racks for an uninterrupted workout.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#115E59]">24-Hour Access Flexibility</h3>
            <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
              Work out early morning or late night according to your shift schedule. Confirm specific trainer timings with the front desk.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-7 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#115E59]">High Value For Money</h3>
            <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
              Honest, transparent pricing with no hidden charges. High-grade facilities with affordable quarterly and annual plans.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-7 rounded-2xl bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#115E59]">LGBTQ+ Friendly & Welcoming</h3>
            <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
              An inclusive, safe and supportive training environment where every member is respected and empowered to thrive.
            </p>
          </div>
        </div>
      </section>

      {/* FACILITIES PREVIEW GRID */}
      <section className="py-16 bg-[#F0FDFA] border-y border-[#D9EAE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
                Workout Environment
              </span>
              <h2 className="text-3xl font-extrabold text-[#115E59] mt-1">
                Built For Serious Training
              </h2>
            </div>
            <button
              onClick={() => onNavigate('facilities')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0F766E] hover:text-[#115E59]"
            >
              <span>View All Facilities</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl overflow-hidden bg-white border border-[#D9EAE7] shadow-sm group">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80"
                  alt="Machine Floor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-[#115E59] text-base">Advanced Machine Floor</h4>
                <p className="text-xs text-[#64748B] mt-1">Plate-loaded chest presses, hack squat & cable flys</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white border border-[#D9EAE7] shadow-sm group">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80"
                  alt="Free Weights Zone"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-[#115E59] text-base">Free Weights & Dumbbells</h4>
                <p className="text-xs text-[#64748B] mt-1">Heavy-duty pairs up to 40kg+ with flat/incline benches</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white border border-[#D9EAE7] shadow-sm group">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=600&q=80"
                  alt="Cardio Section"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-[#115E59] text-base">Cardiovascular Area</h4>
                <p className="text-xs text-[#64748B] mt-1">Treadmills, elliptical cross trainers & spin bikes</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white border border-[#D9EAE7] shadow-sm group">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80"
                  alt="Coaching Floor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-[#115E59] text-base">Certified Coach Guidance</h4>
                <p className="text-xs text-[#64748B] mt-1">Personal form correction and customized split routines</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP PREVIEW (Loaded from Firestore) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#115E59] mt-3">
            Membership Plans
          </h2>
          <p className="text-[#64748B] mt-2 text-sm sm:text-base">
            Choose a plan that fits your goals. All memberships include full gym floor access, clean locker facilities, and coach assistance.
          </p>
        </div>

        {loadingPlans ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] max-w-lg mx-auto">
            <Dumbbell className="w-10 h-10 text-[#0F766E] mx-auto mb-3" />
            <h4 className="font-bold text-[#115E59]">Membership Plans Being Updated</h4>
            <p className="text-xs text-[#64748B] mt-1">
              The gym owner is currently updating current membership prices. Please contact the front desk on WhatsApp for immediate pricing.
            </p>
            <a
              href={getWhatsAppUrl('pricing')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F766E] text-white text-xs font-bold"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquire Pricing on WhatsApp</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.slice(0, 3).map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 transition-all duration-200 flex flex-col justify-between ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-[#115E59] to-[#0F766E] text-white shadow-xl shadow-teal-900/15 scale-102 border-2 border-teal-400'
                    : 'bg-white border border-[#D9EAE7] hover:border-[#0F766E] text-[#1F2937] shadow-sm'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-teal-950 text-xs font-extrabold uppercase px-3.5 py-1 rounded-full shadow-sm">
                    Most Popular Choice
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-xl font-extrabold ${
                        plan.isPopular ? 'text-white' : 'text-[#115E59]'
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${
                        plan.isPopular
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F0FDFA] text-[#0F766E]'
                      }`}
                    >
                      {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 my-6">
                    <span
                      className={`text-4xl font-extrabold tracking-tight ${
                        plan.isPopular ? 'text-white' : 'text-[#115E59]'
                      }`}
                    >
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-xs ${
                        plan.isPopular ? 'text-teal-200' : 'text-[#64748B]'
                      }`}
                    >
                      / {plan.durationMonths} {plan.durationMonths === 1 ? 'month' : 'months'}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8 text-sm">
                    {plan.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            plan.isPopular ? 'text-emerald-300' : 'text-[#0D9488]'
                          }`}
                        />
                        <span
                          className={plan.isPopular ? 'text-teal-50' : 'text-[#1F2937]'}
                        >
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <button
                    onClick={() => onNavigate('join')}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-98 ${
                      plan.isPopular
                        ? 'bg-white text-[#0F766E] hover:bg-[#CCFBF1]'
                        : 'bg-[#0F766E] text-white hover:bg-[#115E59]'
                    }`}
                  >
                    Select Plan & Enroll
                  </button>
                  <a
                    href={getWhatsAppUrl('pricing', `Hello Sri Maruthi Gym, I am interested in joining the ${plan.name} (₹${plan.price}). Please share more details.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center text-xs mt-3 font-semibold hover:underline ${
                      plan.isPopular ? 'text-teal-200' : 'text-[#0F766E]'
                    }`}
                  >
                    Ask questions on WhatsApp →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('memberships')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0F766E] hover:underline"
          >
            <span>View All Membership Plans & Terms</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* MEMBER TESTIMONIALS (Approved excerpts from genuine reviews) */}
      <section className="py-16 sm:py-20 bg-[#F0FDFA] border-t border-[#D9EAE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-[#D9EAE7]">
              Real Member Experiences
            </span>
            <h2 className="text-3xl font-extrabold text-[#115E59] mt-3">
              What Jigani Lifters Say
            </h2>
            <p className="text-[#64748B] text-sm mt-2">
              Approved excerpts from genuine Google business reviews for Sri Maruthi Power House Gym.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#1F2937] italic leading-relaxed">
                  "Spacious and well-maintained gym in Jigani. The machines are top notch and coaches explain proper posture patiently. Best value for money in this area."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#115E59] block">Gym Member</span>
                  <span className="text-[#64748B]">Google Review Verified</span>
                </div>
                <span className="text-[11px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded">5.0 ★</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#1F2937] italic leading-relaxed">
                  "Very motivating training atmosphere. Wide variety of free weights and cardio equipment. Clean restrooms and workout floor is kept clean."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#115E59] block">Regular Member</span>
                  <span className="text-[#64748B]">Google Review Verified</span>
                </div>
                <span className="text-[11px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded">5.0 ★</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#1F2937] italic leading-relaxed">
                  "Friendly and knowledgeable trainers. Whether beginner or experienced lifter, everyone feels welcome. 24/7 access makes it super convenient."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#115E59] block">Fitness Enthusiast</span>
                  <span className="text-[#64748B]">Google Review Verified</span>
                </div>
                <span className="text-[11px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded">5.0 ★</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION & DIRECTIONS PREVIEW */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-3 py-1 rounded-full">
              Easy To Reach
            </span>
            <h2 className="text-3xl font-extrabold text-[#115E59]">
              Convenient Jigani Location
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Located conveniently on Jigani - Anekal Road on the 2nd Floor of MNT Complex, opposite SLV Bar. Ample parking for two-wheelers and easy road connectivity.
            </p>

            <div className="space-y-3 pt-2 text-sm text-[#1F2937]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                <span>2nd Floor, MNT Complex, No. 523, Jigani - Anekal Road, opposite SLV Bar, Vinayaka Nagar, Jigani, Bengaluru, Karnataka 560105</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#0F766E] shrink-0" />
                <span>Open 24 Hours / 7 Days a Week (Verified listing)</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href={GOOGLE_MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-sm flex items-center gap-2 shadow-sm"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Directions on Google Maps</span>
              </a>
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-3 rounded-xl border border-[#D9EAE7] hover:bg-[#F0FDFA] text-[#0F766E] font-bold text-sm"
              >
                Contact Front Desk
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl overflow-hidden border-2 border-[#D9EAE7] bg-[#F0FDFA] shadow-md p-2">
              <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-200">
                {/* Embedded Map / Verified OpenStreetMap Embed Fallback */}
                <iframe
                  title="Sri Maruthi Power House Gym Location"
                  className="w-full h-full border-0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.3168288599426!2d77.6384218!3d12.7885065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6f477611e97d%3A0x7d6f5f90eb778b02!2sSri%20Maruthi%20Power%20House%20Gym!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  loading="lazy"
                  allowFullScreen
                ></iframe>

                {/* Floating Map Pin info box */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md border border-[#D9EAE7] max-w-xs">
                  <span className="font-extrabold text-xs text-[#115E59] block">
                    Sri Maruthi Power House Gym
                  </span>
                  <span className="text-[11px] text-[#64748B]">MNT Complex 2nd Floor, Jigani</span>
                  <a
                    href={GOOGLE_MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#0F766E] font-bold hover:underline"
                  >
                    Open Google Maps App <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL MOTIVATING CTA */}
      <section className="bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#0D9488] text-white py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#CCFBF1]">
            YOUR FITNESS JOURNEY STARTS TODAY
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            READY TO START YOUR FITNESS JOURNEY?
          </h2>
          <p className="text-teal-100 max-w-2xl mx-auto text-base">
            Take the first step. Book your trial workout session or chat directly with our head coach on WhatsApp.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('join')}
              className="px-8 py-4 rounded-xl bg-white text-[#0F766E] font-extrabold text-base hover:bg-[#CCFBF1] transition-all shadow-lg active:scale-95"
            >
              Apply to Join Gym (24/7 Access)
            </button>
            <a
              href={getWhatsAppUrl('general')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-[#0D9488] hover:bg-[#0b7e74] text-white font-extrabold text-base inline-flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <MessageSquare className="w-5 h-5" />
              <span>WhatsApp Us Now</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
