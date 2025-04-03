const Client = require('../models/Client');
const Branch = require('../models/Branch');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Provider = require('../models/Provider'); // Assuming Provider model is defined
const response = require('../utils/response'); // Assuming a utility for standard responses
const bcrypt = require('bcryptjs'); // Assuming bcrypt is installed and required

// Dashboard: Get provider's dashboard stats (e.g., total clients, active branches)
exports.getDashboard = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const totalBranches = await Branch.countDocuments();

    const stats = {
      totalClients,
      totalBranches
    };

    return res.status(200).json(response(200, 'success', stats, 'Dashboard data retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching dashboard data'));
  }
};

// Get all clients (for client management)
exports.getClients = async (req, res) => {
  try {
    const { role, user } = req;

    let clients;

    // If provider, get clients from all their organizations
    if (role === 'provider') {
      // First get all organizations belonging to this provider
      const organizations = await Organization.find({ provider: user.provider });
      clients = await Client.find({ 
        organization: { $in: organizations.map(org => org._id) } 
      })
        .populate('user', '-password') // Exclude password
        .populate('organization')
        .populate('branch')
        .populate('servicesUsed');
    }
    // If client-admin, only get clients from their organization
    else if (role === 'client-admin') {
      clients = await Client.find({ 
        organization: user.organization 
      })
        .populate('user', '-password')
        .populate('organization')
        .populate('branch')
        .populate('servicesUsed');
    }
    // If super-admin, get all clients
    else if (role === 'super-admin') {
      clients = await Client.find({})
        .populate('user', '-password')
        .populate('organization')
        .populate('branch')
        .populate('servicesUsed');
    }
    // If no valid role or if role is client
    else {
      return res.status(403).json(response(403, 'error', null, 'Unauthorized to view clients'));
    }

    return res.status(200).json(response(200, 'success', clients, 'Clients retrieved successfully'));
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching clients'));
  }
};

// Create a new client and assign them to a branch
exports.createClient = async (req, res) => {
  try {
    const { role, user } = req;
    const { name, email, password, phone, branchId } = req.body;

    // Only providers can create clients
    if (role !== 'provider') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can create clients'));
    }

    // Validate required fields
    if (!name || !email || !password || !branchId) {
      return res.status(400).json(response(400, 'error', null, 'Name, email, password, and branch ID are required'));
    }

    // Validate the provider exists
    const provider = await Provider.findById(user.provider);
    if (!provider) {
      return res.status(404).json(response(404, 'error', null, 'Provider not found'));
    }

    // Validate if the branch exists and belongs to the provider's organization
    const branch = await Branch.findOne({ 
      _id: branchId,
      organization: provider.organization
    });
    
    if (!branch) {
      return res.status(404).json(response(404, 'error', null, 'Branch not found or access denied'));
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json(response(400, 'error', null, 'Email is already registered'));
    }

    // Create the user record
    const clientUser = new User({
      name,
      email: email.toLowerCase(),
      password, // Will be hashed by the User model pre-save middleware
      phone,
      role: 'client',
      organization: provider.organization,
      provider: provider._id,
      branch: branchId,
      isActive: true
    });

    await clientUser.save();

    // Create the client record
    const newClient = new Client({
      user: clientUser._id,
      name,
      email: email.toLowerCase(),
      phone,
      organization: provider.organization,
      provider: provider._id,
      branch: branchId,
      isActive: true,
      joinedAt: new Date()
    });

    await newClient.save();

    // Populate the response data
    const populatedClient = await Client.findById(newClient._id)
      .populate('organization', 'name type')
      .populate('provider', 'name')
      .populate('branch', 'name location')
      .populate('user', '-password');

    return res.status(201).json(response(201, 'success', populatedClient, 'Client created successfully'));
  } catch (error) {
    console.error('Error in createClient:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while creating client'));
  }
};

