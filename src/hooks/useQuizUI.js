/**
 * useQuizUI Hook
 * 
 * Manages UI state for quiz components (modals, settings, view toggles)
 * Used by both QuizActivity and CustomQuizActivity
 */

import { useState, useEffect } from 'react';

export const useQuizUI = () => {
  const [helpActive, setHelpActive] = useState(false);
  const [doneActive, setDoneActive] = useState(false);
  const [answerCount, setAnswerCount] = useState(4);
  const [showResults, setShowResults] = useState(false);

  /**
   * Scroll to top when quiz loads
   * @param {boolean} loading - Loading state
   * @param {number} questionCount - Number of questions
   */
  const useScrollToTop = (loading, questionCount) => {
    useEffect(() => {
      if (!loading && questionCount > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, [loading, questionCount]);
  };

  /**
   * Open the help modal
   */
  const openHelp = () => setHelpActive(true);

  /**
   * Close the help modal
   */
  const closeHelp = () => setHelpActive(false);

  /**
   * Open the done/results modal
   */
  const openDone = () => setDoneActive(true);

  /**
   * Close the done/results modal
   */
  const closeDone = () => setDoneActive(false);

  /**
   * Show detailed results view
   */
  const viewDetailedResults = () => {
    setShowResults(true);
    setDoneActive(false);
  };

  return {
    // Modal states
    helpActive,
    doneActive,
    setHelpActive,
    setDoneActive,
    
    // Settings
    answerCount,
    setAnswerCount,
    
    // View state
    showResults,
    setShowResults,
    
    // Actions
    openHelp,
    closeHelp,
    openDone,
    closeDone,
    viewDetailedResults,
    useScrollToTop,
  };
};
