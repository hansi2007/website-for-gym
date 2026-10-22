import React, { useEffect, useState, useRef } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Clock,
  Phone,
  MapPin,
  Image as ImageIcon,
  UserCheck,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GymSettings, Trainer, GalleryItem } from '../../types';
import {
  getGymSettings,
  saveGymSettings,
  getTrainers,
  saveTrainer,
  deleteTrainer,
  getGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  logAuditEvent
} from '../../services/gymService';
import { useAuth } from '../../context/AuthContext';

const REAL_GYM_PRESETS = [
  {
    title: 'Plate-Loaded 45-Degree Leg Press',
    category: 'equipment' as const,
    url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
    desc: 'Heavy-duty plate-loaded leg press machine with safety stops.',
  },
  {
    title: 'Commercial Hex Dumbbell Rack (2.5kg - 40kg+)',
    category: 'equipment' as const,
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    desc: 'Extensive free weight dumbbells and flat/incline benches.',
  },
  {
    title: 'Walk-In Power Cages & Deadlift Platform',
    category: 'equipment' as const,
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    desc: 'Steel power racks with Olympic bars and rubber drop mats.',
  },
  {
    title: 'Commercial Motorized Treadmills',
    category: 'workout' as const,
    url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80',
    desc: 'Multi-speed treadmills and cross trainers for stamina building.',
  },
];

const TRAINER_PRESETS = [
  {
    name: 'Head Coach Maruthi',
    role: 'Head Strength & Conditioning Coach',
    url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
    spec: 'Powerlifting, Hypertrophy & Athletic Conditioning',
  },
  {
    name: 'Coach Suresh',
    role: 'Senior Floor Coach',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    spec: 'Fat Loss, Endurance & Mobility Training',
  },
  {
    name: 'Coach Priya',
    role: 'Female Transformation & Nutrition Specialist',
    url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80',
    spec: 'Female Fitness, Posture & Sports Nutrition',
  },
];

