require('dotenv').config()

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("../models/user.model");
const Subscription = require("../models/subscription.model");
const OrganisationType = require("../models/organisationType.model");
const ServiceCategory = require("../models/serviceCategory.model");
const NotificationTemplate = require("../models/notificationTemplate.model");
const SystemSettings = require("../models/systemSettings.model");

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ MongoDB Connected...");
        //sync indexes
        await mongoose.model("Subscription").syncIndexes();
    } catch (error) {
        console.error("❌ Database connection error:", error);
        process.exit(1);
    }
};




// Function to create a super admin user
const createSuperAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: "admin@admin.com" });
        if (existingAdmin) {
            console.log("✅ Super admin already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash("Password12$", 10);

        const newAdmin = new User({
            email: "admin@admin.com",
            password: hashedPassword,
            role: "super_admin"
        });

        await newAdmin.save();
        console.log("✅ Super admin created successfully.");
    } catch (error) {
        console.error("❌ Error creating super admin:", error);
    }
};

// Function to create subscription plans
const createSubscriptions = async () => {
    const subscriptions = [
        {
            name: "Enterprise White Label",
            type: "white_label",
            price: 499.99,
            billingCycle: "monthly",
            commissionPercentage: 0,
            maxServicemen: 500,
            maxBranches: 50,
            maxClients: 5000,
            customBranding: true,
            prioritySupport: true,
            analyticsDashboard: true,
            whiteLabelDomain: true
        },
        {
            name: "Standard Marketplace",
            type: "open_marketplace",
            price: 99.99,
            billingCycle: "monthly",
            commissionPercentage: 10,
            maxServicemen: 100,
            maxBranches: 10,
            maxClients: "unlimited",
            featuredListing: false,
            prioritySupport: false,
            analyticsDashboard: true
        },
        {
            name: "Free Trial",
            type: "open_marketplace",
            price: 0,
            billingCycle: "monthly",
            commissionPercentage: 15,
            maxServicemen: 5,
            maxBranches: 1,
            maxClients: 50,
            featuredListing: false,
            prioritySupport: false,
            analyticsDashboard: false
        }
    ];

    try {
        for (const sub of subscriptions) {
            const exists = await Subscription.findOne({ name: sub.name });
            if (!exists) {
                await new Subscription(sub).save();
                console.log(`✅ Subscription plan '${sub.name}' created.`);
            } else {
                console.log(`✅ Subscription plan '${sub.name}' already exists.`);
            }
        }
    } catch (error) {
        console.error("❌ Error creating subscriptions:", error);
    }
};

// Function to insert organisation types
const insertOrganisationTypes = async () => {
    // Organisation Types Data
    const organisationTypes = [
        { name: "Banking & Finance", description: "Banks, insurance firms, investment companies." },
        { name: "Healthcare", description: "Hospitals, clinics, pharmacies, diagnostics." },
        { name: "Education", description: "Universities, schools, online learning platforms." },
        { name: "Retail & E-Commerce", description: "Supermarkets, online stores, malls." },
        { name: "Hospitality & Travel", description: "Hotels, restaurants, travel agencies." },
        { name: "Real Estate", description: "Property management, real estate agencies, construction firms." },
        { name: "Technology & IT", description: "Software firms, IT consulting, cybersecurity companies." },
        { name: "Manufacturing & Industry", description: "Automobile, textile, chemical manufacturing." },
        { name: "Telecommunications", description: "Mobile networks, internet service providers." },
        { name: "Government & Public Services", description: "Ministries, government agencies, public utilities." }
    ];
    try {
        for (const orgType of organisationTypes) {
            const exists = await OrganisationType.findOne({ name: orgType.name });
            if (!exists) {
                await new OrganisationType(orgType).save();
                console.log(`✅ Organisation Type '${orgType.name}' created.`);
            } else {
                console.log(`✅ Organisation Type '${orgType.name}' already exists.`);
            }
        }
    } catch (error) {
        console.error("❌ Error inserting organisation types:", error);
    }
};

