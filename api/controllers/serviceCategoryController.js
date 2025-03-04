const ServiceCategory = require('../models/serviceCategory.model');
const mongoose = require('mongoose');

// Create service category
exports.createServiceCategory = async (req, res) => {
    try {
        const { name, description, subcategories, icon } = req.body;

        const category = new ServiceCategory({
            name,
            description,
            subcategories,
            icon
        });

        await category.save();
        return res.status(201).json({
            message: "Service category created successfully",
            category
        });
    } catch (error) {
        console.error("Error creating service category:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all service categories
exports.getServiceCategories = async (req, res) => {
    try {
        const { isActive } = req.query;
        const query = {};
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const categories = await ServiceCategory.find(query).sort('name');
        return res.status(200).json(categories);
    } catch (error) {
        console.error("Error retrieving service categories:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get service category by ID
exports.getServiceCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const category = await ServiceCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Service category not found" });
        }

        return res.status(200).json(category);
    } catch (error) {
        console.error("Error retrieving service category:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update service category
exports.updateServiceCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const category = await ServiceCategory.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Service category not found" });
        }

        return res.status(200).json({
            message: "Service category updated successfully",
            category
        });
    } catch (error) {
        console.error("Error updating service category:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete service category
exports.deleteServiceCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const category = await ServiceCategory.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: "Service category not found" });
        }

        return res.status(200).json({
            message: "Service category deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting service category:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update category metadata
exports.updateMetadata = async (req, res) => {
    try {
        const { id } = req.params;
        const { popularityScore, totalServices, averageRating } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const category = await ServiceCategory.findByIdAndUpdate(
            id,
            {
                'metadata.popularityScore': popularityScore,
                'metadata.totalServices': totalServices,
                'metadata.averageRating': averageRating
            },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Service category not found" });
        }

        return res.status(200).json({
            message: "Category metadata updated successfully",
            category
        });
    } catch (error) {
        console.error("Error updating category metadata:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}; 