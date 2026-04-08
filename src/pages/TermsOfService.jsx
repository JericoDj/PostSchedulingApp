import React from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '../components/UI';

export const TermsOfService = () => {
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
            <div className="p-3 rounded-xl bg-purple-600/10 text-purple-400">
              <FileText size={32} />
            </div>
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          </div>

          <div className="space-y-6 text-slate-400 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
              <p>By accessing or using SocialSync AI, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">2. Use License</h2>
              <p>Permission is granted to temporarily use our services for personal or commercial social media automation, subject to the limitations of your chosen plan.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">3. Disclaimer</h2>
              <p>Our services are provided "as is". We make no warranties, expressed or implied, regarding the success of your social media campaigns or platform uptime.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">4. Limitations</h2>
              <p>In no event shall SocialSync AI be liable for any damages arising out of the use or inability to use our services.</p>
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
