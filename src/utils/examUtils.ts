import {
  CognitiveLevel,
  Exam,
  ExamMatrix,
  ExamSectionConfig,
  ExamVariant,
  MatrixCellData,
  MatrixTopicRow,
  Question,
  QuestionType,
  SpecificationItem,
  TrueFalseScoringRule,
} from '../types/chem';

export const DEFAULT_TF_SCORING_RULE: TrueFalseScoringRule = {
  mode: 'MOET_2025',
  pointsFor1: 0.1,
  pointsFor2: 0.25,
  pointsFor3: 0.5,
  pointsFor4: 1.0,
};

export const QUESTION_TYPES: QuestionType[] = [
  'MCQ',
  'MULTIPLE_TRUE_FALSE',
  'SHORT_ANSWER',
  'ESSAY',
];

export const COGNITIVE_LEVELS: CognitiveLevel[] = [
  'NHAN_BIET',
  'THONG_HIEU',
  'VAN_DUNG',
  'VAN_DUNG_CAO',
];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: 'Trắc nghiệm nhiều lựa chọn',
  MULTIPLE_TRUE_FALSE: 'Trắc nghiệm Đúng/Sai',
  SHORT_ANSWER: 'Trả lời ngắn',
  ESSAY: 'Tự luận',
};

export const COGNITIVE_LEVEL_LABELS: Record<CognitiveLevel, string> = {
  NHAN_BIET: 'Nhận biết',
  THONG_HIEU: 'Thông hiểu',
  VAN_DUNG: 'Vận dụng',
  VAN_DUNG_CAO: 'Vận dụng cao',
};

export const cellKey = (type: QuestionType, level: CognitiveLevel): string =>
  `${type}_${level}`;

const LEGACY_FIELD_MAP: Record<string, keyof MatrixTopicRow> = {
  MCQ_NHAN_BIET: 'mcq_nb',
  MCQ_THONG_HIEU: 'mcq_th',
  MCQ_VAN_DUNG: 'mcq_vd',
  MCQ_VAN_DUNG_CAO: 'mcq_vdc',
  MULTIPLE_TRUE_FALSE_NHAN_BIET: 'tf_nb',
  MULTIPLE_TRUE_FALSE_THONG_HIEU: 'tf_th',
  MULTIPLE_TRUE_FALSE_VAN_DUNG: 'tf_vd',
  MULTIPLE_TRUE_FALSE_VAN_DUNG_CAO: 'tf_vdc',
  SHORT_ANSWER_NHAN_BIET: 'short_nb',
  SHORT_ANSWER_THONG_HIEU: 'short_th',
  SHORT_ANSWER_VAN_DUNG: 'short_vd',
  SHORT_ANSWER_VAN_DUNG_CAO: 'short_vdc',
  ESSAY_NHAN_BIET: 'essay_nb',
  ESSAY_THONG_HIEU: 'essay_th',
  ESSAY_VAN_DUNG: 'essay_vd',
  ESSAY_VAN_DUNG_CAO: 'essay_vdc',
};

export const DEFAULT_SCORE_PER_TYPE: Record<QuestionType, number> = {
  MCQ: 0.25,
  MULTIPLE_TRUE_FALSE: 1.0,
  SHORT_ANSWER: 0.5,
  ESSAY: 1.0,
};

/**
 * Parse raw input string for non-negative integer count.
 * Distinguishes blank/empty string (returns null) from valid '0' (returns 0).
 * Never coerces 0 into 1!
 */
export function parseNonNegativeIntOrNull(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

/**
 * Parse raw input string for non-negative decimal points.
 * Distinguishes blank/empty string (returns null) from valid '0' (returns 0).
 */
export function parseNonNegativeDecimalOrNull(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 1000) / 1000;
}

/**
 * Read cell data from a MatrixTopicRow, falling back cleanly to legacy numeric fields.
 */
