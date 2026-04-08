import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Zap, 
  ArrowUpRight,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Play,
  PlusSquare
} from 'lucide-react';
import { GlassCard, Button } from '../components/UI';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <GlassCard className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className={cn("p-3 rounded-xl bg-opacity-10", color)}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
        <ArrowUpRight size={16} />
        {change}
      </div>
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  </GlassCard>
);

const PlatformIcon = ({ platform }) => {
  switch (platform) {
    case 'facebook': return <Facebook size={16} className="text-blue-500" />;
    case 'instagram': return <Instagram size={16} className="text-pink-500" />;
    case 'tiktok': return <Play size={16} className="text-white" />;
    case 'twitter': return <Twitter size={16} className="text-sky-400" />;
    default: return null;
  }
};

export const Dashboard = () => {
  const { scheduledPosts, workflows } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Welcome back, Jerico</h2>
          <p className="text-slate-400 mt-1">Here's what's happening with your socials today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/workflows')}>
            <Zap size={18} />
            New Workflow
          </Button>
          <Button onClick={() => navigate('/create')}>
            <PlusSquare size={18} />
            Create Post
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Reach" 
          value="124.8k" 
          change="+12.5%" 
          icon={TrendingUp} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Engagement" 
          value="8.2k" 
          change="+5.2%" 
          icon={Users} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Scheduled" 
          value={scheduledPosts.length} 
          change="+2" 
          icon={CalendarIcon} 
          color="bg-pink-500" 
        />
        <StatCard 
          title="Active Workflows" 
          value={workflows.filter(w => w.active).length} 
          change="0" 
          icon={Zap} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Scheduled Posts */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Upcoming Posts</h3>
            <Button variant="ghost" className="text-xs" onClick={() => navigate('/scheduled')}>View All</Button>
          </div>
          <div className="space-y-4">
            {scheduledPosts.map(post => (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                  {post.media ? (
                    <img src={post.media} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-indigo-400 font-bold text-xl">{post.content[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{post.content}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={12} />
                      {new Date(post.scheduledFor).toLocaleDateString()} at {new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex gap-1">
                      {post.platforms.map(p => <PlatformIcon key={p} platform={p} />)}
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="px-3 py-1.5 text-xs">Edit</Button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Active Workflows */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Active Workflows</h3>
            <Button variant="ghost" className="text-xs" onClick={() => navigate('/workflows')}>Manage</Button>
          </div>
          <div className="space-y-4">
            {workflows.map(workflow => (
              <div key={workflow.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{workflow.name}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    workflow.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-600"
                  )} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {workflow.triggers.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {t}
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-500 self-center">→</span>
                  {workflow.actions.map(a => (
                    <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

