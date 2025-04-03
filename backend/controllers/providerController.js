const Client = require('../models/Client');
const Branch = require('../models/Branch');
const Organization = require('../models/Organization');
const User = require('../models/User');
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
    const { name, email, branchId } = req.body;

    // Validate if the branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(400).json(response(400, 'error', null, 'Invalid branch ID'));
    }

    // Create the new client
    const newClient = new Client({
      name,
      email,
      branch: branchId
    });

    await newClient.save();

    return res.status(201).json(response(201, 'success', newClient, 'Client created successfully and assigned to branch'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while creating client'));
  }
};

// Update client details (e.g., branch assignment, client info)
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, branchId } = req.body;

    // If branchId is provided, check if it's a valid branch
    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(400).json(response(400, 'error', null, 'Invalid branch ID'));
      }
    }

    // Update the client details
    const updatedClient = await Client.findByIdAndUpdate(id, { name, email, branch: branchId }, { new: true });

    if (!updatedClient) {
      return res.status(404).json(response(404, 'error', null, 'Client not found'));
    }

    return res.status(200).json(response(200, 'success', updatedClient, 'Client updated successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while updating client'));
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the client from the database
    const deletedClient = await Client.findByIdAndDelete(id);

    if (!deletedClient) {
      return res.status(404).json(response(404, 'error', null, 'Client not found'));
    }

    return res.status(200).json(response(200, 'success', null, 'Client deleted successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting client'));
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