export function getMatrixCell(
  row: MatrixTopicRow,
  type: QuestionType,
  level: CognitiveLevel,
  tfRule?: TrueFalseScoringRule
): MatrixCellData {
  const key = cellKey(type, level);
  if (row.cells && row.cells[key] !== undefined) {
    return row.cells[key];
  }
  const legacyKey = LEGACY_FIELD_MAP[key];
  const legacyCount = Number(row[legacyKey] ?? 0);
  const unitPoint =
    type === 'MULTIPLE_TRUE_FALSE'
      ? tfRule?.pointsFor4 ?? 1.0
      : DEFAULT_SCORE_PER_TYPE[type];
  return {
    count: legacyCount,
    subItemCount: type === 'MULTIPLE_TRUE_FALSE' ? legacyCount * 4 : undefined,
    points: legacyCount > 0 ? Math.round(legacyCount * unitPoint * 1000) / 1000 : 0,
    note: '',
  };
}

/**
 * Update a cell in MatrixTopicRow and sync legacy numeric field + row.totalScore.
 */
export function setMatrixCell(
  row: MatrixTopicRow,
  type: QuestionType,
  level: CognitiveLevel,
  patch: Partial<MatrixCellData>,
  tfRule?: TrueFalseScoringRule
): MatrixTopicRow {
  const key = cellKey(type, level);
  const prev = getMatrixCell(row, type, level, tfRule);
  const nextCell: MatrixCellData = {
    ...prev,
    ...patch,
  };

  const nextCells: Record<string, MatrixCellData> = {
    ...(row.cells || {}),
    [key]: nextCell,
  };

  // Ensure all other cells exist in cells map if initializing cells for the first time
  if (!row.cells) {
    for (const qt of QUESTION_TYPES) {
      for (const lv of COGNITIVE_LEVELS) {
        const k = cellKey(qt, lv);
        if (k !== key) {
          nextCells[k] = getMatrixCell(row, qt, lv, tfRule);
        }
      }
    }
  }

  const legacyField = LEGACY_FIELD_MAP[key];
  const updatedRow: MatrixTopicRow = {
    ...row,
    [legacyField]: nextCell.count ?? 0,
    cells: nextCells,
  };

  // Recompute row totalScore from all cell points
  let rowScore = 0;
  for (const qt of QUESTION_TYPES) {
    for (const lv of COGNITIVE_LEVELS) {
      const c = getMatrixCell(updatedRow, qt, lv, tfRule);
      rowScore += Number(c.points ?? 0);
    }
  }
  updatedRow.totalScore = Math.round(rowScore * 1000) / 1000;
  return updatedRow;
}

export interface MatrixMismatch {
  topicId: string;
  topicName: string;
  questionType: QuestionType;
  cognitiveLevel: CognitiveLevel;
  matrixCount: number;
  specCount: number;
  matrixScore: number;
  specScore: number;
  reason: string;
}

export interface MatrixSummary {
  totalQuestions: number;
  totalSubItemsTF: number;
  totalScore: number;
  hasBlankCells: boolean;
  byTopic: Record<string, { count: number; score: number }>;
  byLevel: Record<CognitiveLevel, { count: number; score: number; percent: number }>;
  byType: Record<QuestionType, { count: number; score: number; subItems: number }>;
  mismatches: MatrixMismatch[];
}

