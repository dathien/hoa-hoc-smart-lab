import {
  Student,
  Classroom,
  UserProfile,
  Question,
  Exam,
  Submission,
  LessonMaterial,
  TeachingPlan,
  ZaloMessageLog,
  NotificationItem,
  Assignment,
  AssignmentRecipient,
  FlashcardItem,
  LabExperimentDetail
} from '../types/chem';

// 1. Canonical 3 Roles: TEACHER, STUDENT, PARENT (R03: Strictly NO GUEST MODE)
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_teacher',
    name: 'Cô Trần Thị Mai Hương',
    email: 'huong.chem@chempro.edu.vn',
    role: 'TEACHER',
    title: 'Giáo viên Hóa học & GVCN 11A1 (THPT Chuyên)',
    subject: 'Hóa học THPT',
    assignedClassIds: ['class_10a1', 'class_11a1', 'class_12a1'],
    avatar: '👩‍🏫',
  },
  {
    id: 'user_student_khang',
    name: 'Nguyễn Minh Khang',
    email: 'khang.nm.hs11015@chempro.edu.vn',
    role: 'STUDENT',
    title: 'Học sinh Lớp 11A1 (Mã: HS11015)',
    assignedClassIds: ['class_11a1'],
    avatar: '👦',
  },
  {
    id: 'user_student_vy1',
    name: 'Phạm Ngọc Tường Vy (#1)',
    email: 'vy.pnt1.hs11028@chempro.edu.vn',
    role: 'STUDENT',
    title: 'Học sinh Lớp 11A1 (Mã: HS11028 - Sinh 12/04)',
    assignedClassIds: ['class_11a1'],
    avatar: '👧',
  },
  {
    id: 'user_student_vy2',
    name: 'Phạm Ngọc Tường Vy (#2)',
    email: 'vy.pnt2.hs11029@chempro.edu.vn',
    role: 'STUDENT',
    title: 'Học sinh Lớp 11A1 (Mã: HS11029 - Sinh 25/09)',
    assignedClassIds: ['class_11a1'],
    avatar: '👧',
  },
  {
    id: 'user_student_han',
    name: 'Trần Gia Hân',
    email: 'han.tg.hs10008@chempro.edu.vn',
    role: 'STUDENT',
    title: 'Học sinh Lớp 10A1 (Mã: HS10008)',
    assignedClassIds: ['class_10a1'],
    avatar: '👧',
  },
  {
    id: 'user_parent_khang',
    name: 'Bác Nguyễn Văn Thành',
    email: 'thanh.nv.parent@gmail.com',
    role: 'PARENT',
    title: 'Phụ huynh em Nguyễn Minh Khang (11A1)',
    linkedStudentId: 'HS11015',
    avatar: '👨',
  },
];

// 2. Classrooms
export const INITIAL_CLASSES: Classroom[] = [
  {
    id: 'class_10a1',
    name: '10A1',
    grade: 10,
    homeroomTeacherId: 'user_teacher_10',
    homeroomTeacherName: 'Thầy Nguyễn Trọng Tín',
    chemistryTeacherId: 'user_teacher',
    chemistryTeacherName: 'Cô Trần Thị Mai Hương',
    academicYear: '2024 - 2025',
    studentCount: 30,
  },
  {
    id: 'class_11a1',
    name: '11A1',
    grade: 11,
    homeroomTeacherId: 'user_teacher',
    homeroomTeacherName: 'Cô Trần Thị Mai Hương',
    chemistryTeacherId: 'user_teacher',
    chemistryTeacherName: 'Cô Trần Thị Mai Hương',
    academicYear: '2024 - 2025',
    studentCount: 39,
  },
  {
    id: 'class_12a1',
    name: '12A1',
    grade: 12,
    homeroomTeacherId: 'user_teacher_12',
    homeroomTeacherName: 'Cô Vũ Bích Ngọc',
    chemistryTeacherId: 'user_teacher',
    chemistryTeacherName: 'Cô Trần Thị Mai Hương',
    academicYear: '2024 - 2025',
    studentCount: 39,
  },
];

// Helper to generate realistic Vietnamese student names
const SURNAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const MID_BOYS = ['Văn', 'Minh', 'Gia', 'Đức', 'Quốc', 'Bảo', 'Hữu', 'Tuấn', 'Thành', 'Đình', 'Anh', 'Khánh'];
const MID_GIRLS = ['Thị', 'Ngọc', 'Mai', 'Phương', 'Khánh', 'Gia', 'Thảo', 'Trúc', 'Hải', 'Thanh', 'Tú', 'Yến'];
const NAMES_BOYS = ['Khang', 'Nam', 'Kiên', 'Huy', 'Duy', 'Khoa', 'Tùng', 'Long', 'Lâm', 'Thắng', 'Việt', 'Bách', 'Cường', 'Dũng', 'Triết'];
const NAMES_GIRLS = ['Anh', 'Chi', 'Hân', 'Linh', 'My', 'Ngân', 'Trang', 'Vân', 'Vy', 'Châu', 'Trâm', 'Như', 'Quỳnh', 'Thư', 'Hà'];

