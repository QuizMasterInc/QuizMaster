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
                            onClick={() => navigate(location.state?.from || '/dashboard')}
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
                        <div className="text-4xl">📈</div>
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide">Learning Progress</h3>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-[var(--success)]">{stats.knowCount} Mastered</p>
                            <p className="text-sm text-[var(--text-muted)]">{stats.stillLearningCount} Need Practice</p>
                        </div>
                    </div>
                </div>

                {/* Performance Breakdown */}
                <div className="card p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-gradient-primary text-center">Learning Insights</h2>

                    {/* Actionable Recommendations */}
                    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border-l-4 border-[var(--primary-500)]">
                        <h3 className="font-semibold text-[var(--text-primary)] mb-2">💡 Study Recommendations</h3>
                        <div className="space-y-2 text-sm">
                            {stats.stillLearningCount > 0 && (
                                <p className="text-[var(--error)]">
                                    • Review the {stats.stillLearningCount} card(s) you marked as "Still Learning"
                                </p>
                            )}
                            {stats.knowCount === cardsStudied && (
                                <p className="text-[var(--success)]">
                                    • Excellent! All cards mastered. Try a harder deck for a challenge!
                                </p>
                            )}
                            {stats.stillLearningCount === 0 && stats.knowCount < cardsStudied && (
                                <p className="text-[var(--success)]">
                                    • Perfect session! Consider spaced repetition for long-term retention.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Know Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="text-2xl">😊</span>
                                    <span className="text-success">Mastered ({stats.knowCount})</span>
                                </span>
                                <span className="text-lg font-bold text-primary">{((stats.knowCount / cardsStudied) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-3 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--success)] transition-all duration-500"
                                    style={{ width: `${(stats.knowCount / cardsStudied) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Still Learning Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="text-2xl">😰</span>
                                    <span className="text-error">Difficult ({stats.stillLearningCount})</span>
                                </span>
                                <span className="text-lg font-bold text-primary">{((stats.stillLearningCount / cardsStudied) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-3 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--error)] transition-all duration-500"
                                    style={{ width: `${(stats.stillLearningCount / cardsStudied) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        className="min-w-[200px] px-8 py-3 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                        onClick={() => navigate(`/flashcards/study/${deckId}`)}
                    >
                        📖 Study Again
                    </button>
                    <button
                        className="min-w-[200px] px-8 py-3 bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                        onClick={() => navigate(location.state?.from || '/dashboard')}
                    >
                        🏠 Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudyResults;
