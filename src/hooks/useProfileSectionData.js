import { useEffect, useState, useMemo } from 'react';
import AuthService from '../services/auth/authService';
import ResultService from '../services/quiz/resultService';
import FlashcardService from '../services/flashcards/flashcardService';
import cloudFunctionsAPI from '../services/api/cloudFunctions';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function useProfileSectionData(userId) {
    const [profile, setProfile] = useState(null);
    const [allQuizzes, setAllQuizzes] = useState([]);
    const [allResults, setAllResults] = useState([]);
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        Promise.all([
            AuthService.getUserProfile(userId),
            cloudFunctionsAPI.getAllCustomQuizzes(),
            ResultService.getUserAttempts(userId),
            FlashcardService.getUserFlashcardDecks(userId)
        ])
            .then(([profileData, quizzesData, resultsData, decksData]) => {
                setProfile(profileData);
                setAllQuizzes((quizzesData.result ? quizzesData.data : quizzesData) || []);
                setAllResults(resultsData.attempts || []);
                setDecks((decksData || []).filter(d => {
                    const lastStudied = d.analytics?.stats?.lastStudiedAt ? new Date(d.analytics.stats.lastStudiedAt).getTime() : 0;
                    return Date.now() - lastStudied <= SEVEN_DAYS_MS;
                }));
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, [userId]);

    // Filter results to recent (last 7 days)
    const results = useMemo(() => {
        const now = Date.now();
        return allResults.filter(result => {
            const submittedTime = result.submittedAt ? result.submittedAt.getTime() : 0;
            return now - submittedTime <= SEVEN_DAYS_MS;
        });
    }, [allResults]);

    // Filter quizzes to those with recent attempts (custom quizzes taken by user in last 7 days)
    const quizzes = useMemo(() => {
        const recentCustomResults = results.filter(r => r.quizType === 'custom');
        const recentQuizIds = new Set(recentCustomResults.map(r => r.quizId));

        return allQuizzes
            .filter(q => recentQuizIds.has(q.uid))
            .map(quiz => {
                const quizResults = recentCustomResults.filter(r => r.quizId === quiz.uid);
                const lastAttempt = quizResults.length > 0
                    ? new Date(Math.max(...quizResults.map(r => r.submittedAt.getTime())))
                    : null;
                return { ...quiz, lastAttempt };
            })
            .sort((a, b) => (b.lastAttempt || 0) - (a.lastAttempt || 0));
    }, [allQuizzes, results]);

    // Calculate averages for custom quizzes
    const quizAverages = useMemo(() => {
        if (!results || !allQuizzes) return [];
        const quizStats = {};
        results.forEach(result => {
            if (result.quizType === 'custom') {
                if (!quizStats[result.quizId]) {
                    quizStats[result.quizId] = {
                        attempts: [],
                        quiz: allQuizzes.find(q => q.uid === result.quizId)
                    };
                }
                quizStats[result.quizId].attempts.push(result);
            }
        });
        return Object.entries(quizStats).map(([quizId, data]) => {
            const attempts = data.attempts;
            const scores = attempts.map(a => a.percentage || 0);
            const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            const maxScore = Math.max(...scores);
            const minScore = Math.min(...scores);
            const quizTitle = data.quiz?.title || "Unknown Quiz";
            const totalQuestions = attempts[0]?.totalQuestions || (data.quiz?.content?.questions ? Object.keys(data.quiz.content.questions).length : 'N/A');
            return {
                quizId,
                quiz: data.quiz,
                title: quizTitle,
                averageScore: Math.round(averageScore),
                maxScore,
                minScore,
                totalAttempts: attempts.length,
                totalQuestions,
                lastAttempt: attempts.length > 0 ? new Date(Math.max(...attempts.map(a => a.submittedAt.getTime()))) : null
            };
        }).sort((a, b) => (b.lastAttempt || 0) - (a.lastAttempt || 0));
    }, [results, allQuizzes]);

    // Calculate overall quiz statistics
    const overallStats = useMemo(() => {
        if (!results || results.length === 0) return null;
        const defaultResults = results.filter(r => r.quizType === 'default');
        const customResults = results.filter(r => r.quizType === 'custom');
        const calculateStats = (resultSet) => {
            if (resultSet.length === 0) return null;
            const scores = resultSet.map(r => r.percentage || 0);
            const totalScore = scores.reduce((a, b) => a + b, 0);
            const averageScore = totalScore / scores.length;
            const bestScore = Math.max(...scores);
            const totalAttempts = resultSet.length;
            return {
                averageScore: Math.round(averageScore),
                bestScore,
                totalAttempts,
                totalScore: Math.round(totalScore)
            };
        };
        return {
            default: calculateStats(defaultResults),
            custom: calculateStats(customResults),
            overall: calculateStats(results)
        };
    }, [results]);

    return { profile, quizzes, allQuizzes, results, decks, loading, error, quizAverages, overallStats };
}