const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    subcategories: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    icon: {
        type: String,
        default: null
    },
    metadata: {
        popularityScore: {
            type: Number,
            default: 0
        },
        totalServices: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for faster searches
serviceCategorySchema.index({ name: 1 });
serviceCategorySchema.index({ isActive: 1 });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema); 