export function computeMatrixSummary(
  matrix: ExamMatrix,
  overrideTfRule?: TrueFalseScoringRule
): MatrixSummary {
  const tfRule = overrideTfRule || matrix.tfScoringRule || DEFAULT_TF_SCORING_RULE;
  const byTopic: Record<string, { count: number; score: number }> = {};
  const byLevel: Record<CognitiveLevel, { count: number; score: number; percent: number }> = {
    NHAN_BIET: { count: 0, score: 0, percent: 0 },
    THONG_HIEU: { count: 0, score: 0, percent: 0 },
    VAN_DUNG: { count: 0, score: 0, percent: 0 },
    VAN_DUNG_CAO: { count: 0, score: 0, percent: 0 },
  };
  const byType: Record<QuestionType, { count: number; score: number; subItems: number }> = {
    MCQ: { count: 0, score: 0, subItems: 0 },
    MULTIPLE_TRUE_FALSE: { count: 0, score: 0, subItems: 0 },
    SHORT_ANSWER: { count: 0, score: 0, subItems: 0 },
    ESSAY: { count: 0, score: 0, subItems: 0 },
  };

  let totalQuestions = 0;
  let totalSubItemsTF = 0;
  let totalScore = 0;
  let hasBlankCells = false;

  for (const row of matrix.topics) {
    let rowCount = 0;
    let rowScore = 0;
    for (const qt of QUESTION_TYPES) {
      for (const lv of COGNITIVE_LEVELS) {
        const cell = getMatrixCell(row, qt, lv, tfRule);
        if (cell.count === null) {
          hasBlankCells = true;
        }
        const qCount = cell.count ?? 0;
        const qPoints = cell.points ?? 0;

        rowCount += qCount;
        rowScore += qPoints;

        byLevel[lv].count += qCount;
        byLevel[lv].score += qPoints;

        byType[qt].count += qCount;
        byType[qt].score += qPoints;
        if (qt === 'MULTIPLE_TRUE_FALSE') {
          const subs = cell.subItemCount ?? qCount * 4;
          byType[qt].subItems += subs;
          totalSubItemsTF += subs;
        }
      }
    }
    byTopic[row.id] = {
      count: rowCount,
      score: Math.round(rowScore * 1000) / 1000,
    };
    totalQuestions += rowCount;
    totalScore += rowScore;
  }

  totalScore = Math.round(totalScore * 1000) / 1000;
  const denom = totalScore > 0 ? totalScore : 1;
  for (const lv of COGNITIVE_LEVELS) {
    byLevel[lv].score = Math.round(byLevel[lv].score * 1000) / 1000;
    byLevel[lv].percent = Math.round((byLevel[lv].score / denom) * 1000) / 10;
  }
  for (const qt of QUESTION_TYPES) {
    byType[qt].score = Math.round(byType[qt].score * 1000) / 1000;
  }

  // Detect Matrix <-> Specification mismatches
  const mismatches: MatrixMismatch[] = [];
  for (const row of matrix.topics) {
    for (const qt of QUESTION_TYPES) {
      for (const lv of COGNITIVE_LEVELS) {
        const cell = getMatrixCell(row, qt, lv, tfRule);
        const mCount = cell.count ?? 0;
        const mScore = Math.round((cell.points ?? 0) * 1000) / 1000;

        const matchingSpecs = matrix.specifications.filter(
          (s) =>
            (s.topicId === row.id || s.topicName === row.topicName) &&
            s.questionType === qt &&
            s.cognitiveLevel === lv
        );
        const sCount = matchingSpecs.reduce((acc, s) => acc + (s.questionCount ?? 0), 0);
        const sScore = Math.round(
          matchingSpecs.reduce(
            (acc, s) =>
              acc +
              (s.totalItemScore !== undefined
                ? s.totalItemScore
                : (s.questionCount ?? 0) * (s.scorePerQuestion ?? 0)),
            0
          ) * 1000
        ) / 1000;

        if (mCount !== sCount || (mCount > 0 && Math.abs(mScore - sScore) > 0.01)) {
          mismatches.push({
            topicId: row.id,
            topicName: row.topicName,
            questionType: qt,
            cognitiveLevel: lv,
            matrixCount: mCount,
            specCount: sCount,
            matrixScore: mScore,
            specScore: sScore,
            reason:
              mCount !== sCount
                ? `Số câu lệch: Ma trận ${mCount} câu, Bản đặc tả ${sCount} câu`
                : `Điểm lệch: Ma trận ${mScore}đ, Bản đặc tả ${sScore}đ`,
          });
        }
      }
    }
  }

  return {
    totalQuestions,
    totalSubItemsTF,
    totalScore,
    hasBlankCells,
    byTopic,
    byLevel,
    byType,
    mismatches,
  };
}

