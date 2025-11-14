import PropTypes from 'prop-types';

/**
 * RatingButtons - Card difficulty rating buttons
 * Responsible for: Rating button display and interaction only
 */
const RatingButtons = ({ onRate, disabled = false }) => {
    return (
        <div className="flex justify-center gap-4">
            <button 
                onClick={() => onRate('hard')}
                className="flex flex-col items-center px-8 py-4 bg-[var(--error)] text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white"
                disabled={disabled}
                aria-label="Mark as hard"
            >
                <span className="text-2xl mb-1">😰</span>
                <span>Hard</span>
            </button>
            <button 
                onClick={() => onRate('good')}
                className="flex flex-col items-center px-8 py-4 bg-[var(--warning)] text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white"
                disabled={disabled}
                aria-label="Mark as good"
            >
                <span className="text-2xl mb-1">👍</span>
                <span>Good</span>
            </button>
            <button 
                onClick={() => onRate('easy')}
                className="flex flex-col items-center px-8 py-4 bg-[var(--success)] text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white"
                disabled={disabled}
                aria-label="Mark as easy"
            >
                <span className="text-2xl mb-1">😊</span>
                <span>Easy</span>
            </button>
        </div>
    );
};

RatingButtons.propTypes = {
    onRate: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

export default RatingButtons;
