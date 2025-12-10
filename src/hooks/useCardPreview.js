/**
 * useCardPreview Hook
 * Handles search and preview mode logic for flashcard study sessions
 * Separates preview/search concerns from main study flow
 */

import { useState, useMemo, useEffect } from 'react';

export function useCardPreview(cards, currentCardIndex, setCurrentCardIndex) {
    const [searchTerm, setSearchTerm] = useState("");
    const [previewMode, setPreviewMode] = useState(false);
    const [studyPosition, setStudyPosition] = useState(0);
    const [pendingJump, setPendingJump] = useState(null);

    // Filter cards based on search term
    const filteredResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        
        return cards
            .map((card, index) => ({ ...card, index }))
            .filter(card =>
                card.front?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.back?.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [searchTerm, cards]);

    // Handle pending jump after search closes (fixes mobile issue)
    useEffect(() => {
        if (pendingJump !== null) {
            // Clear search first
            setSearchTerm("");
            
            // Then update state in next tick to ensure proper batching
            setTimeout(() => {
                setStudyPosition(currentCardIndex);
                setPreviewMode(true);
                setCurrentCardIndex(pendingJump);
                setPendingJump(null);
            }, 0);
        }
    }, [pendingJump, currentCardIndex, setCurrentCardIndex]);

    // Jump to a card in preview mode
    const handleJumpToCard = (index) => {
        setPendingJump(index);
    };

    // Return to saved study position
    const handleReturnToStudy = () => {
        setCurrentCardIndex(studyPosition);
        setPreviewMode(false);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm("");
    };

    return {
        // Search state
        searchTerm,
        setSearchTerm,
        filteredResults,
        clearSearch,
        
        // Preview mode state
        previewMode,
        studyPosition,
        
        // Actions
        handleJumpToCard,
        handleReturnToStudy
    };
}
