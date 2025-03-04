const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define sub-schemas for better organization
const StatusHistorySchema = new Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'canceled', 'failed', 'disputed'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String
});

const QualityMetricsSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  reviewDate: Date,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  satisfactionScore: {
    type: Number,
    min: 0,
    max: 100
  },
  qualityIssues: [{
    issue: String,
    reportedDate: Date,
    resolvedDate: Date,
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open'
    }
  }]
});

const PaymentDetailsSchema = new Schema({
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: v => v ? parseFloat(v.toString()) : null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'wallet']
  },
  escrowId: String,
  platformFee: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: v => v ? parseFloat(v.toString()) : null
  },
  providerEarnings: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: v => v ? parseFloat(v.toString()) : null
  },
  refundDetails: {
    amount: mongoose.Schema.Types.Decimal128,
    reason: String,
    status: {
      type: String,
      enum: ['requested', 'approved', 'processed', 'rejected']
    },
    processedDate: Date
  }
});

const bookingSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer', // The actual client
      required: true,
    },
    requested_by: {
      type: Schema.Types.ObjectId,
      refPath: 'requested_by_role', // Can be a Client or Client Admin
      required: true,
    },
    requested_by_role: {
      type: String,
      enum: ['client', 'client_admin'], // Determines whether a client or an admin made the request
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    serviceman: {
      assigned: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceMan'
      },
      autoAssigned: {
        type: Boolean,
        default: false
      },
      assignmentCriteria: {
        skillsMatched: [String],
        distance: Number,
        currentWorkload: Number,
        matchScore: Number
      }
    },
    organisation: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: false, // Optional in case the booking isn't branch-specific
    },
    schedule: {
      requestedDate: {
        type: Date,
        required: true
      },
      confirmedDate: Date,
      estimatedDuration: Number, // in minutes
      actualDuration: Number, // in minutes
      timeSlot: {
        start: Date,
        end: Date
      },
      rescheduled: [{
        oldDate: Date,
        newDate: Date,
        reason: String,
        requestedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      }]
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'canceled', 'failed', 'disputed'],
      default: 'pending',
      required: true,
    },
    statusHistory: [StatusHistorySchema],
    quality: QualityMetricsSchema,
    payment: PaymentDetailsSchema,
    location: {
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      }
    },
    notes: [{
      content: String,
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    attachments: [{
      filename: String,
      url: String,
      type: String,
      uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    commission_fee: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: v => v ? parseFloat(v.toString()) : null
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true }
  }
);

// Indexes for better query performance
bookingSchema.index({ 'location.coordinates': '2dsphere' });
bookingSchema.index({ status: 1, 'schedule.requestedDate': 1 });
bookingSchema.index({ 'serviceman.assigned': 1, status: 1 });
bookingSchema.index({ organisation: 1, branch: 1 });

// Middleware to handle status changes
bookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this._updatedBy || this.requested_by
    });
  }
  next();
});

// Virtual for calculating service duration
bookingSchema.virtual('duration').get(function () {
  if (this.schedule.actualDuration) {
    return this.schedule.actualDuration;
  }
  return this.schedule.estimatedDuration;
});

// Method to check if booking can be canceled
bookingSchema.methods.canBeCanceled = function () {
  const now = new Date();
  const bookingDate = this.schedule.confirmedDate || this.schedule.requestedDate;
  const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);
  return hoursDifference >= 24 && ['pending', 'confirmed'].includes(this.status);
};

module.exports = mongoose.model('Booking', bookingSchema);