export function generateInitialStudents(): Student[] {
  const students: Student[] = [];

  // --- LỚP 10A1: 30 Học sinh (21 chuẩn + 9 bổ sung mẫu có đánh dấu rõ) ---
  const names10A1 = [
    { name: 'Nguyễn Tuấn Anh', gender: 'Nam' as const, dob: '2009-02-14' },
    { name: 'Trần Bích Châu', gender: 'Nữ' as const, dob: '2009-05-18' },
    { name: 'Lê Minh Cường', gender: 'Nam' as const, dob: '2009-08-22' },
    { name: 'Phạm Hải Đăng', gender: 'Nam' as const, dob: '' }, // dob unknown left empty
    { name: 'Hoàng Thùy Dương', gender: 'Nữ' as const, dob: '2009-11-04' },
    { name: 'Vũ Đức Giang', gender: 'Nam' as const, dob: '2009-03-30' },
    { name: 'Đặng Mai Hà', gender: 'Nữ' as const, dob: '2009-07-15' },
    { name: 'Trần Gia Hân', gender: 'Nữ' as const, dob: '2009-09-09' },
    { name: 'Bùi Gia Huy', gender: 'Nam' as const, dob: '2009-01-25' },
    { name: 'Đỗ Tuấn Kiệt', gender: 'Nam' as const, dob: '' },
    { name: 'Hồ Phương Linh', gender: 'Nữ' as const, dob: '2009-12-19' },
    { name: 'Ngô Quốc Long', gender: 'Nam' as const, dob: '2009-04-05' },
    { name: 'Dương Trà My', gender: 'Nữ' as const, dob: '2009-06-12' },
    { name: 'Phan Bảo Nam', gender: 'Nam' as const, dob: '2009-10-28' },
    { name: 'Huỳnh Tuyết Ngân', gender: 'Nữ' as const, dob: '2009-03-14' },
    { name: 'Võ Minh Nhật', gender: 'Nam' as const, dob: '2009-08-01' },
    { name: 'Đinh Yến Nhi', gender: 'Nữ' as const, dob: '' },
    { name: 'Lương Tấn Phát', gender: 'Nam' as const, dob: '2009-05-20' },
    { name: 'Mai Như Quỳnh', gender: 'Nữ' as const, dob: '2009-07-07' },
    { name: 'Đoàn Thanh Sơn', gender: 'Nam' as const, dob: '2009-09-18' },
    { name: 'Tạ Minh Tâm', gender: 'Nam' as const, dob: '2009-11-11' },
  ];

  // First 21 students of 10A1
  names10A1.forEach((st, idx) => {
    const codeNum = String(idx + 1).padStart(3, '0');
    students.push({
      id: `HS10${codeNum}`,
      studentCode: `HS10${codeNum}`,
      fullName: st.name,
      classId: 'class_10a1',
      className: '10A1',
      gender: st.gender,
      dob: st.dob,
      phone: st.dob ? `090${codeNum}123` : '',
      parentName: `Phụ huynh em ${st.name}`,
      parentPhone: `098${codeNum}456`,
      parentLinked: true,
      isSampleAddition: false,
      status: 'ACTIVE',
    });
  });

  // 9 sample addition students for 10A1 (marked clearly: isSampleAddition = true)
  const additional10A1 = [
    { name: 'Nguyễn Hoàng Thắng (Mẫu)', gender: 'Nam' as const, dob: '2009-06-25' },
    { name: 'Trần Cẩm Tú (Mẫu)', gender: 'Nữ' as const, dob: '2009-04-16' },
    { name: 'Lê Anh Vũ (Mẫu)', gender: 'Nam' as const, dob: '' },
    { name: 'Phạm Thục Quyên (Mẫu)', gender: 'Nữ' as const, dob: '2009-10-02' },
    { name: 'Hoàng Duy Mạnh (Mẫu)', gender: 'Nam' as const, dob: '2009-01-11' },
    { name: 'Vũ Lan Hương (Mẫu)', gender: 'Nữ' as const, dob: '2009-08-19' },
    { name: 'Bùi Trọng Khôi (Mẫu)', gender: 'Nam' as const, dob: '2009-03-08' },
    { name: 'Đặng Thu Thảo (Mẫu)', gender: 'Nữ' as const, dob: '' },
    { name: 'Đỗ Thành Vinh (Mẫu)', gender: 'Nam' as const, dob: '2009-12-30' },
  ];
  additional10A1.forEach((st, idx) => {
    const codeNum = String(22 + idx).padStart(3, '0');
    students.push({
      id: `HS10${codeNum}`,
      studentCode: `HS10${codeNum}`,
      fullName: st.name,
      classId: 'class_10a1',
      className: '10A1',
      gender: st.gender,
      dob: st.dob,
      phone: st.dob ? `090${codeNum}789` : '',
      parentName: `Phụ huynh em ${st.name}`,
      parentPhone: `098${codeNum}999`,
      parentLinked: false,
      isSampleAddition: true,
      notes: 'Hồ sơ bổ sung mẫu theo cấu hình tiêu chuẩn lớp 30 học sinh',
      status: 'ACTIVE',
    });
  });

  // --- LỚP 11A1: 39 Học sinh ---
  // Mandatory requirement: TWO DISTINCT STUDENTS BOTH NAMED "Phạm Ngọc Tường Vy"
  const list11 = [
    'Nguyễn Đức An', 'Trần Thảo Anh', 'Lê Gia Bách', 'Phạm Quỳnh Chi', 'Hoàng Minh Dũng',
    'Vũ Mai Dung', 'Đặng Tuấn Đạt', 'Bùi Kim Ngân', 'Đỗ Thành Hưng', 'Hồ Ngọc Hải',
    'Ngô Thị Hồng', 'Dương Thái Hòa', 'Phan Thanh Huyền', 'Huỳnh Minh Khang', 'Nguyễn Minh Khang', // HS11015
    'Võ Đăng Khoa', 'Đinh Thục Lam', 'Lương Hoàng Long', 'Mai Thu Mai', 'Đoàn Quốc Nam',
    'Tạ Phương Nga', 'Nguyễn Khắc Nghĩa', 'Trần Bảo Ngọc', 'Lê Hoàng Phong', 'Phạm Thành Phúc',
    'Hoàng Yến Phượng', 'Vũ Đình Quân', 
    'Phạm Ngọc Tường Vy', // First one: HS11028 (dob: 2008-04-12)
    'Phạm Ngọc Tường Vy', // Second one: HS11029 (dob: 2008-09-25) - DISTINCT PROFILES!
    'Đặng Thanh Tâm', 'Bùi Thị Thơm', 'Đỗ Minh Trí', 'Hồ Nhật Trung', 'Ngô Bảo Trâm',
    'Dương Đình Trọng', 'Phan Thu Trang', 'Huỳnh Văn Vượng', 'Võ Hoàng Xuân', 'Đinh Gia Yên'
  ];

  list11.forEach((name, idx) => {
    const codeNum = String(idx + 1).padStart(3, '0');
    const studentCode = `HS11${codeNum}`;
    let dob = `2008-${String((idx % 12) + 1).padStart(2, '0')}-${String(((idx * 7) % 27) + 1).padStart(2, '0')}`;
    let notes = '';

    // Specialized check for the two separate Pham Ngoc Tuong Vy profiles
    if (idx === 27) { // 28th student
      dob = '2008-04-12';
      notes = 'Hồ sơ 1 - Đoàn viên ưu tú (Phân biệt theo mã HS11028 & ngày sinh 12/04)';
    } else if (idx === 28) { // 29th student
      dob = '2008-09-25';
      notes = 'Hồ sơ 2 - Lớp phó học tập (Phân biệt theo mã HS11029 & ngày sinh 25/09)';
    } else if (idx % 6 === 0) {
      dob = ''; // Some have blank DOB as requested in prompt
    }

    const isGirl = name.includes('Vy') || name.includes('Chi') || name.includes('Nga') || name.includes('Dung') || name.includes('Ngọc') || name.includes('Thơm') || name.includes('Trang') || name.includes('Trâm');
    students.push({
      id: studentCode,
      studentCode,
      fullName: name,
      classId: 'class_11a1',
      className: '11A1',
      gender: isGirl ? 'Nữ' : 'Nam',
      dob,
      phone: dob ? `0911${codeNum}22` : '',
      parentName: `Phụ huynh em ${name}`,
      parentPhone: `0933${codeNum}88`,
      parentLinked: idx === 14, // Nguyen Minh Khang is linked to the parent account
      isSampleAddition: false,
      notes,
      status: 'ACTIVE',
    });
  });

  // --- LỚP 12A1: 39 Học sinh ---
  const list12 = [
    'Nguyễn Thái An', 'Trần Quốc Bảo', 'Lê Kim Cương', 'Phạm Diệu Dung', 'Hoàng Minh Đức',
    'Vũ Hải Giang', 'Đặng Thúy Hằng', 'Bùi Trung Hiếu', 'Đỗ Thanh Hoa', 'Hồ Duy Hùng',
    'Ngô Thị Khuyên', 'Dương Mạnh Kiên', 'Phan Gia Kỳ', 'Huỳnh Mai Lan', 'Võ Tuấn Linh',
    'Đinh Trọng Luật', 'Lương Minh Luân', 'Mai Xuân Mạnh', 'Đoàn Bích Nga', 'Tạ Hữu Nhân',
    'Nguyễn Phương Oanh', 'Trần Phúc Phát', 'Lê Thị Quyên', 'Phạm Hồng Quân', 'Hoàng Thái Sơn',
    'Vũ Thùy Trang', 'Đặng Văn Tân', 'Bùi Nhật Tiến', 'Đỗ Phương Thảo', 'Hồ Anh Tuấn',
    'Ngô Văn Tuyên', 'Dương Thị Uyên', 'Phan Thanh Vân', 'Huỳnh Quốc Việt', 'Võ Thúy Vy',
    'Đinh Minh Vương', 'Lương Thanh Xuân', 'Mai Gia Ý', 'Đoàn Hải Yến'
  ];

  list12.forEach((name, idx) => {
    const codeNum = String(idx + 1).padStart(3, '0');
    const studentCode = `HS12${codeNum}`;
    const dob = idx % 5 === 0 ? '' : `2007-${String((idx % 12) + 1).padStart(2, '0')}-${String(((idx * 5) % 27) + 1).padStart(2, '0')}`;
    const isGirl = name.includes('Dung') || name.includes('Hằng') || name.includes('Hoa') || name.includes('Khuyên') || name.includes('Lan') || name.includes('Nga') || name.includes('Oanh') || name.includes('Quyên') || name.includes('Trang') || name.includes('Thảo') || name.includes('Uyên') || name.includes('Vân') || name.includes('Vy') || name.includes('Ý') || name.includes('Yến');
    students.push({
      id: studentCode,
      studentCode,
      fullName: name,
      classId: 'class_12a1',
      className: '12A1',
      gender: isGirl ? 'Nữ' : 'Nam',
      dob,
      phone: dob ? `0912${codeNum}33` : '',
      parentName: `Phụ huynh em ${name}`,
      parentPhone: `0944${codeNum}77`,
      parentLinked: false,
      isSampleAddition: false,
      status: 'ACTIVE',
    });
  });

  return students;
}

