const express = require('express');
const providerController = require('../controllers/providerController');
const organizationController = require('../controllers/organizationController');
const branchController = require('../controllers/branchController');
const serviceController = require('../controllers/serviceController');
const servicemanController = require('../controllers/servicemanController');
const organizationTypeController = require('../controllers/organizationTypeController');
const authenticateToken = require('../middleware/auth');
const createAuditLog = require('../middleware/auditLog');

const router = express.Router();

// routes/provider.js
router.get('/dashboard', authenticateToken, createAuditLog('view_dashboard'), providerController.getDashboard);

// Client management under Provider (clients will be created under specific branches)
router.get('/clients', authenticateToken, createAuditLog('view_clients'), providerController.getClients);  // View all clients
router.post('/clients/create', authenticateToken, createAuditLog('create_client'), providerController.createClient);  // Assign client to a branch
router.put('/clients/:id', authenticateToken, createAuditLog('update_client'), providerController.updateClient);  // Update client details
router.delete('/clients/:id', authenticateToken, createAuditLog('delete_client'), providerController.deleteClient);  // Remove client

// Client admin management under Provider
router.get('/client-admins', authenticateToken, createAuditLog('view_client_admins'), providerController.getClientAdmins);  // View all client admins
router.post('/client-admins/create', authenticateToken, createAuditLog('create_client_admin'), providerController.createClientAdmin);  // Create new client admin
router.put('/client-admins/:id', authenticateToken, createAuditLog('update_client_admin'), providerController.updateClientAdmin);  // Update client admin details
router.delete('/client-admins/:id', authenticateToken, createAuditLog('delete_client_admin'), providerController.deleteClientAdmin);  // Remove client admin

// Branch management under Provider
router.get('/branches', authenticateToken, createAuditLog('view_branches'), branchController.getBranches);  // View all branches
router.post('/branches/create', authenticateToken, createAuditLog('create_branch'), branchController.createBranch);  // Create branch under the provider’s organization
router.put('/branches/:id', authenticateToken, createAuditLog('update_branch'), branchController.updateBranch);  // Update branch details
router.delete('/branches/:id', authenticateToken, createAuditLog('delete_branch'), branchController.deleteBranch);  // Remove branch

// Organization management
router.get('/organizations', authenticateToken, createAuditLog('view_organizations'), organizationController.getOrganizations);  // View all organizations
router.post('/organizations/create', authenticateToken, createAuditLog('create_organization'), organizationController.createOrganization);  // Create an organization
router.put('/organizations/:id', authenticateToken, createAuditLog('update_organization'), organizationController.updateOrganization);  // Update organization
router.delete('/organizations/:id', authenticateToken, createAuditLog('delete_organization'), organizationController.deleteOrganization);  // Remove organization

// Organization Type (read-only for providers)
router.get('/organization-types', authenticateToken, createAuditLog('view_organization_types'), organizationTypeController.getOrganizationTypes);  // View available organization types

// Service Categories
router.get('/service-categories', authenticateToken, createAuditLog('view_service_categories'), serviceController.getServiceCategories);  // View service categories
router.post('/service-categories', authenticateToken, createAuditLog('create_service_category'), serviceController.createServiceCategory);  // Create new service category
router.put('/service-categories/:id', authenticateToken, createAuditLog('update_service_category'), serviceController.updateServiceCategory);  // Update service category
router.delete('/service-categories/:id', authenticateToken, createAuditLog('delete_service_category'), serviceController.deleteServiceCategory);  // Delete service category

// Service management
router.get('/services', authenticateToken, createAuditLog('view_services'), serviceController.getServices);  // View all services
router.post('/services/create', authenticateToken, createAuditLog('create_service'), serviceController.createService);  // Create new service
router.put('/services/:id', authenticateToken, createAuditLog('update_service'), serviceController.updateService);  // Update service details
router.delete('/services/:id', authenticateToken, createAuditLog('delete_service'), serviceController.deleteService);  // Delete a service

// Serviceman management
router.get('/servicemen', authenticateToken, createAuditLog('view_servicemen'), servicemanController.getServicemen);  // View all servicemen
router.post('/servicemen/create', authenticateToken, createAuditLog('create_serviceman'), servicemanController.createServiceman);  // Create new serviceman
router.put('/servicemen/:id', authenticateToken, createAuditLog('update_serviceman'), servicemanController.updateServiceman);  // Update serviceman details
router.delete('/servicemen/:id', authenticateToken, createAuditLog('delete_serviceman'), servicemanController.deleteServiceman);  // Remove serviceman

module.exports = router;