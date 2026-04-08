import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Facebook, Instagram, Play, Linkedin, ExternalLink } from 'lucide-react';
import { GlassCard, Button } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://scheduling-api-xi.vercel.app';
const FRONTEND_BASE_URL = window.location.origin;

const PLATFORM_CONNECTIONS = [
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Connect your Facebook account to publish and schedule posts.',
    icon: Facebook,
    color: 'text-blue-400',
    connectUrl: `${API_BASE_URL}/api/oauth/facebook?redirect=${encodeURIComponent(
      `${FRONTEND_BASE_URL}/oauth/callback`
    )}`,
    available: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Set up Instagram publishing and media scheduling.',
    icon: Instagram,
    color: 'text-pink-400',
    connectUrl: '#',
    available: false,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Enable TikTok video scheduling and posting workflow.',
    icon: Play,
    color: 'text-white',
    connectUrl: '#',
    available: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect LinkedIn for company and profile post scheduling.',
    icon: Linkedin,
    color: 'text-sky-400',
    connectUrl: '#',
    available: false,
  },
];

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="text-indigo-400" size={30} />
            Settings
          </h2>
          <p className="text-slate-400 mt-1">Manage your profile and social account connections.</p>
        </div>
      </div>

      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4">Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Name</p>
            <p className="text-white font-semibold mt-1">{user?.name || 'N/A'}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
            <p className="text-white font-semibold mt-1">{user?.email || 'N/A'}</p>
          </div>
        </div>
      </GlassCard>

      <div>
        <h3 className="text-lg font-bold text-white mb-4">Social Connections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLATFORM_CONNECTIONS.map((platform, index) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <GlassCard className="h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <platform.icon size={22} className={platform.color} />
                    <h4 className="text-white text-lg font-semibold">{platform.name}</h4>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border ${
                      platform.available
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    }`}
                  >
                    {platform.available ? 'Available' : 'Coming Soon'}
                  </span>
                </div>

                <p className="text-slate-400 text-sm mt-3 flex-1">{platform.description}</p>

                {platform.available ? (
                  <a href={platform.connectUrl} className="mt-5">
                    <Button className="w-full">
                      Connect {platform.name}
                      <ExternalLink size={16} />
                    </Button>
                  </a>
                ) : (
                  <Button className="w-full mt-5" variant="outline" disabled>
                    Connect {platform.name}
                  </Button>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