/**
 * Sync Matrix cell targets -> Specification rows while preserving existing custom descriptions.
 */
export function syncMatrixToSpecifications(matrix: ExamMatrix): SpecificationItem[] {
  const tfRule = matrix.tfScoringRule || DEFAULT_TF_SCORING_RULE;
  const existing = [...matrix.specifications];
  const synced: SpecificationItem[] = [];

  let qIndexCounter = 1;

  for (const row of matrix.topics) {
    for (const qt of QUESTION_TYPES) {
      for (const lv of COGNITIVE_LEVELS) {
        const cell = getMatrixCell(row, qt, lv, tfRule);
        const count = cell.count ?? 0;
        const points = cell.points ?? 0;
        const existingSpec = existing.find(
          (s) =>
            (s.topicId === row.id || s.topicName === row.topicName) &&
            s.questionType === qt &&
            s.cognitiveLevel === lv
        );

        if (count > 0 || existingSpec) {
          if (count === 0 && !existingSpec) continue;
          const previewRange =
            count === 0
              ? '0 câu'
              : count === 1
              ? `Câu ${qIndexCounter}`
              : `Câu ${qIndexCounter} - ${qIndexCounter + count - 1}`;
          qIndexCounter += count;

          const scorePerQ = count > 0 ? Math.round((points / count) * 1000) / 1000 : 0;

          if (existingSpec) {
            synced.push({
              ...existingSpec,
              topicId: row.id,
              chapterName: existingSpec.chapterName || row.topicName,
              lessonName: existingSpec.lessonName || row.unitLesson,
              topicName: row.topicName,
              knowledgeContent: existingSpec.knowledgeContent || row.unitLesson,
              requiredCompetency:
                existingSpec.requiredCompetency ||
                row.requiredCompetency ||
                `Đạt chuẩn kiến thức, kỹ năng ${row.topicName}`,
              questionCount: count,
              subItemCount:
                qt === 'MULTIPLE_TRUE_FALSE'
                  ? cell.subItemCount ?? count * 4
                  : existingSpec.subItemCount,
              scorePerQuestion: scorePerQ,
              totalItemScore: points,
              questionNumbersPreview: previewRange,
            });
          } else {
            synced.push({
              id: `spec_${row.id}_${qt}_${lv}`,
              topicId: row.id,
              chapterName: row.topicName,
              lessonName: row.unitLesson,
              topicName: row.topicName,
              knowledgeContent: row.unitLesson,
              requiredCompetency:
                row.requiredCompetency ||
                `Đạt yêu cầu cần đạt chủ đề ${row.topicName} (${COGNITIVE_LEVEL_LABELS[lv]}).`,
              assessmentContent: `Đánh giá mức độ ${COGNITIVE_LEVEL_LABELS[lv]} (${QUESTION_TYPE_LABELS[qt]}).`,
              cognitiveLevel: lv,
              questionType: qt,
              questionCount: count,
              subItemCount: qt === 'MULTIPLE_TRUE_FALSE' ? cell.subItemCount ?? count * 4 : undefined,
              scorePerQuestion: scorePerQ,
              totalItemScore: points,
              linkedQuestionIds: [],
              questionNumbersPreview: previewRange,
            });
          }
        }
      }
    }
  }

  return synced;
}

/**
 * Evaluate score for a True/False question based on number of correct statements.
 */
export function calculateTrueFalseScore(
  correctStatementsCount: number,
  rule?: TrueFalseScoringRule,
  customMaxScore?: number
): number {
  const r = rule || DEFAULT_TF_SCORING_RULE;
  if (r.mode === 'EQUAL_PER_ITEM') {
    const maxP = customMaxScore ?? r.pointsFor4 ?? 1.0;
    return Math.round(((Math.max(0, Math.min(4, correctStatementsCount)) / 4) * maxP) * 1000) / 1000;
  }
  switch (correctStatementsCount) {
    case 1:
      return r.pointsFor1;
    case 2:
      return r.pointsFor2;
    case 3:
      return r.pointsFor3;
    case 4:
      return r.pointsFor4;
    default:
      return 0;
  }
}

