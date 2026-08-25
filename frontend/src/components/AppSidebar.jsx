import { createElement, useState } from 'react';
import { BarChart3, FileText, LogOut, Menu, Settings, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI, clearAuthData } from '../api';
import breedifyLogo from '../assets/breedify_logo.png';

const links = [
  { to: '/dashboard', label: 'Image prediction', icon: BarChart3 },
  { to: '/records', label: 'Records', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const AppSidebar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } finally {
      clearAuthData();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] md:flex">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-white border-r border-[#E5E7EB] transition-transform duration-300`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <img src={breedifyLogo} alt="Logo" className="h-14 w-14 object-contain" />
              <span className="text-lg font-semibold tracking-tight text-[#173B2D]">Breedify</span>
            </Link>
            <button onClick={() => setOpen(false)} className="md:hidden text-[#6B7280]" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === to ? 'bg-[#F0FDF4] text-[#166534]' : 'text-[#374151] hover:bg-[#F9FAFB]'}`}
              >
                {createElement(Icon, { size: 18 })}
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#E5E7EB]">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3.5 py-2.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg text-sm font-medium transition-colors w-full">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />}
      <main className="flex-1 min-w-0">
        <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 md:hidden p-2 bg-white border border-[#E5E7EB] text-[#374151]" aria-label="Open menu">
          <Menu size={20} />
        </button>
        {children}
      </main>
    </div>
  );
};

export default AppSidebar;
