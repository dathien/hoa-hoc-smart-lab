import React, { useState } from 'react';
import { useChemStore } from '../../services/store';
import { MessageSquare, Copy, Check, AlertCircle, History, Sparkles } from 'lucide-react';

export const TeacherZaloMessenger: React.FC = () => {
  const { students, classes, submissions, exams, zaloLogs, logZaloMessage } = useChemStore();

  const [selectedClassId, setSelectedClassId] = useState<string>('class_11a1');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('HS11015');
  const [messageType, setMessageType] = useState<'SCORE' | 'PROGRESS' | 'REMINDER' | 'PRAISE'>('SCORE');
  const [copied, setCopied] = useState<boolean>(false);

  // Filter students
  const classStudents = students.filter(
    (s) => selectedClassId === 'all' || s.classId === selectedClassId
  );
  const currentStudent = students.find((s) => s.id === selectedStudentId) || classStudents[0];

  // Find PUBLISHED scores for this student (NEVER use hidden scores!)
  const publishedSubmissions = submissions.filter(
    (sub) => sub.studentId === currentStudent?.id && sub.publishStatus === 'PUBLISHED'
  );
  const latestPublished = publishedSubmissions[0];

  // Template generators strictly <= 150 characters
  const generateTemplate = (type: typeof messageType) => {
    if (!currentStudent) return '';
    const name = currentStudent.fullName;

    if (type === 'SCORE') {
      if (latestPublished) {
        return `TB ChemPro: Em ${name} dat ${latestPublished.finalScore ?? latestPublished.autoGradedScore}d bai ${latestPublished.examTitle.slice(0, 25)}. Phu huynh xem chi tiet tai so diem.`;
      } else {
        return `TB ChemPro: Em ${name} da hoan thanh bai kiem tra Hoa hoc. Diem so se duoc gui den quy phu huynh ngay sau khi duyet.`;
      }
    } else if (type === 'PROGRESS') {
      return `TB ChemPro: Em ${name} tham gia on tap tich cuc, da hoan thanh 100% bai tap tuan nay. Kinh bao phu huynh.`;
    } else if (type === 'REMINDER') {
      return `Nhac nho: Em ${name} chua nop bai tap Hoa hoc tuan 6 (han chot 23h59 toi nay). Nho phu huynh nhac nho em.`;
    } else {
      return `Khen ngoi: Em ${name} co tien bo vuot bac trong mon Hoa hoc tuan qua, hoan thanh xuat sac bai thuc hanh.`;
    }
  };

  const [customText, setCustomText] = useState<string>(() => generateTemplate('SCORE'));

  // Update text when student or template type changes
  const handleSelectType = (t: typeof messageType) => {
    setMessageType(t);
    setCustomText(generateTemplate(t));
  };

  const handleSelectStudent = (sId: string) => {
    setSelectedStudentId(sId);
    setTimeout(() => {
      setCustomText(generateTemplate(messageType));
    }, 10);
  };

  const charCount = customText.length;
  const isOverLimit = charCount > 150;

  const handleCopyAndSave = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // Save to message log
    if (currentStudent) {
      logZaloMessage({
        studentId: currentStudent.id,
        studentName: currentStudent.fullName,
        parentPhone: currentStudent.parentPhone || '0987654321',
        category: messageType,
        content: customText,
        charCount,
        teacherId: 'user_teacher',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Trợ Lý Soạn Tin Nhắn Phụ Huynh (Zalo / SMS Chuẩn Hóa)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Tự động trích xuất thông tin học tập an toàn, giới hạn tối đa ~150 ký tự để gửi thông báo nhanh chóng, súc tích qua Zalo.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-950">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Nguyên tắc bảo mật điểm số:</strong> Hệ thống <strong>tuyệt đối chỉ sử dụng điểm đã được giáo viên công bố</strong> để tạo mẫu tin nhắn phụ huynh. Không để lộ điểm tạm tính hoặc điểm chưa duyệt.
        </p>
      </div>

      {/* Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Chọn lớp:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Chọn học sinh:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleSelectStudent(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
              >
                {classStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.studentCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Template Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Loại thông báo mẫu:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'SCORE' as const, label: 'Điểm kiểm tra' },
                { type: 'PROGRESS' as const, label: 'Tiến độ ôn tập' },
                { type: 'REMINDER' as const, label: 'Nhắc nộp bài' },
                { type: 'PRAISE' as const, label: 'Khen ngợi' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleSelectType(item.type)}
                  className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                    messageType === item.type
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Editor with Character Counter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Nội dung tin nhắn (GV có thể sửa):</label>
              <span
                className={`font-mono font-bold ${
                  isOverLimit ? 'text-rose-600 font-black' : 'text-slate-500'
                }`}
              >
                {charCount} / 150 ký tự {isOverLimit && '(Vượt quá giới hạn!)'}
              </span>
            </div>

            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className={`w-full p-3 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                isOverLimit ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Gửi tới SĐT PH: <strong>{currentStudent?.parentPhone || '0987654321'}</strong>
            </span>

            <button
              onClick={handleCopyAndSave}
              disabled={isOverLimit}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
                copied
                  ? 'bg-emerald-600'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép để gửi qua Zalo'}
            </button>
          </div>
        </div>

        {/* Right: Message Sent History */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col h-[400px]">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-500" />
            Nhật ký tin nhắn đã sao chép / gửi ({zaloLogs.length})
          </h4>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {zaloLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Chưa có lịch sử tin nhắn nào.
              </div>
            ) : (
              zaloLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                >
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{log.studentName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.sentAt).toLocaleTimeString('vi-VN')} {new Date(log.sentAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                    &quot;{log.content}&quot;
                  </p>
                  <div className="text-[10px] text-teal-700 font-semibold pt-0.5">
                    Độ dài: {log.charCount} ký tự · SĐT: {log.parentPhone}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
