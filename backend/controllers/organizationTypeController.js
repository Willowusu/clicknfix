const OrganizationType = require('../models/OrganizationType');
const Organization = require('../models/Organization');
const response = require('../utils/response');

// Get all organization types
exports.getOrganizationTypes = async (req, res) => {
  try {
    const organizationTypes = await OrganizationType.find({})
      .sort({ name: 1 });
    
    return res.status(200).json(response(200, 'success', organizationTypes, 'Organization types retrieved successfully'));
  } catch (error) {
    console.error('Error fetching organization types:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching organization types'));
  }
};

// Create a new organization type
exports.createOrganizationType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { role } = req;

    // Only super-admin can create organization types
    if (role !== 'super-admin') {
      return res.status(403).json(response(403, 'error', null, 'Only super admin can create organization types'));
    }

    // Check if type already exists
    const existingType = await OrganizationType.findOne({ name });
    if (existingType) {
      return res.status(400).json(response(400, 'error', null, 'Organization type already exists'));
    }

    const newOrganizationType = new OrganizationType({
      name,
      description,
      isActive: true
    });

    await newOrganizationType.save();

    return res.status(201).json(response(201, 'success', newOrganizationType, 'Organization type created successfully'));
  } catch (error) {
    console.error('Error creating organization type:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while creating organization type'));
  }
};

// Update an organization type
exports.updateOrganizationType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const { role } = req;

    // Only super-admin can update organization types
    if (role !== 'super-admin') {
      return res.status(403).json(response(403, 'error', null, 'Only super admin can update organization types'));
    }

    // Check if type exists
    const organizationType = await OrganizationType.findById(id);
    if (!organizationType) {
      return res.status(404).json(response(404, 'error', null, 'Organization type not found'));
    }

    // If name is being changed, check if new name already exists
    if (name && name !== organizationType.name) {
      const existingType = await OrganizationType.findOne({ name });
      if (existingType) {
        return res.status(400).json(response(400, 'error', null, 'Organization type with this name already exists'));
      }
    }

    // If deactivating, check if any organizations are using this type
    if (isActive === false && organizationType.isActive === true) {
      const usingOrganizations = await Organization.countDocuments({ organizationType: id });
      if (usingOrganizations > 0) {
        return res.status(400).json(response(400, 'error', null, 'Cannot deactivate: Organization type is in use'));
      }
    }

    const updates = {
      ...(name && { name }),
      ...(description && { description }),
      ...(typeof isActive === 'boolean' && { isActive })
    };

    const updatedType = await OrganizationType.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    return res.status(200).json(response(200, 'success', updatedType, 'Organization type updated successfully'));
  } catch (error) {
    console.error('Error updating organization type:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while updating organization type'));
  }
};

// Delete an organization type
exports.deleteOrganizationType = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req;

    // Only super-admin can delete organization types
    if (role !== 'super-admin') {
      return res.status(403).json(response(403, 'error', null, 'Only super admin can delete organization types'));
    }

    // Check if type exists
    const organizationType = await OrganizationType.findById(id);
    if (!organizationType) {
      return res.status(404).json(response(404, 'error', null, 'Organization type not found'));
    }

    // Check if any organizations are using this type
    const usingOrganizations = await Organization.countDocuments({ organizationType: id });
    if (usingOrganizations > 0) {
      return res.status(400).json(response(400, 'error', null, 'Cannot delete: Organization type is in use'));
    }

    await OrganizationType.findByIdAndDelete(id);

    return res.status(200).json(response(200, 'success', null, 'Organization type deleted successfully'));
  } catch (error) {
    console.error('Error deleting organization type:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting organization type'));
  }
};