// Function to create default service categories
const createServiceCategories = async () => {
    const categories = [
        {
            name: "Home Maintenance",
            description: "General home repairs and maintenance services",
            subcategories: ["Plumbing", "Electrical", "Carpentry", "HVAC", "Painting"]
        },
        {
            name: "Cleaning",
            description: "Professional cleaning services",
            subcategories: ["House Cleaning", "Office Cleaning", "Deep Cleaning", "Carpet Cleaning"]
        },
        {
            name: "Technology",
            description: "Tech support and installation services",
            subcategories: ["Computer Repair", "Network Setup", "Smart Home Installation"]
        },
        {
            name: "Beauty & Wellness",
            description: "Personal care and wellness services",
            subcategories: ["Hair Styling", "Massage", "Nail Care", "Spa Services"]
        },
        {
            name: "Automotive",
            description: "Vehicle maintenance and repair services",
            subcategories: ["Car Repair", "Car Wash", "Oil Change", "Tire Service"]
        }
    ];

    try {
        for (const category of categories) {
            const exists = await ServiceCategory.findOne({ name: category.name });
            if (!exists) {
                await new ServiceCategory(category).save();
                console.log(`✅ Service Category '${category.name}' created.`);
            } else {
                console.log(`✅ Service Category '${category.name}' already exists.`);
            }
        }
    } catch (error) {
        console.error("❌ Error creating service categories:", error);
    }
};

// Function to create notification templates
const createNotificationTemplates = async () => {
    const templates = [
        {
            type: "booking_created",
            channel: "email",
            subject: "New Booking Confirmation",
            content: "Dear {{customerName}}, your booking #{{bookingId}} has been created successfully. A service provider will be assigned shortly.",
            variables: ["customerName", "bookingId"]
        },
        {
            type: "booking_assigned",
            channel: "email",
            subject: "Service Provider Assigned",
            content: "Your booking #{{bookingId}} has been assigned to {{servicemanName}}. They will arrive at {{scheduledTime}}.",
            variables: ["bookingId", "servicemanName", "scheduledTime"]
        },
        {
            type: "booking_completed",
            channel: "email",
            subject: "Service Completed",
            content: "Your service has been completed. Please rate your experience with {{servicemanName}}.",
            variables: ["servicemanName"]
        },
        {
            type: "chat_message",
            channel: "push",
            subject: "New Message",
            content: "{{senderName}}: {{messagePreview}}",
            variables: ["senderName", "messagePreview"]
        }
    ];

    try {
        for (const template of templates) {
            const exists = await NotificationTemplate.findOne({ 
                type: template.type,
                channel: template.channel 
            });
            if (!exists) {
                await new NotificationTemplate(template).save();
                console.log(`✅ Notification Template '${template.type}' for ${template.channel} created.`);
            } else {
                console.log(`✅ Notification Template '${template.type}' for ${template.channel} already exists.`);
            }
        }
    } catch (error) {
        console.error("❌ Error creating notification templates:", error);
    }
};

// Function to create system settings
const createSystemSettings = async () => {
    const settings = {
        booking: {
            autoAssignmentEnabled: true,
            maxActiveBookingsPerServiceman: 5,
            defaultBookingExpiryHours: 24,
            cancellationWindowHours: 2
        },
        notification: {
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: true,
            reminderIntervals: [24, 2] // hours before booking
        },
        payment: {
            currencies: ["USD", "EUR", "GBP"],
            defaultCurrency: "USD",
            platformFeePercentage: 10,
            minimumPayout: 50
        },
        security: {
            passwordMinLength: 8,
            passwordRequiresSpecialChar: true,
            sessionTimeoutMinutes: 60,
            maxLoginAttempts: 5
        }
    };

    try {
        const existingSettings = await SystemSettings.findOne({});
        if (!existingSettings) {
            await new SystemSettings(settings).save();
            console.log("✅ System Settings created.");
        } else {
            console.log("✅ System Settings already exist.");
        }
    } catch (error) {
        console.error("❌ Error creating system settings:", error);
    }
};

// Run setup process
const setupDatabase = async () => {
    await connectDB();
    await createSuperAdmin();
    await createSubscriptions();
    await insertOrganisationTypes();
    await createServiceCategories();
    await createNotificationTemplates();
    await createSystemSettings();
    console.log("✅ Database setup completed.");
    process.exit();
};

setupDatabase();
