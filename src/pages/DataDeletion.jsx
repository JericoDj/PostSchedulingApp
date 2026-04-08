import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, Input } from '../components/UI';

export const DataDeletion = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#030712] py-20 px-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
          <ArrowLeft size={18} />
          Back
        </Button>

        <GlassCard className="p-12">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={40} />
              </div>
              <h1 className="text-3xl font-bold text-white">Request Received</h1>
              <p className="text-slate-400">
                Your request to delete data associated with <strong>{email}</strong> has been received. 
                We will process this within 30 days and send a confirmation email.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">Return Home</Button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-red-600/10 text-red-400">
                  <Trash2 size={32} />
                </div>
                <h1 className="text-3xl font-bold text-white">Data Deletion</h1>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                <p className="text-sm text-amber-200/80">
                  Warning: This action is permanent. Once your data is deleted, it cannot be recovered. 
                  This includes your account, scheduled posts, and automation workflows.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Account Email" 
                  type="email" 
                  placeholder="Enter your account email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    By submitting this request, you authorize SocialSync AI to permanently remove all personal data 
                    and social media tokens associated with this email address.
                  </p>
                  <Button variant="danger" className="w-full py-4 text-lg" type="submit">
                    Confirm Deletion Request
                  </Button>
                </div>
              </form>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
