import React, { useEffect, useState, useRef } from 'react';
import { Award, CheckCircle2, User, MessageSquare, Clock, Plus, Trash2, Upload, Sparkles, AlertCircle, ShieldCheck, X } from 'lucide-react';
import { Trainer } from '../../types';
import { getTrainers, saveTrainer, deleteTrainer, logAuditEvent } from '../../services/gymService';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import { useAuth } from '../../context/AuthContext';

interface TrainersProps {
  onNavigate: (tab: string) => void;
}

const TRAINER_PHOTO_PRESETS = [
  {
    name: 'Strength & Conditioning Coach',
    url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
    role: 'Head Strength Coach',
  },
  {
    name: 'Bodybuilding & Hypertrophy Specialist',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    role: 'Senior Floor Coach',
  },
  {
    name: 'Transformation & Nutrition Advisor',
    url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80',
    role: 'Transformation Coach',
  },
  {
    name: 'Functional & Mobility Trainer',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    role: 'Functional Coach',
  },
];

export const Trainers: React.FC<TrainersProps> = ({ onNavigate }) => {
  const { isAdmin, currentUser } = useAuth();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Add Trainer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Strength & Floor Coach');
  const [specialization, setSpecialization] = useState('Powerlifting, Hypertrophy & Form Correction');
  const [qualifications, setQualifications] = useState('Certified Personal Trainer (CPT)');
  const [experience, setExperience] = useState('5+ Years Gym Coaching');
  const [bio, setBio] = useState('Committed to helping Jigani members lift safely with proper form and progressive overload.');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTrainers = async () => {
    try {
      const data = await getTrainers();
      setTrainers(data);
    } catch (e) {
      console.warn('Error loading trainers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTrainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter the trainer name.');
      return;
    }
    if (!role.trim()) {
      setErrorMessage('Please enter the coach role / title.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await saveTrainer({
        name: name.trim(),
        role: role.trim(),
        specialization: specialization.trim(),
        qualifications: qualifications.trim(),
        experience: experience.trim(),
        bio: bio.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
        isAvailable,
        displayOrder: trainers.length + 1,
      });

      await logAuditEvent(
        'ADD_TRAINER',
        'Trainer',
        name,
        `Added trainer profile: ${name} (${role})`,
        currentUser?.email || 'admin@smpgym.com'
      );

      setSuccessToast(`Coach "${name}" successfully added to the trainers section!`);
      setTimeout(() => setSuccessToast(null), 4000);

      // Reset
      setName('');
      setImageUrl('');
      setIsAddModalOpen(false);
      loadTrainers();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error adding trainer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrainer = async (t: Trainer, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove ${t.name}?`)) return;

    try {
      await deleteTrainer(t.id);
      await logAuditEvent(
        'DELETE_TRAINER',
        'Trainer',
        t.id,
        `Removed coach profile: ${t.name}`,
        currentUser?.email || 'admin@smpgym.com'
      );
      loadTrainers();
    } catch (err) {
      alert('Error deleting trainer: ' + err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#0D9488] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider">
              Coaching & Personal Training
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2">
              Supportive & Knowledgeable Coaches
            </h1>
            <p className="text-teal-100 text-base sm:text-lg max-w-2xl mt-3">
              Experienced fitness mentors dedicated to teaching proper lifting form, progressive overload, and injury prevention in Jigani.
            </p>
          </div>

          {/* Admin Quick Action Button */}
          {isAdmin && (
            <div className="shrink-0">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-white text-[#0F766E] hover:bg-[#CCFBF1] font-extrabold text-xs uppercase tracking-wider shadow-xl transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#0F766E]" />
                <span>+ Add Coach / Trainer</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-[#0F766E] text-[10px] font-bold">Admin</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="bg-emerald-600 text-white text-xs py-3 px-4 text-center font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Trainers Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {isAdmin && (
          <div className="mb-8 flex items-center justify-between p-4 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
              <span className="text-xs font-bold text-[#115E59]">
                Admin Trainer Management Mode Enabled
              </span>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Trainer</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : trainers.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#F0FDFA] border-2 border-dashed border-[#D9EAE7] text-center max-w-xl mx-auto space-y-3">
            <User className="w-12 h-12 text-[#0F766E] mx-auto" />
            <h3 className="font-bold text-lg text-[#115E59]">No Trainer Profiles Found</h3>
            <p className="text-xs text-[#64748B]">
              {isAdmin ? 'Click the button below to add your first gym coach.' : 'Trainer profiles are currently being updated.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#0F766E] text-white font-bold text-xs"
              >
                + Add Coach Profile
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((coach) => (
              <div
                key={coach.id}
                className="rounded-3xl overflow-hidden bg-white border border-[#D9EAE7] hover:border-[#0F766E] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                {/* Admin Delete Action */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteTrainer(coach, e)}
                    className="absolute top-3 left-3 z-20 p-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white shadow-md transition-all opacity-0 group-hover:opacity-100"
                    title="Remove coach profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div>
                  <div className="h-72 w-full overflow-hidden relative bg-slate-900">
                    <img
                      src={coach.imageUrl}
                      alt={coach.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      {coach.isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-[#0F766E] shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-white">
                          Waitlist Only
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">
                      {coach.role}
                    </span>
                    <h3 className="text-xl font-extrabold text-[#115E59] mt-1">
                      {coach.name}
                    </h3>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#D9EAE7]/60">
                        <span className="font-bold text-[#115E59] block">Specialization:</span>
                        <span className="text-[#64748B]">{coach.specialization}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-bold text-[#115E59] block">Credentials & Experience:</span>
                        <span className="text-[#64748B]">{coach.qualifications} • {coach.experience}</span>
                      </div>
                    </div>

                    <p className="text-sm text-[#64748B] mt-4 leading-relaxed line-clamp-3">
                      {coach.bio}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-4">
                  <div className="flex items-center gap-2 pt-4">
                    <button
                      onClick={() => onNavigate('trial')}
                      className="flex-1 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-sm transition-all text-center"
                    >
                      Book Free Trial
                    </button>
                    <a
                      href={getWhatsAppUrl(
                        'general',
                        `Hello Sri Maruthi Gym, I would like to inquire about coaching sessions with ${coach.name}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-[#D9EAE7] text-[#0F766E] hover:bg-[#F0FDFA] transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4 text-[#0D9488]" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ADMIN ADD TRAINER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D9EAE7] p-6 sm:p-8 space-y-5 animate-in zoom-in-95 text-xs text-[#1F2937]">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#115E59]">
                    Add New Coach / Trainer Profile
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Admin Content Manager</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Presets */}
            <div className="p-3 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-2">
              <span className="font-bold text-[#115E59] text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Quick Photo & Role Presets:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRAINER_PHOTO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(p.url);
                      setRole(p.role);
                      if (!name) setName(p.name);
                    }}
                    className="p-1.5 rounded-xl border border-[#D9EAE7] bg-white hover:border-[#0F766E] transition text-left group"
                  >
                    <div className="h-14 rounded-lg overflow-hidden bg-slate-100 mb-1">
                      <img src={p.url} alt={p.role} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="font-semibold text-[10px] text-[#115E59] line-clamp-1 block">
                      {p.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddTrainerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Coach Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Coach Maruthi"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Role / Title *</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Strength Coach"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Powerlifting, Fat Loss & Posture"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 6+ Years Coaching"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Qualifications / Certifications</label>
                <input
                  type="text"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="e.g. Certified Personal Trainer, Sports Nutritionist"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              {/* Photo Source */}
              <div className="space-y-2">
                <label className="font-bold text-[#115E59] block">
                  Coach Photograph (Upload from device or enter URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] text-xs focus:outline-none focus:border-[#0F766E]"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#F0FDFA] border border-[#0D9488] text-[#0F766E] font-bold text-xs inline-flex items-center gap-1.5 hover:bg-teal-100"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {imageUrl && (
                  <div className="mt-2 p-2 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#115E59] block">
                        {name || 'Coach Photo'}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        ✓ Photo ready
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Coach Biography</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short background and coaching philosophy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="pt-1 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#115E59]">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded text-[#0F766E]"
                  />
                  <span>Mark as Available for New Members</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold shadow-sm"
                >
                  {isSaving ? 'Saving...' : 'Add Coach Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
