// Re-export all CRUD operations
const crudOperations = require('./crud');
Object.assign(module.exports, crudOperations);

// Re-export all browsing operations
const browsingOperations = require('./browsing');
Object.assign(module.exports, browsingOperations);