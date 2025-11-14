import PropTypes from 'prop-types';
/**
 * StudyProgressBar - Displays progress through the deck
 * Responsible for: Progress visualization only
 */
const StudyProgressBar = ({ currentIndex, total }) => {
    const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
    
    return (
        <div className="w-full space-y-2">
            <div className="w-full h-2 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-[var(--primary-400)] to-[var(--primary-600)] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={currentIndex + 1}
                    aria-valuemin={1}
                    aria-valuemax={total}
                />
            </div>
            <div className="text-center">
                <span className="text-sm font-semibold text-secondary">
                    Card {currentIndex + 1} of {total}
                </span>
            </div>
        </div>
    );
};

StudyProgressBar.propTypes = {
    currentIndex: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
};

export default StudyProgressBar;
