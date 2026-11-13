import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  Student,
  Classroom,
  Question,
  Exam,
  Submission,
  LessonMaterial,
  TeachingPlan,
  ZaloMessageLog,
  NotificationItem,
  UserRole,
  ScoreAdjustmentLog,
  ExamMatrix,
  ReferenceSource
} from '../types/chem';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  generateInitialStudents,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_SUBMISSIONS,
  INITIAL_LESSONS,
  INITIAL_TEACHING_PLANS,
  INITIAL_ZALO_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import {
  INITIAL_REFERENCE_SOURCES,
  INITIAL_MATRICES,
  EXTENDED_QUESTIONS,
} from '../data/initialMatrices';
import { richHtmlToPlainText } from '../utils/chemSyntax';

interface ChemStoreContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  activeRole: UserRole;

  // Students & Classes
  students: Student[];
  classes: Classroom[];
  addStudent: (student: Omit<Student, 'id'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  transferStudent: (id: string, newClassId: string, newClassName: string) => void;
  importStudentsBulk: (newStudents: Partial<Student>[]) => { added: number; errors: string[] };

  // Questions & Bank
  questions: Question[];
  addQuestion: (question: Omit<Question, 'id'>) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;

  // Matrices & Specifications (GDPT 2018)
  matrices: ExamMatrix[];
  referenceSources: ReferenceSource[];
  addMatrix: (matrix: Omit<ExamMatrix, 'id' | 'createdAt' | 'updatedAt'>) => ExamMatrix;
  updateMatrix: (id: string, updates: Partial<ExamMatrix>) => void;
  deleteMatrix: (id: string) => void;
  cloneMatrix: (id: string) => ExamMatrix;
  updateReferenceSource: (id: string, updates: Partial<ReferenceSource>) => void;

  // Exams & Tests
  exams: Exam[];
  createExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => Exam;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => { ok: boolean; message: string };
  duplicateExam: (id: string) => Exam | null;
  archiveExam: (id: string, archived: boolean) => void;
  toggleExamShowScoreImmediately: (examId: string, value: boolean) => void;

  // Submissions & Grading
  submissions: Submission[];
  submitExamAnswers: (
    examId: string,
    studentId: string,
    answers: { [qId: string]: { option?: string; tf?: { [k: string]: boolean }; short?: string; essay?: string } },
    variantCode?: string
  ) => Submission;
  regradeSubmission: (
    submissionId: string,
    newTotalScore: number,
    reason: string,
    teacherFeedback: string,
    questionManualScores?: { [qId: string]: number }
  ) => void;
  publishSubmissionScore: (submissionId: string, publish: boolean) => void;
  publishEntireClassScores: (examId: string, classId: string) => void;

  // Zalo Messenger
  zaloLogs: ZaloMessageLog[];
  logZaloMessage: (log: Omit<ZaloMessageLog, 'id' | 'sentAt'>) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;

  // Lessons & Teaching Plans (with Worksheets)
  lessons: LessonMaterial[];
  addLesson: (lesson: Omit<LessonMaterial, 'id'>) => LessonMaterial;
  updateLesson: (id: string, updates: Partial<LessonMaterial>) => void;
  deleteLesson: (id: string) => void;
  teachingPlans: TeachingPlan[];
  addTeachingPlan: (plan: Omit<TeachingPlan, 'id'>) => TeachingPlan;
  updateTeachingPlan: (id: string, updates: Partial<TeachingPlan>) => void;
  deleteTeachingPlan: (id: string) => void;

  // System & Connection State
  isFirebaseLive: boolean;
  toggleFirebaseMode: () => void;
  resetAllData: () => void;
}

const ChemStoreContext = createContext<ChemStoreContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'chem_edu_pro_v2_';

function loadOrInit<T>(key: string, defaultValue: () => T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  const val = defaultValue();
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch {}
  return val;
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch {}
}

