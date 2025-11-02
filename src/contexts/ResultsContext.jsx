/**
 * Results Context - Provides optimized batch results to all components
 * Uses grabAllResultsV2 to fetch all categories in one call
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import resultService from '../services/quiz/resultService';

const ResultsContext = createContext();

export const useResults = () => {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error('useResults must be used within a ResultsProvider');
  }
  return context;
};

export const ResultsProvider = ({ children }) => {
  const [allResults, setAllResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch all results once
  useEffect(() => {
    async function fetchAllResults() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await resultService.getAllResults(currentUser.uid);
        setAllResults(results);
      } catch (err) {
        console.error('Error fetching all results:', err);
        setError(err.message);
        setAllResults({});
      } finally {
        setLoading(false);
      }
    }

    fetchAllResults();
  }, [currentUser?.uid]);

  // Get results for specific category
  const getResultsByCategory = (category) => {
    const categoryKey = Object.keys(allResults).find(
      key => key.toLowerCase() === category.toLowerCase()
    );

    if (categoryKey && allResults[categoryKey]) {
      return {
        score: allResults[categoryKey].score ?? 0,
        avgScore: allResults[categoryKey].avgScore ?? 0,
        attempts: allResults[categoryKey].attempts ?? 0
      };
    }

    return {
      score: 0,
      avgScore: 0,
      attempts: 0
    };
  };

  // Clear cache (useful after taking a new quiz)
  const refreshResults = async () => {
    resultService.clearResultsCache();
    
    if (currentUser?.uid) {
      try {
        setLoading(true);
        setError(null);
        const results = await resultService.getAllResults(currentUser.uid);
        setAllResults(results);
      } catch (err) {
        console.error('Error refreshing results:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const value = {
    allResults,
    loading,
    error,
    getResultsByCategory,
    refreshResults
  };

  return (
    <ResultsContext.Provider value={value}>
      {children}
    </ResultsContext.Provider>
  );
};