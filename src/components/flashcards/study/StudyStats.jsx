import PropTypes from 'prop-types';
/**
 * StudyStats - Displays real-time study session statistics
 * Responsible for: Statistics display only
 */
const StudyStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="card text-center p-4 border border-success">
                <span className="block text-sm font-semibold text-secondary mb-1">Easy</span>
                <span className="block text-3xl font-bold text-gradient-primary">{stats.easyCount}</span>
            </div>
            <div className="card text-center p-4 border border-warning">
                <span className="block text-sm font-semibold text-secondary mb-1">Good</span>
                <span className="block text-3xl font-bold text-gradient-primary">{stats.goodCount}</span>
            </div>
            <div className="card text-center p-4 border border-error">
                <span className="block text-sm font-semibold text-secondary mb-1">Hard</span>
                <span className="block text-3xl font-bold text-gradient-primary">{stats.hardCount}</span>
            </div>
        </div>
    );
};

StudyStats.propTypes = {
    stats: PropTypes.shape({
        easyCount: PropTypes.number.isRequired,
        goodCount: PropTypes.number.isRequired,
        hardCount: PropTypes.number.isRequired,
        successRate: PropTypes.number
    }).isRequired
};

export default StudyStats;
