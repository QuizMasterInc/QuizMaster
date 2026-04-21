// src/services/firebase/usernameService.js
import {
  doc,
  runTransaction,
  serverTimestamp,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebaseService";
import { containsProfanity } from "../../utils/profanityFilter";

export function isUsernameProfane(name) {
  const normalized = normalizeUsername(name).replace(/[^a-z0-9]/g, "");
  return containsProfanity(normalized);
}

export function getUsernameValidationMessage(name) {
  const trimmed = (name || "").trim();

  if (trimmed.length < 3 || trimmed.length > 24) {
    return "Username must be 3-24 characters. Please change the username.";
  }

  if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
    return "Username can only use letters and numbers. Please change the username.";
  }

  if (isUsernameProfane(trimmed)) {
    return "That username is not allowed. Please change the username.";
  }

  return "";
}

// -------------------------
// Username rules
// -------------------------
export function normalizeUsername(name) {
  return (name || "").trim().toLowerCase();
}

// Classroom-friendly: letters + digits only (no symbols/underscores)
// 3-24 chars
export function isValidUsername(name) {
  const trimmed = (name || "").trim();
  return !getUsernameValidationMessage(trimmed);
}

// Quick check (non-atomic). Use reserveUsername()/changeUsername() for the real lock.
// If a uid is provided, a username already reserved by that same uid is treated as available.
export async function isUsernameAvailable(username, uid = null) {
  const usernameLower = normalizeUsername(username);
  if (!usernameLower) return false;

  const unameRef = doc(db, "usernames", usernameLower);
  const snap = await getDoc(unameRef);

  if (!snap.exists()) return true;

  // Treat usernames already owned by this same user as available so they can
  // keep or revert to one of their own reserved usernames.
  if (uid && snap.data()?.uid === uid) return true;

  return false;
}

// Batch helper for UI joins (uids -> username). Firestore `in` queries are limited to 10.
export async function fetchUsernamesByUids(uids) {
  const unique = Array.from(new Set((uids || []).filter(Boolean)));
  const map = {};

  const chunks = [];
  for (let i = 0; i < unique.length; i += 10) chunks.push(unique.slice(i, i + 10));

  for (const group of chunks) {
    // Use the PUBLIC usernames registry (allowed by rules) to map uid -> username.
    // usernames docs typically look like: { uid, username }
    const q = query(collection(db, "usernames"), where("uid", "in", group));
    const snap = await getDocs(q);

    snap.forEach((d) => {
      const data = d.data() || {};
      const uid = data?.uid;
      const unameRaw = data?.username || d.id;
      const uname = typeof unameRaw === "string" ? unameRaw.trim().replace(/^@/, "").toLowerCase() : "";

      if (uid && uname) {
        map[uid] = uname;
      }
    });
  }

  return map;
}

// Atomic reservation: guarantees uniqueness even under race conditions
export async function reserveUsername({ uid, username }) {
  const usernameLower = normalizeUsername(username);

  if (!uid) throw new Error("Missing uid");
  // Validate the canonical (lowercased) username so case never causes mismatches.
  if (!isValidUsername(usernameLower)) {
    throw new Error(getUsernameValidationMessage(usernameLower) || "That username is not allowed. Please change the username.");
  }

  const unameRef = doc(db, "usernames", usernameLower);
  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    const unameSnap = await tx.get(unameRef);
    if (unameSnap.exists()) throw new Error("USERNAME_TAKEN");

    const userSnap = await tx.get(userRef);
    const hasCreatedAt = userSnap.exists() && userSnap.data()?.createdAt;

    // Reserve global username
    tx.set(unameRef, {
      uid,
      // Store the canonical lowercase username to match the document id.
      username: usernameLower,
      createdAt: serverTimestamp(),
    });

    // Store on user profile too
    const userUpdate = {
      // Store the canonical lowercase username for consistent display/links.
      username: usernameLower,
      usernameLower,
      updatedAt: serverTimestamp(),
    };

    // If the user doc is brand new (or missing createdAt), set it once.
    if (!hasCreatedAt) {
      userUpdate.createdAt = serverTimestamp();
    }

    tx.set(userRef, userUpdate, { merge: true });
  });

  return { username: usernameLower, usernameLower };
}

// -------------------------
// OAuth auto-generation
// -------------------------
const ADJECTIVES = [
  "Sour",
  "Brave",
  "Calm",
  "Swift",
  "Sunny",
  "Mighty",
  "Clever",
  "Cosmic",
  "Happy",
  "Quiet",
  "Fuzzy",
  "Witty",
  "Noble",
  "Jolly",
  "Chill",
  "Epic",
  "Bold",
  "Bright",
  "Silly",
  "Lucky",
];