// 3. Question Bank (High quality GDPT 2018 - Kết nối tri thức)
export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q_101',
    type: 'MCQ',
    grade: 11,
    chapter: 'Chương 1: Cân bằng hoá học',
    topic: 'Khái niệm về cân bằng hoá học',
    content: 'Cho cân bằng hoá học trong bình kín: N_2(k) + 3H_2(k) \\rightleftharpoons 2NH_3(k) (\\Delta_r H^o_{298} = -92 kJ). Để cân bằng chuyển dịch theo chiều thuận, biện pháp nào sau đây là phù hợp?',
    cognitiveLevel: 'THONG_HIEU',
    options: [
      { id: 'A', content: 'Tăng nhiệt độ của hệ phản ứng.' },
      { id: 'B', content: 'Tăng áp suất chung của hệ phản ứng.', isCorrect: true },
      { id: 'C', content: 'Giảm nồng độ khí N_2 hoặc H_2.' },
      { id: 'D', content: 'Thêm chất xúc tác bột sắt.' },
    ],
    maxScore: 1.0,
    explanation: 'Theo nguyên lý Le Chatelier: Phản ứng thuận tỏa nhiệt (ΔH < 0) và làm giảm số mol khí (4 mol -> 2 mol). Do đó, tăng áp suất làm cân bằng chuyển dịch theo chiều làm giảm số mol khí (chiều thuận). Thêm chất xúc tác chỉ làm tăng tốc độ đạt cân bằng mà không chuyển dịch cân bằng.',
    chemicalFormula: 'N_2 + 3H_2 \\rightleftharpoons 2NH_3',
    authorId: 'user_teacher',
    isApproved: true,
  },
  {
    id: 'q_102',
    type: 'MCQ',
    grade: 11,
    chapter: 'Chương 2: Nitrogen - Sulfur',
    topic: 'Sulfuric acid và muối sulfate',
    content: 'Dung dịch sulfuric acid đặc nguội có thể được vận chuyển trong các bồn chứa bằng kim loại nào sau đây nhờ hiện tượng thụ động hóa?',
    cognitiveLevel: 'NHAN_BIET',
    options: [
      { id: 'A', content: 'Cu và Ag.' },
      { id: 'B', content: 'Fe và Al.', isCorrect: true },
      { id: 'C', content: 'Zn và Mg.' },
      { id: 'D', content: 'Pb và Sn.' },
    ],
    maxScore: 1.0,
    explanation: 'H_2SO_4 đặc nguội làm thụ động hóa Fe, Al và Cr do tạo lớp màng oxide bảo vệ đặc khít ngăn không cho kim loại tiếp tục phản ứng.',
    chemicalFormula: 'H_2SO_4',
    authorId: 'user_teacher',
    isApproved: true,
  },
  {
    id: 'q_103',
    type: 'MULTIPLE_TRUE_FALSE',
    grade: 11,
    chapter: 'Chương 2: Nitrogen - Sulfur',
    topic: 'Hợp chất của nitrogen',
    content: 'Khi nghiên cứu về oxide của nitrogen (NO_x) và hiện tượng mưa acid, các phát biểu sau đây là đúng hay sai?',
    cognitiveLevel: 'VAN_DUNG',
    tfStatements: [
      { id: 'tf_1', statement: 'Khí NO_2 là chất khí màu nâu đỏ, độc và gây kích ứng đường hô hấp mạnh.', isCorrect: true },
      { id: 'tf_2', statement: 'Mưa acid là hiện tượng nước mưa có độ pH > 7 do hòa tan nhiều ion kim loại.', isCorrect: false },
      { id: 'tf_3', statement: 'Quá trình hình thành mưa acid có sự chuyển hóa SO_2 thành H_2SO_4 và NO_x thành HNO_3.', isCorrect: true },
      { id: 'tf_4', statement: 'Bón vôi sống (CaO) vào đất chua là một biện pháp hữu hiệu để khắc phục hậu quả của mưa acid.', isCorrect: true },
    ],
    maxScore: 2.0,
    explanation: 'Mưa acid có pH < 5.6 do hòa tan axit H2SO4 và HNO3 sinh ra từ ô nhiễm SO2 và NOx trong khí quyển.',
    authorId: 'user_teacher',
    isApproved: true,
  },
  {
    id: 'q_104',
    type: 'SHORT_ANSWER',
    grade: 11,
    chapter: 'Chương 1: Cân bằng hoá học',
    topic: 'pH và sự điện li',
    content: 'Hòa tan hoàn toàn 0,004 mol NaOH vào nước để thu được 400 mL dung dịch X ở 25°C. Giá trị pH của dung dịch X bằng bao nhiêu?',
    cognitiveLevel: 'VAN_DUNG',
    correctAnswer: '12',
    maxScore: 2.0,
    explanation: 'C_M(NaOH) = 0,004 / 0,4 = 0,01 M = 10^{-2} M => [OH^-] = 10^{-2} M => pOH = 2 => pH = 14 - 2 = 12.',
    authorId: 'user_teacher',
    isApproved: true,
  },
  {
    id: 'q_105',
    type: 'ESSAY',
    grade: 11,
    chapter: 'Chương 2: Nitrogen - Sulfur',
    topic: 'Sulfuric acid ứng dụng & An toàn thí nghiệm',
    content: 'Em hãy nêu quy tắc an toàn tuyệt đối khi pha loãng dung dịch sulfuric acid đặc trong phòng thí nghiệm. Giải thích cơ sở khoa học vì sao không được làm ngược lại và viết phương trình minh họa tính háo nước của H_2SO_4 đặc khi tiếp xúc với đường sucrose (C_{12}H_{22}O_{11}).',
    cognitiveLevel: 'VAN_DUNG_CAO',
    rubricGuide: '- Nêu đúng quy tắc: Rót từ từ acid đặc dọc theo đũa thủy tinh vào nước và khuấy đều (1.0đ)\n- Cơ sở khoa học: Acid đặc tan trong nước tỏa lượng nhiệt rất lớn. Nếu rót nước vào acid, nước có khối lượng riêng nhẹ hơn sẽ nổi lên trên, sôi đột ngột và bắn acid ra ngoài gây bỏng nguy hiểm (1.5đ)\n- Viết đúng phản ứng than hóa sucrose: C12H22O11 -> 12C + 11H2O và phản ứng oxi hóa tiếp tục của C với H2SO4 đặc tạo CO2, SO2 (1.5đ)',
    maxScore: 4.0,
    explanation: 'H2SO4 đặc háo nước cực mạnh, chiếm nước từ các hợp chất carbohydrate tạo than carbon đen xốp dâng cao do bọt khí CO2 và SO2 đẩy lên.',
    authorId: 'user_teacher',
    isApproved: true,
  },
  {
    id: 'q_106',
    type: 'MCQ',
    grade: 10,
    chapter: 'Chương 2: Bảng tuần hoàn các nguyên tố hoá học',
    topic: 'Định luật tuần hoàn & Cấu hình electron',
    content: 'Nguyên tử của nguyên tố X có cấu hình electron 1s^2 2s^2 2p^6 3s^2 3p^5. Vị trí của X trong bảng tuần hoàn là:',
    cognitiveLevel: 'NHAN_BIET',
    options: [
      { id: 'A', content: 'Chu kì 3, nhóm VA.' },
      { id: 'B', content: 'Chu kì 3, nhóm VIIA.', isCorrect: true },
      { id: 'C', content: 'Chu kì 2, nhóm VIIA.' },
      { id: 'D', content: 'Chu kì 4, nhóm IIA.' },
    ],
    maxScore: 1.0,
    explanation: 'Số lớp electron = 3 => Chu kì 3. Số electron lớp ngoài cùng = 2 + 5 = 7 (e hóa trị điền vào phân lớp p) => Nhóm VIIA (Chlorine).',
    authorId: 'user_teacher',
    isApproved: true,
  },
];

// 4. Initial Exams
export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam_15m_c1',
    title: 'Kiểm tra 15 phút: Cân bằng Hoá học & Phản ứng Thuận nghịch',
    grade: 11,
    type: '15_MIN',
    durationMinutes: 15,
    assignedClassIds: ['class_11a1'],
    questionIds: ['q_101', 'q_102', 'q_103', 'q_104'],
    totalScore: 10.0,
    deadline: '2025-10-30T23:59:00',
    allowShowScoreImmediately: false, // CORE REQUIREMENT: ĐANG TẮT - Học sinh không thấy điểm ngay
    allowShowAnswers: false,
    allowShowExplanations: false,
    allowShowFeedback: true,
    shuffleQuestions: true,
    status: 'ACTIVE',
    createdAt: '2025-10-01T08:00:00',
    createdBy: 'user_teacher',
  },
  {
    id: 'exam_practice_sulfur',
    title: 'Bài tập tự luyện tuần 6: Hợp chất của Sulfur & Mưa Acid',
    grade: 11,
    type: 'HOMEWORK',
    durationMinutes: 30,
    assignedClassIds: ['class_11a1'],
    questionIds: ['q_101', 'q_102'],
    totalScore: 10.0,
    deadline: '2025-11-15T23:59:00',
    allowShowScoreImmediately: true, // CORE REQUIREMENT: ĐANG BẬT - Luyện tập được xem ngay
    allowShowAnswers: true,
    allowShowExplanations: true,
    allowShowFeedback: true,
    shuffleQuestions: false,
    status: 'ACTIVE',
    createdAt: '2025-10-05T09:00:00',
    createdBy: 'user_teacher',
  },
  {
    id: 'exam_midterm_11',
    title: 'Đề kiểm tra Giữa học kỳ I - Hóa học 11 Kết nối tri thức',
    grade: 11,
    type: 'MID_TERM',
    durationMinutes: 45,
    assignedClassIds: ['class_11a1'],
    questionIds: ['q_101', 'q_102', 'q_103', 'q_104', 'q_105'],
    totalScore: 10.0,
    deadline: '2025-11-20T23:59:00',
    allowShowScoreImmediately: false, // TẮT vì có câu tự luận và là kỳ thi chính thức
    allowShowAnswers: false,
    allowShowExplanations: false,
    allowShowFeedback: true,
    shuffleQuestions: true,
    status: 'ACTIVE',
    createdAt: '2025-10-06T10:00:00',
    createdBy: 'user_teacher',
  },
];

