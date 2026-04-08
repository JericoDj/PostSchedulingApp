import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../components/UI';

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] py-20 px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
          <ArrowLeft size={18} />
          Back
        </Button>

        <GlassCard className="p-12 space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-400">
              <Shield size={32} />
            </div>
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          </div>

          <div className="space-y-6 text-slate-400 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes your name, email address, and social media account tokens required for automation.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, including automating your social media posts and providing analytics.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">3. Data Security</h2>
              <p>We implement enterprise-grade security measures to protect your data. Your social media tokens are encrypted and stored securely.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">4. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal data at any time through your account settings or by contacting us.</p>
            </section>
          </div>

          <div className="pt-8 border-t border-white/5 text-sm text-slate-500">
            Last updated: March 26, 2026
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
