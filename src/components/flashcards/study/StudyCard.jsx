import PropTypes from 'prop-types';
/**
 * StudyCard - Displays a single flashcard with flip functionality
 * Responsible for: Card display and flip animation only
 */
const StudyCard = ({ card, isFlipped, onFlip }) => {
    return (
        <div 
            className={`relative w-full h-96 perspective-1000 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
            onClick={onFlip}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onFlip()}
            aria-label={isFlipped ? 'Show question' : 'Show answer'}
        >
            <div className={`card-content w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front of card */}
                <div className="absolute w-full h-full backface-hidden">
                    <div className="card h-full flex flex-col items-center justify-center p-8 border-2 border-accent">
                        <h2 className="text-xl font-bold text-gradient-primary mb-6">Question</h2>
                        <p className="text-lg text-center text-primary leading-relaxed">{card.front}</p>
                        <span className="mt-6 text-sm text-muted italic">Click to reveal answer</span>
                    </div>
                </div>
                
                {/* Back of card */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                    <div className="card h-full flex flex-col items-center justify-center p-8 border-2 border-primary-400 bg-[var(--bg-primary)]">
                        <h2 className="text-xl font-bold text-gradient-primary mb-6">Answer</h2>
                        <p className="text-lg text-center text-primary leading-relaxed">{card.back}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

StudyCard.propTypes = {
    card: PropTypes.shape({
        id: PropTypes.string.isRequired,
        front: PropTypes.string.isRequired,
        back: PropTypes.string.isRequired,
        type: PropTypes.string
    }).isRequired,
    isFlipped: PropTypes.bool.isRequired,
    onFlip: PropTypes.func.isRequired
};

export default StudyCard;
