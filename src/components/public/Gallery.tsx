import React, { useEffect, useState, useRef } from 'react';
import { GalleryItem } from '../../types';
import { getGalleryItems, saveGalleryItem, deleteGalleryItem, logAuditEvent } from '../../services/gymService';
import { Eye, X, Image as ImageIcon, Plus, Trash2, Upload, Sparkles, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GalleryProps {
  onNavigate: (tab: string) => void;
}

// Preset real gym photos for instant selection
const REAL_GYM_PHOTO_PRESETS = [
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
    title: 'Commercial Motorized Treadmill Cardio Zone',
    category: 'workout' as const,
    url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80',
    desc: 'Multi-speed treadmills and cross trainers for stamina building.',
  },
  {
    title: '1-on-1 Certified Coach Biomechanics Coaching',
    category: 'training' as const,
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
    desc: 'Floor coach assisting lifter with barbell technique.',
  },
  {
    title: 'High-Energy Motivating Workout Floor',
    category: 'atmosphere' as const,
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
    desc: 'Vibrant training atmosphere with motivated members in Jigani.',
  },
  {
    title: 'Clean Sanitized Gym Facilities & Restrooms',
    category: 'interior' as const,
    url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80',
    desc: 'Hygienic restrooms, lockers, and sanitized workout spaces.',
  },
  {
    title: 'Spinning Cycles & Stationary Cardio Line',
    category: 'workout' as const,
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    desc: 'Commercial stationary spin bikes for warmups and endurance.',
  },
];

