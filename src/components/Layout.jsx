import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusSquare, 
  Calendar, 
  Zap, 
  Settings, 
  LogOut,
  Bell,
  Search,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const SidebarLink = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      isActive 
        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
        : "text-slate-400 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon size={20} className={cn("transition-transform duration-200 group-hover:scale-110")} />
    <span className="font-medium">{children}</span>
  </NavLink>
);

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const avatarSrc =
    user?.avatar_url || user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=SocialSync';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/5 flex flex-col p-4 fixed h-full z-50">
        <div className="flex items-center gap-3 px-4 py-6 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            SocialSync
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
          <SidebarLink to="/create" icon={PlusSquare}>Create Post</SidebarLink>
          <SidebarLink to="/scheduled" icon={Calendar}>Scheduled</SidebarLink>
          <SidebarLink to="/workflows" icon={Zap}>Workflows</SidebarLink>
          <SidebarLink to="/settings" icon={Settings}>Settings</SidebarLink>
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Navbar */}
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search posts, workflows..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 border-2 border-[#030712] rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                3
              </span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">Pro Plan</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 p-0.5">
                <img 
                  src={avatarSrc}
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
