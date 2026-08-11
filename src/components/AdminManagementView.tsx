import React, { useState } from 'react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  ShieldCheck,
  Users,
  Key,
  Database,
  Download,
  Upload,
  CheckCircle2,
  UserPlus,
  Edit3,
  Trash2,
  Search,
  X,
  Save,
  Building,
  Mail,
  User,
  Shield,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { UserProfile, FullLessonPlan } from '../types';

interface AdminManagementViewProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
  onSwitchUser: (user: UserProfile) => void;
  lessonPlans: FullLessonPlan[];
  onImportPlans: (plans: FullLessonPlan[]) => void;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  currentUser,
  users,
  onUpdateUsers,
  onSwitchUser,
  lessonPlans,
  onImportPlans,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Add / Edit Teacher
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('123456');
  const [formSchool, setFormSchool] = useState<string>('');
  const [formRole, setFormRole] = useState<'Admin' | 'Giáo viên'>('Giáo viên');
  const [formAvatar, setFormAvatar] = useState<string>('');

  const isAdmin = currentUser.role === 'Admin' || currentUser.email.trim().toLowerCase() === 'pqhacker@gmail.com';

  const openAddModal = () => {
    if (!isAdmin) {
      alert('Chỉ tài khoản Admin mới có quyền thêm người dùng mới!');
      return;
    }
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormSchool('Trường THCS Bình San');
    setFormRole('Giáo viên');
    setFormAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    if (!isAdmin) {
      alert('Chỉ tài khoản Admin mới có quyền chỉnh sửa thông tin người dùng!');
      return;
    }
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(user.password || '');
    setFormSchool(user.school);
    setFormRole(user.role);
    setFormAvatar(user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Chỉ tài khoản Admin mới có quyền thêm hoặc chỉnh sửa người dùng!');
      return;
    }

    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPass = formPassword.trim();

    if (!formName.trim() || !cleanEmail || !cleanPass) {
      alert('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.');
      return;
    }

    // Email Uniqueness Check across the system
    const existingUser = users.find(
      (u) => u.email.trim().toLowerCase() === cleanEmail && (!editingUser || u.id !== editingUser.id)
    );

    if (existingUser) {
      alert(`Địa chỉ email "${formEmail.trim()}" đã được sử dụng bởi người dùng "${existingUser.name}". Mỗi tài khoản phải sử dụng một địa chỉ email duy nhất trên toàn hệ thống!`);
      return;
    }

    if (editingUser) {
      // Update existing teacher
      const updatedList = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formName.trim(),
              email: cleanEmail,
              password: cleanPass,
              school: formSchool.trim(),
              role: formRole,
              avatarUrl: formAvatar,
            }
          : u
      );
      onUpdateUsers(updatedList);
      alert(`Đã cập nhật thông tin người dùng "${formName}" thành công!`);
    } else {
      // Add new teacher
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: formName.trim(),
        email: cleanEmail,
        password: cleanPass,
        school: formSchool.trim() || 'Trường THCS Bình San',
        role: formRole,
        avatarUrl: formAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };
      onUpdateUsers([...users, newUser]);
      alert(`Đã thêm thành công tài khoản "${formName}" (${cleanEmail})!`);
    }

    setSearchQuery('');
    setIsModalOpen(false);
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (!isAdmin) {
      alert('Chỉ tài khoản Admin mới có quyền xóa người dùng!');
      return;
    }
    if (user.id === currentUser.id) {
      alert('Bạn không thể xóa tài khoản Quản trị viên đang đăng nhập!');
      return;
    }
    setUserToDelete(user);
  };

  const executeDeleteUser = () => {
    if (!userToDelete) return;
    onUpdateUsers(users.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);
  };

  const handleBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lessonPlans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Sao_Luu_He_Thong_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportPlans(imported);
          alert(`Đã khôi phục dữ liệu hệ thống thành công (${imported.length} bài dạy)!`);
        }
      } catch (err) {
        alert('Lỗi khôi phục dữ liệu.');
      }
    };
    reader.readAsText(file);
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.school || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Quản Trị Hệ Thống AI Lesson Planner Pro
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý người dùng, phân quyền giáo viên, kết nối API Gemini &amp; Sao lưu/Khôi phục cơ sở dữ liệu.
          </p>
        </div>
        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Hệ Thống Hoạt Động Mượt Mà
        </span>
      </div>

      {/* Gemini API Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-500" /> Trạng Thái Kết Nối Google Gemini API
        </h2>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div className="space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">Mô hình AI: Google Gemini 3.6 Flash</p>
            <p className="text-slate-500">
              Khóa API Key được quản lý bảo mật phía Server-Side qua môi trường Secrets Panel AI Studio.
            </p>
          </div>
          <span className="bg-emerald-500 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase">
            Đã Kết Nối
          </span>
        </div>
      </div>

      {/* User Roles & Teacher Management Table - Only Visible to Admin */}
      {isAdmin ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" /> Quản Lý Danh Sách &amp; Phân Quyền Giáo Viên
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Thêm mới, sửa đổi thông tin hoặc xóa giáo viên khỏi hệ thống trường học
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Thêm Giáo Viên Mới
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm giáo viên theo tên, email, trường..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Teachers Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-3 px-4">Giáo viên</th>
                  <th className="py-3 px-4">Email liên hệ</th>
                  <th className="py-3 px-4">Mật khẩu Admin cấp</th>
                  <th className="py-3 px-4">Đơn vị trường</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Không tìm thấy giáo viên nào phù hợp với từ khóa.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div>{u.name}</div>
                          {u.id === currentUser.id && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                              (Đang đăng nhập)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-bold border border-slate-200 dark:border-slate-700">
                          <Lock className="w-3 h-3 text-amber-500" />
                          {u.password || '123456'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.school}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'Admin'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              onSwitchUser(u);
                              alert(`Đã chuyển đổi sang tài khoản: "${u.name}" (${u.email})!`);
                            }}
                            title="Chuyển đăng nhập sang giáo viên này"
                            className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 transition-colors"
                          >
                            <LogIn className="w-3.5 h-3.5" /> Chuyển TK
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            title="Sửa thông tin & Mật khẩu giáo viên"
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={u.id === currentUser.id}
                            title={u.id === currentUser.id ? 'Không thể xóa chính bạn' : 'Xóa giáo viên'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.id === currentUser.id
                                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-6 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-sm">Quyền Quản Lý Danh Sách Người Dùng Bị Hạn Chế</p>
            <p className="mt-0.5">Chỉ có tài khoản Admin mới có quyền xem danh sách, quản lý và thay đổi thông tin của các tài khoản User trên hệ thống.</p>
          </div>
        </div>
      )}

      {/* Backup & Restore Data */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" /> Sao Lưu &amp; Khôi Phục Dữ Liệu
        </h2>
        <p className="text-xs text-slate-500">
          Xuất file sao lưu toàn bộ dữ liệu Kế hoạch bài dạy để lưu trữ an toàn hoặc khôi phục lại khi cần thiết.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleBackup}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4" /> Sao Lưu Toàn Bộ Dữ Liệu (JSON)
          </button>

          <label className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors">
            <Upload className="w-4 h-4" /> Khôi Phục Dữ Liệu
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* MODAL ADD / EDIT TEACHER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                {editingUser ? 'Sửa Thông Tin Giáo Viên' : 'Thêm Giáo Viên Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Họ Và Tên Giáo Viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Minh..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Liên Hệ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="minh.nguyen@nguyendu.edu.vn"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Mật Khẩu Đăng Nhập Do Admin Cấp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Mật khẩu này được giáo viên dùng để đăng nhập / chuyển đổi tài khoản.
                </p>
              </div>

              {/* School */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Đơn Vị Trường
                </label>
                <input
                  type="text"
                  value={formSchool}
                  onChange={(e) => setFormSchool(e.target.value)}
                  placeholder="Trường THCS Nguyễn Du"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Vai Trò System Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormRole('Giáo viên')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      formRole === 'Giáo viên'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Giáo Viên
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRole('Admin')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      formRole === 'Admin'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Quản Trị Viên (Admin)
                  </button>
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Đường Dẫn Ảnh Đại Diện (Avatar URL)
                </label>
                <input
                  type="text"
                  value={formAvatar}
                  onChange={(e) => setFormAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition-all"
                >
                  <Save className="w-4 h-4" /> Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete User Modal */}
      <ConfirmDeleteModal
        isOpen={!!userToDelete}
        title="Xác nhận xóa tài khoản giáo viên"
        message={`Thầy cô có chắc chắn muốn xóa tài khoản "${userToDelete?.name}" (${userToDelete?.email}) khỏi hệ thống?`}
        confirmLabel="Xóa Tài Khoản"
        onConfirm={executeDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
