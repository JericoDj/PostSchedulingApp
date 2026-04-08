import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  ShieldCheck, 
  Globe, 
  Cpu,
  Instagram,
  Facebook,
  Twitter,
  Play,
  Sparkles
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, GlassCard } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const Nav = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-[#030712]/50 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
          <Zap className="text-white fill-white" size={24} />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          SocialSync
        </span>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
        <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
        <a href="#about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">About</a>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        ) : (
          <>
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <Button onClick={() => navigate('/login')}>Get Started</Button>
          </>
        )}
      </div>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <GlassCard className="p-8 border-white/5 hover:border-indigo-500/30 transition-all group">
    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </GlassCard>
);

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] selection:bg-indigo-500/30">
      <Nav />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles size={14} className="animate-pulse" />
              AI-Powered Social Automation
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8">
              Automate Your Socials <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                With Intelligence.
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              SocialSync AI helps you schedule, automate, and optimize your content across all major platforms using advanced AI workflows.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="px-8 py-4 text-lg" onClick={() => navigate('/login')}>
                Start Free Trial
                <ArrowRight size={20} />
              </Button>
              <Button variant="outline" className="px-8 py-4 text-lg">
                Watch Demo
                <Play size={20} fill="currentColor" />
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full -z-10" />
            <div className="glass-panel rounded-3xl p-4 border-white/10 shadow-2xl overflow-hidden">
              <img 
                src="https://picsum.photos/seed/dashboard/1200/800" 
                alt="Dashboard Preview" 
                className="rounded-2xl w-full object-cover shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to scale</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Powerful features designed to save you hours of manual work every single day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Cpu}
              title="AI Caption Engine"
              description="Generate engaging, platform-optimized captions in seconds using our advanced language models."
            />
            <FeatureCard 
              icon={Zap}
              title="Smart Workflows"
              description="Create complex automation chains that trigger based on events, time, or user interactions."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Advanced Analytics"
              description="Deep dive into your performance with cross-platform engagement metrics and growth tracking."
            />
            <FeatureCard 
              icon={Globe}
              title="Multi-Platform"
              description="Seamlessly post to Instagram, Facebook, TikTok, and Twitter from a single, unified interface."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Secure & Reliable"
              description="Enterprise-grade security for your social accounts with encrypted token storage and safe API calls."
            />
            <FeatureCard 
              icon={CheckCircle2}
              title="Visual Scheduler"
              description="Plan your entire month's content in minutes with our intuitive drag-and-drop calendar."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-12">Trusted by 10,000+ creators and brands</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-white text-2xl font-bold"><Instagram size={32} /> Instagram</div>
            <div className="flex items-center gap-2 text-white text-2xl font-bold"><Facebook size={32} /> Facebook</div>
            <div className="flex items-center gap-2 text-white text-2xl font-bold"><Twitter size={32} /> Twitter</div>
            <div className="flex items-center gap-2 text-white text-2xl font-bold"><Play size={32} /> TikTok</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 text-center border-indigo-500/30 bg-indigo-600/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <h2 className="text-4xl font-bold text-white mb-6">Ready to automate your growth?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Join thousands of creators who are scaling their presence with SocialSync AI.</p>
            <Button className="px-10 py-4 text-lg" onClick={() => navigate('/login')}>
              Get Started for Free
              <ArrowRight size={20} />
            </Button>
            <p className="text-xs text-slate-500 mt-6">No credit card required • 14-day free trial</p>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white fill-white" size={18} />
            </div>
            <span className="text-lg font-bold text-white">SocialSync</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link to="/privacy" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-white transition-colors text-sm">Terms of Service</Link>
            <Link to="/deletion" className="text-slate-500 hover:text-white transition-colors text-sm">Data Deletion</Link>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Facebook size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};
