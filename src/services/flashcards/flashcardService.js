/**
 * Flashcard service - handles all flashcard deck operations
 */
import { httpsCallable } from 'firebase/functions';
import { db, handleFirebaseError, withRetry, timestamp } from '../firebase/firebaseService';

class FlashcardService {
    constructor() {
        this.collection = 'flashcard_decks';
    }

    /**
     * Validate deck name input
     * @param {string} deckName - Deck name to validate
     * @returns {boolean} - Validation result
     */
    validateDeckName(deckName) {
        return !!(deckName && deckName.trim());
    }

    /**
     * Validate cards array
     * @param {Array} cards - Cards array to validate
     * @returns {boolean} - Validation result
     */
    validateCards(cards) {
        if (!Array.isArray(cards) || cards.length === 0) {
            return false;
        }
        
        return cards.every(card => 
            card && 
            typeof card === 'object' && 
            card.front && card.front.trim() && 
            card.back && card.back.trim()
        );
    }

    /**
     * Create validated flashcard deck object
     * @param {Object} deckInput - Deck creation data
     * @returns {Object} - Validated deck object or validation errors
     */
    createValidatedDeckObject(deckInput) {
        const {
            deckName,
            cards,
            tags,
            isPublic,
            category,
            difficulty,
            description,
            currentUserId
        } = deckInput;

        // Validation
        if (!this.validateDeckName(deckName)) {
            return { 
                success: false, 
                error: "Please enter a valid deck name." 
            };
        }

        if (!this.validateCards(cards)) {
            return { 
                success: false, 
                error: "Please add at least one card with both front and back content." 
            };
        }

        // Create deck object matching our schema
        const deckObject = {
            // Metadata section
            metadata: {
                title: deckName.trim(),
                description: description || "",
                category: category || "General",
                tags: this.normalizeTags(tags),
                cardCount: cards.length,
                isPublic: isPublic || false,
                difficulty: difficulty || "2",
                version: 1
            },
            
            // Creator section
            creator: {
                uid: currentUserId
            },
            
            // Content section - cards array will be converted to map in backend
            content: {
                cards: cards
            },
            
            // Access section
            access: {
                visibility: isPublic ? "public" : "private",
                allowCopying: true,
                studyMode: "flashcards"
            }
        };

        return { success: true, deckObject };
    }

    /**
     * Normalize tags to consistent format
     * @param {string|Array} tags - Tags to normalize
     * @returns {string} - Normalized comma-separated tags string
     */
    normalizeTags(tags) {
        if (!tags) return "";
        
        let normalizedTags = '';
        
        if (Array.isArray(tags)) {
            normalizedTags = tags.join(',');
        } else if (typeof tags === 'string') {
            normalizedTags = tags;
        } else {
            normalizedTags = String(tags || '');
        }
        
        // Normalize comma-separated values
        normalizedTags = normalizedTags
            .replace(/,+/g, ',')           
            .replace(/^\s*,+|,+\s*$/g, '') 
            .split(',')                    
            .map(tag => tag.trim())        
            .filter(tag => tag.length > 0) 
            .join(',');                    
        
        return normalizedTags;
    }

    /**
     * Submit flashcard deck to Firebase
     * @param {Object} deckObject - Validated deck object
     * @returns {Promise<Object>} - API response
     */
    async submitFlashcardDeck(deckObject) {
        try {
            const response = await fetch(
                'https://us-central1-quizmaster-c66a2.cloudfunctions.net/addCustomFlashcardDeck',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(deckObject)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting flashcard deck:', error);
            throw new Error('Failed to create flashcard deck. Please try again.');
        }
    }

    /**
     * Get user's flashcard decks
     * @param {string} userId - User ID
     * @returns {Promise<Array>} User's flashcard decks
     */
    async getUserFlashcardDecks(userId) {
        try {
            if (!userId) {
                return [];
            }

            const response = await fetch(
                `https://us-central1-quizmaster-c66a2.cloudfunctions.net/getUserFlashcardDecks?userId=${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data || !data.success) {
                return [];
            }
            
            return data.data || [];

        } catch (error) {
            console.error('Error fetching user flashcard decks:', error);
            return [];
        }
    }

    /**
     * Get a specific flashcard deck
     * @param {string} deckId - Deck ID
     * @returns {Promise<Object>} Flashcard deck data
     */
    async getFlashcardDeck(deckId) {
        try {
            if (!deckId) {
                throw new Error('Deck ID is required');
            }

            const response = await fetch(
                `https://us-central1-quizmaster-c66a2.cloudfunctions.net/getFlashcardDeck?deckId=${deckId}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data || !data.success) {
                throw new Error(data.message || 'Failed to fetch flashcard deck');
            }
            
            return data.data;

        } catch (error) {
            console.error('Error fetching flashcard deck:', error);
            throw error;
        }
    }

    /**
     * Delete a flashcard deck
     * @param {string} deckId - Deck ID
     * @param {string} userId - User ID (for ownership verification)
     * @returns {Promise<Object>} Deletion result
     */
    async deleteFlashcardDeck(deckId, userId) {
        try {
            if (!deckId || !userId) {
                throw new Error('Deck ID and User ID are required');
            }

            const response = await fetch(
                'https://us-central1-quizmaster-c66a2.cloudfunctions.net/deleteFlashcardDeck',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ deckId, userId })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data || !data.success) {
                throw new Error(data.message || 'Failed to delete flashcard deck');
            }
            
            return data;

        } catch (error) {
            console.error('Error deleting flashcard deck:', error);
            throw error;
        }
    }

    /**
     * Normalize flashcard deck data for consistent display
     * @param {Object} deck - Raw deck data from Firebase
     * @returns {Object} Normalized deck object
     */
    normalizeDeckData(deck) {
        if (!deck) return null;
        
        return {
            // Basic info
            id: deck.id,
            title: deck.metadata?.title || deck.name || 'Untitled Deck',
            description: deck.metadata?.description || '',
            
            // Content info
            cardCount: deck.metadata?.cardCount || (deck.content?.cards ? Object.keys(deck.content.cards).length : 0),
            cards: deck.content?.cards || {},
            category: deck.metadata?.category || 'General',
            difficulty: deck.metadata?.difficulty || '2',
            
            // Tags handling
            tags: deck.metadata?.tags ? 
                  (typeof deck.metadata.tags === 'string' ? deck.metadata.tags.split(',').map(t => t.trim()) : deck.metadata.tags) : [],
            
            // Creator info
            creator: deck.creator?.displayName || deck.creator?.username || 'Anonymous User',
            creatorId: deck.creator?.uid || '',
            
            // Access info
            isPublic: deck.metadata?.isPublic || false,
            isPrivate: !deck.metadata?.isPublic,
            
            // Analytics
            timesStudied: deck.analytics?.stats?.timesStudied || 0,
            averageScore: deck.analytics?.stats?.averageScore || 0,
            lastStudied: deck.analytics?.stats?.lastStudied,
            
            // Timestamps
            createdAt: deck.timestamps?.createdAt,
            updatedAt: deck.timestamps?.updatedAt,
            
            // Status
            isActive: deck.moderation?.status === 'active'
        };
    }
}

export default new FlashcardService();