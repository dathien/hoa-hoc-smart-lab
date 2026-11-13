import React, { useState } from 'react';
import { useChemStore } from '../../services/store';
import { Student } from '../../types/chem';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Upload,
  Edit2,
  Trash2,
  ArrowRightLeft,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Users
} from 'lucide-react';

export const TeacherClassesStudents: React.FC = () => {
  const {
    students,
    classes,
    addStudent,
    updateStudent,
    deleteStudent,
    transferStudent,
    importStudentsBulk,
  } = useChemStore();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('all');

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
  const [newTransferClassId, setNewTransferClassId] = useState<string>('class_11a1');
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<Student | null>(null);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importResult, setImportResult] = useState<{ added: number; errors: string[] } | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formCode, setFormCode] = useState<string>('');
  const [formClassId, setFormClassId] = useState<string>('class_11a1');
  const [formGender, setFormGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [formDob, setFormDob] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formParentPhone, setFormParentPhone] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Filtered List
  const filteredStudents = students.filter((s) => {
    if (selectedClass !== 'all' && s.classId !== selectedClass) return false;
    if (genderFilter !== 'all' && s.gender !== genderFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchCode = s.studentCode.toLowerCase().includes(q);
      const matchClass = s.className.toLowerCase().includes(q);
      return matchName || matchCode || matchClass;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormCode(`HS${Date.now().toString().slice(-5)}`);
    setFormClassId('class_11a1');
    setFormGender('Nam');
    setFormDob('');
    setFormPhone('');
    setFormParentPhone('');
    setFormNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.fullName);
    setFormCode(student.studentCode);
    setFormClassId(student.classId);
    setFormGender(student.gender);
    setFormDob(student.dob || '');
    setFormPhone(student.phone || '');
    setFormParentPhone(student.parentPhone || '');
    setFormNotes(student.notes || '');
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === formClassId);

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        fullName: formName,
        studentCode: formCode,
        classId: formClassId,
        className: targetClass?.name || '11A1',
        gender: formGender,
        dob: formDob,
        phone: formPhone,
        parentPhone: formParentPhone,
        notes: formNotes,
      });
      setEditingStudent(null);
    } else {
      addStudent({
        studentCode: formCode,
        fullName: formName,
        classId: formClassId,
        className: targetClass?.name || '11A1',
        gender: formGender,
        dob: formDob,
        phone: formPhone,
        parentName: `Phụ huynh em ${formName}`,
        parentPhone: formParentPhone,
        parentLinked: false,
        notes: formNotes,
        status: 'ACTIVE',
      });
      setShowAddModal(false);
    }
  };

  const handleTransfer = () => {
    if (!transferringStudent) return;
    const targetClass = classes.find((c) => c.id === newTransferClassId);
    if (!targetClass) return;

    transferStudent(transferringStudent.id, targetClass.id, targetClass.name);
    setTransferringStudent(null);
  };

  const handleDelete = () => {
    if (!deleteConfirmStudent) return;
    deleteStudent(deleteConfirmStudent.id);
    setDeleteConfirmStudent(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'Mã HS,Họ và tên,Lớp,Giới tính,Ngày sinh,Điện thoại,SĐT Phụ huynh,Ghi chú\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.studentCode}","${s.fullName}","${s.className}","${s.gender}","${s.dob}","${s.phone || ''}","${s.parentPhone || ''}","${s.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_sach_hoc_sinh_ChemPro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateContent =
      'Mã HS,Họ và tên,Lớp,Giới tính,Ngày sinh,Điện thoại,SĐT Phụ huynh\n' +
      'HS11099,Nguyễn Văn Mẫu,11A1,Nam,2008-05-15,0912345678,0987654321\n' +
      'HS11100,Trần Thị Mẫu,11A1,Nữ,2008-11-20,0923456789,0976543210\n';
    const blob = new Blob(['\uFEFF' + templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mau_nhap_lieu_hoc_sinh_ChemPro.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Parse
  const handleImportSubmit = () => {
    const lines = importText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;

    const parsed: Partial<Student>[] = [];
    lines.forEach((line) => {
      // split comma or tab
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        const code = parts[0]?.replace(/"/g, '').trim();
        const name = parts[1]?.replace(/"/g, '').trim();
        const className = parts[2]?.replace(/"/g, '').trim() || '11A1';
        const gender = parts[3]?.includes('Nữ') ? 'Nữ' : 'Nam';
        const dob = parts[4]?.replace(/"/g, '').trim() || '';

        // Ignore header line if present
        if (code.toLowerCase().includes('mã') || name.toLowerCase().includes('họ')) return;

        parsed.push({
          studentCode: code || `HS${Date.now().toString().slice(-4)}`,
          fullName: name,
          className,
          gender,
          dob,
        });
      }
    });

    const res = importStudentsBulk(parsed);
    setImportResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards by Class */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tổng số học sinh</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{students.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Đủ 108 hồ sơ chuẩn hóa 3 khối</span>
        </div>

        {classes.map((cls) => {
          const count = students.filter((s) => s.classId === cls.id).length;
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedClass === cls.id
                  ? 'bg-teal-50/70 border-teal-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Lớp {cls.name}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  Khối {cls.grade}
                </span>
              </div>
              <div className="text-xl font-black text-slate-800 mt-2">{count} học sinh</div>
              <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                GVCN: {cls.homeroomTeacherName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Controls & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, mã HS (HS11028, Tường Vy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Tất cả các lớp (108 HS)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        {/* Buttons: Add, Excel Import, Excel Export, Download Template */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            title="Tải file Excel / CSV mẫu"
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            Excel mẫu
          </button>
          <button
            onClick={() => {
              setImportText('');
              setImportResult(null);
              setShowImportModal(true);
            }}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Nhập Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Xuất Excel
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Thêm học sinh
          </button>
        </div>
      </div>

      {/* Special Notice Banner for the two Pham Ngoc Tuong Vy profiles */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-sky-950">
        <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Hệ thống quản lý định danh:</strong> Lớp 11A1 có <strong>hai học sinh cùng họ tên Phạm Ngọc Tường Vy</strong>. Hệ thống quản lý riêng biệt theo mã học sinh <strong>HS11028</strong> (sinh 12/04/2008) và <strong>HS11029</strong> (sinh 25/09/2008), tuyệt đối không gộp hồ sơ hay trùng khóa.
        </p>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Hiển thị <strong>{filteredStudents.length}</strong> / <strong>{students.length}</strong> học sinh
          </span>
          {selectedClass !== 'all' && (
            <button
              onClick={() => setSelectedClass('all')}
              className="text-teal-700 font-semibold hover:underline"
            >
              Xem toàn trường
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Mã HS</th>
                <th className="p-3">Họ và tên</th>
                <th className="p-3">Lớp</th>
                <th className="p-3">Giới tính</th>
                <th className="p-3">Ngày sinh</th>
                <th className="p-3">Điện thoại</th>
                <th className="p-3">Phụ huynh</th>
                <th className="p-3">Ghi chú / Mẫu</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-teal-800">{st.studentCode}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {st.fullName}
                      {st.fullName.includes('Phạm Ngọc Tường Vy') && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-mono">
                          {st.studentCode === 'HS11028' ? 'Hồ sơ #1' : 'Hồ sơ #2'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-700">{st.className}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          st.gender === 'Nữ'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {st.gender}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {st.dob ? st.dob : <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    <td className="p-3 text-slate-600">{st.phone || '—'}</td>
                    <td className="p-3 text-slate-600">
                      <div>{st.parentName}</div>
                      <div className="text-[10px] text-slate-400">{st.parentPhone || 'Chưa cập nhật'}</div>
                    </td>
                    <td className="p-3">
                      {st.isSampleAddition ? (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                          Bổ sung mẫu 10A1
                        </span>
                      ) : st.notes ? (
                        <span className="text-[11px] text-slate-500 truncate max-w-[120px] block" title={st.notes}>
                          {st.notes}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          title="Sửa hồ sơ"
                          className="p-1 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setTransferringStudent(st);
                            setNewTransferClassId(st.classId === 'class_11a1' ? 'class_10a1' : 'class_11a1');
                          }}
                          title="Chuyển lớp"
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmStudent(st)}
                          title="Xóa hồ sơ"
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL: ADD / EDIT STUDENT */}
      {(showAddModal || editingStudent) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingStudent ? 'Chỉnh Sửa Hồ Sơ Học Sinh' : 'Thêm Mới Học Sinh'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStudent(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã học sinh (*)</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên (*)</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Khang"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lớp (*)</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giới tính</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày sinh (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số ĐT học sinh</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số ĐT Phụ huynh (Nhận Zalo)</label>
                <input
                  type="tel"
                  value={formParentPhone}
                  onChange={(e) => setFormParentPhone(e.target.value)}
                  placeholder="0987654321"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi chú hồ sơ</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER CLASS */}
      {transferringStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Chuyển Lớp Cho Học Sinh</h3>
            <p className="text-xs text-slate-600">
              Chuyển học sinh <strong>{transferringStudent.fullName}</strong> ({transferringStudent.studentCode}) từ lớp <strong>{transferringStudent.className}</strong> sang:
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Chọn lớp đích:</label>
              <select
                value={newTransferClassId}
                onChange={(e) => setNewTransferClassId(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTransferringStudent(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleTransfer}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Xác nhận chuyển lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRM */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm text-rose-700">Xác Nhận Xóa Hồ Sơ Học Sinh</h3>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa học sinh <strong>{deleteConfirmStudent.fullName}</strong> ({deleteConfirmStudent.studentCode}) khỏi cơ sở dữ liệu?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT EXCEL / CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-600" />
                Nhập Dữ Liệu Học Sinh Từ Excel / CSV
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Dán dữ liệu danh sách học sinh (định dạng CSV: <code>Mã, Họ tên, Lớp, Giới tính, Ngày sinh</code>). Hệ thống sẽ tự động phát hiện mã trùng và cấp phát mã mới nếu cần.
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="HS11050,Trần Văn A,11A1,Nam,2008-01-15&#10;HS11051,Lê Thị B,11A1,Nữ,2008-03-20"
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {importResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                Đã thêm thành công: <strong>{importResult.added}</strong> học sinh mới!
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                Tiến hành nhập dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
