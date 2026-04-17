import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
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
  AlertCircle
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const XBrandIcon = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M18.901 2H21.99l-6.75 7.714L23.176 22h-6.211l-4.864-6.488L6.423 22H3.332l7.219-8.249L.823 2h6.37l4.397 5.893L18.901 2Zm-1.084 18.146h1.711L6.276 3.758H4.44l13.377 16.388Z" />
  </svg>
);

const PinterestIcon = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 2a10 10 0 0 0-3.64 19.32c-.05-.82-.1-2.08.02-2.98.11-.77.73-4.92.73-4.92s-.19-.38-.19-.94c0-.89.52-1.55 1.16-1.55.55 0 .82.41.82.91 0 .55-.35 1.38-.53 2.15-.15.65.32 1.18.96 1.18 1.14 0 2.01-1.2 2.01-2.93 0-1.53-1.1-2.6-2.67-2.6-1.82 0-2.89 1.36-2.89 2.77 0 .55.21 1.14.48 1.46.05.06.06.12.04.19-.04.21-.14.65-.16.74-.03.12-.09.15-.22.09-.83-.39-1.35-1.62-1.35-2.61 0-2.12 1.54-4.07 4.44-4.07 2.33 0 4.14 1.66 4.14 3.89 0 2.32-1.46 4.19-3.48 4.19-.68 0-1.31-.35-1.53-.78l-.42 1.6c-.15.58-.56 1.3-.83 1.74A10 10 0 1 0 12 2Z" />
  </svg>
);

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500', allowed: ['image', 'video', 'text'] },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', allowed: ['image', 'video'] },
  { id: 'tiktok', name: 'TikTok', icon: Play, color: 'text-white', allowed: ['video'] },
  { id: 'x', name: 'X', icon: XBrandIcon, color: 'text-slate-100', allowed: ['image', 'video', 'text'] },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-sky-400', allowed: ['image', 'video', 'text'] },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-400', allowed: ['video'] },
  { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: 'text-red-500', allowed: ['image', 'video'], comingSoon: true },
];

export const CreatePost = () => {
  const { addPost } = useApp();
  const navigate = useNavigate();
  
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [media, setMedia] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduleTimezone, setScheduleTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const timezoneOptions = useMemo(() => {
    if (typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('timeZone');
    }

    return ['UTC', 'Asia/Manila', 'America/New_York'];
  }, []);

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setMedia({
        url: e.target.result,
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const generateAiCaption = () => {
    setAiLoading(true);
    // Mock AI generation
    setTimeout(() => {
      setContent("Unlocking the future of social automation! 🚀✨ #SocialSync #Automation #TechTrends");
      setAiLoading(false);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || selectedPlatforms.length === 0) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      await addPost({
        content,
        platforms: selectedPlatforms,
        scheduledLocal: `${scheduledDate}T${scheduledTime}`,
        scheduleTimezone,
        type: media ? media.type : 'text',
        media: media?.url,
      });
      navigate('/scheduled');
    } catch (error) {
      setSubmitError(String(error.message || error));
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
    <div className="max-w-5xl mx-auto space-y-8">
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
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input 
                  type="file" 
                  id="fileInput" 
                  className="hidden" 
                  onChange={(e) => handleFile(e.target.files[0])}
                  accept="image/*,video/*"
                />
                
                {media ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                    {media.type === 'video' ? (
                      <video src={media.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="danger" onClick={(e) => { e.stopPropagation(); setMedia(null); }}>
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
                      <p className="text-slate-500 text-sm mt-1">Supports images and videos up to 50MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Scheduling */}
          <GlassCard>
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
          </GlassCard>
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
                  <div className="rounded-xl overflow-hidden bg-slate-900 aspect-square">
                    {media.type === 'video' ? (
                      <video src={media.url} className="w-full h-full object-cover" autoPlay muted loop />
                    ) : (
                      <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
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
              <Button 
                className="w-full py-4 text-lg" 
                onClick={handleSubmit}
                disabled={!content || selectedPlatforms.length === 0 || !scheduledDate || !scheduledTime || isSubmitting}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
              </Button>
              <Button variant="outline" className="w-full">Save as Draft</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