export interface MissingCellReport {
  topicId: string;
  topicName: string;
  questionType: QuestionType;
  cognitiveLevel: CognitiveLevel;
  needed: number;
  available: number;
  missing: number;
  matchingQuestionIds: string[];
}

export interface MatrixGenerationResult {
  success: boolean;
  selectedQuestions: Question[];
  questionScores: Record<string, number>;
  missingCells: MissingCellReport[];
  totalRequired: number;
  totalMatched: number;
  calculatedTotalScore: number;
}

/**
 * Fuzzy topic/chapter matcher between Matrix row and Question metadata.
 */
function matchesTopicOrChapter(q: Question, row: MatrixTopicRow): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();

  const qText = normalize(`${q.chapter} ${q.topic}`);
  const rowText = normalize(`${row.topicName} ${row.unitLesson}`);
  if (!rowText) return true;

  // Match if same chapter prefix (e.g., "chương 1", "chương 2") or overlapping meaningful keywords
  const chapterRegex = /chuong\s*\d+/;
  const qChap = qText.match(chapterRegex)?.[0];
  const rChap = rowText.match(chapterRegex)?.[0];
  if (qChap && rChap && qChap === rChap) return true;

  const stopWords = new Set(['chuong', 'bai', 'hoa', 'hoc', 'va', 'cac', 'trong', 'cua', 've', 'voi', 'cho']);
  const rWords = rowText.split(/\s+/).filter((w) => w.length >= 3 && !stopWords.has(w));
  const overlapCount = rWords.filter((w) => qText.includes(w)).length;
  return overlapCount >= 1;
}

/**
 * Section VI: Pick exact questions for each Matrix cell without substituting wrong cognitive levels!
 */
export function selectQuestionsFromMatrix(
  matrix: ExamMatrix,
  allQuestions: Question[],
  options: {
    requireApproved?: boolean;
    allowDuplicate?: boolean;
    sections?: ExamSectionConfig[];
  } = {}
): MatrixGenerationResult {
  const tfRule = matrix.tfScoringRule || DEFAULT_TF_SCORING_RULE;
  const requireApproved = options.requireApproved ?? true;

  const eligiblePool = allQuestions.filter((q) => {
    if (q.grade !== matrix.grade) return false;
    if (requireApproved && q.isApproved === false) return false;
    return true;
  });

  const usedIds = new Set<string>();
  const selectedQuestions: Question[] = [];
  const questionScores: Record<string, number> = {};
  const missingCells: MissingCellReport[] = [];
  let totalRequired = 0;

  // Iterate by QuestionType first so resulting exam naturally groups Part I -> Part II -> Part III -> Part IV
  for (const qt of QUESTION_TYPES) {
    // Check if section is disabled or 0 questions in sections config
    const secCfg = options.sections?.find((s) => s.questionType === qt);
    if (secCfg && (!secCfg.enabled || secCfg.questionCount === 0)) {
      continue;
    }

    for (const row of matrix.topics) {
      for (const lv of COGNITIVE_LEVELS) {
        const cell = getMatrixCell(row, qt, lv, tfRule);
        const needed = cell.count ?? 0;
        if (needed <= 0) continue;

        totalRequired += needed;

        // First try strict topic + grade + type + cognitiveLevel match
        const strictMatches = eligiblePool.filter(
          (q) =>
            q.type === qt &&
            q.cognitiveLevel === lv &&
            matchesTopicOrChapter(q, row) &&
            (options.allowDuplicate || !usedIds.has(q.id))
        );

        // Fallback within SAME grade, type, and EXACT cognitiveLevel (never wrong cognitive level!)
        const sameLevelFallback = eligiblePool.filter(
          (q) =>
            q.type === qt &&
            q.cognitiveLevel === lv &&
            !strictMatches.some((m) => m.id === q.id) &&
            (options.allowDuplicate || !usedIds.has(q.id))
        );

        const combinedAvailable = [...strictMatches, ...sameLevelFallback];
        const picked = combinedAvailable.slice(0, needed);

        const pointPerQ =
          cell.points && needed > 0
            ? Math.round((cell.points / needed) * 1000) / 1000
            : qt === 'MULTIPLE_TRUE_FALSE'
            ? tfRule.pointsFor4
            : DEFAULT_SCORE_PER_TYPE[qt];

        picked.forEach((q) => {
          usedIds.add(q.id);
          selectedQuestions.push(q);
          questionScores[q.id] = pointPerQ;
        });

        if (picked.length < needed) {
          missingCells.push({
            topicId: row.id,
            topicName: row.topicName,
            questionType: qt,
            cognitiveLevel: lv,
            needed,
            available: picked.length,
            missing: needed - picked.length,
            matchingQuestionIds: combinedAvailable.map((q) => q.id),
          });
        }
      }
    }
  }

  const calculatedTotalScore =
    Math.round(
      selectedQuestions.reduce((sum, q) => sum + (questionScores[q.id] ?? q.maxScore), 0) * 1000
    ) / 1000;

  return {
    success: missingCells.length === 0,
    selectedQuestions,
    questionScores,
    missingCells,
    totalRequired,
    totalMatched: selectedQuestions.length,
    calculatedTotalScore,
  };
}