// Update client details
exports.updateClient = async (req, res) => {
  try {
    const { role, user } = req;
    const { id } = req.params;
    const { name, email, phone, branchId, isActive } = req.body;

    // Only providers can update clients
    if (role !== 'provider') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can update clients'));
    }

    // Validate the provider exists
    const provider = await Provider.findById(user.provider);
    if (!provider) {
      return res.status(404).json(response(404, 'error', null, 'Provider not found'));
    }

    // Find the client and ensure they belong to the provider
    const client = await Client.findOne({
      _id: id,
      provider: user.provider
    });

    if (!client) {
      return res.status(404).json(response(404, 'error', null, 'Client not found or access denied'));
    }

    // If changing branch, validate it belongs to provider's organization
    if (branchId) {
      const branch = await Branch.findOne({ 
        _id: branchId,
        organization: provider.organization
      });
      
      if (!branch) {
        return res.status(404).json(response(404, 'error', null, 'Branch not found or access denied'));
      }
    }

    // If changing email, check if new email is already in use
    if (email && email.toLowerCase() !== client.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: client.user }
      });
      
      if (existingUser) {
        return res.status(400).json(response(400, 'error', null, 'Email is already registered'));
      }
    }

    // Update the client record
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        ...(branchId && { branch: branchId }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true }
    )
    .populate('organization', 'name type')
    .populate('provider', 'name')
    .populate('branch', 'name location')
    .populate('user', '-password');

    // Update the associated user record
    await User.findByIdAndUpdate(
      client.user,
      {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        ...(branchId && { branch: branchId }),
        ...(isActive !== undefined && { isActive })
      }
    );

    return res.status(200).json(response(200, 'success', updatedClient, 'Client updated successfully'));
  } catch (error) {
    console.error('Error in updateClient:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while updating client'));
  }
};

// Get all client admins under provider's organizations
exports.getClientAdmins = async (req, res) => {
  try {
    const { role, user } = req;

    let clientAdmins;

    // If provider, get client admins from all their organizations
    if (role === 'provider') {
      // First get all organizations belonging to this provider
      const organizations = await Organization.find({ provider: user.provider });
      
      // Find all users who are client admins in these organizations
      clientAdmins = await User.find({ 
        role: 'client-admin',
        organization: { $in: organizations.map(org => org._id) }
      })
        .select('-password')
        .populate('organization')
        .populate('branch');
    }
    // If super-admin, get all client admins
    else if (role === 'super-admin') {
      clientAdmins = await User.find({ role: 'client-admin' })
        .select('-password')
        .populate('organization')
        .populate('branch');
    }
    // If not authorized
    else {
      return res.status(403).json(response(403, 'error', null, 'Unauthorized to view client admins'));
    }

    return res.status(200).json(response(200, 'success', clientAdmins, 'Client admins retrieved successfully'));
  } catch (error) {
    console.error('Error fetching client admins:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching client admins'));
  }
};

// Create a new client admin
exports.createClientAdmin = async (req, res) => {
  try {
    const { username, email, password, branchId, organizationId } = req.body;
    const { role, user } = req;

    // Verify provider has access to this organization
    if (role === 'provider') {
      const organization = await Organization.findOne({ 
        _id: organizationId,
        provider: user.provider
      });
      if (!organization) {
        return res.status(403).json(response(403, 'error', null, 'Unauthorized: Organization does not belong to provider'));
      }
    }

    // Verify the branch belongs to the organization
    const branch = await Branch.findOne({ 
      _id: branchId,
      organization: organizationId
    });
    if (!branch) {
      return res.status(400).json(response(400, 'error', null, 'Invalid branch ID or branch does not belong to organization'));
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json(response(400, 'error', null, 'Username or email already exists'));
    }

    // Create the new client admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newClientAdmin = new User({
      username,
      email,
      password: hashedPassword,
      role: 'client-admin',
      organization: organizationId,
      branch: branchId
    });

    await newClientAdmin.save();

    // Remove password from response
    const clientAdminResponse = newClientAdmin.toObject();
    delete clientAdminResponse.password;

    return res.status(201).json(response(201, 'success', clientAdminResponse, 'Client admin created successfully'));
  } catch (error) {
    console.error('Error creating client admin:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while creating client admin'));
  }
};

