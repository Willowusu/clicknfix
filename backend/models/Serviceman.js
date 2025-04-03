const mongoose = require('mongoose');

const servicemanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    assignedServices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }],
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Serviceman', servicemanSchema);
