import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MoreVertical, 
  Facebook, 
  Instagram, 
  Play, 
  Twitter,
  Edit3,
  Trash2,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

const PlatformIcon = ({ platform }) => {
  switch (platform) {
    case 'facebook': return <Facebook size={14} className="text-blue-500" />;
    case 'instagram': return <Instagram size={14} className="text-pink-500" />;
    case 'tiktok': return <Play size={14} className="text-white" />;
    case 'twitter': return <Twitter size={14} className="text-sky-400" />;
    default: return null;
  }
};

export const ScheduledPosts = () => {
  const { scheduledPosts } = useApp();
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-8">
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
            </select>
          </div>
          <Button onClick={() => window.location.href = '/create'}>
            <Plus size={18} />
            Schedule New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scheduledPosts.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-4">
              <CalendarIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-white">No posts scheduled</h3>
            <p className="text-slate-500 mt-2 max-w-xs">Start by creating your first post to see it in your schedule.</p>
            <Button className="mt-6" onClick={() => window.location.href = '/create'}>Create Post</Button>
          </GlassCard>
        ) : (
          scheduledPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="flex items-center gap-6 p-4 hover:border-indigo-500/30 group">
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
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Status</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">Scheduled</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="p-2">
                      <Edit3 size={18} />
                    </Button>
                    <Button variant="ghost" className="p-2 text-slate-500 hover:text-red-400">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