export const ChemStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Users & Current User
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadOrInit('current_user', () => INITIAL_USERS[2]) // Teacher as default
  );

  // 2. Students & Classes
  const [students, setStudents] = useState<Student[]>(() =>
    loadOrInit('students', () => generateInitialStudents())
  );
  const [classes] = useState<Classroom[]>(INITIAL_CLASSES);

  // 3. Questions (including Grade 10, 11, 12 extended questions)
  const [questions, setQuestions] = useState<Question[]>(() =>
    loadOrInit('questions', () => {
      const existingIds = new Set(INITIAL_QUESTIONS.map((q) => q.id));
      const extended = EXTENDED_QUESTIONS.filter((q) => !existingIds.has(q.id));
      return [...INITIAL_QUESTIONS, ...extended];
    })
  );

  // 3.1. Exam Matrices & Benchmark Specifications (GDPT 2018)
  const [matrices, setMatrices] = useState<ExamMatrix[]>(() =>
    loadOrInit('exam_matrices', () => INITIAL_MATRICES)
  );

  // 3.2. Reference Sources from Schools
  const [referenceSources, setReferenceSources] = useState<ReferenceSource[]>(() =>
    loadOrInit('reference_sources', () => INITIAL_REFERENCE_SOURCES)
  );

  // 4. Exams
  const [exams, setExams] = useState<Exam[]>(() =>
    loadOrInit('exams', () => INITIAL_EXAMS)
  );

  // 5. Submissions
  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    loadOrInit('submissions', () => INITIAL_SUBMISSIONS)
  );

  // 6. Zalo & Notifications
  const [zaloLogs, setZaloLogs] = useState<ZaloMessageLog[]>(() =>
    loadOrInit('zalo_logs', () => INITIAL_ZALO_LOGS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadOrInit('notifications', () => INITIAL_NOTIFICATIONS)
  );

  // 7. Lessons & Teaching Plans
  const [lessons, setLessons] = useState<LessonMaterial[]>(() =>
    loadOrInit('lessons', () => INITIAL_LESSONS)
  );
  const [teachingPlans, setTeachingPlans] = useState<TeachingPlan[]>(() =>
    loadOrInit('teaching_plans', () => INITIAL_TEACHING_PLANS)
  );

  // 8. Firebase mode toggle indicator
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(false);

  // Safe one-time cleanup of unused Hero Cards localStorage data without touching shared learning data
  useEffect(() => {
    try {
      const legacyHeroKey = STORAGE_KEY_PREFIX + 'hero_cards';
      const rawHero = localStorage.getItem(legacyHeroKey);
      if (rawHero) {
        const backupKey = STORAGE_KEY_PREFIX + 'hero_cards_backup';
        if (!localStorage.getItem(backupKey)) {
          localStorage.setItem(backupKey, rawHero);
        }
        localStorage.removeItem(legacyHeroKey);
      }
    } catch {}
  }, []);

  // Sync back to localStorage whenever core state updates
  useEffect(() => save('current_user', currentUser), [currentUser]);
  useEffect(() => save('students', students), [students]);
  useEffect(() => save('questions', questions), [questions]);
  useEffect(() => save('exams', exams), [exams]);
  useEffect(() => save('exam_matrices', matrices), [matrices]);
  useEffect(() => save('reference_sources', referenceSources), [referenceSources]);
  useEffect(() => save('submissions', submissions), [submissions]);
  useEffect(() => save('zalo_logs', zaloLogs), [zaloLogs]);
  useEffect(() => save('notifications', notifications), [notifications]);
  useEffect(() => save('lessons', lessons), [lessons]);
  useEffect(() => save('teaching_plans', teachingPlans), [teachingPlans]);

  // Switch User
  const switchUser = (userId: string) => {
    const user = INITIAL_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  // Student CRUD operations
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newId = studentData.studentCode || `HS${Date.now().toString().slice(-6)}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      studentCode: newId,
    };
    setStudents((prev) => [newStudent, ...prev]);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const transferStudent = (id: string, newClassId: string, newClassName: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, classId: newClassId, className: newClassName, notes: `Đã chuyển sang ${newClassName}` }
          : s
      )
    );
  };

  const importStudentsBulk = (newStudentsList: Partial<Student>[]) => {
    const addedList: Student[] = [];
    const errors: string[] = [];

    newStudentsList.forEach((item, idx) => {
      if (!item.fullName) {
        errors.push(`Dòng ${idx + 1}: Thiếu họ tên học sinh`);
        return;
      }
      const existingCode = item.studentCode && students.some((s) => s.studentCode === item.studentCode);
      const code = existingCode || !item.studentCode ? `HS${Date.now().toString().slice(-5)}${idx}` : item.studentCode;

      const st: Student = {
        id: code,
        studentCode: code,
        fullName: item.fullName,
        classId: item.classId || 'class_11a1',
        className: item.className || '11A1',
        gender: item.gender === 'Nữ' ? 'Nữ' : 'Nam',
        dob: item.dob || '',
        phone: item.phone || '',
        parentName: item.parentName || `Phụ huynh em ${item.fullName}`,
        parentPhone: item.parentPhone || '',
        parentLinked: false,
        status: 'ACTIVE',
        isSampleAddition: false,
      };
      addedList.push(st);
    });

    if (addedList.length > 0) {
      setStudents((prev) => [...addedList, ...prev]);
    }

    return { added: addedList.length, errors };
  };

  // Question CRUD
  const addQuestion = (qData: Omit<Question, 'id'>) => {
    const newQ: Question = {
      ...qData,
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuestions((prev) => [newQ, ...prev]);
    return newQ;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q))
    );
    // Mark exams containing this question that already have variants as needing resync (Section IX)
    setExams((prev) =>
      prev.map((ex) => {
        if (ex.questionIds.includes(id) && ex.variants && ex.variants.length > 0) {
          return {
            ...ex,
            needsResync: true,
            updatedAt: new Date().toISOString(),
          };
        }
        return ex;
      })
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Matrix CRUD & Clone
  const addMatrix = (mData: Omit<ExamMatrix, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newM: ExamMatrix = {
      ...mData,
      id: `matrix_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMatrices((prev) => [newM, ...prev]);
    return newM;
  };

  const updateMatrix = (id: string, updates: Partial<ExamMatrix>) => {
    setMatrices((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      )
    );
  };

  const deleteMatrix = (id: string) => {
    setMatrices((prev) => prev.filter((m) => m.id !== id));
  };

  const cloneMatrix = (id: string) => {
    const source = matrices.find((m) => m.id === id) || INITIAL_MATRICES[0];
    const cloned: ExamMatrix = {
      ...source,
      id: `matrix_copy_${Date.now()}`,
      title: `${source.title} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topics: source.topics.map((t) => ({ ...t, id: `top_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` })),
      specifications: source.specifications.map((s) => ({ ...s, id: `spec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` })),
    };
    setMatrices((prev) => [cloned, ...prev]);
    return cloned;
  };

  const updateReferenceSource = (id: string, updates: Partial<ReferenceSource>) => {
    setReferenceSources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  // Exam CRUD & Toggle
  const createExam = (examData: Omit<Exam, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const newExam: Exam = {
      ...examData,
      id: `exam_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setExams((prev) => [newExam, ...prev]);
    return newExam;
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  };

  const deleteExam = (id: string): { ok: boolean; message: string } => {
    const target = exams.find((e) => e.id === id);
    if (!target) return { ok: false, message: 'Không tìm thấy đề kiểm tra.' };
    const hasSubs = submissions.some((s) => s.examId === id);
    if (hasSubs || target.status === 'ASSIGNED' || target.status === 'ACTIVE') {
      if (hasSubs) {
        return {
          ok: false,
          message: 'Không thể xóa đề đã có học sinh làm bài hoặc đã lưu kết quả. Hãy dùng chức năng "Lưu trữ".',
        };
      }
    }
    setExams((prev) => prev.filter((e) => e.id !== id));
    return { ok: true, message: 'Đã xóa đề kiểm tra thành công.' };
  };

  const duplicateExam = (id: string): Exam | null => {
    const source = exams.find((e) => e.id === id);
    if (!source) return null;
    const now = new Date().toISOString();
    const copy: Exam = {
      ...JSON.parse(JSON.stringify(source)),
      id: `exam_copy_${Date.now()}`,
      title: `${source.title} (Bản sao)`,
      status: 'DRAFT',
      isLockedVersion: false,
      needsResync: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    setExams((prev) => [copy, ...prev]);
    return copy;
  };

  const archiveExam = (id: string, archived: boolean) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, isArchived: archived, updatedAt: new Date().toISOString() } : e
      )
    );
  };

  const toggleExamShowScoreImmediately = (examId: string, value: boolean) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId ? { ...e, allowShowScoreImmediately: value, updatedAt: new Date().toISOString() } : e
      )
    );
  };

  // Exam Submission & Auto-grading engine (Variant-aware + TF stepped scoring)
  const submitExamAnswers = (
    examId: string,
    studentId: string,
    answersPayload: {
      [qId: string]: {
        option?: string;
        tf?: { [k: string]: boolean };
        short?: string;
        essay?: string;
      };
    },
    variantCode?: string
  ) => {
    const exam = exams.find((e) => e.id === examId);
    const student = students.find((s) => s.id === studentId);
    const activeVariant = variantCode
      ? exam?.variants?.find((v) => v.code === variantCode)
      : exam?.variants?.[0];

    const submissionAnswers: { [qId: string]: any } = {};
    let calculatedAutoScore = 0;
    let hasEssayQuestion = false;

    const orderedQIds = activeVariant ? activeVariant.questionIds : exam?.questionIds || [];

    // Run Auto-Grading Engine against Exam-specific Question Overrides & Question Bank & Variant Answer Key
    orderedQIds.forEach((qId) => {
      const q = exam?.questionOverrides?.[qId] || questions.find((item) => item.id === qId);
      const ans = answersPayload[qId];

      if (!q) return;

      const qMaxScore = exam?.questionScores?.[qId] ?? q.maxScore;
      let scoreForThis = 0;

      if (q.type === 'MCQ') {
        const variantCorrectOpt =
          (activeVariant?.answerKey?.[qId] as string | undefined) ||
          q.options?.find((o) => o.isCorrect)?.id;
        if (ans?.option && ans.option === variantCorrectOpt) {
          scoreForThis = qMaxScore;
        }
        submissionAnswers[qId] = {
          questionId: qId,
          selectedOption: ans?.option,
          autoScore: scoreForThis,
        };
      } else if (q.type === 'MULTIPLE_TRUE_FALSE') {
        let correctCount = 0;
        q.tfStatements?.forEach((st) => {
          if (ans?.tf && ans.tf[st.id] === st.isCorrect) {
            correctCount++;
          }
        });
        const tfRule = exam?.questionTfRules?.[qId] || exam?.tfScoringRule;
        if (tfRule && tfRule.mode !== 'EQUAL_PER_ITEM') {
          if (correctCount === 1) scoreForThis = tfRule.pointsFor1;
          else if (correctCount === 2) scoreForThis = tfRule.pointsFor2;
          else if (correctCount === 3) scoreForThis = tfRule.pointsFor3;
          else if (correctCount === 4) scoreForThis = tfRule.pointsFor4;
          else scoreForThis = 0;
        } else {
          const total = q.tfStatements?.length || 1;
          scoreForThis = Number(((correctCount / total) * qMaxScore).toFixed(2));
        }
        submissionAnswers[qId] = {
          questionId: qId,
          tfAnswers: ans?.tf,
          autoScore: scoreForThis,
        };
      } else if (q.type === 'SHORT_ANSWER') {
        const expectedShort = richHtmlToPlainText(q.correctAnswer || '')
          .trim()
          .replace(',', '.')
          .toLowerCase();
        if (
          ans?.short &&
          expectedShort &&
          ans.short.trim().replace(',', '.').toLowerCase() === expectedShort
        ) {
          scoreForThis = qMaxScore;
        }
        submissionAnswers[qId] = {
          questionId: qId,
          shortText: ans?.short,
          autoScore: scoreForThis,
        };
      } else if (q.type === 'ESSAY') {
        hasEssayQuestion = true;
        submissionAnswers[qId] = {
          questionId: qId,
          essayText: ans?.essay,
          autoScore: 0, // Essay must be graded manually by teacher
          manualScore: 0,
        };
      }

      calculatedAutoScore = Math.round((calculatedAutoScore + scoreForThis) * 100) / 100;
    });

    // Check publication eligibility
    const canPublishImmediately =
      Boolean(exam?.allowShowScoreImmediately) && !hasEssayQuestion;

    const newSubmission: Submission = {
      id: `sub_${studentId}_${examId}_${Date.now()}`,
      examId,
      examTitle: exam?.title || 'Bài kiểm tra Hóa học',
      variantCode: activeVariant?.code,
      studentId,
      studentName: student?.fullName || 'Học sinh',
      studentCode: student?.studentCode || studentId,
      classId: student?.classId || 'class_11a1',
      className: student?.className || '11A1',
      submittedAt: new Date().toISOString(),
      answers: submissionAnswers,
      submissionStatus: hasEssayQuestion ? 'NEEDS_REVIEW' : 'AUTO_GRADED',
      publishStatus: canPublishImmediately ? 'PUBLISHED' : 'HIDDEN',
      autoGradedScore: calculatedAutoScore,
      finalScore: canPublishImmediately ? calculatedAutoScore : undefined,
      teacherFeedback: canPublishImmediately
        ? 'Hệ thống đã tự động chấm điểm bài làm của bạn.'
        : '',
      adjustmentLogs: [],
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    // Send notification to Teacher
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      targetRole: 'TEACHER',
      title: 'Học sinh vừa nộp bài kiểm tra',
      message: `${student?.fullName || 'Học sinh'} (${student?.className || 'Lớp'}) đã nộp bài ${exam?.title}. ${
        hasEssayQuestion ? 'Cần chấm câu tự luận.' : 'Đã tự chấm điểm.'
      }`,
      createdAt: new Date().toISOString(),
      read: false,
      linkTo: 'grading',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newSubmission;
  };

  // Re-grading by Teacher with Audit Logging
  const regradeSubmission = (
    submissionId: string,
    newTotalScore: number,
    reason: string,
    teacherFeedback: string,
    questionManualScores?: { [qId: string]: number }
  ) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;

        const prevScore = sub.finalScore ?? sub.autoGradedScore ?? 0;
        const newLog: ScoreAdjustmentLog = {
          adjustedAt: new Date().toISOString(),
          adjustedBy: currentUser.name,
          previousScore: prevScore,
          newScore: newTotalScore,
          reason: reason || 'Giáo viên rà soát và điều chỉnh điểm',
          version: sub.adjustmentLogs.length + 1,
        };

        const updatedAnswers = { ...sub.answers };
        if (questionManualScores) {
          Object.keys(questionManualScores).forEach((qId) => {
            if (updatedAnswers[qId]) {
              updatedAnswers[qId] = {
                ...updatedAnswers[qId],
                manualScore: questionManualScores[qId],
              };
            }
          });
        }

        return {
          ...sub,
          answers: updatedAnswers,
          submissionStatus: 'APPROVED',
          finalScore: newTotalScore,
          teacherFeedback,
          adjustmentLogs: [newLog, ...sub.adjustmentLogs],
        };
      })
    );
  };

  // Publish Individual Score
  const publishSubmissionScore = (submissionId: string, publish: boolean) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;
        const nextStatus = publish ? 'PUBLISHED' : 'HIDDEN';

        // Notify student if published
        if (publish) {
          const notif: NotificationItem = {
            id: `notif_pub_${Date.now()}`,
            targetRole: 'STUDENT',
            targetUserId: sub.studentId,
            title: 'Điểm kiểm tra của bạn đã được công bố!',
            message: `Bài kiểm tra "${sub.examTitle}" đã được duyệt điểm: ${sub.finalScore ?? sub.autoGradedScore} điểm.`,
            createdAt: new Date().toISOString(),
            read: false,
            linkTo: 'results',
          };
          setNotifications((n) => [notif, ...n]);
        }

        return {
          ...sub,
          publishStatus: nextStatus,
        };
      })
    );
  };

  // Publish Entire Class Scores
  const publishEntireClassScores = (examId: string, classId: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.examId === examId && sub.classId === classId) {
          return {
            ...sub,
            submissionStatus: 'APPROVED',
            publishStatus: 'PUBLISHED',
          };
        }
        return sub;
      })
    );

    // Push class-wide notification
    const notif: NotificationItem = {
      id: `notif_pub_all_${Date.now()}`,
      targetRole: 'STUDENT',
      title: 'Đã công bố điểm cho toàn lớp!',
      message: `Giáo viên đã công bố toàn bộ điểm bài kiểm tra cho tập thể lớp.`,
      createdAt: new Date().toISOString(),
      read: false,
      linkTo: 'results',
    };
    setNotifications((n) => [notif, ...n]);
  };

  // Zalo Messenger logging
  const logZaloMessage = (logData: Omit<ZaloMessageLog, 'id' | 'sentAt'>) => {
    const newLog: ZaloMessageLog = {
      ...logData,
      id: `zalo_${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    setZaloLogs((prev) => [newLog, ...prev]);
  };

  // Mark notification read
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Lessons & Teaching Plan CRUD
  const addLesson = (lessonData: Omit<LessonMaterial, 'id'>): LessonMaterial => {
    const newLesson: LessonMaterial = {
      ...lessonData,
      id: `lesson_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setLessons((prev) => [newLesson, ...prev]);
    return newLesson;
  };

  const updateLesson = (id: string, updates: Partial<LessonMaterial>) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    );
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const addTeachingPlan = (planData: Omit<TeachingPlan, 'id'>): TeachingPlan => {
    const newPlan: TeachingPlan = {
      ...planData,
      id: `plan_${Date.now()}`,
    };
    setTeachingPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  };

  const updateTeachingPlan = (id: string, updates: Partial<TeachingPlan>) => {
    setTeachingPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteTeachingPlan = (id: string) => {
    setTeachingPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Toggle Firebase Live simulation
  const toggleFirebaseMode = () => {
    setIsFirebaseLive((prev) => !prev);
  };

  // Reset to initial baseline
  const resetAllData = () => {
    localStorage.clear();
    setStudents(generateInitialStudents());
    setQuestions(INITIAL_QUESTIONS);
    setExams(INITIAL_EXAMS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setZaloLogs(INITIAL_ZALO_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setMatrices(INITIAL_MATRICES);
    setReferenceSources(INITIAL_REFERENCE_SOURCES);
    setLessons(INITIAL_LESSONS);
    setTeachingPlans(INITIAL_TEACHING_PLANS);
    setCurrentUser(INITIAL_USERS[2]);
  };

  return (
    <ChemStoreContext.Provider
      value={{
        currentUser,
        availableUsers: INITIAL_USERS,
        switchUser,
        activeRole: currentUser.role,

        students,
        classes,
        addStudent,
        updateStudent,
        deleteStudent,
        transferStudent,
        importStudentsBulk,

        questions,
        addQuestion,
        updateQuestion,
        deleteQuestion,

        matrices,
        referenceSources,
        addMatrix,
        updateMatrix,
        deleteMatrix,
        cloneMatrix,
        updateReferenceSource,

        exams,
        createExam,
        updateExam,
        deleteExam,
        duplicateExam,
        archiveExam,
        toggleExamShowScoreImmediately,

        submissions,
        submitExamAnswers,
        regradeSubmission,
        publishSubmissionScore,
        publishEntireClassScores,

        zaloLogs,
        logZaloMessage,

        notifications,
        markNotificationRead,

        lessons,
        addLesson,
        updateLesson,
        deleteLesson,
        teachingPlans,
        addTeachingPlan,
        updateTeachingPlan,
        deleteTeachingPlan,

        isFirebaseLive,
        toggleFirebaseMode,
        resetAllData,
      }}
    >
      {children}
    </ChemStoreContext.Provider>
  );
};

export const useChemStore = () => {
  const context = useContext(ChemStoreContext);
  if (!context) {
    throw new Error('useChemStore must be used within a ChemStoreProvider');
  }
  return context;
};
