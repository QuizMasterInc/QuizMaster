/**
 * useQuizFiltering Hook
 * Handles quiz search, sort, and privacy filtering with URL sync and debouncing
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useQuizFiltering(enabledFilters = ['search', 'privacy', 'sort']) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimerRef = useRef(null);

  // Get current filter values from URL (memoized to prevent infinite re-renders)
  const filters = useMemo(() => ({
    searchTerm: searchParams.get('q') || '',
    sortBy: searchParams.get('sort') || 'newest',
    privacy: searchParams.get('privacy') || 'All'
  }), [searchParams]);

  // Initialize debounced search term
  useEffect(() => {
    setDebouncedSearchTerm(filters.searchTerm);
  }, []);

  // Update URL params when filters change
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };

    // Handle search term with debouncing
    if (newFilters.searchTerm !== undefined) {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set new timer for 300ms delay
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedSearchTerm(newFilters.searchTerm);
      }, 300);
    }

    // Update URL params immediately for all filters
    const params = {};
    
    if (updatedFilters.searchTerm !== undefined ? updatedFilters.searchTerm : filters.searchTerm) {
      params.q = updatedFilters.searchTerm !== undefined ? updatedFilters.searchTerm : filters.searchTerm;
    }
    if (updatedFilters.sortBy !== undefined ? updatedFilters.sortBy !== 'newest' : filters.sortBy !== 'newest') {
      params.sort = updatedFilters.sortBy !== undefined ? updatedFilters.sortBy : filters.sortBy;
    }
    if (enabledFilters.includes('privacy') && (updatedFilters.privacy !== undefined ? updatedFilters.privacy !== 'All' : filters.privacy !== 'All')) {
      params.privacy = updatedFilters.privacy !== undefined ? updatedFilters.privacy : filters.privacy;
    }

    setSearchParams(params, { replace: true });
  }, [filters, enabledFilters, setSearchParams]);

  // Client-side filtering and sorting utilities
  const sortQuizzes = useCallback((quizArray, sortValue) => {
    const sorted = [...quizArray];

    const parseCreatedAt = (createdAt) => {
      if (!createdAt) return 0;
      return new Date(createdAt).getTime();
    };

    switch (sortValue) {
      case "newest":
        sorted.sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
        break;
      case "oldest":
        sorted.sort((a, b) => parseCreatedAt(a.createdAt) - parseCreatedAt(b.createdAt));
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "titleReverse":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "shortest":
        sorted.sort((a, b) => a.numQuestions - b.numQuestions);
        break;
      case "longest":
        sorted.sort((a, b) => b.numQuestions - a.numQuestions);
        break;
      default:
        sorted.sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
    }

    return sorted;
  }, []);

  const applyClientSideFilters = useCallback((quizzes) => {
    let filtered = [...quizzes];

    // Apply search filter
    if (filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(quiz => {
        const titleMatch = quiz.title.toLowerCase().includes(searchTerm);
        const tagsMatch = quiz.tags && Array.isArray(quiz.tags) && quiz.tags.length > 0
          ? quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          : false;
        return titleMatch || tagsMatch;
      });
    }

    // Apply sorting
    filtered = sortQuizzes(filtered, filters.sortBy);

    return filtered;
  }, [filters, sortQuizzes]);

  return {
    filters,
    debouncedSearchTerm,
    updateFilters,
    sortQuizzes,
    applyClientSideFilters
  };
}
