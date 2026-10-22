import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Dumbbell, MessageSquare, Clock, RefreshCw } from 'lucide-react';
import { MembershipPlan } from '../../types';
import { getPublishedPlans } from '../../services/gymService';
import { getWhatsAppUrl } from '../../utils/whatsapp';

interface MembershipsProps {
  onNavigate: (tab: string, planName?: string) => void;
}

export const Memberships: React.FC<MembershipsProps> = ({ onNavigate }) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await getPublishedPlans();
      setPlans(data);
    } catch (e) {
      console.warn('Failed to load published plans:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = selectedCategory === 'all'
    ? plans
    : plans.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#0D9488] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider">
            Membership Packages
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2">
            Clear, Direct & Affordable Pricing
          </h1>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl mt-3">
            Real plans published and verified by Sri Maruthi Power House Gym management. No hidden registration fees or lock-in surprises.
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Plans' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'quarterly', label: 'Quarterly' },
              { id: 'half-yearly', label: 'Half-Yearly' },
              { id: 'annual', label: 'Annual' },
              { id: 'personal-training', label: 'Personal Training' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'bg-[#F0FDFA] text-[#115E59] border border-[#D9EAE7] hover:bg-teal-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchPlans}
            className="inline-flex items-center gap-1.5 text-xs text-[#0F766E] font-semibold hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Plans</span>
          </button>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#64748B] mt-3">Loading verified membership plans...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-[#F0FDFA] border-2 border-dashed border-[#D9EAE7] max-w-xl mx-auto space-y-4">
            <Dumbbell className="w-12 h-12 text-[#0F766E] mx-auto" />
            <h3 className="text-xl font-bold text-[#115E59]">No Published Plans in this Category</h3>
            <p className="text-sm text-[#64748B]">
              The gym owner publishes plans directly through the admin dashboard. Inquire with the front desk for current seasonal packages or custom personal training splits.
            </p>
            <div className="pt-2">
              <a
                href={getWhatsAppUrl('pricing')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0F766E] text-white font-bold text-sm shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Inquire Custom Plans on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-[#115E59] to-[#0F766E] text-white shadow-xl shadow-teal-900/15 border-2 border-teal-400'
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

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 my-6">
                    <span
                      className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
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

                  {/* Benefits */}
                  <div className="space-y-3 mb-6">
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        plan.isPopular ? 'text-teal-200' : 'text-[#0D9488]'
                      }`}
                    >
                      Included In This Plan:
                    </p>
                    <ul className="space-y-2.5 text-sm">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              plan.isPopular ? 'text-emerald-300' : 'text-[#0D9488]'
                            }`}
                          />
                          <span className={plan.isPopular ? 'text-teal-50' : 'text-[#1F2937]'}>
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Terms */}
                  {plan.terms && (
                    <div
                      className={`p-3 rounded-xl text-xs mb-6 ${
                        plan.isPopular ? 'bg-white/10 text-teal-100' : 'bg-[#F0FDFA] text-[#64748B]'
                      }`}
                    >
                      <strong className="block text-[11px] uppercase tracking-wider mb-0.5">
                        Terms:
                      </strong>
                      {plan.terms}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100/20">
                  <button
                    onClick={() => onNavigate('join', `${plan.name} (₹${plan.price.toLocaleString('en-IN')})`)}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-98 ${
                      plan.isPopular
                        ? 'bg-white text-[#0F766E] hover:bg-[#CCFBF1]'
                        : 'bg-[#0F766E] text-white hover:bg-[#115E59]'
                    }`}
                  >
                    Select Plan & Apply to Join
                  </button>

                  <a
                    href={getWhatsAppUrl(
                      'pricing',
                      `Hello Sri Maruthi Gym, I am interested in joining the ${plan.name} (₹${plan.price}). Please guide me through enrollment.`
                    )}
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

        {/* Note on payments & confirmation */}
        <div className="mt-16 p-6 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#0F766E] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-[#115E59]">
                Safe In-Person & Digital Verification
              </h4>
              <p className="text-xs text-[#64748B]">
                Membership activations are officially logged and receipted by authorized gym staff at the front desk.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('join')}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#D9EAE7] hover:bg-slate-50 text-xs font-bold text-[#0F766E] whitespace-nowrap"
          >
            Apply Online (Joining Form)
          </button>
        </div>
      </section>
    </div>
  );
};