// 5. Initial Submissions with various realistic lifecycle states
export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_khang_15m',
    examId: 'exam_15m_c1',
    examTitle: 'Kiểm tra 15 phút: Cân bằng Hoá học & Phản ứng Thuận nghịch',
    studentId: 'HS11015',
    studentName: 'Nguyễn Minh Khang',
    studentCode: 'HS11015',
    classId: 'class_11a1',
    className: '11A1',
    submittedAt: '2025-10-07T14:22:10',
    answers: {
      q_101: { questionId: 'q_101', selectedOption: 'B', autoScore: 1.0 },
      q_102: { questionId: 'q_102', selectedOption: 'B', autoScore: 1.0 },
      q_103: {
        questionId: 'q_103',
        tfAnswers: { tf_1: true, tf_2: false, tf_3: true, tf_4: true },
        autoScore: 2.0,
      },
      q_104: { questionId: 'q_104', shortText: '12', autoScore: 2.0 },
    },
    submissionStatus: 'AUTO_GRADED', // Has been auto-graded by backend logic, waiting teacher approval
    publishStatus: 'HIDDEN', // Not yet published! Student cannot see score because allowShowScoreImmediately is FALSE
    autoGradedScore: 9.0,
    finalScore: 9.0,
    teacherFeedback: '',
    adjustmentLogs: [],
  },
  {
    id: 'sub_vy1_15m',
    examId: 'exam_15m_c1',
    examTitle: 'Kiểm tra 15 phút: Cân bằng Hoá học & Phản ứng Thuận nghịch',
    studentId: 'HS11028',
    studentName: 'Phạm Ngọc Tường Vy (#1)',
    studentCode: 'HS11028',
    classId: 'class_11a1',
    className: '11A1',
    submittedAt: '2025-10-07T14:25:30',
    answers: {
      q_101: { questionId: 'q_101', selectedOption: 'B', autoScore: 1.0 },
      q_102: { questionId: 'q_102', selectedOption: 'B', autoScore: 1.0 },
      q_103: {
        questionId: 'q_103',
        tfAnswers: { tf_1: true, tf_2: false, tf_3: true, tf_4: false },
        autoScore: 1.5,
      },
      q_104: { questionId: 'q_104', shortText: '12', autoScore: 2.0 },
    },
    submissionStatus: 'APPROVED',
    publishStatus: 'PUBLISHED', // Teacher has approved and published for Vy #1
    autoGradedScore: 8.5,
    finalScore: 8.5,
    teacherFeedback: 'Bài làm rất tốt, cần lưu ý ý 4 câu đúng sai về biện pháp khử chua bằng vôi.',
    adjustmentLogs: [
      {
        adjustedAt: '2025-10-07T16:00:00',
        adjustedBy: 'Cô Trần Thị Mai Hương',
        previousScore: 8.5,
        newScore: 8.5,
        reason: 'Duyệt điểm tự động chuẩn xác sau rà soát',
        version: 1,
      },
    ],
  },
  {
    id: 'sub_vy2_15m',
    examId: 'exam_15m_c1',
    examTitle: 'Kiểm tra 15 phút: Cân bằng Hoá học & Phản ứng Thuận nghịch',
    studentId: 'HS11029',
    studentName: 'Phạm Ngọc Tường Vy (#2)',
    studentCode: 'HS11029',
    classId: 'class_11a1',
    className: '11A1',
    submittedAt: '2025-10-07T14:28:44',
    answers: {
      q_101: { questionId: 'q_101', selectedOption: 'A', autoScore: 0.0 }, // Wrong option
      q_102: { questionId: 'q_102', selectedOption: 'B', autoScore: 1.0 },
      q_103: {
        questionId: 'q_103',
        tfAnswers: { tf_1: true, tf_2: true, tf_3: true, tf_4: true },
        autoScore: 1.5,
      },
      q_104: { questionId: 'q_104', shortText: '2', autoScore: 0.0 }, // Calculated pOH instead of pH
    },
    submissionStatus: 'NEEDS_REVIEW',
    publishStatus: 'HIDDEN',
    autoGradedScore: 5.5,
    finalScore: 5.5,
    teacherFeedback: 'Em nhầm lẫn giữa pOH và pH ở câu 4, cần ôn lại công thức pH = 14 - pOH.',
    adjustmentLogs: [],
  },
  {
    id: 'sub_khang_midterm',
    examId: 'exam_midterm_11',
    examTitle: 'Đề kiểm tra Giữa học kỳ I - Hóa học 11 Kết nối tri thức',
    studentId: 'HS11015',
    studentName: 'Nguyễn Minh Khang',
    studentCode: 'HS11015',
    classId: 'class_11a1',
    className: '11A1',
    submittedAt: '2025-10-07T15:10:00',
    answers: {
      q_101: { questionId: 'q_101', selectedOption: 'B', autoScore: 1.0 },
      q_102: { questionId: 'q_102', selectedOption: 'B', autoScore: 1.0 },
      q_103: {
        questionId: 'q_103',
        tfAnswers: { tf_1: true, tf_2: false, tf_3: true, tf_4: true },
        autoScore: 2.0,
      },
      q_104: { questionId: 'q_104', shortText: '12', autoScore: 2.0 },
      q_105: {
        questionId: 'q_105',
        essayText: 'Quy tắc an toàn: Phải rót từ từ acid đặc dọc theo đũa thủy tinh vào nước và khuấy đều nhẹ nhàng. Tuyệt đối không được làm ngược lại. Giải thích: Vì acid sunfuric đặc tan trong nước tỏa lượng nhiệt rất lớn, nếu đổ nước vào acid thì giọt nước nhẹ hơn nổi lên trên bị đun sôi tức thì gây nổ bắn axit làm bỏng nặng. Than hóa đường: C12H22O11 -(H2SO4 dac)-> 12C + 11H2O.',
        autoScore: 0.0, // Essay cannot be auto graded! Needs review
        manualScore: 3.5,
        teacherComment: 'Trình bày rõ ràng, giải thích đúng cơ chế nhiệt tỏa và tính háo nước!',
      },
    },
    submissionStatus: 'NEEDS_REVIEW',
    publishStatus: 'HIDDEN',
    autoGradedScore: 6.0,
    finalScore: 9.5,
    teacherFeedback: 'Bài làm xuất sắc, nắm chắc cả lý thuyết và thực nghiệm.',
    adjustmentLogs: [
      {
        adjustedAt: '2025-10-07T16:30:00',
        adjustedBy: 'Cô Trần Thị Mai Hương',
        previousScore: 6.0,
        newScore: 9.5,
        reason: 'Chấm xong câu tự luận số 5 (đạt 3.5/4.0 điểm)',
        version: 1,
      },
    ],
  },
];

// 6. Lesson Materials (GDPT 2018 - Kết nối tri thức với cuộc sống)
export const INITIAL_LESSONS: LessonMaterial[] = [
  {
    id: 'les_11_cbhh',
    grade: 11,
    semester: 1,
    chapter: 'Chương 1: Cân bằng hoá học',
    unit: 'Bài 1: Khái niệm về cân bằng hoá học',
    title: 'Khái niệm về phản ứng thuận nghịch và trạng thái cân bằng',
    theorySummary: 'Phản ứng thuận nghịch là phản ứng trong cùng điều kiện xác định xảy ra đồng thời theo hai chiều trái ngược nhau. Cân bằng hóa học là trạng thái của phản ứng thuận nghịch khi tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch (v_t = v_n). Đây là cân bằng động.',
    equations: [
      'aA + bB \\rightleftharpoons cC + dD',
      'K_C = \\frac{[C]^c [D]^d}{[A]^a [B]^b}',
    ],
    keyFormulas: [
      'v_t = v_n (ở trạng thái cân bằng)',
      '\\Delta_r H^o_{298} < 0 : Phản ứng tỏa nhiệt',
      '\\Delta_r H^o_{298} > 0 : Phản ứng thu nhiệt',
    ],
    molecularStructureInfo: 'Hằng số cân bằng KC chỉ phụ thuộc vào nhiệt độ và bản chất của phản ứng.',
    applications: 'Điều khiển năng suất tổng hợp amoniac trong công nghiệp theo quy trình Haber-Bosch bằng cách tăng áp suất và duy trì nhiệt độ tối ưu 450°C.',
    experimentGuide: 'Thí nghiệm chuyển dịch cân bằng giữa ion cromat vàng CrO4(2-) và bicromat da cam Cr2O7(2-) khi thay đổi môi trường acid/base.',
  },
  {
    id: 'les_11_sulfuric',
    grade: 11,
    semester: 1,
    chapter: 'Chương 2: Nitrogen - Sulfur',
    unit: 'Bài 7: Sulfuric acid và muối sulfate',
    title: 'Cấu tạo, tính chất và ứng dụng của Sulfuric acid',
    theorySummary: 'Sulfuric acid là một trong những hóa chất có sản lượng lớn nhất toàn cầu. Dung dịch H2SO4 loãng thể hiện đầy đủ tính chất của một acid mạnh. Dung dịch H2SO4 đặc có tính oxi hóa rất mạnh và tính háo nước đặc trưng.',
    equations: [
      'Cu + 2H_2SO_4(đ) \\xrightarrow{t^o} CuSO_4 + SO_2\\uparrow + 2H_2O',
      'C_{12}H_{22}O_{11} \\xrightarrow{H_2SO_4(đ)} 12C + 11H_2O',
      'Ba^{2+} + SO_4^{2-} \\rightarrow BaSO_4\\downarrow (trắng)',
    ],
    keyFormulas: [
      'm_{dd} = V \\times D',
      'C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\%',
      'C_M = \\frac{10 \\times D \\times C\\%}{M}',
    ],
    molecularStructureInfo: 'Phân tử H2SO4 có nguyên tử S liên kết với 4 nguyên tử O, cấu trúc tứ diện biến dạng.',
    applications: 'Sản xuất phân bón supephosphate, lọc dầu mỏ, sản xuất chất tẩy rửa, muối sulfate và xử lý nước thải.',
    experimentGuide: 'Thí nghiệm nhỏ sulfuric acid đặc vào cốc đựng đường saccarozơ quan sát cột than đen dâng trào và tỏa nhiệt.',
  },
  {
    id: 'les_10_bangtuanhoan',
    grade: 10,
    semester: 1,
    chapter: 'Chương 2: Bảng tuần hoàn các nguyên tố hoá học',
    unit: 'Bài 5: Cấu tạo bảng tuần hoàn',
    title: 'Nguyên tắc sắp xếp và cấu trúc các chu kì, nhóm nguyên tố',
    theorySummary: 'Bảng tuần hoàn gồm 118 nguyên tố được sắp xếp theo chiều tăng dần của điện tích hạt nhân nguyên tử. Các nguyên tố có cùng số lớp electron được xếp vào cùng một chu kì. Các nguyên tố có cấu hình electron tương tự nhau được xếp vào cùng một nhóm.',
    equations: [
      'Z = p = e',
      'A = Z + n',
    ],
    keyFormulas: [
      'Số thứ tự ô nguyên tố = Số hiệu nguyên tử Z',
      'Số thứ tự chu kì = Số lớp electron',
      'Số thứ tự nhóm A = Số electron hóa trị (lớp ngoài cùng)',
    ],
    applications: 'Dự đoán tính chất hóa học, mức độ hoạt động và khả năng tạo liên kết của các nguyên tố mới và vật liệu bán dẫn.',
  },
];

