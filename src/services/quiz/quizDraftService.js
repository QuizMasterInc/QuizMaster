/**
 * quizDraftService - lightweight client-side draft storage for quiz progress
 * Currently uses localStorage for quick persistence. This is intentionally
 * small and replaceable with a backend API later (e.g. Firestore or Cloud Function).
 */

const DRAFT_PREFIX = 'quizDraft:';

const buildKey = ({ userId, quizId, category, difficulty, amount }) => {
  // Prefer explicit quizId when available, otherwise fall back to category/difficulty/amount
  if (quizId) return `${DRAFT_PREFIX}${userId}:quiz:${quizId}`;
  return `${DRAFT_PREFIX}${userId}:cat:${category || 'any'}:d:${difficulty || 'any'}:a:${amount || 'any'}`;
};

const saveDraft = async ({ userId, quizId, category, difficulty, amount, questionIds, userAnswers, answeredCount, quizStartTime }) => {
  if (!userId) return { success: false, message: 'Not signed in' };

  const key = buildKey({ userId, quizId, category, difficulty, amount });
  const payload = {
    createdAt: new Date().toISOString(),
    userId,
    quizId: quizId || null,
    category: category || null,
    difficulty: difficulty || null,
    amount: amount || null,
    questionIds: questionIds || null,
    userAnswers: userAnswers || {},
    answeredCount: answeredCount || 0,
    quizStartTime: quizStartTime || Date.now(),
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return { success: true, key, payload };
  } catch (err) {
    console.error('Error saving quiz draft:', err);
    return { success: false, message: err.message };
  }
};

const loadDraft = ({ userId, quizId, category, difficulty, amount }) => {
  const key = buildKey({ userId, quizId, category, difficulty, amount });
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading quiz draft:', err);
    return null;
  }
};

const removeDraft = ({ userId, quizId, category, difficulty, amount }) => {
  const key = buildKey({ userId, quizId, category, difficulty, amount });
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error('Error removing quiz draft:', err);
    return false;
  }
};

export default {
  saveDraft,
  loadDraft,
  removeDraft
};
