const Booking = require('../models/booking.model'); // Assuming the model is in /models
const ServiceMan = require('../models/serviceman.model');
const Service = require('../models/service.model');
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');

// Helper function to find available serviceman
async function findAvailableServiceman(serviceId, scheduleDate, location) {
  const service = await Service.findById(serviceId);
  if (!service) throw new Error('Service not found');

  const servicemen = await ServiceMan.find({
    'skills.service': serviceId,
    status: 'available'
  });

  let bestMatch = null;
  let bestScore = -1;

  for (const serviceman of servicemen) {
    if (!serviceman.isAvailableFor(scheduleDate)) continue;

    // Calculate match score based on multiple criteria
    let score = 0;

    // Distance score (if location provided)
    if (location && serviceman.location.coordinates) {
      const distance = calculateDistance(location, serviceman.location.coordinates);
      if (distance <= serviceman.availability.preferences.maxTravelDistance) {
        score += (1 - distance / serviceman.availability.preferences.maxTravelDistance) * 40;
      } else {
        continue; // Skip if too far
      }
    }

    // Workload score
    const workloadScore = 100 - serviceman.workloadPercentage;
    score += workloadScore * 0.3;

    // Rating score
    if (serviceman.performance && serviceman.performance.rating) {
      score += serviceman.performance.rating.average * 10;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        serviceman: serviceman._id,
        score: score,
        autoAssigned: true,
        assignmentCriteria: {
          skillsMatched: serviceman.skills.map(s => s.service.toString()),
          distance: location ? calculateDistance(location, serviceman.location.coordinates) : null,
          currentWorkload: serviceman.workloadPercentage,
          matchScore: score
        }
      };
    }
  }

  return bestMatch;
}

// Helper function to calculate distance between two points
function calculateDistance(point1, point2) {
  // Implementation of distance calculation (e.g., Haversine formula)
  // Returns distance in kilometers
  const [lon1, lat1] = point1.coordinates;
  const [lon2, lat2] = point2.coordinates;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ✅ Create Booking
exports.createBooking = async (req, res) => {
  try {
    const {
      customer,
      requested_by,
      requested_by_role,
      service,
      organisation,
      branch,
      schedule,
      location,
      payment
    } = req.body;

    // Validate required fields
    if (!customer || !requested_by || !service || !organisation || !schedule.requestedDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find available serviceman
    const servicemanMatch = await findAvailableServiceman(service, new Date(schedule.requestedDate), location);
    if (!servicemanMatch) {
      return res.status(400).json({ message: "No available serviceman found for the requested time" });
    }

    const newBooking = new Booking({
      customer,
      requested_by,
      requested_by_role,
      service,
      serviceman: servicemanMatch,
      organisation,
      branch: branch || null,
      schedule,
      location,
      payment,
      status: 'pending'
    });

    await newBooking.save();

    // Create notifications
    await Promise.all([
      // Notify serviceman
      new Notification({
        recipient: servicemanMatch.serviceman,
        type: 'booking_created',
        title: 'New Booking Assigned',
        message: 'You have been assigned a new booking',
        data: {
          booking: newBooking._id,
          actionRequired: true,
          actionType: 'confirm_booking'
        },
        deliveryChannels: [
          { type: 'in_app' },
          { type: 'email' }
        ]
      }).save(),
      // Notify customer
      new Notification({
        recipient: customer,
        type: 'booking_created',
        title: 'Booking Confirmation',
        message: 'Your booking has been created and is awaiting confirmation',
        data: {
          booking: newBooking._id
        },
        deliveryChannels: [
          { type: 'in_app' },
          { type: 'email' }
        ]
      }).save()
    ]);

    return res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get Booking by ID
exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id)
      .populate("customer", "-password")
      .populate("requested_by", "-password")
      .populate("service")
      .populate("serviceman.assigned", "-password")
      .populate("organisation")
      .populate("branch")
      .populate("statusHistory.updatedBy", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("Error retrieving booking:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Update Booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Handle status changes
    if (updates.status && updates.status !== booking.status) {
      booking._updatedBy = userId;

      // Create notification based on status change
      const notificationData = {
        recipient: booking.customer,
        type: `booking_${updates.status}`,
        data: { booking: booking._id }
      };

      switch (updates.status) {
        case 'confirmed':
          notificationData.title = 'Booking Confirmed';
          notificationData.message = 'Your booking has been confirmed';
          break;
        case 'completed':
          notificationData.title = 'Service Completed';
          notificationData.message = 'Your service has been completed';
          notificationData.type = 'rating_reminder';
          break;
        case 'canceled':
          notificationData.title = 'Booking Canceled';
          notificationData.message = 'Your booking has been canceled';
          break;
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updates, { new: true });
    return res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Delete Booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
