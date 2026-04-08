import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Plus, 
  ArrowRight, 
  Clock, 
  UserPlus, 
  MessageSquare, 
  Share2, 
  Bell,
  Trash2,
  Play,
  CheckCircle2
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

const TRIGGER_TYPES = [
  { id: 'follower', name: 'New Follower', icon: UserPlus, color: 'text-emerald-400' },
  { id: 'time', name: 'Time Based', icon: Clock, color: 'text-indigo-400' },
  { id: 'mention', name: 'Mention', icon: MessageSquare, color: 'text-pink-400' },
];

const ACTION_TYPES = [
  { id: 'dm', name: 'Send DM', icon: MessageSquare, color: 'text-indigo-400' },
  { id: 'post', name: 'Publish Post', icon: Share2, color: 'text-purple-400' },
  { id: 'notify', name: 'Notification', icon: Bell, color: 'text-amber-400' },
];

export const WorkflowBuilder = () => {
  const { workflows, addWorkflow } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    triggers: [],
    actions: []
  });

  const handleAddTrigger = (trigger) => {
    if (!newWorkflow.triggers.includes(trigger)) {
      setNewWorkflow(prev => ({ ...prev, triggers: [...prev.triggers, trigger] }));
    }
  };

  const handleAddAction = (action) => {
    if (!newWorkflow.actions.includes(action)) {
      setNewWorkflow(prev => ({ ...prev, actions: [...prev.actions, action] }));
    }
  };

  const handleSave = () => {
    if (!newWorkflow.name || newWorkflow.triggers.length === 0 || newWorkflow.actions.length === 0) return;
    addWorkflow({ ...newWorkflow, active: true });
    setNewWorkflow({ name: '', triggers: [], actions: [] });
    setIsCreating(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Automation Workflows</h2>
          <p className="text-slate-400 mt-1">Create smart triggers and actions to automate your social presence.</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus size={18} />
            Create Workflow
          </Button>
        )}
      </div>

      {isCreating ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <GlassCard className="border-indigo-500/30">
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1 max-w-md">
                <Input 
                  placeholder="Workflow Name (e.g. Auto-Reply to Mentions)" 
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg font-bold bg-transparent border-none focus:ring-0 px-0"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button onClick={handleSave}>Activate Workflow</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Triggers */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">1. Choose Triggers</h4>
                <div className="space-y-3">
                  {TRIGGER_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleAddTrigger(type.name)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                        newWorkflow.triggers.includes(type.name)
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                      )}
                    >
                      <type.icon size={20} className={type.color} />
                      <span className="font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Connector */}
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-px h-12 bg-gradient-to-b from-indigo-500 to-purple-500" />
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                  <ArrowRight size={20} className="text-white" />
                </div>
                <div className="w-px h-12 bg-gradient-to-b from-indigo-500 to-purple-500" />
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">2. Define Actions</h4>
                <div className="space-y-3">
                  {ACTION_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleAddAction(type.name)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                        newWorkflow.actions.includes(type.name)
                          ? "bg-purple-600/20 border-purple-500 text-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                      )}
                    >
                      <type.icon size={20} className={type.color} />
                      <span className="font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-12 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {newWorkflow.triggers.map((t, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold">T</div>
                  ))}
                </div>
                <p className="text-sm text-slate-300">
                  When <span className="text-indigo-400 font-bold">{newWorkflow.triggers.join(', ') || '...'}</span> happens, 
                  then <span className="text-purple-400 font-bold">{newWorkflow.actions.join(', ') || '...'}</span>.
                </p>
              </div>
              <div className="flex gap-2">
                {newWorkflow.triggers.length > 0 && (
                  <Button variant="ghost" className="text-xs" onClick={() => setNewWorkflow(prev => ({ ...prev, triggers: [], actions: [] }))}>
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflows.map(workflow => (
            <GlassCard key={workflow.id} className="group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-lg bg-opacity-10",
                    workflow.active ? "bg-indigo-500 text-indigo-400" : "bg-slate-500 text-slate-400"
                  )}>
                    <Zap size={20} fill={workflow.active ? "currentColor" : "none"} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{workflow.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Last triggered 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-200",
                    workflow.active ? "bg-indigo-600" : "bg-slate-700"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-200",
                      workflow.active ? "left-6" : "left-1"
                    )} />
                  </button>
                  <Button variant="ghost" className="p-2 text-slate-500 hover:text-red-400">
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-16">Trigger</span>
                  <div className="flex flex-wrap gap-2">
                    {workflow.triggers.map(t => (
                      <span key={t} className="text-xs px-3 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-16">Action</span>
                  <div className="flex flex-wrap gap-2">
                    {workflow.actions.map(a => (
                      <span key={a} className="text-xs px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Play size={12} />
                    1.2k runs
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 size={12} />
                    99.8% success
                  </div>
                </div>
                <Button variant="outline" className="text-xs py-1.5">View Logs</Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
