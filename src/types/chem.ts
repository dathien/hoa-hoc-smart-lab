export type UserRole = 'ADMIN' | 'DEPARTMENT_HEAD' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  assignedClassIds?: string[]; // for teachers/students
  linkedStudentId?: string; // for parents
  title?: string;
  subject?: string;
}

export interface Student {
  id: string; // Distinct code e.g., 'HS10001'
  studentCode: string;
  fullName: string;
  classId: string;
  className: string;
  gender: 'Nam' | 'Nữ';
  dob: string; // YYYY-MM-DD or empty
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  parentLinked?: boolean;
  isSampleAddition?: boolean; // For marked 9 students of 10A1
  notes?: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'ARCHIVED';
}

export interface Classroom {
  id: string;
  name: string; // '10A1', '11A1', '12A1'
  grade: 10 | 11 | 12;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  chemistryTeacherId: string;
  chemistryTeacherName: string;
  academicYear: string;
  studentCount: number;
}

export type QuestionType = 'MCQ' | 'MULTIPLE_TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
export type CognitiveLevel = 'NHAN_BIET' | 'THONG_HIEU' | 'VAN_DUNG' | 'VAN_DUNG_CAO';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D'
  content: string;
  isCorrect?: boolean;
}

export interface TrueFalseStatement {
  id: string;
  statement: string;
  isCorrect: boolean;
}

