import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CloudFunctionsAPI from '../../services/api/cloudFunctions';
import { containsProfanity } from '../../utils/profanityFilter';

const FeedbackForm = ({ isOpen, onClose }) => {
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(5);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (containsProfanity(message)) {
            setError('Please keep your feedback respectful.');
            setLoading(false);
            return;
        }

        try {
            await CloudFunctionsAPI.submitFeedback(message, rating);
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSubmitted(false);
        setMessage('');
        setRating(5);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
            
            <div className="relative z-50 p-4 bg-[var(--primary-400)] rounded-lg border-2 border-accent max-w-2xl w-full mx-4">
                {submitted ? (
                    <div className="text-center py-4">
                        <p className="text-lg font-medium text-primary mb-4">Thanks for your feedback!</p>
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xl font-bold text-black">Leave Feedback</h3>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="text-secondary hover:text-primary text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0">
                                    <label className="block text-secondary font-medium text-left text-sm mb-1">Rating</label>
                                    <select
                                        value={rating}
                                        onChange={(e) => setRating(Number(e.target.value))}
                                        className="px-3 py-2 rounded-lg bg-[var(--primary-300)] border border-accent text-primary"
                                    >
                                        <option value={5}>5 - Excellent</option>
                                        <option value={4}>4 - Good</option>
                                        <option value={3}>3 - Okay</option>
                                        <option value={2}>2 - Poor</option>
                                        <option value={1}>1 - Terrible</option>
                                    </select>
                                </div>

                                <div className="flex-grow">
                                    <label className="block text-secondary font-medium text-left text-sm mb-1">Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--primary-300)] border border-accent text-primary overflow-y-auto"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 mt-6"
                                >
                                    {loading ? '...' : 'Submit'}
                                </button>
                            </div>

                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackForm;
