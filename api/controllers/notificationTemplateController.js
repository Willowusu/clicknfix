const NotificationTemplate = require('../models/notificationTemplate.model');
const mongoose = require('mongoose');

// Create notification template
exports.createTemplate = async (req, res) => {
    try {
        const { type, channel, subject, content, variables, settings } = req.body;

        const template = new NotificationTemplate({
            type,
            channel,
            subject,
            content,
            variables,
            settings
        });

        await template.save();
        return res.status(201).json({
            message: "Notification template created successfully",
            template
        });
    } catch (error) {
        console.error("Error creating notification template:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all notification templates
exports.getTemplates = async (req, res) => {
    try {
        const { type, channel, isActive } = req.query;
        const query = {};

        if (type) query.type = type;
        if (channel) query.channel = channel;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const templates = await NotificationTemplate.find(query).sort('type');
        return res.status(200).json(templates);
    } catch (error) {
        console.error("Error retrieving notification templates:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get notification template by ID
exports.getTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid template ID" });
        }

        const template = await NotificationTemplate.findById(id);
        if (!template) {
            return res.status(404).json({ message: "Notification template not found" });
        }

        return res.status(200).json(template);
    } catch (error) {
        console.error("Error retrieving notification template:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update notification template
exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid template ID" });
        }

        const template = await NotificationTemplate.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!template) {
            return res.status(404).json({ message: "Notification template not found" });
        }

        return res.status(200).json({
            message: "Notification template updated successfully",
            template
        });
    } catch (error) {
        console.error("Error updating notification template:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete notification template
exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid template ID" });
        }

        const template = await NotificationTemplate.findByIdAndDelete(id);
        if (!template) {
            return res.status(404).json({ message: "Notification template not found" });
        }

        return res.status(200).json({
            message: "Notification template deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting notification template:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Preview compiled template
exports.previewTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { variables } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid template ID" });
        }

        const template = await NotificationTemplate.findById(id);
        if (!template) {
            return res.status(404).json({ message: "Notification template not found" });
        }

        const compiledContent = template.compile(variables);
        return res.status(200).json({
            message: "Template preview generated successfully",
            preview: {
                subject: template.subject,
                content: compiledContent
            }
        });
    } catch (error) {
        console.error("Error previewing template:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get template usage statistics
exports.getTemplateStats = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid template ID" });
        }

        const template = await NotificationTemplate.findById(id);
        if (!template) {
            return res.status(404).json({ message: "Notification template not found" });
        }

        return res.status(200).json({
            templateId: template._id,
            type: template.type,
            channel: template.channel,
            useCount: template.metadata.useCount,
            lastUsed: template.metadata.lastUsed,
            version: template.metadata.version
        });
    } catch (error) {
        console.error("Error retrieving template statistics:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}; 