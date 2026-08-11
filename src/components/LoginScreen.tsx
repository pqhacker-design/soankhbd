import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  GraduationCap,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  School,
  UserCheck,
  Building2,
} from 'lucide-react';

interface LoginScreenProps {
  usersList: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ usersList, onLoginSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(usersList[0]?.id || '');
  const [email, setEmail] = useState<string>(usersList[0]?.email || '');
  const [password, setPassword] = useState<string>('123456');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectQuickUser = (user: UserProfile) => {
    setSelectedUserId(user.id);
    setEmail(user.email);
    setPassword(user.password || '123456');
    setErrorMessage(null);
  };

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
      setErrorMessage('Email không tồn tại trong danh sách giáo viên. Vui lòng kiểm tra lại hoặc liên hệ Ban Quản Trị.');
      return;
    }

    const userPassword = matchedUser.password || '123456';

    if (userPassword !== cleanPass) {
      setErrorMessage('Mật khẩu không chính xác. Mặc định thử nghiệm là 123456.');
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
              <p className="text-xs text-slate-300 leading-relaxed">
                Đồng bộ giáo án, đề kiểm tra, phiếu học tập và học liệu cá nhân hóa đám mây theo từng tài khoản giáo viên.
              </p>
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
            © 2026 AI Lesson Planner PRO • Phiên bản đồng bộ đám mây
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
                  Chọn tài khoản giáo viên hoặc nhập Email &amp; Mật khẩu
                </p>
              </div>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                Xác thực Giáo viên
              </span>
            </div>

            {/* Quick Demo Accounts Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Chọn Nhanh Tài Khoản Thử Nghiệm:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {usersList.slice(0, 4).map((u) => {
                  const isSelected = selectedUserId === u.id || email.toLowerCase() === u.email.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => handleSelectQuickUser(u)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-600"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate flex items-center justify-between">
                          <span className="truncate">{u.name}</span>
                          {isSelected && <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {u.role} • {u.school || 'THPT Nguyễn Du'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
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
                  placeholder="nhap.email@nguyendu.edu.vn"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Mật Khẩu (Do Admin cấp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu mặc định: 123456"
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
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Mật khẩu dùng thử nghiệm mặc định cho tất cả giáo viên: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-blue-600">123456</code>
                </p>
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
            Hệ thống hỗ trợ đồng bộ tự động dữ liệu giáo án giữa các máy tính &amp; trình duyệt qua Firestore.
          </div>
        </div>
      </div>
    </div>
  );
};