export interface EssayRubricStep {
  id: string;
  description: string;
  score: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  grade: 10 | 11 | 12;
  chapter: string;
  topic: string;
  requiredCompetency?: string;
  content: string;
  cognitiveLevel: CognitiveLevel;
  options?: QuestionOption[]; // for MCQ
  tfStatements?: TrueFalseStatement[]; // for MULTIPLE_TRUE_FALSE
  correctAnswer?: string; // for SHORT_ANSWER
  rubricGuide?: string; // for ESSAY
  rubricSteps?: EssayRubricStep[]; // Component scoring steps for ESSAY
  maxScore: number;
  explanation: string;
  hasExperimentData?: boolean;
  chemicalFormula?: string;
  diagramSvg?: string; // Embedded SVG apparatus/experiment diagram
  imageUrl?: string; // Attached image URL / data URL
  tableHtml?: string; // Attached data table HTML
  lockShuffleGroup?: string; // Group key for linked questions that should not separate
  isApproved?: boolean;
  authorId: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SubmissionStatus = 'SUBMITTED' | 'AUTO_GRADED' | 'NEEDS_REVIEW' | 'GRADED' | 'APPROVED';
export type PublishStatus = 'HIDDEN' | 'PUBLISHED' | 'CORRECTION_PENDING';

export interface TrueFalseScoringRule {
  mode: 'MOET_2025' | 'EQUAL_PER_ITEM' | 'CUSTOM';
  pointsFor1: number;
  pointsFor2: number;
  pointsFor3: number;
  pointsFor4: number;
}

export interface ExamSectionConfig {
  partKey: 'PART_I' | 'PART_II' | 'PART_III' | 'PART_IV';
  title: string;
  questionType: QuestionType;
  enabled: boolean;
  questionCount: number;
  totalScore: number;
  scorePerQuestion: number;
}

export interface ExamVariant {
  code: string; // e.g. '101', '102', '103', '104'
  questionIds: string[]; // Order of questions in this variant
  optionPermutations?: { [questionId: string]: string[] }; // e.g. ['C', 'A', 'D', 'B'] means Slot A <- orig C, Slot B <- orig A...
  tfOrderPermutations?: { [questionId: string]: string[] }; // Preserved order of TF statement IDs
  originalToShuffledMap?: { [originalQuestionId: string]: number }; // 1-based new question index
  answerKey: { [questionId: string]: string | { [key: string]: boolean } };
}

export type ExamLifecycleStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ACTIVE' | 'ASSIGNED' | 'CLOSED';

export interface Exam {
  id: string;
  title: string;
  subjectName?: string;
  grade: 10 | 11 | 12;
  schoolYear?: string;
  semester?: 1 | 2;
  examCategory?: 'THUONG_XUYEN' | 'GIUA_KY' | 'CUOI_KY' | 'LUYEN_THI_THPT';
  textbook?: 'KNTT' | 'CANH_DIEU' | 'CHAN_TROI' | 'CHUNG';
  lessonScope?: string;
  type: '15_MIN' | '30_MIN' | '45_MIN' | '50_MIN_THPT' | 'MID_TERM' | 'FINAL_TERM' | 'THPT_PRACTICE' | 'HOMEWORK';
  durationMinutes: number;
  assignedClassIds: string[];
  questionIds: string[];
  totalScore: number;
  targetTotalScore?: number;
  sections?: ExamSectionConfig[];
  opensAt?: string;
  deadline: string;
  attemptLimit?: number;
  allowShowScoreImmediately: boolean; // CORE REQUIREMENT: BẬT or TẮT
  allowShowAnswers: boolean;
  allowShowExplanations: boolean;
  allowShowFeedback: boolean;
  shuffleQuestions: boolean;
  shuffleOptions?: boolean;
  shuffleTfStatements?: boolean;
  variantCount?: number;
  variantRule?: '101_SERIES' | '201_SERIES' | 'CUSTOM';
  variantPrefix?: string;
  requireApprovedQuestions?: boolean;
  lockedQuestionIds?: string[];
  lockedGroups?: string[][];
  questionScores?: Record<string, number>;
  tfScoringRule?: TrueFalseScoringRule;
  questionTfRules?: Record<string, TrueFalseScoringRule>;
  essayComponentRubrics?: Record<string, EssayRubricStep[]>;
  questionOverrides?: Record<string, Question>;
  matrixId?: string;
  matrixTitle?: string;
  variants?: ExamVariant[];
  schoolName?: string;
  departmentName?: string;
  academicYear?: string;
  status: ExamLifecycleStatus;
  isLockedVersion?: boolean;
  needsResync?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}

// Cell-level Matrix Data (distinguishes null blank from valid 0)
export interface MatrixCellData {
  count: number | null;
  subItemCount?: number | null; // For MULTIPLE_TRUE_FALSE (số ý)
  points: number | null;
  note?: string;
}

// Matrix & Specification Models (Chương trình GDPT 2018)
export interface MatrixTopicRow {
  id: string;
  topicName: string; // Chương/Chủ đề
  unitLesson: string; // Nội dung kiến thức / Bài học
  requiredCompetency?: string; // Yêu cầu cần đạt
  mcq_nb: number;
  mcq_th: number;
  mcq_vd: number;
  mcq_vdc: number;
  tf_nb: number;
  tf_th: number;
  tf_vd: number;
  tf_vdc: number;
  short_nb: number;
  short_th: number;
  short_vd: number;
  short_vdc: number;
  essay_nb: number;
  essay_th: number;
  essay_vd: number;
  essay_vdc: number;
  totalScore: number;
  // Granular cell storage keyed by `${QuestionType}_${CognitiveLevel}`
  cells?: Record<string, MatrixCellData>;
}

export interface SpecificationItem {
  id: string;
  topicId: string;
  chapterName?: string;
  lessonName?: string;
  topicName: string;
  knowledgeContent?: string;
  requiredCompetency: string; // Yêu cầu cần đạt
  assessmentContent: string; // Mô tả yêu cầu đánh giá
  cognitiveLevel: CognitiveLevel; // NHAN_BIET | THONG_HIEU | VAN_DUNG | VAN_DUNG_CAO
  questionType: QuestionType; // MCQ | MULTIPLE_TRUE_FALSE | SHORT_ANSWER | ESSAY
  questionCount: number | null;
  subItemCount?: number | null; // Số ý (Đúng/Sai)
  scorePerQuestion: number;
  totalItemScore?: number; // Tổng điểm của dòng đặc tả
  linkedQuestionIds?: string[]; // Mã câu hỏi liên kết
  questionNumbersPreview?: string; // e.g. "Câu 1, 2"
}

export interface ExamMatrix {
  id: string;
  title: string;
  grade: 10 | 11 | 12;
  schoolYear: string; // e.g. '2026 - 2027'
  semester: 1 | 2;
  examType: 'THUONG_XUYEN' | 'GIUA_KY' | 'CUOI_KY' | 'LUYEN_THI_THPT';
  textbook: 'KNTT' | 'CANH_DIEU' | 'CHAN_TROI' | 'CHUNG';
  durationMinutes: number;
  totalScore: number;
  totalQuestions: number;
  tfScoringRule?: TrueFalseScoringRule;
  sourceReference?: string;
  isVerifiedContent: boolean;
  notes?: string;
  topics: MatrixTopicRow[];
  specifications: SpecificationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceSource {
  id: string;
  schoolName: string;
  grade: 10 | 11 | 12;
  schoolYear: string;
  semester: 1 | 2;
  examType: 'GIUA_KY' | 'CUOI_KY' | 'THUONG_XUYEN' | 'LUYEN_THI_THPT';
  publishDate: string;
  sourceUrl: string;
  isContentVerified: boolean;
  verificationNote: string;
  attachedFileUrl?: string;
}

export interface StudentAnswer {
  questionId: string;
  selectedOption?: string; // MCQ
  tfAnswers?: { [statementId: string]: boolean }; // TF
  shortText?: string; // Short answer
  essayText?: string; // Essay answer
  autoScore?: number;
  manualScore?: number;
  teacherComment?: string;
}

export interface Submission {
  id: string;
  assignmentId?: string; // Linked 4-step assignment
  examId: string;
  examTitle: string;
  variantCode?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  submittedAt: string;
  timeSpentSeconds?: number;
  answers: { [questionId: string]: StudentAnswer };
  
  // Grading & Approval
  submissionStatus: SubmissionStatus;
  publishStatus: PublishStatus;
  
