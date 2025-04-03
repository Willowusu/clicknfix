const Serviceman = require('../models/Serviceman');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const Organization = require('../models/Organization');
const response = require('../utils/response');

// Get all servicemen under the provider's account
exports.getServicemen = async (req, res) => {
  try {
    const { role, user } = req;
    let query = {};

    // For providers, only show their own servicemen
    if (role === 'provider') {
      // Validate the provider exists
      const provider = await Provider.findById(user.provider);
      if (!provider) {
        return res.status(404).json(response(404, 'error', null, 'Provider not found'));
      }
      query.provider = user.provider;
    }
    // For branch admins and clients, show servicemen from their organization's provider
    else if (role === 'branch_admin' || role === 'client') {
      const organization = await Organization.findById(user.organization)
        .populate('provider');
      
      if (!organization) {
        return res.status(404).json(response(404, 'error', null, 'Organization not found'));
      }
      
      if (!organization.provider) {
        return res.status(404).json(response(404, 'error', null, 'Organization has no associated provider'));
      }

      query.provider = organization.provider._id;
    }
    // Super admin can see all servicemen
    else if (role === 'super_admin') {
      // No filter needed, can see all
    }
    else {
      return res.status(403).json(response(403, 'error', null, 'Unauthorized to view servicemen'));
    }

    const servicemen = await Serviceman.find(query)
      .populate('assignedServices', 'name description')
      .sort({ name: 1 });

    return res.status(200).json(response(200, 'success', servicemen, 'Servicemen retrieved successfully'));
  } catch (error) {
    console.error('Error in getServicemen:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching servicemen'));
  }
};

// Create a new serviceman under the provider's account
exports.createServiceman = async (req, res) => {
  try {
    const { role, user } = req;
    const { name, jobTitle, assignedServices } = req.body;

    // Only providers can create servicemen
    if (role !== 'provider') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can create servicemen'));
    }

    // Validate the provider
    const provider = await Provider.findById(user.provider);
    if (!provider) {
      return res.status(404).json(response(404, 'error', null, 'Provider not found'));
    }

    // Validate required fields
    if (!name || !jobTitle || !assignedServices) {
      return res.status(400).json(response(400, 'error', null, 'Serviceman name, job title, and assigned services are required'));
    }

    // Validate the services provided belong to the provider
    const servicesExist = await Service.find({
      '_id': { $in: assignedServices },
      provider: user.provider
    });

    if (servicesExist.length !== assignedServices.length) {
      return res.status(400).json(response(400, 'error', null, 'One or more assigned services are invalid or do not belong to your account'));
    }

    // Create the serviceman
    const newServiceman = new Serviceman({
      name,
      jobTitle,
      assignedServices,
      provider: user.provider,
      isActive: true
    });

    await newServiceman.save();

    const populatedServiceman = await Serviceman.findById(newServiceman._id)
      .populate('assignedServices', 'name description');

    return res.status(201).json(response(201, 'success', populatedServiceman, 'Serviceman created successfully'));
  } catch (error) {
    console.error('Error in createServiceman:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while creating serviceman'));
  }
};

// Update the details of an existing serviceman
exports.updateServiceman = async (req, res) => {
  try {
    const { role, user } = req;
    const { id } = req.params;
    const { name, jobTitle, assignedServices, isActive } = req.body;

    // Only providers can update servicemen
    if (role !== 'provider') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can update servicemen'));
    }

    // Validate the provider
    const provider = await Provider.findById(user.provider);
    if (!provider) {
      return res.status(404).json(response(404, 'error', null, 'Provider not found'));
    }

    // Find the serviceman and ensure it belongs to the provider
    const serviceman = await Serviceman.findOne({ _id: id, provider: user.provider });
    if (!serviceman) {
      return res.status(404).json(response(404, 'error', null, 'Serviceman not found or access denied'));
    }

    // If updating assigned services, validate they belong to the provider
    if (assignedServices && assignedServices.length > 0) {
      const servicesExist = await Service.find({
        '_id': { $in: assignedServices },
        provider: user.provider
      });

      if (servicesExist.length !== assignedServices.length) {
        return res.status(400).json(response(400, 'error', null, 'One or more assigned services are invalid or do not belong to your account'));
      }
    }

    // Update the serviceman
    const updatedServiceman = await Serviceman.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(jobTitle && { jobTitle }),
        ...(assignedServices && { assignedServices }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true }
    ).populate('assignedServices', 'name description');

    return res.status(200).json(response(200, 'success', updatedServiceman, 'Serviceman updated successfully'));
  } catch (error) {
    console.error('Error in updateServiceman:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while updating serviceman'));
  }
};

// Delete a serviceman
exports.deleteServiceman = async (req, res) => {
  try {
    const { role, user } = req;
    const { id } = req.params;

    // Only providers can delete servicemen
    if (role !== 'provider') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can delete servicemen'));
    }

    // Validate the provider
    const provider = await Provider.findById(user.provider);
    if (!provider) {
      return res.status(404).json(response(404, 'error', null, 'Provider not found'));
    }

    // Find the serviceman and ensure it belongs to the provider
    const serviceman = await Serviceman.findOne({ _id: id, provider: user.provider });
    if (!serviceman) {
      return res.status(404).json(response(404, 'error', null, 'Serviceman not found or access denied'));
    }

    // TODO: Check if serviceman has any active bookings before deletion
    // const activeBookings = await Booking.countDocuments({ serviceman: id, status: { $in: ['pending', 'confirmed'] } });
    // if (activeBookings > 0) {
    //   return res.status(400).json(response(400, 'error', null, 'Cannot delete serviceman with active bookings'));
    // }

    await Serviceman.findByIdAndDelete(id);

    return res.status(200).json(response(200, 'success', null, 'Serviceman deleted successfully'));
  } catch (error) {
    console.error('Error in deleteServiceman:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting serviceman'));
  }
};