// 9. Teaching Plans
export const INITIAL_TEACHING_PLANS: TeachingPlan[] = [
  {
    id: 'plan_1',
    grade: 11,
    semester: 1,
    chapter: 'Chương 1: Cân bằng hoá học',
    lessonTitle: 'Khái niệm về cân bằng hoá học (Tiết 1 - 2)',
    week: 1,
    period: 1,
    objectives: 'Học sinh trình bày được khái niệm phản ứng một chiều, phản ứng thuận nghịch; viết được biểu thức KC; giải thích ảnh hưởng của nồng độ, nhiệt độ, áp suất.',
    equipment: 'Mô hình 3D tương tác, ống nghiệm, hóa chất NO2/N2O4, máy chiếu.',
    status: 'APPROVED',
  },
  {
    id: 'plan_2',
    grade: 11,
    semester: 1,
    chapter: 'Chương 2: Nitrogen - Sulfur',
    lessonTitle: 'Sulfuric acid và muối sulfate (Tiết 14 - 15)',
    week: 7,
    period: 14,
    objectives: 'Học sinh phân biệt tính chất H2SO4 loãng và đặc; thực hành thí nghiệm tính háo nước và nhận biết ion sulfate.',
    equipment: 'H2SO4 đặc, BaCl2, saccarozơ, đũa thủy tinh, găng tay bảo hộ.',
    status: 'APPROVED',
  },
];

// 10. Sample Zalo Message Logs (safe, <= 150 chars)
export const INITIAL_ZALO_LOGS: ZaloMessageLog[] = [
  {
    id: 'zalo_1',
    studentId: 'HS11028',
    studentName: 'Phạm Ngọc Tường Vy (#1)',
    parentPhone: '093302888',
    category: 'SCORE',
    content: 'TB KHTN: Em Pham Ngoc Tuong Vy dat 8.5 diem Ktra 15p Hoa hoc 11. Bai lam rat tot, da duyet tren he thong ChemPro.',
    charCount: 114,
    sentAt: '2025-10-07T16:15:00',
    teacherId: 'user_teacher',
  },
];

// 11. Notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    targetRole: 'TEACHER',
    title: 'Học sinh mới nộp bài kiểm tra',
    message: 'Em Nguyễn Minh Khang (11A1) vừa nộp bài Kiểm tra Giữa kỳ 1. Cần chấm câu tự luận số 5.',
    createdAt: '2025-10-07T15:10:00',
    read: false,
    linkTo: 'grading',
  },
  {
    id: 'notif_2',
    targetRole: 'STUDENT',
    targetUserId: 'HS11028',
    title: 'Điểm kiểm tra đã được công bố!',
    message: 'Cô Mai Hương đã công bố điểm Kiểm tra 15 phút của em: 8.5/10.0 điểm. Xem lời giải chi tiết ngay.',
    createdAt: '2025-10-07T16:05:00',
    read: false,
    linkTo: 'results',
  },
  {
    id: 'notif_3',
    targetRole: 'PARENT',
    targetUserId: 'HS11015',
    title: 'Nhắc nhở học tập từ GVCN',
    message: 'Kính gửi phụ huynh em Minh Khang: Em đã hoàn thành bài tập tuần 6 với thái độ tích cực.',
    createdAt: '2025-10-07T16:20:00',
    read: true,
    linkTo: 'parent-scores',
  },
];

// 12. Four-Step Assignments (Section XIII)
export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_15m_c1',
    teacherId: 'user_teacher',
    examId: 'exam_15m_c1',
    examTitle: 'Kiểm tra 15 phút: Cân bằng Hoá học & Phản ứng Thuận nghịch',
    targetClassIds: ['class_11a1'],
    assignedAt: '2025-10-01T08:00:00',
    opensAt: '2025-10-01T08:00:00',
    dueAt: '2025-10-30T23:59:00',
    durationMinutes: 15,
    attemptLimit: 1,
    publicationPolicy: 'TEACHER_APPROVAL',
    allowLateSubmission: false,
    status: 'ACTIVE',
    totalStudentsAssigned: 39,
    note: 'Bài kiểm tra đánh giá thường xuyên số 1 theo CTGDPT 2018.',
    createdAt: '2025-10-01T08:00:00',
    updatedAt: '2025-10-01T08:00:00',
  },
  {
    id: 'asg_practice_sulfur',
    teacherId: 'user_teacher',
    examId: 'exam_practice_sulfur',
    examTitle: 'Bài tập tự luyện tuần 6: Hợp chất của Sulfur & Mưa Acid',
    targetClassIds: ['class_11a1'],
    assignedAt: '2025-10-05T09:00:00',
    opensAt: '2025-10-05T09:00:00',
    dueAt: '2025-11-15T23:59:00',
    durationMinutes: 30,
    attemptLimit: 3,
    publicationPolicy: 'IMMEDIATE',
    allowLateSubmission: true,
    status: 'ACTIVE',
    totalStudentsAssigned: 39,
    note: 'Bài tập tự luyện củng cố lý thuyết bài 7 Sulfuric acid.',
    createdAt: '2025-10-05T09:00:00',
    updatedAt: '2025-10-05T09:00:00',
  },
  {
    id: 'asg_midterm_11',
    teacherId: 'user_teacher',
    examId: 'exam_midterm_11',
    examTitle: 'Đề kiểm tra Giữa học kỳ I - Hóa học 11 Kết nối tri thức',
    targetClassIds: ['class_11a1'],
    assignedAt: '2025-10-06T10:00:00',
    opensAt: '2025-10-06T10:00:00',
    dueAt: '2025-11-20T23:59:00',
    durationMinutes: 45,
    attemptLimit: 1,
    publicationPolicy: 'TEACHER_APPROVAL',
    allowLateSubmission: false,
    status: 'ACTIVE',
    totalStudentsAssigned: 39,
    note: 'Kiểm tra định kỳ giữa học kỳ 1 (có câu tự luận vận dụng cao).',
    createdAt: '2025-10-06T10:00:00',
    updatedAt: '2025-10-06T10:00:00',
  },
];