/**
 * Deterministic PRNG (Mulberry32) so each variant code generates a reproducible shuffle.
 */
function seededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateVariantCodes(
  count: number,
  rule: '101_SERIES' | '201_SERIES' | 'CUSTOM',
  customPrefix?: string
): string[] {
  const safeCount = Math.max(1, Math.min(24, count));
  const codes: string[] = [];
  const used = new Set<string>();

  for (let i = 0; i < safeCount; i++) {
    let code = '';
    if (rule === '101_SERIES') {
      code = String(101 + i);
    } else if (rule === '201_SERIES') {
      code = String(201 + i);
    } else {
      const prefix = (customPrefix || 'M').trim().toUpperCase();
      code = `${prefix}${String(i + 1).padStart(2, '0')}`;
    }
    while (used.has(code)) {
      code = `${code}_${i + 1}`;
    }
    used.add(code);
    codes.push(code);
  }
  return codes;
}

/**
 * Section VII: Full Exam Shuffler & Variant Generator
 * - Shuffles question order within each part while respecting lockedQuestionIds & lockedGroups
 * - Shuffles MCQ A/B/C/D options and remaps answerKey to the NEW option letter (e.g. orig B -> new D)
 * - Keeps True/False sub-statements fixed by default unless shuffleTfStatements === true
 * - Records originalToShuffledMap
 */
