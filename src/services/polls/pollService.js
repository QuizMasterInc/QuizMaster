/*
  pollService.js

  Purpose:
  Central Firebase service layer for the live polling system.

  Responsibilities:
  - Creates and manages polls
  - Generates unique join codes
  - Handles live poll subscriptions
  - Processes votes securely with Firestore transactions
  - Controls poll lifecycle states (open, closed, ended)
  - Restricts creator-only poll actions
  - Sanitizes and validates poll content

  Notes:
  - Anonymous users can join polls without accounts
  - Poll creators must be authenticated
  - Uses Firestore real-time listeners for live updates
*/
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, handleFirebaseError } from "../firebase/firebaseService";
import { sanitizeProfanity, validateNoProfanity } from "../../utils/profanityFilter";

const POLLS_COLLECTION = "polls";

const pollsRef = collection(db, POLLS_COLLECTION);

const generateJoinCode = () => {
  // 6-digit, padded, string
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
};

async function ensureUniqueJoinCode() {
  let attempts = 0;
  while (attempts < 5) {
    const code = generateJoinCode();
    const snapshot = await getDocs(query(pollsRef, where("joinCode", "==", code)));
    if (snapshot.empty) return code;
    attempts += 1;
  }
  throw new Error("Could not generate a unique join code. Please try again.");
}

export async function createPoll({ question, options, createdBy }) {
  try {
    if (!createdBy) throw new Error("You must be signed in to create a poll.");
    if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
      throw new Error("Poll options must be an array with 2 to 10 choices.");
    }

    const profanityValidation = validateNoProfanity([
      {
        label: "Poll question",
        value: question,
        message: "Poll question cannot include profanity.",
      },
      ...options.map((option, index) => ({
        label: `Poll option ${index + 1}`,
        value: option,
        message: `Poll option ${index + 1} cannot include profanity.`,
      })),
    ]);

    if (!profanityValidation.valid) {
      throw new Error(profanityValidation.error);
    }

    const joinCode = await ensureUniqueJoinCode();
    const votes = options.map(() => 0);

    const docRef = await addDoc(pollsRef, {
      joinCode,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "open",
      question,
      options,
      votes,
      showLiveResults: false,
    });

    return { id: docRef.id, joinCode };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function findPollByCode(joinCode) {
  try {
    const snapshot = await getDocs(query(pollsRef, where("joinCode", "==", joinCode)));
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const pollData = docSnap.data();

    if (pollData.status === "closed") {
      throw new Error("This poll is currently closed by the creator.");
    }

    if (pollData.status === "ended") {
      return null;
    }

    return { id: docSnap.id, data: pollData };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export function subscribeToPoll(pollId, callback) {
  const ref = doc(db, POLLS_COLLECTION, pollId);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback({
          id: snap.id,
          data: {
            ...snap.data(),
            question: sanitizeProfanity(snap.data()?.question || ""),
            options: Array.isArray(snap.data()?.options)
              ? snap.data().options.map((option) => sanitizeProfanity(option))
              : [],
          },
        });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Poll listener error:", error);
      callback(null, handleFirebaseError(error));
    }
  );
}

export async function getUserVote(pollId, userId) {
  if (!userId || !pollId) return null;
  try {
    const voteSnap = await getDoc(doc(db, POLLS_COLLECTION, pollId, "votes", userId));
    if (!voteSnap.exists()) return null;
    const voteData = voteSnap.data();
    return {
      id: voteSnap.id,
      ...voteData,
      optionIndexes: Array.isArray(voteData.optionIndexes)
        ? voteData.optionIndexes
        : voteData.optionIndex != null
          ? [voteData.optionIndex]
          : [],
    };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function submitVote(pollId, optionIndexes, userId) {
  if (!userId) throw handleFirebaseError(new Error("Sign in to vote."));
  const ref = doc(db, POLLS_COLLECTION, pollId);
  const voteRef = doc(db, POLLS_COLLECTION, pollId, "votes", userId);
  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("Poll not found");
      const data = snap.data();
      if (data.status !== "open") throw new Error("Poll is closed");
      if (!Array.isArray(data.votes)) throw new Error("Invalid poll data");
      if (
        !Array.isArray(optionIndexes) ||
        optionIndexes.length === 0 ||
        optionIndexes.some((optionIndex) => optionIndex == null || optionIndex < 0 || optionIndex >= data.votes.length)
      ) {
        throw new Error("Invalid poll option");
      }

      const existingVote = await transaction.get(voteRef);
      if (existingVote.exists()) throw new Error("You already voted.");

      const newVotes = [...data.votes];
      optionIndexes.forEach((i) => {
        newVotes[i] = (newVotes[i] || 0) + 1;
      });

      transaction.update(ref, { votes: newVotes, updatedAt: serverTimestamp() });
      transaction.set(voteRef, {
        optionIndexes,
        userId,
        createdAt: serverTimestamp(),
      });
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}


export async function closePoll(pollId, userId) {
  if (!userId) throw handleFirebaseError(new Error("Only the creator can close the poll."));
  try {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, POLLS_COLLECTION, pollId);
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("Poll not found");
      if (snap.data().createdBy !== userId) throw new Error("Only the creator can close this poll.");
      transaction.update(ref, { status: "closed", updatedAt: serverTimestamp() });
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function endPoll(pollId, userId) {
  if (!userId) throw handleFirebaseError(new Error("Only the creator can end the poll."));
  try {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, POLLS_COLLECTION, pollId);
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("Poll not found");
      if (snap.data().createdBy !== userId) throw new Error("Only the creator can end this poll.");

      transaction.update(ref, {
        status: "ended",
        endedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function openPoll(pollId, userId) {
  if (!userId) throw handleFirebaseError(new Error("Only the creator can reopen the poll."));
  try {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, POLLS_COLLECTION, pollId);
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("Poll not found");
      if (snap.data().createdBy !== userId) throw new Error("Only the creator can reopen this poll.");
      transaction.update(ref, { status: "open", updatedAt: serverTimestamp() });
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function setShowLiveResults(pollId, showLiveResults, userId) {
  if (!userId) throw handleFirebaseError(new Error("Only the creator can update visibility."));
  try {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, POLLS_COLLECTION, pollId);
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("Poll not found");
      if (snap.data().createdBy !== userId) throw new Error("Only the creator can update visibility.");
      transaction.update(ref, { showLiveResults, updatedAt: serverTimestamp() });
    });
  } catch (error) {
    throw handleFirebaseError(error);
  }
}
