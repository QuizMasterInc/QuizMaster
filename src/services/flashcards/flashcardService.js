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

        // Create deck object matching our flattened schema
        const deckObject = {
            // Basic metadata
            title: deckName.trim(),
            description: description || "",
            category: category || "General",
            tags: this.normalizeTags(tags),
            cardCount: cards.length,
            isPublic: isPublic || false,
            difficulty: difficulty || "2",
            
            // Creator info
            creatorId: currentUserId,
            creatorName: "", // Will be populated by backend
            
            // Content
            cards: cards,
            
            // Access control
            allowCopying: true,
            
            // Analytics (initialized)
            analytics: {
                stats: {
                    timesStudied: 0,
                    lastStudiedAt: null
                }
            },
            
            // Timestamps (will be set by backend)
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastStudiedAt: null,
            
            // Status
            isActive: true
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
     * Update an existing flashcard deck
     * @param {Object} deckData - The deck data including deckId and updates
     * @returns {Promise<Object>} - API response
     */
    async updateFlashcardDeck(deckData) {
        try {
            if (!deckData.deckId) {
                throw new Error('Deck ID is required for update');
            }
            
            // Use unified CloudFunctionsAPI which handles the base URL and error parsing
            return await cloudFunctionsAPI.updateFlashcardDeck(deckData);
        } catch (error) {
            console.error('Error updating flashcard deck:', error);
            throw error;
        }
    }

    /**
     * Update deck analytics after study session
     * @param {string} deckId - Deck ID
     * @returns {Promise<void>}
     */
    async updateDeckAnalytics(deckId) {
        try {
            if (!deckId) {
                throw new Error('Deck ID is required');
            }

            return await cloudFunctionsAPI.call('updateFlashcardDeckAnalytics', { deckId });

        } catch (error) {
            console.error('Error updating deck analytics:', error);
            throw error;
        }
    }

    /**
     * Browse public flashcard decks with filters
     * @param {Object} options - Filter and sort options
     * @returns {Promise<Array>} Array of public decks
     */
    async browsePublicFlashcards(options = {}) {
        try {
            const { category, difficulty, sortBy, limitCount = 50 } = options;

            const queryOptions = {
                isPublic: true,
                isActive: true,
                category: category !== 'all' ? category : undefined,
                difficulty: difficulty !== 'all' ? difficulty : undefined,
                sortBy: sortBy || 'recent',
                limit: limitCount
            };

            // Remove undefined values
            Object.keys(queryOptions).forEach(key => 
                queryOptions[key] === undefined && delete queryOptions[key]
            );

            const result = await cloudFunctionsAPI.call('browsePublicFlashcards', queryOptions, 'GET');
            
            // Normalize all decks
            return (result.decks || []).map(deck => this.normalizeDeckData(deck));

        } catch (error) {
            console.error('Error browsing public flashcards:', error);
            throw error;
        }
    }

    /**
     * Get unique categories from public flashcards
     * @returns {Promise<Array>} Array of category names
     */
    async getPublicFlashcardCategories() {
        try {
            const result = await cloudFunctionsAPI.call('getFlashcardCategories', {}, 'GET');
            return result.categories || ['General'];
        } catch (error) {
            console.error('Error fetching flashcard categories:', error);
            // Return default if error
            return ['General'];
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
            title: deck.title || deck.name || 'Untitled Deck',
            description: deck.description || '',
            
            // Content info
            cardCount: deck.cardCount || (deck.cards ? Object.keys(deck.cards).length : 0),
            cards: deck.cards || {},
            category: deck.category || 'General',
            difficulty: deck.difficulty || '2',
            
            // Tags handling
            tags: deck.tags ? 
                  (typeof deck.tags === 'string' ? deck.tags.split(',').map(t => t.trim()) : deck.tags) : [],
            
            // Creator info
            creatorId: deck.creatorId || '',
            
            // Access info
            isPublic: deck.isPublic || false,
            isPrivate: !deck.isPublic,
            
            // Analytics
            timesStudied: deck.analytics?.stats?.timesStudied || deck.timesStudied || 0,
            lastStudiedAt: deck.analytics?.stats?.lastStudiedAt || deck.lastStudiedAt || null,
            
            // Timestamps
            createdAt: deck.createdAt,
            updatedAt: deck.updatedAt,
            
            // Status
            isActive: deck.isActive !== false
        };
    }
}

export default new FlashcardService();