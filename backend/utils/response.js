/**
 * Utility to handle responses.
 * @param {number} code - HTTP status code.
 * @param {string} status - Status message (e.g., 'success', 'error').
 * @param {object} data - Data to be returned in the response.
 * @param {string} message - Optional message for the response.
 * @returns {object} A standardized response object.
 */
const response = (code, status, data, message = '') => ({
  code,
  status,
  data,
  message,
});

module.exports = response;
