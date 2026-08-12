import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  School,
  Building2,
} from 'lucide-react';

interface LoginScreenProps {
  usersList: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ usersList, onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
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
      setErrorMessage('Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại địa chỉ email.');
      return;
    }

    const userPassword = matchedUser.password || '123456';

    if (userPassword !== cleanPass) {
      setErrorMessage('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      return;
    }

    // Success
    setSuccessMessage(`Đăng nhập thành công! Đang tải dữ liệu cho "${matchedUser.name}"...`);
    setTimeout(() => {
      onLoginSuccess(matchedUser);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B1120] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Hero Section */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#244F70] via-[#1D3F5A] to-[#12293C] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg font-bold">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Hệ Thống Trợ Lý AI
                </span>
                <h1 className="text-xl font-extrabold tracking-tight">AI Lesson Planner</h1>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="text-2xl font-bold leading-tight">
                Soạn Bài Dạy Nhanh Chuẩn CV 5512 &amp; 3535
              </h2>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mô hình AI Gemini 3.6 Flash cực nhanh</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Đồng bộ dữ liệu đa thiết bị qua Cloud Firestore</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <School className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Dành cho Giáo viên phổ thông (GDPT 2018)</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 text-[11px] text-slate-400">
            © 2026 AI Lesson Planner PRO • 0913117321
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Đăng Nhập Tài Khoản
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Nhập địa chỉ Email &amp; Mật khẩu tài khoản giáo viên
                </p>
              </div>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                Xác thực Giáo viên
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Địa Chỉ Email Giáo Viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nhap.email@truong.edu.vn"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Mật Khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu của bạn"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn font-medium">
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

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#244F70] hover:bg-[#193B55] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4" /> Đăng Nhập Hệ Thống AI
              </button>
            </form>
          </div>

          <div className="text-center pt-2 text-slate-400 text-[11px]">
            Hệ thống hỗ trợ đồng bộ tự động dữ liệu qua Firestore.
          </div>
        </div>
      </div>
    </div>
  );
};
