import { LogOut, Boxes, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { email, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow">
              <Boxes className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold text-slate-900 tracking-tight">
              Stock<span className="text-brand-600">wise</span>
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Role badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
              {role === 'ADMIN' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              ) : (
                <User className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {role}
              </span>
            </div>

            {/* Email */}
            {email && (
              <span className="hidden md:block text-sm text-slate-500 font-medium max-w-[160px] truncate">
                {email}
              </span>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600
                hover:bg-red-50 hover:text-red-600 transition-colors duration-150 border border-transparent
                hover:border-red-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
