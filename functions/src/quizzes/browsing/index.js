// Re-export all GENERAL browsing operations
const generalOperations = require('./general');
Object.assign(module.exports, generalOperations);

// Re-export all TEACHER browsing operations
const teacherOperations = require('./teacher');
Object.assign(module.exports, teacherOperations);