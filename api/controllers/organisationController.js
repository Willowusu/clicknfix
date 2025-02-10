const mongoose = require("mongoose");
const Organisation = require("../models/organisation.model");
const OrganisationType = require("../models/organisationType.model");
const Branch = require('../models/branch.model');
const Provider = require("../models/provider.model");


exports.createOrganisation = async (req, res) => {
  const session = await mongoose.startSession(); // Start a database transaction
  session.startTransaction();

  try {
    const { name, description, organisationType } = req.body;

    // Validate required fields
    if (!name || !organisationType) {
      return res.status(400).json({ error: "Name and organisation type are required." });
    }

    // Check if Organisation Type is valid
    const orgTypeExists = await OrganisationType.findById(organisationType).session(session);
    if (!orgTypeExists) {
      return res.status(404).json({ error: "Invalid Organisation Type." });
    }

    // Check if Organisation name already exists
    const orgExists = await Organisation.findOne({ name }).session(session);
    if (orgExists) {
      return res.status(400).json({ error: "Organisation with this name already exists." });
    }

    // Create Organisation
    const newOrganisation = new Organisation({
      name,
      description: description || "",
      organisationType,
    });

    await newOrganisation.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Organisation created successfully", organisation: newOrganisation });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};


exports.createOrganisationType = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if Organisation Type already exists
    const existingType = await OrganisationType.findOne({ name });
    if (existingType) {
      return res.status(400).json({ error: "Organisation Type already exists." });
    }

    // Create Organisation Type
    const newType = new OrganisationType({
      name,
      description: description || "",
    });

    await newType.save();
    res.status(201).json({ message: "Organisation Type created successfully", organisationType: newType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createOrganisationBranch = async (req, res) => {
  try {
    const { name, organisation, location } = req.body;

    // Validate Organisation
    const org = await Organisation.findById(organisation);
    if (!org) {
      return res.status(404).json({ error: "Organisation not found." });
    }

    // Check if Branch already exists under this Organisation
    const existingBranch = await Branch.findOne({ name, organisation });
    if (existingBranch) {
      return res.status(400).json({ error: "Branch already exists for this Organisation." });
    }

    // Create Branch
    const newBranch = new Branch({
      name,
      organisation,
      location: location || "",
    });

    await newBranch.save();
    res.status(201).json({ message: "Branch created successfully", branch: newBranch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.listOrganisations = async (req, res) => {
  try {
    const { providerId } = req.query; // Optional filtering by Provider

    let query = {};
    if (providerId) {
      const providerExists = await Provider.findById(providerId);
      if (!providerExists) {
        return res.status(404).json({ error: "Provider not found." });
      }
      query.provider = providerId;
    }

    const organisations = await Organisation.find(query)
      .populate("organisationType", "name")
      .populate("provider", "name");

    res.status(200).json({ organisations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
