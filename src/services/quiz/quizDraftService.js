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
      return { id: docSnap.id, ...docSnap.data() };
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