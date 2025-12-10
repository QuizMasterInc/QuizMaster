/**
 * useFlashcardFiltering Hook
 * Handles flashcard deck search and filtering logic
 */

import { useState, useEffect } from 'react';

export function useFlashcardFiltering(decks) {
  const [filteredDecks, setFilteredDecks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Filter decks based on search and filters
  useEffect(() => {
    let filtered = decks;

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(deck => {
        // Check title
        if (deck.title?.toLowerCase().includes(lowerSearch)) return true;
        
        // Check description
        if (deck.description?.toLowerCase().includes(lowerSearch)) return true;
        
        // Check tags (only if tags exist and is a non-empty array)
        if (Array.isArray(deck.tags) && deck.tags.length > 0) {
          return deck.tags.some(tag => 
            tag && typeof tag === 'string' && tag.toLowerCase().includes(lowerSearch)
          );
        }
        
        return false;
      });
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(deck => deck.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(deck => deck.difficulty === selectedDifficulty);
    }

    setFilteredDecks(filtered);
  }, [decks, searchTerm, selectedCategory, selectedDifficulty]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All';

  return {
    filteredDecks,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    clearFilters,
    hasActiveFilters
  };
}
