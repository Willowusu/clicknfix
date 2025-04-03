const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');
const Provider = require('../models/Provider');
const Organization = require('../models/Organization');
const response = require('../utils/response'); // Assuming a utility for standard responses

// Get all services under the provider's account
exports.getServices = async (req, res) => {
  try {
    const { role, user } = req;

    // If provider role, get services for their provider account
    if (role === 'provider') {
      const provider = await Provider.findById(user.provider);
      if (!provider) {
        return res.status(404).json(response(404, 'error', null, 'Provider not found'));
      }
      
      const services = await Service.find({ provider: user.provider })
        .populate('category', 'name description')
        .sort({ createdAt: -1 });
      
      return res.status(200).json(response(200, 'success', services, 'Services retrieved successfully'));
    }

    // For other roles (e.g., client, branch-admin), they should only see services from their organization's provider
    if (user.organization) {
      const organization = await Organization.findById(user.organization).populate('provider');
      if (!organization) {
        return res.status(404).json(response(404, 'error', null, 'Organization not found'));
      }

      const services = await Service.find({ provider: organization.provider })
        .populate('category', 'name description')
        .sort({ createdAt: -1 });

      return res.status(200).json(response(200, 'success', services, 'Services retrieved successfully'));
    }

    return res.status(403).json(response(403, 'error', null, 'Access denied: Invalid role or missing organization'));
  } catch (error) {
    console.error('Error in getServices:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching services'));
  }
};

// Create a new service under the provider's account
exports.createService = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json(response(400, 'error', null, 'Service name, description, price, and category are required'));
    }

    // Check if category exists
    const categoryExists = await ServiceCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json(response(400, 'error', null, 'Service category does not exist'));
    }

    // Create the service
    const newService = new Service({
      name,
      description,
      price,
      category,
      provider: req.user.id,  // Associate the service with the logged-in provider
    });

    await newService.save();

    return res.status(201).json(response(201, 'success', newService, 'Service created successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while creating service'));
  }
};

// Update the details of an existing service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;

    // Find the service by ID
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json(response(404, 'error', null, 'Service not found'));
    }

    // Ensure the provider is the one managing this service
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json(response(403, 'error', null, 'You are not authorized to update this service'));
    }

    // Check if category exists
    if (category) {
      const categoryExists = await ServiceCategory.findById(category);
      if (!categoryExists) {
        return res.status(400).json(response(400, 'error', null, 'Service category does not exist'));
      }
    }

    // Update the service's details
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { name, description, price, category },
      { new: true }
    );

    return res.status(200).json(response(200, 'success', updatedService, 'Service updated successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while updating service'));
  }
};

// Delete a service under the provider's account
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the service
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json(response(404, 'error', null, 'Service not found'));
    }

    // Ensure the provider is the one managing this service
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json(response(403, 'error', null, 'You are not authorized to delete this service'));
    }

    await Service.findByIdAndDelete(id);

    return res.status(200).json(response(200, 'success', null, 'Service deleted successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting service'));
  }
};

// Get all service categories under the provider's account
exports.getServiceCategories = async (req, res) => {
  try {
    const { role, user } = req;

    // If provider role, get categories for their provider account
    if (role === 'provider') {
      const provider = await Provider.findById(user.provider);
      if (!provider) {
        return res.status(404).json(response(404, 'error', null, 'Provider not found'));
      }
      
      const categories = await ServiceCategory.find({ provider: user.provider })
        .sort({ name: 1 }); // Sort alphabetically by name
      
      return res.status(200).json(response(200, 'success', categories, 'Service categories retrieved successfully'));
    }

    // For other roles (e.g., client, branch-admin), they should only see categories from their organization's provider
    if (user.organization) {
      const organization = await Organization.findById(user.organization).populate('provider');
      if (!organization) {
        return res.status(404).json(response(404, 'error', null, 'Organization not found'));
      }

      const categories = await ServiceCategory.find({ provider: organization.provider })
        .sort({ name: 1 });

      return res.status(200).json(response(200, 'success', categories, 'Service categories retrieved successfully'));
    }

    return res.status(403).json(response(403, 'error', null, 'Access denied: Invalid role or missing organization'));
  } catch (error) {
    console.error('Error in getServiceCategories:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching service categories'));
  }
};

