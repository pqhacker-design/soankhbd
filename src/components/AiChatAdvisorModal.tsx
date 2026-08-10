import React, { useState } from 'react';
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { getApiKeyHeaders } from '../utils/apiHelper';

export const AiChatAdvisorModal: React.FC = () => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'ai'; text: string; time: string }[]
  >([
    {
      sender: 'ai',
      text: 'Xin chào thầy/cô! Tôi là Trợ lý AI Chuyên môn Kế hoạch bài dạy GDPT 2018. Thầy/cô cần tư vấn về phương pháp dạy học, cấu trúc 5 hoạt động theo Công văn 5512/3535 hay câu hỏi phân hóa đối tượng học sinh ạ?',
      time: 'Vừa xong',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsg = input.trim();
    const newHistory = [...messages, { sender: 'user' as const, text: userMsg, time: 'Vừa xong' }];
    setMessages(newHistory);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat-reference', {
        method: 'POST',
        headers: getApiKeyHeaders(),
        body: JSON.stringify({ query: userMsg, history: messages }),
      });
      const data = await response.json();
      if (data.answer) {
        setMessages([
          ...newHistory,
          { sender: 'ai', text: data.answer, time: 'Vừa xong' },
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages([
        ...newHistory,
        {
          sender: 'ai',
          text: 'Rất tiếc, đã xảy ra lỗi khi kết nối với máy chủ AI. Vui lòng thử lại sau.',
          time: 'Vừa xong',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Trợ Lý Tư Vấn Chuyên Môn Sư Phạm AI
              <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                GDPT 2018
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Giải đáp mọi thắc mắc về công văn BGD&amp;ĐT, phương pháp dạy học tích cực &amp; kỹ thuật đặt câu hỏi.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Box */}
      <div className="h-96 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                AI
              </div>
            )}
            <div
              className={`max-w-xl p-3.5 rounded-2xl leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex gap-2 items-center text-slate-400 text-xs italic">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
            AI đang phân tích và soạn câu trả lời...
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập thắc mắc môn học, công văn BGD&ĐT hoặc nhờ gợi ý hoạt động dạy học..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> Gửi Hỏi AI
        </button>
      </form>
    </div>
  );
};
