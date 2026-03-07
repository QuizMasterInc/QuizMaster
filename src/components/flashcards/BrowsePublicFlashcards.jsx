import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import flashcardService from '../../services/flashcards/flashcardService';
import FlashcardPreview from './FlashcardPreview';
import { fetchUsernamesByUids, isValidUsername } from '../../services/firebase/usernameService';

/**
 * Helper to resolve creator label.
 * Priority:
 * 1. creatorUsername / username / creator.username  → shown as @username
 * 2. creatorName / displayName
 * 3. legacy creator.displayName
 * 4. Anonymous
 */
const getCreatorLabel = (deck) => {
  const username = deck?.creatorUsername || deck?.username || deck?.creator?.username;
  const cleaned = typeof username === 'string' ? username.trim().replace(/^@/, '') : '';
  if (cleaned && isValidUsername(cleaned)) {
    return `@${cleaned}`;
  }

  const name = deck?.creatorName || deck?.creatorDisplayName || deck?.displayName;
  if (typeof name === 'string' && name.trim()) {
    return name;
  }

  const legacyName = deck?.creator?.displayName;
  if (typeof legacyName === 'string' && legacyName.trim()) {
    return legacyName;
  }

  return 'Anonymous';
};

export default function BrowsePublicFlashcards() {
  const location = useLocation();
  const navigate = useNavigate();
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    sortBy: 'recent'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPublicFlashcards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const cats = await flashcardService.getPublicFlashcardCategories();
      setCategories(['all', ...cats]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchPublicFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);

      const decks = await flashcardService.browsePublicFlashcards({
        category: filters.category,
        difficulty: filters.difficulty,
        sortBy: filters.sortBy,
        limitCount: 50
      });

      // Attach creator usernames for all viewers
      // NOTE: flashcard docs have had several historical creator field shapes.
      // Make UID collection resilient so enrichment actually runs.
      const collectUid = (d) =>
        d?.creator?.uid ||
        d?.creatorId ||
        d?.creatorID ||
        d?.createdBy ||
        d?.userId ||
        d?.creator?.userId ||
        d?.creator?.id ||
        null;

      // Always normalize any username already present on the doc (even if we can't look up by UID)
      const normalizeUsername = (value) => {
        const cleaned = value ? String(value).trim().replace(/^@/, '') : '';
        return cleaned && isValidUsername(cleaned) ? cleaned : null;
      };

      const uids = Array.from(new Set((decks || []).map(collectUid).filter(Boolean)));

      // First pass: preserve any username already present on the deck doc
      let decksWithUsernames = (decks || []).map((d) => {
        const existing =
          normalizeUsername(d?.creatorUsername) ||
          normalizeUsername(d?.creator?.username) ||
          normalizeUsername(d?.username);

        return {
          ...d,
          // store as plain username (no @)
          creatorUsername: existing,
          // Mirror onto nested creator.username too (helps other components that read creator.username)
          creator: d?.creator ? { ...d.creator, username: existing || d.creator.username } : d?.creator
        };
      });

      // Second pass: lookup usernames by UID (preferred)
      if (uids.length > 0) {
        try {
          const usernameMap = await fetchUsernamesByUids(uids);

          decksWithUsernames = decksWithUsernames.map((d) => {
            const uid = collectUid(d);
            const lookedUp = uid ? normalizeUsername(usernameMap?.[uid]) : null;

            const finalUsername =
              lookedUp ||
              normalizeUsername(d?.creatorUsername) ||
              normalizeUsername(d?.creator?.username) ||
              normalizeUsername(d?.username);

            return {
              ...d,
              creatorUsername: finalUsername,
              creator: d?.creator ? { ...d.creator, username: finalUsername || d.creator.username } : d?.creator
            };
          });
        } catch (e) {
          console.warn('Username enrichment failed; continuing without usernames.', e);
        }
      }

      setFlashcardDecks(decksWithUsernames);
    } catch (err) {
      console.error('Error fetching public flashcards:', err);
      setError('Failed to load public flashcard decks');
      setFlashcardDecks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)]">
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          Browse Public Flashcard Decks
        </h1>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <Link
            to="/myflashcards"
            className="inline-block px-6 py-3 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-[var(--accent)]"
          >
            My Flashcards
          </Link>
          <Link
            to="/flashcards"
            className="inline-block px-6 py-3 bg-[var(--success)] hover:opacity-90 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-[var(--accent)]"
          >
            Create New Deck
          </Link>
        </div>

        {error && (
          <div className="flex mt-5 justify-center items-center">
            <div className="error-message font-medium">{error}</div>
          </div>
        )}

        <p className="mt-6 text-center text-lg">
          Found{' '}
          <span className="font-bold text-[var(--accent)]">{flashcardDecks.length}</span>{' '}
          public deck{flashcardDecks.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <div className="text-gradient-primary text-lg">Loading public flashcard decks...</div>
          </div>
        ) : flashcardDecks.length === 0 ? (
          <div className="flex flex-col items-center mt-10 p-8">
            <div className="text-center text-lg text-[var(--text-secondary)] mb-6">
              No public flashcard decks found.
            </div>
          </div>
        ) : (
          <div id="flashcardDecks" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
            {flashcardDecks.map((deck, index) => (
              <div key={deck.id || index} className="w-full md:w-1/2 lg:w-1/3 p-5 text-center">
                <div className="card rounded-lg shadow-lg hover:shadow-xl border border-[var(--border)] h-full flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="text-2xl text-[var(--accent)] font-bold mb-3">{deck.title}</div>

                    {/* Creator line */}
                    <div className="text-sm text-[var(--text-secondary)] mb-3">
                      <strong>Created by:</strong>{' '}
                      {deck?.creatorUsername && isValidUsername(deck.creatorUsername) ? (
                        <Link
                          to={`/u/${deck.creatorUsername}`}
                          className="text-[var(--accent)] hover:underline"
                        >
                          @{deck.creatorUsername}
                        </Link>
                      ) : (
                        <span>{getCreatorLabel(deck)}</span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-base text-[var(--text-secondary)]">
                        <strong>Cards:</strong> {deck.cardCount}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        <strong>Category:</strong> {deck.category}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        <strong>Difficulty:</strong>{' '}
                        {deck.difficulty === '1' ? 'Easy' : deck.difficulty === '2' ? 'Medium' : 'Hard'}
                      </div>
                    </div>

                    {deck.tags && deck.tags.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 my-4">
                        {deck.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 bg-[var(--accent)] text-white rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {deck.description && (
                      <div className="mb-4">
                        <div className="text-sm text-[var(--accent)] mb-1">
                          <strong>Description:</strong>
                        </div>
                        <div className="text-sm text-[var(--text-primary)]">{deck.description}</div>
                      </div>
                    )}

                    <FlashcardPreview cards={deck.cards} />

                    {deck.timesStudied > 0 && (
                      <div className="mt-4 pt-4 border-t border-[var(--border)]">
                        <div className="text-sm text-[var(--text-secondary)]">
                          <strong>Times Studied:</strong> {deck.timesStudied}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-[var(--border)]">
                    <button
                      className="w-full px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={() =>
                        navigate(`/flashcards/study/${deck.id}`, {
                          state: { from: location.pathname }
                        })
                      }
                    >
                      Study This Deck
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}