export const ContentManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'trainers' | 'gallery'>('profile');

  // Business profile state
  const [settings, setSettings] = useState<GymSettings>({
    businessName: 'Sri Maruthi Power House Gym 24/7 (Best Gym Near Me)',
    address: '2nd Floor, MNT Complex, No. 523, Jigani - Anekal Road, opposite SLV Bar, Vinayaka Nagar, Jigani, Bengaluru, Karnataka 560105, India.',
    phone: '+91 99454 57747',
    whatsappNumber: '919945457747',
    googleMapsUrl: 'https://maps.app.goo.gl/c2u15pLQEHF3tXzv5',
    openingHours: 'Open 24 hours, seven days a week (Subject to confirmation)',
    ratingSnapshot: 4.9,
    reviewCountSnapshot: 833,
    is24x7Confirmed: true,
    announcement: 'Welcome to Sri Maruthi Power House Gym! Experience high-energy strength training in Jigani.',
  });

  // Trainers state
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [newTrainerName, setNewTrainerName] = useState('');
  const [newTrainerRole, setNewTrainerRole] = useState('Senior Strength Coach');
  const [newTrainerSpec, setNewTrainerSpec] = useState('Powerlifting & Hypertrophy');
  const [newTrainerQual, setNewTrainerQual] = useState('Certified Fitness Specialist (CPT)');
  const [newTrainerExp, setNewTrainerExp] = useState('5+ Years Gym Coaching');
  const [newTrainerBio, setNewTrainerBio] = useState('Dedicated to teaching proper biomechanics and progressive overload.');
  const [newTrainerImg, setNewTrainerImg] = useState('');
  const trainerFileInputRef = useRef<HTMLInputElement>(null);

  // Gallery state
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCat, setNewGalleryCat] = useState<'interior' | 'equipment' | 'workout' | 'training' | 'atmosphere'>('equipment');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryDesc, setNewGalleryDesc] = useState('');
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const [s, t, g] = await Promise.all([
        getGymSettings(),
        getTrainers(),
        getGalleryItems(),
      ]);
      if (s) setSettings(s);
      setTrainers(t);
      setGallery(g);
    } catch (e) {
      console.warn('Error loading content management:', e);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      await saveGymSettings(settings);
      await logAuditEvent(
        'UPDATE_SETTINGS',
        'GymSettings',
        'general',
        'Updated business contact and opening hours profile',
        currentUser?.email || 'admin@smpgym.com'
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTrainerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewTrainerImg(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainerName.trim()) return;

    try {
      await saveTrainer({
        name: newTrainerName.trim(),
        role: newTrainerRole.trim(),
        specialization: newTrainerSpec.trim(),
        qualifications: newTrainerQual.trim(),
        experience: newTrainerExp.trim(),
        bio: newTrainerBio.trim(),
        imageUrl: newTrainerImg.trim() || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        displayOrder: trainers.length + 1,
      });

      setNewTrainerName('');
      setNewTrainerImg('');
      loadAll();
    } catch (e) {
      alert('Error adding trainer: ' + e);
    }
  };

  const handleDeleteTrainer = async (t: Trainer) => {
    if (!window.confirm(`Delete coach ${t.name}?`)) return;
    try {
      await deleteTrainer(t.id);
      loadAll();
    } catch (e) {
      alert('Error deleting trainer: ' + e);
    }
  };

  const handleGalleryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewGalleryUrl(reader.result);
        if (!newGalleryTitle) {
          const defaultTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setNewGalleryTitle(defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryTitle.trim() || !newGalleryUrl.trim()) return;

    try {
      await saveGalleryItem({
        title: newGalleryTitle.trim(),
        category: newGalleryCat,
        imageUrl: newGalleryUrl.trim(),
        description: newGalleryDesc.trim(),
        displayOrder: gallery.length + 1,
      });

      setNewGalleryTitle('');
      setNewGalleryUrl('');
      setNewGalleryDesc('');
      loadAll();
    } catch (e) {
      alert('Error adding image: ' + e);
    }
  };

  const handleDeleteGallery = async (item: GalleryItem) => {
    if (!window.confirm(`Delete photograph "${item.title}"?`)) return;
    try {
      await deleteGalleryItem(item.id);
      loadAll();
    } catch (e) {
      alert('Error deleting image: ' + e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
            Public Website CMS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#115E59]">
            Content & Business Settings
          </h1>
          <p className="text-xs text-[#64748B]">
            All updates made here instantly sync to Cloud Firestore and reflect across the public gym website.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#D9EAE7]">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSection === 'profile'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#115E59]'
            }`}
          >
            Business Profile & Hours
          </button>
          <button
            onClick={() => setActiveSection('trainers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSection === 'trainers'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#115E59]'
            }`}
          >
            Trainer Profiles ({trainers.length})
          </button>
          <button
            onClick={() => setActiveSection('gallery')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSection === 'gallery'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#115E59]'
            }`}
          >
            Gallery Photos ({gallery.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: BUSINESS PROFILE & HOURS */}
      {activeSection === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Business settings updated and saved to Firestore successfully!</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business info */}
            <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-[#115E59] pb-2 border-b border-slate-100">
                <Building className="w-4 h-4 text-[#0F766E]" />
                <span>Verified Business Identity</span>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Verified Full Address</label>
                <textarea
                  rows={3}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Google Maps Direct Link</label>
                <input
                  type="url"
                  value={settings.googleMapsUrl}
                  onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            {/* Contact & Hours */}
            <div className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-[#115E59] pb-2 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[#0F766E]" />
                <span>Contact Channels & Timings</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Opening Hours Display</label>
                <input
                  type="text"
                  value={settings.openingHours}
                  onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Rating Snapshot</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.ratingSnapshot}
                    onChange={(e) => setSettings({ ...settings, ratingSnapshot: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#115E59] block mb-1">Reviews Count Snapshot</label>
                  <input
                    type="number"
                    value={settings.reviewCountSnapshot}
                    onChange={(e) => setSettings({ ...settings, reviewCountSnapshot: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Gym Announcement Banner</label>
                <input
                  type="text"
                  value={settings.announcement || ''}
                  onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                  placeholder="e.g. Free trial sessions available this week!"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Business Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: TRAINERS */}
      {activeSection === 'trainers' && (
        <div className="space-y-8">
          {/* Quick preset selector */}
          <div className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-2">
            <span className="font-bold text-xs text-[#115E59] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Fill from Coach Presets:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TRAINER_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNewTrainerName(p.name);
                    setNewTrainerRole(p.role);
                    setNewTrainerSpec(p.spec);
                    setNewTrainerImg(p.url);
                  }}
                  className="p-2 rounded-xl border border-[#D9EAE7] bg-white hover:border-[#0F766E] text-left transition flex items-center gap-2.5"
                >
                  <img src={p.url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <span className="font-bold text-[11px] text-[#115E59] block">{p.name}</span>
                    <span className="text-[10px] text-[#64748B] block truncate">{p.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add trainer form */}
          <form
            onSubmit={handleAddTrainer}
            className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs space-y-4 text-xs"
          >
            <h3 className="font-extrabold text-sm text-[#115E59]">
              Add Certified Coach / Trainer Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Coach Name *</label>
                <input
                  type="text"
                  value={newTrainerName}
                  onChange={(e) => setNewTrainerName(e.target.value)}
                  placeholder="e.g. Coach Ramesh"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Role / Title *</label>
                <input
                  type="text"
                  value={newTrainerRole}
                  onChange={(e) => setNewTrainerRole(e.target.value)}
                  placeholder="e.g. Senior Strength Coach"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Specialization *</label>
                <input
                  type="text"
                  value={newTrainerSpec}
                  onChange={(e) => setNewTrainerSpec(e.target.value)}
                  placeholder="e.g. Powerlifting & Hypertrophy"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Credentials / Certifications</label>
                <input
                  type="text"
                  value={newTrainerQual}
                  onChange={(e) => setNewTrainerQual(e.target.value)}
                  placeholder="e.g. Certified Personal Trainer"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Experience</label>
                <input
                  type="text"
                  value={newTrainerExp}
                  onChange={(e) => setNewTrainerExp(e.target.value)}
                  placeholder="e.g. 5+ Years"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-[#115E59] block">
                Photograph (Upload from device or enter URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newTrainerImg}
                  onChange={(e) => setNewTrainerImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
                <button
                  type="button"
                  onClick={() => trainerFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-[#F0FDFA] border border-[#0D9488] text-[#0F766E] font-bold text-xs inline-flex items-center gap-1.5 hover:bg-teal-100"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
                <input
                  type="file"
                  ref={trainerFileInputRef}
                  onChange={handleTrainerFile}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {newTrainerImg && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-300">
                  <img src={newTrainerImg} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-[#115E59] block mb-1">Coach Biography</label>
              <textarea
                rows={2}
                value={newTrainerBio}
                onChange={(e) => setNewTrainerBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold"
            >
              + Add Coach Profile
            </button>
          </form>

          {/* Current trainers list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 rounded-2xl overflow-hidden mb-3 bg-slate-900">
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-extrabold text-base text-[#115E59]">{t.name}</h4>
                  <p className="text-xs text-[#0D9488] font-bold">{t.role}</p>
                  <p className="text-xs text-[#64748B] mt-1">{t.specialization}</p>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{t.bio}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteTrainer(t)}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: GALLERY */}
      {activeSection === 'gallery' && (
        <div className="space-y-8">
          {/* Quick presets */}
          <div className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-2">
            <span className="font-bold text-xs text-[#115E59] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Real Gym Image Presets:</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {REAL_GYM_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNewGalleryTitle(p.title);
                    setNewGalleryCat(p.category);
                    setNewGalleryUrl(p.url);
                    setNewGalleryDesc(p.desc);
                  }}
                  className="p-1.5 rounded-xl border border-[#D9EAE7] bg-white hover:border-[#0F766E] text-left transition"
                >
                  <img src={p.url} alt={p.title} className="w-full h-14 object-cover rounded-lg mb-1" />
                  <span className="font-semibold text-[10px] text-[#115E59] line-clamp-1 block">{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add gallery image */}
          <form
            onSubmit={handleAddGallery}
            className="p-6 rounded-3xl bg-white border border-[#D9EAE7] shadow-xs space-y-4 text-xs"
          >
            <h3 className="font-extrabold text-sm text-[#115E59]">
              Add Gym Facility / Atmosphere Photograph
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Photo Title *</label>
                <input
                  type="text"
                  value={newGalleryTitle}
                  onChange={(e) => setNewGalleryTitle(e.target.value)}
                  placeholder="e.g. Free Weights Zone"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Category</label>
                <select
                  value={newGalleryCat}
                  onChange={(e) => setNewGalleryCat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] bg-white focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="equipment">Equipment & Weights</option>
                  <option value="interior">Gym Interior</option>
                  <option value="workout">Workout Sessions</option>
                  <option value="training">Coach Guidance</option>
                  <option value="atmosphere">Atmosphere</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-[#115E59] block">
                Image Source (Upload from device or enter URL) *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-[#F0FDFA] border border-[#0D9488] text-[#0F766E] font-bold text-xs inline-flex items-center gap-1.5 hover:bg-teal-100"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
                <input
                  type="file"
                  ref={galleryFileInputRef}
                  onChange={handleGalleryFile}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {newGalleryUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-300">
                  <img src={newGalleryUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-[#115E59] block mb-1">Caption / Description</label>
              <input
                type="text"
                value={newGalleryDesc}
                onChange={(e) => setNewGalleryDesc(e.target.value)}
                placeholder="Brief caption visible in gallery lightbox"
                className="w-full px-3 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold"
            >
              + Add to Photo Gallery
            </button>
          </form>

          {/* Current Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((g) => (
              <div
                key={g.id}
                className="rounded-2xl overflow-hidden bg-white border border-[#D9EAE7] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 overflow-hidden bg-slate-900">
                    <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider block">
                      {g.category}
                    </span>
                    <h5 className="font-bold text-xs text-[#115E59] mt-0.5 line-clamp-1">{g.title}</h5>
                  </div>
                </div>

                <div className="p-3 pt-0 flex justify-end">
                  <button
                    onClick={() => handleDeleteGallery(g)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
