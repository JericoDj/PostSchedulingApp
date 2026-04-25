import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Sparkles, 
  Facebook, 
  Instagram, 
  Play, 
  Linkedin,
  Youtube,
  Upload,
  X as XClose,
  AlertCircle,
  Loader2,
  Check,
  Zap,
  Clock,
  AtSign,
  Crop as CropIcon
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { API_BASE_URL, authHeaders } from '../utils/api';

const XBrandIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.901 2H21.99l-6.75 7.714L23.176 22h-6.211l-4.864-6.488L6.423 22H3.332l7.219-8.249L.823 2h6.37l4.397 5.893L18.901 2Zm-1.084 18.146h1.711L6.276 3.758H4.44l13.377 16.388Z" />
  </svg>
);

const PinterestIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2a10 10 0 0 0-3.64 19.32c-.05-.82-.1-2.08.02-2.98.11-.77.73-4.92.73-4.92s-.19-.38-.19-.94c0-.89.52-1.55 1.16-1.55.55 0 .82.41.82.91 0 .55-.35 1.38-.53 2.15-.15.65.32 1.18.96 1.18 1.14 0 2.01-1.2 2.01-2.93 0-1.53-1.1-2.6-2.67-2.6-1.82 0-2.89 1.36-2.89 2.77 0 .55.21 1.14.48 1.46.05.06.06.12.04.19-.04.21-.14.65-.16.74-.03.12-.09.15-.22.09-.83-.39-1.35-1.62-1.35-2.61 0-2.12 1.54-4.07 4.44-4.07 2.33 0 4.14 1.66 4.14 3.89 0 2.32-1.46 4.19-3.48 4.19-.68 0-1.31-.35-1.53-.78l-.42 1.6c-.15.58-.56 1.3-.83 1.74A10 10 0 1 0 12 2Z" />
  </svg>
);

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500', allowed: ['image', 'video', 'text'] },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', allowed: ['image', 'video'] },
  { id: 'threads', name: 'Threads', icon: AtSign, color: 'text-zinc-200', allowed: ['image', 'video', 'text'] },
  { id: 'tiktok', name: 'TikTok', icon: Play, color: 'text-white', allowed: ['video'] },
  { id: 'x', name: 'X', icon: XBrandIcon, color: 'text-slate-100', allowed: ['image', 'video', 'text'] },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-sky-400', allowed: ['image', 'video', 'text'] },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-400', allowed: ['video'] },
  { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: 'text-red-500', allowed: ['image', 'video'], comingSoon: true },
];

const FORMAT_CATEGORIES = [
  { id: 'general', label: 'General / Orignal Aspect' },
  { id: 'portrait', label: 'Instagram Portrait (4:5)', ratio: 4/5 },
  { id: 'landscape', label: 'Landscape (1.91:1)', ratio: 1.91/1 },
  { id: 'square', label: 'Square (1:1)', ratio: 1 },
  { id: 'tiktok', label: 'Vertical Video (9:16)', ratio: 9/16 },
  { id: 'facebook_cover', label: 'Facebook Cover' },
];

// Helper to extract canvas crop
const getCroppedImg = async (imageSrc, pixelCrop, imgRefElement) => {
  if (!imgRefElement) throw new Error('No image loaded');
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });

  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / imgRefElement.width;
  const scaleY = image.naturalHeight / imgRefElement.height;

  canvas.width = Math.floor(pixelCrop.width * scaleX);
  canvas.height = Math.floor(pixelCrop.height * scaleY);

  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

