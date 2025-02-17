const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
      type: Schema.Types.ObjectId,
      ref: 'ServiceMan',
      required: true,
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
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'canceled', 'failed'],
      default: 'pending',
      required: true,
    },
    commission_fee: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: v => v ? parseFloat(v.toString()) : null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
