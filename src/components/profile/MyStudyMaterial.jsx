import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { db } from '../../services/firebase/firebaseService';
import { fetchUsernamesByUids, isValidUsername } from '../../services/firebase/usernameService';

const getCreatorHandle = (item) => {
  const raw = (item?.creatorUsername || item?.creator?.username || item?.username || '').trim();
  const cleaned = raw.replace(/^@/, '');
  if (cleaned && isValidUsername(cleaned)) return `@${cleaned}`;
  return 'Anonymous';
};

const BrowsePublicFlashcards = () => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchDecks() {
      setLoading(true);
      try {
        const decksCol = collection(db, 'flashcard_decks');
        const decksSnap = await getDocs(
          query(decksCol, where('isPublic', '==', true), orderBy('timestamps.createdAt', 'desc'), limit(50))
        );

        const decksArray = [];
        decksSnap.forEach((doc) => {
          decksArray.push({ id: doc.id, ...doc.data() });
        });

        // Attach usernames
        const collectUid = (item) => item?.creatorId || item?.creator?.uid || item?.createdBy || item?.userId || null;
        const uids = Array.from(new Set(decksArray.map(collectUid).filter(Boolean)));
        const usernameMap = uids.length > 0 ? await fetchUsernamesByUids(uids) : {};

        const decksWithUsernames = decksArray.map((d) => {
          const uidForItem = collectUid(d);
          const uname = uidForItem ? usernameMap[uidForItem] : undefined;
          return {
            ...d,
            creatorUsername:
              (uname && isValidUsername(String(uname).replace(/^@/, '')) ? uname : null) ||
              (d?.creatorUsername && isValidUsername(String(d.creatorUsername).replace(/^@/, '')) ? d.creatorUsername : null) ||
              (d?.creator?.username && isValidUsername(String(d.creator.username).replace(/^@/, '')) ? d.creator.username : null) ||
              (d?.username && isValidUsername(String(d.username).replace(/^@/, '')) ? d.username : null),
          };
        });

        if (!cancelled) {
          setDecks(decksWithUsernames);
        }
      } catch (error) {
        console.error('Error fetching public flashcards:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDecks();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1>Public Flashcards</h1>
      {loading && <p>Loading...</p>}
      {!loading && decks.length === 0 && <p>No public flashcards found.</p>}
      <ul>
        {decks.map((deck) => (
          <li key={deck.id}>
            <h3>{deck.title || 'Untitled Deck'}</h3>
            <p>Created by: {getCreatorHandle(deck)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BrowsePublicFlashcards;