import PropTypes from 'prop-types';

const NavButtons = ({ onNextClick, onPrevClick, disablePrev = false, disableNext = false }) => {
    return (
        <div className="flex justify-center gap-4">
            <button 
                onClick={onPrevClick}
                className="flex items-center px-1 py-2 bg-[var(--primary-400)] text-white rounded-lg 
                           font-semibold shadow-lg hover:shadow-xl transform hover:scale-105
                           border-2 border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disablePrev}
            >
                <span className="text-2xl mb-1">⬅️</span>
                <span>Previous</span>
            </button>
            <button 
                onClick={onNextClick}
                className="flex items-center px-4 py-2 bg-[var(--primary-400)] text-white rounded-lg 
                           font-semibold shadow-lg hover:shadow-xl transform hover:scale-105
                           border-2 border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disableNext}
            >
                <span className="text-2xl mb-1">➡️</span>
                <span>Next</span>
            </button>
        </div>
    );
};

NavButtons.propTypes = {
    onPrevClick: PropTypes.func.isRequired,
    onNextClick: PropTypes.func.isRequired,
    disablePrev: PropTypes.bool,
    disableNext: PropTypes.bool
};

export default NavButtons;
