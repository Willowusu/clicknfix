const express = require('express');
const superAdminController = require('../controllers/superAdminController');
const organizationTypeController = require('../controllers/organizationTypeController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Dashboard route
router.get('/super-admin/dashboard', authenticateToken, superAdminController.getDashboard);

//Create a provider
router.post('/super-admin/providers/create', authenticateToken, superAdminController.createProvider);

// User management routes
router.get('/super-admin/users', authenticateToken, superAdminController.getUsers);
router.post('/super-admin/users/create', authenticateToken, superAdminController.createUser);
router.put('/super-admin/users/:id', authenticateToken, superAdminController.updateUser);
router.delete('/super-admin/users/:id', authenticateToken, superAdminController.deleteUser);

// Subscription management routes
router.get('/super-admin/subscriptions', authenticateToken, superAdminController.getSubscriptions);
router.post('/super-admin/subscriptions/create', authenticateToken, superAdminController.createSubscription);

// Organization Type Management (Super Admin only)
router.get('/super-admin/organization-types', authenticateToken, organizationTypeController.getOrganizationTypes);
router.post('/super-admin/organization-types', authenticateToken, organizationTypeController.createOrganizationType);
router.put('/super-admin/organization-types/:id', authenticateToken, organizationTypeController.updateOrganizationType);
router.delete('/super-admin/organization-types/:id', authenticateToken, organizationTypeController.deleteOrganizationType);

module.exports = router;