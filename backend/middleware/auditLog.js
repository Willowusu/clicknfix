const AuditLog = require('../models/AuditLog');

/**
 * Creates an audit log middleware for a specific action type
 * @param {string} actionType - The type of action being performed (e.g., 'create_user', 'update_service')
 * @returns {Function} Express middleware function
 */
const createAuditLog = (actionType) => {
  return async (req, res, next) => {
    // Store the original send function
    const originalSend = res.send;
    let responseBody;

    // Override the send function to capture the response
    res.send = function(body) {
      responseBody = body;
      return originalSend.apply(res, arguments);
    };

    // Get entity type from the URL path
    const entityType = req.path.split('/')[1]; // e.g., /users/123 -> users

    // Extract relevant request data
    const requestData = {
      params: req.params,
      query: req.query,
      body: { ...req.body }
    };

    // Remove sensitive data
    if (requestData.body.password) delete requestData.body.password;
    if (requestData.body.token) delete requestData.body.token;

    // Create base audit log entry
    const auditLog = new AuditLog({
      user: req.user._id,
      actionType,
      entityType,
      entityId: req.params.id, // If there's an ID in the URL
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestMethod: req.method,
      requestUrl: req.originalUrl,
      requestParams: requestData.params,
      requestQuery: requestData.query,
      requestBody: requestData.body
    });

    // Function to finalize and save the audit log
    const finalizeAuditLog = async (status, responseData, errorMessage = null) => {
      try {
        auditLog.status = status;
        auditLog.responseStatus = res.statusCode;
        auditLog.responseData = responseData;
        if (errorMessage) {
          auditLog.errorMessage = errorMessage;
        }
        
        // Save audit log asynchronously
        await auditLog.save();
      } catch (error) {
        console.error('Error saving audit log:', error);
        // Don't throw error to prevent affecting the main request
      }
    };

    // Handle response completion
    res.on('finish', async () => {
      let responseData;
      try {
        responseData = JSON.parse(responseBody);
      } catch (e) {
        responseData = responseBody;
      }

      const status = res.statusCode >= 400 ? 'error' : 'success';
      await finalizeAuditLog(status, responseData);
    });

    // Handle errors
    res.on('error', async (error) => {
      await finalizeAuditLog('error', null, error.message);
    });

    next();
  };
};

module.exports = createAuditLog;