export function buildShuffledVariants(
  baseQuestionIds: string[],
  questionsMap: Record<string, Question>,
  config: {
    count: number;
    rule: '101_SERIES' | '201_SERIES' | 'CUSTOM';
    customPrefix?: string;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    shuffleTfStatements?: boolean;
    lockedQuestionIds?: string[];
    lockedGroups?: string[][];
    seedOffset?: number;
  }
): ExamVariant[] {
  const codes = generateVariantCodes(config.count, config.rule, config.customPrefix);
  const lockedSet = new Set(config.lockedQuestionIds || []);

  // Build group lookup for questions with lockShuffleGroup or explicit lockedGroups
  const groupMap = new Map<string, string[]>();
  (config.lockedGroups || []).forEach((grp) => {
    grp.forEach((id) => groupMap.set(id, grp));
  });
  baseQuestionIds.forEach((id) => {
    const q = questionsMap[id];
    if (q?.lockShuffleGroup) {
      const members = baseQuestionIds.filter(
        (otherId) => questionsMap[otherId]?.lockShuffleGroup === q.lockShuffleGroup
      );
      if (members.length > 1) {
        groupMap.set(id, members);
      }
    }
  });

  const LETTERS = ['A', 'B', 'C', 'D'];

  return codes.map((code, codeIdx) => {
    const rng = seededRandom((codeIdx + 1) * 7919 + (config.seedOffset || 1337));

    // Order questions by Type section (MCQ -> MULTIPLE_TRUE_FALSE -> SHORT_ANSWER -> ESSAY)
    const orderedIds: string[] = [];
    for (const qt of QUESTION_TYPES) {
      const sectionIds = baseQuestionIds.filter((id) => questionsMap[id]?.type === qt);
      if (sectionIds.length === 0) continue;

      if (!config.shuffleQuestions || (codeIdx === 0 && codes.length > 1 && false)) {
        // Note: all generated variants can shuffle, or keep code 0? Shuffling every variant or keeping codeIdx >= 0
      }

      if (!config.shuffleQuestions) {
        orderedIds.push(...sectionIds);
        continue;
      }

      // Partition into fixed slots (lockedSet) and movable items (single ID or atomic group)
      const resultSlots: (string | null)[] = sectionIds.map((id) =>
        lockedSet.has(id) ? id : null
      );

      const movableUnits: string[][] = [];
      const visited = new Set<string>();
      for (const id of sectionIds) {
        if (lockedSet.has(id) || visited.has(id)) continue;
        const grp = groupMap.get(id);
        if (grp) {
          const validMembers = grp.filter((m) => sectionIds.includes(m) && !lockedSet.has(m));
          validMembers.forEach((m) => visited.add(m));
          if (validMembers.length > 0) movableUnits.push(validMembers);
        } else {
          visited.add(id);
          movableUnits.push([id]);
        }
      }

      const shuffledUnits = shuffleWithRng(movableUnits, rng);
      const flattenedMovable = shuffledUnits.flat();

      let ptr = 0;
      for (let i = 0; i < resultSlots.length; i++) {
        if (resultSlots[i] === null && ptr < flattenedMovable.length) {
          resultSlots[i] = flattenedMovable[ptr++];
        }
      }

      resultSlots.forEach((id) => {
        if (id) orderedIds.push(id);
      });
    }

    // Include any questionIds that might not match known types safely
    baseQuestionIds.forEach((id) => {
      if (!orderedIds.includes(id)) orderedIds.push(id);
    });

    const optionPermutations: { [qId: string]: string[] } = {};
    const tfOrderPermutations: { [qId: string]: string[] } = {};
    const originalToShuffledMap: { [qId: string]: number } = {};
    const answerKey: { [qId: string]: string | { [k: string]: boolean } } = {};

    orderedIds.forEach((qId, newIdx) => {
      originalToShuffledMap[qId] = newIdx + 1;
      const q = questionsMap[qId];
      if (!q) return;

      if (q.type === 'MCQ' && q.options && q.options.length > 0) {
        const origIds = q.options.map((o) => o.id);
        const origCorrectId = q.options.find((o) => o.isCorrect)?.id || 'A';

        // Do not shuffle options if question is locked or has "tất cả đều đúng" style dependencies
        const hasAllAbove = q.options.some((o) =>
          /tất cả|cả [a-d]|phương án trên/i.test(o.content)
        );
        const shouldShuffleOpts = config.shuffleOptions && !lockedSet.has(qId) && !hasAllAbove;

        const perm = shouldShuffleOpts ? shuffleWithRng(origIds, rng) : [...origIds];
        optionPermutations[qId] = perm;

        // Find where origCorrectId landed in perm!
        const newSlotIdx = perm.indexOf(origCorrectId);
        answerKey[qId] = LETTERS[newSlotIdx >= 0 ? newSlotIdx : 0] || 'A';
      } else if (q.type === 'MULTIPLE_TRUE_FALSE' && q.tfStatements) {
        const origStIds = q.tfStatements.map((st) => st.id);
        const permSt = config.shuffleTfStatements ? shuffleWithRng(origStIds, rng) : [...origStIds];
        tfOrderPermutations[qId] = permSt;

        const tfAns: { [k: string]: boolean } = {};
        permSt.forEach((stId) => {
          const stObj = q.tfStatements?.find((s) => s.id === stId);
          if (stObj) tfAns[stId] = stObj.isCorrect;
        });
        answerKey[qId] = tfAns;
      } else if (q.type === 'SHORT_ANSWER') {
        answerKey[qId] = q.correctAnswer || '';
      } else {
        answerKey[qId] = 'Chấm theo hướng dẫn (Rubric)';
      }
    });

    return {
      code,
      questionIds: orderedIds,
      optionPermutations,
      tfOrderPermutations,
      originalToShuffledMap,
      answerKey,
    };
  });
}

