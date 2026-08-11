import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  UserCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  X,
  LogIn,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface SwitchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  usersList: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
}

export const SwitchUserModal: React.FC<SwitchUserModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  usersList,
  onSwitchUser,
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    const matchedUser = usersList.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    if (!matchedUser) {
      setErrorMessage('Tài khoản Email không tồn tại trong hệ thống trường học. Vui lòng kiểm tra lại hoặc liên hệ Admin.');
      return;
    }

    const userPassword = matchedUser.password || '123456';

    if (userPassword !== cleanPass) {
      setErrorMessage('Mật khẩu không chính xác! Mật khẩu do Admin cấp (Mật khẩu mặc định thử nghiệm: 123456).');
      return;
    }

    // Success
    setSuccessMessage(`Đăng nhập thành công! Đã chuyển sang tài khoản "${matchedUser.name}" (${matchedUser.role}).`);
    setTimeout(() => {
      onSwitchUser(matchedUser);
      onClose();
      setSuccessMessage(null);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Đăng Nhập / Chuyển Tài Khoản
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nhập Email &amp; Mật khẩu do Admin cấp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Indicator */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                {currentUser.name}
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.2 rounded">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">{currentUser.email}</div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">{currentUser.school}</div>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <UserCheck className="w-3 h-3" /> Đang dùng
          </span>
        </div>

        {/* Quick Select Teacher List */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Chọn nhanh tài khoản giáo viên trong hệ thống:
          </label>
          <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {usersList.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    setPassword(u.password || '123456');
                  }}
                  className={`p-2 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.school}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium shrink-0 ml-1">
                    [Chọn]
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmitLogin} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Địa Chỉ Email Giáo Viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap.email@nguyendu.edu.vn"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Mật Khẩu (Do Admin cấp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (Mặc định: 123456)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              💡 Mật khẩu do Ban Quản trị cấp cho từng giáo viên. Mật khẩu mặc định là <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-blue-600">123456</code>.
            </p>
          </div>

          {/* Error / Success alert messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" /> Đăng Nhập / Chuyển Tài Khoản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
