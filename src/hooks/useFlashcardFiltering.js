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
      filtered = filtered.filter(deck =>
        deck.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
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
