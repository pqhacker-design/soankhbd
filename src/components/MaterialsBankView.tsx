import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  HelpCircle,
  Tv,
  Download,
  Copy,
  RefreshCw,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { GeneratedMaterials } from '../types';
import { getApiKeyHeaders } from '../utils/apiHelper';
import { MathText } from './MathText';

export const MaterialsBankView: React.FC = () => {
  const [subject, setSubject] = useState<string>('Ngữ văn');
  const [grade, setGrade] = useState<string>('Lớp 8');
  const [lessonTitle, setLessonTitle] = useState<string>('Hịch tướng sĩ - Tác giả Trần Quốc Tuấn');
  const [promptType, setPromptType] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [materials, setMaterials] = useState<GeneratedMaterials | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-materials', {
        method: 'POST',
        headers: getApiKeyHeaders(),
        body: JSON.stringify({
          lessonTitle,
          subject,
          grade,
          textbook: 'Kết nối tri thức với cuộc sống',
          promptType,
        }),
      });
      const data = await response.json();
      if (data.success && data.materials) {
        setMaterials(data.materials);
      } else {
        alert('Lỗi khởi tạo học liệu: ' + (data.error || 'Vui lòng thử lại.'));
      }
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối máy chủ AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            Ngân Hàng Học Liệu, Quiz Trắc Nghiệm &amp; PowerPoint
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Công cụ AI tự động tạo Phiếu học tập, Bộ câu hỏi kiểm tra đánh giá theo 4 mức độ nhận thức và Dàn ý Slide giảng dạy.
          </p>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <input
            type="text"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="Tên bài học..."
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Môn học..."
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            AI Sinh Học Liệu
          </button>
        </div>
      </div>

      {/* Generated Outputs */}
      {materials && (
        <div className="space-y-6">
          {/* Worksheets */}
          {materials.worksheets && materials.worksheets.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Phiếu Học Tập Mẫu
              </h3>
              {materials.worksheets.map((ws) => (
                <div key={ws.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300"><MathText text={ws.title} /></h4>
                  <p className="text-slate-500 italic"><MathText text={ws.instructions} /></p>
                  <div className="space-y-2 pt-2">
                    {ws.questions.map((q) => (
                      <div key={q.id} className="space-y-1">
                        <div className="font-semibold flex items-start gap-1">
                          <span>Câu {q.number}:</span>
                          <MathText text={q.text} />
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                          <MathText text={q.spaceForAnswer} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quiz Questions */}
          {materials.quizQuestions && materials.quizQuestions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" /> Ngân Hàng Câu Hỏi Trắc Nghiệm Củng Cố
              </h3>
              <div className="space-y-4">
                {materials.quizQuestions.map((quiz, idx) => (
                  <div key={quiz.id || idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-start gap-1">
                        <span>Câu {idx + 1}:</span>
                        <MathText text={quiz.question} />
                      </div>
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-bold">{quiz.level}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {quiz.options.map((opt, optIdx) => (
                        <div key={optIdx} className={`p-2 rounded-xl border ${optIdx === quiz.correctAnswer ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 font-semibold' : 'bg-white dark:bg-slate-800 border-slate-200'}`}>
                          <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                          <MathText text={opt} />
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1"><span className="font-semibold text-emerald-600">Giải thích:</span> <MathText text={quiz.explanation} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide PPT Outline */}
          {materials.pptSlides && materials.pptSlides.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-teal-600" /> Dàn Ý Bài Trình Chiếu PowerPoint
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {materials.pptSlides.map((slide) => (
                  <div key={slide.slideNumber} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <h4 className="font-bold text-teal-700 dark:text-teal-300">{slide.title}</h4>
                    <ul className="list-disc pl-4 text-slate-600 dark:text-slate-300 space-y-1">
                      {slide.mainPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2"><span className="font-bold">Ghi chú GV:</span> {slide.speakerNotes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
