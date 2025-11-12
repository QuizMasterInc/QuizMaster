// Re-export all CREATE operations
const addOperations = require('./add');
Object.assign(module.exports, addOperations);

// Re-export all READ operations
const getOperations = require('./get');
Object.assign(module.exports, getOperations);

// Re-export all UPDATE operations
const updateOperations = require('./update');
Object.assign(module.exports, updateOperations);

// Re-export all DELETE operations
const deleteOperations = require('./delete');
Object.assign(module.exports, deleteOperations);