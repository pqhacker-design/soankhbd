import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  X,
  AlertTriangle,
  Info,
  UserCheck,
} from 'lucide-react';
import { getApiKeyHeaders, getUserApiKey, setUserApiKey, clearUserApiKey } from '../utils/apiHelper';
import { UserProfile } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
  currentUser?: UserProfile;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  currentUser,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existing = getUserApiKey(currentUser?.id);
      setApiKeyInput(existing);
      if (existing) {
        setStatusMessage({
          type: 'success',
          text: `Đã lưu Gemini API Key cá nhân cho tài khoản ${currentUser?.name || ''}.`,
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: `Chưa có API Key. Vui lòng nhập Gemini API Key cá nhân của ${currentUser?.name || 'thầy/cô'} để sử dụng tính năng AI.`,
        });
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = apiKeyInput.trim();

    if (!cleanKey) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập mã Gemini API Key trước khi kiểm tra & lưu.',
      });
      return;
    }

    setIsTesting(true);
    setStatusMessage({ type: 'info', text: 'Đang kết nối kiểm tra Gemini API Key...' });

    let isValid = false;
    let errorMessage = '';

    // First attempt: Server API endpoint
    try {
      const res = await fetch('/api/validate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': cleanKey,
        },
        body: JSON.stringify({ userApiKey: cleanKey }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          isValid = true;
        } else {
          errorMessage = data.error || 'API Key không hợp lệ.';
        }
      } else {
        try {
          const data = await res.json();
          errorMessage = data.error || 'Mã API Key không hợp lệ.';
        } catch {
          // Response is not JSON (e.g. 404 HTML on static Vercel host)
        }
      }
    } catch (serverErr) {
      console.warn('Server endpoint error, falling back to direct client check:', serverErr);
    }

    // Second attempt: Direct client-side validation fallback
    if (!isValid && !errorMessage) {
      try {
        const { validateApiKeyDirect } = await import('../utils/clientGeminiService');
        const clientOk = await validateApiKeyDirect(cleanKey);
        if (clientOk) {
          isValid = true;
        }
      } catch (clientErr: any) {
        console.error('Direct client validation error:', clientErr);
        errorMessage = clientErr.message || 'Mã API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.';
      }
    }

    if (isValid) {
      setUserApiKey(cleanKey, currentUser?.id);
      setStatusMessage({
        type: 'success',
        text: `Xác thực thành công! Gemini API Key cá nhân đã được lưu riêng cho tài khoản "${currentUser?.name || ''}".`,
      });
      if (onSaveSuccess) onSaveSuccess();
    } else {
      setStatusMessage({
        type: 'error',
        text: errorMessage || 'API Key không hợp lệ. Vui lòng kiểm tra lại mã đã dán.',
      });
    }

    setIsTesting(false);
  };

  const handleClearKey = () => {
    clearUserApiKey(currentUser?.id);
    setApiKeyInput('');
    setStatusMessage({
      type: 'info',
      text: `Đã xóa API Key thành công cho tài khoản ${currentUser?.name || ''}.`,
    });
  };

  const hasConfiguredKey = !!getUserApiKey(currentUser?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Cấu Hình Gemini API Key Cá Nhân
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Khóa API riêng theo từng tài khoản giáo viên để sinh giáo án &amp; tư vấn AI
            </p>
          </div>
        </div>

        {/* Current User Badge */}
        {currentUser && (
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-2xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 font-medium">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Đang cấu hình API Key cho: <strong className="font-bold">{currentUser.name}</strong> ({currentUser.school})
            </span>
          </div>
        )}

        {/* Status Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}
          >
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            {statusMessage.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
            <span className="leading-relaxed font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 text-xs space-y-2.5 text-slate-700 dark:text-slate-300">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Các bước lấy Gemini API Key miễn phí:
          </div>
          <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            <li>
              Bấm vào đường dẫn:{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700"
              >
                Google AI Studio Key Page <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Đăng nhập bằng tài khoản Google (Gmail) cá nhân hoặc trường học.</li>
            <li>Nhấn nút <strong>Create API key</strong> &amp; sao chép mã khóa (bắt đầu bằng <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-[10px]">AIzaSy...</code>).</li>
            <li>Dán mã khóa vào ô bên dưới rồi nhấn <strong>Kiểm Tra &amp; Lưu API Key</strong>.</li>
          </ol>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mã Gemini API Key Cá Nhân <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Dán AIzaSy... vào đây"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Khóa API Key được bảo mật lưu riêng cho tài khoản này và không dùng chung với tài khoản khác.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {hasConfiguredKey ? (
              <button
                type="button"
                onClick={handleClearKey}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                Xóa Key của tài khoản này
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Hủy / Để Sau
              </button>
              <button
                type="submit"
                disabled={isTesting || !apiKeyInput.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Kiểm Tra &amp; Lưu API Key
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