export const CreatePost = () => {
  const { addPost, publishNow } = useApp();
  const navigate = useNavigate();
  
  const [postMode, setPostMode] = useState('schedule'); // 'now' | 'schedule'
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [media, setMedia] = useState(null); // { url, type, name, rawFile: File|Blob }
  const [formatCategory, setFormatCategory] = useState('general');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduleTimezone, setScheduleTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [isDragging, setIsDragging] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [linkedinAuthorType, setLinkedinAuthorType] = useState('personal');
  const [linkedinPages, setLinkedinPages] = useState([]);
  const [selectedLinkedinOrgId, setSelectedLinkedinOrgId] = useState('');
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinLoadError, setLinkedinLoadError] = useState('');
  const [linkedinPagesLoaded, setLinkedinPagesLoaded] = useState(false);
  const [linkedinAuthorSelectionLocked, setLinkedinAuthorSelectionLocked] = useState(false);
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [isYoutubeShorts, setIsYoutubeShorts] = useState(false);
  const [isReels, setIsReels] = useState(false);

  // Cropper State
  const [srcForCrop, setSrcForCrop] = useState(null);
  const [rawUploadFile, setRawUploadFile] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({});
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(4/5); // Default to IG optimal

  const imgRef = useRef(null);

  const timezoneOptions = useMemo(() => {
    if (typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('timeZone');
    }
    return ['UTC', 'Asia/Manila', 'America/New_York'];
  }, []);

  useEffect(() => {
    const shouldLoadLinkedIn = selectedPlatforms.includes('linkedin');
    if (!shouldLoadLinkedIn || linkedinPagesLoaded || linkedinLoading) {
      return;
    }

    const loadLinkedInPages = async () => {
      setLinkedinLoading(true);
      setLinkedinLoadError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me/linkedin-pages`, {
          headers: {
            ...authHeaders(),
          },
        });

        if (!response.ok) {
          let message = 'Failed to load LinkedIn pages';
          try {
            const payload = await response.json();
            if (payload?.message) message = payload.message;
          } catch (_) {}
          throw new Error(message);
        }

        const payload = await response.json();
        const pages = Array.isArray(payload?.pages) ? payload.pages : [];
        const defaultTarget = payload?.defaultTarget || {};

        setLinkedinPages(pages);
        if (!linkedinAuthorSelectionLocked) {
          setLinkedinAuthorType(defaultTarget.authorType || 'personal');
          if (defaultTarget.organizationId) {
            setSelectedLinkedinOrgId(String(defaultTarget.organizationId));
          } else if (pages.length > 0) {
            setSelectedLinkedinOrgId(String(pages[0].id));
          }
        }
      } catch (error) {
        setLinkedinLoadError(String(error.message || error));
      } finally {
        setLinkedinLoading(false);
        setLinkedinPagesLoaded(true);
      }
    };

    loadLinkedInPages();
  }, [selectedPlatforms, linkedinPagesLoaded, linkedinLoading, linkedinAuthorSelectionLocked]);

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) startFileFlow(file);
  };

  const startFileFlow = (file) => {
    const isImage = file.type.startsWith('image/');
    const url = URL.createObjectURL(file);
    
    if (isImage) {
      setRawUploadFile(file);
      setSrcForCrop(url);
      setCropModalOpen(true);
      setCrop({ unit: '%', width: 90, x: 5, y: 5 });
    } else {
      setMedia({
        url,
        type: 'video',
        name: file.name,
        rawFile: file,
      });
    }
  };

  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect || width / height, width, height),
      width,
      height
    );
    setCrop(newCrop);
    // Also set completedCrop so "Apply" works immediately without user dragging
    const scaleX = e.currentTarget.naturalWidth / width;
    const scaleY = e.currentTarget.naturalHeight / height;
    setCompletedCrop({
      unit: 'px',
      x: (newCrop.x / 100) * width,
      y: (newCrop.y / 100) * height,
      width: (newCrop.width / 100) * width,
      height: (newCrop.height / 100) * height,
    });
  };

  // Recalculate crop box whenever the user clicks a different aspect ratio button
  useEffect(() => {
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    const newCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect || width / height, width, height),
      width,
      height
    );
    setCrop(newCrop);
    setCompletedCrop({
      unit: 'px',
      x: (newCrop.x / 100) * width,
      y: (newCrop.y / 100) * height,
      width: (newCrop.width / 100) * width,
      height: (newCrop.height / 100) * height,
    });
  }, [aspect]);

  const handleApplyCrop = async () => {
    if (!completedCrop || !completedCrop.width || !completedCrop.height || !imgRef.current) {
       // If no interactive crop happened, try falling back to skipping
       return skipCropping();
    }
    
    try {
      const croppedBlob = await getCroppedImg(srcForCrop, completedCrop, imgRef.current);
      const url = URL.createObjectURL(croppedBlob);
      const ext = rawUploadFile.name.split('.').pop() || 'jpg';
      const finalName = rawUploadFile.name.replace(`.${ext}`, '_cropped.jpg');
      const croppedFile = new File([croppedBlob], finalName, { type: 'image/jpeg' });

      setMedia({
        url,
        type: 'image',
        name: finalName,
        rawFile: croppedFile,
      });
      setCropModalOpen(false);
    } catch (err) {
      console.error('Cropper error:', err);
      alert('Failed to crop image.');
    }
  };

  const skipCropping = () => {
    setMedia({
      url: srcForCrop,
      type: 'image',
      name: rawUploadFile.name,
      rawFile: rawUploadFile,
    });
    setCropModalOpen(false);
  };

  const generateAiCaption = () => {
    setAiLoading(true);
    setTimeout(() => {
      setContent("Unlocking the future of social automation! 🚀✨ #SocialSync #Automation #TechTrends");
      setAiLoading(false);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || selectedPlatforms.length === 0) return;
    if (postMode === 'schedule' && (!scheduledDate || !scheduledTime)) return;
    if (
      selectedPlatforms.includes('linkedin') &&
      linkedinAuthorType === 'page' &&
      !selectedLinkedinOrgId
    ) {
      setSubmitError('Select a LinkedIn page when author type is set to Page.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    setUploadProgress(media ? 0 : null);

    try {
      if (postMode === 'now') {
        await publishNow({
          content,
          platforms: selectedPlatforms,
          rawFile: media?.rawFile ?? null,
          formatCategory,
          is_shorts: isYoutubeShorts,
          is_reels: isReels,
          extra_content: selectedPlatforms.includes('youtube') ? {
            title: youtubeTitle || 'Untitled Video',
            is_shorts: isYoutubeShorts
          } : null,
          linkedinOptions: selectedPlatforms.includes('linkedin')
            ? {
                authorType: linkedinAuthorType,
                organizationId:
                  linkedinAuthorType === 'page' ? selectedLinkedinOrgId || null : null,
              }
            : null,
        });
        navigate('/scheduled');
      } else {
        await addPost({
          content,
          platforms: selectedPlatforms,
          scheduledLocal: `${scheduledDate}T${scheduledTime}`,
          scheduleTimezone,
          rawFile: media?.rawFile ?? null,
          formatCategory,
          is_reels: isReels,
          extra_content: selectedPlatforms.includes('youtube') ? {
            title: youtubeTitle || 'Untitled Video',
            is_shorts: isYoutubeShorts
          } : null,
          linkedinOptions: selectedPlatforms.includes('linkedin')
            ? {
                authorType: linkedinAuthorType,
                organizationId:
                  linkedinAuthorType === 'page' ? selectedLinkedinOrgId || null : null,
              }
            : null,
        });
        navigate('/scheduled');
      }

      if (selectedPlatforms.includes('linkedin')) {
        await fetch(`${API_BASE_URL}/api/users/me/linkedin-target`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify({
            author_type: linkedinAuthorType,
            organization_id: linkedinAuthorType === 'page' ? selectedLinkedinOrgId || null : null,
            organization_name:
              linkedinAuthorType === 'page'
                ? linkedinPages.find((page) => String(page.id) === String(selectedLinkedinOrgId))
                    ?.name || null
                : null,
          }),
        }).catch(() => {});
      }
    } catch (error) {
      setSubmitError(String(error.message || error));
      setUploadProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPlatformValid = (platformId) => {
    if (!media) return true;
    const platform = PLATFORMS.find(p => p.id === platformId);
    return platform.allowed.includes(media.type);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Create New Post</h2>
          <p className="text-slate-400 mt-1">Design and schedule your content across platforms.</p>
        </div>
      </div>

      {submitError && (
        <GlassCard className="border-red-500/40 bg-red-500/10">
          <p className="text-red-300 text-sm">{submitError}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div className="space-y-6">
              {/* Post Mode Toggle */}
              <div>
                <label className="text-sm font-medium text-slate-400 mb-3 block">Post Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPostMode('now')}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 font-medium text-sm",
                      postMode === 'now'
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                    )}
                  >
                    <Zap size={16} />
                    Post Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostMode('schedule')}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 font-medium text-sm",
                      postMode === 'schedule'
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                    )}
                  >
                    <Clock size={16} />
                    Schedule
                  </button>
                </div>
                {postMode === 'now' && (
                  <p className="text-xs text-emerald-400/70 mt-2 flex items-center gap-1">
                    <Zap size={10} /> Will publish immediately to connected platforms.
                  </p>
                )}
              </div>

              {/* Platform Selection */}
              <div>
                <label className="text-sm font-medium text-slate-400 mb-3 block">Select Platforms</label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map(platform => {
                    const isValid = isPlatformValid(platform.id) && !platform.comingSoon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    
                    return (
                      <button
                        key={platform.id}
                        onClick={() => isValid && togglePlatform(platform.id)}
                        disabled={!isValid}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200",
                          isSelected 
                            ? "bg-indigo-600/20 border-indigo-500 text-white" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20",
                          !isValid && "opacity-30 cursor-not-allowed grayscale"
                        )}
                      >
                        <platform.icon size={18} className={isSelected ? platform.color : ""} />
                        <span className="font-medium">{platform.name}</span>
                        {platform.comingSoon && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border text-amber-400 border-amber-500/30 bg-amber-500/10">
                            Coming Soon
                          </span>
                         )}
                        {!isValid && <AlertCircle size={14} className="text-red-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedPlatforms.includes('linkedin') && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 space-y-3">
                  <label className="text-sm font-medium text-sky-200 block">
                    LinkedIn Post Author
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLinkedinAuthorSelectionLocked(true);
                        setLinkedinAuthorType('personal');
                      }}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                        linkedinAuthorType === 'personal'
                          ? 'bg-sky-500/20 border-sky-400 text-sky-100'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                      )}
                    >
                      Personal Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLinkedinAuthorSelectionLocked(true);
                        setLinkedinAuthorType('page');
                      }}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                        linkedinAuthorType === 'page'
                          ? 'bg-sky-500/20 border-sky-400 text-sky-100'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                      )}
                    >
                      Business Page
                    </button>
                  </div>

                  {linkedinAuthorType === 'page' && (
                    <div className="space-y-2">
                      <label className="text-xs text-slate-300 block">
                        Select Page You Admin
                      </label>
                      <select
                        className="glass-input w-full"
                        value={selectedLinkedinOrgId}
                        onChange={(e) => setSelectedLinkedinOrgId(e.target.value)}
                        disabled={linkedinLoading}
                      >
                        <option value="">
                          {linkedinLoading ? 'Loading pages...' : 'Select LinkedIn page'}
                        </option>
                        {linkedinPages.map((page) => (
                          <option key={page.id} value={String(page.id)}>
                            {page.name || `Organization ${page.id}`}
                          </option>
                        ))}
                      </select>

                      {linkedinLoadError && (
                        <p className="text-xs text-amber-300">{linkedinLoadError}</p>
                      )}
                      {!linkedinLoading && linkedinPages.length === 0 && !linkedinLoadError && (
                        <p className="text-xs text-amber-300">
                          No admin pages returned. Make sure LinkedIn app has organization scopes and your account is an admin.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* YouTube Specific Options */}
              {selectedPlatforms.includes('youtube') && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                    <Youtube size={16} />
                    YouTube Settings
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 block font-medium">Video Title (Required)</label>
                    <input
                      type="text"
                      className="glass-input w-full"
                      placeholder="e.g. My Amazing Vlog #2024"
                      value={youtubeTitle}
                      onChange={(e) => setYoutubeTitle(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">Upload as YouTube Short</span>
                      <span className="text-[10px] text-slate-400 italic">Appends #Shorts automatically</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsYoutubeShorts(!isYoutubeShorts)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all duration-200 relative",
                        isYoutubeShorts ? "bg-red-500" : "bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200",
                        isYoutubeShorts ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>
              )}

              {/* FB/IG Reels Specific Options */}
              {(selectedPlatforms.includes('facebook') || selectedPlatforms.includes('instagram')) && media?.type === 'video' && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Video size={16} />
                    Reels Settings
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">Post as Reel</span>
                      <span className="text-[10px] text-slate-400 italic">Optimized for vertical short-form video</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReels(!isReels)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all duration-200 relative",
                        isReels ? "bg-indigo-500" : "bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200",
                        isReels ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>
              )}

              {/* Content Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-400">Caption</label>
                  <button 
                    onClick={generateAiCaption}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={14} className={aiLoading ? "animate-pulse" : ""} />
                    {aiLoading ? "Thinking..." : "AI Suggestion"}
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full h-40 glass-input resize-none p-4"
                />
              </div>

              {/* Media Upload */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 transition-all duration-200 flex flex-col items-center justify-center gap-4 cursor-pointer",
                  isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20 bg-white/2",
                  media && "border-indigo-500/50"
                )}
                onClick={() => (!media && document.getElementById('fileInput').click())}
              >
                <input 
                  type="file" 
                  id="fileInput" 
                  className="hidden" 
                  onChange={(e) => startFileFlow(e.target.files[0])}
                  accept="image/*,video/*"
                />
                
                {media ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden group border border-white/5">
                    {media.type === 'video' ? (
                      <video src={media.url} className="w-full h-full object-contain bg-slate-900" />
                    ) : (
                      <img src={media.url} alt="Preview" className="w-full h-full object-contain bg-slate-900" />
                    )}
                    <div className="absolute top-2 left-2 flex gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/20">
                        {media.type === 'video' ? '🎬 Video' : '🖼 Image'}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      {media.type === 'image' && (
                        <Button variant="outline" onClick={(e) => {
                          e.stopPropagation();
                          setSrcForCrop(media.url);
                          setCropModalOpen(true);
                        }}>
                          <CropIcon size={18} /> Re-Crop
                        </Button>
                      )}
                      <Button variant="danger" onClick={(e) => { e.stopPropagation(); setMedia(null); setRawUploadFile(null); }}>
                        <XClose size={18} /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Upload size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">Click or drag media to upload</p>
                      <p className="text-slate-500 text-sm mt-1">Supports images and videos</p>
                      <p className="text-slate-600 text-xs mt-1">Uploaded to Firebase Storage automatically</p>
                    </div>
                  </>
                )}
              </div>

              {/* Format Category - only show when media is selected */}
              {media && (
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Content Category</label>
                  <div className="flex flex-wrap gap-2">
                    {FORMAT_CATEGORIES.map(fc => (
                      <button
                        key={fc.id}
                        onClick={() => setFormatCategory(fc.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200",
                          formatCategory === fc.id
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                        )}
                      >
                        {fc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Scheduling — only show when in schedule mode */}
          {postMode === 'schedule' && <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-400" />
              Schedule Post
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                type="date" 
                label="Date" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <Input 
                type="time" 
                label="Time" 
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Timezone</label>
              <select
                className="glass-input w-full"
                value={scheduleTimezone}
                onChange={(e) => setScheduleTimezone(e.target.value)}
              >
                {timezoneOptions.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Scheduled time will be interpreted in this timezone and stored in UTC.
              </p>
            </div>
          </GlassCard>}
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Live Preview</h3>
          <div className="sticky top-28">
            <GlassCard className="p-0 overflow-hidden border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
              {/* Mock Mobile Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700" />
                <div>
                  <div className="h-2.5 w-24 bg-slate-700 rounded-full mb-1" />
                  <div className="h-2 w-16 bg-slate-800 rounded-full" />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-4">
                <p className={cn("text-sm text-slate-200 whitespace-pre-wrap", !content && "text-slate-600 italic")}>
                  {content || "Your caption will appear here..."}
                </p>
                {media && (
                  <div className="rounded-xl overflow-hidden bg-slate-900 border border-white/5 flex items-center justify-center">
                    {media.type === 'video' ? (
                      <video src={media.url} className="w-full h-full object-contain max-h-[300px]" autoPlay muted loop />
                    ) : (
                      <img src={media.url} alt="Preview" className="w-full h-full object-contain max-h-[300px]" />
                    )}
                  </div>
                )}
              </div>

              {/* Mock Actions */}
              <div className="p-4 border-t border-white/5 flex justify-between">
                <div className="flex gap-4">
                  <div className="w-5 h-5 rounded bg-slate-800" />
                  <div className="w-5 h-5 rounded bg-slate-800" />
                  <div className="w-5 h-5 rounded bg-slate-800" />
                </div>
                <div className="w-5 h-5 rounded bg-slate-800" />
              </div>
            </GlassCard>

            <div className="mt-8 space-y-4">
              {/* Upload Progress */}
              {uploadProgress !== null && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      {uploadProgress < 100 ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} className="text-emerald-400" />
                      )}
                      {uploadProgress < 100 ? `Uploading to Firebase... ${uploadProgress}%` : 'Upload complete!'}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button 
                className={cn(
                  "w-full py-4 text-lg",
                  postMode === 'now' && "bg-emerald-600 hover:bg-emerald-500"
                )}
                onClick={handleSubmit}
                disabled={
                  !content || 
                  selectedPlatforms.length === 0 || 
                  (postMode === 'schedule' && (!scheduledDate || !scheduledTime)) ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    {uploadProgress !== null && uploadProgress < 100 ? 'Uploading...' : postMode === 'now' ? 'Publishing...' : 'Scheduling...'}
                  </span>
                ) : postMode === 'now' ? (
                  <span className="flex items-center gap-2"><Zap size={18} /> Post Now</span>
                ) : (
                  <span className="flex items-center gap-2"><Clock size={18} /> Schedule Post</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      <AnimatePresence>
        {cropModalOpen && srcForCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl flex flex-col"
              style={{ maxHeight: '95vh' }}
            >
              <GlassCard className="p-6 border-indigo-500/30 relative flex flex-col" style={{ maxHeight: '95vh' }}>
                <button onClick={() => setCropModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
                  <XClose size={24} />
                </button>
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2 flex-shrink-0">
                  <CropIcon size={20} className="text-indigo-400" />
                  Format Image for Network
                </h3>
                <p className="text-slate-400 text-xs mb-3 flex-shrink-0">Instagram requires aspect ratios between 4:5 (portrait) and 1.91:1 (landscape). Drag the box to select your crop.</p>
                
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 flex-shrink-0">
                  {FORMAT_CATEGORIES.filter(f => f.ratio).map(fc => (
                    <button
                      key={fc.id}
                      onClick={() => setAspect(fc.ratio)}
                      className={cn(
                        "px-3 py-1.5 rounded border text-xs font-medium whitespace-nowrap",
                        aspect === fc.ratio ? "bg-indigo-500 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-slate-400"
                      )}
                    >
                      {fc.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setAspect(undefined)}
                    className={cn(
                      "px-3 py-1.5 rounded border text-xs font-medium whitespace-nowrap",
                      aspect === undefined ? "bg-indigo-500 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    Free / Original
                  </button>
                </div>

                {/* Image crop area — takes all remaining space */}
                <div className="flex-1 min-h-0 bg-slate-950 rounded-xl border border-white/5 overflow-auto flex items-center justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    style={{ maxWidth: '100%' }}
                  >
                    <img
                      src={srcForCrop}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      style={{ maxWidth: '100%', maxHeight: 'calc(95vh - 220px)', display: 'block', objectFit: 'contain' }}
                    />
                  </ReactCrop>
                </div>

                <div className="flex gap-4 mt-4 flex-shrink-0">
                  <Button variant="outline" className="flex-none" onClick={skipCropping}>
                    Skip Cropping
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={handleApplyCrop} disabled={!completedCrop?.width || !completedCrop?.height}>
                    Apply Crop & Format
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