const NOUNS = [
  "Apple",
  "Monkey",
  "Tiger",
  "Otter",
  "Panda",
  "Falcon",
  "Comet",
  "Rocket",
  "Cactus",
  "Noodle",
  "Giraffe",
  "Koala",
  "Dragon",
  "Nimbus",
  "Pixel",
  "Taco",
  "Saturn",
  "Cobra",
  "Penguin",
  "Mango",
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function generateCandidateUsername() {
  // Example: SourAppleMonkey24
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${pick(NOUNS)}${randInt(10, 99)}`;
}

export async function ensureOAuthUsername({ uid }) {
  if (!uid) throw new Error("Missing uid");

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  // already has a username
  if (userSnap.exists() && userSnap.data()?.usernameLower) {
    return {
      username: userSnap.data().username,
      usernameLower: userSnap.data().usernameLower,
      alreadyHadUsername: true,
    };
  }

  // Try multiple times until we find an unused one
  for (let i = 0; i < 15; i++) {
    const candidate = generateCandidateUsername();
    try {
      const reserved = await reserveUsername({ uid, username: candidate });
      return { ...reserved, alreadyHadUsername: false };
    } catch (e) {
      if (e?.message === "USERNAME_TAKEN") continue;
      // Bubble up unexpected errors so they can be handled by the caller.
      throw e;
    }
  }

  throw new Error("Could not generate a unique username. Try again.");
}

// -------------------------
// Username change
// -------------------------

// Change username and release the user's previous username so it can be reused.
// This will:
//  - fail if the new username is owned by someone else
//  - reserve usernames/{usernameLower} for this user if needed
//  - delete the previous usernames/{oldUsernameLower} doc when it is owned by this user
//  - update users/{uid}.username + usernameLower
export async function changeUsername({ uid, username }) {
  const usernameLower = normalizeUsername(username);

  if (!uid) throw new Error("Missing uid");
  // Validate the canonical (lowercased) username so case never causes mismatches.
  if (!isValidUsername(usernameLower)) {
    throw new Error(getUsernameValidationMessage(usernameLower) || "That username is not allowed. Please change the username.");
  }

  const unameRef = doc(db, "usernames", usernameLower);
  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    const oldUsernameLower = normalizeUsername(userSnap.exists() ? userSnap.data()?.usernameLower || userSnap.data()?.username : "");

    const unameSnap = await tx.get(unameRef);

    // If taken by someone else, block
    if (unameSnap.exists() && unameSnap.data()?.uid !== uid) {
      throw new Error("USERNAME_TAKEN");
    }

    // If it's not reserved yet, reserve it for this user
    if (!unameSnap.exists()) {
      tx.set(unameRef, {
        uid,
        // Store the canonical lowercase username to match the document id.
        username: usernameLower,
        createdAt: serverTimestamp(),
      });
    }

    // Release the previous username when changing away from it.
    if (oldUsernameLower && oldUsernameLower !== usernameLower) {
      const oldUnameRef = doc(db, "usernames", oldUsernameLower);
      const oldUnameSnap = await tx.get(oldUnameRef);

      if (oldUnameSnap.exists() && oldUnameSnap.data()?.uid === uid) {
        tx.delete(oldUnameRef);
      }
    }

    // Update the user profile
    tx.set(
      userRef,
      {
        // Store the canonical lowercase username for consistent display/links.
        username: usernameLower,
        usernameLower,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  return { username: usernameLower, usernameLower };
}

// One-time cleanup helper: remove any old usernames still reserved by this user,
// while keeping the user's current username reservation intact.
export async function cleanupUsernameReservations({ uid }) {
  if (!uid) throw new Error("Missing uid");

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const currentUsernameLower = normalizeUsername(
    userSnap.exists() ? userSnap.data()?.usernameLower || userSnap.data()?.username : ""
  );

  const q = query(collection(db, "usernames"), where("uid", "==", uid));
  const snap = await getDocs(q);

  const staleDocs = snap.docs.filter((d) => d.id !== currentUsernameLower);

  if (!staleDocs.length) {
    return { deleted: 0, kept: currentUsernameLower || null };
  }

  const batch = writeBatch(db);
  staleDocs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  return {
    deleted: staleDocs.length,
    kept: currentUsernameLower || null,
  };
}