// 13. Assignment Recipients for Real Progress Tracking (Section XIV)
export const INITIAL_ASSIGNMENT_RECIPIENTS: AssignmentRecipient[] = [
  {
    id: 'rec_khang_15m',
    assignmentId: 'asg_15m_c1',
    studentId: 'HS11015',
    studentName: 'Nguyễn Minh Khang',
    studentCode: 'HS11015',
    classId: 'class_11a1',
    className: '11A1',
    status: 'SUBMITTED',
    submissionId: 'sub_khang_15m',
    submittedAt: '2025-10-07T14:22:10',
    score: 9.0,
    attemptsCount: 1,
    timeSpentSeconds: 780,
  },
  {
    id: 'rec_vy1_15m',
    assignmentId: 'asg_15m_c1',
    studentId: 'HS11028',
    studentName: 'Phạm Ngọc Tường Vy (#1)',
    studentCode: 'HS11028',
    classId: 'class_11a1',
    className: '11A1',
    status: 'SUBMITTED',
    submissionId: 'sub_vy1_15m',
    submittedAt: '2025-10-07T14:25:30',
    score: 8.5,
    attemptsCount: 1,
    timeSpentSeconds: 840,
  },
  {
    id: 'rec_vy2_15m',
    assignmentId: 'asg_15m_c1',
    studentId: 'HS11029',
    studentName: 'Phạm Ngọc Tường Vy (#2)',
    studentCode: 'HS11029',
    classId: 'class_11a1',
    className: '11A1',
    status: 'SUBMITTED',
    submissionId: 'sub_vy2_15m',
    submittedAt: '2025-10-07T14:28:44',
    score: 5.5,
    attemptsCount: 1,
    timeSpentSeconds: 890,
  },
  {
    id: 'rec_khang_midterm',
    assignmentId: 'asg_midterm_11',
    studentId: 'HS11015',
    studentName: 'Nguyễn Minh Khang',
    studentCode: 'HS11015',
    classId: 'class_11a1',
    className: '11A1',
    status: 'SUBMITTED',
    submissionId: 'sub_khang_midterm',
    submittedAt: '2025-10-07T15:10:00',
    score: 9.5,
    attemptsCount: 1,
    timeSpentSeconds: 2400,
  },
  {
    id: 'rec_da_15m',
    assignmentId: 'asg_15m_c1',
    studentId: 'HS11001',
    studentName: 'Nguyễn Đức An',
    studentCode: 'HS11001',
    classId: 'class_11a1',
    className: '11A1',
    status: 'IN_PROGRESS',
    attemptsCount: 0,
    timeSpentSeconds: 120,
  },
  {
    id: 'rec_ta_15m',
    assignmentId: 'asg_15m_c1',
    studentId: 'HS11002',
    studentName: 'Trần Thảo Anh',
    studentCode: 'HS11002',
    classId: 'class_11a1',
    className: '11A1',
    status: 'NOT_OPENED',
    attemptsCount: 0,
  },
  {
    id: 'rec_gb_15m',
    assignmentId: 'asg_15m_c1',
    studentId: 'HS11003',
    studentName: 'Lê Gia Bách',
    studentCode: 'HS11003',
    classId: 'class_11a1',
    className: '11A1',
    status: 'OVERDUE',
    attemptsCount: 0,
  },
];

// 14. Shared Flashcard Bank (Section IV)
export const INITIAL_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc_1',
    grade: 11,
    chapter: 'Chương 2: Nitrogen - Sulfur',
    unit: 'Bài 7: Sulfuric acid và muối sulfate',
    frontTitle: 'Sulfuric acid đặc',
    frontContent: 'Tính háo nước & Quy tắc pha loãng an toàn',
    frontFormula: 'H2SO4',
    frontModel3D: 'H2SO4',
    backChemicalName: 'Sulfuric acid (Axit sunfuric)',
    backFormula: 'H2SO4',
    backProperties: [
      'Chất lỏng sánh như dầu, không màu, d = 1,84 g/cm³.',
      'Tính oxi hóa cực mạnh: Oxi hóa hầu hết kim loại lên hóa trị cao nhất (trừ Au, Pt).',
      'Tính háo nước mãnh liệt: Chiếm H và O của carbohydrate tạo than carbon xốp.',
    ],
    backReactions: [
      'Cu + 2H2SO4(đ) -> CuSO4 + SO2 + 2H2O',
      'C12H22O11 -> 12C + 11H2O',
    ],
    backExplanation: 'Khi pha loãng: RÓT TỪ TỪ ACID VÀO NƯỚC DỌC THEO ĐŨA THỦY TINH VÀ KHUẤY ĐỀU. Tuyệt đối không làm ngược lại vì nước sôi đột ngột bắn acid.',
    category: 'Chất vô cơ',
    masteredStudentIds: ['HS11015', 'HS11028'],
    isAssignedToClass: true,
  },
  {
    id: 'fc_2',
    grade: 11,
    chapter: 'Chương 1: Cân bằng hoá học',
    unit: 'Bài 1: Khái niệm về cân bằng hoá học',
    frontTitle: 'Nguyên lý Le Chatelier',
    frontContent: 'Sự chuyển dịch cân bằng hóa học khi thay đổi nhiệt độ, áp suất, nồng độ',
    frontFormula: 'N2 + 3H2 <=> 2NH3',
    backChemicalName: 'Nguyên lý chuyển dịch cân bằng Le Chatelier',
    backFormula: 'aA + bB <=> cC + dD',
    backProperties: [
      'Tăng nhiệt độ: Cân bằng chuyển dịch theo chiều thu nhiệt (ΔH > 0).',
      'Tăng áp suất: Cân bằng chuyển dịch theo chiều làm giảm số mol khí.',
      'Thêm chất: Cân bằng chuyển dịch theo chiều làm giảm nồng độ chất đó.',
    ],
    backReactions: [
      'N2(k) + 3H2(k) <=> 2NH3(k)  (ΔH = -92 kJ)',
    ],
    backExplanation: 'Chất xúc tác chỉ làm tăng tốc độ đạt trạng thái cân bằng mà KHÔNG làm chuyển dịch cân bằng hóa học.',
    category: 'Quy tắc',
    masteredStudentIds: ['HS11015'],
    isAssignedToClass: true,
  },
  {
    id: 'fc_3',
    grade: 11,
    chapter: 'Chương 2: Nitrogen - Sulfur',
    unit: 'Bài 4: Ammonia và muối ammonium',
    frontTitle: 'Ammonia (Khí NH3)',
    frontContent: 'Tính base yếu và tính khử mạnh',
    frontFormula: 'NH3',
    frontModel3D: 'NH3',
    backChemicalName: 'Ammonia (Amoniac)',
    backFormula: 'NH3',
    backProperties: [
      'Khí không màu, mùi khai sốc đặc trưng, nhẹ hơn không khí, tan vô hạn trong nước.',
      'Tính base: Làm quỳ tím ẩm hóa xanh, tác dụng acid tạo muối ammonium.',
      'Tính khử mạnh do N có số oxi hóa -3 thấp nhất.',
    ],
    backReactions: [
      'NH3 + HCl -> NH4Cl (khói trắng)',
      '4NH3 + 5O2 -> 4NO + 6H2O (Pt, 850°C)',
    ],
    backExplanation: 'Nguyên liệu số 1 sản xuất phân bón đạm, acid nitric và hóa chất công nghiệp.',
    category: 'Chất vô cơ',
    masteredStudentIds: ['HS11028'],
    isAssignedToClass: true,
  },
  {
    id: 'fc_4',
    grade: 10,
    chapter: 'Chương 2: Bảng tuần hoàn các nguyên tố',
    unit: 'Bài 5: Cấu tạo bảng tuần hoàn',
    frontTitle: 'Bảng tuần hoàn các nguyên tố',
    frontContent: 'Quy tắc sắp xếp & Sự biến đổi độ âm điện, bán kính',
    frontFormula: 'Z = 1 -> 118',
    backChemicalName: 'Định luật tuần hoàn Mendeleev',
    backFormula: '1s 2s 2p 3s 3p...',
    backProperties: [
      'Số thứ tự ô = Số hiệu nguyên tử Z = Số electron.',
      'Số thứ tự chu kì = Số lớp electron.',
      'Trong 1 chu kì (trái qua phải): Bán kính giảm, độ âm điện tăng, tính phi kim tăng.',
    ],
    backReactions: [],
    backExplanation: 'Cơ sở khoa học phân loại và dự đoán tính chất hóa học của mọi đơn chất và hợp chất.',
    category: 'Khái niệm',
    masteredStudentIds: ['HS11015', 'HS10008'],
    isAssignedToClass: false,
  },
  {
    id: 'fc_5',
    grade: 11,
    chapter: 'Chương 4: Hydrocarbon',
    unit: 'Bài 12: Alkane',
    frontTitle: 'Khí Methane (CH4)',
    frontContent: 'Cấu trúc tứ diện đều & Phản ứng thế halogen',
    frontFormula: 'CH4',
    frontModel3D: 'CH4',
    backChemicalName: 'Methane (Metan)',
    backFormula: 'CH4',
    backProperties: [
      'Cấu trúc tứ diện đều đối xứng hoàn hảo, góc liên kết H-C-H = 109,5°.',
      'Khí không màu, nhẹ hơn không khí, cháy tỏa nhiệt lớn.',
      'Phản ứng đặc trưng: Thế halogen khi có chiếu sáng.',
    ],
    backReactions: [
      'CH4 + Cl2 -> CH3Cl + HCl (as)',
      'CH4 + 2O2 -> CO2 + 2H2O',
    ],
    backExplanation: 'Thành phần chính của khí thiên nhiên và khí đồng hành mỏ dầu (70-95%).',
    category: 'Chất hữu cơ',
    masteredStudentIds: ['HS11015'],
    isAssignedToClass: true,
  },
];

