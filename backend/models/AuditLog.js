const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actionType: {
    type: String,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['success', 'error'],
    required: true,
    index: true
  },
  ipAddress: String,
  userAgent: String,
  requestMethod: String,
  requestUrl: String,
  requestParams: mongoose.Schema.Types.Mixed,
  requestQuery: mongoose.Schema.Types.Mixed,
  requestBody: mongoose.Schema.Types.Mixed,
  responseStatus: Number,
  responseData: mongoose.Schema.Types.Mixed,
  errorMessage: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Create compound indexes for common queries
auditLogSchema.index({ user: 1, actionType: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// Method to safely serialize the audit log
auditLogSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Remove sensitive information from request/response data
  if (obj.requestBody) {
    delete obj.requestBody.password;
    delete obj.requestBody.token;
  }
  if (obj.responseData) {
    delete obj.responseData.token;
  }
  
  return obj;
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
