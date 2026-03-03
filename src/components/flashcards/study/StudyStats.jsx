import PropTypes from 'prop-types';
/**
 * StudyStats - Displays real-time study session statistics
 * Responsible for: Statistics display only
 */
const StudyStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="card text-center p-4 border border-error">
                <span className="block text-sm font-semibold text-secondary mb-1">Still Learning</span>
                <span className="block text-3xl font-bold text-gradient-primary">{stats.stillLearningCount}</span>
            </div>
            <div className="card text-center p-4 border border-success">
                <span className="block text-sm font-semibold text-secondary mb-1">Know</span>
                <span className="block text-3xl font-bold text-gradient-primary">{stats.knowCount}</span>
            </div>
        </div>
    );
};

StudyStats.propTypes = {
    stats: PropTypes.shape({
        knowCount: PropTypes.number.isRequired,
        stillLearningCount: PropTypes.number.isRequired,
        successRate: PropTypes.number
    }).isRequired
};

export default StudyStats;
