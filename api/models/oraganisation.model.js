const mongoose = require('mongoose');


const organisationSchema = new mongoose.Schema(
    {
      name: { 
          type: String, 
          required: true, 
          unique: true 
        }, // Organisation name (e.g., Stanbic)
      type: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "OrganisationType", 
          required: true 
        }, // Links to OrganisationType (e.g., Bank)
      provider: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Provider", 
          required: true 
        }, // The provider who owns this organisation
      is_active: { 
          type: Boolean, 
          default: true 
        }, // If the organisation is active
    },
    { timestamps: true }
  );

  module.exports = mongoose.model('Organisation', organisationSchema)