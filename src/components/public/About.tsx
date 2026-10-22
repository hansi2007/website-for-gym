import React from 'react';
import { Dumbbell, Target, Heart, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { GOOGLE_MAPS_LINK, getWhatsAppUrl } from '../../utils/whatsapp';

interface AboutProps {
  onNavigate: (tab: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#0D9488] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider">
            About Sri Maruthi Power House Gym
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2">
            Train Strong. Live Stronger.
          </h1>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl mt-3">
            Established in the heart of Jigani, Bengaluru, to provide an authentic, supportive, and results-focused fitness home for every lifter.
          </p>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider bg-[#CCFBF1] px-3 py-1 rounded-full">
              Our Training Philosophy
            </span>
            <h2 className="text-3xl font-extrabold text-[#115E59]">
              Fitness Grounded in Real Strength & Community
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              At Sri Maruthi Power House Gym 24/7, we believe physical transformation begins with consistency, proper biomechanics, and genuine coaching encouragement. We strip away intimidation and replace it with a motivating training environment.
            </p>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Whether you are an absolute beginner stepping onto the gym floor for the first day, a busy professional balancing tight work hours in Jigani's industrial hub, or a seasoned lifter pursuing personal bests, our gym is built to serve your journey.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#D9EAE7]">
                <Target className="w-6 h-6 text-[#0F766E] mb-2" />
                <h4 className="font-bold text-sm text-[#115E59]">Progressive Overload</h4>
                <p className="text-xs text-[#64748B] mt-1">Structured workouts and progressive strength training tailored to your body.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#D9EAE7]">
                <Heart className="w-6 h-6 text-[#0F766E] mb-2" />
                <h4 className="font-bold text-sm text-[#115E59]">Supportive Coaching</h4>
                <p className="text-xs text-[#64748B] mt-1">Patient floor assistance, form checking, and safety-first routines.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-[#D9EAE7]">
              <img
                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80"
                alt="Gym workout atmosphere"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="p-6 bg-[#115E59] text-white">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                  Verified Jigani Hub
                </span>
                <p className="text-sm font-semibold text-teal-100 mt-1">
                  2nd Floor, MNT Complex, No. 523, Jigani - Anekal Road (opposite SLV Bar), Vinayaka Nagar, Bengaluru.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values & Inclusivity */}
      <section className="py-16 bg-[#F0FDFA] border-y border-[#D9EAE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
              Core Principles
            </span>
            <h2 className="text-3xl font-extrabold text-[#115E59] mt-2">
              What You Can Always Expect
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-[#115E59]">Inclusive For Everyone</h3>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                We take immense pride in maintaining an LGBTQ+ friendly and respectful fitness facility where men, women, and lifters of all backgrounds feel safe and valued.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-[#115E59]">Hygiene & Equipment Care</h3>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                Gym machines are regularly greased, checked, and wiped down. Restrooms are cleaned routinely to guarantee a healthy workout atmosphere.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#D9EAE7] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-[#115E59]">Transparent Membership</h3>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                No misleading fine print or surprise maintenance fees. What you see is what you get, backed by verified ratings and genuine member reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
          Experience The Difference In Person
        </h3>
        <p className="text-[#64748B] text-sm sm:text-base mt-2 max-w-xl mx-auto">
          Take a tour of our training floor or schedule a free trial workout to meet our coaches.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onNavigate('trial')}
            className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-sm shadow-md transition-all"
          >
            Book Free Trial Session
          </button>
          <button
            onClick={() => onNavigate('facilities')}
            className="px-6 py-3 rounded-xl border border-[#D9EAE7] hover:bg-[#F0FDFA] text-[#0F766E] font-bold text-sm transition-all"
          >
            Explore Equipment & Facilities
          </button>
        </div>
      </section>
    </div>
  );
};
