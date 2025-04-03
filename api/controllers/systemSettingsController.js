const SystemSettings = require('../models/systemSettings.model');

// Get current system settings
exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();
        return res.status(200).json(settings);
    } catch (error) {
        console.error("Error retrieving system settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update system settings
exports.updateSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();

        // Update only the provided fields
        Object.keys(req.body).forEach(category => {
            if (settings[category] && typeof settings[category] === 'object') {
                Object.assign(settings[category], req.body[category]);
            }
        });

        await settings.save();
        return res.status(200).json({
            message: "System settings updated successfully",
            settings
        });
    } catch (error) {
        console.error("Error updating system settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update booking settings
exports.updateBookingSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();
        Object.assign(settings.booking, req.body);
        await settings.save();

        return res.status(200).json({
            message: "Booking settings updated successfully",
            bookingSettings: settings.booking
        });
    } catch (error) {
        console.error("Error updating booking settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();
        Object.assign(settings.notification, req.body);
        await settings.save();

        return res.status(200).json({
            message: "Notification settings updated successfully",
            notificationSettings: settings.notification
        });
    } catch (error) {
        console.error("Error updating notification settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update payment settings
exports.updatePaymentSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();
        Object.assign(settings.payment, req.body);
        await settings.save();

        return res.status(200).json({
            message: "Payment settings updated successfully",
            paymentSettings: settings.payment
        });
    } catch (error) {
        console.error("Error updating payment settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update security settings
exports.updateSecuritySettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();
        Object.assign(settings.security, req.body);
        await settings.save();

        return res.status(200).json({
            message: "Security settings updated successfully",
            securitySettings: settings.security
        });
    } catch (error) {
        console.error("Error updating security settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Toggle maintenance mode
exports.toggleMaintenanceMode = async (req, res) => {
    try {
        const { isMaintenanceMode, maintenanceMessage, allowedIPs } = req.body;
        const settings = await SystemSettings.getSettings();

        settings.maintenance = {
            ...settings.maintenance,
            isMaintenanceMode,
            ...(maintenanceMessage && { maintenanceMessage }),
            ...(allowedIPs && { allowedIPs })
        };

        await settings.save();
        return res.status(200).json({
            message: `Maintenance mode ${isMaintenanceMode ? 'enabled' : 'disabled'} successfully`,
            maintenanceSettings: settings.maintenance
        });
    } catch (error) {
        console.error("Error toggling maintenance mode:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get settings by category
exports.getSettingsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const settings = await SystemSettings.getSettings();

        if (!settings[category]) {
            return res.status(404).json({ message: "Settings category not found" });
        }

        return res.status(200).json({
            [category]: settings[category]
        });
    } catch (error) {
        console.error("Error retrieving settings category:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

