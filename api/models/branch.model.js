const mongoose = require('mongoose');


const branchSchema = new mongoose.Schema(
    {
      name: { 
        type: String, 
        required: true,
        unique: true 
      }, // Branch name (e.g., Accra Main Branch)
      organisation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Organisation", 
        required: true 
      }, // Link to parent Organisation
      location: { 
        type: String 
      }, // Optional: Physical address of the branch
      phone: { 
        type: String 
      }, // Optional: Contact number for the branch
      clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Client" }], // Clients under this branch
      is_active: { 
        type: Boolean, 
        default: true 
      }, // If the branch is active
    },
    { timestamps: true }
  );

  module.exports = mongoose.model('Branch', branchSchema)