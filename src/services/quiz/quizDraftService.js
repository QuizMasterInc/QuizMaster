/**
 * quizDraftService - Firebase-based draft storage for quiz progress
 */

import { db } from '../firebase/firebaseService';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';

const COLLECTION = 'quiz_drafts';

const buildDraftId = ({ userId, quizId, category, difficulty, amount }) => {
  if (quizId) return `${userId}_quiz_${quizId}`;
  return `${userId}_cat_${category || 'any'}_d_${difficulty || 'any'}_a_${amount || 'any'}`;
};

/**
 * Migrate an old index-keyed userAnswers map to a questionId-keyed map.
 * Old shape: { 0: "answerA", 1: "answerB" }
 * New shape: { "questionId_xyz": "answerA", "questionId_abc": "answerB" }
 *
 * Uses the saved questionIds array to map index -> questionId.
 * If we can't migrate cleanly (missing questionIds, mismatched lengths),
 * returns an empty object — better to lose draft progress than apply
 * the wrong answer to the wrong question.
 */
const migrateUserAnswersIfNeeded = (userAnswers, questionIds) => {
  if (!userAnswers || typeof userAnswers !== 'object') return {};

  const keys = Object.keys(userAnswers);
  if (keys.length === 0) return {};

  // Already in the new shape if any key isn't purely numeric
  const allNumericKeys = keys.every((k) => /^\d+$/.test(k));
  if (!allNumericKeys) return userAnswers;

  // Need questionIds to migrate
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    console.warn('Cannot migrate draft: missing questionIds');
    return {};
  }

  const migrated = {};
  for (const key of keys) {
    const idx = Number(key);
    const qid = questionIds[idx];
    if (qid && userAnswers[key] !== null && userAnswers[key] !== undefined) {
      migrated[qid] = userAnswers[key];
    }
  }
  return migrated;
};

const saveDraft = async ({ 
  userId, 
  quizId, 
  category, 
  difficulty, 
  amount, 
  questionIds, 
  userAnswers, 
  answeredCount, 
  quizStartTime,
  quizType,
  quizTitle,
  questions
}) => {
  if (!userId) return { success: false, message: 'Not signed in' };

  const draftId = buildDraftId({ userId, quizId, category, difficulty, amount });
  
  const payload = {
    id: draftId,
    userId,
    quizId: quizId || null,
    quizType: quizType || 'default',
    quizTitle: quizTitle || null,
    category: category || null,
    difficulty: difficulty || null,
    amount: amount || null,
    questionIds: questionIds || [],
    questions: questions || [],
    userAnswers: userAnswers || {},
    answeredCount: answeredCount || 0,
    quizStartTime: quizStartTime || Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, COLLECTION, draftId);
    await setDoc(docRef, payload, { merge: true });
    return { success: true, draftId, payload };
  } catch (err) {
    console.error('Error saving quiz draft:', err);
    return { success: false, message: err.message };
  }
};

const loadDraft = async ({ userId, quizId, category, difficulty, amount }) => {
  if (!userId) return null;

  const draftId = buildDraftId({ userId, quizId, category, difficulty, amount });
  
  try {
    const docRef = doc(db, COLLECTION, draftId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Migrate old index-keyed userAnswers to new questionId-keyed shape
      const migratedAnswers = migrateUserAnswersIfNeeded(data.userAnswers, data.questionIds);
      return { id: docSnap.id, ...data, userAnswers: migratedAnswers };
    }
    return null;
  } catch (err) {
    console.error('Error loading quiz draft:', err);
    return null;
  }
};

const removeDraft = async ({ userId, quizId, category, difficulty, amount }) => {
  if (!userId) return false;

  const draftId = buildDraftId({ userId, quizId, category, difficulty, amount });
  
  try {
    const docRef = doc(db, COLLECTION, draftId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error removing quiz draft:', err);
    return false;
  }
};

const getUserDrafts = async (userId, limitCount = 6) => {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error fetching user drafts:', err);
    return [];
  }
};

export default {
  saveDraft,
  loadDraft,
  removeDraft,
  getUserDrafts
};