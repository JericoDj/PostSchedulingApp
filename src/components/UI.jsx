import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';

export const GlassCard = ({ children, className, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("glass-card rounded-2xl p-6", className)}
    {...props}
  >
    {children}
  </motion.div>
);

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-white/10 hover:bg-white/20 text-white",
    outline: "border border-white/10 hover:bg-white/5 text-white",
    ghost: "hover:bg-white/5 text-slate-400 hover:text-white",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20"
  };

  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, error, className, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>}
    <input
      className={cn(
        "glass-input w-full",
        error && "border-red-500/50 focus:ring-red-500/20",
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
  </div>
);