/**
 * Resolve displayed options A, B, C, D for a given question inside a specific ExamVariant.
 */
export function getVariantOptionsForQuestion(
  q: Question,
  variant?: ExamVariant
): { displayLetter: string; originalId: string; content: string; isCorrect: boolean }[] {
  if (!q.options) return [];
  const LETTERS = ['A', 'B', 'C', 'D'];
  const perm = variant?.optionPermutations?.[q.id];
  if (!perm || perm.length !== q.options.length) {
    return q.options.map((opt, idx) => ({
      displayLetter: LETTERS[idx] || opt.id,
      originalId: opt.id,
      content: opt.content,
      isCorrect: Boolean(opt.isCorrect),
    }));
  }

  return perm.map((origId, slotIdx) => {
    const found = q.options!.find((o) => o.id === origId) || q.options![slotIdx];
    return {
      displayLetter: LETTERS[slotIdx] || origId,
      originalId: found.id,
      content: found.content,
      isCorrect: Boolean(found.isCorrect),
    };
  });
}

/**
 * Resolve effective question for a specific Exam (returns exam-local override if edited in exam, else Bank item).
 */
export function resolveExamQuestion(
  exam: Partial<Exam> | undefined | null,
  qId: string,
  questionsMap: Record<string, Question>
): Question | undefined {
  return exam?.questionOverrides?.[qId] || questionsMap[qId];
}

/**
 * Calculate maximum score of an exam taking into account per-question custom scores and TF scoring rule.
 */
export function calculateExamMaxScore(exam: Partial<Exam>, questionsMap: Record<string, Question>): number {
  const qIds = exam.questionIds || [];
  let sum = 0;
  for (const id of qIds) {
    const q = resolveExamQuestion(exam, id, questionsMap);
    if (!q) continue;
    if (exam.questionScores && exam.questionScores[id] !== undefined) {
      sum += exam.questionScores[id];
    } else if (q.type === 'MULTIPLE_TRUE_FALSE') {
      const rule = exam.questionTfRules?.[id] || exam.tfScoringRule;
      sum += rule ? rule.pointsFor4 : q.maxScore;
    } else {
      sum += q.maxScore;
    }
  }
  return Math.round(sum * 1000) / 1000;
}

export function createDefaultSections(): ExamSectionConfig[] {
  return [
    {
      partKey: 'PART_I',
      title: 'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn',
      questionType: 'MCQ',
      enabled: true,
      questionCount: 12,
      totalScore: 3.0,
      scorePerQuestion: 0.25,
    },
    {
      partKey: 'PART_II',
      title: 'PHẦN II. Câu trắc nghiệm đúng sai',
      questionType: 'MULTIPLE_TRUE_FALSE',
      enabled: true,
      questionCount: 2,
      totalScore: 2.0,
      scorePerQuestion: 1.0,
    },
    {
      partKey: 'PART_III',
      title: 'PHẦN III. Câu trắc nghiệm yêu cầu trả lời ngắn',
      questionType: 'SHORT_ANSWER',
      enabled: true,
      questionCount: 4,
      totalScore: 2.0,
      scorePerQuestion: 0.5,
    },
    {
      partKey: 'PART_IV',
      title: 'PHẦN IV. Tự luận',
      questionType: 'ESSAY',
      enabled: true,
      questionCount: 2,
      totalScore: 3.0,
      scorePerQuestion: 1.5,
    },
  ];
}