export const Gallery: React.FC<GalleryProps> = () => {
  const { isAdmin, currentUser } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  // Admin Add Photo Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<'interior' | 'equipment' | 'workout' | 'training' | 'atmosphere'>('equipment');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadGallery = async () => {
    try {
      const data = await getGalleryItems();
      setItems(data);
    } catch (e) {
      console.warn('Error loading gallery:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const categories = [
    { id: 'all', label: 'All Photographs' },
    { id: 'interior', label: 'Gym Interior' },
    { id: 'equipment', label: 'Machines & Weights' },
    { id: 'workout', label: 'Workout Sessions' },
    { id: 'training', label: 'Coach Guidance' },
    { id: 'atmosphere', label: 'Atmosphere' },
  ];

  const filteredItems = selectedFilter === 'all'
    ? items
    : items.filter((it) => it.category === selectedFilter);

  // Handle local image file upload and convert to Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        if (!photoTitle) {
          const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setPhotoTitle(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
        }
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof REAL_GYM_PHOTO_PRESETS[0]) => {
    setPhotoTitle(preset.title);
    setPhotoCategory(preset.category);
    setPhotoUrl(preset.url);
    setPhotoDesc(preset.desc);
    setErrorMessage(null);
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) {
      setErrorMessage('Please enter a photo title.');
      return;
    }
    if (!photoUrl.trim()) {
      setErrorMessage('Please provide an image URL or upload a photo.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await saveGalleryItem({
        title: photoTitle.trim(),
        category: photoCategory,
        imageUrl: photoUrl.trim(),
        description: photoDesc.trim(),
        displayOrder: items.length + 1,
      });

      await logAuditEvent(
        'ADD_GALLERY_PHOTO',
        'Gallery',
        photoTitle,
        `Added photo to gallery: ${photoTitle} (${photoCategory})`,
        currentUser?.email || 'admin@smpgym.com'
      );

      setSuccessToast(`Photo "${photoTitle}" successfully added to the gallery!`);
      setTimeout(() => setSuccessToast(null), 4000);

      // Reset and close
      setPhotoTitle('');
      setPhotoUrl('');
      setPhotoDesc('');
      setIsAddModalOpen(false);
      loadGallery();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error saving photo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhoto = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove the photo "${item.title}"?`)) return;

    try {
      await deleteGalleryItem(item.id);
      await logAuditEvent(
        'DELETE_GALLERY_PHOTO',
        'Gallery',
        item.id,
        `Deleted photo: ${item.title}`,
        currentUser?.email || 'admin@smpgym.com'
      );
      loadGallery();
    } catch (err) {
      alert('Error deleting photo: ' + err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#0D9488] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider">
              Photo Gallery
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2">
              Inside Sri Maruthi Power House Gym
            </h1>
            <p className="text-teal-100 text-base sm:text-lg max-w-2xl mt-3">
              Real snapshots of our heavy-duty strength machinery, free weight racks, clean training floor, and energetic lifting environment in Jigani.
            </p>
          </div>

          {/* Admin Direct Action Button */}
          {isAdmin && (
            <div className="shrink-0">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-white text-[#0F766E] hover:bg-[#CCFBF1] font-extrabold text-xs uppercase tracking-wider shadow-xl transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#0F766E]" />
                <span>+ Add Photo to Gallery</span>
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

      {/* Gallery Container */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Controls: Filter Pills + Add Button for Admin */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedFilter(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === c.id
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'bg-[#F0FDFA] text-[#115E59] border border-[#D9EAE7] hover:bg-teal-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F0FDFA] border border-[#0D9488] text-[#0F766E] text-xs font-bold hover:bg-teal-100 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-[#F0FDFA] border-2 border-dashed border-[#D9EAE7] max-w-md mx-auto space-y-3">
            <ImageIcon className="w-10 h-10 text-[#0F766E] mx-auto" />
            <h4 className="font-bold text-[#115E59]">No Photographs in this Category</h4>
            <p className="text-xs text-[#64748B]">
              {isAdmin ? 'Use the button below to upload or add real photos to this section.' : 'Check back shortly for new gym photos.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#0F766E] text-white font-bold text-xs"
              >
                + Add Photo Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group relative rounded-3xl overflow-hidden bg-slate-900 shadow-sm border border-[#D9EAE7] cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="h-64 sm:h-72 w-full overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                </div>

                {/* Admin Quick Delete Overlay Button */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeletePhoto(item, e)}
                    className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white shadow-md transition-all opacity-0 group-hover:opacity-100"
                    title="Delete photograph"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-base mt-0.5">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-slate-200 mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-200 font-semibold">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Click to view full image</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-slate-900 text-white">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                {activeItem.category}
              </span>
              <h3 className="text-lg font-bold mt-1">{activeItem.title}</h3>
              {activeItem.description && (
                <p className="text-sm text-slate-300 mt-1">{activeItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ADD PHOTO MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D9EAE7] p-6 sm:p-8 space-y-5 animate-in zoom-in-95 text-xs text-[#1F2937]">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAE7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#115E59]">
                    Add Photograph to Gallery
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

            {/* Quick Pick Presets */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#D9EAE7] space-y-2">
              <span className="font-bold text-[#115E59] text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Or Select from Real Gym Photo Presets:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {REAL_GYM_PHOTO_PRESETS.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="p-1.5 rounded-xl border border-[#D9EAE7] bg-white hover:border-[#0F766E] hover:shadow-xs transition text-left group"
                  >
                    <div className="h-14 rounded-lg overflow-hidden bg-slate-100 mb-1">
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="font-semibold text-[10px] text-[#115E59] line-clamp-1 block">
                      {p.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-[#115E59] block mb-1">Photo Title *</label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="e.g. Plate-Loaded Leg Press & Hack Squat"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] text-sm focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">Category *</label>
                <select
                  value={photoCategory}
                  onChange={(e) => setPhotoCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAE7] bg-white text-xs font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="equipment">Equipment & Weights</option>
                  <option value="interior">Gym Interior</option>
                  <option value="workout">Workout Sessions</option>
                  <option value="training">Coach Guidance</option>
                  <option value="atmosphere">Atmosphere</option>
                </select>
              </div>

              {/* Upload or URL */}
              <div className="space-y-2">
                <label className="font-bold text-[#115E59] block">
                  Image Source (Upload from device or enter URL) *
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
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

                {/* Preview */}
                {photoUrl && (
                  <div className="mt-2 p-2 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-bold text-xs text-[#115E59] block truncate">
                        {photoTitle || 'Image Ready'}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        ✓ Photo preview loaded
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-[#115E59] block mb-1">
                  Caption / Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={photoDesc}
                  onChange={(e) => setPhotoDesc(e.target.value)}
                  placeholder="Short note describing equipment details, coach or area..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9EAE7] focus:outline-none focus:border-[#0F766E]"
                />
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
                  className="px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold shadow-sm flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
