const Organization = require('../models/Organization');
const OrganizationType = require('../models/OrganizationType');
const response = require('../utils/response');
const Provider= require('../models/Provider');

// Get all organizations under the provider's account
exports.getOrganizations = async (req, res) => {
  try {
    const { role, user } = req;
    
    let organizations;
    
    // If provider, get only their organizations
    if (role === 'provider') {
      organizations = await Organization.find({ provider: user.provider })
        .populate('organizationType')
        .populate('provider', '-password');
    }
    // If super-admin, get all organizations
    else if (role === 'super-admin') {
      organizations = await Organization.find({})
        .populate('organizationType')
        .populate('provider', '-password');
    }
    // If not authorized
    else {
      return res.status(403).json(response(403, 'error', null, 'Unauthorized to view organizations'));
    }

    return res.status(200).json(response(200, 'success', organizations, 'Organizations retrieved successfully'));
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching organizations'));
  }
};

// Create a new organization
exports.createOrganization = async (req, res) => {
  try {
    const { name, address, contactNumber, organizationTypeId } = req.body;
    const { role, user } = req;

    // Only providers and super-admin can create organizations
    if (role !== 'provider' && role !== 'super-admin') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can create organizations'));
    }

    // Validate required fields
    if (!name || !address || !contactNumber || !organizationTypeId) {
      return res.status(400).json(response(400, 'error', null, 'Organization name, address, contact number, and type are required'));
    }

    // Verify organization type exists and is active
    const organizationType = await OrganizationType.findById(organizationTypeId);
    if (!organizationType) {
      return res.status(400).json(response(400, 'error', null, 'Invalid organization type'));
    }
    if (!organizationType.isActive) {
      return res.status(400).json(response(400, 'error', null, 'This organization type is no longer active'));
    }

    // Check if organization name already exists for this provider
    const existingOrg = await Organization.findOne({ 
      name, 
      provider: role === 'provider' ? user.provider : req.body.providerId 
    });
    if (existingOrg) {
      return res.status(400).json(response(400, 'error', null, 'An organization with this name already exists'));
    }

    // Create a new organization document
    const newOrganization = new Organization({
      name,
      address,
      contactNumber,
      provider: role === 'provider' ? user.provider : req.body.providerId,
      organizationType: organizationTypeId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newOrganization.save();

    // Populate provider and organization type details in response
    const populatedOrg = await Organization.findById(newOrganization._id)
      .populate('provider', '-password')
      .populate('organizationType');

    return res.status(201).json(response(201, 'success', populatedOrg, 'Organization created successfully'));
  } catch (error) {
    console.error('Error creating organization:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while creating organization'));
  }
};

// Update organization details
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, contactNumber, organizationTypeId } = req.body;
    const { role, user } = req;

    // Find the organization
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json(response(404, 'error', null, 'Organization not found'));
    }

    // Ensure the provider is authorized
    if (role !== 'super-admin' && organization.provider.toString() !== user.provider) {
      return res.status(403).json(response(403, 'error', null, 'You are not authorized to update this organization'));
    }

    // If changing organization type, verify it exists and is active
    if (organizationTypeId) {
      const organizationType = await OrganizationType.findById(organizationTypeId);
      if (!organizationType) {
        return res.status(400).json(response(400, 'error', null, 'Invalid organization type'));
      }
      if (!organizationType.isActive) {
        return res.status(400).json(response(400, 'error', null, 'This organization type is no longer active'));
      }
    }

    // Update the organization
    const updates = {
      ...(name && { name }),
      ...(address && { address }),
      ...(contactNumber && { contactNumber }),
      ...(organizationTypeId && { organizationType: organizationTypeId })
    };

    const updatedOrganization = await Organization.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    )
      .populate('provider', '-password')
      .populate('organizationType');

    return res.status(200).json(response(200, 'success', updatedOrganization, 'Organization updated successfully'));
  } catch (error) {
    console.error('Error updating organization:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while updating organization'));
  }
};

// Delete an organization under the provider's account
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, user } = req;

    // Find and delete the organization
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json(response(404, 'error', null, 'Organization not found'));
    }

    // Ensure the provider is the one managing this organization
    if (role !== 'super-admin' && organization.provider.toString() !== user.provider) {
      return res.status(403).json(response(403, 'error', null, 'You are not authorized to delete this organization'));
    }

    await Organization.findByIdAndDelete(id);

    return res.status(200).json(response(200, 'success', null, 'Organization deleted successfully'));
  } catch (error) {
    console.error('Error deleting organization:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting organization'));
  }
};
