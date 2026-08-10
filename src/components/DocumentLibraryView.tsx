import React, { useState, useEffect } from 'react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Sparkles,
  MessageSquareText,
  FileCheck,
  Download,
  BookOpen,
} from 'lucide-react';
import { ReferenceDocument } from '../types';

export const DocumentLibraryView: React.FC = () => {
  const [documents, setDocuments] = useState<ReferenceDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [docToDeleteId, setDocToDeleteId] = useState<string | null>(null);

  // New Doc Form
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Khac');
  const [contentText, setContentText] = useState<string>('');

  // AI Q&A Search
  const [query, setQuery] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contentText) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung văn bản');
      return;
    }
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          filename: `${title.replace(/\s+/g, '_')}.pdf`,
          contentText,
          snippet: contentText.slice(0, 150) + '...',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDocuments([data.document, ...documents]);
        setShowUploadModal(false);
        setTitle('');
        setContentText('');
        alert('Tải lên và lập chỉ mục văn bản mới thành công!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string) => {
    setDocToDeleteId(id);
  };

  const executeDelete = async () => {
    if (!docToDeleteId) return;
    try {
      await fetch(`/api/documents/${docToDeleteId}`, { method: 'DELETE' });
      setDocuments(documents.filter((d) => d.id !== docToDeleteId));
    } catch (e) {
      console.error(e);
    } finally {
      setDocToDeleteId(null);
    }
  };

  const handleAskAI = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setAnswer('');
    try {
      const res = await fetch('/api/chat-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.answer) {
        setAnswer(data.answer);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Thư Viện Văn Bản Chỉ Đạo &amp; Công Văn BGD&amp;ĐT
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kho tài liệu chính thống (CV 5512, CV 3535, Thông tư 22, TT 27) được AI truy xuất thông minh để căn cứ soạn bài.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Upload className="w-4 h-4" /> Tải Lên Văn Bản Mới
        </button>
      </div>

      {/* RAG Q&A Search Card */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          Hỏi Đáp AI Trực Tiếp Theo Văn Bản Đã Tải Lên
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="Hỏi AI về quy định (Ví dụ: Khung bài dạy Tiểu học theo CV 3535 gồm những hoạt động nào?)..."
            className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            onClick={handleAskAI}
            disabled={isSearching}
            className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? 'Đang tra cứu...' : 'Hỏi AI'}
          </button>
        </div>

        {answer && (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-xs leading-relaxed space-y-2 animate-fadeIn">
            <div className="font-bold text-teal-300 flex items-center gap-1.5">
              <MessageSquareText className="w-4 h-4" /> Câu Trả Lời Từ AI Tham Chiếu Văn Bản BGD&amp;ĐT:
            </div>
            <p className="text-slate-100 whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {doc.category}
                </span>
                <span className="text-[10px] text-slate-400">{doc.uploadDate}</span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {doc.snippet}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">{doc.fileSize}</span>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors text-xs"
                title="Xóa văn bản"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tải Lên Văn Bản Chỉ Đạo Mới
            </h3>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Tên / Tiêu Đề Văn Bản</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Công văn hướng dẫn sinh hoạt chuyên môn..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Loại Văn Bản</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="CongVan5512">Công văn 5512</option>
                  <option value="CongVan3535">Công văn 3535 (Tiểu học)</option>
                  <option value="ThongTu22">Thông tư 22 (Đánh giá)</option>
                  <option value="ThongTu27">Thông tư 27 (Đánh giá TH)</option>
                  <option value="Khac">Tài liệu tham khảo khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Nội Dung Hoặc Trích Đoạn Văn Bản</label>
                <textarea
                  rows={5}
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Dán nội dung chính của văn bản hướng dẫn vào đây để AI lập chỉ mục..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md"
                >
                  Lưu &amp; Lập Chỉ Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Document Modal */}
      <ConfirmDeleteModal
        isOpen={!!docToDeleteId}
        title="Xác nhận xóa văn bản"
        message="Thầy cô có chắc chắn muốn xóa văn bản chỉ mục này khỏi thư viện tài liệu?"
        confirmLabel="Xóa Văn Bản"
        onConfirm={executeDelete}
        onCancel={() => setDocToDeleteId(null)}
      />
    </div>
  );
};
