import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { ClipLoader } from 'react-spinners';
import { db } from '../../../services/firebase/firebaseService';

/**
 * StudyResults - Displays study session completion summary
 * Responsible for: Results display and post-study navigation
 */
const StudyResults = () => {
    const { deckId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResults = async () => {
            try {
                const sessionId = location.state?.sessionId;
                
                if (!sessionId) {
                    navigate(`/flashcards`);
                    return;
                }

                const sessionDoc = await getDoc(doc(db, 'study_sessions', sessionId));
                
                if (sessionDoc.exists()) {
                    setSessionData(sessionDoc.data());
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error loading results:', error);
                setLoading(false);
            }
        };

        loadResults();
    }, [deckId, location.state, navigate]);

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <ClipLoader color="var(--primary-400)" size={50} />
                    <p className="text-lg text-secondary">Loading results...</p>
                </div>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="dashboard-content">
                <div className="max-w-md mx-auto mt-20">
                    <div className="card text-center space-y-4">
                        <h2 className="text-2xl font-bold text-gradient-primary">Session Not Found</h2>
                        <button 
                            onClick={() => navigate('/flashcards')}
                            className="btn btn-primary"
                        >
                            Back to Decks
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { stats, cardsStudied } = sessionData;
    const minutes = Math.floor(stats.timeSpent / 60);
    const seconds = stats.timeSpent % 60;

    return (
        <div className="dashboard-content">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-extrabold tracking-tight drop-shadow text-gradient-primary">
                        🎉 Study Session Complete!
                    </h1>
                    <p className="text-lg text-secondary">Great work! Here's your performance summary.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="card text-center p-6 space-y-2 border-2 border-accent hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl">📚</div>
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide">Cards Studied</h3>
                        <p className="text-4xl font-bold text-gradient-primary">{cardsStudied}</p>
                    </div>

                    <div className="card text-center p-6 space-y-2 border-2 border-accent hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl">⏱️</div>
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide">Time Spent</h3>
                        <p className="text-4xl font-bold text-gradient-primary">
                            {minutes > 0 && `${minutes}m `}{seconds}s
                        </p>
                    </div>

                    <div className="card text-center p-6 space-y-2 border-2 border-accent hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl">🎯</div>
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide">Success Rate</h3>
                        <p className="text-4xl font-bold text-gradient-primary">{stats.successRate.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Performance Breakdown */}
                <div className="card p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-gradient-primary text-center">Performance Breakdown</h2>
                    
                    <div className="space-y-4">
                        {/* Easy Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="text-2xl">😊</span>
                                    <span className="text-success">Easy</span>
                                </span>
                                <span className="text-lg font-bold text-primary">{stats.easyCount}</span>
                            </div>
                            <div className="w-full h-3 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[var(--success)] transition-all duration-500"
                                    style={{ width: `${(stats.easyCount / cardsStudied) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Good Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="text-2xl">👍</span>
                                    <span className="text-warning">Good</span>
                                </span>
                                <span className="text-lg font-bold text-primary">{stats.goodCount}</span>
                            </div>
                            <div className="w-full h-3 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[var(--warning)] transition-all duration-500"
                                    style={{ width: `${(stats.goodCount / cardsStudied) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Hard Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="text-2xl">😰</span>
                                    <span className="text-error">Hard</span>
                                </span>
                                <span className="text-lg font-bold text-primary">{stats.hardCount}</span>
                            </div>
                            <div className="w-full h-3 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[var(--error)] transition-all duration-500"
                                    style={{ width: `${(stats.hardCount / cardsStudied) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                        className="px-8 py-3 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                        onClick={() => navigate(`/flashcards/study/${deckId}`)}
                    >
                        📖 Study Again
                    </button>
                    <button 
                        className="px-8 py-3 bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                        onClick={() => navigate('/flashcards')}
                    >
                        🏠 Back to Decks
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudyResults;
