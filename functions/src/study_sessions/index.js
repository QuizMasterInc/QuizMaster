/**
 * Study Sessions Cloud Functions
 * 
 * This module provides CRUD operations for managing flashcard study sessions.
 * Endpoints:
 * - POST /createStudySession - Create new study session
 * - GET /getStudySession - Get session by ID
 * - GET /getActiveSession - Get active session for user/deck
 * - GET /getStudyHistory - Get user's completed sessions
 * - PUT /updateStudySession - Update session progress (rate a card)
 * - PUT /completeStudySession - Mark session as completed
 * - DELETE /deleteStudySession - Delete a session
 */

const {createStudySession} = require('./create');
const {getStudySession, getActiveSession, getStudyHistory} = require('./read');
const {updateStudySession} = require('./update');
const {completeStudySession, deleteStudySession} = require('./complete');

module.exports = {
    createStudySession,
    getStudySession,
    getActiveSession,
    getStudyHistory,
    updateStudySession,
    completeStudySession,
    deleteStudySession
};