// 15. Verified Interactive Virtual 3D Lab Experiments (Section V: L01-L16)
export const INITIAL_LAB_EXPERIMENTS: LabExperimentDetail[] = [
  {
    id: 'lab_exp_sulfate',
    grade: 11,
    lessonId: 'les_11_sulfuric',
    lessonName: 'Bài 7: Sulfuric acid và muối sulfate (SGK KNTT)',
    title: 'Thí nghiệm 1: Nhận biết ion Sulfate (SO₄²⁻) bằng dung dịch BaCl₂',
    objectives: [
      'Quan sát và nhận biết hiện tượng tạo kết tủa trắng đặc trưng của barium sulfate (BaSO₄).',
      'Kiểm chứng tính chất kết tủa BaSO₄ không tan trong môi trường acid mạnh (HCl/HNO₃).',
      'Viết thành thạo phương trình phân tử và phương trình ion rút gọn.',
    ],
    equipmentList: [
      'Giá đỡ ống nghiệm',
      'Ống nghiệm thủy tinh chịu nhiệt',
      'Ống nhỏ giọt (pipet)',
      'Cốc thủy tinh dung tích 100 mL',
      'Đũa thủy tinh',
    ],
    chemicalTray: [
      {
        id: 'chem_bacl2',
        name: 'Dung dịch Barium chloride',
        formula: 'BaCl₂ (0.1 M)',
        state: 'liquid',
        concentration: '0.1 M',
        color: 0xe0f2fe,
        description: 'Dung dịch muối bari trong suốt, độc khi nuốt phải.',
        isHazardous: true,
      },
      {
        id: 'chem_h2so4_dilute',
        name: 'Dung dịch Sulfuric acid loãng',
        formula: 'H₂SO₄ (1 M)',
        state: 'liquid',
        concentration: '1 M',
        color: 0xf0fdf4,
        description: 'Dung dịch acid vô cơ mạnh không màu.',
        isHazardous: true,
      },
      {
        id: 'chem_na2so4',
        name: 'Dung dịch Sodium sulfate',
        formula: 'Na₂SO₄ (0.1 M)',
        state: 'liquid',
        concentration: '0.1 M',
        color: 0xf8fafc,
        description: 'Dung dịch muối sulfate tan tốt trong nước.',
      },
      {
        id: 'chem_hcl',
        name: 'Dung dịch Hydrochloric acid',
        formula: 'HCl (1 M)',
        state: 'liquid',
        concentration: '1 M',
        color: 0xf1f5f9,
        description: 'Acid dùng để thử độ tan của kết tủa sinh ra.',
        isHazardous: true,
      },
      {
        id: 'chem_water',
        name: 'Nước cất tinh khiết',
        formula: 'H₂O',
        state: 'liquid',
        color: 0xf8fafc,
        description: 'Dung môi làm môi trường phản ứng.',
      },
    ],
    reactionRules: [
      {
        id: 'rule_sulfate_bacl2',
        reactants: ['chem_bacl2', 'chem_h2so4_dilute'],
        phenomenon: 'Xuất hiện ngay kết tủa trắng đục (BaSO₄) lắng nhanh xuống đáy ống nghiệm.',
        liquidColorResult: 0xffffff,
        precipitateColor: 0xffffff,
        gasBubbleSpeed: 0,
        equation: 'BaCl₂ + H₂SO₄ \\rightarrow BaSO₄\\downarrow (trắng) + 2HCl',
        ionEquation: 'Ba^{2+} + SO_4^{2-} \\rightarrow BaSO_4\\downarrow',
        explanation: 'Ion Ba²⁺ phản ứng ngay với ion SO₄²⁻ sinh ra chất không tan BaSO₄ có tích số tan cực nhỏ (Ksp ≈ 1.1 × 10⁻¹⁰).',
        conclusion: 'Dùng BaCl₂ hoặc Ba(OH)₂ là thuốc thử đặc trưng số 1 để nhận biết ion sulfate (SO₄²⁻).',
      },
      {
        id: 'rule_na2so4_bacl2',
        reactants: ['chem_bacl2', 'chem_na2so4'],
        phenomenon: 'Xuất hiện kết tủa trắng tinh khiết BaSO₄ trong dung dịch trung tính.',
        liquidColorResult: 0xffffff,
        precipitateColor: 0xffffff,
        gasBubbleSpeed: 0,
        equation: 'BaCl₂ + Na₂SO₄ \\rightarrow BaSO₄\\downarrow (trắng) + 2NaCl',
        ionEquation: 'Ba^{2+} + SO_4^{2-} \\rightarrow BaSO_4\\downarrow',
        explanation: 'Muối BaCl₂ tác dụng với muối Na₂SO₄ tạo kết tủa trắng BaSO₄ và dung dịch NaCl.',
        conclusion: 'Phản ứng trao đổi ion trong dung dịch tạo kết tủa bền.',
      },
      {
        id: 'rule_bacl2_hcl',
        reactants: ['chem_bacl2', 'chem_hcl'],
        phenomenon: 'Dung dịch vẫn trong suốt hoàn toàn, không có kết tủa hay bọt khí.',
        liquidColorResult: 0xf8fafc,
        equation: 'BaCl₂ + HCl \\rightarrow Không phản ứng',
        explanation: 'Cả hai chất đều có cùng anion Cl⁻ và không thỏa mãn điều kiện phản ứng trao đổi ion (không có kết tủa, bay hơi hay điện li yếu).',
        conclusion: 'Không xảy ra phản ứng.',
      },
    ],
    safetyWarning: 'Các muối bari hòa tan (BaCl₂) có độc tính; đeo kính bảo hộ và găng tay, rửa tay bằng xà phòng sau khi thao tác.',
    teacherGuidingNotes: [
      'Cho học sinh quan sát trạng thái trong suốt ban đầu của hai dung dịch trước khi nhỏ giọt.',
      'Nhấn mạnh vào màu trắng đục và tính không tan của BaSO₄ ngay cả khi thêm acid HCl loãng dư.',
      'Yêu cầu học sinh phân biệt phản ứng nhận biết ion sulfate với ion chloride.',
    ],
    guidingQuestions: [
      'Vì sao kết tủa BaSO₄ không bị hòa tan khi ta nhỏ thêm dung dịch HCl vào ống nghiệm?',
      'Có thể dùng dung dịch Ba(NO₃)₂ hoặc Ba(OH)₂ thay thế cho BaCl₂ để nhận biết ion sulfate được không?',
    ],
    conclusionSummary: 'Ion Ba²⁺ là thuốc thử nhận biết đặc trưng cho ion SO₄²⁻ nhờ phản ứng tạo kết tủa trắng BaSO₄ không tan trong acid.',
    verifiedSource: 'SGK Hóa học 11 Kết nối tri thức với cuộc sống, Bài 7, trang 43.',
  },
  {
    id: 'lab_exp_na_water',
    grade: 10,
    lessonId: 'les_10_na',
    lessonName: 'Bài 15: Kim loại nhóm IA - Tính chất kim loại kiềm (SGK KNTT)',
    title: 'Thí nghiệm 2: Phản ứng của Natri (Na) với nước có phenolphthalein',
    objectives: [
      'Quan sát hiện tượng kim loại kiềm Natri phản ứng mãnh liệt với nước ở nhiệt độ thường.',
      'Giải thích hiện tượng viên Na nóng chảy vo tròn chạy trên mặt nước do phản ứng tỏa nhiệt lớn.',
      'Quan sát sự đổi màu của chất chỉ thị phenolphthalein từ không màu sang màu hồng đậm.',
    ],
    equipmentList: [
      'Chậu thủy tinh hoặc cốc 250 mL đựng nước cất',
      'Kẹp gắp kim loại',
      'Dao cắt kim loại khô ráo',
      'Giấy lọc hút dầu hỏa bảo quản',
    ],
    chemicalTray: [
      {
        id: 'chem_na_metal',
        name: 'Mẩu kim loại Natri',
        formula: 'Na (rắn)',
        state: 'solid',
        color: 0x94a3b8,
        description: 'Kim loại kiềm màu trắng bạc, mềm, bảo quản trong dầu hỏa.',
        isHazardous: true,
      },
      {
        id: 'chem_water',
        name: 'Nước cất tinh khiết',
        formula: 'H₂O',
        state: 'liquid',
        color: 0xf8fafc,
        description: 'Nước cất làm chất phản ứng.',
      },
      {
        id: 'chem_pp_indicator',
        name: 'Chất chỉ thị Phenolphthalein',
        formula: 'C₂₀H₁₄O₄',
        state: 'liquid',
        color: 0xf8fafc,
        description: 'Dung dịch chỉ thị kiềm (không màu trong môi trường trung tính/acid).',
      },
    ],
    reactionRules: [
      {
        id: 'rule_na_water',
        reactants: ['chem_na_metal', 'chem_water'],
        phenomenon: 'Mẩu Natri nóng chảy vo tròn thành hạt cầu sáng chạy nhanh trên mặt nước, sủi bọt khí H₂ nhanh, dung dịch chuyển sang màu hồng đậm rực rỡ.',
        liquidColorResult: 0xf43f5e,
        gasBubbleSpeed: 5,
        smokeEffect: true,
        equation: '2Na + 2H₂O \\rightarrow 2NaOH + H₂\\uparrow',
        ionEquation: '2Na + 2H_2O \\rightarrow 2Na^+ + 2OH^- + H_2\\uparrow',
        explanation: 'Thế điện cực chuẩn E°(Na⁺/Na) = -2.71 V rất âm, Na khử nước mãnh liệt tỏa nhiệt làm Na nóng chảy (t°nc = 97.8°C). Khí H₂ đẩy viên Na chạy. Ion OH⁻ sinh ra làm phenolphthalein hóa hồng.',
        conclusion: 'Kim loại kiềm có tính khử rất mạnh, phản ứng mãnh liệt với nước tạo dung dịch kiềm mạnh và khí hydrogen.',
      },
    ],
    safetyWarning: 'CỰC KỲ CẨN TRỌNG: Chỉ dùng mẩu natri nhỏ bằng hạt đỗ xanh. Dùng kẹp gắp khô ráo, đeo kính bảo hộ vì hạt Na có thể bắn tia lửa.',
    teacherGuidingNotes: [
      'Hướng dẫn học sinh quan sát bề mặt mờ của dầu hỏa và bề mặt sáng bóng sau khi cắt mẩu Na.',
      'Giải thích vì sao hạt Na nổi trên mặt nước (khối lượng riêng của Na d = 0.97 g/cm³ nhỏ hơn nước).',
    ],
    guidingQuestions: [
      'Tại sao mẩu natri lại tự vo tròn thành viên bi chuyển động trên mặt nước?',
      'Khí thoát ra là khí gì và dung dịch thu được có môi trường gì?',
    ],
    conclusionSummary: 'Natri khử nước dễ dàng ở nhiệt độ thường tạo hydroxide kim loại kiềm tan (NaOH) và giải phóng khí hydrogen.',
    verifiedSource: 'SGK Hóa học 10 Kết nối tri thức với cuộc sống, trang 88.',
  },
  {
    id: 'lab_exp_sugar_char',
    grade: 11,
    lessonId: 'les_11_sulfuric',
    lessonName: 'Bài 7: Sulfuric acid và muối sulfate (SGK KNTT)',
    title: 'Thí nghiệm 3: Tính háo nước của H₂SO₄ đặc với đường sucrose',
    objectives: [
      'Quan sát hiện tượng than hóa đường do tính háo nước mãnh liệt của sulfuric acid đặc.',
      'Quan sát cột than xốp màu đen dâng cao khỏi miệng cốc kèm khói trắng và mùi hắc.',
      'Hiểu rõ cơ chế phản ứng khử nước và phản ứng oxi hóa tiếp tục của C với H₂SO₄ đặc.',
    ],
    equipmentList: [
      'Cốc thủy tinh chịu nhiệt 100 mL',
      'Đũa thủy tinh dài',
      'Tủ hút khí độc chuyên dụng',
    ],
    chemicalTray: [
      {
        id: 'chem_h2so4_conc',
        name: 'Sulfuric acid đặc 98%',
        formula: 'H₂SO₄ (đặc)',
        state: 'liquid',
        concentration: '98%',
        color: 0x64748b,
        description: 'Chất lỏng sánh như dầu, háo nước và ăn mòn cực mạnh.',
        isHazardous: true,
      },
      {
        id: 'chem_sugar',
        name: 'Đường mía Sucrose',
        formula: 'C₁₂H₂₂O₁₁ (rắn)',
        state: 'solid',
        color: 0xf8fafc,
        description: 'Đường kính trắng dạng hạt nhỏ.',
      },
      {
        id: 'chem_water',
        name: 'Nước cất tinh khiết',
        formula: 'H₂O',
        state: 'liquid',
        color: 0xf8fafc,
        description: 'Nước cất.',
      },
    ],
    reactionRules: [
      {
        id: 'rule_sugar_h2so4',
        reactants: ['chem_sugar', 'chem_h2so4_conc'],
        phenomenon: 'Đường chuyển dần sang màu vàng nhạt, nâu rồi đen kịt; hỗn hợp sôi bùng và cột than xốp màu đen dâng trào khỏi miệng cốc kèm nhiều khói trắng và mùi hắc của SO₂.',
        liquidColorResult: 0x0f172a,
        precipitateColor: 0x020617,
        gasBubbleSpeed: 6,
        smokeEffect: true,
        equation: 'C₁₂H₂₂O₁₁ \\xrightarrow{H₂SO₄(đ)} 12C + 11H₂O ; C + 2H₂SO₄(đ) \\rightarrow CO₂\\uparrow + 2SO₂\\uparrow + 2H₂O',
        explanation: 'H₂SO₄ đặc chiếm phân tử nước của carbohydrate tạo carbon đen. Một phần than C tiếp tục bị H₂SO₄ đặc nóng oxi hóa tạo khí CO₂ và SO₂ đẩy khối than xốp trào lên.',
        conclusion: 'Sulfuric acid đặc có tính háo nước cực mạnh và tính oxi hóa mãnh liệt ở nhiệt độ cao.',
      },
    ],
    safetyWarning: 'NGUY HIỂM BỎNG NẶNG: Khí SO₂ sinh ra gây độc niêm mạc phổi. Thí nghiệm bắt buộc thực hiện trong tủ hút có thông gió tốt.',
    teacherGuidingNotes: [
      'Không dùng tay tiếp xúc gần miệng cốc sau khi nhỏ acid đặc vì nhiệt độ tỏa ra vượt quá 150°C.',
      'Nhắc nhở học sinh liên hệ bài học an toàn khi tiếp xúc với acid sulfuric.',
    ],
    guidingQuestions: [
      'Tại sao cột than xốp lại dâng cao vượt khỏi miệng cốc thủy tinh?',
      'Mùi hắc bốc lên trong thí nghiệm là do khí nào gây ra?',
    ],
    conclusionSummary: 'H₂SO₄ đặc hút nước dữ dội từ các hợp chất hữu cơ và oxi hóa carbon thành khí oxit.',
    verifiedSource: 'SGV Hóa học 11 Kết nối tri thức với cuộc sống, Bài 7, trang 58.',
  },
  {
    id: 'lab_exp_cu_naoh',
    grade: 11,
    lessonId: 'les_11_cu',
    lessonName: 'Bài 2: Sự điện li và phản ứng trao đổi ion trong dung dịch',
    title: 'Thí nghiệm 4: Phản ứng tạo kết tủa Cu(OH)₂ giữa CuSO₄ và NaOH',
    objectives: [
      'Quan sát phản ứng trao đổi ion tạo kết tủa xanh lam đặc trưng của đồng(II) hydroxide.',
      'Rèn luyện kỹ năng nhỏ giọt hóa chất và quan sát màu sắc kết tủa vô cơ.',
    ],
    equipmentList: [
      'Ống nghiệm thủy tinh',
      'Ống nhỏ giọt pipet',
      'Giá đỡ ống nghiệm',
    ],
    chemicalTray: [
      {
        id: 'chem_cuso4',
        name: 'Dung dịch Copper(II) sulfate',
        formula: 'CuSO₄ (0.5 M)',
        state: 'liquid',
        concentration: '0.5 M',
        color: 0x38bdf8,
        description: 'Dung dịch muối đồng màu xanh lam trong suốt.',
      },
      {
        id: 'chem_naoh',
        name: 'Dung dịch Sodium hydroxide',
        formula: 'NaOH (1 M)',
        state: 'liquid',
        concentration: '1 M',
        color: 0xf1f5f9,
        description: 'Dung dịch base kiềm mạnh.',
        isHazardous: true,
      },
      {
        id: 'chem_water',
        name: 'Nước cất tinh khiết',
        formula: 'H₂O',
        state: 'liquid',
        color: 0xf8fafc,
        description: 'Nước cất.',
      },
    ],
    reactionRules: [
      {
        id: 'rule_cu_naoh',
        reactants: ['chem_cuso4', 'chem_naoh'],
        phenomenon: 'Xuất hiện ngay kết tủa màu xanh lam tươi dạng keo của Cu(OH)₂ lắng dần xuống đáy.',
        liquidColorResult: 0x0284c7,
        precipitateColor: 0x0369a1,
        gasBubbleSpeed: 0,
        equation: 'CuSO₄ + 2NaOH \\rightarrow Cu(OH)₂\\downarrow (xanh lam) + Na₂SO₄',
        ionEquation: 'Cu^{2+} + 2OH^- \\rightarrow Cu(OH)_2\\downarrow',
        explanation: 'Ion Cu²⁺ kết hợp với ion OH⁻ tạo kết tủa hydroxide không tan Cu(OH)₂ có màu xanh lam đặc trưng.',
        conclusion: 'Dùng dung dịch kiềm (NaOH, KOH) để nhận biết ion Cu²⁺ trong dung dịch.',
      },
    ],
    safetyWarning: 'Tránh để dung dịch NaOH dính vào da hoặc mắt vì có tính ăn mòn da (xút ăn da).',
    teacherGuidingNotes: [
      'Cho học sinh so sánh màu xanh lam của dung dịch ban đầu với màu xanh lam đậm của chất kết tủa.',
    ],
    guidingQuestions: [
      'Kết tủa Cu(OH)₂ có tan được trong dung dịch acid HCl hay không?',
    ],
    conclusionSummary: 'Phản ứng tạo thành kết tủa Cu(OH)₂ màu xanh lam là dấu hiệu đặc trưng nhận biết muối Cu²⁺.',
    verifiedSource: 'SGK Hóa học 11 Kết nối tri thức với cuộc sống, trang 18.',
  },
];