  // Scores
  autoGradedScore?: number;
  finalScore?: number; // Only finalized after review or if auto-published
  teacherFeedback?: string;
  
  // Audit log for corrections
  adjustmentLogs: ScoreAdjustmentLog[];
}

export interface ScoreAdjustmentLog {
  adjustedAt: string;
  adjustedBy: string;
  previousScore: number;
  newScore: number;
  reason: string;
  version: number;
}

// Assignment Delivery 4-Step Models (Section XIII)
export type AssignmentStatus = 'DRAFT' | 'ASSIGNED' | 'ACTIVE' | 'EXPIRED' | 'CLOSED';

export interface Assignment {
  id: string;
  teacherId: string;
  examId: string;
  examTitle: string;
  targetClassIds: string[];
  targetStudentIds?: string[];
  assignedAt: string;
  opensAt: string;
  dueAt: string;
  durationMinutes: number;
  attemptLimit: number;
  publicationPolicy: 'IMMEDIATE' | 'TEACHER_APPROVAL';
  allowLateSubmission: boolean;
  status: AssignmentStatus;
  totalStudentsAssigned: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type RecipientStatus = 'NOT_OPENED' | 'IN_PROGRESS' | 'SUBMITTED' | 'OVERDUE';

export interface AssignmentRecipient {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  status: RecipientStatus;
  submissionId?: string;
  submittedAt?: string;
  score?: number;
  attemptsCount: number;
  timeSpentSeconds?: number;
}

// Flashcard Model (Section IV)
export interface FlashcardItem {
  id: string;
  grade: 10 | 11 | 12;
  chapter: string;
  unit: string;
  frontTitle: string;
  frontContent: string;
  frontFormula?: string;
  frontModel3D?: 'H2O' | 'H2SO4' | 'SO3' | 'CH4' | 'CO2' | 'NH3';
  backChemicalName: string;
  backFormula: string;
  backProperties: string[];
  backReactions: string[];
  backExplanation: string;
  category: 'Chất vô cơ' | 'Chất hữu cơ' | 'Quy tắc' | 'Hiện tượng' | 'Khái niệm';
  masteredStudentIds: string[]; // students who mastered this card
  isAssignedToClass?: boolean;
}

// Interactive Virtual 3D Lab Simulation Model (Section V)
export interface ChemicalItem {
  id: string;
  name: string;
  formula: string;
  state: 'liquid' | 'solid' | 'gas';
  concentration?: string; // e.g. "0.1 M", "Đặc 98%"
  color: number; // Hex color
  description: string;
  isHazardous?: boolean;
}

export interface LabReactionRule {
  id: string;
  reactants: string[]; // chemical IDs required
  minTemperature?: number; // C
  requiresHeater?: boolean;
  orderSensitive?: boolean;
  phenomenon: string;
  liquidColorResult: number;
  precipitateColor?: number;
  gasBubbleSpeed?: number;
  smokeEffect?: boolean;
  equation: string;
  ionEquation?: string;
  explanation: string;
  conclusion: string;
}

export interface LabExperimentDetail {
  id: string;
  grade: 10 | 11 | 12;
  lessonId: string;
  lessonName: string;
  title: string;
  objectives: string[];
  equipmentList: string[];
  chemicalTray: ChemicalItem[];
  reactionRules: LabReactionRule[];
  safetyWarning: string;
  teacherGuidingNotes: string[];
  guidingQuestions: string[];
  conclusionSummary: string;
  verifiedSource: string;
}

export interface LabSessionRecord {
  id: string;
  studentId: string;
  studentName: string;
  experimentId: string;
  experimentTitle: string;
  completedAt: string;
  actionsPerformed: string[];
  observedPhenomenon: string;
  teacherComment?: string;
}


export interface LessonMaterial {
  id: string;
  grade: 10 | 11 | 12;
  semester: 1 | 2;
  chapter: string;
  unit: string;
  title: string;
  theorySummary: string;
  equations: string[];
  keyFormulas: string[];
  molecularStructureInfo?: string;
  applications: string;
  experimentGuide?: string;
  worksheetTitle?: string;
  worksheetHtml?: string;
  updatedAt?: string;
}

export interface TeachingPlan {
  id: string;
  grade: 10 | 11 | 12;
  semester: 1 | 2;
  chapter: string;
  lessonTitle: string;
  week: number;
  period: number;
  objectives: string;
  equipment: string;
  worksheetTitle?: string;
  worksheetHtml?: string;
  status: 'DRAFT' | 'APPROVED' | 'COMPLETED';
}

export interface ZaloMessageLog {
  id: string;
  studentId: string;
  studentName: string;
  parentPhone: string;
  category: 'SCORE' | 'PROGRESS' | 'REMINDER' | 'PRAISE' | 'GENERAL';
  content: string; // Max ~150 chars
  charCount: number;
  sentAt: string;
  teacherId: string;
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole;
  targetUserId?: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkTo?: string;
}
