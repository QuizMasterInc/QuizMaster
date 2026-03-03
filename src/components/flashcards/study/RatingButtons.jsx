import PropTypes from 'prop-types';

/**
 * RatingButtons - Card comprehension buttons
 * Responsible for: Rating button display and interaction only
 */
const RatingButtons = ({ onRate, disabled = false }) => {
    return (
        <div className="flex justify-center gap-4">
            <button 
                onClick={() => onRate('still learning')}
                className="flex flex-col items-center px-7 py-4 bg-[var(--error)] text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white"
                disabled={disabled}
                aria-label="Mark as still learning"
            >
                <span className="text-2xl mb-1">🧠</span>
                <span>Still Learning</span>
            </button>
            <button 
                onClick={() => onRate('know')}
                className="flex flex-col items-center px-14 py-4 bg-[var(--success)] text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white"
                disabled={disabled}
                aria-label="Mark as know"
            >
                <span className="text-2xl mb-1">😊</span>
                <span>Know</span>
            </button>
        </div>
    );
};

RatingButtons.propTypes = {
    onRate: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

export default RatingButtons;
