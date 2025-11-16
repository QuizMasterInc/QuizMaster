/**
 * Tag processing utilities
 */

/**
 * Process tags from comma-separated input string
 * @param {string} inputValue - Comma-separated tags string
 * @returns {Array<string>} Array of processed tags
 */
export const processTagsFromInput = (inputValue) => {
  if (!inputValue || typeof inputValue !== 'string') {
    return [];
  }

  return inputValue
    .split(',')                    // Split by comma
    .map(tag => tag.trim())        // Trim whitespace
    .filter(tag => tag !== '');    // Remove empty entries
};

/**
 * Convert tags array to display string
 * @param {Array<string>} tags - Array of tags
 * @returns {string} Comma-separated tags string
 */
export const tagsToString = (tags) => {
  if (!Array.isArray(tags)) {
    return '';
  }
  return tags.join(', ');
};

/**
 * Validate tag name
 * @param {string} tag - Tag to validate
 * @returns {boolean} True if valid
 */
export const isValidTag = (tag) => {
  return tag && tag.trim().length > 0 && tag.trim().length <= 50;
};

/**
 * Sanitize tag name
 * @param {string} tag - Tag to sanitize
 * @returns {string} Sanitized tag
 */
export const sanitizeTag = (tag) => {
  return tag.trim().replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

/**
 * Get unique tags from array
 * @param {Array<string>} tags - Tags array
 * @returns {Array<string>} Unique tags
 */
export const getUniqueTags = (tags) => {
  return [...new Set(tags.map(sanitizeTag).filter(isValidTag))];
};
