import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Facebook, Instagram, Play, Linkedin, ExternalLink, AtSign, Youtube } from 'lucide-react';
import { GlassCard, Button } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const isLocalHost = (host) => {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
};

const enforceHttpsForPublicUrl = (urlString) => {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol === 'http:' && !isLocalHost(parsed.hostname)) {
      parsed.protocol = 'https:';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch (_) {
    return urlString;
  }
};

const API_BASE_URL = enforceHttpsForPublicUrl(
  import.meta.env.VITE_API_BASE_URL || 'https://scheduling-api-xi.vercel.app'
);
const FRONTEND_BASE_URL = window.location.origin;

const XIcon = ({ size = 22, className = '' }) => (
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

const PinterestIcon = ({ size = 22, className = '' }) => (
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
    connectUrl: `${API_BASE_URL}/api/oauth/instagram?redirect=${encodeURIComponent(
      `${FRONTEND_BASE_URL}/oauth/callback`
    )}`,
    available: true,
  },
  {
    id: 'threads',
    name: 'Threads',
    description: 'Connect Threads to publish and schedule conversation-first updates.',
    icon: AtSign,
    color: 'text-zinc-200',
    connectUrl: `${API_BASE_URL}/api/oauth/threads?redirect=${encodeURIComponent(
      `${FRONTEND_BASE_URL}/oauth/callback`
    )}`,
    available: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Enable TikTok video scheduling and posting workflow.',
    icon: Play,
    color: 'text-white',
    connectUrl: `${API_BASE_URL}/api/oauth/tiktok?redirect=${encodeURIComponent(
      `${FRONTEND_BASE_URL}/oauth/callback`
    )}`,
    available: true,
  },
  {
    id: 'x',
    name: 'X',
    description: 'Connect X to publish tweets and schedule thread-ready updates.',
    icon: XIcon,
    color: 'text-slate-200',
    connectUrl: `${API_BASE_URL}/api/oauth/x?redirect=${encodeURIComponent(
      `${FRONTEND_BASE_URL}/oauth/callback`
    )}`,
    available: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect LinkedIn for company and profile post scheduling.',
    icon: Linkedin,
    color: 'text-sky-400',
    connectUrl: `${API_BASE_URL}/api/oauth/linkedin?redirect=${encodeURIComponent(
      `${FRONTEND_BASE_URL}/oauth/callback`
    )}`,
    available: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Enable YouTube account connection for upload and publishing flows.',
    icon: Youtube,
    color: 'text-red-400',
    connectUrl: `${API_BASE_URL}/api/oauth/youtube?redirect=${encodeURIComponent(
      `${FRONTEND_BASE_URL}/oauth/callback`
    )}`,
    available: true,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Connect Pinterest to schedule and publish visual pin content.',
    icon: PinterestIcon,
    color: 'text-red-500',
    connectUrl: `${API_BASE_URL}/api/oauth/pinterest?redirect=${encodeURIComponent(
      `${FRONTEND_BASE_URL}/oauth/callback`
    )}`,
    available: true,
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
                  <a
                    href={platform.connectUrl}
                    className="mt-5"
                    onClick={() => {
                      console.log('[SOCIAL CONNECT CLICK]', {
                        provider: platform.id,
                        connectUrl: platform.connectUrl,
                      });
                    }}
                  >
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
