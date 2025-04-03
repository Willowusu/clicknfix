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
const Client = require('../models/Client');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

const MONGODB_URI = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/clicknfix';

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
      Client.deleteMany({}),
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
      name: 'Provider Admin',
      email: 'admin@clicknfix.com',
      password: hashedPassword,
      role: 'provider',
      provider: provider._id,
      isActive: true
    });
    console.log('Created provider admin user');

    // Create Super Admin
    await User.create({
      username: 'super_admin',
      name: 'Super Admin',
      email: 'superadmin@clicknfix.com',
      password: hashedPassword,
      role: 'super-admin',
      isActive: true
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
        name: 'TechCorp Admin',
        email: 'admin@techcorp.com',
        password: hashedPassword,
        role: 'client-admin',
        branch: branches[0]._id,
        organization: organizations[0]._id,
        provider: provider._id,
        isActive: true
      },
      {
        username: 'mega_admin',
        name: 'MegaServices Admin',
        email: 'admin@megaservices.com',
        password: hashedPassword,
        role: 'client-admin',
        branch: branches[2]._id,
        organization: organizations[1]._id,
        provider: provider._id,
        isActive: true
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
        name: 'John Smith',
        email: 'john@clicknfix.com',
        phone: '+1234567893',
        jobTitle: 'Senior IT Technician',
        provider: provider._id,
        assignedServices: [services[0]._id, services[1]._id],
        isActive: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@clicknfix.com',
        phone: '+1234567894',
        jobTitle: 'Network Specialist',
        provider: provider._id,
        assignedServices: [services[1]._id],
        isActive: true
      },
      {
        name: 'Mike Brown',
        email: 'mike@clicknfix.com',
        phone: '+1234567895',
        jobTitle: 'Hardware Technician',
        provider: provider._id,
        assignedServices: [services[2]._id],
        isActive: true
      }
    ]);
    console.log('Created servicemen');

    // Create Clients with associated User accounts
    const clientsData = [
      {
        name: 'Alice Cooper',
        email: 'alice@techcorp.com',
        phone: '+1234567896',
        branch: branches[0]._id,
        organization: organizations[0]._id,
      },
      {
        name: 'Bob Wilson',
        email: 'bob@techcorp.com',
        phone: '+1234567897',
        branch: branches[1]._id,
        organization: organizations[0]._id,
      },
      {
        name: 'Carol Davis',
        email: 'carol@megaservices.com',
        phone: '+1234567898',
        branch: branches[2]._id,
        organization: organizations[1]._id,
      }
    ];

    const clients = [];
    for (const clientData of clientsData) {
      // Create user account
      const clientUser = await User.create({
        username: clientData.email.split('@')[0], // Use first part of email as username
        name: clientData.name,
        email: clientData.email,
        password: hashedPassword,
        phone: clientData.phone,
        role: 'client',
        organization: clientData.organization,
        provider: provider._id,
        branch: clientData.branch,
        isActive: true
      });

      // Create client record
      const client = await Client.create({
        user: clientUser._id,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        organization: clientData.organization,
        provider: provider._id,
        branch: clientData.branch,
        isActive: true,
        joinedAt: new Date()
      });

      clients.push(client);
    }
    console.log('Created clients');

    // Create some bookings
    const bookings = await Booking.insertMany([
      {
        client: clients[0]._id,
        service: services[0]._id,
        serviceman: servicemen[0]._id,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'pending',
        description: 'Description for tomorrow',
        provider: provider._id,
        bookingTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        organization: organizations[0]._id,
        branch: branches[0]._id
      },
      {
        client: clients[1]._id,
        service: services[1]._id,
        serviceman: servicemen[1]._id,
        scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        status: 'completed',
        description: 'Description for day after tomorrow',
        provider: provider._id,
        bookingTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        organization: organizations[0]._id,
        branch: branches[1]._id
      }
    ]);
    console.log('Created bookings');

    // Create subscriptions
    // const subscriptions = await Subscription.insertMany([
    //   {
    //     organization: organizations[0]._id,
    //     provider: provider._id,
    //     plan: 'premium',
    //     startDate: new Date(),
    //     endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    //     status: 'active',
    //     price: 999.99
    //   },
    //   {
    //     organization: organizations[1]._id,
    //     provider: provider._id,
    //     plan: 'basic',
    //     startDate: new Date(),
    //     endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
    //     status: 'active',
    //     price: 499.99
    //   }
    // ]);
    // console.log('Created subscriptions');

    // Create payments for bookings
    await Payment.insertMany([
      {
        booking: bookings[0]._id,
        amount: services[0].price,
        status: 'pending',
        provider: provider._id,
        organization: organizations[0]._id,
        client: clients[0]._id,
        paymentMethod: 'credit_card'
      },
      {
        booking: bookings[1]._id,
        amount: services[1].price,
        status: 'completed',
        provider: provider._id,
        organization: organizations[0]._id,
        client: clients[1]._id,
        paymentMethod: 'bank_transfer',
        paidAt: new Date()
      }
    ]);
    console.log('Created payments');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