// Update client admin details
exports.updateClientAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, branchId, organizationId } = req.body;
    const { role, user } = req;

    // Find the client admin
    const clientAdmin = await User.findOne({ _id: id, role: 'client-admin' });
    if (!clientAdmin) {
      return res.status(404).json(response(404, 'error', null, 'Client admin not found'));
    }

    // Verify provider has access to this client admin's organization
    if (role === 'provider') {
      const organization = await Organization.findOne({
        _id: clientAdmin.organization,
        provider: user.provider
      });
      if (!organization) {
        return res.status(403).json(response(403, 'error', null, 'Unauthorized: Client admin does not belong to provider'));
      }
    }

    // If changing organization, verify provider has access to new organization
    if (organizationId && organizationId !== clientAdmin.organization.toString()) {
      const newOrganization = await Organization.findOne({
        _id: organizationId,
        provider: user.provider
      });
      if (!newOrganization) {
        return res.status(403).json(response(403, 'error', null, 'Unauthorized: New organization does not belong to provider'));
      }
    }

    // If changing branch, verify it belongs to the organization
    if (branchId) {
      const branch = await Branch.findOne({
        _id: branchId,
        organization: organizationId || clientAdmin.organization
      });
      if (!branch) {
        return res.status(400).json(response(400, 'error', null, 'Invalid branch ID or branch does not belong to organization'));
      }
    }

    // Check if new username or email already exists
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: id },
        $or: [
          { username: username || clientAdmin.username },
          { email: email || clientAdmin.email }
        ]
      });
      if (existingUser) {
        return res.status(400).json(response(400, 'error', null, 'Username or email already exists'));
      }
    }

    // Update the client admin
    const updates = {
      ...(username && { username }),
      ...(email && { email }),
      ...(branchId && { branch: branchId }),
      ...(organizationId && { organization: organizationId })
    };

    const updatedClientAdmin = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    )
      .select('-password')
      .populate('organization')
      .populate('branch');

    return res.status(200).json(response(200, 'success', updatedClientAdmin, 'Client admin updated successfully'));
  } catch (error) {
    console.error('Error updating client admin:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while updating client admin'));
  }
};

// Delete a client admin
exports.deleteClientAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, user } = req;

    // Find the client admin
    const clientAdmin = await User.findOne({ _id: id, role: 'client-admin' });
    if (!clientAdmin) {
      return res.status(404).json(response(404, 'error', null, 'Client admin not found'));
    }

    // Verify provider has access to this client admin's organization
    if (role === 'provider') {
      const organization = await Organization.findOne({
        _id: clientAdmin.organization,
        provider: user.provider
      });
      if (!organization) {
        return res.status(403).json(response(403, 'error', null, 'Unauthorized: Client admin does not belong to provider'));
      }
    }

    // Delete the client admin
    await User.findByIdAndDelete(id);

    return res.status(200).json(response(200, 'success', null, 'Client admin deleted successfully'));
  } catch (error) {
    console.error('Error deleting client admin:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting client admin'));
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const { role, user } = req;
    const { id } = req.params;

    // Only providers can delete clients
    if (role !== 'provider') {
      return res.status(403).json(response(403, 'error', null, 'Only providers can delete clients'));
    }

    // Validate the provider exists
    const provider = await Provider.findById(user.provider);
    if (!provider) {
      return res.status(404).json(response(404, 'error', null, 'Provider not found'));
    }

    // Find the client and ensure they belong to the provider
    const client = await Client.findOne({
      _id: id,
      provider: user.provider
    });

    if (!client) {
      return res.status(404).json(response(404, 'error', null, 'Client not found or access denied'));
    }

    // TODO: Check for active bookings or other dependencies
    // const activeBookings = await Booking.countDocuments({ 
    //   client: id,
    //   status: { $in: ['pending', 'confirmed', 'in_progress'] }
    // });
    // if (activeBookings > 0) {
    //   return res.status(400).json(response(400, 'error', null, 'Cannot delete client with active bookings'));
    // }

    // Delete the client record
    await Client.findByIdAndDelete(id);

    // Delete the associated user record
    await User.findByIdAndDelete(client.user);

    return res.status(200).json(response(200, 'success', null, 'Client and associated user account deleted successfully'));
  } catch (error) {
    console.error('Error in deleteClient:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting client'));
  }
};