// Create a new service category under the provider's account
exports.createServiceCategory = async (req, res) => {
  try {
    const { role, user } = req;
    const { name, description, image } = req.body;

    // Only providers can create service categories
    if (role !== 'provider') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can create service categories'));
    }

    // Validate the provider
    const provider = await Provider.findById(user.provider);
    if (!provider) {
      return res.status(404).json(response(404, 'error', null, 'Provider not found'));
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json(response(400, 'error', null, 'Category name is required'));
    }

    // Check if category name already exists for this provider
    const existingCategory = await ServiceCategory.findOne({ 
      provider: user.provider,
      name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive name check
    });

    if (existingCategory) {
      return res.status(400).json(response(400, 'error', null, 'A category with this name already exists'));
    }

    // Create the service category
    const newCategory = new ServiceCategory({
      name,
      description,
      image,
      provider: user.provider,
      isActive: true
    });

    await newCategory.save();

    return res.status(201).json(response(201, 'success', newCategory, 'Service category created successfully'));
  } catch (error) {
    console.error('Error in createServiceCategory:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while creating service category'));
  }
};

// Update a service category
exports.updateServiceCategory = async (req, res) => {
  try {
    const { role, user } = req;
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    // Only providers can update service categories
    if (role !== 'provider') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can update service categories'));
    }

    // Validate the provider
    const provider = await Provider.findById(user.provider);
    if (!provider) {
      return res.status(404).json(response(404, 'error', null, 'Provider not found'));
    }

    // Find the category and ensure it belongs to the provider
    const category = await ServiceCategory.findOne({ _id: id, provider: user.provider });
    if (!category) {
      return res.status(404).json(response(404, 'error', null, 'Service category not found or access denied'));
    }

    // If name is being updated, check for duplicates
    if (name && name !== category.name) {
      const existingCategory = await ServiceCategory.findOne({
        provider: user.provider,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingCategory) {
        return res.status(400).json(response(400, 'error', null, 'A category with this name already exists'));
      }
    }

    // If trying to deactivate, check if there are active services
    if (isActive === false) {
      const activeServices = await Service.countDocuments({ 
        category: id,
        isActive: true
      });

      if (activeServices > 0) {
        return res.status(400).json(response(400, 'error', null, 'Cannot deactivate category with active services'));
      }
    }

    // Update the category
    const updatedCategory = await ServiceCategory.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(image && { image }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true }
    );

    return res.status(200).json(response(200, 'success', updatedCategory, 'Service category updated successfully'));
  } catch (error) {
    console.error('Error in updateServiceCategory:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while updating service category'));
  }
};

// Delete a service category
exports.deleteServiceCategory = async (req, res) => {
  try {
    const { role, user } = req;
    const { id } = req.params;

    // Only providers can delete service categories
    if (role !== 'provider') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can delete service categories'));
    }

    // Validate the provider
    const provider = await Provider.findById(user.provider);
    if (!provider) {
      return res.status(404).json(response(404, 'error', null, 'Provider not found'));
    }

    // Find the category and ensure it belongs to the provider
    const category = await ServiceCategory.findOne({ _id: id, provider: user.provider });
    if (!category) {
      return res.status(404).json(response(404, 'error', null, 'Service category not found or access denied'));
    }

    // Check if there are any services using this category
    const servicesCount = await Service.countDocuments({ category: id });
    if (servicesCount > 0) {
      return res.status(400).json(response(400, 'error', null, 'Cannot delete category with associated services. Please delete or reassign the services first.'));
    }

    // Delete the category
    await ServiceCategory.findByIdAndDelete(id);

    return res.status(200).json(response(200, 'success', null, 'Service category deleted successfully'));
  } catch (error) {
    console.error('Error in deleteServiceCategory:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting service category'));
  }
};
