import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import flashcardService from '../../services/flashcards/flashcardService';
import FlashcardPreview from './FlashcardPreview';
import { FaShare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { fetchUsernamesByUids, isValidUsername } from '../../services/firebase/usernameService';
import { formatCreatedTimestamp } from '../../utils/dateFormatter';

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

const getFlashcardCreatedAt = (deck) =>
  deck?.createdAt ||
  deck?.timestamps?.createdAt ||
  deck?.metadata?.createdAt ||
  deck?.createdAtTimestamp ||
  deck?.createdTimestamp ||
  deck?.timeCreated ||
  deck?.createdOn ||
  deck?.created_at ||
  deck?.dateCreated ||
  deck?.createdDate ||
  deck?.creationDate ||
  deck?.created ||
  null;

export default function BrowsePublicFlashcards() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleShareDeck = async (deck) => {
    const deckUrl = `${window.location.origin}/flashcards/study/${deck.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: deck.title || 'QuizMaster Flashcard Deck',
          text: `Check out this QuizMaster flashcard deck: ${deck.title || 'Untitled Deck'}`,
          url: deckUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(deckUrl);
      toast.success('Flashcard deck link copied to clipboard!');
    } catch (error) {
      if (error?.name === 'AbortError') return;

      try {
        await navigator.clipboard.writeText(deckUrl);
        toast.success('Flashcard deck link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to share flashcard deck:', clipboardError);
        toast.error('Could not share this flashcard deck right now.');
      }
    }
  };

  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
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
  }, [filters.category, filters.difficulty, filters.sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

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

      const collectUid = (d) =>
        d?.creator?.uid ||
        d?.creatorId ||
        d?.creatorID ||
        d?.createdBy ||
        d?.userId ||
        d?.creator?.userId ||
        d?.creator?.id ||
        null;

      const normalizeUsername = (value) => {
        const cleaned = value ? String(value).trim().replace(/^@/, '') : '';
        return cleaned && isValidUsername(cleaned) ? cleaned : null;
      };

      const uids = Array.from(new Set((decks || []).map(collectUid).filter(Boolean)));

      let decksWithUsernames = (decks || []).map((d) => {
        const existing =
          normalizeUsername(d?.creatorUsername) ||
          normalizeUsername(d?.creator?.username) ||
          normalizeUsername(d?.username);

        return {
          ...d,
          creatorUsername: existing,
          creator: d?.creator ? { ...d.creator, username: existing || d.creator.username } : d?.creator
        };
      });

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

  const filteredFlashcardDecks = useMemo(() => {
    const search = filters.searchTerm.trim().toLowerCase();

    if (!search) {
      return flashcardDecks;
    }

    return flashcardDecks.filter((deck) => {
      const titleMatch = deck?.title?.toLowerCase().includes(search);
      const descriptionMatch = deck?.description?.toLowerCase().includes(search);
      const categoryMatch = deck?.category?.toLowerCase().includes(search);
      const creatorMatch = getCreatorLabel(deck).toLowerCase().includes(search);
      const tagMatch = Array.isArray(deck?.tags)
        ? deck.tags.some((tag) => String(tag).toLowerCase().includes(search))
        : false;

      return titleMatch || descriptionMatch || categoryMatch || creatorMatch || tagMatch;
    });
  }, [flashcardDecks, filters.searchTerm]);

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden py-20 px-6 text-[var(--text-primary)]">
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-gradient-primary text-center mb-6 drop-shadow-lg">
          Browse Public Flashcard Decks
        </h1>

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

        <div className="flex flex-wrap justify-center items-center gap-4 mt-8 mb-4 text-[var(--text-primary)]">
          <label className="flex items-center gap-2">
            <span className="font-medium">Search:</span>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search"
              className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="font-medium">Category:</span>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="font-medium">Difficulty:</span>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="all">All Difficulties</option>
              <option value="1">Easy</option>
              <option value="2">Medium</option>
              <option value="3">Hard</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="font-medium">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="recent">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="titleAsc">Title, A→Z</option>
              <option value="titleDesc">Title, Z→A</option>
              <option value="cardsAsc">Shortest</option>
              <option value="cardsDesc">Longest</option>
            </select>
          </label>

          <button
            type="button"
            onClick={fetchPublicFlashcards}
            className="px-4 py-2 bg-[var(--btn-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Refresh
          </button>
        </div>

        <p className="mt-2 text-center text-lg">
          Found{' '}
          <span className="font-bold text-[var(--accent)]">{filteredFlashcardDecks.length}</span>{' '}
          public deck{filteredFlashcardDecks.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <div className="text-gradient-primary text-lg">Loading public flashcard decks...</div>
          </div>
        ) : filteredFlashcardDecks.length === 0 ? (
          <div className="flex flex-col items-center mt-10 p-8">
            <div className="text-center text-lg text-[var(--text-secondary)] mb-6">
              No flashcard decks match your current filters.
            </div>
          </div>
        ) : (
          <div id="flashcardDecks" className="flex flex-wrap justify-center gap-8 mt-14 px-6">
            {filteredFlashcardDecks.map((deck, index) => {
              const formattedCreatedAt = formatCreatedTimestamp(getFlashcardCreatedAt(deck));

              return (
                <div key={deck.id || index} className="w-full md:w-1/2 lg:w-1/3 p-5 text-center">
                  <div className="card rounded-lg shadow-lg hover:shadow-xl border border-[var(--border)] h-full flex flex-col">
                    <div className="p-6 flex-grow">
                      <div className="text-2xl text-[var(--accent)] font-bold mb-3">{deck.title}</div>

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
                          {deck.difficulty === '1'
                            ? 'Easy'
                            : deck.difficulty === '2'
                              ? 'Medium'
                              : 'Hard'}
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
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-[var(--btn-primary-bg)] px-4 text-sm font-semibold text-[var(--btn-primary-text)] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-lg"
                          onClick={() =>
                            navigate(`/flashcards/study/${deck.id}`, {
                              state: { from: location.pathname }
                            })
                          }
                        >
                          Study This Deck
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-3 border-t border-[var(--border)] pt-3">
                        <p className="text-center text-xs font-medium text-[var(--text-secondary)] opacity-70">
                          {formattedCreatedAt ? `Created ${formattedCreatedAt}` : 'Created date unavailable'}
                        </p>

                        <button
                          type="button"
                          aria-label="Share flashcard deck"
                          title="Share flashcard deck"
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
                          onClick={() => handleShareDeck(deck)}
                        >
                          <FaShare className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
