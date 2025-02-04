const mongoose = require("mongoose");

const organisationTypeSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true 
    }, // Example: "Bank", "Hospital", "IT Company"
    description: { 
      type: String 
    }, // Optional description for clarity
    is_active: { 
      type: Boolean, 
      default: true 
    }, // If the type is active
  },
  { timestamps: true }
);


module.exports = mongoose.model("OrganisationType", organisationTypeSchema);