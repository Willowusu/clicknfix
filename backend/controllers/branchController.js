const Branch = require('../models/Branch');
const Organization = require('../models/Organization'); // Assuming Organization model is defined
const response = require('../utils/response'); // Assuming a utility for standard responses

// Get all branches under the provider's organization
exports.getBranches = async (req, res) => {
  try {
    const { role, user } = req;

    let branches;

    // If provider, get branches from all their organizations
    if (role === 'provider') {
      // First get all organizations belonging to this provider
      const organizations = await Organization.find({ provider: user.provider });
      branches = await Branch.find({ 
        organization: { $in: organizations.map(org => org._id) } 
      }).populate('organization');
    }
    // If client-admin or client, only get branches from their organization
    else if (role === 'client-admin' || role === 'client') {
      branches = await Branch.find({ 
        organization: user.organization 
      }).populate('organization');
    }
    // If super-admin, get all branches
    else if (role === 'super-admin') {
      branches = await Branch.find({}).populate('organization');
    }
    // If no valid role
    else {
      return res.status(403).json(response(403, 'error', null, 'Unauthorized to view branches'));
    }

    return res.status(200).json(response(200, 'success', branches, 'Branches retrieved successfully'));
  } catch (error) {
    console.error('Error fetching branches:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching branches'));
  }
};

// Create a new branch under the provider's organization
exports.createBranch = async (req, res) => {
  try {
    const { name, location, manager } = req.body;

    // Validate required fields
    if (!name || !location) {
      return res.status(400).json(response(400, 'error', null, 'Branch name and location are required'));
    }

    // Create a new branch
    const newBranch = new Branch({
      name,
      location,
      manager,
      provider: req.user.id  // Assuming the provider is logged in and their ID is available
    });

    await newBranch.save();

    return res.status(201).json(response(201, 'success', newBranch, 'Branch created successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while creating branch'));
  }
};

// Update the details of an existing branch
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, manager } = req.body;

    // Find the branch by ID
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json(response(404, 'error', null, 'Branch not found'));
    }

    // Update the branch details
    const updatedBranch = await Branch.findByIdAndUpdate(
      id,
      { name, location, manager },
      { new: true }
    );

    return res.status(200).json(response(200, 'success', updatedBranch, 'Branch updated successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while updating branch'));
  }
};

// Delete a branch from the provider's organization
exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the branch
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) {
      return res.status(404).json(response(404, 'error', null, 'Branch not found'));
    }

    return res.status(200).json(response(200, 'success', null, 'Branch deleted successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting branch'));
  }
};
