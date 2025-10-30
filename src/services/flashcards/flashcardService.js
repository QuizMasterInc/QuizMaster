/**
 * Flashcard service - handles all flashcard deck operations
 */
import cloudFunctionsAPI from '../api/cloudFunctions';

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
            return await cloudFunctionsAPI.call('addCustomFlashcardDeck', deckObject);
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

            const data = await cloudFunctionsAPI.call('getUserFlashcardDecks', { userId }, 'GET');
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

            const data = await cloudFunctionsAPI.call('getFlashcardDeck', { deckId }, 'GET');
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

            return await cloudFunctionsAPI.call('deleteFlashcardDeck', { deckId, userId });

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