import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MoreVertical,
  Facebook, 
  Instagram, 
  Play, 
  Linkedin,
  Youtube,
  Edit3,
  Trash2,
  Filter,
  Plus,
  X as XClose,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

const PlatformIcon = ({ platform }) => {
  switch (platform) {
    case 'facebook': return <Facebook size={14} className="text-blue-500" />;
    case 'instagram': return <Instagram size={14} className="text-pink-500" />;
    case 'tiktok': return <Play size={14} className="text-white" />;
    case 'x': return <span className="text-slate-100 text-[10px] font-bold">X</span>;
    case 'linkedin': return <Linkedin size={14} className="text-sky-400" />;
    case 'youtube': return <Youtube size={14} className="text-red-400" />;
    case 'pinterest': return <span className="text-red-500 text-[10px] font-bold">P</span>;
    default: return null;
  }
};

export const ScheduledPosts = () => {
  const { scheduledPosts, refreshScheduledPosts, deletePost, updatePost } = useApp();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit / Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editTimezone, setEditTimezone] = useState('UTC');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        await refreshScheduledPosts();
      } catch (loadError) {
        if (isMounted) {
          setError(String(loadError.message || loadError));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [refreshScheduledPosts]);

  const filteredPosts = useMemo(() => {
    if (filter === 'all') return scheduledPosts;
    return scheduledPosts.filter((post) => post.platforms.includes(filter));
  }, [filter, scheduledPosts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled post?')) return;
    setDeletingId(id);
    try {
      await deletePost(id);
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (post) => {
    setEditPost(post);
    setEditContent(post.content || '');
    setEditTimezone(post.timezone || 'UTC');

    const dt = post.scheduledLocal ? post.scheduledLocal.split('T') : ['', ''];
    if (post.scheduledLocal && dt.length === 2) {
      setEditDate(dt[0]);
      setEditTime(dt[1].slice(0, 5));
    } else if (post.scheduledFor) {
      const d = new Date(post.scheduledFor);
      setEditDate(d.toISOString().split('T')[0]);
      setEditTime(d.toTimeString().slice(0, 5));
    } else {
      setEditDate('');
      setEditTime('');
    }
    setEditError('');
  };

  const saveEdit = async () => {
    setEditError('');
    setIsSavingEdit(true);
    try {
      const localString = editDate && editTime ? `${editDate}T${editTime}` : null;
      await updatePost(editPost.id, {
        content: editContent,
        scheduledLocal: localString,
        scheduleTimezone: editTimezone,
      });
      setEditPost(null);
    } catch (err) {
      setEditError(String(err.message || err));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const renderStatusPill = (status) => {
    if (status === 'completed') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 size={10} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Completed</span>
        </div>
      );
    }
    if (status === 'failed') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <AlertCircle size={10} className="text-red-400" />
          <span className="text-[10px] font-bold text-red-400 uppercase">Failed</span>
        </div>
      );
    }
    if (status === 'processing') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold text-amber-400 uppercase">Processing</span>
        </div>
      );
    }
    // Default Scheduled state
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-[10px] font-bold text-indigo-400 uppercase">Scheduled</span>
      </div>
    );
  };

  const getStatusColorClass = (status) => {
    if (status === 'completed') return 'text-emerald-400';
    if (status === 'failed') return 'text-red-400';
    if (status === 'processing') return 'text-amber-400';
    return 'text-indigo-400';
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Scheduled Content</h2>
          <p className="text-slate-400 mt-1">Manage your upcoming posts and publication schedule.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select 
              className="glass-input pl-10 pr-8 py-2 appearance-none bg-white/5"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="x">X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="pinterest">Pinterest</option>
            </select>
          </div>
          <Button onClick={() => window.location.href = '/create'}>
            <Plus size={18} />
            Schedule New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <GlassCard className="py-12 text-center text-slate-300">Loading scheduled posts...</GlassCard>
        ) : error ? (
          <GlassCard className="py-12 text-center text-red-300 border-red-500/40 bg-red-500/10">
            {error}
          </GlassCard>
        ) : filteredPosts.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-4">
              <CalendarIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-white">No posts scheduled</h3>
            <p className="text-slate-500 mt-2 max-w-xs">Start by creating your first post to see it in your schedule.</p>
            <Button className="mt-6" onClick={() => window.location.href = '/create'}>Create Post</Button>
          </GlassCard>
        ) : (
          filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className={cn("flex items-center gap-6 p-4 hover:border-indigo-500/30 group", deletingId === post.id && 'opacity-50 pointer-events-none')}>
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                  <span className="text-xs font-bold uppercase">{new Date(post.scheduledFor).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-xl font-black">{new Date(post.scheduledFor).getDate()}</span>
                </div>

                {/* Media Preview */}
                <div className="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-white/5">
                  {post.media ? (
                    <img src={post.media} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Edit3 size={24} />
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-1">
                      {post.platforms.map(p => (
                        <div key={p} className="p-1 rounded bg-white/5 border border-white/5">
                          <PlatformIcon platform={p} />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">•</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p className="text-white font-medium truncate pr-4">{post.content}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Timezone: {post.timezone || 'UTC'}
                    {post.scheduledLocal ? ` • Local: ${post.scheduledLocal}` : ''}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", getStatusColorClass(post.status))}>Status</span>
                    {renderStatusPill(post.status)}
                  </div>
                  
                  <div className="flex gap-2">
                    {post.status !== 'completed' && post.status !== 'processing' && (
                       <Button variant="outline" className="p-2" onClick={() => openEdit(post)}>
                         <Edit3 size={18} />
                       </Button>
                    )}
                    <Button variant="ghost" className="p-2 text-slate-500 hover:text-red-400" onClick={() => handleDelete(post.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg"
            >
              <GlassCard className="p-6 border-indigo-500/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Edit3 size={20} className="text-indigo-400" />
                    Edit Scheduled Post
                  </h3>
                  <button 
                    onClick={() => setEditPost(null)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <XClose size={20} />
                  </button>
                </div>

                {editError && (
                  <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                    {editError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Caption</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-32 glass-input resize-none p-3 text-sm flex-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      type="date" 
                      label="Date" 
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                    <Input 
                      type="time" 
                      label="Time" 
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 mt-2 block">Timezone</label>
                    <select
                      className="glass-input w-full"
                      value={editTimezone}
                      onChange={(e) => setEditTimezone(e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Manila">Asia/Manila</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                      {/* Note: Can append from Intl.supportedValuesOf if needed */}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setEditPost(null)}
                    disabled={isSavingEdit}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1" 
                    onClick={saveEdit}
                    disabled={isSavingEdit}
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
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
