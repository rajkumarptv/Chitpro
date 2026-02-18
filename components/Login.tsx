
import React, { useState } from 'react';
import { Smartphone, LogIn, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { AppData, UserRole, AuthState } from '../types';

interface LoginProps {
  data: AppData;
  onLogin: (auth: AuthState) => void;
  onImportFile: (file: File) => void;
}

export const Login: React.FC<LoginProps> = ({ data, onLogin }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const sanitizedPhone = phone.replace(/\D/g, '');
      const adminPhone = data.config.adminPhone.replace(/\D/g, '');
      
      if (sanitizedPhone && sanitizedPhone === adminPhone) {
        onLogin({ isAuthenticated: true, role: UserRole.ADMIN, phoneNumber: phone, userName: 'Administrator' });
        return;
      }

      const member = data.members.find(m => m.phone.replace(/\D/g, '') === sanitizedPhone);
      if (member) {
        onLogin({ isAuthenticated: true, role: UserRole.MEMBER, phoneNumber: phone, userName: member.name });
        return;
      }

      setError('Number not recognized. Ensure the Admin has added your number to the group.');
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-200 p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-indigo-100 mb-6">
            C
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">ChitTrack Pro</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Cloud Synced Financials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Mobile Number</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="tel"
                required
                placeholder="Enter 10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:font-bold placeholder:text-slate-300"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-3 p-4 bg-rose-50 rounded-2xl text-rose-600 text-xs font-bold border border-rose-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading || phone.length < 10}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3 text-sm uppercase tracking-widest"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Secure Cloud Login</span>
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100">
           <div className="flex items-center space-x-2 text-slate-400 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-widest">Live Firebase Connection</p>
           </div>
        </div>
      </div>
      <p className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">© 2024 Cloud Edition V8</p>
    </div>
  );
};
