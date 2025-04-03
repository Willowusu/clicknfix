const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Organization = require('../models/Organization');
const OrganizationType = require('../models/OrganizationType');
const Branch = require('../models/Branch');
const ServiceCategory = require('../models/ServiceCategory');
const Service = require('../models/Service');
const Serviceman = require('../models/Serviceman');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clicknfix';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Provider.deleteMany({}),
      Organization.deleteMany({}),
      OrganizationType.deleteMany({}),
      Branch.deleteMany({}),
      ServiceCategory.deleteMany({}),
      Service.deleteMany({}),
      Serviceman.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Subscription.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create Provider
    const hashedPassword = await bcrypt.hash('password123', 10);
    const provider = await Provider.create({
      name: 'ClickNFix Solutions',
      email: 'admin@clicknfix.com',
      phone: '+1234567890',
      address: '123 Tech Street, Silicon Valley',
    });
    console.log('Created provider');

    // Create Provider Admin User
    const providerAdmin = await User.create({
      username: 'provider_admin',
      email: 'admin@clicknfix.com',
      password: hashedPassword,
      role: 'provider',
      provider: provider._id,
    });
    console.log('Created provider admin user');

    // Create Super Admin
    await User.create({
      username: 'super_admin',
      email: 'superadmin@clicknfix.com',
      password: hashedPassword,
      role: 'super-admin',
    });
    console.log('Created super admin');

    // Create Organization Types
    const organizationTypes = await OrganizationType.insertMany([
      {
        name: 'Corporate',
        description: 'Large enterprise organizations with multiple branches',
        isActive: true,
      },
      {
        name: 'Small Business',
        description: 'Small to medium-sized businesses with single location',
        isActive: true,
      },
      {
        name: 'Educational',
        description: 'Schools, colleges, and educational institutions',
        isActive: true,
      },
      {
        name: 'Healthcare',
        description: 'Hospitals, clinics, and healthcare facilities',
        isActive: true,
      },
    ]);
    console.log('Created organization types');

    // Create Organizations
    const organizations = await Organization.insertMany([
      {
        name: 'TechCorp',
        provider: provider._id,
        organizationType: organizationTypes[0]._id, // Corporate
        address: '456 Tech Avenue, New York',
        contactNumber: '+1234567891',
      },
      {
        name: 'MegaServices',
        provider: provider._id,
        organizationType: organizationTypes[1]._id, // Small Business
        address: '789 Service Road, Chicago',
        contactNumber: '+1234567892',
      },
    ]);
    console.log('Created organizations');

    // Create Branches
    const branches = await Branch.insertMany([
      {
        name: 'TechCorp HQ',
        address: '456 Main St, New York',
        organization: organizations[0]._id,
      },
      {
        name: 'TechCorp Branch 1',
        address: '789 Side St, Boston',
        organization: organizations[0]._id,
      },
      {
        name: 'MegaServices Main',
        address: '321 Service Rd, Chicago',
        organization: organizations[1]._id,
      },
    ]);
    console.log('Created branches');

    // Create Client Admins
    const clientAdmins = await User.insertMany([
      {
        username: 'techcorp_admin',
        email: 'admin@techcorp.com',
        password: hashedPassword,
        role: 'client-admin',
        branch: branches[0]._id,
        organization: organizations[0]._id,
      },
      {
        username: 'mega_admin',
        email: 'admin@megaservices.com',
        password: hashedPassword,
        role: 'client-admin',
        branch: branches[2]._id,
        organization: organizations[1]._id,
      },
    ]);
    console.log('Created client admins');

    // Create Service Categories
    const categories = await ServiceCategory.insertMany([
      {
        name: 'IT Support',
        image: 'it-support.jpg',
        provider: provider._id,
      },
      {
        name: 'Network Services',
        image: 'network.jpg',
        provider: provider._id,
      },
      {
        name: 'Hardware Repair',
        image: 'hardware.jpg',
        provider: provider._id,
      },
    ]);
    console.log('Created service categories');

    // Create Services
    const services = await Service.insertMany([
      {
        name: 'Desktop Support',
        description: 'General desktop computer support and troubleshooting',
        price: 75.00,
        duration: 60,
        category: categories[0]._id,
        provider: provider._id,
        image: 'desktop-support.jpg'
      },
      {
        name: 'Network Setup',
        description: 'Professional network installation and configuration',
        price: 150.00,
        duration: 120,
        category: categories[1]._id,
        provider: provider._id,
        image: 'network-setup.jpg'
      },
      {
        name: 'Hardware Maintenance',
        description: 'Regular hardware maintenance and repair services',
        price: 100.00,
        duration: 90,
        category: categories[2]._id,
        provider: provider._id,
        image: 'hardware-maintenance.jpg'
      },
    ]);
    console.log('Created services');

    // Create Servicemen
    const servicemen = await Serviceman.insertMany([
      {
        name: 'John Doe',
        email: 'john@clicknfix.com',
        phone: '+1987654321',
        specialization: 'IT Support',
        jobTitle: 'Senior IT Technician',
        branch: branches[0]._id,
        provider: provider._id,
      },
      {
        name: 'Jane Smith',
        email: 'jane@clicknfix.com',
        phone: '+1987654322',
        specialization: 'Network Engineer',
        jobTitle: 'Network Specialist',
        branch: branches[1]._id,
        provider: provider._id,
      },
    ]);
    console.log('Created servicemen');

    // Create Clients
    const clients = await User.insertMany([
      {
        username: 'client1',
        email: 'client1@techcorp.com',
        password: hashedPassword,
        role: 'client',
        branch: branches[0]._id,
        organization: organizations[0]._id,
      },
      {
        username: 'client2',
        email: 'client2@megaservices.com',
        password: hashedPassword,
        role: 'client',
        branch: branches[2]._id,
        organization: organizations[1]._id,
      },
    ]);
    console.log('Created clients');

    // Create Bookings
    const bookings = await Booking.insertMany([
      {
        client: clients[0]._id,
        service: services[0]._id,
        serviceman: servicemen[0]._id,
        branch: branches[0]._id,
        bookingTime: new Date('2025-04-15T10:00:00Z'),
        status: 'pending',
        description: 'Need help with desktop computer issues',
        image: 'desktop-issue.jpg'
      },
      {
        client: clients[1]._id,
        service: services[1]._id,
        serviceman: servicemen[1]._id,
        branch: branches[2]._id,
        bookingTime: new Date('2025-04-16T14:00:00Z'),
        status: 'in-progress',
        description: 'Network setup for new office',
        image: 'network-setup-request.jpg'
      },
    ]);
    console.log('Created bookings');

    // Create Subscriptions
    await Subscription.insertMany([
      {
        client: clients[0]._id,
        service: services[0]._id,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2026-04-01'),
        status: 'active',
        price: 800.00,
      },
      {
        client: clients[1]._id,
        service: services[1]._id,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2026-04-01'),
        status: 'active',
        price: 1500.00,
      },
    ]);
    console.log('Created subscriptions');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
